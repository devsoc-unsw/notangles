import { TabPanel } from '@mui/lab';
import { Button, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';

export const DropdownButton = styled(Button)`
  && {
    width: 100%;
    height: 55px;
    margin-top: 20px;
    margin-right: 10px;
    text-align: left;
    &:hover {
      background-color: #598dff;
    }
  }
`;

export const StyledTabPanel = styled(TabPanel)`
  padding-bottom: 0;
`;

export const StyledListItem = styled(ListItem)`
  padding-top: 8px;
`;

export const StyledListItemText = styled(ListItemText)`
  align-self: center;
  padding-right: 8px;
`;

export const ColourButton = styled(Button)`
  text-transform: none;
`;

export const ExecuteButton = styled(Button)`
  margin-top: 4px;
  height: 40px;
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;
