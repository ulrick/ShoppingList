import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaveListPage } from './save-list';

@NgModule({
  declarations: [
    SaveListPage,
  ],
  imports: [
    IonicPageModule.forChild(SaveListPage),
  ],
})
export class SaveListPageModule {}
