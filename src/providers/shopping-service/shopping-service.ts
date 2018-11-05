import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ShoppingItem, ItemGroup, ShoppingItemSaveType, Parameter } from '../../pages/model/sample-interface';


/*
  Generated class for the ShoppingServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShoppingServiceProvider {

  private shoppingList : ShoppingItem[] = [];
  private shoppingItemsGroup : ItemGroup[] = [];
  private duplicatedShoppingList : ShoppingItemSaveType[] = [];
  private configs : Parameter[] = [];
  
  private static DB_TABLE_CONFIG: string = "config";
  private static DB_TABLE_ITEMS_GROUP: string = "items-group";
  private static DB_TABLE_ITEMS: string = "items";
  private static DB_TABLE_ITEMS_SAVE: string = "items-save";

  private configMap = {
    "0": "groupActivator",
    "1": "insertionOrder"
  }


  constructor(public http: Http, private storage: Storage) {
    console.log('Hello ShoppingServiceProvider Provider');
    
    // this.storage = new Storage({name: 'shopping_db', storeName: 'shoppingList', driverOrder: ['indexeddb', 'sqlite', 'websql']})
  }

  /**
   * Initializes database
   *
   * @memberof ShoppingServiceProvider
   */
  public initDb(): void{
    this.storage.ready().then((storage) =>{
      
      /********************************** This is considered as a migration script v.0 ***********************/
      
      // On créé une catégorie par défaut qui correspond à tous les articles non classés
      this.readShoppingItemsGroup().then(groupList => {
        if(groupList.length == 0){
          var itemsGroup : ItemGroup[] = [{itemGroupId : 0, itemGroupLabel : "Tous", itemGroupValue : "any" , isActive : true, isDisabled: true}];
          this.createShoppingItemsGroup(itemsGroup);
        }
      });

      // On créé des paramètres par défaut à pré-inserer dans la BD
      this.readConfig().then((params: Parameter[]) => {
        if(params.length == 0){
          var parameters : Parameter[] = [
            {id : 0, name : "Classer les articles par groupe", isActive : true, isDisabled: false},
            {id : 1, name : "Insérer l'article en tête de liste", isActive : true, isDisabled: false}
          ];
          this.createConfig(parameters);
        }
      });
      /*************************************** End of script v.0 ****************************************/
    });
  }

  public executeScripts(): void{

    /***************************  MIGRATION SCRIPT V1 **************************/
    
    // exple : modification du libellé du 2ème paramètre

    // this.readConfig().then((params: Parameter[]) =>{

    //   if(params && params.length != 0){
    //     if(params[0] != undefined){
    //       params[0].name = "Classer les articles par groupe";
    //       this.createConfig(params);
    //     }
    //   }
    // })

    // /************************* END MIGRATION SCRIPT 1 ************************/
    
  }

  /**
   * Read items from db
   *
   * @returns {Promise<ShoppingItem[]>}
   * @memberof ShoppingServiceProvider
   */
  public readShoppingItems() : Promise<ShoppingItem[]>{
    return new Promise(resolve => {
      this.storage.get(ShoppingServiceProvider.DB_TABLE_ITEMS).then((data : ShoppingItem[]) => {
        this.shoppingList = data || [];
        resolve(this.shoppingList);
      }).catch(error => {
        this.handleError("Une erreur s'est produite!");
      });
    });
  }
 
  /**
   * Save item list into database
   *
   * @param {*} items
   * @returns {Promise<ShoppingItem[]>}
   * @memberof ShoppingServiceProvider
   */
  public createShoppingItems(items : ShoppingItem[]) : Promise<ShoppingItem[]>{
    //var promise
      return this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS, items).then( val => {
        //console.log("test create ",val)
        return Promise.resolve(val);
      });
  }

  public removeShoppingItems(): Promise<void>{
    return this.storage.remove(ShoppingServiceProvider.DB_TABLE_ITEMS);
  }


  /**
   * Get the list of category of existing items
   * 
   * @returns {Promise<ItemGroup[]>} 
   * @memberof ShoppingServiceProvider
   */
  public readShoppingItemsGroup() : Promise<ItemGroup[]>{
    return new Promise(resolve => {
      this.storage.get(ShoppingServiceProvider.DB_TABLE_ITEMS_GROUP).then((data : ItemGroup[]) => {
        this.shoppingItemsGroup = data || [];
        resolve(this.shoppingItemsGroup);
      }).catch(error => {
        this.handleError("Une erreur s'est produite lors de la récupération des catégories d'articles!");
      });
    });
  }
  /**
   * Save category list into database
   * 
   * @param {*} itemsGroup 
   * @returns {Promise<ItemGroup[]>} 
   * @memberof ShoppingServiceProvider
   */
  public createShoppingItemsGroup(itemsGroup : ItemGroup[]) : Promise<ItemGroup[]>{
      return this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS_GROUP, itemsGroup).then( (val : ItemGroup[]) => {
        return Promise.resolve(val);
      });
  }
  /**
   * Create and save current item into database
   * 
   * @param {*} items 
   * @returns {Promise<void>} 
   * @memberof ShoppingServiceProvider
   */
  public createDuplicatedCurrentItems(listName : string, items:ShoppingItem[]) : Promise<void>{

    return this.readDuplicatedItems().then((duplicatedItems: ShoppingItemSaveType[])=>{

      var duplicatedItem: ShoppingItemSaveType = {name:"", value:[], date: null};
      duplicatedItem.name = listName;
      duplicatedItem.value = items;
      duplicatedItem.date = new Date().getTime();
      duplicatedItems.unshift(duplicatedItem);
      this.createDuplicatedItems(duplicatedItems);
      
    })    
  }
  /**
   * Save duplicated list into database
   * 
   * @param {*} items 
   * @returns {Promise<void>} 
   * @memberof ShoppingServiceProvider
   */
  public createDuplicatedItems(items : any) : Promise<void>{
    return this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS_SAVE, items).then( (val : ShoppingItemSaveType[]) => {
    });
  }
  /**
   * Get the list of duplicated list
   * 
   * @returns {Promise<ShoppingItemSaveType[]>} 
   * @memberof ShoppingServiceProvider
   */
  public readDuplicatedItems() : Promise<ShoppingItemSaveType[]>{
    return new Promise(resolve => {
      this.storage.get(ShoppingServiceProvider.DB_TABLE_ITEMS_SAVE).then((data : ShoppingItemSaveType[]) => {
        this.duplicatedShoppingList = data || [];
        resolve(this.duplicatedShoppingList);
      }).catch(error => {
        this.handleError("Une erreur s'est produite lors de la récupération des catégories d'articles!");
      });
    });
  }
 
  /**
   * Read parameters
   *
   * @returns {Promise<Parameter[]>}
   * @memberof ShoppingServiceProvider
   */
  public readConfig() : Promise<Parameter[]>{
    return new Promise(resolve => {
      this.storage.get(ShoppingServiceProvider.DB_TABLE_CONFIG).then((data : Parameter[]) => {
        this.configs = data || [];
        resolve(this.configs);
      }).catch(error => {
        this.handleError("Une erreur s'est produite!");
      });
    });
  }
 
  /**
   * Save parameters
   *
   * @param {Parameter[]} items
   * @returns {Promise<Parameter[]>}
   * @memberof ShoppingServiceProvider
   */
  public createConfig(items : Parameter[]) : Promise<Parameter[]>{  
      return this.storage.set(ShoppingServiceProvider.DB_TABLE_CONFIG, items).then( val => {
        return Promise.resolve(val);
      });
  }

  private handleError(error: any = "Une erreur est survenue!"): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
