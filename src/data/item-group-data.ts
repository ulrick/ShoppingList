//import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { ItemGroup } from '../pages/model/sample-interface';
//import _ from "lodash";
//import { Utils } from '../pages/model/utils';


/**
 * 
 * 
 * @export
 * @class ItemGroupData
 */
export class ItemGroupData {

    private _itemGroupId : number;
    private _itemGroupLabel : string;
    private _itemGroupValue : string;
    private _isActive : boolean = true;

    public static DEFAULT_CATEGORY : ItemGroup[] = [
        { itemGroupId: 0, itemGroupLabel: 'Tous les articles', itemGroupValue: 'any', isActive : true}
        /*{ itemGroupId: 1, itemGroupLabel: 'Categorie_A', itemGroupValue: 'Categorie_1', isActive : true},
        { itemGroupId: 2, itemGroupLabel: 'Categorie_B', itemGroupValue: 'Categorie_2', isActive : false},
        { itemGroupId: 3, itemGroupLabel: 'Categorie_C', itemGroupValue: 'Categorie_3', isActive : false},
        { itemGroupId: 4, itemGroupLabel: 'Categorie_D', itemGroupValue: 'Categorie_4', isActive : false}*/
    ];

    constructor(itemGroupId? : number, itemGroupLabel? : string, itemGroupValue? : string, isActive? : boolean) {
        this._itemGroupId = itemGroupId != null ? itemGroupId : 0;
        this._itemGroupLabel = itemGroupLabel != null ? itemGroupLabel : "Tous"; 
        this._itemGroupValue = itemGroupValue != null ? itemGroupValue : "any";
        this._isActive = isActive ? isActive : true;
    }

	public get itemGroupId(): number {
		return this._itemGroupId;
	}

	public set itemGroupId(value: number) {
		this._itemGroupId = value;
	}
    

	public get itemGroupLabel(): string {
		return this._itemGroupLabel;
	}

	public set itemGroupLabel(value: string) {
		this._itemGroupLabel = value;
	}
    

	public get itemGroupValue(): string {
		return this._itemGroupValue;
	}

	public set itemGroupValue(value: string) {
		this._itemGroupValue = value;
    }

	public get isActive(): boolean  {
		return this._isActive;
	}

	public set isActive(value: boolean ) {
		this._isActive = value;
	}
    
    
}
