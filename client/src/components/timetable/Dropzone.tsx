import React, { FunctionComponent, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  // useDrag,
  defaultTransition,
  registerDropzone,
  unregisterDropzone,
  // checkCanDrop,
} from '../../utils/Drag';
import { borderRadius } from '../../constants/theme';
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
  x, yStart, yEnd, color, isInventory
}: {
  x: number, yStart: number, yEnd: number, color: string, isInventory?: boolean
}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,

  gridColumn: x,
  gridRow: `${yStart} / ${yEnd}`,
  // gridColumn: classPeriod.time.day + 1,
  // gridRow: `
  //   ${timeToPosition(classPeriod.time.start)} /
  //   ${timeToPosition(classPeriod.time.end)}
  // `,
  backgroundColor: color,
  // pointerEvents: (
  //   (canDrop ? 'auto' : 'none') as ('auto' | 'none')
  // ),

  opacity: 0,
  transition: defaultTransition,

  borderBottomRightRadius: isInventory ? `${borderRadius}px` : "0px",
});

interface CellProps {
  classPeriod: ClassPeriod | null
  x: number
  yStart: number
  yEnd: number
  color: string
  isInventory?: boolean
}

const Dropzone: FunctionComponent<CellProps> = React.memo(({
  classPeriod, x, yStart, yEnd, color, isInventory
}) => {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element.current) registerDropzone(classPeriod, element.current, isInventory);
    return () => {
      if (element.current) unregisterDropzone(classPeriod, isInventory);
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
        x,
        yStart,
        yEnd,
        // canDrop,
        color,
        // opacity,
        isInventory
      })}
    />
  );
});

export { Dropzone };
