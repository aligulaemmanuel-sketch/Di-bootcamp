import matplotlib.pyplot as plt
from datetime import datetime
from config import mgr

def init_plot():
    """Initializes the labels and title for the plot."""
    plt.ylabel('Humidity (%)', fontweight='bold')
    plt.title('3-Day Humidity Forecast (3-Hour Intervals)', fontsize=14)
    plt.grid(axis='y', linestyle='--', alpha=0.7)

def write_humidity_on_bar_chart(bars):
    """Annotates each bar with the specific humidity percentage."""
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 1,
                 f'{int(height)}%', ha='center', va='bottom', fontsize=9)

def plot_humidity_forecast(city_name):
    """Generates the bar chart for 3 days of humidity."""
    if mgr is None:
        print("Error: Weather manager not initialized. Cannot plot forecast.")
        return

    try:
        # RECTIFIED: forecast_at_place returns a manager, use .forecast.weathers
        forecaster = mgr.forecast_at_place(city_name, '3h')
        list_of_weathers = forecaster.forecast.weathers

        # Take 24 intervals (3 hours * 24 = 72 hours = 3 days)
        forecast_slice = list_of_weathers[:24]

        times = [datetime.fromtimestamp(w.ref_time).strftime('%d/%m %Hh') for w in forecast_slice]
        humidities = [w.humidity for w in forecast_slice]

        # Plotting
        plt.figure(figsize=(12, 6))
        init_plot()

        bars = plt.bar(times, humidities, color='skyblue', edgecolor='navy', alpha=0.8)
        write_humidity_on_bar_chart(bars)

        plt.xticks(rotation=45)
        plt.ylim(0, 110)  # Humidity is 0-100
        plt.tight_layout()
        plt.show()

    except Exception as e:
        print(f"Plotting Error: {e}")