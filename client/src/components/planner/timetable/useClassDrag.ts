import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import { transitionTime } from '../../../constants/timetable';
import type { ClassDropSource } from './classDropSlots';

export interface ClassDragSource extends ClassDropSource {
  cardKey: string;
}

export type ClassDropTarget =
  | { type: 'class'; classId: string; timeIndex: number | null; slotId: string }
  | { type: 'unscheduled' };

type DragRect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
interface Dropzone {
  element: HTMLElement;
  target: ClassDropTarget;
  bounds?: DOMRect;
}

export const sameClassDropTarget = (a: ClassDropTarget | null, b: ClassDropTarget | null) =>
  a?.type === b?.type &&
  (a?.type !== 'class' || (b?.type === 'class' && a.classId === b.classId && a.timeIndex === b.timeIndex));

// Only the inner surface of a card is scaled
export const getClassDragRect = (element: HTMLElement): DragRect => element.getBoundingClientRect();

export const findClassDropTarget = (
  rect: DragRect,
  zones: Iterable<Dropzone>,
  previousTarget: ClassDropTarget | null = null,
): ClassDropTarget | null => {
  let target: ClassDropTarget | null = null;
  let maxArea = 0;
  for (const zone of zones) {
    const bounds = zone.bounds ?? zone.element.getBoundingClientRect();
    const left = rect.left - (bounds.width - rect.width) / 2;
    const width = Math.max(0, Math.min(left + bounds.width, bounds.right) - Math.max(left, bounds.left));
    const height = Math.max(
      0,
      Math.min(rect.top + rect.height + 2, bounds.bottom) - Math.max(rect.top - 2, bounds.top),
    );
    const area = width * height;
    if (zone.target.type === 'unscheduled' && area < rect.width * rect.height * 0.5) continue;
    if (area > maxArea || (area > 0 && area === maxArea && sameClassDropTarget(zone.target, previousTarget))) {
      maxArea = area;
      target = zone.target;
    }
  }
  return target;
};

export interface ClassDragState {
  source: ClassDragSource;
  target: ClassDropTarget | null;
  phase: 'dragging' | 'settling';
}

export const useClassDrag = (
  timetableId: string,
  {
    onDrop,
  }: {
    onDrop: (source: ClassDragSource, target: ClassDropTarget) => void;
  },
) => {
  const [drag, setDrag] = useState<ClassDragState | null>(null);
  const dropzones = useRef(new Map<string, Dropzone>());
  const cleanup = useRef<(() => void) | null>(null);
  const finishSettle = useRef<(() => void) | null>(null);
  const invalidateGeometry = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanup.current?.();
      finishSettle.current?.();
    };
  }, [timetableId]);
  useLayoutEffect(() => {
    invalidateGeometry.current?.();
  });

  const registerDropzone = useCallback((id: string, element: HTMLElement | null, target: ClassDropTarget) => {
    if (element) dropzones.current.set(id, { element, target });
    else dropzones.current.delete(id);
    invalidateGeometry.current?.();
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>, source: ClassDragSource) => {
    if (!event.isPrimary || event.button !== 0 || cleanup.current) return;
    if (event.target instanceof Element && event.target.closest('button, a, input, [role="button"]')) return;
    finishSettle.current?.();

    const element = event.currentTarget;
    const bounds = getClassDragRect(element);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const scrollElement = element.closest<HTMLElement>('#StyledTimetableScroll');
    const root = element.ownerDocument.documentElement;
    const originalCursor = root.style.cursor;
    const originalCardCursor = element.style.cursor;
    let x = startX;
    let y = startY;
    let processedX = x;
    let processedY = y;
    let active = false;
    let hasMoved = false;
    let dropzoneBoundsDirty = true;
    let lastFrame = performance.now();
    let lastResolve = -Infinity;
    let lastWidth = bounds.width;
    let lastHeight = bounds.height;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let target: ClassDropTarget | null =
      source.classId === null
        ? { type: 'unscheduled' }
        : {
            type: 'class',
            classId: source.classId,
            timeIndex: source.timeIndex,
            slotId: 'origin',
          };

    const publishDragState = () => {
      setDrag({ source, target, phase: 'dragging' });
    };

    const updateDragPosition = (now: number, force = false) => {
      if (!active) return;
      const current = getClassDragRect(element);
      const left = bounds.left + (bounds.width - current.width) / 2 + x - startX;
      const top = bounds.top + (bounds.height - current.height) / 2 + y - startY;
      element.style.left = `${((parseFloat(element.style.left) || 0) + left - current.left).toString()}px`;
      element.style.top = `${((parseFloat(element.style.top) || 0) + top - current.top).toString()}px`;
      const resizing = Math.abs(lastWidth - current.width) > 0.1 || Math.abs(lastHeight - current.height) > 0.1;
      lastWidth = current.width;
      lastHeight = current.height;
      if (!hasMoved || (!force && (resizing || now - lastResolve < 30))) return;
      if (dropzoneBoundsDirty) {
        for (const zone of dropzones.current.values()) zone.bounds = zone.element.getBoundingClientRect();
        dropzoneBoundsDirty = false;
      }
      const next = findClassDropTarget(
        { left, top, width: current.width, height: current.height },
        dropzones.current.values(),
        target,
      );
      lastResolve = now;
      processedX = x;
      processedY = y;
      if (!sameClassDropTarget(next, target)) {
        target = next;
        publishDragState();
      } else if (next?.type === 'class' && target?.type === 'class' && next.slotId !== target.slotId) {
        target = next;
        publishDragState();
      }
    };

    const tick = (now: number) => {
      const delta = Math.min(32, now - lastFrame);
      lastFrame = now;
      if (hasMoved) {
        const oldTop = root.scrollTop;
        const oldLeft = scrollElement?.scrollLeft;
        if (y < 50) root.scrollTop -= delta * 0.32;
        else if (window.innerHeight - y < 50) root.scrollTop += delta * 0.32;
        if (scrollElement) {
          const edges = scrollElement.getBoundingClientRect();
          if (x < Math.max(0, edges.left) + 50) scrollElement.scrollLeft -= delta * 0.32;
          else if (x > Math.min(window.innerWidth, edges.right) - 50) scrollElement.scrollLeft += delta * 0.32;
        }
        if (root.scrollTop !== oldTop || scrollElement?.scrollLeft !== oldLeft) dropzoneBoundsDirty = true;
      }
      updateDragPosition(now);
      frame = requestAnimationFrame(tick);
    };

    const activateDrag = () => {
      active = true;
      const computed = getComputedStyle(element);
      const transform = computed.transform;
      const left = computed.left;
      const top = computed.top;
      element.style.transform = transform;
      element.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'none'
        : 'height 150ms ease, width 350ms ease';
      element.style.left = left;
      element.style.top = top;
      element.style.zIndex = '1500';
      element.style.cursor = 'grabbing';
      root.style.cursor = 'grabbing';
      element.setPointerCapture(pointerId);
      flushSync(publishDragState);
      frame = requestAnimationFrame(tick);
    };

    const dispose = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', pointerCancel, true);
      window.removeEventListener('touchmove', preventTouchScroll);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('blur', cancelDrag);
      window.removeEventListener('resize', layoutChanged);
      window.removeEventListener('scroll', layoutChanged, true);
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      root.style.cursor = originalCursor;
      element.style.cursor = originalCardCursor;
      cleanup.current = null;
      invalidateGeometry.current = null;
    };

    const settle = (commit: boolean) => {
      dispose();
      if (!active) return;
      active = false;
      if (!commit) target = null;
      flushSync(() => {
        setDrag({ source, target, phase: 'settling' });
      });
      element.getBoundingClientRect();
      element.style.removeProperty('transition');
      element.style.removeProperty('transform');
      element.style.left = '0px';
      element.style.top = '0px';
      const finish = () => {
        clearTimeout(settleTimer);
        element.style.removeProperty('left');
        element.style.removeProperty('top');
        element.style.removeProperty('z-index');
        finishSettle.current = null;
        setDrag(null);
      };
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const settleTimer = setTimeout(finish, reducedMotion ? 0 : transitionTime);
      finishSettle.current = finish;
      if (commit && target && (target.type === 'class' ? target.classId !== source.classId : source.classId !== null)) {
        onDrop(source, target);
      }
    };

    const cancelDrag = () => {
      settle(false);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      if (active && moveEvent.pointerType === 'mouse' && (moveEvent.buttons & 1) === 0) {
        if (x !== processedX || y !== processedY) {
          updateDragPosition(performance.now(), true);
        }
        settle(hasMoved);
        return;
      }
      x = moveEvent.clientX;
      y = moveEvent.clientY;
      if (!active) {
        if (Math.hypot(x - startX, y - startY) > 8) dispose();
        return;
      }
      hasMoved ||= Math.hypot(x - startX, y - startY) > 4;
      moveEvent.preventDefault();
      updateDragPosition(performance.now());
    };

    const handlePointerUp = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      x = endEvent.clientX;
      y = endEvent.clientY;
      hasMoved ||= Math.hypot(x - startX, y - startY) > 4;
      if (active && (x !== processedX || y !== processedY)) {
        updateDragPosition(performance.now(), true);
      }
      settle(active && hasMoved);
    };

    const pointerCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId === pointerId) cancelDrag();
    };

    const keydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') cancelDrag();
    };

    const layoutChanged = () => {
      if (active) dropzoneBoundsDirty = true;
      else dispose();
    };

    const preventTouchScroll = (touchEvent: TouchEvent) => {
      if (active && touchEvent.cancelable) touchEvent.preventDefault();
    };

    cleanup.current = () => {
      dispose();
      for (const property of ['transition', 'transform', 'left', 'top', 'z-index'])
        element.style.removeProperty(property);
    };

    invalidateGeometry.current = () => {
      dropzoneBoundsDirty = true;
    };

    // Observe the capture phase to avoid missing the final release
    window.addEventListener('pointermove', handlePointerMove, { passive: false, capture: true });
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', pointerCancel, true);
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    window.addEventListener('keydown', keydown);
    window.addEventListener('blur', cancelDrag);
    window.addEventListener('resize', layoutChanged);
    window.addEventListener('scroll', layoutChanged, true);
    if (event.pointerType === 'touch') timer = setTimeout(activateDrag, 500);
    else {
      event.preventDefault();
      activateDrag();
    }
  };

  return { drag, startDrag, registerDropzone };
};
