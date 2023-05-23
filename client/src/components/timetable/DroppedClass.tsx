import React, { useContext, useEffect, useRef, useState } from 'react';
import { MoreHoriz } from '@mui/icons-material';
import { Grid, Menu, MenuItem } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { daysShort, unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData, CourseData, ClassPeriod } from '../../interfaces/Periods';
import { DroppedClassProps } from '../../interfaces/PropTypes';
import {
  ExpandButton,
  StyledCard,
  StyledCardInfo,
  StyledCardInner,
  StyledCardInnerGrid,
  StyledCardName,
} from '../../styles/DroppedCardStyles';
import { registerCard, setDragTarget, unregisterCard } from '../../utils/Drag';
import { getCourseFromClassData } from '../../utils/getClassCourse';
import ExpandedView from './ExpandedClassView';
import PeriodMetadata from './PeriodMetadata';
import { createEventObj } from '../../utils/createEvent';

const DroppedClass: React.FC<DroppedClassProps> = ({
  classCard,
  color,
  y,
  handleSelectClass,
  cardWidth,
  clashIndex,
  clashColour,
  cellWidth,
  setCopiedEvent,
  copiedEvent,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<null | { x: number; y: number }>(null);

  const {
    earliestStartTime,
    days,
    isSquareEdges,
    isHideClassInfo,
    setIsDrag,
    setAlertMsg,
    setInfoVisibility,
    setErrorVisibility,
  } = useContext(AppContext);
  const { selectedCourses, createdEvents, setCreatedEvents } = useContext(CourseContext);

  let currCourse: CourseData | null = null;

  try {
    currCourse = getCourseFromClassData(selectedCourses, classCard);
  } catch (err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);
  }

  if (!currCourse) return <></>;

  const handleClose = (value: ClassData) => {
    handleSelectClass(value);
    setPopupOpen(!popupOpen);
  };

  const element = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<any>(null);

  let timer: number | null = null;
  let rippleStopped = false;
  let ignoreMouse = false;
  const onDown = (eventDown: any) => {
    if (
      eventDown.target.className?.baseVal?.includes('MuiSvgIcon-root') ||
      eventDown.target.parentElement?.className?.baseVal?.includes('MuiSvgIcon-root')
    )
      return;

    if (!('type' in eventDown)) return;
    if (eventDown.type.includes('mouse') && ignoreMouse) return;
    if (eventDown.type.includes('touch')) ignoreMouse = true;

    const eventCopy = { ...eventDown };

    if ('start' in rippleRef.current) {
      rippleStopped = false;
      rippleRef.current.start(eventCopy);
    }

    const startDrag = () => {
      timer = null;
      setIsDrag(true);
      setDragTarget(classCard, currCourse!, eventCopy);
      setInfoVisibility(false);
    };

    if (eventDown.type.includes('touch')) {
      timer = window.setTimeout(startDrag, 500);
    } else {
      startDrag();
    }

    const onUp = (eventUp: any) => {
      if (eventUp.type.includes('mouse') && ignoreMouse) return;

      window.removeEventListener('mousemove', onUp);
      window.removeEventListener('touchmove', onUp);

      if ((timer || !eventUp.type.includes('move')) && rippleRef.current && 'stop' in rippleRef.current) {
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);

        if (!rippleStopped && 'stop' in rippleRef.current) {
          rippleStopped = true;

          setTimeout(() => {
            try {
              rippleRef.current.stop(eventUp);
            } catch (error) {
              setAlertMsg(unknownErrorMessage);
              setErrorVisibility(true);
            }
          }, 100);
        }
      }

      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        setInfoVisibility(true);
      }

      eventUp.preventDefault();
    };

    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp, { passive: false });
    window.addEventListener('mousemove', onUp);
    window.addEventListener('touchmove', onUp, { passive: false });
  };

  useEffect(() => {
    const elementCurrent = element.current;

    if (elementCurrent) {
      registerCard(classCard, elementCurrent);
    }

    return () => {
      if (elementCurrent) {
        unregisterCard(classCard, elementCurrent);
      }
    };
  });

  let activityMaxPeriods = 0;
  if (classCard.type === 'inventory') {
    activityMaxPeriods = Math.max(...currCourse!.activities[classCard.activity].map((classData) => classData.periods.length));
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (copiedEvent) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });

      //Update copied event to match the cell double clicked on
      const copyCopiedEvent = copiedEvent;
      const eventTimeLength = copiedEvent.time.end - copiedEvent.time.start;
      const startOffset = copyCopiedEvent.time.start % 1;
      const classPeriod = classCard as ClassPeriod;

      copyCopiedEvent.time.day = classPeriod.time.day - 1;
      copyCopiedEvent.time.start = Math.floor(classPeriod.time.start) + startOffset;
      copyCopiedEvent.time.end = Math.floor(classPeriod.time.start) + startOffset + eventTimeLength;
    }
  };

  const handlePasteEvent = () => {
    if (!copiedEvent) return;

    const newEvent = createEventObj(
      copiedEvent.event.name,
      copiedEvent.event.location,
      copiedEvent.event.description,
      copiedEvent.event.color,
      copiedEvent.time.day + 1,
      copiedEvent.time.start,
      copiedEvent.time.end
    );
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  return (
    <>
      <StyledCard
        ref={element}
        onMouseDown={onDown}
        onTouchStart={(event) => {
          onDown(event);
          setFullscreenVisible(true);
        }}
        card={classCard}
        nDays={days.length}
        y={y}
        earliestStartTime={earliestStartTime}
        isSquareEdges={isSquareEdges}
        onMouseOver={() => {
          setFullscreenVisible(true);
        }}
        onMouseLeave={() => {
          setFullscreenVisible(false);
        }}
        clashIndex={clashIndex}
        cardWidth={cardWidth}
        cellWidth={cellWidth}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        <StyledCardInner
          isSquareEdges={isSquareEdges}
          backgroundColour={color}
          hasClash={clashColour !== 'transparent'}
          clashColour={clashColour}
        >
          <StyledCardInnerGrid container justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              <StyledCardName>
                {classCard.courseCode} {classCard.activity}
              </StyledCardName>
              <StyledCardInfo>
                {classCard.type === 'class' ? (
                  !isHideClassInfo && <PeriodMetadata period={classCard} />
                ) : (
                  <>
                    {activityMaxPeriods} class
                    {activityMaxPeriods !== 1 && 'es'}
                  </>
                )}
              </StyledCardInfo>
              <TouchRipple ref={rippleRef} />
            </Grid>
          </StyledCardInnerGrid>
          {classCard.type === 'class' && fullscreenVisible && (
            <ExpandButton onClick={() => setPopupOpen(true)}>
              <MoreHoriz fontSize="large" />
            </ExpandButton>
          )}
        </StyledCardInner>
      </StyledCard>
      {classCard.type === 'class' && <ExpandedView classPeriod={classCard} popupOpen={popupOpen} handleClose={handleClose} />}
      <Menu
        open={contextMenu != null}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
        onClose={() => setContextMenu(null)}
      >
        <MenuItem onClick={handlePasteEvent}>Paste</MenuItem>
      </Menu>
    </>
  );
};

export default DroppedClass;
