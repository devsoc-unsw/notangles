import React, { useEffect, useRef } from 'react';
import { PersonOutline, VideocamOutlined } from '@mui/icons-material';

import { borderRadius } from '../../constants/theme';
import { CellProps } from '../../interfaces/PropTypes';
import { CellStyleProps } from '../../interfaces/StyleProps';
import { defaultTransition, registerDropzone, unregisterDropzone } from '../../utils/Drag';
import { classHeight, classTranslateY } from './DroppedClasses';

const cellStyle = ({ classPeriod, x, color, isInventory, earliestStartTime }: CellStyleProps) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  pointerEvents: 'none' as 'none',
  gridColumn: x,
  gridRow: '2 / -1',
  transform: `translateY(${classPeriod ? classTranslateY(classPeriod, earliestStartTime) : '0'})`,
  height: isInventory ? '100%' : classHeight(classPeriod),
  marginBottom: 1 / devicePixelRatio,
  backgroundColor: color,
  opacity: 0,
  transition: `${defaultTransition}, z-index 0s`,
  borderBottomRightRadius: isInventory ? `${borderRadius}px` : '0px',
});

const Dropzone: React.FC<CellProps> = ({ classPeriod, x, y, earliestStartTime, color, yEnd, isInventory }) => {
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
    >
      {classPeriod !== null && (
        <>
          {classPeriod.locations.includes('Online') && <VideocamOutlined fontSize="large" style={{ color: 'white' }} />}
          {classPeriod.locations.some((location) => location !== 'Online') && (
            <PersonOutline fontSize="large" style={{ color: 'white' }} />
          )}
        </>
      )}
    </div>
  );
};

export default Dropzone;
