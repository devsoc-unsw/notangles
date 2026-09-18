import { Button, ButtonBase, Card, Grid, TouchRippleActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactNode, Ref } from 'react';

import { borderRadius, borderWidth } from '../constants/theme';
import { defaultTransition, gridGap, rowHeight } from '../constants/timetable';
import { Card as TimetableCard } from '../interfaces/Timetable';
import { classTranslateX, classTranslateY, getClassHeight } from '../utils/card';

export const getTimeSlotStyle = (offsetMinutes: number, durationMinutes: number) => ({
  transform: `translateY(${((offsetMinutes / 60) * (rowHeight + gridGap)).toString()}px)`,
  height: Math.max(0, (durationMinutes / 60) * (rowHeight + gridGap) - gridGap),
});

// TODO: These fields can probably be named better
const classTransformStyle = (
  card: TimetableCard,
  earliestStartTime: number,
  nDays?: number,
  y?: number,
  clashIndex?: number,
  width?: number,
  cellWidth = 0,
) =>
  `translate(${classTranslateX(card, nDays, clashIndex, width, cellWidth)}, ${classTranslateY(
    card,
    earliestStartTime,
    y,
  )})`;

export const ExpandButton = styled(Button)`
  position: absolute;
  top: 3px;
  right: 3px;
  box-shadow: none;
  min-width: 0px;
  padding: 0;
  opacity: 40%;
  background-color: transparent;

  &:hover {
    opacity: 100%;
    background-color: transparent;
  }

  &.Mui-focusVisible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

export const StyledCard = styled('div', {
  shouldForwardProp: (prop) =>
    !['card', 'nDays', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'cardWidth', 'cellWidth'].includes(
      prop.toString(),
    ),
})<{
  card: TimetableCard;
  nDays: number;
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
  clashIndex: number;
  cardWidth: number;
  cellWidth: number;
}>`
  position: relative;
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ card, earliestStartTime, nDays, y, clashIndex, cardWidth, cellWidth }) =>
    classTransformStyle(card, earliestStartTime, nDays, y, clashIndex, cardWidth, cellWidth)};
  width: ${({ cardWidth }) => cardWidth}%;
  height: ${({ card }) => getClassHeight(card)};
  box-sizing: border-box;
  z-index: 100;
  cursor: grab;
  padding: 1px;
  transition:
    ${defaultTransition},
    z-index 0s;
`;

// TODO: Add this back to StyledCard if <CSSTransition> is fixed
// &.${transitionName}-enter {
//   & > div {
//     opacity: 0;
//     transform: scale(${elevatedScale});
//     box-shadow: ${({ isSquareEdges }) => getElevatedShadow(isSquareEdges)};
//   }
// }

// &.${transitionName}-enter-active, &.${transitionName}-leave {
//   & > div {
//     opacity: 1;
//     transform: scale(1);
//     box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
//   }
// }

// &.${transitionName}-leave-active {
//   & > div {
//     opacity: 0;
//     box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
//   }
// }

export const StyledCardButtonBase = ({
  children,
  rippleRef,
}: {
  children: ReactNode;
  rippleRef: Ref<TouchRippleActions | null>;
}) => (
  <ButtonBase
    disableTouchRipple={false}
    disableRipple={false}
    touchRippleRef={rippleRef}
    component="div"
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}
  >
    {children}
  </ButtonBase>
);

export const StyledCardInner = styled(Card, {
  shouldForwardProp: (prop) =>
    !['hasClash', 'isSquareEdges', 'clashColour', 'backgroundColour'].includes(prop.toString()),
})<{
  hasClash: boolean;
  isSquareEdges: boolean;
  clashColour: string;
  backgroundColour: string;
}>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.palette.in_text.primary};
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : `${borderRadius.toString()}px`)};
  transition:
    ${defaultTransition},
    z-index 0s;
  backface-visibility: hidden;
  outline: ${({ clashColour }) => `solid ${clashColour} ${borderWidth.toString()}px`};
  outline-offset: -3px;
  height: 100%;
  position: relative;
  background-color: ${({ backgroundColour }) => backgroundColour};
`;

export const StyledCardInnerGrid = styled(Grid)`
  height: 100%;
`;

export const StyledCardName = styled('p')`
  width: 100%;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
`;

export const StyledCardInfo = styled(StyledCardName)`
  font-size: 85%;
  font-weight: normal;
`;
