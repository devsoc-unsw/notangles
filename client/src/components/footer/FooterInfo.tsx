import { Grid, Stack, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';

import NotanglesLogoGif from '../../assets/notangles.gif';
import NotanglesLogo from '../../assets/notangles_1.png';

interface TitleTextProps {
  isLarge?: boolean;
}

const NotanglesLogoImg = styled('img')`
  height: 45px;
  margin-left: -11.5px;

  @media (max-width: 450px) {
    height: 65px;
  }
`;

const BodyText = styled('p')`
  font-size: 12px;
  line-height: 1.5;
`;

const NotanglesFooterInfoContainer = styled('div')`
  margin-left: 5px;
  line-height: 6px;

  @media (max-width: 450px) {
    margin-left: 0px;
    line-height: 1px;
  }
`;

const FooterInfo: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(NotanglesLogo);

  return (
    <Grid container spacing={0} style={{ textAlign: 'left', alignItems: 'center', justifyContent: 'space-between' }}>
      <Grid item xs={6}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" alignItems="center">
            <NotanglesLogoImg
              src={currLogo}
              alt="Notangles logo"
              onMouseOver={() => setCurrLogo(NotanglesLogoGif)}
              onMouseOut={() => setCurrLogo(NotanglesLogo)}
            />
            <NotanglesFooterInfoContainer>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: '14px', sm: '16px', md: '18px' },
                  fontWeight: 'bold',
                  '@media (max-width: 450px)': {
                    fontSize: { xs: '14px', sm: '16px' },
                  },
                }}
              >
                Notangles
              </Typography>
              <Typography
                component="p"
                sx={{
                  fontSize: '14px',
                  '@media (max-width: 450px)': {
                    fontSize: '13px',
                    lineHeight: '15px',
                  },
                }}
              >
                UNSW Timetable Planner
              </Typography>
            </NotanglesFooterInfoContainer>
          </Stack>
          <BodyText>
            Notangles is a UNSW timetable planner, brought to you by DevSoc. It's an easy-to-use drag-and-drop tool that
            allows you to plan your course classes and add them to your calendar, even before term class registration
            opens! We have many features including support for custom events, auto-timetabling, creation of multiple
            timetables, and sharing events with friends.
          </BodyText>
        </Stack>
      </Grid>
      <Grid item xs={5}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '14px', sm: '16px' },
            fontWeight: 'bold',
            '@media (max-width: 450px)': {
              fontSize: { xs: '14px', sm: '16px' },
            },
          }}
        >
          Disclaimer
        </Typography>
        <BodyText>
          While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or
          reliability.
        </BodyText>
      </Grid>
    </Grid>
  );
};

export default FooterInfo;
