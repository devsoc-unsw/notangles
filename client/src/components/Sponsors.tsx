import { Grid } from '@mui/material';
import { styled } from '@mui/system';

import macquarie from '../assets/macquarie_group_logo.svg';
import tiktok from '../assets/tiktok_logo.svg';

const SponsorImg = styled('img')`
  display: block;
  margin: 10px 20px;
  width: 25%;
  border-radius: 2%;
`;

const Sponsors = () => {
  return (
    <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
      <SponsorImg src={tiktok} alt="tiktok logo" />
      <SponsorImg src={macquarie} alt="tiktok logo" />
    </Grid>
  );
};

export default Sponsors;
