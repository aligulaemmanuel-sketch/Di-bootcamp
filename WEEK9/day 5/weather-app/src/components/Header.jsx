import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { setUnit, toggleTheme } from '../store/settingsSlice';
import { selectFavorites, selectThemeMode, selectUnit } from '../store/selectors';

const navButtonSx = {
  color: 'inherit',
  minWidth: 0,
  '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
};

const hideOnMobile = { display: { xs: 'none', sm: 'inline' } };

export default function Header() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const unit = useSelector(selectUnit);
  const favoritesCount = useSelector(selectFavorites).length;

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
        <WbSunnyIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, mr: 'auto' }}>
          Herolo Weather
        </Typography>

        <Button component={NavLink} to="/" end startIcon={<HomeIcon />} sx={navButtonSx}>
          <Box component="span" sx={hideOnMobile}>Home</Box>
        </Button>
        <Button
          component={NavLink}
          to="/favorites"
          startIcon={
            <Badge badgeContent={favoritesCount} color="error" max={99}>
              <FavoriteIcon />
            </Badge>
          }
          sx={navButtonSx}
        >
          <Box component="span" sx={hideOnMobile}>Favorites</Box>
        </Button>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={unit}
          onChange={(_, nextUnit) => nextUnit && dispatch(setUnit(nextUnit))}
          aria-label="Temperature unit"
          sx={{ '& .MuiToggleButton-root': { color: 'inherit', borderColor: 'rgba(255,255,255,0.4)', px: 1 } }}
        >
          <ToggleButton value="C">°C</ToggleButton>
          <ToggleButton value="F">°F</ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
          <IconButton color="inherit" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
