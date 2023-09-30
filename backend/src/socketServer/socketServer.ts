import {Server, Socket} from "socket.io";
import {PlayerInfo} from '../domain/playerInfo';
import {EventNames} from '../../../shared/constants/eventNames';
import {JoinedPlayerModel} from '../../../shared/models/joinedPlayerModel';
import {IRoomsService} from '../contracts/roomsService';
import {ApplicationServer} from '../applicationServer/applicationServer';
import {RoomMapper} from '../mappings/roomMapper';
import {PickedCardModel} from "../../../shared/models/pickedCard";
import {RoomSettingsUpdated} from "../subjects/roomSettingsUpdated";
import {Subject} from "rxjs";


export class SocketServer {
    private readonly playerDisconnectedLifetimeSec = 1 * 60;

    private io: Server;
    private leavePlayerTasks: Map<string, NodeJS.Timeout> = new Map();

    private socketIdToPlayer: Map<string, PlayerInfo | undefined> = new Map();
    private playerIdToSocketId: Map<string, string> = new Map();

    constructor(
        private readonly roomMapper: RoomMapper,
        private readonly roomsService: IRoomsService,
        appServer: ApplicationServer,
        subject: Subject<RoomSettingsUpdated>,
    ) {
        this.io = new Server(appServer.httpServer, {'pingInterval': 2000, 'pingTimeout': 3000});

        this.io.sockets.on('connection', socket => this.handleConnection(socket));

        subject.subscribe(value => {
            this.handleRoomSettingUpdated(value)
        })
    }

    private handleConnection(socket: Socket) {
        this.logEvent(`Connect detected: ${socket.id}`)

        socket.on('disconnect', reason => this.handleDisconnect(socket));

        socket.on('error', error => {
            this.logEvent(error.message);
        });

        socket.on(
            EventNames.joinPlayer,
            (pokerPlayer: JoinedPlayerModel) => this.handleJoinPlayer(socket, pokerPlayer));

        socket.on(
            EventNames.playerPickCertainCard,
            (pickedCard: PickedCardModel) =>
                this.handlePlayerPickCertainCard(socket, pickedCard));

        socket.on(EventNames.endGame, (roomId: string) =>
            this.handleEndGame(roomId));

        socket.on(EventNames.newGame, (roomId: string) => this.handleNewGame(roomId));

        socket.on(EventNames.leavePlayer, _ => this.handleLeave(socket))

        socket.on(EventNames.connectReply, playerId => this.handleReconnect(socket, playerId))
    }

    private handleDisconnect(socket: Socket) {
        const playerInfo = this.socketIdToPlayer.get(socket.id)
        if (!playerInfo) {
            return;
        }
        this.scheduleLeavePlayer(socket, playerInfo.playerId);
        this.roomsService.updatePlayerStatus(playerInfo.roomId, playerInfo.playerId, false);

        this.logEvent(`player '${playerInfo.playerId}' was disconnected`);

        this.io.to(playerInfo.roomId).emit(EventNames.playerDisconnected, playerInfo.playerId)
    }

    private handleReconnect(socket: Socket, playerId: string) {
        const socketId = this.playerIdToSocketId.get(playerId)
        if (!socketId) {
            return;
        }
        const playerInfo = this.socketIdToPlayer.get(socketId)
        if (!playerInfo) {
            return;
        }

        this.playerIdToSocketId.set(playerId, socket.id);

        this.socketIdToPlayer.delete(socketId);
        this.socketIdToPlayer.set(socket.id, playerInfo);

        this.unscheduleLeavePlayer(socket, playerInfo);
        this.roomsService.updatePlayerStatus(playerInfo.roomId, playerInfo.playerId, true);

        this.io.to(playerInfo.roomId).emit(EventNames.playerReconnected, playerInfo.playerId);
    }

    private scheduleLeavePlayer(socket: Socket, playerId: string) {
        const task = setTimeout(
            (_: void) => {
                this.handleLeave(socket)
            },
            this.playerDisconnectedLifetimeSec * 1000);

        this.leavePlayerTasks.set(playerId, task);

        return;
    }

    private unscheduleLeavePlayer(socket: Socket, playerInfo: PlayerInfo) {
        const task = this.leavePlayerTasks.get(playerInfo.playerId);

        if (!task) {
            return;
        }

        clearTimeout(task);
        this.leavePlayerTasks.delete(playerInfo.playerId);

        this.logEvent(`player '${playerInfo.playerId}' was reconnected`);
    }

    private handleLeave(socket: Socket) {
        this.logEvent(`Leave detected: ${socket.id}`)

        const playerInfo = this.socketIdToPlayer.get(socket.id)
        if (!playerInfo) {
            return;
        }

        this.socketIdToPlayer.delete(socket.id)
        this.playerIdToSocketId.delete(playerInfo.playerId);

        const removingPlayerResult = this.roomsService.removePlayer(playerInfo.roomId, playerInfo.playerId);
        if (!removingPlayerResult) {
            return;
        }

        this.io.to(playerInfo.roomId).emit(EventNames.leavePlayer, playerInfo.playerId);
        socket.leave(playerInfo!.roomId);
    }

    private handleJoinPlayer(socket: Socket, player: JoinedPlayerModel) {
        this.roomsService.addPlayer(player.roomId, player.id, player.name);

        this.logEvent(`Join detected: ${socket.id}`)

        this.socketIdToPlayer.set(socket.id, new PlayerInfo(player.id, player.roomId));
        this.playerIdToSocketId.set(player.id, socket.id);

        socket.join(player.roomId)
        this.io.to(player.roomId).emit(EventNames.joinPlayer, player)
    }

    private handlePlayerPickCertainCard(socket: Socket, model: PickedCardModel) {
        const room = this.roomsService.getRoom(model.roomId);
        if (!room || !room.inGame) {
            return;
        }

        let picked = false;
        try {
            picked = this.roomsService.updatePlayerCard(model.roomId, model.playerId, model.cardValue);
        } catch (error) {
            if (error instanceof Error) {
                this.logEvent(`ERROR "${error.message}"`);
            }

            return;
        }

        model.picked = picked

        const eventName = picked ? EventNames.playerPickCard : EventNames.playerUnpickCard;
        this.io.to(model.roomId).emit(eventName, model.playerId);

        socket.emit(EventNames.playerPickCertainCard, model);
    }

    private handleRoomSettingUpdated(data: RoomSettingsUpdated) {
        const room = this.roomsService.getRoom(data.roomId);
        if (!room) {
            return;
        }

        const settingsModel = this.roomMapper.mapToSettingsModel(data.roomSettings)

        this.io.to(data.roomId).emit(EventNames.settingsUpdated, settingsModel);
    }

    private handleEndGame(roomId: string) {
        const room = this.roomsService.endGame(roomId);
        if (!room) {
            return;
        }

        const roomModel = this.roomMapper.mapToModel(room)

        this.io.to(roomId).emit(EventNames.endGame, roomModel)
    }

    private handleNewGame(roomId: string) {
        const room = this.roomsService.newGame(roomId);
        if (!room) {
            return;
        }

        this.io.to(roomId).emit(EventNames.newGame)
    }

    private logEvent(text: string) {
        console.log(`${new Date().toISOString()}\t${text}`)
    }
}