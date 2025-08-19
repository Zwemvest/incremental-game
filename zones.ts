import { ItemType } from "./items.js";
import { PerkType } from "./perks.js";

export enum SkillType {
    Charisma,
    Study,
    Combat,
    Search,
    Subterfuge,
    Crafting,
    Survival,
    Travel,
    Magic,
    Fortitude,
    Druid,
    Ascension,

    Count
}

export class SkillDefinition {
    type: SkillType = SkillType.Count;
    name = "";
    xp_needed_mult = 1.0;

    constructor(overrides: Partial<SkillDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    new SkillDefinition({ type: SkillType.Charisma, name: "Charisma" }),
    new SkillDefinition({ type: SkillType.Study, name: "Study" }),
    new SkillDefinition({ type: SkillType.Combat, name: "Combat" }),
    new SkillDefinition({ type: SkillType.Search, name: "Search" }),
    new SkillDefinition({ type: SkillType.Subterfuge, name: "Subterfuge" }),
    new SkillDefinition({ type: SkillType.Crafting, name: "Crafting" }),
    new SkillDefinition({ type: SkillType.Survival, name: "Survival" }),
    new SkillDefinition({ type: SkillType.Travel, name: "Travel" }),
    new SkillDefinition({ type: SkillType.Magic, name: "Magic", xp_needed_mult: 3 }),
    new SkillDefinition({ type: SkillType.Fortitude, name: "Fortitude", xp_needed_mult: 10 }),
    new SkillDefinition({ type: SkillType.Druid, name: "Druid", xp_needed_mult: 20 }),
    new SkillDefinition({ type: SkillType.Ascension, name: "Ascension", xp_needed_mult: 1000 }),
]

export enum TaskType {
    Normal,
    Travel,
    Mandatory,
    Prestige,
    Boss,
}

export class TaskDefinition {
    id = 0;
    name = "";
    type = TaskType.Normal;
    cost_multiplier: number = 1;
    skills: SkillType[] = [];
    xp_mult: number = 1;
    item: ItemType = ItemType.Count;
    perk: PerkType = PerkType.Count;
    max_reps: number = 1;
    hidden_by_default = false;
    unlocks_task: number = -1;
    zone_id: number = 0;

    constructor(overrides: Partial<TaskDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export class Task {
    task_definition: TaskDefinition;
    progress: number = 0;
    reps: number = 0;
    enabled: boolean = true;
    hasted: boolean = false;

    constructor(definition: TaskDefinition) {
        this.task_definition = definition;
    }
}

export class Zone {
    name: string = "";
    tasks: TaskDefinition[] = [];
}

export const ZONES: Zone[] = [
    {
        name: "The Village",
        tasks: [
            new TaskDefinition({ id: 10, name: "Join the Watch", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 11, name: "Read Noticeboard", type: TaskType.Mandatory, cost_multiplier: 3, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 12, name: "Train with Weapons", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 3, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 13, name: "Learn How to Read", cost_multiplier: 8, xp_mult: 0.5, skills: [SkillType.Study], perk: PerkType.Reading }),
            new TaskDefinition({ id: 14, name: "Beg for Food", max_reps: 10, skills: [SkillType.Charisma], xp_mult: 2, item: ItemType.Food }),
            new TaskDefinition({ id: 15, name: "Hide and Seek", cost_multiplier: 2, xp_mult: 1.5, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 16, name: "Observe Surroundings", cost_multiplier: 1, max_reps: 5, skills: [SkillType.Study], xp_mult: 3 }),
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            new TaskDefinition({ id: 20, name: "Notice Smoke in the Distance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Survival] }),
            new TaskDefinition({ id: 21, name: "Learn Routines", type: TaskType.Mandatory, cost_multiplier: 1.5, max_reps: 4, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 22, name: "Deal with Drunkards", type: TaskType.Mandatory, cost_multiplier: 2, max_reps: 2, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 25, name: "Fletch Arrows", max_reps: 5, cost_multiplier: 0.5, skills: [SkillType.Crafting], item: ItemType.Arrow }),
            new TaskDefinition({ id: 27, name: "Learn How to Write", cost_multiplier: 25, xp_mult: 0.2, skills: [SkillType.Study], perk: PerkType.Writing }),
            new TaskDefinition({ id: 23, name: "Chit-chat", max_reps: 3, skills: [SkillType.Charisma], xp_mult: 2 }),
            new TaskDefinition({ id: 24, name: "Sparring", cost_multiplier: 1.5, max_reps: 4, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 26, name: "Prepare Travel Supplies", cost_multiplier: 1, max_reps: 6, xp_mult: 3, skills: [SkillType.Travel, SkillType.Survival] }),
        ],
    },
    {
        name: "The Raid",
        tasks: [
            new TaskDefinition({ id: 30, name: "Enter the Wilderness", type: TaskType.Travel, cost_multiplier: 3, xp_mult: 0.5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 31, name: "Fight a Goblin", type: TaskType.Mandatory, cost_multiplier: 5, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 32, name: "Warn Villagers", type: TaskType.Mandatory, cost_multiplier: 4, max_reps: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 33, name: "Loot the Fallen", max_reps: 4, cost_multiplier: 0.8, skills: [SkillType.Search], item: ItemType.Coin }),
            new TaskDefinition({ id: 34, name: "Rescue Villager", cost_multiplier: 1.5, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Subterfuge, SkillType.Search], perk: PerkType.VillagerGratitude }),
            new TaskDefinition({ id: 35, name: "Treat Villager Wounds", cost_multiplier: 2, max_reps: 3, xp_mult: 3, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ id: 36, name: "Goblin Warlord", type: TaskType.Boss, cost_multiplier: 2000, skills: [SkillType.Combat], xp_mult: 0.3, item: ItemType.GoblinWaraxe, unlocks_task: 37 }),
            new TaskDefinition({ id: 37, name: "Save the Village", max_reps: 1, cost_multiplier: 2000, skills: [SkillType.Combat, SkillType.Magic], perk: PerkType.VillageHero, hidden_by_default: true }),
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            new TaskDefinition({ id: 40, name: "Find Cave Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel, SkillType.Search] }),
            new TaskDefinition({ id: 41, name: "Look for Tracks", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 42, name: "Survive the Night", type: TaskType.Mandatory, cost_multiplier: 5, skills: [SkillType.Survival] }),
            new TaskDefinition({ id: 43, name: "Find an Amulet", type: TaskType.Mandatory, cost_multiplier: 5, xp_mult: 0.1, skills: [SkillType.Search, SkillType.Magic], perk: PerkType.Amulet }),
            new TaskDefinition({ id: 45, name: "Forage for Mushrooms", max_reps: 5, xp_mult: 2, cost_multiplier: 0.6, skills: [SkillType.Search], item: ItemType.Mushroom }),
            new TaskDefinition({ id: 44, name: "Build a Fire", cost_multiplier: 4, xp_mult: 3, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ id: 46, name: "Befried a Deer", cost_multiplier: 4, xp_mult: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 47, name: "Angry Ent", type: TaskType.Boss, cost_multiplier: 25000, skills: [SkillType.Combat], xp_mult: 0.3, unlocks_task: 48, item: ItemType.MagicalRoots }),
            new TaskDefinition({ id: 48, name: "Gather Magical Roots", cost_multiplier: 30, max_reps: 3, skills: [SkillType.Search], item: ItemType.MagicalRoots, hidden_by_default: true }),
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            new TaskDefinition({ id: 50, name: "Leave Via Back Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 51, name: "Find a Way Through", type: TaskType.Mandatory, cost_multiplier: 4, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 52, name: "Rescue Captives", type: TaskType.Mandatory, cost_multiplier: 4, max_reps: 3, skills: [SkillType.Charisma, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 53, name: "Steal Supplies", max_reps: 5, cost_multiplier: 0.75, skills: [SkillType.Subterfuge], item: ItemType.GoblinSupplies }),
            new TaskDefinition({ id: 54, name: "Try Casting a Spell", cost_multiplier: 7, max_reps: 6, skills: [SkillType.Magic, SkillType.Study], perk: PerkType.EnergySpell }),
            new TaskDefinition({ id: 55, name: "Inspect Wall Paitings", cost_multiplier: 4, xp_mult: 4, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 56, name: "Scout the Cave", cost_multiplier: 1, max_reps: 3, xp_mult: 3, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 57, name: "Goblin Chieftain", type: TaskType.Boss, cost_multiplier: 20000, skills: [SkillType.Combat], xp_mult: 0.3, unlocks_task: 58, item: ItemType.GoblinTreasure }),
            new TaskDefinition({ id: 58, name: "Wipe Out Goblins", cost_multiplier: 20000, skills: [SkillType.Combat], xp_mult: 0.3, hidden_by_default: true, perk: PerkType.GoblinScourge }),
        ],
    },
    {
        name: "The Road to the City",
        tasks: [
            new TaskDefinition({ id: 60, name: "Get to the City", type: TaskType.Travel, cost_multiplier: 9, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 61, name: "Join a Caravan", type: TaskType.Mandatory, cost_multiplier: 12, xp_mult: 0.5, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 62, name: "Scout the Road Ahead", type: TaskType.Mandatory, cost_multiplier: 4, max_reps: 3, skills: [SkillType.Study, SkillType.Search, SkillType.Survival] }),
            new TaskDefinition({ id: 63, name: "Make Travel Equipment", max_reps: 4, cost_multiplier: 1.5, skills: [SkillType.Crafting], item: ItemType.TravelEquipment }),
            new TaskDefinition({ id: 64, name: "Get Used to Traveling", cost_multiplier: 3, max_reps: 3, xp_mult: 3, skills: [SkillType.Travel, SkillType.Fortitude], perk: PerkType.ExperiencedTraveler }),
            new TaskDefinition({ id: 65, name: "Chat with Travelers", cost_multiplier: 3, max_reps: 4, xp_mult: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 66, name: "Practice Traveling Unnoticed", cost_multiplier: 6, max_reps: 1, xp_mult: 4, skills: [SkillType.Subterfuge, SkillType.Survival] }),
            new TaskDefinition({ id: 67, name: "Bandits", type: TaskType.Boss, cost_multiplier: 25000, skills: [SkillType.Combat], xp_mult: 0.3, item: ItemType.BanditWeapons, unlocks_task: 68 }),
            new TaskDefinition({ id: 68, name: "Loot Bandit Camp", cost_multiplier: 100, skills: [SkillType.Subterfuge, SkillType.Search], xp_mult: 3, max_reps: 4, item: ItemType.BanditWeapons, hidden_by_default: true }),
        ],
    },
    {
        name: "The City Outskirts",
        tasks: [
            new TaskDefinition({ id: 70, name: "Enter the City", type: TaskType.Travel, cost_multiplier: 6, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 71, name: "Bribe the City Guards", type: TaskType.Mandatory, cost_multiplier: 15, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 72, name: "Survive a Mugging", type: TaskType.Mandatory, cost_multiplier: 5, max_reps: 1, xp_mult: 0.5, skills: [SkillType.Combat, SkillType.Fortitude] }),
            new TaskDefinition({ id: 73, name: "Buy a Book", max_reps: 5, cost_multiplier: 5, skills: [SkillType.Charisma], item: ItemType.Book }),
            new TaskDefinition({ id: 74, name: "Negotiate with a Rogue Guard Captain", cost_multiplier: 50, max_reps: 1, xp_mult: 0.3, skills: [SkillType.Charisma, SkillType.Subterfuge], perk: PerkType.UndergroundConnection }),
            new TaskDefinition({ id: 75, name: "Spar with the Guards", cost_multiplier: 3, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 76, name: "Fend for Yourself", cost_multiplier: 3, max_reps: 1, xp_mult: 4, skills: [SkillType.Survival, SkillType.Fortitude] }),
            new TaskDefinition({ id: 77, name: "Skulk About", cost_multiplier: 8, skills: [SkillType.Subterfuge], xp_mult: 5 }),
        ],
    },
    {
        name: "The City",
        tasks: [
            new TaskDefinition({ id: 80, name: "Embark on a Quest", type: TaskType.Travel, cost_multiplier: 22, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 81, name: "Investigate Rumors of a Great Magician", type: TaskType.Mandatory, cost_multiplier: 8, max_reps: 4, skills: [SkillType.Charisma, SkillType.Search] }),
            new TaskDefinition({ id: 82, name: "Search the Archives for Magic Spells", type: TaskType.Mandatory, cost_multiplier: 6, max_reps: 5, skills: [SkillType.Study, SkillType.Search] }),
            new TaskDefinition({ id: 83, name: "Scribe Scroll of Haste", max_reps: 1, cost_multiplier: 10, skills: [SkillType.Crafting, SkillType.Magic], item: ItemType.ScrollOfHaste }),
            new TaskDefinition({ id: 84, name: "Cast a Spell", cost_multiplier: 5, max_reps: 6, xp_mult: 0.2, skills: [SkillType.Magic], perk: PerkType.MinorTimeCompression }),
            new TaskDefinition({ id: 85, name: "Study at the Mage's Guild", cost_multiplier: 10, xp_mult: 2, skills: [SkillType.Study, SkillType.Magic] }),
            new TaskDefinition({ id: 88, name: "Figure Out How to Attune", cost_multiplier: 1500, xp_mult: 0.1, skills: [SkillType.Study, SkillType.Magic], perk: PerkType.Attunement }),
            new TaskDefinition({ id: 86, name: "Train for Your Quest", cost_multiplier: 6, max_reps: 3, xp_mult: 3, skills: [SkillType.Search, SkillType.Survival, SkillType.Fortitude] }),
            new TaskDefinition({ id: 87, name: "Corrupt Mayor", type: TaskType.Boss, cost_multiplier: 50000, skills: [SkillType.Combat], xp_mult: 0.3, item: ItemType.CityChain, unlocks_task: 89 }),
            new TaskDefinition({ id: 89, name: "Purge Corrupt Bureacracy", cost_multiplier: 500000, skills: [SkillType.Study, SkillType.Subterfuge], xp_mult: 0.02, perk: PerkType.PurgedBureaucracy, hidden_by_default: true }),
        ],
    },
    {
        name: "The Forest",
        tasks: [
            new TaskDefinition({ id: 90, name: "Scale the Mountain", type: TaskType.Travel, cost_multiplier: 12, skills: [SkillType.Travel, SkillType.Fortitude], perk: PerkType.HighAltitudeClimbing }),
            new TaskDefinition({ id: 91, name: "Locate the Mountain", type: TaskType.Mandatory, cost_multiplier: 10, skills: [SkillType.Survival, SkillType.Search] }),
            new TaskDefinition({ id: 92, name: "Make Climbing Gear", type: TaskType.Mandatory, cost_multiplier: 2, max_reps: 3, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 93, name: "Create Firemaking Kit", max_reps: 3, cost_multiplier: 0.75, skills: [SkillType.Crafting, SkillType.Survival], item: ItemType.FiremakingKit }),
            new TaskDefinition({ id: 94, name: "Prepare to Scale the Mountain", cost_multiplier: 7, max_reps: 3, xp_mult: 4, skills: [SkillType.Survival, SkillType.Study, SkillType.Fortitude] }),
            new TaskDefinition({ id: 95, name: "Build a Hut", cost_multiplier: 10, xp_mult: 3, skills: [SkillType.Crafting, SkillType.Survival] }),
            new TaskDefinition({ id: 96, name: "Go Sightseeing", cost_multiplier: 2, max_reps: 3, xp_mult: 3, skills: [SkillType.Search, SkillType.Travel] }),
            new TaskDefinition({ id: 97, name: "Meet a Magical Creature", cost_multiplier: 2, max_reps: 1, xp_mult: 3, skills: [SkillType.Druid, SkillType.Charisma] }),
            new TaskDefinition({ id: 98, name: "Werewolf", type: TaskType.Boss, cost_multiplier: 100000, skills: [SkillType.Combat], xp_mult: 0.3, item: ItemType.WerewolfFur, unlocks_task: 99 }),
            new TaskDefinition({ id: 99, name: "Gather Shed Fur from Werewolf Lair", cost_multiplier: 50, max_reps: 3, skills: [SkillType.Subterfuge], item: ItemType.WerewolfFur, hidden_by_default: true }),
        ],
    },
    {
        name: "The Magician's Mountain",
        tasks: [
            new TaskDefinition({ id: 100, name: "Hunt for the First Reagent", type: TaskType.Travel, cost_multiplier: 37, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 101, name: "Convince the Magician", type: TaskType.Mandatory, cost_multiplier: 50, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 102, name: "Do a Favor", type: TaskType.Mandatory, cost_multiplier: 8, max_reps: 1, skills: [SkillType.Crafting, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 103, name: "Steal Some Reagents", max_reps: 4, cost_multiplier: 1, skills: [SkillType.Subterfuge], item: ItemType.Reagents }),
            new TaskDefinition({ id: 104, name: "Learn Magical Trance", cost_multiplier: 20, max_reps: 6, xp_mult: 0.2, skills: [SkillType.Magic, SkillType.Study], perk: PerkType.DeepTrance }),
            new TaskDefinition({ id: 105, name: "Give Yourself a Pep Talk", cost_multiplier: 10, xp_mult: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 106, name: "Try to Transform Into an Eagle", cost_multiplier: 10, xp_mult: 4, skills: [SkillType.Druid, SkillType.Magic] }),
            new TaskDefinition({ id: 107, name: "Low-oxygen Exercise", cost_multiplier: 3, max_reps: 5, xp_mult: 4, skills: [SkillType.Fortitude, SkillType.Survival] }),
        ],
    },
    {
        name: "The Ocean",
        tasks: [
            new TaskDefinition({ id: 110, name: "Land on Island", type: TaskType.Travel, cost_multiplier: 30, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 111, name: "Weather a Storm", type: TaskType.Mandatory, cost_multiplier: 20, skills: [SkillType.Survival, SkillType.Fortitude] }),
            new TaskDefinition({ id: 112, name: "Find the Island", type: TaskType.Mandatory, cost_multiplier: 8, max_reps: 1, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 113, name: "Catch Fish", max_reps: 5, cost_multiplier: 4, xp_mult: 4, skills: [SkillType.Survival], item: ItemType.Fish }),
            new TaskDefinition({ id: 114, name: "Dive as a Squid", cost_multiplier: 15, max_reps: 3, xp_mult: 0.5, skills: [SkillType.Druid, SkillType.Search], perk: PerkType.SunkenTreasure }),
            new TaskDefinition({ id: 115, name: "Look for Land", cost_multiplier: 5, max_reps: 3, xp_mult: 8, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 116, name: "Practice Transforming", cost_multiplier: 10, xp_mult: 4, skills: [SkillType.Druid] }),
            new TaskDefinition({ id: 117, name: "Kraken", type: TaskType.Boss, cost_multiplier: 150000, xp_mult: 0.2, skills: [SkillType.Combat], item:ItemType.Calamari, unlocks_task: 118 }),
            new TaskDefinition({ id: 118, name: "Explore Kraken's Lair", cost_multiplier: 250000, skills: [SkillType.Search, SkillType.Druid], xp_mult: 0.1, perk:PerkType.DeepSeaDiving, hidden_by_default: true }),
        ],
    },
    {
        name: "The Island",
        tasks: [
            new TaskDefinition({ id: 120, name: "Hunt for the Second Reagent", type: TaskType.Travel, cost_multiplier: 90, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 121, name: "Gather Reagent", type: TaskType.Mandatory, cost_multiplier: 10, max_reps: 3, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 122, name: "Repair Ship", type: TaskType.Mandatory, cost_multiplier: 15, max_reps: 1, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 123, name: "Catch More Fish", max_reps: 4, cost_multiplier: 10, skills: [SkillType.Survival], item: ItemType.Fish }),
            new TaskDefinition({ id: 124, name: "Explore the Jungle", cost_multiplier: 70, max_reps: 6, skills: [SkillType.Survival, SkillType.Search, SkillType.Travel], perk: PerkType.LostTemple }),
            new TaskDefinition({ id: 125, name: "Build Another Hut", cost_multiplier: 25, max_reps: 1, xp_mult: 4, skills: [SkillType.Crafting, SkillType.Survival] }),
            new TaskDefinition({ id: 126, name: "Talk to the Local Wildlife", cost_multiplier: 25, max_reps: 3, xp_mult: 2, skills: [SkillType.Druid, SkillType.Charisma] }),
            new TaskDefinition({ id: 127, name: "PLACEHOLDER", type: TaskType.Boss, cost_multiplier: 2500000, xp_mult: 0.2, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Desert",
        tasks: [
            new TaskDefinition({ id: 130, name: "Enter the Oasis", type: TaskType.Travel, cost_multiplier: 100, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 131, name: "Overcome Mirage", type: TaskType.Mandatory, cost_multiplier: 100, max_reps: 1, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 132, name: "Find the Oasis", type: TaskType.Mandatory, cost_multiplier: 15, max_reps: 1, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 133, name: "Harvest Cactus", max_reps: 3, cost_multiplier: 12, skills: [SkillType.Survival, SkillType.Crafting], item: ItemType.Cactus }),
            new TaskDefinition({ id: 134, name: "Avoid Notice by the Sandworm", cost_multiplier: 15, max_reps: 5, skills: [SkillType.Subterfuge], perk: PerkType.WalkWithoutRhythm }),
            new TaskDefinition({ id: 135, name: "Work on Your Tan", cost_multiplier: 15, max_reps: 3, xp_mult: 15, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 136, name: "Comb the Desert", cost_multiplier: 25, max_reps: 6, xp_mult: 10, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 137, name: "Giant Sandworm", type: TaskType.Boss, cost_multiplier: 2500000, xp_mult: 0.2, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Oasis",
        tasks: [
            new TaskDefinition({ id: 140, name: "Return to the Magician", type: TaskType.Travel, cost_multiplier: 150, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 141, name: "Banish Evil Spirit", type: TaskType.Mandatory, cost_multiplier: 5000, max_reps: 3, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 142, name: "Gather Second Reagent", type: TaskType.Mandatory, cost_multiplier: 25, max_reps: 5, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 143, name: "Bottle Oasis Water", max_reps: 4, cost_multiplier: 20, skills: [SkillType.Survival], item: ItemType.OasisWater }),
            new TaskDefinition({ id: 144, name: "Reflect on the Journey", cost_multiplier: 600, max_reps: 5, skills: [SkillType.Study], perk: PerkType.ReflectionsOnTheJourney }),
            new TaskDefinition({ id: 145, name: "Prepare for the Journey Ahead", cost_multiplier: 50, max_reps: 3, xp_mult: 5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 146, name: "Frolic in the Water", cost_multiplier: 600, max_reps: 1, xp_mult: 10, skills: [SkillType.Druid] }),
            new TaskDefinition({ id: 147, name: "PLACEHOLDER", type: TaskType.Boss, cost_multiplier: 2500000, xp_mult: 0.2, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Ritual",
        tasks: [
            new TaskDefinition({ id: 150, name: "Begin Search for the Next Ritual", type: TaskType.Travel, cost_multiplier: 1500, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 151, name: "Apologize for Stealing Reagents", type: TaskType.Mandatory, cost_multiplier: 500, max_reps: 1, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 152, name: "Rest for a While", type: TaskType.Mandatory, cost_multiplier: 250, max_reps: 5, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 153, name: "Touch the Divine", type: TaskType.Prestige, max_reps: 1, cost_multiplier: 0.75, skills: [SkillType.Ascension] }),
            new TaskDefinition({ id: 154, name: "Infuse Magical Incense", max_reps: 9, cost_multiplier: 2000, skills: [SkillType.Magic], item: ItemType.MagicalIncense }),
            new TaskDefinition({ id: 155, name: "Practice Memorization", cost_multiplier: 1000000, max_reps: 5, skills: [SkillType.Study, SkillType.Magic], perk: PerkType.EnergeticMemory, xp_mult: 0.05 }),
            new TaskDefinition({ id: 156, name: "Guided Spellcasting", cost_multiplier: 2500, max_reps: 3, xp_mult: 10, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 157, name: "Go for a Walk", cost_multiplier: 100, max_reps: 1, xp_mult: 5, skills: [SkillType.Search, SkillType.Travel] }),
        ],
    },
]

ZONES.forEach((zone, index) => {
    for (var task of zone.tasks) {
        task.zone_id = index;
    }
});

export var TASK_LOOKUP: Map<number, TaskDefinition> = new Map();

ZONES.forEach((zone) => {
    for (var task of zone.tasks) {
        TASK_LOOKUP.set(task.id, task);
    }
});
