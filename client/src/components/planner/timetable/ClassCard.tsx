import { LocationOn, MoreHoriz, PeopleAlt, Warning } from '@mui/icons-material';
import { Card } from '@mui/material';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import type { CSSProperties, PointerEventHandler } from 'react';

import { gridGap, rowHeight } from '../../../constants/timetable';
import { ExpandButton, getTimeSlotStyle } from '../../../styles/DroppedCardStyles';
import type { ClassCardMetadata } from './useTimetableClasses';

const ClassExpandButton = styled(ExpandButton)`
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
})<StyledClassCardProps>(({
  theme,
  gridColumn,
  inventoryIndex,
  offsetMinutes = 0,
  durationMinutes,
  backgroundColour,
  squareEdges,
}) => {
  const timeSlotStyle = getTimeSlotStyle(offsetMinutes, durationMinutes ?? 0);
  return {
    ...(gridColumn === undefined
      ? {}
      : {
          gridColumn,
          gridRow: '2 / -1',
          alignSelf: 'start',
          ...(inventoryIndex === undefined
            ? { ...timeSlotStyle, height: Math.max(0, timeSlotStyle.height - 1) }
            : {
                transform: `translateY(${(inventoryIndex * (rowHeight + gridGap)).toString()}px)`,
                height: rowHeight - 1,
              }),
        }),
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.9rem',
    lineHeight: 1.25,
    width: 'calc(100% - 1px)',
    minHeight: inventoryIndex === undefined ? 0 : 28,
    padding: '2px 8px',
    overflow: 'hidden',
    zIndex: 20,
    color: theme.palette.in_text.primary,
    backgroundColor: backgroundColour,
    borderRadius: squareEdges ? 0 : theme.shape.borderRadius,
    boxShadow: '0 1px 3px rgb(0 0 0 / 20%)',
    '&:hover .class-expand-button, &:focus-within .class-expand-button': {
      opacity: 0.4,
      pointerEvents: 'auto',
    },
    '& .class-expand-button:hover, & .class-expand-button:focus-visible': {
      opacity: 1,
    },
  };
});

const CardHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  width: 100%;
`;

const CardTitle = styled('strong')`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: inherit;
`;

const CardDetails = styled('div')`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 85%;

  & .MuiSvgIcon-root {
    font-size: inherit;
    vertical-align: -0.125em;
  }
`;

interface ClassCardProps extends StyledClassCardProps {
  title: string;
  details?: string;
  metadata?: ClassCardMetadata;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onExpand?: () => void;
  isDragSource?: boolean;
  style?: CSSProperties;
}

const ClassCard = ({
  title,
  details,
  metadata,
  onPointerDown,
  onExpand,
  isDragSource,
  style,
  ...styleProps
}: ClassCardProps) => (
  <StyledClassCard
    {...styleProps}
    title={[title, details, metadata?.enrolment, metadata?.weeks, metadata?.locations.join(', ')]
      .filter(Boolean)
      .join(' — ')}
    onPointerDown={onPointerDown}
    style={{ cursor: onPointerDown ? 'grab' : undefined, opacity: isDragSource ? 0.35 : 1, ...style }}
  >
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    {metadata ? (
      <>
        <CardDetails>
          <span style={{ fontWeight: metadata.warning ? 'bolder' : undefined }}>
            {metadata.warning ? (
              <Warning sx={{ color: yellow[400], mr: '0.2rem' }} />
            ) : (
              <PeopleAlt sx={{ mr: '0.2rem' }} />
            )}
            {metadata.enrolment}
          </span>
          {metadata.weeks && ` (${metadata.weeks})`}
        </CardDetails>
        {metadata.locations.length > 0 && (
          <CardDetails>
            <LocationOn />
            {metadata.locations[0]}
            {metadata.locations.length > 1 && ` + ${(metadata.locations.length - 1).toString()}`}
          </CardDetails>
        )}
      </>
    ) : (
      details && <CardDetails>{details}</CardDetails>
    )}
    {onExpand && !isDragSource && (
      <ClassExpandButton
        className="class-expand-button"
        aria-label={`Show details for ${title}`}
        aria-haspopup="dialog"
        disableRipple
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onExpand();
        }}
      >
        <MoreHoriz fontSize="large" />
      </ClassExpandButton>
    )}
  </StyledClassCard>
);

export default ClassCard;
