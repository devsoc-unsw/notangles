import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { CSSProperties, PointerEventHandler } from 'react';

import { rowHeight } from '../../../constants/timetable';

interface StyledClassCardProps {
  gridColumn?: number;
  inventoryIndex?: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColour: string;
  squareEdges: boolean;
}

const StyledClassCard = styled(Card, {
  shouldForwardProp: (prop) =>
    !['gridColumn', 'inventoryIndex', 'offsetMinutes', 'durationMinutes', 'backgroundColour', 'squareEdges'].includes(
      prop.toString(),
    ),
})<StyledClassCardProps>(
  ({ theme, gridColumn, inventoryIndex, offsetMinutes = 0, durationMinutes, backgroundColour, squareEdges }) => ({
    ...(gridColumn === undefined
      ? {}
      : {
          gridColumn,
          gridRow: '2 / -1',
          alignSelf: 'start',
          transform: `translateY(${theme.spacing(
            (inventoryIndex === undefined ? (offsetMinutes / 60) * rowHeight : inventoryIndex * (rowHeight + 1)) / 8,
          )})`,
          height: inventoryIndex === undefined ? Math.max(((durationMinutes ?? 0) / 60) * rowHeight, 28) : rowHeight,
        }),
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    minHeight: 28,
    padding: '6px 8px',
    overflow: 'hidden',
    zIndex: 20,
    color: theme.palette.in_text.primary,
    backgroundColor: backgroundColour,
    borderRadius: squareEdges ? 0 : theme.shape.borderRadius,
    boxShadow: '0 1px 3px rgb(0 0 0 / 20%)',
  }),
);

const CardHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`;

const CardTitle = styled('strong')`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 0.85rem;
`;

const CardDetails = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
`;

interface ClassCardProps extends StyledClassCardProps {
  title: string;
  details?: string;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  isDragSource?: boolean;
  style?: CSSProperties;
}

const ClassCard = ({ title, details, onPointerDown, isDragSource, style, ...styleProps }: ClassCardProps) => (
  <StyledClassCard
    {...styleProps}
    title={[title, details].filter(Boolean).join(' — ')}
    onPointerDown={onPointerDown}
    style={{ cursor: onPointerDown ? 'grab' : undefined, opacity: isDragSource ? 0.35 : 1, ...style }}
  >
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    {details && <CardDetails>{details}</CardDetails>}
  </StyledClassCard>
);

export default ClassCard;
