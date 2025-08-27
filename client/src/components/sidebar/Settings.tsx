import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';
import { FC, useContext, useMemo, useState } from 'react';

import { AppContext } from '../../context/AppContext';
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

const Settings: FC = () => {
  const {
    currentTheme,
    setCurrentTheme,
    isSquareEdges,
    setIsSquareEdges,
    is12HourMode,
    setIs12HourMode,
    isShowOnlyOpenClasses,
    setisShowOnlyOpenClasses,
    isDefaultUnscheduled,
    setIsDefaultUnscheduled,
    isHideClassInfo,
    setIsHideClassInfo,
    isHideExamClasses,
    setIsHideExamClasses,
    isConvertToLocalTimezone,
    setIsConvertToLocalTimezone,
  } = useContext(AppContext);

  const settingsToggles: { state: boolean; setter: (mode: boolean) => void; desc: string }[] = [
    { state: isSquareEdges, setter: setIsSquareEdges, desc: 'Square corners on classes' },
    { state: is12HourMode, setter: setIs12HourMode, desc: '12-hour time' },
    { state: isShowOnlyOpenClasses, setter: setisShowOnlyOpenClasses, desc: 'Show only open classes' },
    { state: isDefaultUnscheduled, setter: setIsDefaultUnscheduled, desc: 'Unschedule classes by default' },
    { state: isHideClassInfo, setter: setIsHideClassInfo, desc: 'Hide class details' },
    { state: isHideExamClasses, setter: setIsHideExamClasses, desc: 'Hide exam classes' },
    { state: isConvertToLocalTimezone, setter: setIsConvertToLocalTimezone, desc: 'Convert to local timezone' },
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
      <ColorThemePreview />
    </>
  );

  const mainContent = useMemo(() => {
    return isPreferredThemeOpen ? (
      <ColorThemeOptionsContainer>
        <ColorThemeOptions currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
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
                onChange={() => {
                  setting.setter(!setting.state);
                }}
              />
            </SettingsItem>
          </div>
        ))}
      </>
    );
  }, [isPreferredThemeOpen, settingsToggles, currentTheme, setCurrentTheme]);

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
