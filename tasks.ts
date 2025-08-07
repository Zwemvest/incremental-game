
export class TaskDefinition {
    name = "";
    max_progress = 0;
}

export class Task {
    definition: TaskDefinition;
    progress: number = 0;

    constructor(definition: TaskDefinition)  {
        this.definition = definition;
    }
}

export const TASKS = [
    {name: "Task 1", max_progress: 100},
    {name: "Task 2", max_progress: 50},
    {name: "Task 3", max_progress: 25},
    {name: "Task 4", max_progress: 100},
]

