import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { buildTheme } from './theme';
import { selectThemeMode } from './store/selectors';
import { resolveInitialLocation } from './store/weatherSlice';
import Header from './components/Header';
import ToastHost from './components/ToastHost';
import WeatherPage from './pages/WeatherPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useEffect(() => {
    dispatch(resolveInitialLocation());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="/" element={<WeatherPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </ThemeProvider>
  );
}
