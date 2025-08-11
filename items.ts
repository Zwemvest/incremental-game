export enum Item {
    Coin,
    Arrow,
    Food,
    Mushroom,
    GoblinSupplies,

    Count
}

export class ItemDefinition {
    enum = Item.Count;
    name = "";
    tooltip ="";
}

export var ITEMS: ItemDefinition[] = [
    { enum: Item.Coin, name: "Coin", tooltip:"Improves Charisma speed by 10%" },
    { enum: Item.Arrow, name: "Arrow", tooltip:"Improves Combat speed by 10%" },
    { enum: Item.Food, name: "Food", tooltip:"Improves Survival speed by 10%" },
    { enum: Item.Mushroom, name: "Mushroom", tooltip:"Improves Magic speed by 10%" },
    { enum: Item.GoblinSupplies, name: "Goblin Supplies", tooltip:"Improves Subterfuge and  Combat speed by 10%" },
]
