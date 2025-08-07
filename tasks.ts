export enum Skill {
    Studying,
    Travel,

    Count
}

export class TaskDefinition {
    name = "";
    max_progress = 0;
    skills: Skill[] = [];
}

export class Task {
    definition: TaskDefinition;
    progress: number = 0;

    constructor(definition: TaskDefinition)  {
        this.definition = definition;
    }
}

export const TASKS = [
    {name: "Task 1", max_progress: 100, skills: [Skill.Travel]},
    {name: "Task 2", max_progress: 50, skills: [Skill.Studying]},
    {name: "Task 3", max_progress: 25, skills: [Skill.Studying]},
    {name: "Task 4", max_progress: 100, skills: [Skill.Studying]},
]

