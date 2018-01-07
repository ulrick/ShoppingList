import {ItemGroupData} from '../../data/item-group-data';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ShoppingItem, ItemGroup } from '../../pages/model/sample-interface';
import { NativeStorage } from '@ionic-native/native-storage';

/*
  Generated class for the ShoppingServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShoppingServiceProvider {

  private shoppingList : ShoppingItem[] = [];
  private shoppingItemsGroup : ItemGroup[] = [];


  constructor(public http: Http, private storage: Storage, private nativeStorage: NativeStorage) {
    console.log('Hello ShoppingServiceProvider Provider');
  }

  public readShoppingItems() : Promise<ShoppingItem[]>{
    return new Promise(resolve => {
      this.storage.get('items').then((data : ShoppingItem[]) => {
        /*data.forEach((val, index)=>{
          val.itemId = index;
        });*/
        this.shoppingList = data || [];
        resolve(this.shoppingList);
      }).catch(error => {
        this.handleError("Une erreur s'est produite!");
      });
    });
  }
 
  public createShoppingItems(items : any) : Promise<void>{
      return this.storage.set('items', items).then( val => {
        console.log("item added ! ");
      });
  }


  /**
   * Get the list of category of existing items
   * 
   * @returns {Promise<ItemGroupData[]>} 
   * @memberof ShoppingServiceProvider
   */
  public readShoppingItemsGroup() : Promise<ItemGroup[]>{
    return new Promise(resolve => {
      this.storage.get('items-group').then((data : ItemGroup[]) => {
        this.shoppingItemsGroup = data || [];
        resolve(this.shoppingItemsGroup);
      }).catch(error => {
        this.handleError("Une erreur s'est produite lors de la récupération des catégories d'articles!");
      });
    });
  }
  /**
   * Save category list into database
   * 
   * @param {*} itemsGroup 
   * @returns {Promise<void>} 
   * @memberof ShoppingServiceProvider
   */
  public createShoppingItemsGroup(itemsGroup : any) : Promise<void>{
      return this.storage.set('items-group', itemsGroup).then( (val : ItemGroup[]) => {
        //return null;
      });
  }


  /*public getTableByName(tableName : string){
    return this.storage.forEach(elt=>{
      if(elt == tableName)
      return ;
    })
  }*/
  
 

  private handleError(error: any = "Une erreur est survenue!"): Promise<any> {
    //let notification = this.toastCtrl.sendNotification(error);
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}