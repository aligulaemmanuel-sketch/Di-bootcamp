class Phone:
    def __init__(self, phone_number):
        self.phone_number = phone_number
        self.call_history = []
        self.messages = []

    def call(self, other_phone):
        # other_phone is another Phone object
        call_string = f"{self.phone_number} called {other_phone.phone_number}"
        print(call_string)
        # Store in history
        self.call_history.append(call_string)

    def show_call_history(self):
        print(f"Call History for {self.phone_number}:")
        for call in self.call_history:
            print(f" - {call}")

    def send_message(self, destination_phone, content):
        # destination_phone is another Phone object
        message_data = {
            "to": destination_phone.phone_number,
            "from": self.phone_number,
            "content": content
        }
        # Add to both phones' message history (simulating a real chat)
        self.messages.append(message_data)
        destination_phone.messages.append(message_data)
        print(f"Message sent from {self.phone_number} to {destination_phone.phone_number}")

    def show_outgoing_messages(self):
        print(f"Outgoing messages from {self.phone_number}:")
        for msg in self.messages:
            if msg["from"] == self.phone_number:
                print(f" To {msg['to']}: {msg['content']}")

    def show_incoming_messages(self):
        print(f"Incoming messages to {self.phone_number}:")
        for msg in self.messages:
            if msg["to"] == self.phone_number:
                print(f" From {msg['from']}: {msg['content']}")

    def show_messages_from(self, other_phone):
        print(f"Messages from {other_phone.phone_number} to {self.phone_number}:")
        for msg in self.messages:
            if msg["from"] == other_phone.phone_number:
                print(f" - {msg['content']}")

# --- Testing Your Code ---
phone_a = Phone("0711-111-111")
phone_b = Phone("0722-222-222")

# Making a call
phone_a.call(phone_b)

# Sending messages
phone_a.send_message(phone_b, "Hey! Are we still meeting for the Python project?")
phone_b.send_message(phone_a, "Yes! Let's meet at 2 PM.")

# Checking history
phone_a.show_call_history()
phone_b.show_incoming_messages()
phone_a.show_messages_from(phone_b)