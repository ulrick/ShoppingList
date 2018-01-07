import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemGroupPage } from './item-group';

@NgModule({
  declarations: [
    ItemGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemGroupPage),
  ],
})
export class ItemGroupPageModule {}
