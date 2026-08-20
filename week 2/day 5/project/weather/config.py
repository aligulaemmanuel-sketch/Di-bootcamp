import os
from pyowm import OWM

# SETUP - Replace with your actual API Key
API_KEY = os.getenv('OWM_API_KEY', 'YOUR_API_KEY')

mgr = None
reg = None

try:
    owm = OWM(API_KEY)
    mgr = owm.weather_manager()
    reg = owm.city_id_registry()
except Exception as e:
    print(f"Connection Error: {e}")