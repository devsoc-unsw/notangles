import EmailIcon from '@mui/icons-material/Email';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import React from 'react';
import DiscordIcon from '../../assets/DiscordIcon';

const FooterLinks: React.FC = () => {
  return (
    <div className="flex md:flex-row justify-between">
      <p>&copy; UNSW Software Development Society 2024</p>
      <div className="flex space-x-4 mt-2 md:mt-0">
        <a target="_blank" rel="noopener noreferrer" href="mailto:devsoc.unsw@gmail.com">
          <EmailIcon className="text-blue-500" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/devsocUNSW">
          <FacebookRoundedIcon className="text-blue-500" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/devsoc_unsw/">
          <InstagramIcon className="text-blue-500" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/u9p34WUTcs">
          <DiscordIcon className="text-blue-500" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/devsoc-unsw/notangles">
          <GitHubIcon className="text-blue-500" />
        </a>
      </div>
    </div>
  );
};

export default FooterLinks;
