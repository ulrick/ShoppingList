import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ShoppingItem, ItemGroup, ShoppingItemSaveType, Parameter } from '../../pages/model/sample-interface';
import { ParameterType } from '../../shared/Enums';
import { NotificationManagerProvider } from '../notification-manager/notification-manager';


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


  public configColumnMap: {[name: string]: {id: number, type: ParameterType}} = {

    "groupActivator" : {
      id : 0,
      type : ParameterType.Preferences
    },
    "insertionOrder" : {
      id : 1,
      type : ParameterType.Preferences
    },
    "language" : {
      id : 2,
      type : ParameterType.Options
    },

  } 


  constructor(public http: Http, private storage: Storage, public notificationService: NotificationManagerProvider) {
    // console.log('Hello ShoppingServiceProvider Provider');
    
    // this.storage = new Storage({name: 'shopping_db', storeName: 'shoppingList', driverOrder: ['indexeddb', 'sqlite', 'websql']})
  }


  private emptyUserData(): void{
    this.storage.set(ShoppingServiceProvider.DB_TABLE_CONFIG, []);
      this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS_GROUP, []);
      this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS, []);
      this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS_SAVE, []);
  }

  /**
   * Initializes database
   *
   * @memberof ShoppingServiceProvider
   */
  public initDb(): void{
    //this.storage.ready().then((storage) =>{
      var promises: Promise<any>[] = [];
      /********************************** This is considered as a migration script v.0 ***********************/
      
      // On créé une catégorie par défaut qui correspond à tous les articles non classés
      promises.push(
        this.readShoppingItemsGroup().then(groupList => {
          if(groupList.length == 0){
            var itemsGroup : ItemGroup[] = [{itemGroupId : 0, itemGroupLabel : "Tous", itemGroupValue : "any" , isActive : true, isDisabled: true}];
            this.createShoppingItemsGroup(itemsGroup);
          }
        })
      );
      
      
      // On créé des paramètres par défaut à pré-inserer dans la BD
      promises.push(
        this.readConfig().then((params: Parameter[]) => {
          if(params.length == 0){
            var parameters : Parameter[] = [
              {id : 0, name : "Classer les articles par groupe", isActive : true, isDisabled: false},
              {id : 1, name : "Insérer l'article en tête de liste", isActive : true, isDisabled: false}
            ];
            this.createConfig(parameters);
          }
        })
      );

      Promise.all(promises).then(()=>{
        this.executeScripts();
      }).catch((error)=>{
        var msg: string = "Une erreur s'est produite! Veuillez reinitialiser les données de l'application dans les paramètres du téléphone! ";
        this.notificationService.showNotification(msg);
        this.handleError(msg + error);
      })
      
      /*************************************** End of script v.0 ****************************************/
    //});

    // return Promise.resolve();
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
  

    this.readConfig().then((params: Parameter[]) =>{
      
      var tableChanged: boolean = false;
      if(params && params.length > 0){

        for (let index = 0; index < params.length; index++) {
          var element = params[index];

          // Add "value" field into existing table config columns
          if(element.value == undefined){
            element.value = "";
          }
        }

        // Add "language" column into config table
        var lang: number = this.configColumnMap["language"].id;
        if(params[lang] == undefined){
          params[lang] = {id: lang, name: "sltk.language.french", isActive: true, isDisabled: false, value: "fr"};
        }

        // Modify the name of groupActivator column
        var groupActivatorId: number = this.configColumnMap["groupActivator"].id;
        var groupActivatorName: string = "sltk.options.preferences.classifyArticleByCategory";
        if(params[groupActivatorId].name != groupActivatorName){
          params[groupActivatorId].name = groupActivatorName;
        }
        
        // Modify the name of insertionOrder column
        var insertOrderId: number = this.configColumnMap["insertionOrder"].id;
        var inserOrderName: string = "sltk.options.preferences.insertArticleAtTopOfList";
        if(params[insertOrderId].name != inserOrderName){
          params[insertOrderId].name = inserOrderName;
        }

        this.createConfig(params);
      }
    });

    this.readShoppingItemsGroup().then(groupList => {
      if(groupList && groupList.length > 0){
        if(groupList.findIndex(val=>{return val.itemGroupLabel == "Tous" && val.itemGroupId == 0}) != -1){
          groupList[0].itemGroupLabel = "sltk.category.defaultCategory";
          groupList[0].isDisabled = false;
          this.createShoppingItemsGroup(groupList);
        }
      }
    });

    this.readShoppingItems().then(itemList=>{
      var tableChanged: boolean = false;
      
      if(itemList && itemList.length != 0){

        if(itemList.some(val=>{
          return val.itemGroup == "Tous"
        })){
          tableChanged = true;
        }

        if(tableChanged){
          for (let index = 0; index < itemList.length; index++) {
            var element = itemList[index];
            if(element.itemGroup == "Tous"){
              element.itemGroup = "sltk.category.defaultCategory";
            }
          }
          this.createShoppingItems(itemList);
        }        
      }
    });

    // // Add item id to items table
    // this.readShoppingItems().then((items: ShoppingItem[])=>{
    //   var tableChanged: boolean = false;
    //   if(items.some(val=>{
    //     return val.itemId == null;
    //   }) ){
    //     for (let index = 0; index < items.length; index++) {
    //       var element = items[index];
    //       element.itemId = index;
    //     }
    //     tableChanged = true;
    //   }

    //   if(tableChanged){
    //     this.createShoppingItems(items);
    //   }
    // });

    // // Add items-group id to items-group table
    // this.readShoppingItemsGroup().then((items: ItemGroup[])=>{
    //   var tableChanged: boolean = false;
    //   if(items.some(val=>{
    //     return val.itemGroupId == null;
    //   }) ){
    //     for (let index = 0; index < items.length; index++) {
    //       var element = items[index];
    //       element.itemGroupId = index;
    //     }
    //     tableChanged = true;
    //   }

    //   if(tableChanged){
    //     this.createShoppingItemsGroup(items);
    //   }
    // });

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
        this.handleError("Une erreur s'est produite lors de la récupération des articles dans la base! " + error);
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
   * @returns {Promise<ShoppingItemSaveType>} 
   * @memberof ShoppingServiceProvider
   */
  public createDuplicatedItems(items : any) : Promise<ShoppingItemSaveType[]>{
    return this.storage.set(ShoppingServiceProvider.DB_TABLE_ITEMS_SAVE, items).then( (val : ShoppingItemSaveType[]) => {
      return Promise.resolve(val);
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

  private cleanConfigTable(): Promise<any>{
    return this.storage.keys().then(keys=>{
      if(keys.indexOf(ShoppingServiceProvider.DB_TABLE_CONFIG) != -1){
        return this.storage.set(ShoppingServiceProvider.DB_TABLE_CONFIG, []);
      }
    });
  }

  /**
   * Retrieve preferences config keys
   *
   * @returns {number[]}
   * @memberof ShoppingServiceProvider
   */
  public getPreferencesConfigKeys(): number[]{

    var preferencesKey : number[] = [];
    for (var property in this.configColumnMap) {
      if (this.configColumnMap.hasOwnProperty(property)) {
        var element = this.configColumnMap[property];
        if(element.type == ParameterType.Preferences){
          preferencesKey.push(element.id);
        }
      }
    }

    return preferencesKey;
  }

  /**
   * Retrieve general options
   *
   * @returns {number[]}
   * @memberof ShoppingServiceProvider
   */
  public getGeneralOptionsKeys(): number[]{

    var optionsKey : number[] = [];
    for (var property in this.configColumnMap) {
      if (this.configColumnMap.hasOwnProperty(property)) {
        var element = this.configColumnMap[property];
        if(element.type == ParameterType.Options){
          optionsKey.push(element.id);
        }
      }
    }

    return optionsKey;
  }


  private handleError(error: any = "Une erreur est survenue!"): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
