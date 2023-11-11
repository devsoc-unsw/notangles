import { Delete, LocationOn } from '@mui/icons-material';
import { TabPanel } from '@mui/lab';
import { Button, ListItemText, Menu, MenuProps } from '@mui/material';
import { alpha, styled } from '@mui/system';

export const dropdownButton = 'bg-blue-500 hover:bg-blue-400 text-left rounded-lg w-full mr-2.5 mt-5 h-14';

export const styledInput = 'dark:bg-[#323e4d] dark:text-[#eef0f2] dark:ring-[#404f63] pl-12 pr-4 py-2 font-medium w-full flex justify-between gap-x-1.5 rounded-md bg-[#f8f8f8] text-md text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'

const lightModeArrow = `url('data:image/svg+xml;utf8,<svg fill="black" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>');`
const darkModeArrow = `url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>');`

export const StyledSelect = styled('select') <{ isDarkMode: boolean }>`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: ${(props) => (props.isDarkMode ? darkModeArrow : lightModeArrow)};
  background-size: 20px 20px;
  background-position: right 12px top 50%;
  background-repeat: no-repeat;
`

// export const DropdownButton = styled(Button)`
//   && {
//     width: 100%;
//     height: 55px;
//     margin-top: 20px;
//     margin-right: 10px;
//     text-align: left;
//     &:hover {
//       background-color: #598dff;
//     }
//   }
// `;

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
