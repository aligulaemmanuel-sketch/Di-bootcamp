import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteCard from '../components/FavoriteCard';
import { selectFavorites } from '../store/selectors';
import { fetchFavoriteWeather } from '../store/weatherSlice';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  useEffect(() => {
    favorites.forEach((favorite) => dispatch(fetchFavoriteWeather(favorite.key)));
  }, [favorites, dispatch]);

  if (favorites.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h6" sx={{ mt: 1 }}>
          No favorites yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Search for a city and tap &quot;Add to favorites&quot; to see it here.
        </Typography>
        <Button component={NavLink} to="/" variant="contained">
          Find a city
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Favorites
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        {favorites.map((favorite) => (
          <FavoriteCard key={favorite.key} favorite={favorite} />
        ))}
      </Box>
    </Container>
  );
}
