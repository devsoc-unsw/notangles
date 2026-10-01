import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Button, Dialog, DialogContent, Divider, IconButton, Skeleton, Typography } from '@mui/material';

import GoogleIcon from '../../assets/google_icon.svg';
import bottomWaves from '../../assets/login_page_bottom_waves.png';
import topWaves from '../../assets/login_page_top_waves.png';
import notanglesLogo from '../../assets/notangles_1.png';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (provider: 'devsoc' | 'google' | 'github' | 'guest') => void;
  loading?: boolean;
}

const OAUTH_PROVIDERS = [
  {
    provider: 'google',
    label: 'Google',
    icon: <Box component="img" src={GoogleIcon} alt="Google" sx={{ width: 18, height: 18 }} />,
  },
  {
    provider: 'github',
    label: 'GitHub',
    icon: <GitHubIcon sx={{ color: '#24292e' }} />,
  },
] as const;
const basePillStyle = {
  height: 46,
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  boxShadow: 'none',
};

export default function LoginDialog({ open, onClose, onSignIn, loading = false }: AuthModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          overflowY: 'auto',
          backgroundImage: `url(${topWaves}), url(${bottomWaves})`,
          backgroundPosition: 'top center, bottom center',
          backgroundRepeat: 'no-repeat, no-repeat',
          // slight overshoot to account of 1px whitespace on right side
          backgroundSize: '102% 90px, 102% 90px',
          // allows background imgs scroll in zoomed-in resolutions
          backgroundAttachment: 'local, local',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 20,
            color: '#ffffff',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        {/* ▶ Form Panel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 4, sm: 6 },
            pt: { xs: 8, sm: 10 },
            pb: { xs: 10, sm: 14 },
          }}
        >
          {loading ? (
            <>
              {/* Header skeletons */}
              <Skeleton width={180} height={32} sx={{ mb: 1 }} />
              <Skeleton width={140} height={20} sx={{ mb: 3 }} />

              {/* Button skeletons */}
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />

              {/* Guest text skeleton */}
              <Skeleton width="60%" height={24} />
            </>
          ) : (
            <>
              <Box component="img" src={notanglesLogo} alt="Notangles Logo" sx={{ width: 55, height: 55 }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
                Notangles
              </Typography>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mb: 3,
                  color: 'text.secondary',
                }}
              >
                Welcome back!
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<AccountCircleIcon />}
                onClick={() => {
                  onSignIn('devsoc');
                }}
                sx={{
                  ...basePillStyle,
                  mb: 2,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: '#165baa',
                    boxShadow: 'none',
                  },
                }}
              >
                Login with zID
              </Button>

              {OAUTH_PROVIDERS.map(({ provider, label, icon }) => (
                <Button
                  key={provider}
                  fullWidth
                  variant="outlined"
                  startIcon={icon}
                  onClick={() => {
                    onSignIn(provider);
                  }}
                  sx={{
                    ...basePillStyle,
                    mb: 1.5,
                    borderRadius: 50,
                    borderColor: '#e5e7eb',
                    borderWidth: '2px',
                    color: '#111827',
                    '&:hover': {
                      borderWidth: '2px',
                      borderColor: '#bdbdbd',
                      bgcolor: '#fafafa',
                    },
                  }}
                >
                  Login with {label}
                </Button>
              ))}

              <Divider
                sx={{
                  width: '100%',
                  my: 3,
                  fontSize: '0.85rem',
                  color: 'text.secondary',
                  borderColor: '#e5e7ebb6',
                }}
              >
                or
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  onSignIn('guest');
                }}
                sx={{
                  ...basePillStyle,
                  borderWidth: '2px',
                  borderColor: '#e5e7eb',
                  color: '#111827',
                  fontWeight: 500,
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#bdbdbd',
                    bgcolor: '#fafafa',
                    color: 'text.primary',
                  },
                }}
              >
                Continue as Guest
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
