//import {Utils} from '../model/utils';
//import { FirebaseProvider } from './../../providers/firebase/firebase';
import { Component, ViewChild  } from '@angular/core';
import { NavController, IonicPage, AlertController, FabContainer, Events, ItemSliding, List, PopoverController } from 'ionic-angular';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShoppingItem, ItemGroup, Parameter } from '../model/sample-interface';
import _ from "lodash";
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';
import { PopoverPage } from '../popover/popover';
import { ItemEditorPage } from '../item-editor/item-editor';
import { SMS } from '@ionic-native/sms';
//import { SaveListPage } from '../save-list/save-list';
//import { Observable } from '../../../node_modules/rxjs/Observable';


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
  private itemGroups: ItemGroup[] = [];
  public boughtItems: number = 0 ;
  public parameters: Parameter[] = [];
  private SelectedItem: ShoppingItem;
  
  @ViewChild('myList', {read: List}) list: List;
 
  constructor(public events: Events,
              public slidingItem: ItemSliding,
              public navCtrl: NavController, 
              public shoppingService: ShoppingServiceProvider, 
              public notificationService: NotificationManagerProvider,  
              public formBuilder : FormBuilder, 
              public alertCtrl: AlertController, 
              public popoverCtrl: PopoverController, public sms: SMS) {

    this.itemForm = formBuilder.group({
      "itemName" : ["", Validators.required]
    });
    
    // this.getShoppingItems().then((data)=>{
    //   this.updateWithExistingItemsGroup();
    // });

  }

  protected ionViewWillEnter() {

    this.shoppingService.readConfig().then((data: Parameter[])=>{
      this.parameters = data;
    })
    .then(()=>{
      this.getShoppingItems().then((data)=>{
        this.updateWithExistingItemsGroup();
        this.updateCart();
      });
    })
    
    
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

        var categoryParam: Parameter = this.parameters.find(val=>{return val.id == 0});

        if((categoryParam != null || categoryParam != undefined) && categoryParam.isActive){

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
                this.saveItem(data);
              }
            });

            alert.present();
          });
        }
        else{
          this.saveItem();
        }   
    }
  }

  /**
   *
   *
   * @private
   * @param {*} group
   * @memberof HomePage
   */
  private saveItem(group?: any){

    var data = group ? group : "Tous";

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
    var isAtTopOfList: boolean = true;

    var insertParam: Parameter = this.parameters.find(val=>{return val.id == 1});

    if((insertParam != null || insertParam != undefined) && !insertParam.isActive){
      isAtTopOfList = false;
    }
    // Save into database
    return this.getShoppingItems().then( itemList => {

      shoppingItem.itemId = null; // _.max(_.map(itemList, (val, index)=>{return index}));
      shoppingItem.itemName = this.newItem; 
      shoppingItem.itemGroup = data;
      shoppingItem.isBought = false;

      isAtTopOfList ? itemList.unshift(shoppingItem): itemList.push(shoppingItem);

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
   * Slide item to the right
   *
   * @param {ItemSliding} slidingItem
   * @memberof HomePage
   */
  public openSlide(item: ShoppingItem, slidingItem: ItemSliding): void{

    // Intentionaly set it twice
    slidingItem.startSliding(0);
    slidingItem.moveSliding(0);
    slidingItem.moveSliding(-150);

    // console.log("open amount ", slidingItem.getOpenAmount(), " Pourcent ", slidingItem.getSlidingPercent() );
    
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
    
    this.navCtrl.push(ItemEditorPage, {"index": index, "itemToReplace": itemToReplace, "shoppingItems": this.shoppingItems }, {animate: true, direction: 'forward'});
    if(slidingItem) slidingItem.close();

    //this.SelectedItem = itemToReplace;
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


  public saveItemList(fab?: FabContainer){
    //fab.close();
    if(this.shoppingItems != null && this.shoppingItems.length > 0){
        let alert = this.alertCtrl.create({
          title: 'Enregistrer la liste',
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
  public deleteList(fab?: FabContainer): void {
    
    //fab.close();
    
    if(this.shoppingItems.length == 0){
      return;
    }

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


  /**
   * Drags and drop to reoder items
   *
   * @param {*} indexes
   * @memberof HomePage
   */
  public reorderItems(indexes) {
    console.log("move place ", indexes);
    let element = this.shoppingItems[indexes.from];
    this.shoppingItems.splice(indexes.from, 1);
    this.shoppingItems.splice(indexes.to, 0, element);

    this.shoppingService.createShoppingItems(this.shoppingItems);
  }

  /**
   * Sorts items by alphabetical order 
   *
   * @memberof HomePage
   */
  public sortItems(): void{

    var sortList: ShoppingItem[] = this.shoppingItems.sort((a, b)=>{
      var x = a.itemName.toLowerCase();
      var y = b.itemName.toLowerCase();
    
      return x < y ? -1 : x > y ? 1 : 0
    });

    this.shoppingService.createShoppingItems(sortList);
  }

  /**
   * Open popover
   *
   * @param {*} myEvent
   * @memberof HomePage
   */
  public presentPopover(myEvent): void {
    let popover = this.popoverCtrl.create(PopoverPage, {homePage: this});
    popover.present({
      ev: myEvent
    });
  }

  public sendSms(): void{

    var itemsToSend : string = "Liste de course: \n \n";
    
    itemsToSend = itemsToSend.concat(
      this.shoppingItems.map((val)=>{
      return val.itemName;
    }).join(", \n") );

    var options = {
      replaceLineBreaks: true,
      android: {
        intent: 'INTENT' 
      }
    }

    this.sms.send('', itemsToSend, options);
  }

}
