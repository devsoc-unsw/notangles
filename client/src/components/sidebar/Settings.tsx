import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';
import { FC, useMemo, useState } from 'react';

import { ColorThemeOptions } from './ColorThemeOptions';
import { ColorThemePreview } from './ColorThemePreview';
import { useSetUserSettings } from '../../api/useUserSettings';
import { useSettings } from '../../context/QueryContext';

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

const Settings: FC = () => {
  const settings = useSettings();
  const { mutate } = useSetUserSettings();

  const settingsToggles: { id: string; state: boolean; desc: string }[] = [
    { id: 'useSquareEdges', state: settings.useSquareEdges, desc: 'Square corners on classes' },
    { id: 'use24HourClock', state: settings.use24HourClock, desc: '12-hour time' },
    { id: 'hideFullClasses', state: settings.hideFullClasses, desc: 'Show only open classes' },
    {
      id: 'unscheduleClassesByDefault',
      state: settings.unscheduleClassesByDefault,
      desc: 'Unschedule classes by default',
    },
    { id: 'hideClassInfo', state: settings.hideClassInfo, desc: 'Hide class details' },
    { id: 'hideExamClasses', state: settings.hideExamClasses, desc: 'Hide exam classes' },
    { id: 'convertToLocalTimezone', state: settings.convertToLocalTimezone, desc: 'Convert to local timezone' },
  ];

  const [isPreferredThemeOpen, setIsPreferredThemeOpen] = useState(false);

  const settingButtonContent = isPreferredThemeOpen ? (
    <>
      <SettingText>
        <ArrowBackIosIcon />
        Return
      </SettingText>
    </>
  ) : (
    <>
      <SettingText>Preferred Theme</SettingText>
      <ColorThemePreview previewTheme={settings.preferredTheme} />
    </>
  );

  const mainContent = useMemo(() => {
    return isPreferredThemeOpen ? (
      <ColorThemeOptionsContainer>
        <ColorThemeOptions currentTheme={settings.preferredTheme} />
      </ColorThemeOptionsContainer>
    ) : (
      <>
        {settingsToggles.map((setting) => (
          <div key={setting.desc}>
            <SettingsItem>
              <SettingText>{setting.desc}</SettingText>
              <Switch
                value={setting.state}
                checked={setting.state}
                color="primary"
                onChange={(e) => {
                  mutate({
                    [setting.id]: e.target.checked,
                  });
                }}
              />
            </SettingsItem>
          </div>
        ))}
      </>
    );
  }, [isPreferredThemeOpen, settingsToggles]);

  return (
    <>
      <SettingButton
        onClick={() => {
          setIsPreferredThemeOpen(!isPreferredThemeOpen);
        }}
      >
        {settingButtonContent}
      </SettingButton>
      {mainContent}
    </>
  );
};

export default Settings;
