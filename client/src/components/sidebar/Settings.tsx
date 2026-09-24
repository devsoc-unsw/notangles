import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FC, useMemo, useState } from 'react';

import { useSetUserSettings } from '../../api/user/mutations';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { UserSettings } from '../../interfaces/User';
import { ColorThemeOptions } from './ColorThemeOptions';
import { ColorThemePreview } from './ColorThemePreview';
import { ArrowBackIos, ArrowForwardIosOutlined } from '@mui/icons-material';
import ProfilePictureModal from './ProfilePictureModal';
import { useAuth } from '../../hooks/useAuth';

const SettingsPadding = styled('div')`
  padding: 1vh 20px;
`;

export const SettingsItem = styled(SettingsPadding)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SettingsText = styled('div')`
  padding: 1vh 0;
  display: flex;
  align-items: center;
`;

const ReturnText = styled(SettingsText)`
  padding: 0;
`;

const StyledArrowBackIosIcon = styled(ArrowBackIos)`
  height: 16px;
`;

const StyledArrowForwardIcon = styled(ArrowForwardIosOutlined)`
  height: 16px;
`;

export const SettingButton = styled(SettingsPadding)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 1rem;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => (theme.palette.mode === 'dark' ? '#333' : '#f0f0f0')};
  }
`;

const ColorThemeOptionsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const settingsDescriptions: Record<keyof UserSettings, string> = {
  isSquareEdges: 'Square corners on classes',
  is12HourMode: '12-hour time',
  hideFullClasses: 'Show only open classes',
  unscheduleClassesByDefault: 'Unschedule classes by default',
  hideClassInfo: 'Hide class details',
  hideExamClasses: 'Hide exam classes',
  convertToLocalTimezone: 'Convert to local timezone',
  preferredTheme: '',
  isDarkMode: '',
};

const Settings: FC = () => {
  const settings = useGetUserSettingsQuery();
  const { preferredTheme } = settings;
  const updateUserSettings = useSetUserSettings();
  const { user } = useAuth();

  const nonTogglableSet = new Set<keyof UserSettings>(['preferredTheme', 'isDarkMode']);

  const settingsToggles = (Object.keys(settingsDescriptions) as (keyof UserSettings)[])
    .filter((key) => !nonTogglableSet.has(key))
    .map((key) => ({
      id: key,
      state: Boolean(settings[key]),
      desc: settingsDescriptions[key],
    }));

  const [isPreferredThemeOpen, setIsPreferredThemeOpen] = useState(false);
  const [isChangeProfilePicOpen, setIsChangeProfilePicOpen] = useState(false);

  const mainContent = useMemo(
    () => (
      <>
        {isPreferredThemeOpen && (
          <ColorThemeOptionsContainer>
            <ColorThemeOptions currentTheme={preferredTheme} />
          </ColorThemeOptionsContainer>
        )}
        {isChangeProfilePicOpen && <ProfilePictureModal />}
        {!isPreferredThemeOpen &&
          !isChangeProfilePicOpen &&
          settingsToggles.map((setting) => (
            <div key={setting.desc}>
              <SettingsItem>
                <SettingsText>{setting.desc}</SettingsText>
                <Switch
                  value={setting.state}
                  checked={setting.state}
                  color="primary"
                  onChange={(e) => {
                    updateUserSettings({
                      [setting.id]: e.target.checked,
                    });
                  }}
                />
              </SettingsItem>
            </div>
          ))}
      </>
    ),
    [isPreferredThemeOpen, isChangeProfilePicOpen, settingsToggles],
  );

  const flatMenuButtons = useMemo(() => {
    const isHomepageOpen = !isPreferredThemeOpen && !isChangeProfilePicOpen;

    return (
      <>
        {/* Only show option to change profile pic when user is logged in */}
        {isHomepageOpen && user?.id && !user.isGuest && (
          <SettingButton
            onClick={() => {
              setIsChangeProfilePicOpen(!isChangeProfilePicOpen);
            }}
          >
            <SettingsText>Change Profile Picture</SettingsText>
            <StyledArrowForwardIcon />
          </SettingButton>
        )}
        {isHomepageOpen && (
          <SettingButton
            onClick={() => {
              setIsPreferredThemeOpen(!isPreferredThemeOpen);
            }}
          >
            <SettingsText>Preferred Theme</SettingsText>
            <ColorThemePreview previewTheme={preferredTheme} />
          </SettingButton>
        )}
        {isPreferredThemeOpen && (
          <SettingButton
            onClick={() => {
              setIsPreferredThemeOpen(!isPreferredThemeOpen);
            }}
          >
            <ReturnText>
              <StyledArrowBackIosIcon />
              Return
            </ReturnText>
          </SettingButton>
        )}
        {isChangeProfilePicOpen && (
          <SettingButton
            onClick={() => {
              setIsChangeProfilePicOpen(!isChangeProfilePicOpen);
            }}
          >
            <ReturnText>
              <StyledArrowBackIosIcon />
              Return
            </ReturnText>
          </SettingButton>
        )}
      </>
    );
  }, [isChangeProfilePicOpen, isPreferredThemeOpen, user]);

  return (
    <>
      {flatMenuButtons}
      {mainContent}
    </>
  );
};

export default Settings;
