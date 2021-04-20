import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './containers/main/app.component';
import { ToolbarComponent } from './containers/toolbar/toolbar.component';
import { FooterComponent } from './containers/footer/footer.component';
import { HomeComponent } from './containers/home/home.component';
import { HomeHeaderComponent } from './containers/home/home-header/home-header.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    FooterComponent,
    HomeComponent,
    HomeHeaderComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
