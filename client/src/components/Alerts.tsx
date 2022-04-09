import React, { useContext } from 'react';
import { Alert } from '@material-ui/lab';
import { AppContext } from '../context/AppContext';
import { Snackbar } from '@material-ui/core';

const Alerts = () => {
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
    return alertMsg === 'Success!' ? 'success' : 'error';
  };

  return (
    <>
      <Snackbar open={errorVisibility} autoHideDuration={2000} onClose={handleErrorClose}>
        <Alert severity="error" onClose={handleErrorClose} variant="filled">
          {alertMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={infoVisibility}>
        <Alert severity="info" onClose={handleInfoClose} variant="filled">
          Press and hold to drag a class
        </Alert>
      </Snackbar>
      <Snackbar open={autoVisibility} autoHideDuration={2000} onClose={handleAutoClose}>
        <Alert severity={getAutoSeverity()} onClose={handleAutoClose} variant="filled">
          {alertMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Alerts;
