import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { TranslateService } from '@ngx-translate/core';
import { ShoppingServiceProvider } from '../shopping-service/shopping-service';
import { Parameter } from '../../pages/model/sample-interface';
import { CommonParameters } from '../../shared/common-parameters';

/*
  Generated class for the LanguageManagerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LanguageManagerProvider {

  constructor(public http: Http, public translate: TranslateService, public shoppingService: ShoppingServiceProvider ) {

    this.shoppingService.readConfig().then((data: Parameter[]) =>{
      var languageParam: Parameter = data.find((val: Parameter, index: number) =>{
        return val.id == this.shoppingService.configColumnMap["language"].id;
      });

      if(languageParam && (languageParam.value != undefined || languageParam.value != "")){
        this.translate.setDefaultLang(languageParam.value);
      }
      else{
        this.translate.setDefaultLang(CommonParameters.DEFAULT_LANGUAGE);
      }
    });
    
  }

  /**
   * Change the language currently used
   *
   * @param {string} language
   * @memberof LanguageManagerProvider
   */
  public useLanguage(language: string): void{
    this.translate.use(language);
  }

  public getDefaultLanguage(): string{
    return this.translate.getDefaultLang();
  }

  public setTranslation(lang: string, translations: any, shouldMerge: boolean = true): void{
    return this.translate.setTranslation(lang, translations, shouldMerge);
  }

  public instant(key: string|Array<string>, interpolateParams?: Object): any{
    return this.translate.instant(key);
  }

  public get(key: string|Array<string>, interpolateParams?: Object): any{
    return this.translate.get(key);
  }

}
