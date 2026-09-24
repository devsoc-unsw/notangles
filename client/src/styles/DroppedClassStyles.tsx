import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

import { inventoryMargin } from '../constants/theme';
import { gridGap, rowHeight, transitionTime } from '../constants/timetable';
import { ExpandButton, getTimeSlotStyle, StyledCardInfo, StyledCardName } from './DroppedCardStyles';

export const ClassExpandButton = styled(ExpandButton)`
  color: #f5f5f5;
  opacity: 0;
  pointer-events: none;

  @media (hover: none) {
    opacity: 0.4;
    pointer-events: auto;
  }
`;

interface StyledClassCardProps {
  gridColumn?: number;
  numberOfDays?: number;
  inventoryIndex?: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColour: string;
  isSquareEdges: boolean;
  isElevated?: boolean;
}

export const StyledClassCard = styled('div', {
  shouldForwardProp: (prop) =>
    ![
      'gridColumn',
      'numberOfDays',
      'inventoryIndex',
      'offsetMinutes',
      'durationMinutes',
      'backgroundColour',
      'isSquareEdges',
      'isElevated',
    ].includes(prop.toString()),
})<StyledClassCardProps>(({
  gridColumn,
  numberOfDays = 5,
  inventoryIndex,
  offsetMinutes = 0,
  durationMinutes,
  isElevated = false,
}) => {
  const timeSlotStyle = getTimeSlotStyle(offsetMinutes, durationMinutes ?? 0);
  const dayIndex = inventoryIndex === undefined ? (gridColumn ?? 2) - 2 : numberOfDays;
  const translateX = `calc(${(dayIndex * 100).toString()}% + ${(
    dayIndex * gridGap +
    (inventoryIndex === undefined ? 0 : inventoryMargin + gridGap)
  ).toString()}px)`;
  const translateY =
    inventoryIndex === undefined
      ? (offsetMinutes / 60) * (rowHeight + gridGap)
      : inventoryIndex * (rowHeight + gridGap);

  return {
    ...(gridColumn === undefined
      ? {}
      : {
          gridColumn: '2 / -1',
          gridRow: '2 / -1',
          alignSelf: 'start',
          width: `calc((100% - ${inventoryMargin.toString()}px - ${((numberOfDays + 1) * gridGap).toString()}px) / ${(numberOfDays + 1).toString()})`,
          transform: `translate(${translateX}, ${translateY.toString()}px)`,
          ...(inventoryIndex === undefined
            ? { height: Math.max(0, timeSlotStyle.height - 1) }
            : { height: rowHeight - 1 }),
        }),
    boxSizing: 'border-box',
    position: 'relative',
    left: 0,
    top: 0,
    minHeight: inventoryIndex === undefined ? 0 : 28,
    zIndex: isElevated ? 750 : 20,
    userSelect: 'none',
    transition: `transform ${transitionTime.toString()}ms ease, left ${transitionTime.toString()}ms ease, top ${transitionTime.toString()}ms ease, height 150ms ease, width ${transitionTime.toString()}ms ease`,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
});

export const StyledClassCardInner = styled(Card, {
  shouldForwardProp: (prop) => !['backgroundColour', 'isSquareEdges', 'isElevated'].includes(prop.toString()),
})<Pick<StyledClassCardProps, 'backgroundColour' | 'isSquareEdges' | 'isElevated'>>(
  ({ theme, backgroundColour, isSquareEdges, isElevated = false }) => ({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.9rem',
    lineHeight: 1.25,
    width: '100%',
    height: '100%',
    minHeight: 0,
    padding: '2px 8px',
    overflow: 'hidden',
    color: theme.palette.in_text.primary,
    backgroundColor: backgroundColour,
    borderRadius: isSquareEdges ? 0 : theme.shape.borderRadius,
    boxShadow: isElevated ? theme.shadows[24] : '0 1px 3px rgb(0 0 0 / 20%)',
    transform: `scale(${isElevated ? '1.1' : '1'})`,
    transition: `transform ${transitionTime.toString()}ms ease, box-shadow ${transitionTime.toString()}ms ease`,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '&:hover .class-expand-button, &:focus-within .class-expand-button': {
      opacity: 0.4,
      pointerEvents: 'auto',
    },
    '& .class-expand-button:hover, & .class-expand-button:focus-visible': {
      opacity: 1,
    },
  }),
);

export const StyledClassCardHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  width: 100%;
`;

export const StyledClassCardName = styled(StyledCardName)`
  text-align: center;
  font-size: inherit;
`;

export const StyledClassCardInfo = styled(StyledCardInfo)`
  & .MuiSvgIcon-root {
    font-size: inherit;
    vertical-align: -0.125em;
  }
`;
