import { Card, CardContent, Grow, Typography } from '@mui/material';
import { formatTemperature, getWeekday } from '../utils/format';
import WeatherIcon from './WeatherIcon';

const STAGGER_MS = 150;

export default function ForecastDay({ day, unit, index }) {
  return (
    <Grow in appear timeout={400 + index * STAGGER_MS}>
      <Card variant="outlined">
        <CardContent sx={{ textAlign: 'center', '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {getWeekday(day.date)}
          </Typography>
          <WeatherIcon icon={day.icon} text={day.text} size={48} />
          <Typography variant="body1">{formatTemperature(day.maxC, unit)}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTemperature(day.minC, unit)}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
}
