import { ArrowBackIos, ArrowRight, Cached, ContentCopy } from '@mui/icons-material';
import { Button, ButtonGroup, CircularProgress, Grid, InputBase, Paper, Snackbar, styled } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useSendFriendRequest } from '../../api/friendship/mutations';
import { useIncomingRequestsQuery } from '../../api/friendship/queries';
import { useRegenerateInviteCode } from '../../api/user/mutations';
import { useAuth } from '../../hooks/useAuth';
import FriendRequestsMenu from './FriendRequestsMenu';
import PendingInvitesBadge from './PendingInvitesBadge';
import { SettingButton, SettingsItem, SettingsText } from './Settings';

const RightContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddFriendText = styled(SettingsText)`
  font-weight: 500;
`;

const ReturnText = styled(SettingsText)`
  padding: 0;
`;

const StyledArrowBackIosIcon = styled(ArrowBackIos)`
  height: 16px;
`;

const MenuSubContainer = styled('div')`
  display: flex;
  flex-direction: column;
  width: 100%;
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

const SendRequestButton = styled(Button)`
  text-transform: none;
  font-size: 0.75rem;
`;

const CopyLinkButton = styled(Button)`
  text-transform: none;
  font-size: 0.75rem;
  margin-top: 10px;
`;

enum State {
  Ready,
  Success,
  Error,
}

const AddFriendsMenu = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState(user?.inviteCode ?? '');
  const [friendCode, setFriendCode] = useState('');
  const [codeCopyState, setCodeCopyState] = useState<State>(State.Ready);
  const [linkCopyState, setLinkCopyState] = useState<State>(State.Ready);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const incomingRequests = useIncomingRequestsQuery();
  const queryClient = useQueryClient();
  const sendRequest = useSendFriendRequest(queryClient);
  const regenerate = useRegenerateInviteCode();

  const link = `https://notangles.devsoc.app/invite?code=${inviteCode}`;

  const handleCodeCopy = (isCopyingCode: boolean) => {
    navigator.clipboard
      .writeText(isCopyingCode ? inviteCode : link)
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
    sendRequest.mutate(friendCode, {
      onSuccess: () => {
        setHasSentRequest(true);
        setFriendCode('');
      },
      onError: () => {
        setSendError(true);
      },
    });
  };

  const handleRefreshCode = () => {
    regenerate.mutate(undefined, {
      onSuccess: (data) => {
        setInviteCode(data.inviteCode);
      },
    });
  };

  const snackbarMessage = useMemo(() => {
    if (codeCopyState !== State.Ready) {
      return codeCopyState === State.Success ? 'Code copied!' : 'Failed to copy code. Please try again.';
    } else if (linkCopyState !== State.Ready) {
      return linkCopyState === State.Success ? 'Link copied!' : 'Failed to copy link. Please try again.';
    } else if (hasSentRequest) {
      return 'Request has been sent!';
    } else if (sendError) {
      return 'Failed to send request. Please check the code and try again.';
    } else {
      return '';
    }
  }, [codeCopyState, linkCopyState, hasSentRequest, sendError]);

  return (
    <>
      <SettingButton
        onClick={() => {
          setShowRequests((prev) => !prev);
        }}
      >
        {showRequests ? (
          <ReturnText>
            <StyledArrowBackIosIcon />
            Return
          </ReturnText>
        ) : (
          <>
            <AddFriendText>Friend Requests</AddFriendText>
            <RightContainer>
              <PendingInvitesBadge count={incomingRequests.length} />
              <ArrowRight />
            </RightContainer>
          </>
        )}
      </SettingButton>

      {showRequests ? (
        <SettingsItem>
          <FriendRequestsMenu />
        </SettingsItem>
      ) : (
        <>
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
                      <InviteCodeButton size="large">{inviteCode}</InviteCodeButton>
                      <InviteCodeButton>
                        <StyledCopyIcon />
                      </InviteCodeButton>
                    </InviteCodeButtonGroup>
                  </Grid>
                </Grid>
                <Grid size={3} container justifyContent="flex-start">
                  <Grid>
                    <InviteCodeButtonGroup variant="outlined" color="inherit" onClick={handleRefreshCode}>
                      <InviteCodeButton size="large">
                        {regenerate.isPending ? <CircularProgress size={24} disableShrink /> : <StyledRefreshIcon />}
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
                component="form"
                elevation={0}
                onSubmit={handleSendRequest}
                sx={{
                  border: '0.75px solid',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                }}
              >
                <InputBase
                  placeholder="Add a friend with their friend code."
                  sx={{ width: '60%', marginRight: '10px' }}
                  value={friendCode}
                  onChange={(e) => {
                    setFriendCode(e.target.value);
                  }}
                />
                <SendRequestButton variant="contained" disableElevation type="submit" disabled={sendRequest.isPending}>
                  Send Friend Request
                </SendRequestButton>
              </Paper>
            </MenuSubContainer>
          </SettingsItem>

          <SettingsItem>
            <CopyLinkButton
              variant="contained"
              disableElevation
              onClick={() => {
                handleCodeCopy(false);
              }}
            >
              Copy Invite Link
            </CopyLinkButton>
          </SettingsItem>
        </>
      )}

      <Snackbar
        sx={{ position: 'absolute' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarMessage !== ''}
        autoHideDuration={5000}
        onClose={() => {
          setCodeCopyState(State.Ready);
          setLinkCopyState(State.Ready);
          setHasSentRequest(false);
          setSendError(false);
        }}
        message={snackbarMessage}
      />
    </>
  );
};

export default AddFriendsMenu;
