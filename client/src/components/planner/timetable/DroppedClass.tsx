import { LocationOn, MoreHoriz, PeopleAlt, Warning } from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { type PointerEventHandler, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import {
  ClassExpandButton,
  StyledClassCard,
  StyledClassCardHeader,
  StyledClassCardInfo,
  StyledClassCardInner,
  StyledClassCardName,
} from '../../../styles/DroppedClassStyles';
import type { KeyedClassCard } from './classCardLayout';
import ExpandedClassView from './ExpandedClassView';
import type { ClassCardView } from './useDroppedClasses';

interface DroppedClassProps {
  card: KeyedClassCard<ClassCardView>;
  classes: TimetableClass[];
  numberOfDays: number;
  isSquareEdges: boolean;
  isElevated: boolean;
  canExpand: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  handleSelectClass: (classData: TimetableClass, classId: string) => void;
}

const DroppedClass: React.FC<DroppedClassProps> = ({
  card,
  classes,
  numberOfDays,
  isSquareEdges,
  isElevated,
  canExpand,
  onPointerDown,
  handleSelectClass,
}) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const classData = classes.find((candidate) => candidate.class_id === card.classId);
  const { title, details, metadata } = card;

  const handleClose = (classId: string) => {
    if (classData && classId !== classData.class_id) handleSelectClass(classData, classId);
    setPopupOpen(false);
  };

  return (
    <>
      <StyledClassCard
        gridColumn={card.gridColumn}
        numberOfDays={numberOfDays}
        inventoryIndex={card.inventoryIndex}
        offsetMinutes={card.offsetMinutes}
        durationMinutes={card.durationMinutes}
        backgroundColour={card.backgroundColour}
        isSquareEdges={isSquareEdges}
        isElevated={isElevated}
        data-class-card={card.key}
        title={[title, details, metadata?.enrolment, metadata?.weeks, metadata?.locations.join(', ')]
          .filter(Boolean)
          .join(' — ')}
        onPointerDown={onPointerDown}
        style={{ cursor: onPointerDown ? 'grab' : undefined }}
      >
        <StyledClassCardInner
          backgroundColour={card.backgroundColour}
          isSquareEdges={isSquareEdges}
          isElevated={isElevated}
        >
          <StyledClassCardHeader>
            <StyledClassCardName as="strong">{title}</StyledClassCardName>
          </StyledClassCardHeader>
          {metadata ? (
            <>
              <StyledClassCardInfo as="div">
                <span style={{ fontWeight: metadata.warning ? 'bolder' : undefined }}>
                  {metadata.warning ? (
                    <Warning sx={{ color: yellow[400], mr: '0.2rem' }} />
                  ) : (
                    <PeopleAlt sx={{ mr: '0.2rem' }} />
                  )}
                  {metadata.enrolment}
                </span>
                {metadata.weeks && ` (${metadata.weeks})`}
              </StyledClassCardInfo>
              {metadata.locations.length > 0 && (
                <StyledClassCardInfo as="div">
                  <LocationOn />
                  {metadata.locations[0]}
                  {metadata.locations.length > 1 && ` + ${(metadata.locations.length - 1).toString()}`}
                </StyledClassCardInfo>
              )}
            </>
          ) : (
            details && <StyledClassCardInfo as="div">{details}</StyledClassCardInfo>
          )}
          {canExpand && classData && (
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
                setPopupOpen(true);
              }}
            >
              <MoreHoriz fontSize="large" />
            </ClassExpandButton>
          )}
        </StyledClassCardInner>
      </StyledClassCard>
      {popupOpen && classData && (
        <ExpandedClassView
          key={[classData.class_id, card.timeIndex].join('-')}
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
