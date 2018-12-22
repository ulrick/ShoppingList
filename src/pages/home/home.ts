//import {Utils} from '../model/utils';
//import { FirebaseProvider } from './../../providers/firebase/firebase';
import { Component, ViewChild  } from '@angular/core';
import { NavController, IonicPage, AlertController, FabContainer, Events, ItemSliding, List, PopoverController, Content } from 'ionic-angular';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShoppingItem, ItemGroup, Parameter } from '../model/sample-interface';
import _ from "lodash";
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';
import { PopoverPage } from '../popover/popover';
import { ItemEditorPage } from '../item-editor/item-editor';
import { SMS } from '@ionic-native/sms';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';
import { TranslateService } from '@ngx-translate/core';
import { ItemGroupPage } from '../item-group/item-group';




@IonicPage({
  name: 'HomePage',
  segment: 'home-page'
})
@Component({
  selector: 'home',
  templateUrl: 'home.html',
  providers: [ShoppingServiceProvider, NotificationManagerProvider, ItemSliding, LanguageManagerProvider]
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
  private selectedItem: ShoppingItem;
  
  @ViewChild('myList', {read: List}) list: List;
  @ViewChild(Content) content: Content;
 
  constructor(public events: Events,
              public slidingItem: ItemSliding,
              public navCtrl: NavController, 
              public shoppingService: ShoppingServiceProvider, 
              public notificationService: NotificationManagerProvider,  
              public formBuilder : FormBuilder, 
              public alertCtrl: AlertController, 
              public popoverCtrl: PopoverController,
              public sms: SMS, 
              public translationService: LanguageManagerProvider) {

    //this.translationService.setDefaultLang('en');

    this.itemForm = formBuilder.group({
      "itemName" : ["", Validators.required]
    });

     
  }

  protected ionViewDidEnter() {
    //console.log("I was entered");
  }

  protected ionViewWillEnter() {

    this.shoppingService.readConfig()
    .then((data: Parameter[])=>{
      this.parameters = data;
    })
    .then( ()=>{
      this.shoppingService.readShoppingItemsGroup().then((groupList: ItemGroup[])=>{ 
        this.itemGroups = groupList;
      });
    })
    .then(()=>{
      this.getShoppingItems().then((data)=>{
        this.updateWithExistingItemsGroup();
        this.updateCart();
      });
    });
    //console.log("I am entered");
  }

  /**
   * Update category of item if add, or delete an item
   * 
   * @private
   * @memberof HomePage
   */
  private updateWithExistingItemsGroup() : void {
    //this.shoppingService.readShoppingItemsGroup().then((groupList)=>{
      
      var nonExistingItemGroups : string[] = _.differenceBy(this.shoppingItems.map((val: ShoppingItem) => {return val.itemGroup}), this.itemGroups.map(val=>{return val.itemGroupLabel}));
                                       
      this.existingItemsGroup = _.intersectionWith(this.itemGroups.map(val=>{return val.itemGroupLabel}), this.shoppingItems.map((val: ShoppingItem) => {return val.itemGroup}), _.isEqual);
      
      if(nonExistingItemGroups != null && nonExistingItemGroups.length > 0){
        nonExistingItemGroups.forEach(element => {
          this.shoppingItems.forEach(val => {
            if(val.itemGroup == element) val.itemGroup = "sltk.category.defaultCategory";
            return val;
          });
        });
      }
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


          if(this.itemGroups.every(val=>{
            return !val.isActive;
          })){
            this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningNoActiveCategory"), {duration: 5000});
            return ;
          }

          let alert = this.alertCtrl.create();
          alert.setTitle(this.translationService.instant("sltk.home.addCategoryTitle"));
          alert.setCssClass('custom-alert');     
          
          this.itemGroups.forEach((value, index) => {
            if(value.isActive){
              alert.addInput({
                type: 'radio',
                id : index.toString(),
                label: this.translationService.instant(value.itemGroupLabel),
                value: value.itemGroupLabel,
                checked: value.itemGroupLabel == this.getActiveItemsGroup()[0].itemGroupLabel ? true : false
              });
            }
          });
        
          alert.addButton({
            text: this.translationService.instant("sltk.button.new"),
            handler: data => {
              this.navCtrl.parent.select(2);
            }
          });

          alert.addButton(this.translationService.instant("sltk.button.cancel"));

          alert.addButton({
            text: this.translationService.instant("sltk.button.ok"),
            handler: data => {
              this.saveItem(data);
            }
          });

          alert.present();
        }
        else{
          this.saveItem();
        }  
    }
  }

  private getActiveItemsGroup(): ItemGroup[]{
    return this.itemGroups.filter((items=>{
      return items.isActive == true;
    }))
  }

  /**
   * Finds item group object from name
   *
   * @private
   * @param {string} name item group label
   * @returns {ItemGroup}
   * @memberof HomePage
   */
  private findItemGroupByName(name: string): ItemGroup{
    return this.itemGroups.find(val=>{
      return val.itemGroupLabel == name;
    })
  }

  /**
   *
   *
   * @private
   * @param {*} group
   * @memberof HomePage
   */
  private saveItem(group?: string){

    var data = group ? group : "sltk.category.defaultCategory";

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
   * @param {string} data Item group
   * @returns {void} 
   * @memberof HomePage
   */
  private createNewItem(data : string) : void {

    var shoppingItem : ShoppingItem = {itemId:null, itemName : "", itemGroup: "", isBought : false};
    var isAtTopOfList: boolean = true;

    var insertParam: Parameter = this.parameters.find(val=>{return val.id == 1});

    if((insertParam != null || insertParam != undefined) && !insertParam.isActive){
      isAtTopOfList = false;
    }
    // Save into database
    this.getShoppingItems().then( itemList => {

      shoppingItem.itemId = Math.max(...itemList.map(val=>{return val.itemId;})) + 1;
      shoppingItem.itemName = this.newItem;
      shoppingItem.itemGroup = data;
      shoppingItem.isBought = false;

      // Insert at the top or the bottom of the list
      isAtTopOfList ? itemList.unshift(shoppingItem): itemList.push(shoppingItem);

      return this.shoppingService.createShoppingItems(itemList).then(addedItems => {

        if(this.existingItemsGroup.indexOf(data) == -1){
          this.existingItemsGroup.push(data);
        }
             
        this.shoppingItems = addedItems;
        this.selectedItem = shoppingItem;
        
        // var itemGroup : ItemGroup = this.findItemGroupByName(data);
        // var element =  document.getElementById(itemGroup.itemGroupId.toString());
        // let yOffset = element.offsetTop;
        // this.content.scrollTo(0, yOffset, 1000);
        //console.log("nouvel element : ",this.selectedItem);

        this.newItem = "";

        return shoppingItem;
      });
    }).then((shoppingItem: ShoppingItem)=>{
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
      title: this.translationService.instant("sltk.home.confirmDuplicationTitle"),
      message: this.translationService.instant("sltk.home.confirmDuplicationMessage"),
      buttons: [
        {
          text: this.translationService.instant("sltk.button.no"),
          handler: () => {    
          }
        },
        {
          text: this.translationService.instant("sltk.button.yes"),
          handler: () => {
            this.createNewItem(data);
            //var options = { duration : 2000, position : 'top', cssClass : 'warning-message', showCloseButton: false };
            this.notificationService.showNotification(this.translationService.instant("sltk.notification.successAdd"));
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

    //slidingItem.setElementClass("slide-class", false);
    this.selectedItem = item;
    
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
          title: this.translationService.instant("sltk.home.saveListTitle"),
          inputs: [
            {
              name: 'listName',
              placeholder: this.translationService.instant("sltk.home.saveListPlaceholder")
            }
          ],
          buttons: [
            {
              text: this.translationService.instant("sltk.button.cancel"),
              role: 'cancel',
              handler: data => {
                //console.log('Cancel clicked');
              }
            },
            {
              text: this.translationService.instant("sltk.button.ok"), 
              handler: data => {
                //console.log(data);
                if (data.listName != "") {
                  
                  this.getShoppingItems().then(items =>{
                  
                      this.shoppingService.createDuplicatedCurrentItems(data.listName, items).then(()=>{
                        this.notificationService.showNotification(this.translationService.instant("sltk.notification.successListSave"));
                      })
                    
                  })
                  
                } else {
                  this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningListNameEmpty"));
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
      title: this.translationService.instant("sltk.home.confirmCurrentListDeletionTitle"),
      message: this.translationService.instant("sltk.home.confirmCurrentListDeletionMessage"),
      buttons: [
        {
          text: this.translationService.instant("sltk.button.no"),
          handler: () => {
          }
        },
        {
          text: this.translationService.instant("sltk.button.yes"),
          handler: () => {
            this.shoppingService.removeShoppingItems().then(()=>{
              this.getShoppingItems().then((data)=>{
                this.updateWithExistingItemsGroup();
              });
              this.notificationService.showNotification(this.translationService.instant("sltk.notification.successDeletion"));
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
    //console.log("move place ", indexes);
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

  /**
   * Sends SMS
   *
   * @returns {void}
   * @memberof HomePage
   */
  public sendSms(): void{

    if(this.shoppingItems.length == 0){
      this.notificationService.showNotification(this.translationService.instant("sltk.home.listIsEmpty"));
      return;
    }

    var itemsToSend : string = this.translationService.instant("sltk.home.smsContentTitle") + " \n \n";
    
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

  /**
   * Search for an article
   * @param searchVal 
   */
  public filterItems(searchVal?:string): void{

    var searchValue = searchVal ? searchVal : this.newItem;
    
    if(searchVal){
      // if(searchValue != "" && searchValue.length > 2){
      //   this.shoppingItems = this.shoppingItems.filter((val)=>{
      //     return val.itemName.indexOf(searchValue) != -1;
      //   });
      // }
      // else{
      //   this.getShoppingItems();
      // }
      if(searchValue != "" && searchValue.length < 3){
        this.getShoppingItems();
      }
    }
    else{
      if(searchValue != ""){
        this.shoppingItems = this.shoppingItems.filter((val)=>{
          return val.itemName == searchValue || val.itemName.includes(searchValue);
        });
      }
      else{
         this.getShoppingItems();
      }
    }
    
    
    console.log(searchValue);
  }

}
