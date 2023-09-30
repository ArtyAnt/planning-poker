import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PokerRoomComponent} from "../features/poker-room/poker-room.component";
import {MainPageComponent} from "../features/main-page/main-page.component";
import {Paths} from "./app.config";

const routes: Routes = [
    {path: '', component: MainPageComponent},
    {path: `${Paths.rooms}/:id`, component: PokerRoomComponent},
    {path: `${Paths.rooms}`, component: PokerRoomComponent},
    {path: '**', redirectTo: ''}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
