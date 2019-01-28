import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LanguageType, Parameter } from '../../shared/sample-interface';
import { ShoppingServiceProvider } from '../../providers/shopping-service/shopping-service';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';

export const languagesConfig: LanguageType[] = [
  {code: "fr", name:"sltk.language.french", isChecked: false},
  {code: "en", name:"sltk.language.english", isChecked: false},
  {code: "de", name:"sltk.language.german", isChecked: false},
  {code: "es", name:"sltk.language.spanish", isChecked: false}
]

/**
 * Generated class for the LanguagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
  providers: [ShoppingServiceProvider, LanguageManagerProvider]
})
export class LanguagePage {

  private languages: LanguageType[];
  private params: Parameter[] = [];
  private languageParameter: Parameter;

  constructor(public navCtrl: NavController, public navParams: NavParams, public shoppingService: ShoppingServiceProvider, public translationService: LanguageManagerProvider) {

    this.shoppingService.readConfig()
    .then(data =>{
      this.params = data;
      return data;
    })
    .then((params: Parameter[])=>{
      this.languageParameter = params.find((val: Parameter, index: number) =>{
        return val.id == this.getLanguageKeyFromDb();
      });
      return this.languageParameter;
    })
    .then((languageParam: Parameter)=>{

      if(languageParam){
        this.translationService.useLanguage((languageParam.value != "") ? languageParam.value : this.translationService.getDefaultLanguage());
        this.languages = languagesConfig.map((element: LanguageType)=>{
          element.isChecked = element.code == languageParam.value.toString();
          return element;
        });
      } 
    });

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LanguagePage');
  }

  
  public selectLanguage(item: LanguageType){
    
    var dbIndex = this.getLanguageKeyFromDb();

    this.params[dbIndex].name = item.name;
    this.params[dbIndex].value = item.code;
  
    this.shoppingService.createConfig(this.params);

    // console.log("selection : ", item);
    this.translationService.useLanguage(item.code);

  }

  private getLanguageKeyFromDb(): number{
    return this.shoppingService.configColumnMap["language"].id;
  }
}
