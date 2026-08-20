class Phone:
    def __init__(self, phone_number):
        self.phone_number = phone_number
        self.call_history = []  # List to store dictionaries of call data

    def call(self, other_number):
        """Simulates making a call and records it in history."""
        print(f"Calling {other_number}...")
        
        # Record the call (in a real app, duration would be calculated)
        call_info = {
            "number": other_number,
            "duration_minutes": 5,  # Example duration
            "timestamp": "2026-03-25 11:10"
        }
        self.call_history.append(call_info)

    def show_call_history(self):
        """Prints all previous calls in a formatted way."""
        print(f"\n--- Call History for {self.phone_number} ---")
        if not self.call_history:
            print("No calls made yet.")
        else:
            for i, entry in enumerate(self.call_history, 1):
                print(f"{i}. Called {entry['number']} for {entry['duration_minutes']} mins at {entry['timestamp']}")

# --- Testing the Log ---
my_phone = Phone("0712-345-678")

my_phone.call("0722-111-222")
my_phone.call("0733-444-555")

my_phone.show_call_history()