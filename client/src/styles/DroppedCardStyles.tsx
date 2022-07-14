import { styled } from '@mui/system';
import { Button, Card } from '@mui/material';
import { borderRadius, borderWidth } from '../constants/theme';
import { defaultTransition } from '../utils/Drag';

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
