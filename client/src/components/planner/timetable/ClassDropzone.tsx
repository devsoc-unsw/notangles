import { PersonOutline, VideocamOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { RefCallback } from 'react';

import { TIMETABLE_ROW_HEIGHT } from './TimetableLayout';

interface ClassDropzoneProps {
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColour: string;
  highlighted: boolean;
  isScheduled?: boolean;
  squareEdges: boolean;
  location?: string;
  label: string;
  elementRef: RefCallback<HTMLDivElement>;
}

const StyledDropzone = styled('div', {
  shouldForwardProp: (prop) =>
    ![
      'gridColumn',
      'offsetMinutes',
      'durationMinutes',
      'backgroundColour',
      'highlighted',
      'isScheduled',
      'squareEdges',
    ].includes(prop.toString()),
})<Omit<ClassDropzoneProps, 'elementRef' | 'label' | 'location'>>(
  ({
    theme,
    gridColumn,
    offsetMinutes = 0,
    durationMinutes = 0,
    backgroundColour,
    highlighted,
    isScheduled,
    squareEdges,
  }) => ({
    gridColumn,
    gridRow: '2 / -1',
    alignSelf: isScheduled ? 'stretch' : 'start',
    transform: `translateY(${theme.spacing(((offsetMinutes / 60) * TIMETABLE_ROW_HEIGHT) / 8)})`,
    height: isScheduled ? undefined : Math.max((durationMinutes / 60) * TIMETABLE_ROW_HEIGHT, 28),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 30,
    color: '#fff',
    backgroundColor: backgroundColour,
    opacity: highlighted ? 0.85 : 0.4,
    borderRadius: squareEdges ? 0 : theme.shape.borderRadius,
    transition: 'opacity 150ms',
  }),
);

const ClassDropzone = ({ elementRef, label, location, ...props }: ClassDropzoneProps) => (
  <StyledDropzone ref={elementRef} {...props} aria-label={label} data-drop-highlighted={props.highlighted}>
    {props.isScheduled ? 'Unscheduled' : location?.includes('Online') ? <VideocamOutlined /> : <PersonOutline />}
  </StyledDropzone>
);

export default ClassDropzone;
