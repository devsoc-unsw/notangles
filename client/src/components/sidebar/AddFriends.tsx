import React from 'react';
import { styled } from '@mui/system';
import { Link, Typography, TextField, Divider, Box, Button } from '@mui/material';

const ChangeItem = styled('div')`
  padding: 0.5vh 0;
`;

const ChangeTitle = styled('div')`
  font-weight: bold;
  font-size: 1.1rem;
`;

const AddFriends: React.FC = () => {
  return (
    <>
      <Typography gutterBottom variant="body2">
        Add existing friends on Notangles or send them an invite to Notangles, both via their zID. Friends can view each other's
        timetables or collaborate on timetables.
      </Typography>
      <Divider />
      <form>
        <TextField label="Enter zIDs" margin="normal" />
        <div>
          <Button variant="contained"> ADD FRIENDS</Button>
        </div>
      </form>
    </>
  );
};

export default AddFriends;
