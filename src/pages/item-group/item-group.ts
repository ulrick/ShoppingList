import {ItemGroupData} from '../../data/item-group-data';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { ItemGroup } from '../model/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import _ from "lodash";
import { Utils } from '../model/utils';

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
  private itemGroup : ItemGroup;
  private isActivate : boolean = true;


  constructor(public navCtrl: NavController, public shoppingService: ShoppingServiceProvider, public alertCtrl: AlertController) {
    this.itemGroup = {
      itemGroupId : 0, itemGroupLabel : "Tous", itemGroupValue : "any" , isActive : true
    };

    this.shoppingService.readShoppingItemsGroup().then(data => {
      
      this.itemsGroup = data ;

      if(this.itemsGroup.length == 0) {
        var arr : ItemGroup[] = [];
        arr.push(this.itemGroup);
        this.itemsGroup = arr;
        this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
      }
    });
  }

  private resetItemGroup(): void{
    this.shoppingService.readShoppingItemsGroup().then(groupList => { 
      this.itemsGroup = [{itemGroupId : 0, itemGroupLabel : "Tous", itemGroupValue : "any" , isActive : true}];
      this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
    })
  }

  private getItemsGroup() : void{
    this.shoppingService.readShoppingItemsGroup().then(data => {
      
      this.itemsGroup = data ;

      if(this.itemsGroup.length == 0) {
        var arr : ItemGroup[] = [];
        arr.push(this.itemGroup);
        this.itemsGroup = arr;
        this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
      }
    });
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad ItemGroupPage');
  }

  private addItemGroup(): void{

    let prompt = this.alertCtrl.create({
      title: 'Ajouter une catégorie',
      inputs: [
        {
          type: 'text',
          name: 'value',
          placeholder: 'Title'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: data => {
          
            var newItemGroup : ItemGroup = {itemGroupId : null, itemGroupLabel : "", itemGroupValue : "" , isActive : true};
           
            this.shoppingService.readShoppingItemsGroup().then( list => {
              //console.log(Object.keys(list));
              newItemGroup.itemGroupId = null; //parseInt(_.max(Object.keys(list))) + 1;
              newItemGroup.itemGroupLabel = data.value;
              newItemGroup.itemGroupValue = Utils.removeAccents(data.value+'_'+newItemGroup.itemGroupId).toLowerCase();

              if(list.find(val=>{ return val.itemGroupValue == newItemGroup.itemGroupValue }) == null)
                list.push(newItemGroup);

              this.shoppingService.createShoppingItemsGroup(list).then(addedItems => {
                this.itemsGroup = list;
              })
            });
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Update and save item group activation
   * 
   * @private
   * @param {ItemGroup} itemGroup 
   * @memberof ItemGroupPage
   */
  private onToggle(itemGroup : ItemGroup) {
    this.isActivate = itemGroup.isActive ;
    //itemGroup.isActive = this.isActivate;

    this.itemsGroup.map((val: ItemGroup) => { 
      if((val.itemGroupLabel == itemGroup.itemGroupLabel) || val.itemGroupValue == itemGroup.itemGroupValue) {
        val.isActive = this.isActivate;
      }
      return val;
    });
    this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
  }

  /**
   * Initialize the list of catégories to default ones.
   * 
   * @private
   * @memberof ItemGroupPage
   */
  private initializeItemGroup(){

    let confirm = this.alertCtrl.create({
      title: 'Remise à zéro',
      message: 'Etes vous sûrs de vouloir réinitialiser la liste des catégories ?',
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
            this.resetItemGroup();
          }
        }
      ]
    });
    confirm.present();
  }


  private delete(item : ItemGroup, index: number){

    let confirm = this.alertCtrl.create({
      title: 'Suppression',
      message: 'Etes vous sûrs de vouloir supprimer cette catégorie? vos articles seront classés dans la catégories "Tous"!',
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
            if(item.itemGroupLabel != "Tous"){
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

}


