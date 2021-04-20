import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './containers/home/home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        data: {
            animation: 'HomePage'
        }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        initialNavigation: 'enabled',
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
