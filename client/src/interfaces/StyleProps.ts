import { CardData } from '../utils/Drag';
import { ClassPeriod, InInventory } from './Course';

export interface StyledContentProps {
  drawerOpen: boolean;
}

export interface StyledTimetableProps {
  rows: number;
}

export interface StyledCourseClassProps {
  cardData: CardData;
  days: string[];
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
}

export interface CourseClassInnerStyleProps {
  backgroundColor: string;
  hasClash: boolean;
  isSquareEdges: boolean;
}

export interface StyledCapacityIndicatorProps {
  percentEnrolled: number;
}

export interface CellStyleProps {
  classPeriod: ClassPeriod | InInventory;
  x: number;
  y: number;
  yEnd?: number;
  color: string;
  isInventory?: boolean;
  earliestStartTime: number;
}

export interface BaseCellStyleProps {
  x: number;
  y: number;
  yTo?: number;
  isEndX?: boolean;
  isEndY?: boolean;
}

export interface DayCellProps {
  y: number;
}

export interface GridCellProps {
  is12HourMode: boolean;
}
