import { Item } from "./items.js";

export enum Skill {
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
    max_progress = 0;
    skills: Skill[] = [];
    xp_mult: number = 1;
    item: Item = Item.Count;

    constructor(overrides: Partial<TaskDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export class Task {
    definition: TaskDefinition;
    progress: number = 0;
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
            new TaskDefinition({ name: "Join the Watch", type: TaskType.Travel, max_progress: 100, skills: [Skill.Charisma] }),
            new TaskDefinition({ name: "Read Noticeboard", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study] }),
            new TaskDefinition({ name: "Train with Weapons", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat] }),
            new TaskDefinition({ name: "Learn How to Read", max_progress: 25, skills: [Skill.Study] }),
            new TaskDefinition({ name: "Beg for Money", max_progress: 100, skills: [Skill.Charisma], xp_mult: 2, item: Item.Coin }),
            new TaskDefinition({ name: "Hide and Seek", max_progress: 100, skills: [Skill.Search, Skill.Subterfuge] }),
            new TaskDefinition({ name: "Observe Surroundings", max_progress: 100, skills: [Skill.Study], xp_mult: 3 }),
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            new TaskDefinition({ name: "Notice Smoke in the Distance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Survival] }),
            new TaskDefinition({ name: "Learn Routines", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study] }),
            new TaskDefinition({ name: "Deal with Drunkards", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma] }),
            new TaskDefinition({ name: "Chit-chat", max_progress: 25, skills: [Skill.Charisma], xp_mult: 2 }),
            new TaskDefinition({ name: "Sparring", max_progress: 100, skills: [Skill.Combat] }),
            new TaskDefinition({ name: "Fletch Arrows", max_progress: 100, skills: [Skill.Crafting], item: Item.Arrow }),
            new TaskDefinition({ name: "Prepare Travel Supplies", max_progress: 100, skills: [Skill.Travel, Skill.Survival] }),
            new TaskDefinition({ name: "PERK PLACEHOLDER", max_progress: 100, skills: [Skill.Travel, Skill.Survival] }),
        ],
    },
    {
        name: "The Raid",
        tasks: [
            new TaskDefinition({ name: "Enter the Wilderness", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] }),
            new TaskDefinition({ name: "Fight a Goblin", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat] }),
            new TaskDefinition({ name: "Warn Villagers", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma] }),
            new TaskDefinition({ name: "Salvage Food", max_progress: 25, skills: [Skill.Search], item: Item.Food }),
            new TaskDefinition({ name: "Rescue Villager", max_progress: 100, skills: [Skill.Subterfuge, Skill.Search] }),
            new TaskDefinition({ name: "Treat Villager Wounds", max_progress: 100, skills: [Skill.Survival, Skill.Crafting] }),
            new TaskDefinition({ name: "Goblin Warlord", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] }),
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            new TaskDefinition({ name: "Find Cave Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel, Skill.Search] }),
            new TaskDefinition({ name: "Look for Tracks", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search, Skill.Subterfuge] }),
            new TaskDefinition({ name: "Survive the Night", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Survival] }),
            new TaskDefinition({ name: "Find an Amulet", type: TaskType.Mandatory, max_progress: 25, skills: [Skill.Search, Skill.Magic] }),
            new TaskDefinition({ name: "Build a Fire", max_progress: 100, skills: [Skill.Survival, Skill.Crafting] }),
            new TaskDefinition({ name: "Forage for Mushrooms", max_progress: 100, skills: [Skill.Search], item: Item.Mushroom }),
            new TaskDefinition({ name: "Befried a Deer", max_progress: 100, skills: [Skill.Charisma] }),
            new TaskDefinition({ name: "FOREST CREATURE PLACEHOLDER", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] }),
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            new TaskDefinition({ name: "Leave Via Back Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] }),
            new TaskDefinition({ name: "Find a Way Through", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search] }),
            new TaskDefinition({ name: "Rescue Captives", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma, Skill.Subterfuge] }),
            new TaskDefinition({ name: "Steal Supplies", max_progress: 25, skills: [Skill.Subterfuge], item: Item.GoblinSupplies }),
            new TaskDefinition({ name: "Try Casting a Spell", max_progress: 100, skills: [Skill.Magic, Skill.Study] }),
            new TaskDefinition({ name: "Inspect Wall Paitings", max_progress: 100, skills: [Skill.Study] }),
            new TaskDefinition({ name: "Goblin Chieftain", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] }),
        ],
    },
]

