/**
 * Shopping list grouping item
 * 
 * @export
 * @interface ItemGroup
 */
export interface ItemGroup {
    itemGroupId? : number;
    itemGroupLabel : string;
    itemGroupValue : string;
    isActive ? : boolean;
}


/**
 * An shopping item
 * 
 * @export
 * @interface ShoppingItem
 */
export interface ShoppingItem {
    itemId? : number;
    itemName : string;
    itemGroup : string;
    isBought? : boolean;
}