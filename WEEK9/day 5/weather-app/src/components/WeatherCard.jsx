import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  Skeleton,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { fetchWeather } from '../store/weatherSlice';
import { toggleFavorite } from '../store/favoritesSlice';
import {
  selectCurrent,
  selectForecast,
  selectIsFavorite,
  selectLocation,
  selectUnit,
  selectWeatherStatus,
} from '../store/selectors';
import { formatTemperature } from '../utils/format';
import ForecastDay from './ForecastDay';
import WeatherIcon from './WeatherIcon';

function WeatherSkeleton() {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="text" width="25%" height={32} />
        <Skeleton variant="rounded" height={64} sx={{ my: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 2 }}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={140} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function WeatherCard() {
  const dispatch = useDispatch();
  const location = useSelector(selectLocation);
  const current = useSelector(selectCurrent);
  const forecast = useSelector(selectForecast);
  const status = useSelector(selectWeatherStatus);
  const unit = useSelector(selectUnit);
  const isFavorite = useSelector(selectIsFavorite);

  if (status === 'failed') {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => dispatch(fetchWeather(location.key))}>
            Retry
          </Button>
        }
      >
        Couldn&apos;t load the weather for {location.name}.
      </Alert>
    );
  }

  if (!location || !current) return <WeatherSkeleton />;

  return (
    <Fade in appear timeout={500}>
      <Card elevation={3}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WeatherIcon icon={current.icon} text={current.text} size={72} />
              <Box>
                <Typography variant="h5" component="h1">
                  {location.name}
                </Typography>
                <Typography color="text.secondary">{location.country}</Typography>
                <Typography variant="h4">{formatTemperature(current.tempC, unit)}</Typography>
              </Box>
            </Box>

            <Button
              variant={isFavorite ? 'outlined' : 'contained'}
              startIcon={isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              onClick={() => dispatch(toggleFavorite(location))}
            >
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </Button>
          </Box>

          <Typography
            variant="h3"
            align="center"
            sx={{ my: 4, fontSize: { xs: '1.9rem', sm: '3rem' } }}
          >
            {current.text}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 2,
            }}
          >
            {forecast.map((day, index) => (
              <ForecastDay key={day.date} day={day} unit={unit} index={index} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}
