import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaveListPage } from './save-list';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    SaveListPage,
  ],
  imports: [
    IonicPageModule.forChild(SaveListPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class SaveListPageModule {}
