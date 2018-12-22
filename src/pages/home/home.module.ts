import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app/app.module';
import {HttpClient} from '@angular/common/http';

@NgModule({
  declarations: [HomePage],
  imports: [IonicPageModule.forChild(HomePage), TranslateModule.forChild({
    loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
    }
})],
})
export class HomePageModule { }
