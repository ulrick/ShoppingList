/**
 * Shopping list grouping item
 * 
 * @export
 * @interface ItemGroup
 */
export interface ItemGroup {
    itemGroupId?: number;
    itemGroupLabel : string;
    itemGroupValue : string;
    isActive?: boolean;
    isDisabled?: boolean;
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

export interface ShoppingItemSaveType {
    name: string;
    value: ShoppingItem[];
    date: number;
}

/**
 *
 *
 * @export
 * @interface Parameter
 */
export interface Parameter {
    id: number;
    name: string;
    value?: any;
    isActive?: boolean;
    isDisabled?: boolean;
}


/**
 * Language type
 *
 * @export
 * @interface LanguageType
 */
export interface LanguageType {
    code: string;
    name: string;
    isChecked?: boolean;
}