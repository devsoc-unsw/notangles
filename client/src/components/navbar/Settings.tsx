import React, { useContext } from 'react';
import { Switch } from '@mui/material';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 1vh 20px;
`;

const SettingText = styled('div')`
  padding: 1vh 0;
`;

const Settings: React.FC = () => {
  const {
    isDarkMode,
    setIsDarkMode,
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
    { state: isDarkMode, setter: setIsDarkMode, desc: 'Dark mode' },
    { state: isSquareEdges, setter: setIsSquareEdges, desc: 'Square corners on classes' },
    { state: is12HourMode, setter: setIs12HourMode, desc: '12-hour time' },
    { state: isShowOnlyOpenClasses, setter: setisShowOnlyOpenClasses, desc: 'Show only open classes' },
    { state: isDefaultUnscheduled, setter: setIsDefaultUnscheduled, desc: 'Unschedule classes by default' },
    { state: isHideClassInfo, setter: setIsHideClassInfo, desc: 'Hide class details' },
    { state: isHideExamClasses, setter: setIsHideExamClasses, desc: 'Hide exam classes' },
    { state: isConvertToLocalTimezone, setter: setIsConvertToLocalTimezone, desc: 'Convert to local timezone' },
  ];

  return (
    <>
      {settingsToggles.map((setting) => (
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
  );
};

export default Settings;
