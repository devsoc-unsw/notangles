import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Dialog, DialogContent, Grid, IconButton, Skeleton, Typography } from '@mui/material';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (provider: 'devsoc' | 'google' | 'github' | 'guest') => void;
  loading?: boolean;
}

export default function LoginDialog({ open, onClose, onSignIn, loading = false }: AuthModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0, height: 500, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
          <CloseIcon />
        </IconButton>

        <Grid container sx={{ height: '100%' }}>
          {/* ◀ Illustration Panel */}
          <Grid
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" gutterBottom>
                notangles
              </Typography>
              <Typography>timetable planner</Typography>
            </Box>
          </Grid>

          {/* ▶ Form Panel */}
          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
            }}
            size={{
              xs: 12,
              md: 6,
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
                <Typography variant="h5" gutterBottom>
                  Welcome back
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 3,
                  }}
                >
                  Sign in to continue
                </Typography>

                <Button
                  fullWidth
                  startIcon={<AccountCircleIcon />}
                  onClick={() => {
                    onSignIn('devsoc');
                  }}
                  sx={{ mb: 2 }}
                >
                  Sign in with zID
                </Button>

                <Button
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    onSignIn('google');
                  }}
                  sx={{ mb: 2 }}
                >
                  Sign in with Google
                </Button>

                <Button
                  fullWidth
                  startIcon={<GitHubIcon />}
                  onClick={() => {
                    onSignIn('github');
                  }}
                  sx={{ mb: 2 }}
                >
                  Sign in with GitHub
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    onSignIn('guest');
                  }}
                >
                  Continue as Guest
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
