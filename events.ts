import { SkillType } from "./zones.js";

export enum EventType {
    SkillUp,

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
