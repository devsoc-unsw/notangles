import { TabPanel } from '@mui/lab';
import { Button, ListItem, ListItemIcon, ListItemIconProps, ListItemText, Menu, MenuProps } from '@mui/material';
import { styled, alpha } from '@mui/system';

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

export const StyledListItemIcon = styled(ListItemIcon)<ListItemIconProps & { isDarkMode: boolean }>`
  color: ${(props) => (props.isDarkMode ? '#FFFFFF' : '#212121')};
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

export const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0.5}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    boxShadow: '0 0 2px 1px rgb(0, 0, 0, 0.2)',
    minWidth: 130,
    opacity: '0.9 !important',
    '& .MuiList-root': {
        '& .MuiMenuItem-root': {
            listStyle: 'none',
            height: '25px',
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
            borderRadius: 5,
            marginBottom: '2px',
          '& .MuiSvgIcon-root': {
            fontSize: 15,
            marginLeft: theme.spacing(-0.5),
          },
          '& .MuiTypography-root': {
            fontSize: 13,
            marginLeft: theme.spacing(-2),
          },
          "&:hover": {
            backgroundColor: 'rgb(97, 97, 97, 0.35) !important',
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.grey[300], 0.5)
          },
        },
    },
  },
}));
