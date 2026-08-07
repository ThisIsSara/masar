# Weather API

## Provider
Open-Meteo

## City
Riyadh, Saudi Arabia

## Coordinates
Latitude: 24.7136
Longitude: 46.6753

## API Endpoint

https://api.open-meteo.com/v1/forecast

## Current Weather Parameters

- temperature_2m
- apparent_temperature
- precipitation
- weather_code
- wind_speed_10m

## Timezone

Asia/Riyadh

## Usage in Masar+

The weather data will be used by the AI planner to adapt the user's itinerary.

Examples:

- High temperature → prefer indoor activities.
- High apparent temperature → reduce outdoor activities and walking.
- Rain → avoid outdoor activities.
- Comfortable weather → allow more outdoor activities.

The weather data should be refreshed when generating or replanning a trip.