import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemGroupPage } from './item-group';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    ItemGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemGroupPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class ItemGroupPageModule {}
