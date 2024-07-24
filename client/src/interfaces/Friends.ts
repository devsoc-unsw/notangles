import { SelectedClasses, CreatedEvents } from "./Periods";

export interface Friend {
    name: string;
    userId: string;
    // show next event within the hour
    currentActivity: CurrentActivity | null;
}

export type FriendsList = Friend[];

export type CurrentActivity = {
    type: 'class' | 'event';
    start: Date;
    end: Date;
}
