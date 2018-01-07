import {Utils} from '../model/utils';
//import { FirebaseProvider } from './../../providers/firebase/firebase';
import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController, AlertController } from 'ionic-angular';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShoppingItem, ItemGroup } from '../model/sample-interface';
import _ from "lodash";
import { ItemGroupPage } from '../item-group/item-group';
import { ItemGroupData } from '../../data/item-group-data';
//import { FirebaseListObservable } from 'angularfire2/database'; 

@IonicPage({
  name: 'HomePage',
  segment: 'home-page'
})
@Component({
  selector: 'home',
  templateUrl: 'home.html',
  providers: [ShoppingServiceProvider]
})
export class HomePage {

  private newItem : string = "";
  private aisle : string = "Tous";
  private selectedItem : ShoppingItem;
  private shoppingItem : ShoppingItem = <ShoppingItem>{};
  
  private shoppingItems : ShoppingItem[] = [];
  private existingItemsGroup : string[] = [];
  public itemForm : FormGroup;
  private isBought : boolean = false;
 
  constructor(public navCtrl: NavController, public shoppingService: ShoppingServiceProvider, public formBuilder : FormBuilder, private toastCtrl: ToastController, public alertCtrl: AlertController) {  

    this.shoppingItem = {
      itemId : null, itemName : "", itemGroup: "", isBought : false
    };

    this.itemForm = formBuilder.group({
      "itemName" : ["", Validators.required]
    });
    
    this.getShoppingItems();

  }
  
  protected ionViewWillEnter() {
    this.getShoppingItems();
  }

  protected ionViewDidEnter() {
    this.getShoppingItems();
  }

  /**
   * Update category of item if add, or delete an item
   * 
   * @private
   * @memberof HomePage
   */
  private updateWithExistingItemsGroup() : void {
    this.shoppingService.readShoppingItemsGroup().then((groupList)=>{
      
      var nonExistingItemGroups : string[] = _.differenceBy(this.shoppingItems.map((val: ShoppingItem) => {return val.itemGroup}), groupList.map(val=>{return val.itemGroupLabel}));
                                       
      this.existingItemsGroup = _.intersectionWith(groupList.map(val=>{return val.itemGroupLabel}), this.shoppingItems.map((val: ShoppingItem) => {return val.itemGroup}), _.isEqual);
      
      if(nonExistingItemGroups != null && nonExistingItemGroups.length > 0){
        nonExistingItemGroups.forEach(element => {
          this.shoppingItems.forEach(val => {
            if(val.itemGroup == element) val.itemGroup = "Tous";
            return val;
          });
        });
      } 
    })
  }

  /**
   * read shopping item from the database
   * 
   * @private
   * @memberof HomePage
   */
  private getShoppingItems() : void {
    
    this.shoppingService.readShoppingItems().then(data => {
      this.shoppingItems = data;
    
      if(!this.shoppingItems) {
        this.shoppingItems = [];
      }
    }).then(data=>{this.updateWithExistingItemsGroup()});
  }

 
  /**
   * Add new shopping item
   * 
   * @memberof HomePage
   */
  public addItem() {

    if(this.newItem != "") {

        let alert = this.alertCtrl.create();
        alert.setTitle("Catégorie d'article");
        alert.setCssClass('custom-alert');
        
        this.shoppingService.readShoppingItemsGroup().then((groupList) => {
         
          groupList.forEach((value, index) => {
            alert.addInput({
              type: 'radio',
              id : index.toString(),
              label: value.itemGroupLabel,
              value: value.itemGroupLabel,//Utils.removeAccents(value+'_'+index.toString()).toLowerCase(),
              checked: index == 0 ? true : false
            });
          });
        
          alert.addButton({
            text: 'Nouveau',
            handler: data => {
              this.navCtrl.push(ItemGroupPage);
            }
          });

          alert.addButton('Annuler');

          alert.addButton({
            text: 'OK',
            handler: data => {
              var itemList  = this.shoppingItems.map((val : ShoppingItem) => {
                if (val && val.itemName != "" )
                  return Utils.removeAccents(val.itemName).toLowerCase();
              });
              // If not found, add
              if(itemList != null && itemList.indexOf(this.newItem.toLowerCase()) === -1) {
                this.createNewItem(data);
              }
              else {
                this.confirmItemDuplication(data);
              }
            }
          });

          alert.present();
      });
    }
  }

  /**
   * 
   * 
   * @private
   * @param {*} data Item group
   * @returns {Promise<void>} 
   * @memberof HomePage
   */
  private createNewItem(data : any) : Promise<void> {

    var shoppingItem : ShoppingItem = {itemId:null, itemName : "", itemGroup: "", isBought : false};
    // Save into database
    return this.shoppingService.readShoppingItems().then( itemList => {

      shoppingItem.itemId = null; // _.max(_.map(itemList, (val, index)=>{return index}));
      shoppingItem.itemName = this.newItem; 
      shoppingItem.itemGroup = data;
      shoppingItem.isBought = false;

      itemList.unshift(shoppingItem);

      this.shoppingService.createShoppingItems(itemList).then(addedItems => {

        if(this.existingItemsGroup.indexOf(data) == -1)
          this.existingItemsGroup.push(data);
          
        this.shoppingItems = itemList;

        this.newItem = "";
      });
    }).then(val=>{this.updateWithExistingItemsGroup();});
  }

  /**
   * Add duplicated Item
   * 
   * @private
   * @param {*} data : current item group
   * @memberof HomePage
   */
  private confirmItemDuplication(data : any) {
    let confirm = this.alertCtrl.create({
      title: 'Confirmer',
      message: "Cet article existe déjà! Souhaitez-vous l'ajouter? ",
      buttons: [
        {
          text: 'Non',
          handler: () => {    
          }
        },
        {
          text: 'Oui',
          handler: () => {
            this.createNewItem(data);
            var options = { duration : 1500, position : 'bottom', cssClass : 'warning-message' };
            this.presentToast('Ajouté avec succès!', options);
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Delete an item and save the new item list 
   * 
   * @param {ShoppingItem} item 
   * @param {number} index 
   * @memberof HomePage
   */
  public delete(item : ShoppingItem, index: number) {
    
    this.shoppingItems.splice(index, 1);
    this.shoppingService.createShoppingItems(this.shoppingItems);
    this.updateWithExistingItemsGroup();
  
  }

  /**
   * Check or barre an item if it's already pourchased
   * 
   * @private
   * @param {ShoppingItem} item 
   * @memberof HomePage
   */
  private onBought(item : ShoppingItem) : void {
   
    this.isBought = item.isBought == true ? false : true;
    item.isBought = this.isBought;

    // Browse the shoppingItems list and update the modified item
    this.shoppingItems.map((val: ShoppingItem) => { 
      if((val.itemName == item.itemName) && _.isEqual(val.itemGroup, item.itemGroup) ) {
        val.isBought = this.isBought 
      }
      return val;
    });
    // Then save the new array
    this.shoppingService.createShoppingItems(this.shoppingItems);
  }

  /**
   * Show notification
   * 
   * @private
   * @param {string} message 
   * @param {*} [option] 
   * @memberof HomePage
   */
  private presentToast(message : string, option?: any) {

    var options = {
      message: message,
      duration: option.duration ? option.duration : 1500,
      position: option.position ? option.position : 'middle',
      cssClass : option.cssClass ? option.cssClass : '',
      showCloseButton : option.showCloseButton ? option.showCloseButton : false
    }

    let toast = this.toastCtrl.create(options);
  
    toast.onDidDismiss(() => {
    });
  
    toast.present();
  }

}
