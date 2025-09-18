import { ArrowRight, Cached, ContentCopy } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import { Grid, styled } from '@mui/system';

import { SettingButton, SettingsItem, SettingText } from './Settings';

const InviteCodeGrid = styled(Grid)`
  padding: 1vh 20px;
`;

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

const AddFriendsMenu = () => {
  return (
    <>
      <SettingButton>
        <AddFriendText>Friend Requests</AddFriendText>
        <ArrowRight />
      </SettingButton>
      <SettingsItem>
        <AddFriendText>Your invite code:</AddFriendText>
      </SettingsItem>
      <InviteCodeGrid container direction={'row'} spacing={1}>
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
      </InviteCodeGrid>

      <SettingsItem>
        <AddFriendText>Enter friend code:</AddFriendText>
      </SettingsItem>
      <SettingsItem></SettingsItem>
    </>
  );
};

export default AddFriendsMenu;
