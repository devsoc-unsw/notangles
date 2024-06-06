import EmailIcon from '@mui/icons-material/Email';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link, Stack } from '@mui/material';
import React from 'react';

import DiscordIcon from '../../assets/DiscordIcon';

const FooterLinks: React.FC = () => {
  return (
    <Stack direction="row" spacing={6} justifyContent="space-between" alignItems="center">
      <p>&copy; UNSW Software Development Society 2024</p>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <Link target="_blank" href="mailto:devsoc.unsw@gmail.com">
          <EmailIcon />
        </Link>
        <Link target="_blank" href="https://www.facebook.com/devsocUNSW">
          <FacebookRoundedIcon />
        </Link>
        <Link target="_blank" href="https://www.instagram.com/devsoc_unsw/">
          <InstagramIcon />
        </Link>
        <Link target="_blank" href="https://discord.gg/u9p34WUTcs">
          <DiscordIcon />
        </Link>
        <Link target="_blank" href="https://github.com/devsoc-unsw/notangles">
          <GitHubIcon />
        </Link>
      </Stack>
    </Stack>
  );
};

export default FooterLinks;
