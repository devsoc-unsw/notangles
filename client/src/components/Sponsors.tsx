import { Box, Link, Stack } from '@mui/material';
import styled from '@mui/system/styled';

import { useGetUserSettingsQuery } from '../api/user/queries';
import aristaBlack from '../assets/sponsors/arista_black.png';
import aristaWhite from '../assets/sponsors/arista_white.png';
import janeStreetBlack from '../assets/sponsors/jane_street_black.svg';
import janeStreetWhite from '../assets/sponsors/jane_street_white.svg';
import safetyCultureBlack from '../assets/sponsors/safetyculture_black.png';
import safetyCultureWhite from '../assets/sponsors/safetyculture_white.png';
import theTradeDeskBlack from '../assets/sponsors/thetradedesk_black.png';
import theTradeDeskWhite from '../assets/sponsors/thetradedesk_white.png';

const SponsorBox = styled(Box)`
  padding-top: 10px;
  padding-bottom: 20px;

  @media (max-width: 600px) {
    padding: 0px;
  }
`;

const StyledPlatinumSponsorLogo = styled('img')`
  object-fit: contain;
  aspect-ratio: 14/3;
  height: auto;
  width: 14em;

  @media (min-width: 600px) {
    width: 16em;
  }
`;

const StyledGoldSponsorLogo = styled(StyledPlatinumSponsorLogo)`
  width: 10em;

  @media (min-width: 600px) {
    width: 12em;
  }
`;

const Sponsors = () => {
  const { useDarkMode } = useGetUserSettingsQuery();

  const platinumSponsorData = [
    {
      name: 'Arista',
      logo: useDarkMode ? aristaWhite : aristaBlack,
      link: 'https://www.arista.com/en/',
    },
    {
      name: 'theTradeDesk',
      logo: useDarkMode ? theTradeDeskWhite : theTradeDeskBlack,
      link: 'https://careers.thetradedesk.com',
    },
  ];

  const goldSponsorData = [
    {
      name: 'Jane Street',
      logo: useDarkMode ? janeStreetWhite : janeStreetBlack,
      link: 'https://www.janestreet.com/',
    },
    {
      name: 'SafetyCulture',
      logo: useDarkMode ? safetyCultureWhite : safetyCultureBlack,
      link: 'https://safetyculture.com/',
    },
  ];

  return (
    <SponsorBox>
      <h1 className="text-lg font-bold">Our Sponsors</h1>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', lg: 'row' }}
        marginY={3}
        spacing={{ xs: 1.5, sm: 2, lg: 8 }}
      >
        {platinumSponsorData.map((sponsor, index) => {
          return (
            <Link target="_blank" href={sponsor.link} key={index}>
              <StyledPlatinumSponsorLogo src={sponsor.logo} alt={sponsor.name} />
            </Link>
          );
        })}
      </Stack>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', lg: 'row' }}
        marginY={3}
        spacing={{ xs: 1.5, sm: 2, lg: 14 }}
      >
        {goldSponsorData.map((sponsor, index) => {
          return (
            <Link target="_blank" href={sponsor.link} key={index}>
              <StyledGoldSponsorLogo src={sponsor.logo} alt={sponsor.name} />
            </Link>
          );
        })}
      </Stack>
    </SponsorBox>
  );
};

export default Sponsors;
