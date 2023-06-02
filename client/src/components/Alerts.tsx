import React, { useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AppContext } from '../context/AppContext';

const Alerts: React.FC = () => {
  const {
    alertMsg,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    autoVisibility,
    setAutoVisibility,
    alertFunction,
    setAlertFunction,
  } = useContext(AppContext);

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
    if (alertMsg.startsWith('Delete')) return 'info';
    return 'error';
  };

  // Alerts.ts was not designed to handle onclick events and does not take props, so forgive this code
  const deleteAlert = alertMsg.startsWith('Delete');
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
        autoHideDuration={deleteAlert ? 5000 : 2000}
        onClose={handleAutoClose}
      >
        <Alert severity={getAutoSeverity()} onClose={handleAutoClose} variant="filled">
          {deleteAlert ? (
            <span
              onClick={() => {
                alertFunction();
                handleAutoClose();
              }}
            >
              {alertMsg}
            </span>
          ) : (
            alertMsg
          )}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Alerts;
