import { GAMESTATE } from "./game.js";
import { SkillType } from "./zones.js";
import { getSkill } from "./simulation.js"

export enum ItemType {
    Coin,
    Arrow,
    Food,
    Mushroom,
    GoblinSupplies,
    Zone6,
    Zone7,
    Zone8,
    Zone9,
    Zone10,

    Count
}

type itemUseLambda = (amount: number) => void;
type itemEffectTextLambda = (amount: number) => string;

export class ItemDefinition {
    enum = ItemType.Count;
    name = "";
    tooltip = "";
    icon = "";
    get_effect_text: itemEffectTextLambda = () => { return ""; };
    on_consume: itemUseLambda = () => { };
}

export var ITEMS: ItemDefinition[] = [
    {
        enum: ItemType.Coin, name: "Coin", tooltip: "Improves Charisma speed by 15%", icon: "💰",
        get_effect_text: (amount) => { return `Charisma speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Charisma).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Arrow, name: "Arrow", tooltip: "Improves Combat speed by 15%", icon: "🏹",
        get_effect_text: (amount) => { return `Charisma speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Combat).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Food, name: "Food", tooltip: "Gives 5 Energy", icon: "🍲",
        get_effect_text: (amount) => { return `Gained ${amount * 5} Energy`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 5 * amount; },
    },
    {
        enum: ItemType.Mushroom, name: "Mushroom", tooltip: "Improves Magic speed by 20% and Search speed by 10%", icon: "🍄",
        get_effect_text: (amount) => { return `Magic speed increased ${amount * 20}%; Search speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Search).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinSupplies, name: "Goblin Supplies", tooltip: "Improves Subterfuge speed by 15% and Combat speed by 10%", icon: "📦",
        get_effect_text: (amount) => { return `Subterfuge speed increased ${amount * 15}%; Combat speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.15 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Zone6, name: "Placeholder", tooltip: "???", icon: "?",
        get_effect_text: (amount) => { return `???`; },
        on_consume: (amount) => {},
    },
    {
        enum: ItemType.Zone7, name: "Placeholder", tooltip: "???", icon: "?",
        get_effect_text: (amount) => { return `???`; },
        on_consume: (amount) => {},
    },
    {
        enum: ItemType.Zone8, name: "Placeholder", tooltip: "???", icon: "?",
        get_effect_text: (amount) => { return `???`; },
        on_consume: (amount) => {},
    },
    {
        enum: ItemType.Zone9, name: "Placeholder", tooltip: "???", icon: "?",
        get_effect_text: (amount) => { return `???`; },
        on_consume: (amount) => {},
    },
    {
        enum: ItemType.Zone10, name: "Placeholder", tooltip: "???", icon: "?",
        get_effect_text: (amount) => { return `???`; },
        on_consume: (amount) => {},
    },
]
