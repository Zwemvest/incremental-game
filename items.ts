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
}

export var ITEMS: ItemDefinition[] = [
    { enum: Item.Coin, name: "Coin" },
    { enum: Item.Arrow, name: "Arrow" },
    { enum: Item.Food, name: "Food" },
    { enum: Item.Mushroom, name: "Mushroom" },
    { enum: Item.GoblinSupplies, name: "Goblin Supplies" },
]
