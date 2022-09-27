import { SelectChangeEvent } from '@mui/material';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { ClassCard } from '../utils/Drag';
import { ClassData, ClassPeriod, CourseCode, CourseData, EventPeriod, InInventory, Location, Section } from './Periods';

export interface AppContextProviderProps {
  children: ReactNode;
}

export interface CourseContextProviderProps {
  children: ReactNode;
}

export interface CustomModalProps {
  title: string;
  showIcon: ReactNode;
  description: string;
  content: ReactNode;
}

export interface CourseSelectProps {
  assignedColors: Record<string, string>;
  handleSelect(data: string | string[], a?: boolean, callback?: (_selectedCourses: CourseData[]) => void): void;
  handleRemove(courseCode: CourseCode): void;
}

export interface ControlsProps {
  assignedColors: Record<string, string>;
  handleSelectClass(classData: ClassData): void;
  handleSelectCourse(data: string | string[], a?: boolean, callback?: (_selectedCourses: CourseData[]) => void): void;
  handleRemoveCourse(courseCode: CourseCode): void;
}

export interface DropdownOptionProps {
  optionName: string;
  optionState: string | null | string[];
  setOptionState(value: any): void;
  optionChoices: string[];
  multiple?: boolean;
  noOff?: boolean;
}

export interface AutotimetableProps {
  handleSelectClass(classData: ClassData): void;
}

export interface TimetableProps {
  assignedColors: Record<string, string>;
  handleSelectClass(classData: ClassData): void;
}

export interface DropzoneProps {
  classPeriod: ClassPeriod | InInventory;
  x: number;
  earliestStartTime: number;
  color: string;
  isInventory?: boolean;
}

export interface DropzoneGroupProps {
  course: CourseData;
  color: string;
  earliestStartTime: number;
}

export interface DropzonesProps {
  assignedColors: Record<string, string>;
}

export interface PeriodMetadataProps {
  period: ClassPeriod;
}

export interface DroppedClassProps {
  classCard: ClassCard;
  color: string;
  y?: number;
  handleSelectClass(classData: ClassData): void;
  cardWidth: number;
  clashIndex: number;
  clashColour: string;
  cellWidth: number; // width of a grid cell
}

export interface DroppedEventProps {
  eventId: string;
  eventPeriod: EventPeriod;
  cardWidth: number;
  clashIndex: number;
  cellWidth: number; // width of a grid cell
}

export interface DroppedCardsProps {
  assignedColors: Record<string, string>;
  handleSelectClass(classData: ClassData): void;
}

export interface ExpandedClassViewProps {
  classPeriod: ClassPeriod;
  popupOpen: boolean;
  handleClose: (value: ClassData) => void;
}

export interface ExpandedEventViewProps {
  eventPeriod: EventPeriod;
  popupOpen: boolean;
  handleClose: () => void;
}

export interface DiscardDialogProps {
  openSaveDialog: boolean;
  handleDiscardChanges: () => void;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setOpenSaveDialog: Dispatch<SetStateAction<boolean>>;
}

export interface LocationDropdownProps {
  sectionsAndLocations: Array<[Section, Location]>;
  handleChange(event: SelectChangeEvent<number>): void;
  selectedIndex: number;
}
export interface CustomEventGeneralProps {
  eventName: String;
  setEventName: Dispatch<SetStateAction<string>>;
  description: String;
  setDescription: Dispatch<SetStateAction<string>>;
  location: String;
  setLocation: Dispatch<SetStateAction<string>>;
  startTime: Date;
  setStartTime: Dispatch<SetStateAction<Date>>;
  endTime: Date;
  setEndTime: Dispatch<SetStateAction<Date>>;
  eventDays: Array<string>;
  setEventDays: Dispatch<SetStateAction<Array<string>>>;
}

export interface CustomEventTutoringProp {
  coursesCodes: Array<Record<string, string>>;
  classesCodes: Array<Record<string, string>>;
  setCourseCode: Dispatch<SetStateAction<string>>;
  setClassCode: Dispatch<SetStateAction<string>>;
}
