import MenuIcon from '@mui/icons-material/Menu';
import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles'; // Correct styled import
import { width } from '@mui/system';

interface MobileMenuProps {
  onClick: () => void;
  toolTipTitle: string;
}

const StyledMobileMenu = styled('button')(({ theme }) => ({
  display: 'flex',
  height: 40,
  width: 40,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  margin: 10,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  color: theme.palette.text.primary,

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MobileMenuButton: React.FC<MobileMenuProps> = ({ onClick, toolTipTitle }) => {
  return (
    <Tooltip title={toolTipTitle} placement="right">
      <StyledMobileMenu onClick={onClick}>
        <MenuIcon />
      </StyledMobileMenu>
    </Tooltip>
  );
};

export default MobileMenuButton;
