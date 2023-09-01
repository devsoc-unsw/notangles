import React, { useContext } from 'react';
import { styled } from '@mui/system';
import { Box, Link } from '@mui/material';

import { AppContext } from '../context/AppContext';

const FooterContainer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin-bottom: 25px;

  & div {
    margin: 1vh 30vh;
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
      <div>While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or reliability.</div>
      <div>
        Made by &gt;_ CSESoc UNSW&nbsp;&nbsp;•&nbsp;&nbsp;
        <Link target="_blank" href="mailto:notangles@csesoc.org.au">
          Email
        </Link>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        <Link target="_blank" href="https://forms.gle/rV3QCwjsEbLNyESE6">
          Feedback
        </Link>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        <Link target="_blank" href="https://github.com/csesoc/notangles">
          Source
        </Link>
      </div>
      {lastUpdated !== 0 && <div>Data last updated {getRelativeTime(lastUpdated)} ago.</div>}
      <br></br>
      <div>
        Notangles is a UNSW timetable planner, brought to you by CSESoc Dev. It's an easy to use drag-and-drop tool that allows
        you to plan your course classes and add to your calendar, even before term class registration opens! We have many features
        including support for custom events, auto-timetabling, creation of multiple timetables and sharing events with friends.
      </div>
    </FooterContainer>
  );
};

export default Footer;
