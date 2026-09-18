import { Delete, MoreHoriz } from '@mui/icons-material';
import { Grid, ListItemIcon, ListItemText, MenuItem, TouchRippleActions } from '@mui/material';
import { useRef, useState } from 'react';

import { useAddTimetableEvent, useDeleteTimetableEvent } from '../../../api/timetable/mutations';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { EventCard } from '../../../interfaces/Timetable';
import { StyledLocationIcon, StyledMenu } from '../../../styles/CustomEventStyles';
import {
  ExpandButton,
  StyledCard,
  StyledCardButtonBase,
  StyledCardInfo,
  StyledCardInner,
  StyledCardInnerGrid,
  StyledCardName,
} from '../../../styles/DroppedCardStyles';
import { decodeColor } from '../../../utils/colors';
import EventContextMenu from './EventContextMenu';
import ExpandedEventView from './ExpandedEventView';

interface DroppedEventProps {
  timetableId: string;
  card: EventCard;
  numberOfDays: number;
  earliestStartHour: number;
  clashIndex: number;
  cardWidth: number;
  cellWidth: number;
  eventCopied: boolean;
  setCopiedEvent: React.Dispatch<React.SetStateAction<EventCard | undefined>>;
  handlePasteEvent: (
    pasteTime: { day: number; start: number; end: number },
    setContextMenu: React.Dispatch<React.SetStateAction<{ mouseX: number; mouseY: number } | null>>,
  ) => void;
}

const DroppedEvent: React.FC<DroppedEventProps> = ({
  timetableId,
  card,
  numberOfDays,
  earliestStartHour,
  clashIndex,
  cardWidth,
  cellWidth,
  eventCopied,
  setCopiedEvent,
  handlePasteEvent,
}) => {
  const { isSquareEdges, preferredTheme } = useGetUserSettingsQuery();

  const rippleRef = useRef<TouchRippleActions | null>(null);
  const [hovered, setHovered] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const isLessThanOneHour = card.time.end - card.time.start < 60;

  const eventCreateMutation = useAddTimetableEvent();
  const handleDuplicateEvent = () => {
    eventCreateMutation.mutate({
      event: {
        timetableId,
        colour: card.color,
        title: card.name,
        location: card.location,
        type: card.eventType,
        start: card.time.start,
        end: card.time.end,
        dayOfWeek: card.time.day,
      },
    });
    setContextMenu(null);
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setPopupOpen(true);
    setContextMenu(null);
  };

  const eventDeleteMutation = useDeleteTimetableEvent();
  const handleDeleteEvent = () => {
    eventDeleteMutation.mutate({
      timetableId,
      eventId: card.eventId,
    });
    setContextMenu(null);
  };

  return (
    <>
      <StyledCard
        card={card}
        nDays={numberOfDays}
        earliestStartTime={earliestStartHour}
        isSquareEdges={isSquareEdges}
        clashIndex={clashIndex}
        cardWidth={cardWidth}
        cellWidth={cellWidth}
        onTouchStart={() => {
          // Mobile/touchscreen functionality
          // TODO: Work out a nicer way to handle this as there is no clean way to un-touch an element
          setHovered(true);
        }}
        onMouseOver={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
        }}
      >
        {card.eventType === 'CUSTOM' ? (
          <EventContextMenu
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            event={card}
            eventCopied={eventCopied}
            setCopiedEvent={setCopiedEvent}
            handlePasteEvent={handlePasteEvent}
            handleDuplicateEvent={handleDuplicateEvent}
            handleEditEvent={handleEditEvent}
            handleDeleteEvent={handleDeleteEvent}
          />
        ) : (
          <>
            <StyledMenu
              open={contextMenu !== null}
              anchorReference="anchorPosition"
              anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
              onClose={() => {
                setContextMenu(null);
              }}
              autoFocus={false}
            >
              <MenuItem onClick={handleDeleteEvent}>
                <ListItemIcon>
                  <Delete fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </StyledMenu>
          </>
        )}
        <StyledCardInner
          hasClash={false}
          clashColour="none"
          backgroundColour={decodeColor(card.color, preferredTheme)}
          isSquareEdges={isSquareEdges}
        >
          <StyledCardButtonBase rippleRef={rippleRef}>
            <StyledCardInnerGrid container justifyContent="center" alignItems="center">
              <Grid size={11}>
                <StyledCardName>{card.name}</StyledCardName>
                {!isLessThanOneHour && card.location && (
                  <StyledCardInfo>
                    <StyledLocationIcon />
                    {card.location}
                  </StyledCardInfo>
                )}
              </Grid>
            </StyledCardInnerGrid>
            {hovered && (
              <ExpandButton
                disableRipple
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onTouchStart={(event) => {
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
          </StyledCardButtonBase>
        </StyledCardInner>
      </StyledCard>
      <ExpandedEventView
        key={popupOpen ? 'open' : 'closed'}
        event={card}
        timetableId={timetableId}
        popupOpen={popupOpen}
        handleClose={() => {
          setPopupOpen(false);
        }}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </>
  );
};

export default DroppedEvent;
