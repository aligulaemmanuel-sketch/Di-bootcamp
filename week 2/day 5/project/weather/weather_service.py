from datetime import datetime
from config import mgr, reg

def get_weather_details(location_name):
    """Fetches and displays basic weather info."""
    if mgr is None:
        print(f"Error: Weather manager not initialized. Please check your API key in config.py.")
        return

    try:
        observation = mgr.weather_at_place(location_name)
        w = observation.weather

        wind = w.wind()
        sunrise = datetime.fromtimestamp(w.sunrise_time()).strftime('%H:%M:%S')
        sunset = datetime.fromtimestamp(w.sunset_time()).strftime('%H:%M:%S')

        print(f"\n--- Current Weather: {location_name} ---")
        print(f"Status: {w.detailed_status.capitalize()}")
        print(f"Wind Speed: {wind['speed']} m/s")
        print(f"Sunrise: {sunrise} | Sunset: {sunset}")
    except Exception as e:
        print(f"Error fetching {location_name}: {e}")

def get_city_id(city_name):
    """Retrieves the ID of a city for more precise API calls."""
    if reg is None:
        print(f"Error: City registry not initialized. Please check your API key in config.py.")
        return None

    list_of_tuples = reg.ids_for(city_name, matching='exact')
    if list_of_tuples:
        # Returns (ID, Name, Country, Lat, Lon)
        city_id = list_of_tuples[0][0]
        print(f"Found City ID for {city_name}: {city_id}")
        return city_id
    print(f"City ID for {city_name} not found.")
    return None