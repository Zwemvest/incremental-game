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

    Count
}

export enum TaskType {
    Normal,
    Travel,
    Mandatory,
    Boss,
}

export class TaskDefinition {
    name = "";
    type = TaskType.Normal;
    cost_multiplier: number = 1;
    skills: SkillType[] = [];
    xp_mult: number = 1;
    item: ItemType = ItemType.Count;
    perk: PerkType = PerkType.Count;
    max_reps: number = 1;

    constructor(overrides: Partial<TaskDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export class Task {
    definition: TaskDefinition;
    progress: number = 0;
    reps: number = 0;
    enabled: boolean = true;

    constructor(definition: TaskDefinition) {
        this.definition = definition;
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
            new TaskDefinition({ name: "Join the Watch", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ name: "Read Noticeboard", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Study] }),
            new TaskDefinition({ name: "Train with Weapons", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Combat] }),
            new TaskDefinition({ name: "Learn How to Read", skills: [SkillType.Study], perk:PerkType.Reading }),
            new TaskDefinition({ name: "Beg for Money", max_reps: 5, skills: [SkillType.Charisma], xp_mult: 2, item: ItemType.Coin }),
            new TaskDefinition({ name: "Hide and Seek", cost_multiplier: 4, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ name: "Observe Surroundings", cost_multiplier: 4, skills: [SkillType.Study], xp_mult: 3 }),
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            new TaskDefinition({ name: "Notice Smoke in the Distance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Survival] }),
            new TaskDefinition({ name: "Learn Routines", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Study] }),
            new TaskDefinition({ name: "Deal with Drunkards", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Charisma] }),
            new TaskDefinition({ name: "Chit-chat", skills: [SkillType.Charisma], xp_mult: 2 }),
            new TaskDefinition({ name: "Sparring", cost_multiplier: 4, skills: [SkillType.Combat] }),
            new TaskDefinition({ name: "Fletch Arrows", max_reps: 5, skills: [SkillType.Crafting], item: ItemType.Arrow }),
            new TaskDefinition({ name: "Prepare Travel Supplies", cost_multiplier: 4, skills: [SkillType.Travel, SkillType.Survival] }),
            new TaskDefinition({ name: "PERK PLACEHOLDER", cost_multiplier: 4, skills: [SkillType.Travel, SkillType.Survival], perk:PerkType.Zone2Placeholder }),
        ],
    },
    {
        name: "The Raid",
        tasks: [
            new TaskDefinition({ name: "Enter the Wilderness", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel] }),
            new TaskDefinition({ name: "Fight a Goblin", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Combat] }),
            new TaskDefinition({ name: "Warn Villagers", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Charisma] }),
            new TaskDefinition({ name: "Salvage Food", max_reps: 5, skills: [SkillType.Search], item: ItemType.Food }),
            new TaskDefinition({ name: "Rescue Villager", cost_multiplier: 2, max_reps: 3, skills: [SkillType.Subterfuge, SkillType.Search], perk:PerkType.VillagerGratitude }),
            new TaskDefinition({ name: "Treat Villager Wounds", cost_multiplier: 4, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ name: "Goblin Warlord", type: TaskType.Boss, cost_multiplier: 4, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            new TaskDefinition({ name: "Find Cave Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel, SkillType.Search] }),
            new TaskDefinition({ name: "Look for Tracks", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ name: "Survive the Night", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Survival] }),
            new TaskDefinition({ name: "Find an Amulet", type: TaskType.Mandatory, cost_multiplier: 4, skills: [SkillType.Search, SkillType.Magic], perk:PerkType.Amulet }),
            new TaskDefinition({ name: "Build a Fire", cost_multiplier: 4, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ name: "Forage for Mushrooms", max_reps: 5, skills: [SkillType.Search], item: ItemType.Mushroom }),
            new TaskDefinition({ name: "Befried a Deer", cost_multiplier: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ name: "FOREST CREATURE PLACEHOLDER", type: TaskType.Boss, cost_multiplier: 4, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            new TaskDefinition({ name: "Leave Via Back Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel] }),
            new TaskDefinition({ name: "Find a Way Through", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Search] }),
            new TaskDefinition({ name: "Rescue Captives", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Charisma, SkillType.Subterfuge] }),
            new TaskDefinition({ name: "Steal Supplies", max_reps: 5, skills: [SkillType.Subterfuge], item: ItemType.GoblinSupplies }),
            new TaskDefinition({ name: "Try Casting a Spell", cost_multiplier: 3, max_reps: 6, skills: [SkillType.Magic, SkillType.Study], perk:PerkType.EnergySpell }),
            new TaskDefinition({ name: "Inspect Wall Paitings", cost_multiplier: 4, skills: [SkillType.Study] }),
            new TaskDefinition({ name: "Goblin Chieftain", type: TaskType.Boss, cost_multiplier: 4, skills: [SkillType.Combat] }),
        ],
    },
]

