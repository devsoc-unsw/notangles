import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';
import { FC, useContext, useMemo, useState } from 'react';

import { AppContext } from '../../context/AppContext';
import { UserContext } from '../../context/UserContext';
import { ColorThemeOptions } from './ColorThemeOptions';
import { ColorThemePreview } from './ColorThemePreview';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import ProfilePictureModal from './ProfilePictureModal';

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 20px;
`;

const SettingText = styled('div')`
  padding: 1vh 0;
  display: flex;
  align-items: center;
`;

const ReturnText = styled(SettingText)`
  padding: 0;
`

const StyledArrowBackIosIcon = styled(ArrowBackIosIcon)`
  height: 16px;
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
        <>
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
          <ColorThemeOptionsContainer>
            <ColorThemeOptions currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
          </ColorThemeOptionsContainer>
        </>
      )}
      {isChangeProfilePicOpen && (
        <>
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
          <ProfilePictureModal />
        </>
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

  const flatMenuButtons = useMemo(() => {
    const isHomepageOpen = !isPreferredThemeOpen && !isChangeProfilePicOpen;

    return (
      <>
        {/* Only show option to change profile pic when user is logged in */}
        {isHomepageOpen && !!user.userID && (
          <SettingButton
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
      </>
    )
  }, [isChangeProfilePicOpen, isPreferredThemeOpen, user.userID]);

  return (
    <>
      {flatMenuButtons}
      {mainContent}
    </>
  );
};

export default Settings;
