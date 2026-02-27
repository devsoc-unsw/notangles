import { Box, Link, Stack } from '@mui/material';
import styled from '@mui/system/styled';
import { useContext } from 'react';

import airwallexBlack from '../assets/sponsors/airwallex_black.png';
import airwallexWhite from '../assets/sponsors/airwallex_white.png';
import aristaBlack from '../assets/sponsors/arista_black.png';
import aristaWhite from '../assets/sponsors/arista_white.png';
import janeStreetBlack from '../assets/sponsors/jane_street_black.svg';
import janeStreetWhite from '../assets/sponsors/jane_street_white.svg';
import lyraBlack from '../assets/sponsors/lyra_black.svg';
import lyraWhite from '../assets/sponsors/lyra_white.svg';
import theTradeDeskBlack from '../assets/sponsors/thetradedesk_black.png';
import theTradeDeskWhite from '../assets/sponsors/thetradedesk_white.png';
import hrt from '../assets/sponsors/hrt.png';
import atlassian from '../assets/sponsors/atlassian.png';
import qrt from '../assets/sponsors/qrt.svg';
import citadel from '../assets/sponsors/citadel.png';
import imc from '../assets/sponsors/imc.png';
import januaryCapitalBlack from '../assets/sponsors/januarycapital_black.png';
import januaryCapitalWhite from '../assets/sponsors/januarycapital_white.png';
import optiverBlack from '../assets/sponsors/optiver_black.png';
import optiverWhite from '../assets/sponsors/optiver_white.png';
import recordpointBlack from '../assets/sponsors/recordpoint_black.png';
import recordpointWhite from '../assets/sponsors/recordpoint_white.png';

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

const StyledSilverSponsorLogo = styled(StyledPlatinumSponsorLogo)`
  width: 8em;

  @media (min-width: 600px) {
    width: 10em;
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

  const silverSponsorData = [
    {
      name: 'Citadel Securities',
      logo: citadel,
      link: 'https://www.citadelsecurities.com/',
      invertOnWhite: true,
    },
    {
      name: 'IMC Trading',
      logo: imc,
      link: 'https://www.imc.com/',
      invertOnWhite: true,
    },
    {
      name: 'January Capital',
      logo: isDarkMode ? januaryCapitalWhite : januaryCapitalBlack,
      link: 'https://www.january.capital/',
      invertOnWhite: false,
    },
    {
      name: 'Optiver',
      logo: isDarkMode ? optiverWhite : optiverBlack,
      link: 'https://optiver.com/',
      invertOnWhite: false,
    },
    {
      name: 'RecordPoint',
      logo: isDarkMode ? recordpointWhite : recordpointBlack,
      link: 'https://www.recordpoint.com/',
      invertOnWhite: false,
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
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', md: 'row' }}
        marginY={3}
        spacing={{ xs: 1.5, sm: 2, lg: 8 }}
      >
        {silverSponsorData.map((sponsor, index) => {
          return (
            <Link target="_blank" href={sponsor.link} key={index}>
              <StyledSilverSponsorLogo
                src={sponsor.logo}
                alt={sponsor.name}
                className={sponsor.invertOnWhite && !isDarkMode ? 'invert' : ''}
              />
            </Link>
          );
        })}
      </Stack>
    </SponsorBox>
  );
};

export default Sponsors;
