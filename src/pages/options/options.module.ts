import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OptionsPage } from './options';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    OptionsPage,
  ],
  imports: [
    IonicPageModule.forChild(OptionsPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class OptionsPageModule {}
