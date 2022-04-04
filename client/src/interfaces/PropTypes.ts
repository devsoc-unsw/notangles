import { ReactNode } from 'react';
import { CardData } from '../utils/Drag';
import { ClassData, ClassPeriod, CourseData, InInventory } from './Course';

export interface AppContextProviderProps {
  children: ReactNode;
}

export interface CourseContextProviderProps {
  children: ReactNode;
}

export interface CourseSelectProps {
  assignedColors: Record<string, string>;
  handleSelect(data: string | string[], a?: boolean, callback?: (_selectedCourses: CourseData[]) => void): void;
  handleRemove(courseCode: string): void;
}

export interface CellProps {
  classPeriod: ClassPeriod | InInventory;
  x: number;
  y: number;
  earliestStartTime: number;
  color: string;
  yEnd?: number;
  isInventory?: boolean;
}

export interface ClassDropzoneProps {
  course: CourseData;
  color: string;
  earliestStartTime: number;
}

interface Theme {}

export interface DropzonesProps {
  assignedColors: Record<string, string>;
  theme: Theme;
}

export interface PeriodMetadataProps {
  period: ClassPeriod;
}

export interface ControlsProps {
  assignedColors: Record<string, string>;
  handleSelectCourse(data: string | string[], a?: boolean, callback?: (_selectedCourses: CourseData[]) => void): void;
  handleRemoveCourse(courseCode: string): void;
}

export interface TimetableProps {
  assignedColors: Record<string, string>;
  clashes: Array<ClassPeriod>;
  handleSelectClass(classData: ClassData): void;
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
