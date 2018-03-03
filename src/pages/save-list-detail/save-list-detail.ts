import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShoppingItemSaveType, ShoppingItem } from '../model/sample-interface';
import _ from "lodash";

/**
 * Generated class for the SaveListDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-save-list-detail',
  templateUrl: 'save-list-detail.html',
})
export class SaveListDetailPage {

  private duplicatedShoppingItems : ShoppingItem[];
  private objectKeys : string[] = [];
  private itemsGroupByCategory : {[key:string] : ShoppingItem};

  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.duplicatedShoppingItems = navParams.get("value");

    this.itemsGroupByCategory = _.groupBy(this.duplicatedShoppingItems, (val: ShoppingItem)=>{
      return val.itemGroup;
    });

    this.objectKeys = Object.keys(this.itemsGroupByCategory);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaveListDetailPage');
  }



}
