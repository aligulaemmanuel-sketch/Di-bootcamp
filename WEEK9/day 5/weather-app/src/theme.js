import { createTheme } from '@mui/material/styles';

const PALETTES = {
  light: {
    primary: { main: '#1976d2' },
    background: { default: '#eaf2fb', paper: '#ffffff' },
  },
  dark: {
    primary: { main: '#7cc4ff' },
    background: { default: '#0f1720', paper: '#16212e' },
  },
};

export const buildTheme = (mode) =>
  createTheme({
    palette: { mode, ...PALETTES[mode] },
    shape: { borderRadius: 16 },
  });
