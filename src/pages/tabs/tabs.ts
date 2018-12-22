import {NotificationManagerProvider} from '../../providers/notification-manager/notification-manager';
import {ShoppingServiceProvider} from '../../providers/shopping-service/shopping-service';
import { Component } from '@angular/core';

import { ItemGroupPage } from '../item-group/item-group';
import { SaveListPage } from '../save-list/save-list';
import { HomePage } from '../home/home';
import { FormBuilder } from '@angular/forms';
import {AlertController, NavController, Events} from 'ionic-angular';
import { ConfigPage } from '../config/config';
import { OptionsPage } from '../options/options';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

    homePage = HomePage;
    itemCategoryPage = ItemGroupPage;
    saveListPage = SaveListPage;
    // configPage = ConfigPage;
    optionPage = OptionsPage;
    exportPage = "";

    boughtItems: number;

    constructor(  public events: Events, 
                  public navCtrl: NavController,
                  public shoppingService: ShoppingServiceProvider, 
                  public notificationService: NotificationManagerProvider,  
                  public formBuilder : FormBuilder, 
                  public alertCtrl: AlertController) 
    {
                    
                      events.subscribe('cart:updated', _badgeValue => {
                        this.boughtItems = _badgeValue;
                  });
    }
  
}