import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemEditorPage } from './item-editor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    ItemEditorPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemEditorPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class ItemEditorPageModule {}
