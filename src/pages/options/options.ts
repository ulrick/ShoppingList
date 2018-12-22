import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LanguagePage } from '../language/language';
import { ConfigPage } from '../config/config';

/**
 * Generated class for the OptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-options',
  templateUrl: 'options.html',
})
export class OptionsPage {

  private pages: {title: string, component: any, icon?: string, options?: any}[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.pages = [
      {title: "sltk.options.languageTitle", component: LanguagePage},
      {title: "sltk.options.preferenceTitle", component: ConfigPage},
      //{title: "Langues", component: "languageComponent"},
    ]
  }

  ionViewDidLoad() {
    //console.log("I was loaded");
  }

  protected ionViewDidEnter() {
    //console.log("I was entered");
  }

  protected ionViewWillEnter() {
    //console.log("I am entered");
  }

  public openPage(page){
    this.navCtrl.push(page.component, page, {animate: true, animation:"ios-transition", direction: 'forward'});
  }

}
