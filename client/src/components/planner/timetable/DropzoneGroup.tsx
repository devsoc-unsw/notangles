import { useMediaQuery } from '@mui/material';

import { transitionTime } from '../../../constants/timetable';
import type { ClassDropSlot } from './classDropSlots';
import Dropzone from './Dropzone';
import type { ClassDropTarget } from './useClassDrag';

interface DropzoneGroupProps {
  visible: boolean;
  slots: ClassDropSlot[];
  target: ClassDropTarget | null;
  numberOfDays: number;
  earliestStartHour: number;
  backgroundColor: string;
  isSquareEdges: boolean;
  registerDropzone: (id: string, element: HTMLElement | null, target: ClassDropTarget) => void;
}

const DropzoneGroup = ({
  visible,
  slots,
  target,
  numberOfDays,
  earliestStartHour,
  backgroundColor,
  isSquareEdges,
  registerDropzone,
}: DropzoneGroupProps) => {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const fadeDuration = reducedMotion ? 0 : transitionTime;

  return (
    <>
      {slots
        .filter((slot) => slot.dayIndex < numberOfDays)
        .map((slot) => (
          <Dropzone
            key={slot.id}
            visible={visible}
            fadeDuration={fadeDuration}
            gridColumn={slot.dayIndex + 2}
            offsetMinutes={slot.startMinutes - earliestStartHour * 60}
            durationMinutes={slot.endMinutes - slot.startMinutes}
            backgroundColor={backgroundColor}
            isSquareEdges={isSquareEdges}
            isHighlighted={
              target?.type === 'class' &&
              target.classId === slot.classData.class_id &&
              target.timeIndex === slot.timeIndex
            }
            locations={slot.locations}
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
      <Dropzone
        visible={visible}
        fadeDuration={fadeDuration}
        gridColumn={numberOfDays + 3}
        backgroundColor={backgroundColor}
        isSquareEdges={isSquareEdges}
        isHighlighted={target?.type === 'unscheduled'}
        isUnscheduled
        label="Unscheduled drop target"
        elementRef={(element) => {
          registerDropzone('unscheduled', element, { type: 'unscheduled' });
        }}
      />
    </>
  );
};

export default DropzoneGroup;
