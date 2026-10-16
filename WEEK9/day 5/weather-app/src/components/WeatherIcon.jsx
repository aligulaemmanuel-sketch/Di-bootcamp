import { Box } from '@mui/material';

const iconUrl = (icon) =>
  `https://developer.accuweather.com/sites/default/files/${String(icon).padStart(2, '0')}-s.png`;

export default function WeatherIcon({ icon, text, size = 64 }) {
  return (
    <Box
      component="img"
      src={iconUrl(icon)}
      alt={text}
      sx={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
