import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/system';

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
        <SettingsItem>
          <StyledFormControlLabel
            value="theme-1"
            control={<Radio />}
            label={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 40,
                  alignItems: 'center',
                }}>
                <div>Color Theme 1</div>
                <ColorThemePreview p_theme="theme-1" />
              </div>
            }
          />
        </SettingsItem>
        <SettingsItem>
          <StyledFormControlLabel
            value="theme-2"
            control={<Radio />}
            label={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 40,
                  alignItems: 'center',
                }}>
                <div>Color Theme 2</div>
                <ColorThemePreview p_theme="theme-2" />
              </div>
            }
          />
        </SettingsItem>
        <SettingsItem>
          <StyledFormControlLabel
            value="theme-3"
            control={<Radio />}
            label={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 40,
                  alignItems: 'center',
                }}>
                <div>Color Theme 3</div>
                <ColorThemePreview p_theme="theme-3" />
              </div>
            }
          />
        </SettingsItem>
        <SettingsItem>
          <StyledFormControlLabel
            value="theme-4"
            control={<Radio />}
            label={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 40,
                  alignItems: 'center',
                }}>
                <div>Color Theme 4</div>
                <ColorThemePreview p_theme="theme-4" />
              </div>
            }
          />
        </SettingsItem>
      </RadioGroup>
    </FormControl>
  );
  };