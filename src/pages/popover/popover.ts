import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HomePage } from '../home/home';

/**
 * Generated class for the PopoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage{

  private homePage: HomePage;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.homePage = this.navParams.data.homePage;
      console.log(this.homePage);
    }
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad PopoverPage');
  }

  public deleteList(): void {
    this.homePage.deleteList();
    this.viewCtrl.dismiss();
  }

  public saveItemList(): void {
    this.homePage.saveItemList();
    this.viewCtrl.dismiss();
  }

  public sortItems(): void {
    this.homePage.sortItems();
    this.viewCtrl.dismiss();
  }

  public sendSms(): void{
    this.homePage.sendSms();
    this.viewCtrl.dismiss();
  }

}
