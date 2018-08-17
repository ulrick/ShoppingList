import {ItemGroupData} from '../../data/item-group-data';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, FabContainer } from 'ionic-angular';
import { ItemGroup, ShoppingItem } from '../model/sample-interface';
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

  }

  private resetItemGroup(): void{
    this.shoppingService.readShoppingItemsGroup().then(groupList => { 
      this.itemsGroup = [{itemGroupId : 0, itemGroupLabel : "Tous", itemGroupValue : "any" , isActive : true, isDisabled: true}];
      this.shoppingService.createShoppingItemsGroup(this.itemsGroup);
    })
  }

  private getItemsGroup() : Promise<ItemGroup[]>{
    return this.shoppingService.readShoppingItemsGroup().then(data => {
      this.itemsGroup = data ;

      return this.itemsGroup;
    });
  }

  ionViewDidLoad() {

    this.getItemsGroup();
  }

  /**
   * Adds a new item group
   *
   * @public
   * @memberof ItemGroupPage
   */
  public addItemGroup(fab: FabContainer): void{

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
          
            var newItemGroup : ItemGroup = {itemGroupId : null, itemGroupLabel : "", itemGroupValue : "" , isActive : true, isDisabled: false};
           
            this.getItemsGroup().then( list => {
             
              newItemGroup.itemGroupId = null; //parseInt(_.max(Object.keys(list))) + 1;
              newItemGroup.itemGroupLabel = data.value;
              newItemGroup.itemGroupValue = Utils.removeAccents(data.value+'_'+newItemGroup.itemGroupId).toLowerCase();

              // Add new item group if it doesn't exist
              if(list.find(val=>{ return val.itemGroupValue == newItemGroup.itemGroupValue }) == null){
                list.push(newItemGroup);
              }   

              this.shoppingService.createShoppingItemsGroup(list).then(val =>{
                this.itemsGroup = val;
              });
            });
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
    this.isActivate = itemGroup.isActive ;

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
      title: 'Remise à zéro',
      message: 'Etes vous sûrs de vouloir supprimer la liste des catégories ?',
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

  /**
   * Removes Item
   *
   * @param {ItemGroup} item
   * @param {number} index
   * @memberof ItemGroupPage
   */
  public delete(item : ItemGroup, index: number){
    let confirm = this.alertCtrl.create({
      title: 'Suppression',
      message: 'Etes vous sûrs de vouloir supprimer cette catégorie? Vos articles seront classés dans la catégories "Tous"!',
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
  
    var oldName: string = this.itemsGroup[index].itemGroupLabel;
    let alert = this.alertCtrl.create();
    alert.setTitle("Modifier");
    
      alert.addInput({
        type: 'text',
        name: 'item',
        value: itemGroupToReplace.itemGroupLabel,
        placeholder: "Nom de la catégorie"
      });

      alert.addButton("Annuler");
      alert.addButton({
        text: 'Ok',
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

}


