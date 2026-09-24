import { PersonOutline, VideocamOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { RefCallback } from 'react';

import { getTimeSlotStyle } from '../../../styles/DroppedCardStyles';
import type { ClassDropSlot, ClassDropTarget } from './useClassDrag';

interface ClassDropzoneProps {
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColour: string;
  highlighted: boolean;
  isUnscheduled?: boolean;
  isSquareEdges: boolean;
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
      'isUnscheduled',
      'isSquareEdges',
    ].includes(prop.toString()),
})<Omit<ClassDropzoneProps, 'elementRef' | 'label' | 'location'>>(
  ({
    theme,
    gridColumn,
    offsetMinutes = 0,
    durationMinutes = 0,
    backgroundColour,
    highlighted,
    isUnscheduled,
    isSquareEdges,
  }) => ({
    gridColumn,
    gridRow: '2 / -1',
    alignSelf: isUnscheduled ? 'stretch' : 'start',
    ...(isUnscheduled ? {} : getTimeSlotStyle(offsetMinutes, durationMinutes)),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 200,
    color: '#fff',
    backgroundColor: backgroundColour,
    opacity: highlighted ? 0.85 : 0.4,
    borderRadius: isSquareEdges ? 0 : theme.shape.borderRadius,
  }),
);

const ClassDropzone = ({ elementRef, label, location, ...props }: ClassDropzoneProps) => (
  <StyledDropzone ref={elementRef} {...props} aria-label={label} data-drop-highlighted={props.highlighted}>
    {props.isUnscheduled ? 'Unscheduled' : location?.includes('Online') ? <VideocamOutlined /> : <PersonOutline />}
  </StyledDropzone>
);

interface ClassDropzonesProps {
  slots: ClassDropSlot[];
  target: ClassDropTarget | null;
  numberOfDays: number;
  earliestStartHour: number;
  backgroundColour: string;
  isSquareEdges: boolean;
  registerDropzone: (id: string, element: HTMLElement | null, target: ClassDropTarget) => void;
}

const ClassDropzones = ({
  slots,
  target,
  numberOfDays,
  earliestStartHour,
  backgroundColour,
  isSquareEdges,
  registerDropzone,
}: ClassDropzonesProps) => (
  <>
    {slots
      .filter((slot) => slot.dayIndex < numberOfDays)
      .map((slot) => (
        <ClassDropzone
          key={slot.id}
          gridColumn={slot.dayIndex + 2}
          offsetMinutes={slot.startMinutes - earliestStartHour * 60}
          durationMinutes={slot.endMinutes - slot.startMinutes}
          backgroundColour={backgroundColour}
          isSquareEdges={isSquareEdges}
          highlighted={
            target?.type === 'class' &&
            target.classId === slot.classData.class_id &&
            target.timeIndex === slot.timeIndex
          }
          location={slot.classData.times[slot.timeIndex].location}
          label={`${slot.classData.course.course_code} ${slot.classData.activity} ${slot.classData.section}`}
          elementRef={(element) => {
            registerDropzone(slot.id, element, {
              type: 'class',
              classId: slot.classData.class_id,
              timeIndex: slot.timeIndex,
              slotId: slot.id,
            });
          }}
        />
      ))}
    <ClassDropzone
      gridColumn={numberOfDays + 3}
      backgroundColour={backgroundColour}
      isSquareEdges={isSquareEdges}
      highlighted={target?.type === 'unscheduled'}
      isUnscheduled
      label="Unscheduled drop target"
      elementRef={(element) => {
        registerDropzone('unscheduled', element, { type: 'unscheduled' });
      }}
    />
  </>
);

export default ClassDropzones;
