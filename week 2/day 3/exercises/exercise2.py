from datetime import datetime

def time_until_new_year():
    now = datetime.now()
    next_year = now.year + 1
    new_year_date = datetime(next_year, 1, 1)
    
    time_left = new_year_date - now
    
    days = time_left.days
    hours, remainder = divmod(time_left.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    print(f"The 1st of January is in {days} days and {hours:02}:{minutes:02}:{seconds:02} hours.")

time_until_new_year()