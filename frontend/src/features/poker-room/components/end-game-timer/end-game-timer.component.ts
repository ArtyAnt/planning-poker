import {Component} from "@angular/core";

@Component({
    selector: 'end-game-timer',
    templateUrl: './end-game-timer.component.html'
})
export class EndGameTimerComponent {
    private interval?: NodeJS.Timeout;

    private startTicks: number = 3;
    private countingDurationMs: number = 750;

    public isEnd = true;
    public ticksLeft: number = this.startTicks;

    start() {
        this.isEnd = false;

        this.interval = setInterval(() => {
            if(this.ticksLeft > 1) {
                this.ticksLeft--;

                return;
            }
            
            clearInterval(this.interval);
            this.ticksLeft = this.startTicks;
            this.isEnd = true;
        },
        this.countingDurationMs)
    }
}
