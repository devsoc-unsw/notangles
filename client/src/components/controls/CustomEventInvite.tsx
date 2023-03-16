import { Link } from '@mui/icons-material';
import { ListItemIcon, TextField, Card } from '@mui/material';
import { CustomEventInviteProp } from '../../interfaces/PropTypes';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { useState } from 'react';
import { styled } from '@mui/system';

// style the card
const PreviewCard = styled(Card)`
  padding: 10px;
  margin: 10px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #1f7e8c;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  color: white;
`;

const CustomEventInvite: React.FC<CustomEventInviteProp> = ({ link, setLink }) => {
  const [eventPreview, setEventPreview] = useState(false);
  const [event, setEvent] = useState({ name: '', location: '' });

  const checkRender = (link: string) => {
    setLink(link);
    var isBase64 = require('is-base64');
    if (isBase64(link) && link.length > 0) {
      const inviteEvent = JSON.parse(atob(link));
      setEventPreview(true);
      setEvent({ name: inviteEvent.event.name, location: inviteEvent.event.location });
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
        {eventPreview && (
          <PreviewCard>
            <StyledListItemText>
              <strong>{event.name}</strong> {event.location}
            </StyledListItemText>
          </PreviewCard>
        )}
      </StyledListItem>
    </>
  );
};

export default CustomEventInvite;
