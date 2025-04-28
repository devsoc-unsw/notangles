import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/system';

import { themes } from '../../constants/theme';
import { ColorThemePreview } from "./ColorThemePreview";

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0;
  margin: 0 10px;
  border-radius: 1rem;
  &:hover {
    background-color: ${({ theme }) => theme.palette.mode === 'dark' ? '#333' : '#f0f0f0'};
  }
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0;
  gap: 1rem;
`;

const StyledRadioGroup = styled(RadioGroup)`
  display:flex;
  flex-direction: column;
  gap: 1;
`;

const ControlLabelContent: React.FC<{ theme: string }> = ({ theme }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '2.5rem',
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: '7rem' }}>{theme}</div>
      <ColorThemePreview previewTheme={theme} />
    </div>
  )
}

interface ColorThemeOptionsProps {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}

export const ColorThemeOptions: React.FC<ColorThemeOptionsProps> = ({
  currentTheme, setCurrentTheme 
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTheme((event.target as HTMLInputElement).value);
  };

  return (
    <FormControl>
      <StyledRadioGroup
        aria-labelledby="color-theme-radio-group"
        name="color-theme-radio-group"
        value={currentTheme}
        onChange={handleChange}
      >
        {Object.keys(themes).map((theme) => (
          <SettingsItem key={theme}>
            <StyledFormControlLabel
              value={theme}
              control={<Radio />}
              label={
                <ControlLabelContent theme={theme} />
              }
            />
          </SettingsItem>
        ))}
      </StyledRadioGroup>
    </FormControl>
  );
};
