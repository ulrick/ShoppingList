import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController, FabContainer, Content } from 'ionic-angular';
import { ItemGroup, ShoppingItem } from '../model/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
//import _ from "lodash";
import { Utils } from '../model/utils';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';

/**
 * Generated class for the ItemGroupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-item-group',
  templateUrl: 'item-group.html',
  providers: [ShoppingServiceProvider]
})
export class ItemGroupPage {

  private itemsGroup : ItemGroup[] = [];
  private selectedItem: ItemGroup;

  private placeholderProposer: string[] = [
    "sltk.category.addPlaceholder.house",
    "sltk.category.addPlaceholder.cleaningProduct" , 
    "sltk.category.addPlaceholder.yogurt" , 
    "sltk.category.addPlaceholder.cheese" , 
    "sltk.category.addPlaceholder.frozenProduct", 
    "sltk.category.addPlaceholder.beverageAlcohol" , 
    "sltk.category.addPlaceholder.seasoning" , 
    "sltk.category.addPlaceholder.meats" , 
    "sltk.category.addPlaceholder.fruitsVegetables" ,
    "sltk.category.addPlaceholder.hygieneCare"
  ]

  @ViewChild(Content) content: Content;
  
  constructor(public navCtrl: NavController, 
              public shoppingService: ShoppingServiceProvider, 
              public alertCtrl: AlertController, 
              public translationService: LanguageManagerProvider,
              public notificationService: NotificationManagerProvider) {
    
  }

  private resetItemGroup(): void{
    this.shoppingService.readShoppingItemsGroup().then(groupList => { 
      this.itemsGroup = [{itemGroupId : 0, itemGroupLabel : "sltk.category.defaultCategory", itemGroupValue : "any" , isActive : true, isDisabled: true}];
      this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
    })
  }

  private getItemsGroup() : Promise<ItemGroup[]>{
    return this.shoppingService.readShoppingItemsGroup().then(data => {
      this.itemsGroup = data ;

      return this.itemsGroup;
    });
  }

  protected ionViewWillEnter() {
    this.getItemsGroup().then(itemsGroup=>{
      this.shoppingService.readShoppingItems().then(items=>{
        if(items.some(val=>{
          return val.itemGroup == "sltk.category.defaultCategory";
        })){
          // itemsGroup[0].isDisabled = true;
        }
      });
    });
  }

  ionViewDidLoad() {
    
  }

  /**
   * Adds a new item group
   *
   * @public
   * @memberof ItemGroupPage
   */
  public addItemGroup(fab: FabContainer): void{

    let prompt = this.alertCtrl.create({
      title: this.translationService.instant('sltk.category.addTitle'),
      inputs: [
        {
          type: 'text',
          name: 'value',
          placeholder: this.generatePlaceHolder()
        }
      ],
      buttons: [
        {
          text: this.translationService.instant('sltk.button.cancel'),
          handler: data => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: this.translationService.instant('sltk.button.ok'),
          handler: data => {
          
            if(data.value == "" || data.value == undefined) return;

            var newItemGroup : ItemGroup = {itemGroupId : null, itemGroupLabel : "", itemGroupValue : "" , isActive : true, isDisabled: false};
             
            newItemGroup.itemGroupId = Math.max(...this.itemsGroup.map(val=>{return val.itemGroupId;})) + 1;
            newItemGroup.itemGroupLabel = data.value;
            newItemGroup.itemGroupValue = Utils.removeAccents(data.value+'_'+newItemGroup.itemGroupId).toLowerCase();

            // Add new item group if it doesn't exist
            if(this.itemsGroup.find(val=>{ return val.itemGroupLabel == data.value }) == null){
              this.itemsGroup.push(newItemGroup);
              this.selectedItem = newItemGroup;
  
              //this.content.scrollToBottom(500);
              this.content.scrollTo(0, this.content.scrollHeight, 1000);
              this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
            }
            else{
              this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningDuplicateCategory"));
            }
          }
        }
      ]
    });
    prompt.present();

    fab.close();

  }
  

  /**
   * Activate or deactivate an item group activation
   * 
   * @public
   * @param {ItemGroup} itemGroup 
   * @memberof ItemGroupPage
   */
  public onToggle(itemGroup : ItemGroup, index: number) {
    //this.isActivate = itemGroup.isActive ;

    this.itemsGroup[index].isActive = itemGroup.isActive;

    this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
  }

  /**
   * Initialize the list of catégories to default ones.
   * 
   * @public
   * @memberof ItemGroupPage
   */
  public initializeItemGroup(fab: FabContainer){

    fab.close();
    
    let confirm = this.alertCtrl.create({
      title: this.translationService.instant("sltk.category.deleteAllTitle"),
      message: this.translationService.instant("sltk.category.deleteAllMessage"),
      buttons: [
        {
          text: this.translationService.instant("sltk.button.no"),
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: this.translationService.instant("sltk.button.yes"),
          handler: () => {
            this.resetItemGroup();
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Removes Item
   *
   * @param {ItemGroup} item
   * @param {number} index
   * @memberof ItemGroupPage
   */
  public delete(item : ItemGroup, index: number){
    
    if(item.itemGroupLabel == "sltk.category.defaultCategory"){
      this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningDeleteDefaultCategory"));
      return;
    };

    let confirm = this.alertCtrl.create({
      title: this.translationService.instant("sltk.category.deleteTitle"),
      message: this.translationService.instant("sltk.category.deleteMessage"),
      buttons: [
        {
          text: this.translationService.instant("sltk.button.no"),
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: this.translationService.instant("sltk.button.yes"),
          handler: () => {
            if(item.itemGroupLabel != "sltk.category.defaultCategory"){
              this.itemsGroup.splice(index, 1);
              this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
            }
            else{
              
            }
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Reorder items
   *
   * @public
   * @param {*} indexes
   * @memberof ItemGroupPage
   */
  public reorderItems(indexes) {
    let element = this.itemsGroup[indexes.from];
    this.itemsGroup.splice(indexes.from, 1);
    this.itemsGroup.splice(indexes.to, 0, element);

    this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
  }

  /**
   * Updates item group
   *
   * @param {ItemGroup} itemGroupToReplace
   * @param {number} index
   * @memberof ItemGroupPage
   */
  public update(itemGroupToReplace: ItemGroup, index: number): void{
  
    if(itemGroupToReplace.itemGroupLabel == "sltk.category.defaultCategory") return;

    this.selectedItem = itemGroupToReplace;
    var oldName: string = this.itemsGroup[index].itemGroupLabel;
    let alert = this.alertCtrl.create(); 
    alert.setCssClass('custom-alert');
    alert.setTitle(this.translationService.instant("sltk.category.updateTitle") );
    
    alert.addInput({
      type: 'text',
      name: 'item',
      value: itemGroupToReplace.itemGroupLabel,
      placeholder: this.generatePlaceHolder()
    });

    alert.addButton(this.translationService.instant("sltk.button.cancel"));
    alert.addButton({
      text: this.translationService.instant("sltk.button.ok"),
      handler: data => {     
        if(this.itemsGroup[index] != undefined && itemGroupToReplace.itemGroupLabel != data.item){
          this.itemsGroup[index].itemGroupLabel = data.item;
          this.shoppingService.createShoppingItemsGroup(this.itemsGroup).then((itemsGroup: ItemGroup[])=>{

            this.shoppingService.readShoppingItems().then(items=>{
              items.forEach((val: ShoppingItem, index:number)=>{
                if(val.itemGroup == oldName){
                  val.itemGroup = data.item;
                }
              });
              this.shoppingService.createShoppingItems(items);
            })
          });
        }
      }
    });

    alert.present();
  }


  public generatePlaceHolder(): string {
    return this.translationService.instant(this.placeholderProposer[this.getRandomInt(this.placeholderProposer.length)]);
  }

  private getRandomInt(max): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  


}


