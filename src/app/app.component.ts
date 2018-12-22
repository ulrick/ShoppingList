import {ShoppingServiceProvider} from '../providers/shopping-service/shopping-service';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, Tabs } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ItemGroupPage } from '../pages/item-group/item-group';
import { SaveListPage } from '../pages/save-list/save-list';
import { TabsPage } from '../pages/tabs/tabs';
import { ConfigPage } from '../pages/config/config';
import { OptionsPage } from '../pages/options/options';
import { HomePage } from '../pages/home/home';
import { LanguageManagerProvider } from '../providers/language-manager/language-manager';
import { TipsPage } from '../pages/tips/tips';

@Component({
  templateUrl: 'app.html',
  providers: [ShoppingServiceProvider, ShoppingServiceProvider]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild('myTabs') tabRef: Tabs;
  rootPage:any = TabsPage;
  pages: Array<{icon: string, title: string, component: any}>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public menu: MenuController, public shoppingService: ShoppingServiceProvider, public translationService: LanguageManagerProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.shoppingService.initDb();

    });

    // set our app's pages
    this.pages = [
      //{ icon: "ios-cart-outline", title: "Articles", component: HomePage },
      //{ icon: "ios-options-outline", title: "Catégories d'articles", component: ItemGroupPage },
      //{ icon: "ios-paper-outline", title: "Listes sauvegardées", component: SaveListPage },
      //{ icon: "ios-construct-outline", title: "Réglages", component: ConfigPage },
      { icon: "ios-settings-outline", title: "sltk.menu.options", component: OptionsPage },
      { icon: "ios-help-circle-outline", title: "sltk.menu.tips", component: TipsPage }
    ];
  }

  public openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.push(page.component);
  }

}

