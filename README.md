# Backpackers Travels - Full-Stack Website

Welcome to Backpackers Travels, a complete, production-ready full-stack website project built to showcase beautiful travel destinations and provide an AI-powered travel planning service.

## Project Structure

The project is organized into two main parts:

-   `/frontend`: Contains the user-facing website built with HTML, CSS, JavaScript, and Bootstrap 5.
-   `/backend`: Contains the Node.js and Express server that provides the data and AI planning functionality via a REST API.

```
/Travel agency/
├── /backend/
│   ├── /data/
│   │   └── places.json       # Travel destination data (expanded!)
│   ├── server.js             # Express server logic
│   ├── package.json          # Node.js project file
│   └── README.md             # Backend-specific instructions
│
├── /frontend/
│   ├── /assets/
│   │   └── /images/          # Local image folders for each destination
│   ├── /css/
│   │   └── style.css         # Custom styles, animations, dark theme, neon accents
│   ├── /js/
│   │   ├── main.js           # Logic for homepage, loader control
│   │   ├── destination.js    # Logic for destination detail pages, image gallery
│   │   └── planner.js        # Logic for the AI planner
│   ├── index.html            # Homepage with loader and animated background
│   ├── destination.html      # Template for destination pages
│   └── planner.html          # AI Travel Planner page
│
└── README.md                 # This file
```

## Features (UPDATED!)

-   **Stunning Dark UI:** A beautiful, responsive dark-themed interface built with Bootstrap 5, featuring a **neon blue accent color**, modern animations, smooth transitions, and enhanced card hover effects.
-   **Animated Background:** A **blurry, movable, animated background** providing a dynamic visual experience.
-   **Full-Screen Loading Animation:** A **CSS-based glowing full-screen loader** ensures a smooth transition before the main content loads.
-   **Google Fonts:** Uses the **Poppins** font for a modern and clean aesthetic.
-   **Expanded Destinations:** A significantly larger list of Indian travel destinations is included, offering more exploration options.
-   **Dynamic Content & Image Handling:** Destination data is fetched from the backend API. All images are sourced directly from a high-quality external service (Unsplash Source) to ensure relevant, high-resolution visuals without broken links.
-   **Geolocation:** Automatically detects the user's location to suggest nearby travel destinations.
-   **Detailed Travel Pages:** Each destination has its own page with comprehensive information and a **dynamic image gallery**.
-   **AI Travel Planner:** A mock AI tool that generates custom travel itineraries based on user preferences, now with a dark-themed, neon-accented chat-style interface.
-   **Node.js Backend:** A robust backend using Express to serve data and handle API requests.

## Getting Started

To get the full application running, you need to start the backend server and then open the frontend in your browser.

### 1. Running the Backend

The backend server is responsible for providing all the travel data to the frontend.

1.  **Navigate to the backend directory:**
    ```bash
    cd "C:\\Users\\areet\\Desktop\\Travel agency\\backend"
    ```

2.  **Install dependencies:**
    You'll need Node.js and npm installed. Run this command to install the required packages (`express` and `cors`).
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```
    The terminal should display: `Backend server is running on http://localhost:3001`

    **Keep this terminal window open** while you use the application.

### 2. Running the Frontend

The frontend is a static website that communicates with the running backend.

1.  **Open `index.html`:**
    Navigate to the `frontend` directory in your file explorer:
    `C:\\Users\\areet\\Desktop\\Travel agency\\frontend`

2.  **Double-click the `index.html` file.** This will open the website in your default web browser.

3.  **Allow Location Access:**
    When prompted by your browser, allow location access. This is required for the "Places Near You" feature to work correctly. If you deny it, an error message will be shown.

Now you can explore the newly enhanced website, view different destinations, and try out the AI Travel Planner!
