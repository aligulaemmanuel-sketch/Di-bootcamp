import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '@mui/material';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import { selectLocation } from '../store/selectors';
import { fetchWeather } from '../store/weatherSlice';

export default function WeatherPage() {
  const dispatch = useDispatch();
  const locationKey = useSelector(selectLocation)?.key;

  useEffect(() => {
    if (locationKey) dispatch(fetchWeather(locationKey));
  }, [locationKey, dispatch]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <SearchBar />
      <WeatherCard />
    </Container>
  );
}
