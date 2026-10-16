const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

export const formatTemperature = (celsius, unit) =>
  `${Math.round(unit === 'F' ? toFahrenheit(celsius) : celsius)}°${unit}`;

// Uses the date part of the API timestamp so the weekday matches the forecast
// location rather than the viewer's time zone
export const getWeekday = (isoDate) =>
  new Date(`${isoDate.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
