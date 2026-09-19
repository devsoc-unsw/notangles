import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { shortDayToIndex } from '../../../constants/timetable';
import { parseClassTimeRange } from '../../../utils/time';
import type { ClassCardMetadata } from './useTimetableClasses';

export interface ClassDragSource {
  courseId: string;
  activity: string;
  classId: string | null;
  timeIndex: number | null;
  title: string;
  details?: string;
  metadata?: ClassCardMetadata;
  backgroundColour: string;
}

export type ClassDropTarget = { type: 'class'; classId: string } | { type: 'unscheduled' };

export interface ClassDropSlot {
  id: string;
  classData: TimetableClass;
  timeIndex: number;
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
}

export const getClassDropSlots = (source: ClassDragSource, classes: TimetableClass[]): ClassDropSlot[] => {
  const sourceClass = classes.find((cls) => cls.class_id === source.classId);
  const durations = sourceClass?.times.map((time) => {
    const range = parseClassTimeRange(time.time);
    return range ? range.endMinutes - range.startMinutes : undefined;
  });
  const sourceDuration = source.timeIndex === null ? undefined : durations?.[source.timeIndex];
  const equalDurations = durations?.every((duration) => duration !== undefined && duration === durations[0]);

  return classes
    .filter((cls) => cls.course_id === source.courseId && cls.activity === source.activity)
    .flatMap((classData) =>
      classData.times.flatMap((time, timeIndex) => {
        const dayIndex = shortDayToIndex[time.day];
        const range = parseClassTimeRange(time.time);
        if (dayIndex === undefined || !range) return [];
        if (
          source.timeIndex !== null &&
          sourceDuration !== range.endMinutes - range.startMinutes &&
          source.timeIndex !== timeIndex &&
          !equalDurations
        )
          return [];

        return [{ id: [classData.class_id, timeIndex].join('-'), classData, timeIndex, dayIndex, ...range }];
      }),
    );
};

interface Dropzone {
  element: HTMLElement;
  target: ClassDropTarget;
}

export const findClassDropTarget = (
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  zones: Iterable<Dropzone>,
): ClassDropTarget | null => {
  let target: ClassDropTarget | null = null;
  let maxArea = 0;
  for (const zone of zones) {
    const bounds = zone.element.getBoundingClientRect();
    const left = rect.left - (bounds.width - rect.width) / 2;
    const width = Math.max(0, Math.min(left + bounds.width, bounds.right) - Math.max(left, bounds.left));
    const height = Math.max(
      0,
      Math.min(rect.top + rect.height + 2, bounds.bottom) - Math.max(rect.top - 2, bounds.top),
    );

    const area = width * height;
    if (zone.target.type === 'unscheduled' && area < rect.width * rect.height * 0.5) continue;
    if (area > maxArea) {
      maxArea = area;
      target = zone.target;
    }
  }
  return target;
};

interface ClassDragState {
  timetableId: string;
  source: ClassDragSource;
  target: ClassDropTarget | null;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ClassDragOptions {
  canDrag: () => boolean;
  onDrop: (source: ClassDragSource, target: ClassDropTarget) => void;
}

export const useClassDrag = (timetableId: string, { canDrag, onDrop }: ClassDragOptions) => {
  const [drag, setDrag] = useState<ClassDragState | null>(null);
  const dropzones = useRef(new Map<string, Dropzone>());
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cleanup.current?.();
    },
    [],
  );

  const registerDropzone = useCallback((id: string, element: HTMLElement | null, target: ClassDropTarget) => {
    if (element) dropzones.current.set(id, { element, target });
    else dropzones.current.delete(id);
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>, source: ClassDragSource) => {
    if (!event.isPrimary || event.button !== 0 || cleanup.current || !canDrag()) return;
    if (event.target instanceof Element && event.target.closest('button, a, input, [role="button"]')) return;

    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const bounds = element.getBoundingClientRect();
    let x = startX;
    let y = startY;
    let active = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const getRect = () => ({
      left: bounds.left + x - startX,
      top: bounds.top + y - startY,
      width: bounds.width,
      height: bounds.height,
    });

    const update = () => {
      const rect = getRect();
      setDrag({ timetableId, source, ...rect, target: findClassDropTarget(rect, dropzones.current.values()) });
    };

    const begin = () => {
      if (!canDrag()) {
        cancel();
        return;
      }
      active = true;
      element.setPointerCapture(pointerId);
      update();
    };

    const dispose = () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('touchmove', preventTouchScroll);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('resize', cancel);
      window.removeEventListener('scroll', scroll, true);
      element.removeEventListener('lostpointercapture', cancel);
      cleanup.current = null;
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    };

    const cancel = () => {
      dispose();
      setDrag(null);
    };

    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      x = moveEvent.clientX;
      y = moveEvent.clientY;
      if (!active) {
        if (Math.hypot(x - startX, y - startY) > 8) cancel();
        return;
      }
      moveEvent.preventDefault();
      update();
    };

    const end = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      x = endEvent.clientX;
      y = endEvent.clientY;
      const hasMoved = Math.hypot(x - startX, y - startY) > 4;
      const target =
        active && hasMoved && endEvent.type === 'pointerup' && canDrag()
          ? findClassDropTarget(getRect(), dropzones.current.values())
          : null;
      cancel();
      if (!target) return;
      if (target.type === 'class' ? target.classId === source.classId : source.classId === null) return;
      onDrop(source, target);
    };
    const keydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') cancel();
    };
    const scroll = () => {
      if (active) update();
      else cancel();
    };
    const preventTouchScroll = (touchEvent: TouchEvent) => {
      if (active && touchEvent.cancelable) touchEvent.preventDefault();
    };

    cleanup.current = dispose;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    window.addEventListener('keydown', keydown);
    window.addEventListener('blur', cancel);
    window.addEventListener('resize', cancel);
    window.addEventListener('scroll', scroll, true);
    element.addEventListener('lostpointercapture', cancel);

    if (event.pointerType === 'touch') timer = setTimeout(begin, 500);
    else {
      event.preventDefault();
      begin();
    }
  };

  return { drag, startDrag, registerDropzone };
};
