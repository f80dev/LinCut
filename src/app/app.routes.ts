import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {AboutComponent} from "./about/about.component";
import {ShorterComponent} from "./shorter/shorter.component";
import {NgModule} from "@angular/core";

export const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'main', component: ShorterComponent },
  { path: 'about', component: AboutComponent },
  { path: 'shorter', component: ShorterComponent },
  { path: '**', component: ShorterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
