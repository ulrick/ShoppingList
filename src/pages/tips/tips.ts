import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ItemSliding, Item, Slides } from 'ionic-angular';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';
import { ShoppingItem } from '../model/sample-interface';

/**
 * Generated class for the TipsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tips',
  templateUrl: 'tips.html',
  providers: [ItemSliding, LanguageManagerProvider]
})
export class TipsPage {
  
  @ViewChildren(ItemSliding) private slidingItems: QueryList<ItemSliding>;
  @ViewChild(Slides) slides: Slides;

  isSliding: any = [];

  private items : ShoppingItem[] = [];
  private cloneItems: ShoppingItem[] = [];
  private isBought : boolean = false;
  private intervalId;
  private timeoutId;
  private times = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translationService: LanguageManagerProvider, public slidingItem: ItemSliding) {
    this.items = [
                    {itemId:1, itemName : "Tomates", itemGroup: "Fruits", isBought : true},
                    {itemId:2, itemName : "Déodorant", itemGroup: "Soins", isBought : true},
                    {itemId:3, itemName : "Pommes de terre", itemGroup: "Tous les articles", isBought : false},
                  ];

    //this.cloneItems = this.items.copyWithin(2,0);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TipsPage');
  }

  protected ionViewWillEnter() {
    //this.times = 0;
    //this.triggerAnimation();
  }

  protected ionViewWillLeave(){
    this.clearTimesInterval();
    console.log('view leaved ');
  }

  private reorderItems(indexes) {
    let element = this.items[indexes.from];
    this.items.splice(indexes.from, 1);
    this.items.splice(indexes.to, 0, element);
  }

  private triggerAnimation(): void{
    this.intervalId = window.setInterval(()=>{
      this.openSlides();
      this.timeoutId = window.setTimeout(() => {
        this.removeSlides();
      }, 500);
    }, 4000);
  }

  private clearTimesInterval(){
    window.clearInterval(this.intervalId);
    window.clearTimeout(this.timeoutId);
  }

  private openSliding(){
    this.slidingItems.toArray()[1].moveSliding(0);
    this.slidingItems.toArray()[1].moveSliding(150);
  }

  private openSlidingRight(){
    this.slidingItems.toArray()[5].moveSliding(0);
    this.slidingItems.toArray()[5].moveSliding(-250);
  }

  private openSlides(){
    this.openSliding();
    this.openSlidingRight();
    this.times++;
    if(this.times >= 5){
      this.times = 0;
      this.clearTimesInterval();
    }
  }

  private removeSlides(){
    //this.slidingItems.toArray()[1].close();
    this.slidingItems.map((item=>{return item.close()}));

    this.isBought = this.items[1].isBought == true ? false : true;
    this.items[1].isBought = this.isBought;
  }


  public slideChanged() {
    this.clearTimesInterval();
    let currentIndex = this.slides.getActiveIndex();

    this.times = 0;
    if(currentIndex == 1){
    
    }
    if(currentIndex == 2){
      
    }
    if(currentIndex == 3){
      //this.reorderItems(2);
    }
    this.triggerAnimation();
    console.log('Current index is', currentIndex);
  }

}
