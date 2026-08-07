# Prayer Times API

## Provider
AlAdhan API

## City
Riyadh, Saudi Arabia

## API Endpoint

https://api.aladhan.com/v1/timingsByCity

## Parameters

- city: Riyadh
- country: Saudi Arabia
- method: 4

## Prayer Times

The API provides:

- Fajr
- Dhuhr
- Asr
- Maghrib
- Isha

## Usage in Masar+

Prayer times will be used by the AI planner to avoid scheduling activities during prayer times.

Examples:

- Avoid starting a new activity during prayer time.
- Add a suitable break before or after prayer.
- Adjust the itinerary when a prayer time is approaching.
- Preserve the user's available trip time.

Prayer times should be retrieved based on the selected travel date.