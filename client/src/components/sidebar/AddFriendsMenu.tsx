import { ArrowRight, Cached, ContentCopy } from '@mui/icons-material';
import { Button, ButtonGroup, CircularProgress, Grid, InputBase, Paper, Snackbar, styled } from '@mui/material';
import { useMemo, useState } from 'react';

import { SettingButton, SettingsItem, SettingText } from './Settings';

const AddFriendText = styled(SettingText)`
  font-weight: 500;
`;

const InviteCodeButtonGroup = styled(ButtonGroup)`
  height: 100%;
`;

const InviteCodeButton = styled(Button)`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: bold;
  letter-spacing: 0.3rem;
  padding: 5px 20px;
  border: 0.75px solid;
`;

const StyledCopyIcon = styled(ContentCopy)`
  color: ${({ theme }) => theme.palette.primary.main};
`;

const StyledRefreshIcon = styled(Cached)`
  color: ${({ theme }) => theme.palette.primary.main};
`;

const MenuSubContainer = styled('div')`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

enum State {
  Ready,
  Success,
  Error,
}

// TODO: replace hard code with server implementation
const code = 'MQ7T2';
const link = 'http://notangles.devsoc.app/invite?code=MQ7T2';

const AddFriendsMenu = () => {
  const [codeCopyState, setCodeCopyState] = useState<State>(State.Ready);
  const [linkCopyState, setLinkCopyState] = useState<State>(State.Ready);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [isCodeRefreshing, setIsCodeRefreshing] = useState(false);

  const handleCodeCopy = (isCopyingCode: boolean) => {
    navigator.clipboard
      .writeText(isCopyingCode ? code : link)
      .then(() => {
        if (isCopyingCode) {
          setCodeCopyState(State.Success);
        } else {
          setLinkCopyState(State.Success);
        }
      })
      .catch(() => {
        if (isCopyingCode) {
          setCodeCopyState(State.Error);
        } else {
          setLinkCopyState(State.Error);
        }
      });
  };

  const handleSendRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSentRequest(true);
  };

  const snackbarMessage = useMemo(() => {
    if (codeCopyState !== State.Ready) {
      return codeCopyState === State.Success ? 'Code copied!' : 'Failed to copy code. Please try again.';
    } else if (linkCopyState !== State.Ready) {
      return linkCopyState === State.Success ? 'Link copied!' : 'Failed to copy link. Please try again.';
    } else if (hasSentRequest) {
      return 'Request has been sent!';
    } else {
      return '';
    }
  }, [codeCopyState, linkCopyState, hasSentRequest]);

  return (
    <>
      <SettingButton>
        <AddFriendText>Friend Requests</AddFriendText>
        <ArrowRight />
      </SettingButton>
      <SettingsItem>
        <MenuSubContainer>
          <AddFriendText>Your invite code:</AddFriendText>
          <Grid container direction={'row'} spacing={1}>
            <Grid size={9} container justifyContent="flex-end">
              <Grid justifyContent="flex-end">
                <InviteCodeButtonGroup
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    handleCodeCopy(true);
                  }}
                >
                  <InviteCodeButton size="large">{code}</InviteCodeButton>
                  <InviteCodeButton>
                    <StyledCopyIcon />
                  </InviteCodeButton>
                </InviteCodeButtonGroup>
              </Grid>
            </Grid>
            <Grid size={3} container justifyContent="flex-start">
              <Grid>
                <InviteCodeButtonGroup
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    // TODO: actually have it refresh
                    setIsCodeRefreshing((prev) => !prev);
                  }}
                >
                  <InviteCodeButton size="large">
                    {isCodeRefreshing ? <CircularProgress size={24} disableShrink /> : <StyledRefreshIcon />}
                  </InviteCodeButton>
                </InviteCodeButtonGroup>
              </Grid>
            </Grid>
          </Grid>
        </MenuSubContainer>
      </SettingsItem>

      <SettingsItem>
        <MenuSubContainer>
          <AddFriendText>Enter friend code:</AddFriendText>
          <Paper
            elevation={0}
            component="form"
            sx={{
              border: '0.75px solid',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              fontSize: '0.75rem',
            }}
            onSubmit={handleSendRequest}
          >
            <InputBase placeholder="Add a friend with their friend code." sx={{ width: '60%', marginRight: '10px' }} />
            <Button
              variant="contained"
              disableElevation
              type="submit"
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Send Friend Request
            </Button>
          </Paper>
        </MenuSubContainer>
      </SettingsItem>

      <SettingsItem>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            handleCodeCopy(false);
          }}
          sx={{ textTransform: 'none', fontSize: '0.75rem', marginTop: '10px' }}
        >
          Copy Invite Link
        </Button>
      </SettingsItem>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarMessage !== ''}
        autoHideDuration={5000}
        onClose={() => {
          setCodeCopyState(State.Ready);
          setLinkCopyState(State.Ready);
          setHasSentRequest(false);
        }}
        message={snackbarMessage}
      />
    </>
  );
};

export default AddFriendsMenu;
