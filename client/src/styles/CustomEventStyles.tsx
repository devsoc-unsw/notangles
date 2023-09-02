import { LocationOn } from '@mui/icons-material';
import { TabPanel } from '@mui/lab';
import { Button, ListItemText, Menu, MenuProps } from '@mui/material';
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

export const StyledLocationIcon = styled(LocationOn)`
  vertical-align: text-bottom;
  font-size: inherit;
  padding-bottom: 0.1em;
`;

export const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    borderWidth: 'thin',
    minWidth: 180,
    boxShadow: '11px 10px 14px -3px rgba(0,0,0,0.1)',
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));
