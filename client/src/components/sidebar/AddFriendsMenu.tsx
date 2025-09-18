import { ArrowRight, Cached, ContentCopy } from '@mui/icons-material';
import { Button, ButtonGroup, Grid, InputBase, Paper, styled } from '@mui/material';

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

const AddFriendsMenu = () => {
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
                <InviteCodeButtonGroup variant="outlined" color="inherit">
                  <InviteCodeButton size="large">AXD67R</InviteCodeButton>
                  <InviteCodeButton>
                    <StyledCopyIcon />
                  </InviteCodeButton>
                </InviteCodeButtonGroup>
              </Grid>
            </Grid>
            <Grid size={3} container justifyContent="flex-start">
              <Grid>
                <InviteCodeButtonGroup variant="outlined" color="inherit">
                  <InviteCodeButton size="large">
                    <StyledRefreshIcon />
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
              border: '1px solid',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              fontSize: '0.75rem',
            }}
          >
            <InputBase placeholder="Add a friend with their friend code." sx={{ width: '60%', marginRight: '10px' }} />
            <Button variant="contained" disableElevation sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
              Send Friend Request
            </Button>
          </Paper>
        </MenuSubContainer>
      </SettingsItem>

      <SettingsItem>
        <Button
          variant="contained"
          disableElevation
          sx={{ textTransform: 'none', fontSize: '0.75rem', marginTop: '10px' }}
        >
          Copy Invite Link
        </Button>
      </SettingsItem>
    </>
  );
};

export default AddFriendsMenu;
