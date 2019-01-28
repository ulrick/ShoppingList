import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ItemSliding, Slides, ItemReorder, Platform } from 'ionic-angular';
import { LanguageManagerProvider } from '../../providers/language-manager/language-manager';
import { ShoppingItem } from '../../shared/sample-interface';
import { Utils } from '../../shared/utils';

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
  @ViewChild(ItemReorder) private reorderItem: ItemReorder;

  isSliding: any = [];

  private items : ShoppingItem[] = [];
  private cloneItems: ShoppingItem[] = [];
  private isBought : boolean = false;
  private intervalId;
  private timeoutId;
  private times = 0;
  private index: number = 1;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translationService: LanguageManagerProvider, public slidingItem: ItemSliding, public platform: Platform) {
    this.items = [
                    {itemId:1, itemName : "Tomates", itemGroup: "Fruits", isBought : true},
                    {itemId:2, itemName : "Déodorant", itemGroup: "Soins", isBought : false},
                    {itemId:3, itemName : "Pommes de terre", itemGroup: "Tous les articles", isBought : false},
                  ];
    
    this.cloneItems = this.items.slice(0);
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

    var fromIndex = 0;
    var toIndex = indexes;

    // var elt = document.getElementsByClassName("reorder-list-active-custom");
    // var selectedElt: any = elt[0].children[0];
    // var height: number = selectedElt.offsetHeight;

    let element = this.cloneItems[fromIndex];
    this.cloneItems.splice(fromIndex, 1);
    this.cloneItems.splice(toIndex, 0, element);
  }

  private triggerAnimation(): void{
    this.intervalId = window.setInterval(()=>{
      this.openSlides();
      this.timeoutId = window.setTimeout(() => {
        this.removeSlides();
        this.index = Utils.getRandomInt(3);
      }, 1000);
    }, 3500);
  }

  private clearTimesInterval(){
    window.clearInterval(this.intervalId);
    window.clearTimeout(this.timeoutId);
  }

  private checkItem(){
    this.slidingItems.toArray()[1].moveSliding(0);
    this.slidingItems.toArray()[1].moveSliding(150);
  }

  private openSlidingRight(){
    this.slidingItems.toArray()[5].moveSliding(0);
    this.slidingItems.toArray()[5].moveSliding(-250);
  }

  private openSlides(){
    this.checkItem();
    this.openSlidingRight();
    this.reorderItems(this.index);
    this.times++;
    if(this.times >= 8){
      this.times = 0;
      this.clearTimesInterval();
    }
  }

  private removeSlides(){

    this.slidingItems.map((item=>{return item.close()}));

    if(this.slides.getActiveIndex() == 1){
      this.isBought = this.items[1].isBought == true ? false : true;
      this.items[1].isBought = this.isBought;
    }
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
      // this.reorderItems(this.index);
    }
    this.triggerAnimation();
    console.log('Current index is', currentIndex);
  }

}
