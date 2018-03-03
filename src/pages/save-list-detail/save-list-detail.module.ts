import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaveListDetailPage } from './save-list-detail';

@NgModule({
  declarations: [
    SaveListDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SaveListDetailPage),
  ],
})
export class SaveListDetailPageModule {}
