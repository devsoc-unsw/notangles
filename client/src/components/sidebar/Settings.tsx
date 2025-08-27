import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';
import { FC, useMemo, useState } from 'react';

import { useSetUserSettings } from '../../api/user/mutations';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { UserSettings } from '../../interfaces/User';
import { ColorThemeOptions } from './ColorThemeOptions';
import { ColorThemePreview } from './ColorThemePreview';

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 20px;
`;

const SettingText = styled('div')`
  padding: 1vh 0;
`;

const SettingButton = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 20px;
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

  const nonTogglableSet = new Set<keyof UserSettings>(['preferredTheme', 'isDarkMode']);

  const settingsToggles = (Object.keys(settingsDescriptions) as (keyof UserSettings)[])
    .filter((key) => !nonTogglableSet.has(key))
    .map((key) => ({
      id: key,
      state: Boolean(settings[key]),
      desc: settingsDescriptions[key],
    }));

  const [isPreferredThemeOpen, setIsPreferredThemeOpen] = useState(false);

  const mainContent = useMemo(
    () => (
      <>
        {isPreferredThemeOpen && (
          <>
            <SettingButton
              onClick={() => {
                setIsPreferredThemeOpen(!isPreferredThemeOpen);
              }}
            >
              <SettingText>
                <ArrowBackIosIcon />
                Return
              </SettingText>
            </SettingButton>
            <ColorThemeOptionsContainer>
              <ColorThemeOptions currentTheme={preferredTheme} />
            </ColorThemeOptionsContainer>
          </>
        )}
        {!isPreferredThemeOpen &&
          settingsToggles.map((setting) => (
            <SettingsItem key={setting.desc}>
              <SettingText>{setting.desc}</SettingText>
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
          ))}
      </>
    ),
    [isPreferredThemeOpen, preferredTheme, settingsToggles, updateUserSettings],
  );

  const flatMenuButtons = useMemo(() => {
    const isHomepageOpen = !isPreferredThemeOpen;

    return (
      <>
        {isHomepageOpen && (
          <SettingButton
            onClick={() => {
              setIsPreferredThemeOpen(!isPreferredThemeOpen);
            }}
          >
            <SettingText>Preferred Theme</SettingText>
            <ColorThemePreview previewTheme={preferredTheme} />
          </SettingButton>
        )}
      </>
    );
  }, [isPreferredThemeOpen, preferredTheme]);

  return (
    <>
      {flatMenuButtons}
      {mainContent}
    </>
  );
};

export default Settings;
