import { Button, Card, Grid, List } from '@mui/material';
import { styled } from '@mui/system';
import { borderRadius, borderWidth } from '../constants/theme';
import { EventPeriod } from '../interfaces/Periods';
import { ClassCard, defaultTransition, elevatedScale, getDefaultShadow, getElevatedShadow } from '../utils/Drag';
import { classTranslateX, classTranslateY, getClassHeight } from '../utils/translateCard';

export const transitionName = 'class';

export const classTransformStyle = (
  card: ClassCard | EventPeriod,
  earliestStartTime: number,
  nDays?: number,
  y?: number,
  clashIndex?: number,
  width?: number,
  cellWidth: number = 0
) => `translate(${classTranslateX(card, nDays, clashIndex, width, cellWidth)}, ${classTranslateY(card, earliestStartTime, y)})`;

export const ExpandButton = styled(Button)`
  position: absolute;
  top: 3px;
  right: 3px;
  box-shadow: none;
  min-width: 0px;
  padding: 0;
  opacity: 40%;
  border-radius: 2px;

  &:hover {
    opacity: 100%;
  }
`;

export const StyledCard = styled('div', {
  shouldForwardProp: (prop) =>
    !['card', 'nDays', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'cardWidth', 'cellWidth'].includes(
      prop.toString()
    ),
})<{
  card: ClassCard | EventPeriod;
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
  shouldForwardProp: (prop) => !['hasClash', 'isSquareEdges', 'clashColour', 'backgroundColour'].includes(prop.toString()),
})<{
  hasClash: boolean;
  isSquareEdges: boolean;
  clashColour: string;
  backgroundColour: string;
}>`
  display: flex;
  flex-direction: column;
  color: white;
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : `${borderRadius}px`)};
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ clashColour }) => `solid ${clashColour} ${borderWidth}px`};
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

export const StyledList = styled(List)`
  width: 395px;
  padding: 12px 15px;
`;
