import { ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { SkillType, TaskDefinition } from "./zones.js";

export enum EventType {
    SkillUp,
    GainedPerk,
    UsedItem,
    UnlockedTask,
    UnlockedSkill,
    UnlockedPower,

    Count
}

export class EventContext {}

export class RenderEvent {
    type: EventType;
    context: EventContext;

    constructor(type: EventType, context: EventContext) {
        this.type = type;
        this.context = context;
    }
}

export class SkillUpContext extends EventContext {
    skill: SkillType = SkillType.Count;
    new_level: number = 0;
}

export class GainedPerkContext extends EventContext {
    perk: PerkType = PerkType.Count;
}

export class UsedItemContext extends EventContext {
    item: ItemType = ItemType.Count;
    count: number = 0;
}

export class UnlockedTaskContext extends EventContext {
    task_definition: TaskDefinition = new TaskDefinition();
}

export class UnlockedSkillContext extends EventContext {
    skill: SkillType = SkillType.Count;
}
