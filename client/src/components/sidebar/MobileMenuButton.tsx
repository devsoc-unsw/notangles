import MenuIcon from '@mui/icons-material/Menu';
import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MobileMenuProps {
  onClick: () => void;
  toolTipTitle: string;
}

const StyledMobileMenu = styled('button')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  display: 'flex',
  height: 40,
  width: 40,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  margin: 10,
  marginRight: 0,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light,
  },

  boxShadow: `
  0 0 6px rgba(0, 0, 0, 0.10),
  0 0 20px rgba(0, 0, 0, 0.05),
  0 0 40px rgba(0, 0, 0, 0.025)
`,
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
