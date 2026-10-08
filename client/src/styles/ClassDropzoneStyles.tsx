import { styled } from '@mui/material/styles';

import { borderRadius } from '../constants/theme';
import { defaultTransition } from '../constants/timetable';
import { getTimeSlotStyle } from './DroppedCardStyles';

interface StyledDropzoneProps {
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  highlighted: boolean;
  isUnscheduled?: boolean;
  isSquareEdges: boolean;
}

export const StyledDropzone = styled('div', {
  shouldForwardProp: (prop) =>
    !['gridColumn', 'offsetMinutes', 'durationMinutes', 'highlighted', 'isUnscheduled', 'isSquareEdges'].includes(
      prop.toString(),
    ),
})<StyledDropzoneProps>(({ gridColumn, offsetMinutes = 0, durationMinutes = 0, highlighted, isUnscheduled }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 700,
  pointerEvents: 'none',
  gridColumn,
  gridRow: '2 / -1',
  ...(isUnscheduled ? { height: '100%' } : getTimeSlotStyle(offsetMinutes, durationMinutes)),
  marginBottom: 1 / devicePixelRatio,
  opacity: highlighted ? 0.85 : isUnscheduled ? 0 : 0.4,
  transition: `${defaultTransition}, z-index 0s`,
  borderBottomRightRadius: isUnscheduled ? borderRadius : 0,
}));

export const DropzoneSurface = styled('div')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  color: white;

  & .MuiSvgIcon-root {
    font-size: 2.1875rem;
  }
`;
