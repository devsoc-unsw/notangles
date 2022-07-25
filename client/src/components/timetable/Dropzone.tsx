import React, { useEffect, useRef } from 'react';
import { PersonOutline, VideocamOutlined } from '@mui/icons-material';
import { styled } from '@mui/system';

import { borderRadius } from '../../constants/theme';
import { ClassPeriod, InInventory } from '../../interfaces/Periods';
import { DropzoneProps } from '../../interfaces/PropTypes';
import { defaultTransition, registerDropzone, unregisterDropzone } from '../../utils/Drag';
import { classTranslateY, getClassHeight } from '../../utils/translateCard';

const StyledDropzone = styled('div', {
  shouldForwardProp: (prop) => !['classPeriod', 'x', 'color', 'isInventory', 'earliestStartTime'].includes(prop.toString()),
})<{
  classPeriod: ClassPeriod | InInventory;
  x: number;
  color: string;
  isInventory?: boolean;
  earliestStartTime: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  pointer-events: none;
  grid-column: ${({ x }) => x};
  grid-row: 2 / -1;
  transform: translateY(
    ${({ classPeriod, earliestStartTime }) => (classPeriod ? classTranslateY(classPeriod, earliestStartTime) : 0)}
  );
  height: ${({ classPeriod, isInventory }) => (isInventory ? '100%' : getClassHeight(classPeriod))};
  margin-bottom: ${1 / devicePixelRatio}px;
  background-color: ${({ color }) => color};
  opacity: 0;
  transition: ${defaultTransition}, z-index 0s;
  border-bottom-right-radius: ${({ isInventory }) => (isInventory ? borderRadius : 0)}px;
`;

const Dropzone: React.FC<DropzoneProps> = ({ classPeriod, x, earliestStartTime, color, isInventory }) => {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elementCurrent = element.current;
    if (elementCurrent) registerDropzone(classPeriod, elementCurrent, isInventory);
    return () => {
      if (elementCurrent) unregisterDropzone(classPeriod, isInventory);
    };
  }, []);

  return (
    <StyledDropzone
      ref={element}
      className="dropzone"
      classPeriod={classPeriod}
      x={x}
      color={color}
      isInventory={isInventory}
      earliestStartTime={earliestStartTime}
    >
      {classPeriod !== null && (
        <>
          {classPeriod.locations.includes('Online') && <VideocamOutlined fontSize="large" style={{ color: 'white' }} />}
          {classPeriod.locations.some((location) => location !== 'Online') && (
            <PersonOutline fontSize="large" style={{ color: 'white' }} />
          )}
        </>
      )}
    </StyledDropzone>
  );
};

export default Dropzone;
