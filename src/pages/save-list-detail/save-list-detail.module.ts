import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaveListDetailPage } from './save-list-detail';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    SaveListDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SaveListDetailPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class SaveListDetailPageModule {}
