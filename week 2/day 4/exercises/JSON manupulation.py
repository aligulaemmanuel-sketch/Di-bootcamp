import json

sample_json = """
{
    "company": {
        "employee": {
            "name": "emma",
            "payable": {
                "salary": 7000,
                "bonus": 800
            }
        }
    }
}
"""

# 1. Load the string
data = json.loads(sample_json)

# 2. Access and modify
# Accessing nested key: data['company']['employee']['payable']['salary']
data['company']['employee']['birth_date'] = "1995-05-20"

# 3. Save to a file
with open('updated_data.json', 'w') as f:
    json.dump(data, f, indent=4) 
    # 'indent' makes the JSON file readable for humans