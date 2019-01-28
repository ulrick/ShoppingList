import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShoppingItem, ItemGroup, ShoppingItemSaveType } from '../../shared/sample-interface';
import _ from "lodash";
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';

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
  private itemGroupKeys : string[] = [];
  private itemsGroupByCategory : {[key:string] : ShoppingItem};
  private itemGroups: ItemGroup[] = [];

  
  constructor(public navCtrl: NavController, public navParams: NavParams, public shoppingService: ShoppingServiceProvider) {
    this.duplicatedShoppingItems = navParams.get("value");

    this.shoppingService.readShoppingItemsGroup().then((groupList: ItemGroup[])=>{ 
      this.itemGroups = groupList;
    });
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SaveListDetailPage');
  }

  protected ionViewWillEnter() {

    this.itemsGroupByCategory = _.groupBy(this.duplicatedShoppingItems, (val: ShoppingItem)=>{
      return val.itemGroup;
    });

    // J'aurais pu utiliser directement "this.itemGroupKeys = Object.keys(this.itemsGroupByCategory);" 
    // mais pour garder l'ordre de tri de catégorie j'ai fait une boucle dans la liste de catégorie
    for (let index = 0; index < this.itemGroups.length; index++) {
      var element = this.itemGroups[index];
      if(Object.keys(this.itemsGroupByCategory).includes(element.itemGroupLabel)){
        this.itemGroupKeys.push(element.itemGroupLabel);
      }
    }
  }

}
