import { Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { useContext } from 'react';

import macquarie_light from '../assets/macquarie_logo.svg';
import macquarie_dark from '../assets/macquarie_logo_white.svg';
import tiktok_light from '../assets/tiktok_logo.svg';
import tiktok_dark from '../assets/tiktok_logo_white.svg';
import { AppContext } from '../context/AppContext';

const SponsorBox = styled(Box)``;

const SponsorImg = styled('img')`
  display: block;
  margin: 10px 20px 20px;
  width: 25%;
  border-radius: 2%;
`;

const Sponsors = () => {
  const { isDarkMode } = useContext(AppContext);
  const tiktok = isDarkMode ? tiktok_dark : tiktok_light;
  const macquarie = isDarkMode ? macquarie_dark : macquarie_light;

  return (
    <SponsorBox>
      <h1 style={{ fontSize: '14px' }}>Our Sponsors</h1>
      <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
        <SponsorImg src={tiktok} alt="tiktok logo" />
        <SponsorImg src={macquarie} alt="macquarie logo" />
      </Grid>
    </SponsorBox>
  );
};

export default Sponsors;
