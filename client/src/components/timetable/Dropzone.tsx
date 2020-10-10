import React, { FunctionComponent, useEffect, useRef } from 'react';
import {
  defaultTransition,
  registerDropzone,
  unregisterDropzone,
} from '../../utils/Drag';
import { borderRadius } from '../../constants/theme';
import { ClassPeriod, InInventory } from '../../interfaces/CourseData';
import { classTranslateY, classHeight } from './DroppedClasses';

const cellStyle = ({
  classPeriod,
  x,
  yEnd,
  color,
  isInventory
}: {
  classPeriod: ClassPeriod | InInventory,
  x: number,
  y: number,
  yEnd?: number,
  color: string,
  isInventory?: boolean
}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,
  gridColumn: x,
  gridRow: `2 / ${yEnd !== undefined ? yEnd : 3}`,
  transform: `translateY(${classPeriod ? classTranslateY(classPeriod) : "0"})`,
  height: classPeriod ? classHeight(classPeriod) : undefined,
  marginBottom: 1 / devicePixelRatio,
  backgroundColor: color,
  opacity: 0,
  transition: defaultTransition,
  borderBottomRightRadius: isInventory ? `${borderRadius}px` : "0px",
});

interface CellProps {
  classPeriod: ClassPeriod | InInventory
  x: number
  y: number
  yEnd?: number
  color: string
  isInventory?: boolean
}

const Dropzone: FunctionComponent<CellProps> = React.memo(({
  classPeriod, x, y, yEnd, color, isInventory
}) => {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element.current) registerDropzone(classPeriod, element.current, isInventory);
    return () => {
      if (element.current) unregisterDropzone(classPeriod, isInventory);
    };
  }, []);

  return (
    <div
      ref={element}
      className="dropzone"
      style={cellStyle({
        classPeriod,
        x,
        y,
        yEnd,
        color,
        isInventory
      })}
    />
  );
});

export { Dropzone };
