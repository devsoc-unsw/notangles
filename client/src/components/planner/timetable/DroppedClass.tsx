import { LocationOn, MoreHoriz, PeopleAlt, Warning } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { yellow } from '@mui/material/colors';
import { type PointerEventHandler, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import {
  ExpandButton,
  StyledCard,
  StyledCardInfo,
  StyledCardInner,
  StyledCardInnerGrid,
  StyledCardName,
} from '../../../styles/DroppedCardStyles';
import type { CardTransitionChildProps } from './CardTransition';
import type { KeyedClassCard } from './classCardKeys';
import type { ClassCardView } from './classCardViews';
import ExpandedClassView from './ExpandedClassView';

const metadataIconStyles = { fontSize: 'inherit', verticalAlign: '-0.125em' };

interface DroppedClassProps extends CardTransitionChildProps {
  timetableId: string;
  card: KeyedClassCard<ClassCardView>;
  classes: TimetableClass[];
  numberOfDays: number;
  earliestStartHour: number;
  cellWidth: number;
  cardWidth: number;
  clashIndex: number;
  isSquareEdges: boolean;
  isElevated: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  handleSelectClass: (classData: TimetableClass, classId: string) => void;
}

const DroppedClass: React.FC<DroppedClassProps> = ({
  timetableId,
  card,
  classes,
  numberOfDays,
  earliestStartHour,
  cellWidth,
  cardWidth,
  clashIndex,
  isSquareEdges,
  isElevated,
  onPointerDown,
  handleSelectClass,
  cardRef,
  className,
  isExiting = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const classData = classes.find((candidate) => candidate.class_id === card.classId);
  const { name, details, metadata } = card;

  const handleClose = (classId: string) => {
    if (classData && classId !== classData.class_id) handleSelectClass(classData, classId);
    setPopupOpen(false);
  };

  return (
    <>
      <StyledCard
        ref={cardRef}
        className={className}
        data-card-exiting={isExiting}
        inert={isExiting}
        aria-hidden={isExiting || undefined}
        card={card}
        nDays={numberOfDays}
        y={card.inventoryIndex}
        earliestStartTime={earliestStartHour}
        cellWidth={cellWidth}
        cardWidth={cardWidth}
        clashIndex={clashIndex}
        isSquareEdges={isSquareEdges}
        isElevated={isElevated}
        data-class-card={card.key}
        title={[name, details, metadata?.enrolment, metadata?.weeks, metadata?.locations.join(', ')]
          .filter(Boolean)
          .join(' — ')}
        onPointerDown={onPointerDown}
        onTouchStart={() => {
          setHovered(true);
        }}
        onMouseOver={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        style={{ cursor: onPointerDown ? 'grab' : 'default' }}
      >
        <StyledCardInner
          hasClash={false}
          clashColour="transparent"
          backgroundColour={card.color}
          isSquareEdges={isSquareEdges}
          isElevated={isElevated}
        >
          <StyledCardInnerGrid container justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <Grid size={11}>
              <StyledCardName>{name}</StyledCardName>

              {/* Show enrolment, weeks and location of each class */}
              {metadata ? (
                <StyledCardInfo>
                  <span style={{ fontWeight: metadata.warning ? 'bolder' : undefined }}>
                    {metadata.warning ? (
                      <Warning sx={{ ...metadataIconStyles, color: yellow[400], mr: '0.2rem' }} />
                    ) : (
                      <PeopleAlt sx={{ ...metadataIconStyles, mr: '0.2rem' }} />
                    )}
                    {metadata.enrolment}
                  </span>
                  {metadata.weeks && ` (${metadata.weeks})`}
                  {metadata.locations.length > 0 && (
                    <>
                      <br />
                      <LocationOn sx={metadataIconStyles} />
                      {metadata.locations[0]}
                      {metadata.locations.length > 1 && ` + ${(metadata.locations.length - 1).toString()}`}
                    </>
                  )}
                </StyledCardInfo>
              ) : (
                details && <StyledCardInfo>{details}</StyledCardInfo>
              )}
            </Grid>
          </StyledCardInnerGrid>

          {/* Show the details button when the card is hovered */}
          {classData && hovered && (
            <ExpandButton
              aria-label={`Show details for ${name}`}
              aria-haspopup="dialog"
              disableRipple
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                setPopupOpen(true);
              }}
              sx={{ color: '#f5f5f5' }}
            >
              <MoreHoriz fontSize="large" />
            </ExpandButton>
          )}
        </StyledCardInner>
      </StyledCard>

      {/* Once the button is clicked, the ExpandedClassView with details will be shown */}
      {popupOpen && classData && !isExiting && (
        <ExpandedClassView
          key={[classData.class_id, card.timeIndex].join('-')}
          timetableId={timetableId}
          classData={classData}
          classes={classes}
          timeIndex={card.timeIndex}
          handleClose={handleClose}
        />
      )}
    </>
  );
};

export default DroppedClass;
