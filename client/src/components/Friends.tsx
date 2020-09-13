import React from 'react';
import {
  makeStyles, createStyles,
} from '@material-ui/core/styles';
import styled from 'styled-components';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

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


// interface FriendsListItemProps {
// }

// const FriendListItem: React.FC<FriendsListItemProps> = ({
const FriendListItem: React.FC<any> = () => (

  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
    </ListItemAvatar>
    <ListItemText
      primary="Friendy McFriendFace"
      secondary={(
        <>
          <Typography
            component="span"
            variant="body2"
            color="textPrimary"
          >
            Ali Connors
          </Typography>
          {" — I'll be in your neighborhood doing errands this…"}
        </>
      )}
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
        <List>
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
          <FriendListItem />
        </List>

        <Divider />

        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </DrawerContainer>
    </StyledDrawer>

  );
};

export default FriendsDrawer;
