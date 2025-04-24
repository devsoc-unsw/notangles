import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/system';

import { themes } from '../../constants/theme';
import { ColorThemePreview } from "./ColorThemePreview";

const SettingsItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 20px;
  border-radius: 10px;
  border: 1px solid #606060;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0;
  gap: 1rem;
`;

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
      <RadioGroup
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '2.5rem',
                    alignItems: 'center',

                  }}>
                  <div style={{ minWidth: '7vw' }}>{theme}</div>
                  <ColorThemePreview p_theme={theme} />
                </div>
              }
            />
          </SettingsItem>
        ))}
      </RadioGroup>
    </FormControl>
  );
  };