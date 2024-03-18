import { Box, Link, Stack } from '@mui/material';
import { useContext } from 'react';

import janeStreetLight from '../assets/sponsors/jane_street.svg';
import janeStreetDark from '../assets/sponsors/jane_street_white.svg';
import macquarieLight from '../assets/sponsors/macquarie_logo.svg';
import macquarieDark from '../assets/sponsors/macquarie_logo_white.svg';
import tiktokLight from '../assets/sponsors/tiktok_logo.svg';
import tiktokDark from '../assets/sponsors/tiktok_logo_white.svg';
import { AppContext } from '../context/AppContext';

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
    <div>
      <h1 style={{ fontSize: '18px' }}>Our Sponsors</h1>
      <Stack
        justifyContent="center"
        alignItems="center"
        direction={{ xs: 'column', lg: 'row' }}
        marginY={{ xs: 1, sm: 2 }}
        spacing={{ xs: 1, sm: 2 }}
      >
        {sponsorData.map((sponsor, index) => {
          return (
            <Link target="_blank" href={sponsor.link} key={index}>
              <Box
                component="img"
                src={sponsor.logo}
                alt={sponsor.name}
                sx={{
                  width: { xs: '12em', sm: '15em' },
                  objectFit: 'contain',
                  aspectRatio: '14/3',
                }}
              />
            </Link>
          );
        })}
      </Stack>
    </div>
  );
};

export default Sponsors;
