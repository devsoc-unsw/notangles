import { styled } from '@mui/system';
import { Button, Card, Grid } from '@mui/material';
import { borderRadius, borderWidth } from '../constants/theme';
import { ClassCard, defaultTransition, elevatedScale, getDefaultShadow, getElevatedShadow } from '../utils/Drag';
import { EventPeriod } from '../interfaces/Periods';
import { classTranslateX, classTranslateY, getClassHeight } from '../utils/translateCard';

export const transitionName = 'class';

export const classTransformStyle = (
  card: ClassCard | EventPeriod,
  earliestStartTime: number,
  days?: string[],
  y?: number,
  clashIndex?: number,
  width?: number,
  cellWidth: number = 0
) => `translate(${classTranslateX(card, days, clashIndex, width, cellWidth)}, ${classTranslateY(card, earliestStartTime, y)})`;

export const ExpandButton = styled(Button)`
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

export const StyledCard = styled('div', {
  shouldForwardProp: (prop) =>
    !['card', 'days', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'cardWidth', 'cellWidth'].includes(
      prop.toString()
    ),
})<{
  card: ClassCard | EventPeriod;
  days: string[];
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
  transform: ${({ card, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth }) =>
    classTransformStyle(card, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth)};
  width: ${({ cardWidth }) => cardWidth}%;
  height: ${({ card }) => getClassHeight(card)};
  box-sizing: border-box;
  z-index: 100;
  cursor: grab;
  padding: 1px;
  transition: ${defaultTransition}, z-index 0s;

  /* uncomment me whoever decides to fix <CSSTransition>
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
  } */
`;

export const StyledCardInner = styled(Card, {
  shouldForwardProp: (prop) => !['hasClash', 'isSquareEdges', 'clashColour'].includes(prop.toString()),
})<{
  hasClash: boolean;
  isSquareEdges: boolean;
  clashColour: string;
}>`
  display: flex;
  flex-direction: column;
  color: white;
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : `${borderRadius}px`)};
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ clashColour }) => `solid ${clashColour} ${borderWidth}px`};
  outline-offset: -4px;
  height: 100%;
  position: relative;
`;

export const StyledCardName = styled('p')`
  width: 100%;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledCardInfo = styled(StyledCardName)`
  font-size: 85%;
`;
