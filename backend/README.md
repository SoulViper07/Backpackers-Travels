# Backpackers Travels - Backend

This directory contains the Node.js and Express backend for the Backpackers Travels website.

## Setup and Running

1.  **Install Dependencies:**
    Open a terminal in this `backend` directory and run the following command to install the required packages (`express` and `cors`):
    ```bash
    npm install
    ```

2.  **Start the Server:**
    After the installation is complete, start the server with this command:
    ```bash
    node server.js
    ```

    You should see the following message in your terminal:
    ```
    Backend server is running on http://localhost:3000
    ```

## API Endpoints

The server provides the following RESTful API endpoints:

-   `GET /api/places`
    -   **Description:** Retrieves a list of all available travel destinations.
    -   **Response:** A JSON array of place objects.

-   `GET /api/places/:name`
    -   **Description:** Retrieves details for a single travel destination, specified by its name. The name matching is case-insensitive.
    -   **Example:** `/api/places/Darjeeling`
    -   **Response:** A JSON object for the specified place.

-   `GET /api/nearby`
    -   **Description:** Finds nearby travel destinations based on the user's current geographic coordinates.
    -   **Query Parameters:**
        -   `lat` (required): The user's latitude.
        -   `lng` (required): The user's longitude.
        -   `limit` (optional): The maximum number of nearby places to return. Defaults to 5.
    -   **Example:** `/api/nearby?lat=27.0410&lng=88.2663`
    -   **Response:** A JSON array of the closest place objects, sorted by distance.

-   `POST /api/ai/plan`
    -   **Description:** Generates a mock travel plan based on user preferences. In a real-world scenario, this would connect to an AI service like Google's Gemini API.
    -   **Request Body (JSON):**
        ```json
        {
          "currentLocation": "Kolkata",
          "days": 5,
          "budget": "medium",
          "preference": "adventure"
        }
        ```
    -   **Response:** A JSON object containing a detailed, day-wise itinerary.

## Data Source

The travel data is stored in the `data/places.json` file. This file contains all the necessary information for each destination, which the server reads on startup.
