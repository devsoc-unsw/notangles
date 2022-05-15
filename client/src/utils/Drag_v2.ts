import { EventData } from "../interfaces/Course";

export const startDragEvent: any = (eventData: EventData|null, event: MouseEvent) => {
  console.log(event.target)
  return;
}