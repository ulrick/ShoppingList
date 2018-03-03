import {ToastController} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the NotificationManagerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationManagerProvider {

  constructor(public http: Http, private toastCtrl: ToastController,) {
    console.log('Hello NotificationManagerProvider Provider');
  }


  /**
   * Show notification message
   * 
   * @private
   * @param {string} message 
   * @param {{duration?: number, position?: string, cssClass?: string, showCloseButton?: boolean}} [option] 
   * @memberof HomePage
   */
  public showNotification(message : string, option: {duration?: number, position?: string, cssClass?: string, showCloseButton?: boolean} = null): void {


    var options = {
      message: message,
      duration: (option && option.duration) ? option.duration : 2000,
      position: (option && option.position) ? option.position : 'middle',
      cssClass : (option && option.cssClass) ? option.cssClass : 'toast-class',
      showCloseButton : (option && option.showCloseButton) ? option.showCloseButton : false
    }

    let toast = this.toastCtrl.create(options);
  
    toast.onDidDismiss(() => {
    });
  
    toast.present();
    /*return new Promise(resolve => {
      resolve(toast);
    })*/

  }

}
