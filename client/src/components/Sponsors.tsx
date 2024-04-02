import { Box, Link, Stack } from '@mui/material';
import styled from '@mui/system/styled';
import { useContext } from 'react';

import janeStreetBlack from '../assets/sponsors/jane_street_black.svg';
import janeStreetWhite from '../assets/sponsors/jane_street_white.svg';
import macquarieBlack from '../assets/sponsors/macquarie_logo_black.svg';
import macquarieWhite from '../assets/sponsors/macquarie_logo_white.svg';
import tiktokBlack from '../assets/sponsors/tiktok_logo_black.svg';
import tiktokWhite from '../assets/sponsors/tiktok_logo_white.svg';
import { AppContext } from '../context/AppContext';

const SponsorBox = styled(Box)`
  padding-top: 10px;
  padding-bottom: 20px;

  @media (max-width: 600px) {
    padding: 0px;
  }
`;

const TitleText = styled('h1')`
  font-size: 18px;
`;

const StyledSponsorLogo = styled('img')`
  object-fit: contain;
  aspect-ratio: 14/3;
  height: auto;
  width: 12em;

  @media (min-width: 600px) {
    width: 16em;
  }
`;

const Sponsors = () => {
  const { isDarkMode } = useContext(AppContext);

  const sponsorData = [
    {
      name: 'Jane Street',
      logo: isDarkMode ? janeStreetWhite : janeStreetBlack,
      link: 'https://www.janestreet.com/',
    },
    {
      name: 'TikTok',
      logo: isDarkMode ? tiktokWhite : tiktokBlack,
      link: 'https://careers.tiktok.com/',
    },
    {
      name: 'Macquarie',
      logo: isDarkMode ? macquarieWhite : macquarieBlack,
      link: 'https://www.macquarie.com',
    },
  ];

  return (
    <SponsorBox>
      <TitleText>Our Sponsors</TitleText>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', lg: 'row' }}
        marginY={3}
        spacing={{ xs: 1.5, sm: 2 }}
      >
        {sponsorData.map((sponsor, index) => {
          return (
            <Link target="_blank" href={sponsor.link} key={index}>
              <StyledSponsorLogo src={sponsor.logo} alt={sponsor.name} />
            </Link>
          );
        })}
      </Stack>
    </SponsorBox>
  );
};

export default Sponsors;
