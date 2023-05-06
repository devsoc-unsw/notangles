import { Link, LocationOn } from '@mui/icons-material';
import { ListItemIcon, TextField, Card } from '@mui/material';
import { CustomEventLinkProp } from '../../interfaces/PropTypes';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { useState } from 'react';
import { styled } from '@mui/system';

const PreviewCard = styled(Card)`
  padding: 40px 20px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
  background-color: #1f7e8c;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  color: white;
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
        setAlertMsg('Invalid event code');
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
          label="Event Code"
          onChange={(e) => checkRender(e.target.value)}
          variant="outlined"
          fullWidth
          required
          defaultValue={link}
        />
        <br />
      </StyledListItem>
      {eventPreview && (
        <PreviewCard sx={{ bgcolor: event.color }}>
          <StyledListItemText>
            <strong>{event.name}</strong>
            <br />
            <LocationOn sx={{ fontSize: '12px' }} />
            {event.location}
          </StyledListItemText>
        </PreviewCard>
      )}
    </>
  );
};

export default CustomEventLink;
