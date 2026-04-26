# ola_package_router.py
import os
from olamaps import Client
from dotenv import load_dotenv

load_dotenv()

# Use your API Key from the dashboard
API_KEY = os.getenv("OLA_MAPS_API_KEY")

# Initialize the client - it handles authentication internally
client = Client(api_key=API_KEY)

# Get directions. The package uses the correct OAuth flow automatically.
result = client.directions(
    origin="12.9236,77.4989",
    destination="12.9780,77.5722",
    alternatives=True,  # Request multiple routes
    steps=True          # Request turn-by-turn steps
)

print(result)
client.close()