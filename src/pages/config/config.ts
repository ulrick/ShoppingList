import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Parameter } from '../../shared/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';


/**
 * Generated class for the ConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
})
export class ConfigPage {

  private params: Parameter[] = [];
  private preferencesParams: Parameter[] = [];
  private preferencesKeys: number[] = [];


  constructor(public navCtrl: NavController, public navParams: NavParams, public shoppingService: ShoppingServiceProvider) {
    
    this.preferencesKeys = this.getPreferencesConfigKeys();

    this.shoppingService.readConfig().then(data =>{
      this.params = data;
    });

  }

  public getPreferences(): Promise<Parameter[]>{

    return this.shoppingService.readConfig().then(data =>{

      return data.filter((val)=>{
        return this.preferencesKeys.includes(val.id);
      });
    })
  }

  public ionViewDidLoad() {

    this.getPreferences().then((preferencesParams: Parameter[])=>{
      this.preferencesParams = preferencesParams;
    });
  }

  public onToggle(item: Parameter, index: number){

    this.params[index].isActive = item.isActive;
    this.shoppingService.createConfig(this.params);
  }

  private getPreferencesConfigKeys(): number[]{
    return this.shoppingService.getPreferencesConfigKeys(); 
  }

}
