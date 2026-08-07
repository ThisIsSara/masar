# Routing API

## Provider
OSRM (Open Source Routing Machine)

## Purpose

OSRM is used to calculate travel distance and estimated travel time between places in Riyadh.

## Route Profile

Driving

## API Endpoint

https://router.project-osrm.org/route/v1/driving/

## Input

The API receives two or more locations using:

longitude,latitude

## Output

The API provides:

- Distance in meters
- Duration in seconds
- Route information

## Usage in Masar+

Routing data will help the AI planner create realistic itineraries.

Examples:

- Check whether the user has enough time to move between two places.
- Estimate arrival time at the next destination.
- Avoid scheduling places that are too far apart.
- Reorder nearby places to reduce travel time.
- Replan the itinerary when the user is late or tired.

Example:

If the user is at Restaurant A at 4:00 PM and the next activity starts at 6:00 PM, Masar+ checks the estimated travel time before confirming the itinerary.

The route information can also be used to calculate the total travel time of the itinerary.