import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ItemSliding } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ShoppingServiceProvider } from '../providers/shopping-service/shopping-service';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NativeStorage } from '@ionic-native/native-storage';
import { ItemGroupPage } from '../pages/item-group/item-group';
import { SaveListPage } from '../pages/save-list/save-list';
import { SaveListDetailPage } from '../pages/save-list-detail/save-list-detail';
import { NotificationManagerProvider } from '../providers/notification-manager/notification-manager';
import { TabsPage } from '../pages/tabs/tabs';
import { ConfigPage } from '../pages/config/config';
import { PopoverPage } from '../pages/popover/popover';
import { ItemEditorPage } from '../pages/item-editor/item-editor';
import { SMS } from '@ionic-native/sms';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ItemGroupPage,
    SaveListPage,
    SaveListDetailPage,
    TabsPage,
    ConfigPage,
    PopoverPage,
    ItemEditorPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'shopping_db',
      storeName: 'shoppingList',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ItemGroupPage,
    SaveListPage,
    SaveListDetailPage,
    TabsPage,
    ConfigPage,
    PopoverPage,
    ItemEditorPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ShoppingServiceProvider,
    NativeStorage,
    NotificationManagerProvider,
    ItemSliding,
    SMS
  ]
})
export class AppModule {}
