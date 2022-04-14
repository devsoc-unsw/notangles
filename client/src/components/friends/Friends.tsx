import React, { useEffect, useContext } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { styled } from '@mui/system';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import ProfileSettings from './ProfileSettings';
import storage from '../../utils/storage';
import LoggedOutImg from '../../assets/sidebar_cat.svg';

import { isPreview } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';

export const drawerWidth = isPreview ? 240 : 0;

const StyledDrawer = styled(Drawer)`
  width: drawerWidth;
  flex-shrink: 0;
`;

const StyledLink = styled(Link)`
  font-size: 10px;
  cursor: pointer;
  margin-left: 10px;
`;

const StyledListItems = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledListItemText = styled(ListItemText)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DrawerContainer = styled('div')`
  margin-top: 64px; /* navbar height */
  overflow: auto;
`;

const LoginComponent = styled('div')`
  text-align: center;
  padding: 20px;
  margin-top: 45%;
`;
const StyledActionButtonGroup = styled(ButtonGroup)`
  width: 100%;
`;
// ???
// https://stackoverflow.com/questions/49656531/styling-material-ui-drawer-component-with-styled-components
const useStyles = makeStyles(() =>
  createStyles({
    drawerPaper: {
      width: drawerWidth,
    },
  })
);

interface FriendsListItemProps {
  name: string;
  imageSrc: string;
  courses?: Array<string>;
  id?: string;
  isFavourite?: boolean;
}

const FriendListSuggestion: React.FC<FriendsListItemProps> = ({ name, imageSrc }) => (
  <ListItem>
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <StyledListItems>
      <StyledListItemText primary={name} />
      <StyledActionButtonGroup size="small" aria-label="small outlined button group">
        <Button>REQUEST </Button>
        <Button>DELETE</Button>
      </StyledActionButtonGroup>
    </StyledListItems>
  </ListItem>
);

const FriendListRequest: React.FC<FriendsListItemProps> = ({ name, imageSrc }) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <StyledListItems>
      <StyledListItemText primary={name} />
      <StyledActionButtonGroup size="small" aria-label="small outlined button group">
        <Button>ACCEPT</Button>
        <Button>DECLINE</Button>
      </StyledActionButtonGroup>
    </StyledListItems>
  </ListItem>
);

const FriendListAdded: React.FC<FriendsListItemProps> = ({ name, imageSrc, courses, isFavourite }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={name} src={imageSrc} />
      </ListItemAvatar>
      <StyledListItemText primary={name} secondary={courses ? courses.join(' ') : `${name} has no courses selected`} />
      <ListItemSecondaryAction>
        <IconButton
          disableRipple
          size="small"
          aria-label="menu"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleClose}>
            {isFavourite ? 'F' : 'Unf'}
            avourite
          </MenuItem>
          <MenuItem onClick={handleClose}>Unfriend</MenuItem>
          <MenuItem onClick={handleClose}>Block</MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const FriendsDrawer: React.FC = () => {
  const classes = useStyles();
  const [suggestedFriends, setSuggestedFriends] = React.useState<Array<FriendsListItemProps>>([]);
  const [mePhoto, setMePhoto] = React.useState<string>('');

  const { isLoggedIn, setIsLoggedIn, isFriendsListOpen } = useContext(AppContext);

  const handleSetIsLoggedIn = (value: boolean) => {
    setIsLoggedIn(value);
  };

  const handleFailure = (err: any) => {
    storage.set('userID', '');
    storage.set('accessToken', '');
    storage.set('userPicture', '');
    console.log(err);
    setIsLoggedIn(false);
  };

  const doLogin = (userID: string, accessToken: string, pictureUrl: string) => {
    setIsLoggedIn(true);

    fetch(`https://graph.facebook.com/${userID}/friends?fields=data&access_token=${accessToken}`)
      .then((r) => r.json())
      .then((r) => {
        r.data.forEach((friendId: any) => {
          fetch(`https://graph.facebook.com/${friendId.id}?fields=id,name,picture&access_token=${accessToken}`)
            .then((res) => res.json())
            .then((friend) => {
              setSuggestedFriends((old) => [
                ...old,
                {
                  id: friend.id,
                  name: friend.name,
                  imageSrc: friend.picture.data.url,
                },
              ]);
            });
        });
        setMePhoto(pictureUrl);
      })
      .catch((err) => {
        handleFailure(err);
      });
  };

  useEffect(() => {
    const loggedInUserId = storage.get('userID');
    if (loggedInUserId) {
      try {
        doLogin(loggedInUserId, storage.get('accessToken'), storage.get('userPicture'));
      } catch (err) {
        handleFailure(err);
      }
    }
  }, []);

  const responseFacebook = async (response: any) => {
    try {
      doLogin(response.userID, response.accessToken, response.picture.data.url);
      storage.set('userID', response.userID);
      storage.set('accessToken', response.accessToken);
      storage.set('userPicture', response.picture.data.url);
    } catch (err) {
      handleFailure(err);
    }
  };

  const loginOnClick = () => {
    console.log('login');
  };

  const logout = () => {
    setSuggestedFriends([]);
    storage.set('userID', '');
    storage.set('accessToken', '');
    storage.set('userPicture', '');
    setIsLoggedIn(false);
  };

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
        {isLoggedIn ? (
          <>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar alt="You" src={mePhoto} />
                </ListItemAvatar>
                <StyledListItems>
                  <ProfileSettings />
                  <Button size="small" onClick={logout}>
                    Log out
                  </Button>
                </StyledListItems>
              </ListItem>

              <ListSubheader disableSticky>
                Friend Requests <StyledLink> Sent Requests</StyledLink>
              </ListSubheader>
              <FriendListRequest
                name="Placeholder Name"
                imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250"
              />

              <ListSubheader disableSticky>Friends</ListSubheader>
              <FriendListAdded
                name="Placeholder 2"
                imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250"
                isFavourite
              />
              <FriendListAdded
                name="Placeholder 3"
                imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250"
                courses={mockClassArray}
              />

              <ListSubheader disableSticky>Suggested Friends</ListSubheader>
              {suggestedFriends.map((friend) => (
                <FriendListSuggestion key={friend.id} name={friend.name} imageSrc={friend.imageSrc} />
              ))}
            </List>
          </>
        ) : (
          <LoginComponent>
            <img src={LoggedOutImg} alt="You are logged out!" width="132" />
            <h3> Log In to Notangles! </h3>
            <p>Add friends on Notangles to view each other&apos;s timetables, coordinate classes, and plan events</p>
            <FacebookLogin
              appId="2637085919726160"
              autoLoad={false}
              fields="name,email,picture"
              scope="user_friends"
              onClick={loginOnClick}
              callback={responseFacebook}
              render={(renderProps: { onClick: () => void }) => (
                <Button variant="contained" color="primary" onClick={renderProps.onClick}>
                  Log In With Facebook
                </Button>
              )}
            />
          </LoginComponent>
        )}
      </DrawerContainer>
    </StyledDrawer>
  );
};

export default FriendsDrawer;
