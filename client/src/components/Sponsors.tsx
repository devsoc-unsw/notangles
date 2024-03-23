import { Box, Link, Stack } from '@mui/material';
import styled from '@mui/system/styled';
import { useContext } from 'react';

import janeStreetLight from '../assets/sponsors/jane_street.svg';
import janeStreetDark from '../assets/sponsors/jane_street_white.svg';
import macquarieLight from '../assets/sponsors/macquarie_logo.svg';
import macquarieDark from '../assets/sponsors/macquarie_logo_white.svg';
import tiktokLight from '../assets/sponsors/tiktok_logo.svg';
import tiktokDark from '../assets/sponsors/tiktok_logo_white.svg';
import { AppContext } from '../context/AppContext';

const SponsorBox = styled(Box)`
  padding-top: 10px;
  padding-bottom: 20px;
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
      logo: isDarkMode ? janeStreetDark : janeStreetLight,
      link: 'https://www.janestreet.com/',
    },
    {
      name: 'TikTok',
      logo: isDarkMode ? tiktokDark : tiktokLight,
      link: 'https://careers.tiktok.com/',
    },
    {
      name: 'Macquarie',
      logo: isDarkMode ? macquarieDark : macquarieLight,
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
        marginY={{ xs: 2, sm: 3 }}
        spacing={{ xs: 1, sm: 2 }}
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
