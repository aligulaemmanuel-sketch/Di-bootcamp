import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { dismissToast } from '../store/uiSlice';
import { selectToast } from '../store/selectors';

const AUTO_HIDE_MS = 6000;

export default function ToastHost() {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);

  const handleClose = (_, reason) => {
    if (reason !== 'clickaway') dispatch(dismissToast());
  };

  return (
    <Snackbar
      key={toast?.id}
      open={Boolean(toast)}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="error" variant="filled" onClose={handleClose} sx={{ width: '100%' }}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}
