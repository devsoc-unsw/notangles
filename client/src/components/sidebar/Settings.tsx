import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';
import { FC, useContext, useMemo, useState } from 'react';

import { AppContext } from '../../context/AppContext';
import { UserContext } from '../../context/UserContext';
import { ColorThemeOptions } from './ColorThemeOptions';
import { ColorThemePreview } from './ColorThemePreview';
import { ArrowForwardIosOutlined } from '@mui/icons-material';

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

  const { user } = useContext(UserContext);

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
  const [isChangeProfilePicOpen, setIsChangeProfilePicOpen] = useState(false);

  const mainContent = useMemo(() => (
    <>
      {isPreferredThemeOpen && (
        <ColorThemeOptionsContainer>
          <ColorThemeOptions currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
        </ColorThemeOptionsContainer>
      )}
      {isChangeProfilePicOpen && (
        <div>Placeholder for changing profile pic screen</div>
      )}
      {!isPreferredThemeOpen && !isChangeProfilePicOpen && settingsToggles.map((setting) => (
        <div key={setting.desc}>
          <SettingsItem>
            <SettingText>{setting['desc']}</SettingText>
            <Switch
              value={setting['state']}
              checked={setting['state']}
              color="primary"
              onChange={() => {
                setting['setter'](!setting['state']);
              }}
            />
          </SettingsItem>
        </div>
      ))}
    </>
  ), [isPreferredThemeOpen, isChangeProfilePicOpen, currentTheme, setCurrentTheme, settingsToggles]);

  const buttons = useMemo(() => {
    const isHomepageOpen = !isPreferredThemeOpen && !isChangeProfilePicOpen; // RENAME (not clear)

    return (
      <>
        {isHomepageOpen && !user.userID && (
          <SettingButton // TODO: FLIP BOOLEAN CHECK (only show when logged in)
            onClick={() => {
              setIsChangeProfilePicOpen(!isChangeProfilePicOpen);
            }}
          >
            <SettingText>Change Profile Picture</SettingText>
            <ArrowForwardIosOutlined />
          </SettingButton>
        )}
        {isHomepageOpen && (
          <SettingButton
            onClick={() => {
              setIsPreferredThemeOpen(!isPreferredThemeOpen);
            }}
          >
            <SettingText>Preferred Theme</SettingText>
            <ColorThemePreview />
          </SettingButton>
        )}
        {isPreferredThemeOpen && (
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
        )}
        {isChangeProfilePicOpen && (
          <SettingButton
            onClick={() => {
              setIsChangeProfilePicOpen(!isChangeProfilePicOpen);
            }}
          >
            <SettingText>
              <ArrowBackIosIcon />
              Return
            </SettingText>
          </SettingButton>
        )}
      </>
    )
  }, [isChangeProfilePicOpen, isPreferredThemeOpen, user.userID]);

  return (
    <>
      {buttons}
      {mainContent}
    </>
  );
};

export default Settings;
