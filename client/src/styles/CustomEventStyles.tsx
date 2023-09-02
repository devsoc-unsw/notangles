import { TabPanel } from '@mui/lab';
import { Delete } from '@mui/icons-material';
import { Button, ListItemText, Menu, MenuProps } from '@mui/material';
import { alpha, styled } from '@mui/system';

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

export const RedDeleteIcon = styled(Delete)`
  color: red;
`;

export const RedListItemText = styled(ListItemText)`
  color: red;
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
          fontSize: 14,
          marginLeft: theme.spacing(-2),
        },
        '&:hover': {
          backgroundColor: 'rgb(157, 157, 157, 0.35) !important',
        },
        '&:active': {
          backgroundColor: alpha(theme.palette.grey[300], 0.5),
        },
      },
    },
  },
}));
