import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Parameter } from '../model/sample-interface';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public shoppingService: ShoppingServiceProvider) {
  }

  ionViewDidLoad() {
    this.shoppingService.readConfig().then((params: Parameter[])=>{
      this.params = params;
    })
  }

  public onToggle(item: Parameter, index: number){

    this.params[index].isActive = item.isActive;

    this.shoppingService.createConfig(this.params);
    //console.log("parametre "+ index +" = "+item.name + ", "+item.isActive + ", "+item.isDisabled)
  }

}
