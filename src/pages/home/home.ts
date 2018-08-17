import {Utils} from '../model/utils';
//import { FirebaseProvider } from './../../providers/firebase/firebase';
import { Component  } from '@angular/core';
import { NavController, IonicPage, ToastController, AlertController, FabContainer, Events, ItemSliding } from 'ionic-angular';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShoppingItem, ItemGroup, ShoppingItemSaveType } from '../model/sample-interface';
import _ from "lodash";
import { ItemGroupPage } from '../item-group/item-group';
import { ItemGroupData } from '../../data/item-group-data';
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';
import { SaveListPage } from '../save-list/save-list';
import { Observable } from '../../../node_modules/rxjs/Observable';

@IonicPage({
  name: 'HomePage',
  segment: 'home-page'
})
@Component({
  selector: 'home',
  templateUrl: 'home.html',
  providers: [ShoppingServiceProvider, NotificationManagerProvider, ItemSliding]
})
export class HomePage {

  private newItem : string = "";
  
  private shoppingItems : ShoppingItem[] = [];
  private existingItemsGroup : string[] = [];
  public itemForm : FormGroup;
  private isBought : boolean = false;
  private isUpdating: boolean = false;
  private editableItem: ShoppingItem;
  private itemGroups: ItemGroup[] = [];
  public boughtItems: number = 0 ;
 
  constructor(public events: Events,
              public slidingItem: ItemSliding,
              public navCtrl: NavController, 
              public shoppingService: ShoppingServiceProvider, 
              public notificationService: NotificationManagerProvider,  
              public formBuilder : FormBuilder, 
              public alertCtrl: AlertController) {

    this.itemForm = formBuilder.group({
      "itemName" : ["", Validators.required]
    });
    
    // this.getShoppingItems().then((data)=>{
    //   this.updateWithExistingItemsGroup();
    // });

  }
  
  protected ionViewWillEnter() {
    this.getShoppingItems().then((data)=>{
      this.updateWithExistingItemsGroup();
      this.updateCart();
    });
    
  }

  protected ionViewDidEnter() {
    // this.getShoppingItems().then((data)=>{
    //   this.updateWithExistingItemsGroup();
    // });
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
      
      this.itemGroups = groupList;
    })
  }

  /**
   * read shopping item from the database
   * 
   * @private
   * @memberof HomePage
   */
  private getShoppingItems() : Promise<ShoppingItem[]> {
    
    return this.shoppingService.readShoppingItems().then(data => {
      this.shoppingItems = data;
      this.boughtItems = data.filter(val=>{return val.isBought == true}).length;
    
      if(!this.shoppingItems) {
        this.shoppingItems = [];
      }
      return this.shoppingItems;
    });
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
          if(value.isActive){
            alert.addInput({
              type: 'radio',
              id : index.toString(),
              label: value.itemGroupLabel,
              value: value.itemGroupLabel,//Utils.removeAccents(value+'_'+index.toString()).toLowerCase(),
              checked: value.itemGroupLabel == "Tous" ? true : false
            });
          }
        });
      
        alert.addButton({
          text: 'Nouveau',
          handler: data => {
            //this.navCtrl.push(ItemGroupPage);
            this.navCtrl.parent.select(1);
          }
        });

        alert.addButton('Annuler');

        alert.addButton({
          text: 'OK',
          handler: data => {
            
            var itemList  = this.shoppingItems.map((val : ShoppingItem) => {
              if (val && val.itemName != "" )
                //return Utils.removeAccents(val.itemName).toLowerCase();
                return val.itemName.toLowerCase();
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
    return this.getShoppingItems().then( itemList => {

      shoppingItem.itemId = null; // _.max(_.map(itemList, (val, index)=>{return index}));
      shoppingItem.itemName = this.newItem; 
      shoppingItem.itemGroup = data;
      shoppingItem.isBought = false;

      itemList.unshift(shoppingItem);

      this.shoppingService.createShoppingItems(itemList).then(addedItems => {

        if(this.existingItemsGroup.indexOf(data) == -1)
          this.existingItemsGroup.push(data);
          
        this.shoppingItems = addedItems;
        this.newItem = "";
      });
    }).then(val=>{
      this.updateWithExistingItemsGroup();
    });
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
            var options = { duration : 2000, position : 'top', cssClass : 'warning-message', showCloseButton: false };
            this.notificationService.showNotification('Ajouté avec succès!', options);
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Deletes an item and save the new item list
   *
   * @param {ShoppingItem} item
   * @param {number} index
   * @param {ItemSliding} slidingItem
   * @memberof HomePage
   */
  public delete(item : ShoppingItem, index: number, slidingItem: ItemSliding) {
    slidingItem.close();
    this.shoppingItems.splice(index, 1);
    
    this.shoppingService.createShoppingItems(this.shoppingItems).then(()=>{
      //this.initOrRefreshPage();
    });

    this.updateWithExistingItemsGroup();
    this.updateCart();
  
  }


  /**
   * Modify selected item
   *
   * @param {ShoppingItem} itemToReplace
   * @param {number} index
   * @param {ItemSliding} slidingItem
   * @memberof HomePage
   */
  public update(itemToReplace: ShoppingItem, index: number, slidingItem: ItemSliding): void{
  
    if(slidingItem) slidingItem.close();
    let alert = this.alertCtrl.create();
    alert.setTitle("Modifier");
    
      alert.addInput({
        type: 'text',
        name: 'item',
        value: itemToReplace.itemName,
        placeholder: "Nom d'article"
      });

      alert.addButton("Annuler");
      alert.addButton({
        text: 'Ok',
        handler: data => {     
          if(itemToReplace.itemName != data.item){
            this.shoppingItems[index].itemName = data.item;
            this.shoppingService.createShoppingItems(this.shoppingItems);
          }
        }
      });

      alert.present();
  }

  private findShoppingItem(name: string, groupItem?: string): ShoppingItem{

    return this.shoppingItems.find((val: ShoppingItem, index: number)=>{ 
      var isAvailable: boolean = val.itemName.toLowerCase() == name.toLowerCase() ;
      return groupItem ? isAvailable && val.itemGroup.toLowerCase() == groupItem.toLowerCase() :  isAvailable;
    })
  }

  /**
   * Check or barre an item if it's already pourchased
   * 
   * @public
   * @param {ShoppingItem} item 
   * @param {ItemSliding} slidingItem 
   * @memberof HomePage
   */
  public onBought(item : ShoppingItem, slidingItem: ItemSliding) : void {
   
    slidingItem.close();

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
    this.shoppingService.createShoppingItems(this.shoppingItems).then((items: ShoppingItem[])=>{
      this.updateCart();
    });
  }

  /**
   * Updates the number of items in the cart
   *
   * @private
   * @memberof HomePage
   */
  private updateCart(): void{
    this.boughtItems = this.shoppingItems.filter(val=>{return val.isBought == true}).length;
      this.events.publish('cart:updated', this.boughtItems);
  }


  public saveItemList(fab: FabContainer){
    fab.close();
    if(this.shoppingItems != null && this.shoppingItems.length > 0){
        let alert = this.alertCtrl.create({
          title: 'Exporter la liste',
          inputs: [
            {
              name: 'listName',
              placeholder: 'Nom de la liste'
            }
          ],
          buttons: [
            {
              text: 'Annuler',
              role: 'cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Ok',
              handler: data => {
                console.log(data);
                if (data.listName != "") {
                  
                  this.getShoppingItems().then(items =>{
                  
                      this.shoppingService.createDuplicatedCurrentItems(data.listName, items).then(()=>{
                        this.notificationService.showNotification("Liste enregistrée avec succès !");
                      })
                    
                  })
                  
                } else {
                  this.notificationService.showNotification("Veuillez rensigner un nom à votre liste !");
                  return false;
                }
              }
            }
          ]
        });
        alert.present();
    }
  }

  /**
   * Removes items list
   *
   * @public
   * @param {FabContainer} fab
   * @memberof HomePage
   */
  public deleteList(fab: FabContainer): void {
    
    fab.close();
    
    let confirm = this.alertCtrl.create({
      title: 'Confirmer',
      message: "Etes vous sûrs de vouloir supprimer la liste en cours? ",
      buttons: [
        {
          text: 'Non',
          handler: () => {    
          }
        },
        {
          text: 'Oui',
          handler: () => {
            this.shoppingService.removeShoppingItems().then(()=>{
              this.getShoppingItems().then((data)=>{
                this.updateWithExistingItemsGroup();
              });
              this.notificationService.showNotification('Suppression effectuée avec succès!');
            });            
          }
        }
      ]
    });
    confirm.present();

    this.updateCart();
  }

}
