import {ShoppingServiceProvider} from '../providers/shopping-service/shopping-service';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ItemGroupPage } from '../pages/item-group/item-group';
import { SaveListPage } from '../pages/save-list/save-list';
import { TabsPage } from '../pages/tabs/tabs';
import { ConfigPage } from '../pages/config/config';
@Component({
  templateUrl: 'app.html',
  providers: [ShoppingServiceProvider]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  
  rootPage:any = TabsPage;
  pages: Array<{title: string, component: any}>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public menu: MenuController, public shoppingService: ShoppingServiceProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.shoppingService.initDb();

      this.shoppingService.executeScripts();
    });

    // set our app's pages
    this.pages = [
      //{ title: 'Accueil', component: HomePage },
      { title: "Catégories d'articles", component: ItemGroupPage },
      { title: "Listes sauvegardées", component: SaveListPage },
      { title: "Réglages", component: ConfigPage }
    ];
  }

  public openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.push(page.component);
  }

}

