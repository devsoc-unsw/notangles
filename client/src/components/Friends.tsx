import React from 'react';
import {
  makeStyles, createStyles,
} from '@material-ui/core/styles';
import styled from 'styled-components';
import FacebookLogin from 'react-facebook-login';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

const drawerWidth = 240;
const loggedOutImgUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/739a0188-3fa1-4c9c-be25-fe0e3690300d/d9hzoc1-2967e7dd-8047-43f5-900f-cc6fb991bf10.png/v1/fill/w_1121,h_713,strp/neko_atsume___tubbs_cat_vector_by_elexisheaven_d9hzoc1-pre.png';

const StyledDrawer = styled(Drawer)`
    width: drawerWidth;
    flex-shrink: 0;
`;

const DrawerContainer = styled.div`
    margin-top: 70px;
    overflow: auto;
`;

const LoginComponent = styled.div`
    text-align: center;
    padding: 20px;
    margin-top: 45%;
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
        <Button variant="contained" size="small">SEND REQUEST</Button>
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
        <Button variant="contained" size="small">ADD FRIEND</Button>
      )}
    />
  </ListItem>
);

const FriendListAdded: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
  courses,
}) => (
  <ListItem button alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <ListItemText
      primary={name}
      secondary={courses ? courses.join(' ') : `${name} has no courses selected`}
    />
  </ListItem>
);

interface FriendsProps {
  isFriendsListOpen: boolean,
  isLoggedIn: boolean
  setIsLoggedIn(value: boolean): void
}

const FriendsDrawer: React.FC<FriendsProps> = ({
  isFriendsListOpen,
  isLoggedIn,
  setIsLoggedIn,
}) => {
  const classes = useStyles();


  const responseFacebook = (response: any) => {
    // TODO use response
    console.log(response);
    // TODO logged out state -> logged in (account button)
    // TODO make login persist
    setIsLoggedIn(true);
  };

  const loginOnClick = () => {
    console.log('login');
  };

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
        { isLoggedIn ? (
          <>
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
              <FriendListAdded name="Test here" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />
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
          </>
        ) : (
          <LoginComponent>
            <img src={loggedOutImgUrl} alt="You are logged out!" width="100" />
            <h3> Log In to Notangles! </h3>
            <p>
              Add friends on Notangles to view each other&apos;s timetables,
              coordinate classes, and plan events
            </p>
            <FacebookLogin
              appId="2637085919726160"
              autoLoad={false}
              fields="name,email,picture"
              onClick={loginOnClick}
              callback={responseFacebook}
            />
          </LoginComponent>
        )}


      </DrawerContainer>
    </StyledDrawer>

  );
};

export default FriendsDrawer;
