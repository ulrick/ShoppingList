import { Component } from '@angular/core';
import {ActionSheetController, AlertController,  IonicPage,   NavController,   NavParams} from 'ionic-angular';
import { ShoppingItemSaveType } from '../model/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { SaveListDetailPage } from '../save-list-detail/save-list-detail';
import { NotificationManagerProvider } from '../../providers/notification-manager/notification-manager';

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
})
export class SaveListPage {

  private duplicatedShoppingList : ShoppingItemSaveType[] = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public shoppingService: ShoppingServiceProvider, 
              public notificationService: NotificationManagerProvider, 
              public alertCtrl: AlertController, 
              public actionSheetCtrl: ActionSheetController) {

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
      title: 'Suppression',
      message: 'Etes vous sûrs de vouloir supprimer cette liste ?',
      buttons: [
        {
          text: 'Non',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            this.duplicatedShoppingList.splice(index, 1);
            this.shoppingService.createDuplicatedItems(this.duplicatedShoppingList).then(()=>{
              this.notificationService.showNotification("Liste supprimée avec succès!");
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
    this.navCtrl.push(SaveListDetailPage, item, {animate: true, direction: 'forward'});
  }

  /**
   * 
   * 
   * @private
   * @param {ShoppingItemSaveType} item 
   * @memberof SaveListPage
   */
  private importDuplicatedList(item: ShoppingItemSaveType, isSaveCurrent: boolean): void {

    this.shoppingService.readShoppingItems().then(data =>{

      var msg = isSaveCurrent ? "La liste en cours sera enregistrée après importation!" : "La liste en cours ne sera pas enregistrée après importation!"
     
      let confirm = this.alertCtrl.create({
        title: 'Importer la liste',
        message: "Attention! " + msg,
        buttons: [
          {
            text: 'Annuler',
            handler: () => {
            }
          },
          {
            text: 'Importer',
            handler: () => {

              if(isSaveCurrent){
                // Save the current list before erase it
                this.shoppingService.createDuplicatedCurrentItems("sauvegarde du "+new Date().toLocaleDateString(), data).then(()=>{
                  // Replace the current shopping list by the list to be imported
                  this.importList(item);
                  return;
                })
              }
              this.importList(item);
            }
          }
        ]
      });
      confirm.present();
    })    
  }

  private importList(item: ShoppingItemSaveType): void{

    this.shoppingService.createShoppingItems(item.value);
    // Rediriger vers la page des articles
    this.navCtrl.parent.select(0);
    this.notificationService.showNotification("Liste importée avec succès !");
  }

  /**
   * Component to purpose actions to do for saved list
   * 
   * @private
   * @param {ShoppingItemSaveType} item 
   * @param {number} index 
   * @memberof SaveListPage
   */
  private presentActionSheet(item: ShoppingItemSaveType, index: number) {

    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      cssClass: 'action-sheet-custom',
      buttons: [
        {
          text: 'Liste détaillée',
          icon: 'ios-eye-outline',
          role: 'destructive',
          handler: () => {
            this.viewDuplicatedList(item);
          }
        },
        {
          text: 'Importer sans enregistrer la liste en cours',
          icon: 'ios-download-outline',
          role: 'destructive',
          handler: () => {
            this.importDuplicatedList(item, false);
          }
        },
        {
          text: 'Importer puis enregistrer la liste en cours',
          icon: 'ios-download-outline',
          role: 'destructive',
          handler: () => {
            this.importDuplicatedList(item, true);
          }
        },
        {
          text: 'Supprimer la liste',
          icon: 'ios-trash-outline',
          role: 'destructive',
          handler: () => {
            this.delete(item, index);
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}
