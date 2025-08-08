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
}

export class Task {
    definition: TaskDefinition;
    progress: number = 0;

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
            { name: "Join the Watch", type: TaskType.Travel, max_progress: 100, skills: [Skill.Charisma] },
            { name: "Read Noticeboard", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study] },
            { name: "Train with Weapons", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat] },
            { name: "Learn How to Read", type: TaskType.Normal, max_progress: 25, skills: [Skill.Study] },
            { name: "Beg for Money", type: TaskType.Normal, max_progress: 100, skills: [Skill.Charisma] },
            { name: "Hide and Seek", type: TaskType.Normal, max_progress: 100, skills: [Skill.Search, Skill.Subterfuge] },
            { name: "Observe Surroundings", type: TaskType.Normal, max_progress: 100, skills: [Skill.Study] },
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            { name: "Notice Smoke in the Distance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Survival] },
            { name: "Learn Routines", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Study] },
            { name: "Deal with Drunkards", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma] },
            { name: "Chit-chat", type: TaskType.Normal, max_progress: 25, skills: [Skill.Charisma] },
            { name: "Sparring", type: TaskType.Normal, max_progress: 100, skills: [Skill.Combat] },
            { name: "Fletch Arrows", type: TaskType.Normal, max_progress: 100, skills: [Skill.Crafting] },
            { name: "Prepare Travel Supplies", type: TaskType.Normal, max_progress: 100, skills: [Skill.Travel, Skill.Survival] },
            { name: "PERK PLACEHOLDER", type: TaskType.Normal, max_progress: 100, skills: [Skill.Travel, Skill.Survival] },
        ],
    },
    {
        name: "The Raid",
        tasks: [
            { name: "Enter the Wilderness", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] },
            { name: "Fight a Goblin", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Combat] },
            { name: "Warn Villagers", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma] },
            { name: "Salvage Food", type: TaskType.Normal, max_progress: 25, skills: [Skill.Search] },
            { name: "Rescue Villager", type: TaskType.Normal, max_progress: 100, skills: [Skill.Subterfuge, Skill.Search] },
            { name: "Treat Villager Wounds", type: TaskType.Normal, max_progress: 100, skills: [Skill.Survival, Skill.Crafting] },
            { name: "Goblin Warlord", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] },
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            { name: "Find Cave Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel, Skill.Search] },
            { name: "Look for Tracks", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search, Skill.Subterfuge] },
            { name: "Survive the Night", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Survival] },
            { name: "Find an Amulet", type: TaskType.Mandatory, max_progress: 25, skills: [Skill.Search, Skill.Magic] },
            { name: "Build a Fire", type: TaskType.Normal, max_progress: 100, skills: [Skill.Survival, Skill.Crafting] },
            { name: "Forage for Mushrooms", type: TaskType.Normal, max_progress: 100, skills: [Skill.Search] },
            { name: "Befried a Deer", type: TaskType.Normal, max_progress: 100, skills: [Skill.Charisma] },
            { name: "FOREST CREATURE PLACEHOLDER", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] },
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            { name: "Leave Via Back Entrance", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] },
            { name: "Find a Way Through", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Search] },
            { name: "Rescue Captives", type: TaskType.Mandatory, max_progress: 50, skills: [Skill.Charisma, Skill.Subterfuge] },
            { name: "Steal Supplies", type: TaskType.Normal, max_progress: 25, skills: [Skill.Subterfuge] },
            { name: "Try Casting a Spell", type: TaskType.Normal, max_progress: 100, skills: [Skill.Magic, Skill.Study] },
            { name: "Inspect Wall Paitings", type: TaskType.Normal, max_progress: 100, skills: [Skill.Study] },
            { name: "Goblin Chieftain", type: TaskType.Boss, max_progress: 100, skills: [Skill.Combat] },
        ],
    },
]

