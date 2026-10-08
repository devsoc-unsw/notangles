import { PersonOutline, VideocamOutlined } from '@mui/icons-material';
import { Fade, useMediaQuery } from '@mui/material';
import type { RefCallback } from 'react';

import { transitionTime } from '../../../constants/timetable';
import { DropzoneSurface, StyledDropzone } from '../../../styles/ClassDropzoneStyles';
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
  visible: boolean;
  fadeDuration: number;
}

const ClassDropzone = ({
  elementRef,
  label,
  location,
  visible,
  fadeDuration,
  backgroundColour,
  ...props
}: ClassDropzoneProps) => (
  <StyledDropzone ref={elementRef} {...props} aria-label={label} data-drop-highlighted={props.highlighted}>
    <Fade in={visible} timeout={fadeDuration} easing="ease">
      <DropzoneSurface style={{ backgroundColor: backgroundColour }}>
        {props.isUnscheduled ? 'Unscheduled' : location?.includes('Online') ? <VideocamOutlined /> : <PersonOutline />}
      </DropzoneSurface>
    </Fade>
  </StyledDropzone>
);

interface ClassDropzonesProps {
  visible: boolean;
  slots: ClassDropSlot[];
  target: ClassDropTarget | null;
  numberOfDays: number;
  earliestStartHour: number;
  backgroundColour: string;
  isSquareEdges: boolean;
  registerDropzone: (id: string, element: HTMLElement | null, target: ClassDropTarget) => void;
}

const ClassDropzones = ({
  visible,
  slots,
  target,
  numberOfDays,
  earliestStartHour,
  backgroundColour,
  isSquareEdges,
  registerDropzone,
}: ClassDropzonesProps) => {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const fadeDuration = reducedMotion ? 0 : transitionTime;

  return (
    <>
      {slots
        .filter((slot) => slot.dayIndex < numberOfDays)
        .map((slot) => (
          <ClassDropzone
            key={slot.id}
            visible={visible}
            fadeDuration={fadeDuration}
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
        visible={visible}
        fadeDuration={fadeDuration}
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
};

export default ClassDropzones;
