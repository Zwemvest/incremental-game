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
    id = 0;
    name = "";
    type = TaskType.Normal;
    cost_multiplier: number = 1;
    skills: SkillType[] = [];
    xp_mult: number = 1;
    item: ItemType = ItemType.Count;
    perk: PerkType = PerkType.Count;
    max_reps: number = 1;
    zone_id: number = 0;

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
            new TaskDefinition({ id: 23, name: "Chit-chat", max_reps: 3, skills: [SkillType.Charisma], xp_mult: 2 }),
            new TaskDefinition({ id: 24, name: "Sparring", cost_multiplier: 1.5, max_reps: 4, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 25, name: "Fletch Arrows", max_reps: 5, cost_multiplier: 0.5, skills: [SkillType.Crafting], item: ItemType.Arrow }),
            new TaskDefinition({ id: 26, name: "Prepare Travel Supplies", cost_multiplier: 1, max_reps: 6, xp_mult: 3, skills: [SkillType.Travel, SkillType.Survival] }),
            new TaskDefinition({ id: 27, name: "Learn How to Write", cost_multiplier: 25, xp_mult: 0.2, skills: [SkillType.Study], perk: PerkType.Writing }),
        ],
    },
    {
        name: "The Raid",
        tasks: [
            new TaskDefinition({ id: 30, name: "Enter the Wilderness", type: TaskType.Travel, cost_multiplier: 3, xp_mult: 0.5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 31, name: "Fight a Goblin", type: TaskType.Mandatory, cost_multiplier: 5, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 32, name: "Warn Villagers", type: TaskType.Mandatory, cost_multiplier: 2.5, max_reps: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 33, name: "Loot the Fallen", max_reps: 5, cost_multiplier: 0.8, skills: [SkillType.Search], item: ItemType.Coin }),
            new TaskDefinition({ id: 34, name: "Rescue Villager", cost_multiplier: 1.5, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Subterfuge, SkillType.Search], perk: PerkType.VillagerGratitude }),
            new TaskDefinition({ id: 35, name: "Treat Villager Wounds", cost_multiplier: 2, max_reps: 3, xp_mult: 3, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ id: 36, name: "Goblin Warlord", type: TaskType.Boss, cost_multiplier: 1000, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            new TaskDefinition({ id: 40, name: "Find Cave Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel, SkillType.Search] }),
            new TaskDefinition({ id: 41, name: "Look for Tracks", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 42, name: "Survive the Night", type: TaskType.Mandatory, cost_multiplier: 5, skills: [SkillType.Survival] }),
            new TaskDefinition({ id: 43, name: "Find an Amulet", type: TaskType.Mandatory, cost_multiplier: 3, xp_mult: 0.1, skills: [SkillType.Search, SkillType.Magic], perk: PerkType.Amulet }),
            new TaskDefinition({ id: 44, name: "Build a Fire", cost_multiplier: 4, xp_mult: 3, skills: [SkillType.Survival, SkillType.Crafting] }),
            new TaskDefinition({ id: 45, name: "Forage for Mushrooms", max_reps: 5, xp_mult: 2, cost_multiplier: 0.6, skills: [SkillType.Search], item: ItemType.Mushroom }),
            new TaskDefinition({ id: 46, name: "Befried a Deer", cost_multiplier: 4, xp_mult: 2, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 47, name: "FOREST CREATURE PLACEHOLDER", type: TaskType.Boss, cost_multiplier: 100, skills: [SkillType.Combat] }),
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            new TaskDefinition({ id: 50, name: "Leave Via Back Entrance", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 51, name: "Find a Way Through", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 52, name: "Rescue Captives", type: TaskType.Mandatory, cost_multiplier: 4, max_reps: 3, skills: [SkillType.Charisma, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 53, name: "Steal Supplies", max_reps: 5, cost_multiplier: 0.75, skills: [SkillType.Subterfuge], item: ItemType.GoblinSupplies }),
            new TaskDefinition({ id: 54, name: "Try Casting a Spell", cost_multiplier: 5, max_reps: 6, skills: [SkillType.Magic, SkillType.Study], perk: PerkType.EnergySpell }),
            new TaskDefinition({ id: 55, name: "Inspect Wall Paitings", cost_multiplier: 4, xp_mult: 2, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 56, name: "Scout the Cave", cost_multiplier: 1, max_reps: 3, xp_mult: 3, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 57, name: "Goblin Chieftain", type: TaskType.Boss, cost_multiplier: 100, skills: [SkillType.Combat] }),
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
