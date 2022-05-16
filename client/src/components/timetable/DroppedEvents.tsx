import React, { useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { LocationOn, OpenInFull, PeopleAlt, Warning } from '@mui/icons-material';
import { Button, Card, Grid, ThemeProvider } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';
import { SelectedEvents } from '../../interfaces/Course';
import { defaultStartTime } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassData, CourseCode, EventData, InInventory } from '../../interfaces/Course';
// import { DroppedEventesProps, DroppedEventProps, PeriodMetadataProps } from '../../interfaces/PropTypes';
import {
    timeToPosition,
    defaultTransition,
    elevatedScale,
    getElevatedShadow,
    getDefaultShadow,
    transitionTime,
} from '../../utils/Drag';
import ExpandedView from './ExpandedView';
import { getClassMargin, rowHeight } from './TimetableLayout';
import { registerCard, setDragTarget, unregisterCard } from '../../utils/Drag_v2';

export const inventoryMargin = 10;

const classTranslateX = (eventData: EventData, days?: string[]) => {
    return `${(eventData.time.day - 1) * 100}%`;
};

const StyledLocationIcon = styled(LocationOn)`
  vertical-align: text-bottom;
  font-size: inherit;
`;

const getHeightFactor = (eventData: EventData) => eventData.time.end - eventData.time.start;

export const classTranslateY = (eventData: EventData, earliestStartTime: number) => {
  let result = 0;
  // height compared to standard row height
  const heightFactor = getHeightFactor(eventData);

    // number of rows to offset down
    const offsetRows = timeToPosition(eventData.time.start, earliestStartTime) - 2;
    // calculate translate percentage (relative to height)
    result = offsetRows / heightFactor;

  return `calc(${result * 100}% + ${result / devicePixelRatio}px)`;
};

export const classHeight = (eventData: EventData) => {
  // height compared to standard row height
  const heightFactor = getHeightFactor(eventData);

  return `${rowHeight * heightFactor + (heightFactor - 1) / devicePixelRatio}px`;
};

export const classTransformStyle = (eventData: EventData, earliestStartTime: number, days?: string[], y?: number) =>
  `translate(${classTranslateX(eventData, days)}, ${classTranslateY(eventData, earliestStartTime)})`;

const transitionName = 'class';

const ExpandButton = styled(Button)`
  position: absolute;
  top: 3px;
  right: 3px;
  box-shadow: none;
  min-width: 0px;
  padding: 0;
  opacity: 40%;
  border-radius: 2px;
  color: #f5f5f5;

  &:hover {
    opacity: 100%;
  }
`;

const StyledCourseClass = styled('div', {
  shouldForwardProp: (prop) => !['eventData', 'days', 'y', 'earliestStartTime', 'isSquareEdges'].includes(prop.toString()),
})<{
  eventData: EventData;
  days: string[];
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
}>`
  position: relative;
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ eventData, earliestStartTime, days, y }) => classTransformStyle(eventData, earliestStartTime, days, y)};
  // position over timetable borders
  width: calc(100% + ${1 / devicePixelRatio}px);
  height: ${({ eventData }) => classHeight(eventData)};
  box-sizing: border-box;
  z-index: 100;
  cursor: grab;
  padding: ${({ isSquareEdges }) => getClassMargin(isSquareEdges)}px;
  padding-right: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + 1 / devicePixelRatio}px;
  padding-bottom: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + (isSquareEdges ? 0 : 1 / devicePixelRatio)}px;

  transition: ${defaultTransition}, z-index 0s;

  &.${transitionName}-enter {
    & > div {
      opacity: 0;
      transform: scale(${elevatedScale});
      box-shadow: ${({ isSquareEdges }) => getElevatedShadow(isSquareEdges)};
    }
  }

  &.${transitionName}-enter-active, &.${transitionName}-leave {
    & > div {
      opacity: 1;
      transform: scale(1);
      box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
    }
  }

  &.${transitionName}-leave-active {
    & > div {
      opacity: 0;
      box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
    }
  }
`;

const StyledCourseClassInner = styled(Card, {
  shouldForwardProp: (prop) => !['backgroundColor', 'hasClash', 'isSquareEdges'].includes(prop.toString()),
})<{
  backgroundColor: string;
  hasClash: boolean;
  isSquareEdges: boolean;
}>`
  display: flex;
  flex-direction: column;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: white;
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : '7px')};
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ hasClash }) => (hasClash ? 'solid red 4px' : 'solid transparent 0px')};
  outline-offset: -4px;
  width: 100%;
  height: 100%;
  position: relative;
`;

const StyledEventName = styled('p')`
  width: 100%;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledClassName = styled('p')`
  width: 100%;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledClassInfo = styled(StyledClassName)`
  font-size: 85%;
`;



const StyledEvent = styled('div', {
    shouldForwardProp: (prop) => !['eventData, isSquareEdges'].includes(prop.toString()),
  })<{
    eventData: EventData;
    // days: string[];
    // y?: number;
    // earliestStartTime: number;
    isSquareEdges: boolean;
  }>`
    position: relative;
    grid-column: 2;
    grid-row: 2 / -1;
    transform: ${({eventData}) => `translate(${(eventData.time.day - 1) * 100}%, ${classTranslateY(eventData, 8)})`};
    width: calc(100% + ${1 / devicePixelRatio}px);
    height: ${({ eventData }) => classHeight(eventData)};
    box-sizing: border-box;
    z-index: 100;
    cursor: grab;
    padding: ${({ isSquareEdges }) => getClassMargin(isSquareEdges)}px;
    padding-right: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + 1 / devicePixelRatio}px;
    padding-bottom: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + (isSquareEdges ? 0 : 1 / devicePixelRatio)}px;

`;  



const DroppedEvent: React.FC<{eventData: EventData;}> = ({ eventData }) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const { setInfoVisibility, isSquareEdges, isHideClassInfo, days, setIsDrag } = useContext(AppContext);

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

    if (rippleRef.current && 'start' in rippleRef.current) {
      rippleStopped = false;
      rippleRef.current.start(eventCopy);
    }

    const startDrag = () => {
      timer = null;
      setIsDrag(true);
      setDragTarget(eventData, eventCopy);
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
              console.log(error);
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
      registerCard(eventData, elementCurrent);
    }

    return () => {
      if (elementCurrent) {
        unregisterCard(eventData, elementCurrent);
      }
    };
  });



  return (
    <StyledEvent eventData={eventData} isSquareEdges={isSquareEdges} ref={element} onMouseDown={onDown}>
      <StyledCourseClassInner hasClash={false} backgroundColor={'#1f7e8c'} isSquareEdges={isSquareEdges}>
      <Grid container sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              {/*TODO: tweak this number*/}
              <StyledEventName>
                <b>
                  {eventData.name}
                </b>
              </StyledEventName>
              <StyledClassInfo>
                <StyledLocationIcon/>{eventData.location}
              </StyledClassInfo>
              <TouchRipple ref={rippleRef} />
            </Grid>
          </Grid>
      </StyledCourseClassInner>
    </StyledEvent>
  );
};

const DroppedEvents: React.FC<{}> = ({}) => {
  const { selectedEvents } = useContext(CourseContext);
  return (
    // <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
    // </CSSTransition>
    <div style={{display: 'contents'}}>
      {Object.entries(selectedEvents).map(([a,ev]) => <DroppedEvent key={a} eventData={ev}/>)}
    </div>
  );
};

export default DroppedEvents;
