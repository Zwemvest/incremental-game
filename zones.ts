export enum Skill {
    Studying,
    Travel,

    Count
}

export enum TaskType {
    Normal,
    Travel,
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
            { name: "Task 1", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] },
            { name: "Task 2", type: TaskType.Normal, max_progress: 50, skills: [Skill.Studying] },
            { name: "Task 3", type: TaskType.Normal, max_progress: 25, skills: [Skill.Studying] },
            { name: "Task 4", type: TaskType.Normal, max_progress: 100, skills: [Skill.Studying] },
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            { name: "Task 5", type: TaskType.Travel, max_progress: 100, skills: [Skill.Travel] },
            { name: "Task 6", type: TaskType.Normal, max_progress: 50, skills: [Skill.Studying] },
            { name: "Task 7", type: TaskType.Normal, max_progress: 25, skills: [Skill.Studying] },
            { name: "Task 8", type: TaskType.Normal, max_progress: 100, skills: [Skill.Studying] },
        ],
    },
]

