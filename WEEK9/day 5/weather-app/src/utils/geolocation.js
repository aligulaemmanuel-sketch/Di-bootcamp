const GEOLOCATION_TIMEOUT_MS = 5000;

export function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coords),
      reject,
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );
  });
}
