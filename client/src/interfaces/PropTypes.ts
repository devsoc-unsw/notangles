import { ReactNode } from 'react';
import { CardData } from '../utils/Drag';
import { ClassData, ClassPeriod, CourseCode, CourseData, InInventory } from './Course';

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
  clashes: Array<ClassPeriod>;
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
  cardData: CardData;
  color: string;
  y?: number;
  earliestStartTime: number;
  hasClash: boolean;
  shiftClasses(dir: number, cardData: CardData): void;
  hasArrows: boolean;
}

export interface DroppedClassesProps {
  assignedColors: Record<string, string>;
  clashes: Array<ClassPeriod>;
  handleSelectClass(classData: ClassData): void;
}
