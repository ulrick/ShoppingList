import { Component } from '@angular/core';
import {ActionSheetController, AlertController,  IonicPage,   NavController,   NavParams, ItemSliding} from 'ionic-angular';
import { ShoppingItemSaveType } from '../model/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { SaveListDetailPage } from '../save-list-detail/save-list-detail';
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';

/**
 * Generated class for the SaveListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-save-list',
  templateUrl: 'save-list.html',
  providers: [ItemSliding]
})
export class SaveListPage {

  private duplicatedShoppingList : ShoppingItemSaveType[] = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public shoppingService: ShoppingServiceProvider, 
              public notificationService: NotificationManagerProvider, 
              public alertCtrl: AlertController, 
              public actionSheetCtrl: ActionSheetController, public translationService: LanguageManagerProvider) {

    // this.getDuplicatedShoppingItems();
  }

  protected ionViewWillEnter() {
    this.getDuplicatedShoppingItems();
  }

  protected ionViewDidLoad() {
    // console.log('ionViewDidLoad SaveListPage');
    // this.getDuplicatedShoppingItems();
  }

  /**
   * read shopping item from the database
   * 
   * @private
   * @returns {Promise<ShoppingItemSaveType[]>} 
   * @memberof SaveListPage
   */
  private getDuplicatedShoppingItems() : Promise<ShoppingItemSaveType[]> {
    
    return this.shoppingService.readDuplicatedItems().then(data => {
      this.duplicatedShoppingList = data;
    
      if(!this.duplicatedShoppingList) {
        this.duplicatedShoppingList = [];
      }
      return this.duplicatedShoppingList;
    });
  }

  /**
   * Delete an item and save the new list
   * 
   * @param {ShoppingItemSaveType} item 
   * @param {number} index 
   * @memberof SaveListPage
   */
  public delete(item : ShoppingItemSaveType, index: number): void {

    let confirm = this.alertCtrl.create({
      title: this.translationService.instant("sltk.favorite.deleteTitle"),
      message: this.translationService.instant("sltk.favorite.deleteMessage"),
      buttons: [
        {
          text: this.translationService.instant("sltk.button.no"),
          handler: () => {
            // console.log('Disagree clicked');
          }
        },
        {
          text: this.translationService.instant("sltk.button.yes"),
          handler: () => {
            this.duplicatedShoppingList.splice(index, 1);
            this.shoppingService.createDuplicatedItems(this.duplicatedShoppingList).then(()=>{
              this.notificationService.showNotification(this.translationService.instant("sltk.notification.successDeleteFavorite"));
            });
          }
        }
      ]
    });
    confirm.present();
  
  }

  /**
   * 
   * @param {ShoppingItemSaveType} item 
   * @memberof SaveListPage
   */
  public viewDuplicatedList(item: ShoppingItemSaveType): void {
    this.navCtrl.push(SaveListDetailPage, item, {animate: true, animation:"ios-transition", direction: 'forward'});
  }

  /**
   * 
   * 
   * @private
   * @param {ShoppingItemSaveType} item 
   * @memberof SaveListPage
   */
  private importDuplicatedList(item: ShoppingItemSaveType): void {

    this.shoppingService.readShoppingItems().then(data =>{

      // var msg = isSaveCurrent ? "La liste en cours sera enregistrée après importation!" : "La liste en cours ne sera pas enregistrée après importation!"
     
      let confirm = this.alertCtrl.create({
        cssClass: "custom-alert",
        title: this.translationService.instant("sltk.favorite.alertUseListTitle"),
        message: this.translationService.instant("sltk.favorite.alertUseListMessage"),
        buttons: [
          {
            text: this.translationService.instant("sltk.button.cancel"),
            handler: () => {
            }
          },
          {
            text: this.translationService.instant("sltk.button.no"),
            handler: () => {
              this.importList(item);
            }
          },
          {
            text: this.translationService.instant("sltk.button.yes"),
            handler: () => {
              // Save the current list before erase it
              if(data && data.length != 0){
                this.shoppingService.createDuplicatedCurrentItems(this.translationService.instant("sltk.favorite.favoriteListName") + " " +(this.duplicatedShoppingList.length+1), data).then(()=>{
                  // Replace the current shopping list by the list to be imported
                  this.importList(item);
                })
              }
              else{
                // this.notificationService.showNotification(this.translationService.instant("sltk.notification.warningCurrentShoppingListIsEmpty"));
              }
            }
          }
        ]
      });
      confirm.present();
    })    
  }

  /**
   * Import and use favorite list as current list
   *
   * @private
   * @param {ShoppingItemSaveType} item
   * @memberof SaveListPage
   */
  private importList(item: ShoppingItemSaveType): void{

    this.shoppingService.createShoppingItems(item.value);

    // Rediriger vers la page des articles
    this.navCtrl.parent.select(0);
    this.notificationService.showNotification(this.translationService.instant("sltk.notification.successImportList"));
  }

  /**
   * Rename favorite name
   *
   * @param {ShoppingItemSaveType} itemToReplace
   * @param {number} index
   * @memberof SaveListPage
   */
  public update(itemToReplace: ShoppingItemSaveType, index: number, slidingItem: ItemSliding): void{
  
    if(slidingItem) slidingItem.close();
    
    let alert = this.alertCtrl.create();
    alert.setTitle(this.translationService.instant("sltk.favorite.updateTitle"));
    
      alert.addInput({
        type: 'text',
        name: 'item',
        value: itemToReplace.name,
        placeholder: this.translationService.instant("sltk.favorite.listNamePlaceholder")
      });

      alert.addButton(this.translationService.instant("sltk.button.cancel"));
      alert.addButton({
        text: this.translationService.instant("sltk.button.ok"),
        handler: data => {     
          if(this.duplicatedShoppingList[index] != undefined && itemToReplace.name != data.item){
            this.duplicatedShoppingList[index].name = data.item;
            this.shoppingService.createDuplicatedItems(this.duplicatedShoppingList);
          }
        }
      });

      alert.present();
  }

  /**
   * Component to purpose actions to do for saved list
   * 
   * @public
   * @param {ShoppingItemSaveType} item 
   * @param {number} index 
   * @memberof SaveListPage
   */
  public presentActionSheet(item: ShoppingItemSaveType, index: number, slidingItem: ItemSliding) {

    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      cssClass: 'action-sheet-custom',
      buttons: [
        {
          text: this.translationService.instant("sltk.favorite.actionSheetViewBtn"),
          icon: 'ios-eye-outline',
          role: 'destructive',
          handler: () => {
            this.viewDuplicatedList(item);
          }
        },
        {
          text: this.translationService.instant("sltk.favorite.actionSheetUpdateBtn"),
          icon: 'ios-create-outline',
          role: 'destructive',
          handler: () => {
            this.update(item, index, slidingItem);
          }
        },
        {
          text: this.translationService.instant("sltk.favorite.actionSheetImportBtn"),
          icon: 'ios-download-outline',
          role: 'destructive',
          handler: () => {
            this.importDuplicatedList(item);
          }
        },
        {
          text: this.translationService.instant("sltk.favorite.actionSheetDeleteBtn"),
          icon: 'ios-trash-outline',
          role: 'destructive',
          handler: () => {
            this.delete(item, index);
          }
        },
        {
          text: this.translationService.instant("sltk.button.cancel"),
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}
