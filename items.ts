import { GAMESTATE } from "./game.js";
import { SkillType } from "./zones.js";

export enum ItemType {
    Coin,
    Arrow,
    Food,
    Mushroom,
    GoblinSupplies,

    Count
}

type itemUselambda = (amount: number) => void;

export class ItemDefinition {
    enum = ItemType.Count;
    name = "";
    tooltip = "";
    icon = "";
    on_consume: itemUselambda = () => { };
}

export var ITEMS: ItemDefinition[] = [
    {
        enum: ItemType.Coin, name: "Coin", tooltip: "Improves Charisma speed by 10%", icon: "💰",
        on_consume: (amount) => { GAMESTATE.getSkill(SkillType.Charisma).speed_modifier += 0.1 * amount; },
    },
    {
        enum: ItemType.Arrow, name: "Arrow", tooltip: "Improves Combat speed by 10%", icon: "🏹",
        on_consume: (amount) => { GAMESTATE.getSkill(SkillType.Combat).speed_modifier += 0.1 * amount; },
    },
    {
        enum: ItemType.Food, name: "Food", tooltip: "Gives 5 Energy", icon: "🍲",
        on_consume: (amount) => { GAMESTATE.current_energy += 5 * amount; },
    },
    {
        enum: ItemType.Mushroom, name: "Mushroom", tooltip: "Improves Magic speed by 10%", icon: "🍄",
        on_consume: (amount) => { GAMESTATE.getSkill(SkillType.Magic).speed_modifier += 0.1 * amount; },
    },
    {
        enum: ItemType.GoblinSupplies, name: "Goblin Supplies", tooltip: "Improves Subterfuge and  Combat speed by 10%", icon: "📦",
        on_consume: (amount) => {
            GAMESTATE.getSkill(SkillType.Subterfuge).speed_modifier += 0.1 * amount;
            GAMESTATE.getSkill(SkillType.Combat).speed_modifier += 0.1 * amount;
        },
    },
]
