import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ItemSliding } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ShoppingServiceProvider } from '../providers/shopping-service/shopping-service';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule, Http } from '@angular/http';
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
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { OptionsPage } from '../pages/options/options';
import { LanguagePage } from '../pages/language/language';
import { LanguageManagerProvider } from '../providers/language-manager/language-manager';
import { TipsPage } from '../pages/tips/tips';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
    ItemEditorPage,
    OptionsPage,
    LanguagePage,
    TipsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'shopping_db',
      storeName: 'shoppingList',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
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
    ItemEditorPage,
    OptionsPage,
    LanguagePage,
    TipsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ShoppingServiceProvider,
    NativeStorage,
    NotificationManagerProvider,
    ItemSliding,
    SMS,
    LanguageManagerProvider
  ]
})
export class AppModule {}
