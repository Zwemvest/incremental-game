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
            { name: "Join the Watch", type: TaskType.Travel, max_progress: 100, skills: [Skill.Charisma], xp_mult:1 },
            { name: "Read Noticeboard", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study], xp_mult:1 },
            { name: "Train with Weapons", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat], xp_mult:1 },
            { name: "Learn How to Read", type: TaskType.Normal, max_progress: 25, skills: [Skill.Study], xp_mult:1 },
            { name: "Beg for Money", type: TaskType.Normal, max_progress: 100, skills: [Skill.Charisma], xp_mult:2 },
            { name: "Hide and Seek", type: TaskType.Normal, max_progress: 100, skills: [Skill.Search, Skill.Subterfuge], xp_mult:1 },
            { name: "Observe Surroundings", type: TaskType.Normal, max_progress: 100, skills: [Skill.Study], xp_mult:3 },
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            { name: "Notice Smoke in the Distance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Survival], xp_mult:1 },
            { name: "Learn Routines", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study], xp_mult:1 },
            { name: "Deal with Drunkards", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma], xp_mult:1 },
            { name: "Chit-chat", type: TaskType.Normal, max_progress: 25, skills: [Skill.Charisma], xp_mult:2 },
            { name: "Sparring", type: TaskType.Normal, max_progress: 100, skills: [Skill.Combat], xp_mult:1 },
            { name: "Fletch Arrows", type: TaskType.Normal, max_progress: 100, skills: [Skill.Crafting], xp_mult:1 },
            { name: "Prepare Travel Supplies", type: TaskType.Normal, max_progress: 100, skills: [Skill.Travel, Skill.Survival], xp_mult:1 },
            { name: "PERK PLACEHOLDER", type: TaskType.Normal, max_progress: 100, skills: [Skill.Travel, Skill.Survival], xp_mult:1 },
        ],
    },
    {
        name: "The Raid",
        tasks: [
            { name: "Enter the Wilderness", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel], xp_mult:1 },
            { name: "Fight a Goblin", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat], xp_mult:1 },
            { name: "Warn Villagers", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma], xp_mult:1 },
            { name: "Salvage Food", type: TaskType.Normal, max_progress: 25, skills: [Skill.Search], xp_mult:1 },
            { name: "Rescue Villager", type: TaskType.Normal, max_progress: 100, skills: [Skill.Subterfuge, Skill.Search], xp_mult:1 },
            { name: "Treat Villager Wounds", type: TaskType.Normal, max_progress: 100, skills: [Skill.Survival, Skill.Crafting], xp_mult:1 },
            { name: "Goblin Warlord", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat], xp_mult:1 },
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            { name: "Find Cave Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel, Skill.Search], xp_mult:1 },
            { name: "Look for Tracks", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search, Skill.Subterfuge], xp_mult:1 },
            { name: "Survive the Night", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Survival], xp_mult:1 },
            { name: "Find an Amulet", type: TaskType.Mandatory, max_progress: 25, skills: [Skill.Search, Skill.Magic], xp_mult:1 },
            { name: "Build a Fire", type: TaskType.Normal, max_progress: 100, skills: [Skill.Survival, Skill.Crafting], xp_mult:1 },
            { name: "Forage for Mushrooms", type: TaskType.Normal, max_progress: 100, skills: [Skill.Search], xp_mult:1 },
            { name: "Befried a Deer", type: TaskType.Normal, max_progress: 100, skills: [Skill.Charisma], xp_mult:1 },
            { name: "FOREST CREATURE PLACEHOLDER", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat], xp_mult:1 },
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            { name: "Leave Via Back Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel], xp_mult:1 },
            { name: "Find a Way Through", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search], xp_mult:1 },
            { name: "Rescue Captives", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma, Skill.Subterfuge], xp_mult:1 },
            { name: "Steal Supplies", type: TaskType.Normal, max_progress: 25, skills: [Skill.Subterfuge], xp_mult:1 },
            { name: "Try Casting a Spell", type: TaskType.Normal, max_progress: 100, skills: [Skill.Magic, Skill.Study], xp_mult:1 },
            { name: "Inspect Wall Paitings", type: TaskType.Normal, max_progress: 100, skills: [Skill.Study], xp_mult:1 },
            { name: "Goblin Chieftain", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat], xp_mult:1 },
        ],
    },
]

