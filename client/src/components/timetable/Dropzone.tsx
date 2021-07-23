import React, { FunctionComponent, useEffect, useRef } from 'react';
import { ClassPeriod, InInventory } from '@notangles/common';
import {
  defaultTransition,
  registerDropzone,
  unregisterDropzone,
} from '../../utils/Drag';
import { borderRadius } from '../../constants/theme';
import { classTranslateY, classHeight } from './DroppedClasses';

const cellStyle = ({
  classPeriod,
  x,
  yEnd,
  color,
  isInventory,
  earliestStartTime,
}: {
  classPeriod: ClassPeriod | InInventory,
  x: number,
  y: number,
  yEnd?: number,
  color: string,
  isInventory?: boolean
  earliestStartTime: number
}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,
  gridColumn: x,
  gridRow: `2 / ${yEnd !== undefined ? yEnd : 3}`,
  transform: `translateY(${classPeriod ? classTranslateY(classPeriod, earliestStartTime) : '0'})`,
  height: classPeriod ? classHeight(classPeriod) : undefined,
  marginBottom: 1 / devicePixelRatio,
  backgroundColor: color,
  opacity: 0,
  transition: defaultTransition,
  borderBottomRightRadius: isInventory ? `${borderRadius}px` : '0px',
});

interface CellProps {
  classPeriod: ClassPeriod | InInventory
  x: number
  y: number
  earliestStartTime: number
  color: string
  yEnd?: number
  isInventory?: boolean
}

// beware memo - if a component isn't re-rendering, it could be why
const Dropzone: FunctionComponent<CellProps> = React.memo(({
  classPeriod, x, y, earliestStartTime, color, yEnd, isInventory,
}) => {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elementCurrent = element.current;
    if (elementCurrent) registerDropzone(classPeriod, elementCurrent, isInventory);
    return () => {
      if (elementCurrent) unregisterDropzone(classPeriod, isInventory);
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
        isInventory,
        earliestStartTime,
      })}
    />
  );
});

export default Dropzone;
