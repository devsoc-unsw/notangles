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

export const cardFadeStyles = {
  '&.card-fade-enter': {
    opacity: 0,
    '--card-entry-scale': '1.1',
  },
  '&.card-fade-enter-active, &.card-fade-enter-done': {
    opacity: 1,
    '--card-entry-scale': '1',
  },
  '&.card-fade-exit': { opacity: 1 },
  '&.card-fade-exit-active, &.card-fade-exit-done': { opacity: 0 },
  '&[data-card-exiting="true"]': { pointerEvents: 'none' },
} as const;

export const CardFrame = styled('div')`
  position: relative;
  box-sizing: border-box;
  transition:
    ${defaultTransition},
    z-index 0s;

  ${cardFadeStyles}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export interface CardLayoutProps {
  card: TimetableCard;
  nDays: number;
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
  clashIndex: number;
  cardWidth: number;
  cellWidth: number;
  isElevated?: boolean;
}

export const StyledCard = styled(CardFrame, {
  shouldForwardProp: (prop) =>
    ![
      'card',
      'nDays',
      'y',
      'earliestStartTime',
      'isSquareEdges',
      'clashIndex',
      'cardWidth',
      'cellWidth',
      'isElevated',
    ].includes(prop.toString()),
})<CardLayoutProps>`
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ card, earliestStartTime, nDays, y, clashIndex, cardWidth, cellWidth }) =>
    classTransformStyle(card, earliestStartTime, nDays, y, clashIndex, cardWidth, cellWidth)};
  width: ${({ cardWidth }) => cardWidth}%;
  height: ${({ card }) => getClassHeight(card)};
  z-index: ${({ isElevated = false }) => (isElevated ? 750 : 100)};
  cursor: grab;
  padding: 1px;
`;

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
    !['hasClash', 'isSquareEdges', 'clashColour', 'backgroundColour', 'isElevated'].includes(prop.toString()),
})<{
  hasClash: boolean;
  isSquareEdges: boolean;
  clashColour: string;
  backgroundColour: string;
  isElevated?: boolean;
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
  transform: ${({ isElevated = false }) => (isElevated ? 'scale(1.1)' : 'scale(var(--card-entry-scale, 1))')};
  background-color: ${({ backgroundColour }) => backgroundColour};

  ${({ isElevated = false, theme }) => isElevated && `box-shadow: ${theme.shadows[24]};`}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const StyledCardInnerGrid = styled(Grid)`
  height: 100%;
  text-align: center;
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
