import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { Box, Link, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { AppContext } from '../context/AppContext';

const FooterContainer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin-bottom: 25px;

  & div {
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

const Footer: React.FC = () => {
  const { lastUpdated } = useContext(AppContext);

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
    <FooterContainer>
      <div>
        <h1 style={{ fontSize: '14px' }}>Notangles - UNSW Timetable Planner</h1>
        Notangles is a UNSW timetable planner, brought to you by DevSoc. It's an easy to use drag-and-drop tool that
        allows you to plan your course classes and add to your calendar, even before term class registration opens! We
        have many features including support for custom events, auto-timetabling, creation of multiple timetables and
        sharing events with friends.
      </div>
      <br />
      <div>
        While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or
        reliability.
      </div>
      {lastUpdated && <div>Data last updated {getRelativeTime(lastUpdated)} ago.</div>}
      <br />
      <div>
        <b>UNSW Software Development Society (DevSoc)</b>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} style={{ marginTop: '3px' }}>
          <Link target="_blank" href="mailto:devsoc.unsw@gmail.com">
            <MailOutlineOutlinedIcon />
          </Link>
          <Link href="https://www.facebook.com/devsocUNSW">
            <FacebookRoundedIcon />
          </Link>
          <Link href="https://www.instagram.com/devsoc_unsw/">
            <InstagramIcon />
          </Link>
          <Link target="_blank" href="https://github.com/devsoc-unsw/notangles">
            <GitHubIcon />
          </Link>
        </Stack>
      </div>
    </FooterContainer>
  );
};

export default Footer;
