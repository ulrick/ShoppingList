//import {Utils} from '../model/utils';
//import { FirebaseProvider } from './../../providers/firebase/firebase';
import { Component, ViewChild  } from '@angular/core';
import { NavController, IonicPage, AlertController, FabContainer, Events, ItemSliding, List, PopoverController, Content, NavParams } from 'ionic-angular';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShoppingItem, ItemGroup, Parameter, ShoppingItemSaveType } from '../../shared/sample-interface';
import _ from "lodash";
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';
import { PopoverPage } from '../popover/popover';
import { ItemEditorPage } from '../item-editor/item-editor';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';
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
  private savedList: ShoppingItemSaveType[] = [];
  private isListSaved: boolean = false;
  public currentListTitle: string = "sltk.home.myShoppingList";
  
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
              public translationService: LanguageManagerProvider,
              public navParams: NavParams,) {

    this.currentListTitle = navParams.data.listName;

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
    })
    .then(()=>{
      this.shoppingService.readDuplicatedItems().then((savedList: ShoppingItemSaveType[])=>{
        this.savedList = savedList;
      });
    });
    
    this.currentListTitle = this.navParams.data.listName;
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
              this.navCtrl.parent.select(1);
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
    // Add If not exists
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
    this.getShoppingItems().then( (itemList: ShoppingItem[]) => {

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
                // Create a new list if not exists!
                if(this.findSavedList(data.listName) == null){
                  this.shoppingService.createDuplicatedCurrentItems(data.listName, this.shoppingItems).then((items: ShoppingItemSaveType[])=>{
                    this.savedList = items;
                    this.currentListTitle = data.listName;
                    this.notificationService.showNotification(this.translationService.instant("sltk.notification.successListSave"));
                  })
                }
                else{
                  this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningSavedListAlreadyExist"));
                }
  
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
   * Retrieves an existing saved list by his name
   *
   * @private
   * @param {string} listName
   * @returns {ShoppingItemSaveType}
   * @memberof HomePage
   */
  private findSavedList(listName: string): ShoppingItemSaveType{

    return this.savedList.find((val: ShoppingItemSaveType)=>{
      return val.name.toLowerCase() == listName.toLowerCase();
    });
  }

  /**
   * Update an existing saved list.
   * An existing list will be replaced by tthe current list
   *
   * @returns {void}
   * @memberof HomePage
   */
  public updateSavedList(): void{

    if(this.shoppingItems == null || (this.shoppingItems && this.shoppingItems.length == 0)) return;

    if(this.savedList == null || (this.savedList && this.savedList.length == 0)){
      this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningSavedListEmpty"));
    }

    let alert = this.alertCtrl.create();

    alert.setTitle(this.translationService.instant("sltk.home.saveListTitle"));
    alert.setCssClass('custom-alert');
    
    this.savedList.forEach((value, index) => {
      
      alert.addInput({
        type: 'radio',
        id : index.toString(),
        label: value.name,
        value: value.name,
        //checked: value.itemGroupLabel == this.getActiveItemsGroup()[0].itemGroupLabel ? true : false
      });
      
    });

    alert.addButton(this.translationService.instant("sltk.button.cancel"));

    alert.addButton({
      text: this.translationService.instant("sltk.button.ok"),
      handler: data => {
        this.replaceExistingList(data)
      }
    });

    alert.present();
  }

  /**
   * Replaces an existing list by the current one
   *
   * @private
   * @param {string} name
   * @memberof HomePage
   */
  private replaceExistingList(name: string): void{

    if(this.findSavedList(name) && this.savedList.indexOf(this.findSavedList(name)) != -1){
      var index = this.savedList.indexOf(this.findSavedList(name));

      if(this.savedList[index] != undefined){
        this.savedList[index].value = this.shoppingItems;
        this.savedList[index].date = new Date().getTime();
        this.shoppingService.createDuplicatedItems(this.savedList).then((items: ShoppingItemSaveType[])=>{
          this.savedList = items;
          this.notificationService.showNotification(this.translationService.instant("sltk.notification.successUpdateSavedList"));
        });
        
      }
      
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
