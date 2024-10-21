import { Grid, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useState } from 'react';

import NotanglesLogoGif from '../../assets/notangles.gif';
import NotanglesLogo from '../../assets/notangles_1.png';
import { AppContext } from '../../context/AppContext';

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

const SubTitleText = styled('p')`
  font-size: 14px;

  @media (max-width: 450px) {
    font-size: 13px;
    line-height: 15px;
  }
`;

const TitleText = styled('h2')<TitleTextProps>`
  font-size: ${({ isLarge }) => (isLarge ? '18px' : '15px')};

  @media (max-width: 450px) {
    font-size: ${({ isLarge }) => (isLarge ? '16px' : '14px')};
  }
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

  /**
   * @param date Timestamp in Unix time
   * @returns Time relative to the current time, such as "5 minutes" (ago) or "10 hours" (ago)
   */
  const getRelativeTime = (date: number): string => {
    const diff = Date.now() - date;

    const minutes = Math.round(diff / 60000);

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

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
              <TitleText isLarge>Notangles</TitleText>
              <SubTitleText>UNSW Timetable Planner</SubTitleText>
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
        <TitleText>Disclaimer</TitleText>
        <BodyText>
          While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or
          reliability.
        </BodyText>
      </Grid>
    </Grid>
  );
};

export default FooterInfo;
