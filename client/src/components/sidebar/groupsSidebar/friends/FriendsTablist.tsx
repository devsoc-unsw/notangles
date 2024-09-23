import styled from '@emotion/styled';
import { Badge } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';

import { User } from '../../UserAccount';
import AddAFriendTab from './AddAFriendTab';
import RequestsTab from './RequestsTab';
import YourFriendsTab from './YourFriendsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const MoveTextFromUnderBadge = styled('div')`
  margin-right: 12px;
`;

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

const FriendsTablist: React.FC<{ user: User | undefined; getUserInfo: () => void }> = ({ user, getUserInfo }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '90%', alignSelf: 'center' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Your Friends" {...a11yProps(0)} />
          <Tab
            label={
              <Badge badgeContent={user?.incoming.length || 0} color="primary">
                <MoveTextFromUnderBadge>Requests</MoveTextFromUnderBadge>
              </Badge>
            }
            {...a11yProps(1)}
          />
          <Tab label="Add a Friend" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <YourFriendsTab user={user} getUserInfo={getUserInfo} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <RequestsTab user={user} getUserInfo={getUserInfo} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <AddAFriendTab user={user} getUserInfo={getUserInfo} />
      </CustomTabPanel>
    </Box>
  );
};

export default FriendsTablist;
