import { LocationOn, MoreHoriz, PeopleAlt, Warning } from '@mui/icons-material';
import { Card } from '@mui/material';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import type { PointerEventHandler } from 'react';

import { inventoryMargin } from '../../../constants/theme';
import { gridGap, rowHeight, transitionTime } from '../../../constants/timetable';
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
  dayCount?: number;
  inventoryIndex?: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColour: string;
  squareEdges: boolean;
  isElevated?: boolean;
}

const StyledClassCard = styled('div', {
  shouldForwardProp: (prop) =>
    ![
      'gridColumn',
      'dayCount',
      'inventoryIndex',
      'offsetMinutes',
      'durationMinutes',
      'backgroundColour',
      'squareEdges',
      'isElevated',
    ].includes(prop.toString()),
})<StyledClassCardProps>(({
  gridColumn,
  dayCount = 5,
  inventoryIndex,
  offsetMinutes = 0,
  durationMinutes,
  isElevated = false,
}) => {
  const timeSlotStyle = getTimeSlotStyle(offsetMinutes, durationMinutes ?? 0);
  const dayIndex = inventoryIndex === undefined ? (gridColumn ?? 2) - 2 : dayCount;
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
          width: `calc((100% - ${inventoryMargin.toString()}px - ${((dayCount + 1) * gridGap).toString()}px) / ${(dayCount + 1).toString()})`,
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

const ClassCardInner = styled(Card, {
  shouldForwardProp: (prop) => !['backgroundColour', 'squareEdges', 'isElevated'].includes(prop.toString()),
})<Pick<StyledClassCardProps, 'backgroundColour' | 'squareEdges' | 'isElevated'>>(
  ({ theme, backgroundColour, squareEdges, isElevated = false }) => ({
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
    borderRadius: squareEdges ? 0 : theme.shape.borderRadius,
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
  cardKey?: string;
}

const ClassCard = ({ title, details, metadata, onPointerDown, onExpand, cardKey, ...styleProps }: ClassCardProps) => (
  <StyledClassCard
    {...styleProps}
    data-class-card={cardKey}
    title={[title, details, metadata?.enrolment, metadata?.weeks, metadata?.locations.join(', ')]
      .filter(Boolean)
      .join(' — ')}
    onPointerDown={onPointerDown}
    style={{
      cursor: onPointerDown ? 'grab' : undefined,
    }}
  >
    <ClassCardInner
      backgroundColour={styleProps.backgroundColour}
      squareEdges={styleProps.squareEdges}
      isElevated={styleProps.isElevated}
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
      {onExpand && (
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
    </ClassCardInner>
  </StyledClassCard>
);

export default ClassCard;
