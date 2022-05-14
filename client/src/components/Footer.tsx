import React, { useContext } from 'react';
import { styled } from '@mui/system';
import { Box, Link } from '@mui/material';

import { AppContext } from '../context/AppContext';

const FooterContainer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin-bottom: 25px;

  & div {
    margin: 1vh 0;
  }
`;

const Footer: React.FC = () => {
  const { lastUpdated } = useContext(AppContext);

  // `date`: timestamp in milliseconds
  // returns: time in relative format, such as "5 minutes" (ago) or "10 hours" (ago)
  const getRelativeTime = (date: number): string => {
    const diff = Date.now() - date;
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
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
    </FooterContainer>
  );
};

export default Footer;
