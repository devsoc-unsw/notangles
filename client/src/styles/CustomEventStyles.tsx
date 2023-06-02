import { TabPanel } from '@mui/lab';
import { Button, ListItem, ListItemText, Menu, MenuProps } from '@mui/material';
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
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    borderStyle: 'solid',
    borderColor: alpha(theme.palette.grey[800], 0.85),
    borderWidth: 'thin',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
    minWidth: 180,
    color: theme.palette.grey[300],
    backgroundColor: alpha(theme.palette.grey[900], 0.9),
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.grey[300],
        marginRight: theme.spacing(1.5),
      },
      // If you want a border on the hover as well as animation
      // "&:hover": {
        // borderRadius: 5,
        // marginRight: theme.spacing(0.85),
        // marginLeft: theme.spacing(0.85),
      // },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));
