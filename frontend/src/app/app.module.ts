import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {PokerDeskComponent} from 'src/features/poker-room/components/poker-desk/poker-desk.component';
import {PokerPlayerComponent} from 'src/features/poker-room/components/poker-player/poker-player.component';

import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';
import {GetNameDialogComponent} from 'src/features/poker-room/components/get-name-dialog/get-name-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FireworkComponent} from 'src/features/poker-room/components/firework/firework.component';
import {EndGameTimerComponent} from 'src/features/poker-room/components/end-game-timer/end-game-timer.component';
import {PokerCardComponent} from "../features/poker-room/components/poker-card/poker-card.component";
import {PokerKeyboardComponent} from "../features/poker-room/components/poker-keyboard/poker-keyboard.component";
import {PokerRoomComponent} from "../features/poker-room/poker-room.component";
import {MainPageComponent} from "../features/main-page/main-page.component";
import {RoomListDialogComponent} from "../features/main-page/components/room-list-dialog/room-list-dialog.component";
import {MatListModule} from "@angular/material/list";
import {
    CreateTempRoomDialogComponent
} from "../features/main-page/components/create-temp-room-dialog/create-temp-room-dialog.component";
import {AppConfig} from "./app.config";
import {ToolbarBasicExample} from "../features/poker-room/components/toolbar/toolbar.component";
import {
    PokerSettingsDialogComponent
} from "../features/poker-room/components/poker-settings-dialog/poker-settings-dialog.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {ConnectingSpinnerComponent} from "../lib/components/connect-spinner/connecting-spinner.component";
import {MatIconModule} from "@angular/material/icon";
import {NgOptimizedImage} from "@angular/common";

const config: SocketIoConfig = {
    url: AppConfig.host,
    options: {transports: ['websocket'], reconnectionDelay: 500, timeout: 3000}
};

@NgModule({
    declarations: [
        AppComponent,
        PokerRoomComponent,
        PokerPlayerComponent,
        PokerDeskComponent,
        GetNameDialogComponent,
        FireworkComponent,
        EndGameTimerComponent,
        PokerCardComponent,
        PokerKeyboardComponent,
        MainPageComponent,
        RoomListDialogComponent,
        CreateTempRoomDialogComponent,
        PokerSettingsDialogComponent,
        ConnectingSpinnerComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatListModule,
        MatFormFieldModule,
        ToolbarBasicExample,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        SocketIoModule.forRoot(config),
        MatIconModule,
        NgOptimizedImage
    ],
    providers: [
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    exports: [
        ReactiveFormsModule
    ]
})

export class AppModule {
}
