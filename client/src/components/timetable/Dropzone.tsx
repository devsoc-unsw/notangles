import React, { FunctionComponent, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  // useDrag,
  defaultTransition,
  timeToPosition,
  registerDropzone,
  unregisterDropzone,
  // checkCanDrop,
} from './DragManager';
import { ClassPeriod } from '../../interfaces/CourseData';

// const StyledCell = styled.div.attrs(() => ({
//   className: 'dropzone',
// }))<{
//   classPeriod: ClassPeriod
//   canDrop: boolean
//   isDropTarget: boolean
//   color: string
// }>`
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   // z-index: 3000;
//   z-index: 20;

//   grid-column: ${({ classPeriod }) => classPeriod.time.day + 1};
//   grid-row: ${({ classPeriod }) => timeToPosition(classPeriod.time.start)} /
//     ${({ classPeriod }) => timeToPosition(classPeriod.time.end)};
//   background-color: ${({ color }) => color};
//   pointer-events: ${({ canDrop }) => (canDrop ? 'auto' : 'none')};

//   opacity: ${({ canDrop, isDropTarget }) => {
//     let opacity = 0;
//     if (canDrop) opacity = isDropTarget ? 0.7 : 0.3;
//     return opacity;
//   }};
//   transition: ${defaultTransition};
// `;

const cellStyle = ({
  classPeriod,
  // canDrop,
  color,
  // opacity,
}: {
  classPeriod: ClassPeriod
  // canDrop: boolean
  color: string
  // opacity: number
}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,

  gridColumn: classPeriod.time.day + 1,
  gridRow: `
    ${timeToPosition(classPeriod.time.start)} /
    ${timeToPosition(classPeriod.time.end)}
  `,
  backgroundColor: color,
  // pointerEvents: (
  //   (canDrop ? 'auto' : 'none') as ('auto' | 'none')
  // ),

  // opacity,
  transition: defaultTransition,
});

interface CellProps {
  classPeriod: ClassPeriod;
  color: string
}

const Dropzone: FunctionComponent<CellProps> = React.memo(({
  classPeriod,
  color,
}) => {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element.current) registerDropzone(classPeriod, element.current);
    return () => {
      if (element.current) unregisterDropzone(classPeriod);
    };
  }, []);

  // const canDrop = false;//dragTarget ? checkCanDrop(dragTarget, classPeriod) : false;
  // const isDropTarget = false;//classPeriod === dropTarget;

  // let opacity = 0;
  // if (canDrop) opacity = isDropTarget ? 0.7 : 0.3;

  return (
    // <StyledCell
    //   ref={element}
    //   classPeriod={classPeriod}
    //   canDrop={canDrop}
    //   isDropTarget={isDropTarget}
    //   color={color}
    // />
    <div
      ref={element}
      className="dropzone"
      style={cellStyle({
        classPeriod,
        // canDrop,
        color,
        // opacity,
      })}
    />
  );
});

export { Dropzone };
