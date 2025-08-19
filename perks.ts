export enum PerkType {
    Reading,
    Writing,
    VillagerGratitude,
    Amulet,
    EnergySpell,
    ExperiencedTraveler,
    UndergroundConnection,
    MinorTimeCompression,
    HighAltitudeClimbing,
    DeepTrance,
    VillageHero,
    Attunement,
    GoblinScourge,
    SunkenTreasure,
    LostTemple,
    WalkWithoutRhythm,
    ReflectionsOnTheJourney,
    PurgedBureaucracy,
    DeepSeaDiving,
    EnergeticMemory,

    Count
}

export class PerkDefinition {
    enum = PerkType.Count;
    name = "";
    tooltip = "";
    icon = "";
}

export const ENERGETIC_MEMORY_MULT = 0.1;

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
        enum: PerkType.MinorTimeCompression, name: "Minor Time Compression", tooltip: "Tasks that are completed instantly (in a single tick) now cost 80% less energy", icon: "⌚",
    },
    {
        enum: PerkType.HighAltitudeClimbing, name: "High Altitude Climbing", tooltip: "Reduces all Energy consumption 20%", icon: "🗻",
    },
    {
        enum: PerkType.DeepTrance, name: "Deep Trance", tooltip: "Unlocks Zone Automation<br>Unlocks automatic Item use", icon: "💫",
    },
    {
        enum: PerkType.VillageHero, name: "Village Hero", tooltip: "Improves Charisma speed by 20% and Combat speed by 20%", icon: "🎖️",
    },
    {
        enum: PerkType.Attunement, name: "Attunement", tooltip: "Unlocks the Attunement mechanic", icon: "🌀",
    },
    {
        enum: PerkType.GoblinScourge, name: "Goblin Scourge", tooltip: "Improves Combat speed by 30% and Fortitude speed by 30%", icon: "💀",
    },
    {
        enum: PerkType.SunkenTreasure, name: "Sunken Treasure", tooltip: "Improves Survival speed by 30% and Fortitude speed by 30%", icon: "⚓",
    },
    {
        enum: PerkType.LostTemple, name: "Found Lost Temple", tooltip: "Improves Druid speed by 50%", icon: "🏯",
    },
    {
        enum: PerkType.WalkWithoutRhythm, name: "Walk Without Rhythm", tooltip: "Improves Subterfuge speed by 40% and Travel speed by 20%", icon: "👣",
    },
    {
        enum: PerkType.ReflectionsOnTheJourney, name: "Reflections on the Journey", tooltip: "Reduce Energy drain based on the highest zone reached<br>In each zone energy consumption is reduced 5% compounding for each zone you've reached past it<br>So zone 12 has energy cost multiplied by 0.95^2 if the highest zone reached is 14", icon: "🕰️",
    },
    {
        enum: PerkType.PurgedBureaucracy, name: "Purged Bureaucracy", tooltip: "Improves Charisma and Crafting speed by 30%", icon: "⚖️",
    },
    {
        enum: PerkType.DeepSeaDiving, name: "Deep Sea Diving", tooltip: "Improves Search and Druid speed by 30%", icon: "🤿",
    },
    {
        enum: PerkType.EnergeticMemory, name: "Energetic Memory", tooltip: "On each Energy Reset, increase max Energy by the current zone / 10<br>So zone 11 gives 1.1 max Energy", icon: "💭",
    },
]
