import React from 'react';
import {
  makeStyles, createStyles,
} from '@material-ui/core/styles';
import styled from 'styled-components';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)`
    width: drawerWidth;
    flex-shrink: 0;
`;

const DrawerContainer = styled.div`
    margin-top: 70px;
    overflow: auto;
`;

// ???
// https://stackoverflow.com/questions/49656531/styling-material-ui-drawer-component-with-styled-components
const useStyles = makeStyles(() => createStyles({
  drawerPaper: {
    width: drawerWidth,
  },
}));


interface FriendsListItemProps {
  name: string,
  imageSrc: string,
  courses?: Array<string>
}
// https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250
const FriendListSuggestion: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
}) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <ListItemText
      primary={name}
      secondary={(
        <Button variant="contained">SEND REQUEST</Button>
      )}
    />
  </ListItem>
);

const FriendListRequest: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
}) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <ListItemText
      primary={name}
      secondary={(
        <Button variant="contained">ADD FRIEND</Button>
      )}
    />
  </ListItem>
);

const FriendListAdded: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
  courses,
}) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <ListItemText
      primary={name}
      secondary={courses ? courses.join(', ') : null}
    />
  </ListItem>
);

interface FriendsProps {
  isFriendsListOpen: boolean
}

const FriendsDrawer: React.FC<FriendsProps> = ({
  isFriendsListOpen,
}) => {
  const classes = useStyles();

  // TODO map props
  // {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
  //     <ListItem button key={text}>
  //     <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
  //     <ListItemText primary={text} />
  //     </ListItem>
  // ))}

  const mockClassArray = ['COMP1511', 'COMP1531', 'MATH1081'];

  return (

    <StyledDrawer
      transitionDuration={200}
      variant="persistent"
      anchor="left"
      open={isFriendsListOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <DrawerContainer>
        <ListItem alignItems="flex-start">
          Friend Requests
        </ListItem>

        <List>
          <FriendListRequest name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListRequest name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListRequest name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListRequest name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
        </List>

        <ListItem alignItems="flex-start">
          Friends
        </ListItem>

        <List>
          <FriendListAdded name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" courses={mockClassArray} />
          <FriendListAdded name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" courses={mockClassArray} />
          <FriendListAdded name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" courses={mockClassArray} />
          <FriendListAdded name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" courses={mockClassArray} />
        </List>

        <ListItem alignItems="flex-start">
          Suggested Friends
        </ListItem>

        <List>
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
          <FriendListSuggestion name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
        </List>

      </DrawerContainer>
    </StyledDrawer>

  );
};

export default FriendsDrawer;
