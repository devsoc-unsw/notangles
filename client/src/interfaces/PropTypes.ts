import { PopoverOrigin, SelectChangeEvent } from '@mui/material';
import { ReactNode } from 'react';
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
  setIsEditing: (isEditing: boolean) => void;
  setOpenSaveDialog: (isOpen: boolean) => void;
}

export interface LocationDropdownProps {
  sectionsAndLocations: Array<[Section, Location]>;
  handleChange(event: SelectChangeEvent<number>): void;
  selectedIndex: number;
}

export interface CreateEventPopoverProps {
  open: boolean;
  anchorEl: HTMLButtonElement | HTMLDivElement | null;
  handleClose: () => void;
  anchorOrigin: PopoverOrigin;
  transformOrigin: PopoverOrigin;
  initialStartTime: Date;
  initialEndTime: Date;
  initialDay: string;
  tempEventId: string;
}

export interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  colorPickerAnchorEl: HTMLElement | null;
  handleOpenColorPicker: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseColorPicker: () => void;
}

export interface CustomEventGeneralProps {
  eventName: string;
  setEventName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  endTime: Date;
  setEndTime: (endTime: Date) => void;
  eventDays: string[];
  setEventDays: (days: string[]) => void;
  initialStartTime: Date;
  initialEndTime: Date;
  initialDay: string;
  isInitialStartTime: boolean;
  setIsInitialStartTime: (isInitialStartTime: boolean) => void;
  isInitialEndTime: boolean;
  setIsInitialEndTime: (isInitialEndTime: boolean) => void;
  isInitialDay: boolean;
  setIsInitialDay: (isInitialDay: boolean) => void;
}

export interface CustomEventTutoringProp {
  coursesCodes: Record<string, string>[];
  classesCodes: Record<string, string>[];
  setCourseCode: (courseCode: string) => void;
  setClassCode: (classCode: string) => void;
}

export interface CustomEventLinkProp {
  link: string;
  setLink: (link: string) => void;
}
