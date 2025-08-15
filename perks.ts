export enum PerkType {
    Reading,
    Writing,
    VillagerGratitude,
    Amulet,
    EnergySpell,
    ExperiencedTraveler,
    UndergroundConnection,
    MinorTimeCompression,
    Zone9,
    Zone10,

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
        enum: PerkType.Writing, name: "How to Write", tooltip: "Improves XP gain by 50%", icon: "📝",
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
    {
        enum: PerkType.ExperiencedTraveler, name: "Experienced Traveler", tooltip: "Improves Travel speed by 50%", icon: "🦶",
    },
    {
        enum: PerkType.UndergroundConnection, name: "Underground Connection", tooltip: "Improves Subterfuge speed by 40% and Charisma speed by 20%", icon: "🗡️",
    },
    {
        enum: PerkType.MinorTimeCompression, name: "Minor Time Compression", tooltip: "Tasks that are completed instantly (in a single tick) now cost 80% less energy", icon: "✨",
    },
    {
        enum: PerkType.Zone9, name: "Placeholder", tooltip: "???", icon: "?",
    },
    {
        enum: PerkType.Zone10, name: "Placeholder", tooltip: "???", icon: "?",
    },
]
