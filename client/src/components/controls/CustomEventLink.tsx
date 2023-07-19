import { useState } from 'react';
import { Link, LocationOn } from '@mui/icons-material';
import { ListItemIcon, TextField, Card, CardProps } from '@mui/material';
import { styled } from '@mui/system';
import { CustomEventLinkProp } from '../../interfaces/PropTypes';
import { StyledListItem } from '../../styles/ControlStyles';
import { StyledListItemText } from '../../styles/CustomEventStyles';

const PreviewCard = styled(Card)<CardProps & { bgColour: string }>`
  padding: 40px 20px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
  background-color: ${(props) => (props.bgColour !== '' ? props.bgColour : '#1f7e8c')};
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  color: white;
`;

const StyledLocationOn = styled(LocationOn)`
  font-size: 12px;
`;

const CustomEventLink: React.FC<CustomEventLinkProp> = ({ link, setLink, setAlertMsg, setErrorVisibility }) => {
  const [eventPreview, setEventPreview] = useState(false);
  const [event, setEvent] = useState({ name: '', location: '', color: '' });

  const checkRender = (link: string) => {
    setLink(link);
    var isBase64 = require('is-base64');
    if (isBase64(link) && link.length > 0) {
      try {
        const linkEvent = JSON.parse(atob(link));
        setEventPreview(true);
        setEvent({ name: linkEvent.event.name, location: linkEvent.event.location, color: linkEvent.event.color });
      } catch {
        setAlertMsg('Invalid event link');
        setErrorVisibility(true);
        setEventPreview(false);
        setEvent({ name: '', location: '', color: '' });
      }
    }
  };

  return (
    <>
      <StyledListItem>
        <ListItemIcon>
          <Link />
        </ListItemIcon>
        <TextField
          id="outlined-required"
          label="Event Link"
          onChange={(e) => checkRender(e.target.value)}
          variant="outlined"
          fullWidth
          required
          defaultValue={link}
        />
        <br />
      </StyledListItem>
      {eventPreview && (
        <PreviewCard bgColour={event.color}>
          <StyledListItemText>
            <strong>{event.name}</strong>
            <br />
            <StyledLocationOn />
            {event.location}
          </StyledListItemText>
        </PreviewCard>
      )}
    </>
  );
};

export default CustomEventLink;
