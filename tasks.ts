
export class Task {
    name = "";

    constructor(name: string)  {
        this.name = name;
    }
}

export const TASKS = [
    new Task("Task 1"),
    new Task("Task 2"),
    new Task("Task 3"),
    new Task("Task 4"),
]

