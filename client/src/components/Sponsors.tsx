import { Box, Link, Stack } from '@mui/material';
import styled from '@mui/system/styled';
import { useContext } from 'react';

import airwallexBlack from '../assets/sponsors/airwallex_black.png';
import airwallexWhite from '../assets/sponsors/airwallex_white.png';
import aristaBlack from '../assets/sponsors/arista_black.png';
import aristaWhite from '../assets/sponsors/arista_white.png';
import atlassian from '../assets/sponsors/atlassian.png';
import hrt from '../assets/sponsors/hrt.png';
import janeStreetBlack from '../assets/sponsors/jane_street_black.svg';
import janeStreetWhite from '../assets/sponsors/jane_street_white.svg';
import lyraBlack from '../assets/sponsors/lyra_black.svg';
import lyraWhite from '../assets/sponsors/lyra_white.svg';
import qrt from '../assets/sponsors/qrt.svg';
import theTradeDeskBlack from '../assets/sponsors/thetradedesk_black.png';
import theTradeDeskWhite from '../assets/sponsors/thetradedesk_white.png';
import { AppContext } from '../context/AppContext';

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
  const { isDarkMode } = useContext(AppContext);

  const platinumSponsorData = [
    {
      name: 'Hudson River Trading',
      logo: hrt,
      link: 'https://hudsonrivertrading.com',
    },
    {
      name: 'Jane Street',
      logo: isDarkMode ? janeStreetWhite : janeStreetBlack,
      link: 'https://www.janestreet.com/',
    },
    {
      name: 'theTradeDesk',
      logo: isDarkMode ? theTradeDeskWhite : theTradeDeskBlack,
      link: 'https://careers.thetradedesk.com',
    },
    {
      name: 'Lyra',
      logo: isDarkMode ? lyraWhite : lyraBlack,
      link: 'https://www.lyratechnologies.com.au/',
    },
  ];

  const goldSponsorData = [
    {
      name: 'Airwallex',
      logo: isDarkMode ? airwallexWhite : airwallexBlack,
      link: 'https://www.airwallex.com/au',
    },
    {
      name: 'Arista',
      logo: isDarkMode ? aristaWhite : aristaBlack,
      link: 'https://www.arista.com/en/',
    },
    {
      name: 'Atlassian',
      logo: atlassian,
      link: 'https://atlassian.com',
    },
    {
      name: 'QRT',
      logo: qrt,
      link: 'https://www.qube-rt.com/',
    },
  ];

  return (
    <SponsorBox>
      <h1 className="text-lg font-bold">Our Sponsors</h1>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', md: 'row' }}
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
        direction={{ xs: 'column', md: 'row' }}
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
