import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverPage } from './popover';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../../app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    PopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverPage), TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
})
export class PopoverPageModule {}
