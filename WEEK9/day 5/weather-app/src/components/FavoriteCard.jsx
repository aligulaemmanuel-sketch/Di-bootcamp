import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { removeFavorite } from '../store/favoritesSlice';
import { selectFavoritesWeather, selectUnit } from '../store/selectors';
import { setLocation } from '../store/weatherSlice';
import { formatTemperature } from '../utils/format';
import WeatherIcon from './WeatherIcon';

export default function FavoriteCard({ favorite }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const weather = useSelector(selectFavoritesWeather)[favorite.key];
  const unit = useSelector(selectUnit);

  const openDetails = () => {
    dispatch(setLocation(favorite));
    navigate('/');
  };

  return (
    <Card sx={{ position: 'relative', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardActionArea onClick={openDetails} sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            ID: {favorite.key}
          </Typography>
          <Typography variant="h6" component="h2">
            {favorite.name}
          </Typography>

          {weather ? (
            <Box>
              <WeatherIcon icon={weather.icon} text={weather.text} size={56} />
              <Typography variant="h5">{formatTemperature(weather.tempC, unit)}</Typography>
              <Typography color="text.secondary">{weather.text}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', justifyItems: 'center', mt: 1 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Skeleton width="60%" height={36} />
              <Skeleton width="80%" />
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      <IconButton
        size="small"
        aria-label={`Remove ${favorite.name} from favorites`}
        onClick={() => dispatch(removeFavorite(favorite.key))}
        sx={{ position: 'absolute', top: 4, right: 4 }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}
