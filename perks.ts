export enum PerkType {
    Reading,
    Zone2Placeholder,
    VillagerGratitude,
    Amulet,
    EnergySpell,

    Count
}

export class PerkDefinition {
    enum = PerkType.Count;
    name = "";
    tooltip = "";
    icon = "";
}

export var PERKS: PerkDefinition[] = [
    {
        enum: PerkType.Reading, name: "How to Read", tooltip: "Improves Study speed by 50%", icon: "📖",
    },
    {
        enum: PerkType.Zone2Placeholder, name: "Zone 2 Placedholder", tooltip: "???", icon: "?",
    },
    {
        enum: PerkType.VillagerGratitude, name: "Villager Gratitude", tooltip: "Improves Charisma speed by 50%", icon: "❤️",
    },
    {
        enum: PerkType.Amulet, name: "Mysterious Amulet", tooltip: "Improves Magic speed by 50%", icon: "📿",
    },
    {
        enum: PerkType.EnergySpell, name: "Energetic Spell", tooltip: "Increases starting Energy by 50", icon: "✨",
    },
]
