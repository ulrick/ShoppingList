import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShoppingItem, ItemGroup } from '../model/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';

/**
 * Generated class for the ItemEditorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-item-editor',
  templateUrl: 'item-editor.html',
})
export class ItemEditorPage {

  private index: number;
  private itemToReplace : ShoppingItem;
  private shoppingItems : ShoppingItem[];

  private newItem: ShoppingItem;
  private itemsGroup: ItemGroup[] = [];

  
  constructor(public navCtrl: NavController, public navParams: NavParams, public shoppingService: ShoppingServiceProvider) {
    
    this.index = navParams.data.index;
    this.itemToReplace = navParams.data.itemToReplace;
    this.shoppingItems = navParams.data.shoppingItems;
    
    this.newItem = Object.assign({}, this.itemToReplace);
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad ItemEditorPage');
    this.shoppingService.readShoppingItemsGroup().then((groups)=>{
      this.itemsGroup = groups;
    });
  }

  public update(item: ShoppingItem): void{

    console.log(item);
    var itemsToSave : string = item.itemName;

    if(this.itemToReplace.itemName != item.itemName || this.itemToReplace.itemGroup != item.itemGroup){
      
      this.shoppingItems[this.index].itemName = item.itemName;
      this.shoppingItems[this.index].itemGroup = item.itemGroup;

      this.shoppingService.createShoppingItems(this.shoppingItems);
    }
    
    this.navCtrl.pop();
  }

}
