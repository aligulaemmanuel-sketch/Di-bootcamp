from weather_service import get_weather_details, get_city_id
from plot import plot_humidity_forecast

if __name__ == "__main__":
    # Test Basic Info
    get_weather_details('Paris,FR')

    # Test City ID
    paris_id = get_city_id('Paris')

    # Test GUI Plot
    plot_humidity_forecast('Paris,FR')