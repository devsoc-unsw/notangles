import { Divider } from '@mui/material';
import { styled } from '@mui/system';

import { ColorThemePreview } from "./ColorThemePreview";

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 20px;
`;

const setColorTheme = (theme: string) => {
  localStorage.setItem('colorTheme', theme);
  window.location.reload();
}

export const ColorThemeOptions = () => {
  return (
    <>
      <Divider />
      <SettingsItem onClick={() => setColorTheme('theme-1')}>
        <div>Color Theme 1</div>
        <ColorThemePreview p_theme="theme-1" />
      </SettingsItem>
      <Divider />
      <SettingsItem onClick={() => setColorTheme('theme-2')}>
        <div>Color Theme 2</div>
        <ColorThemePreview p_theme="theme-2" />
      </SettingsItem>
    </>
  )
};