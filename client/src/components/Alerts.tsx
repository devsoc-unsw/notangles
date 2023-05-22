import React, { useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AppContext } from '../context/AppContext';

const Alerts: React.FC = () => {
  const { alertMsg, errorVisibility, setErrorVisibility, infoVisibility, setInfoVisibility, autoVisibility, setAutoVisibility } =
    useContext(AppContext);

  const handleErrorClose = () => {
    setErrorVisibility(false);
  };

  const handleInfoClose = () => {
    setInfoVisibility(false);
  };

  const handleAutoClose = () => {
    setAutoVisibility(false);
  };

  const getAutoSeverity = () => {
    if (alertMsg === 'Success!') return 'success';
    if (alertMsg === 'Copied to clipboard!') return 'success';
    if (alertMsg.startsWith('Could not')) return 'warning';
    return 'error';
  };

  return (
    <>
      <Snackbar
        open={errorVisibility}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        onClose={handleErrorClose}
      >
        <Alert severity="error" onClose={handleErrorClose} variant="filled">
          {alertMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={infoVisibility} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" onClose={handleInfoClose} variant="filled">
          Press and hold to drag a card
        </Alert>
      </Snackbar>
      <Snackbar
        open={autoVisibility}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        onClose={handleAutoClose}
      >
        <Alert severity={getAutoSeverity()} onClose={handleAutoClose} variant="filled">
          {alertMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Alerts;
