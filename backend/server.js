const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from the Image folder at the project root
app.use("/Image", express.static(path.join(__dirname, '..', 'Image')));

// Load the travel data
let places = [];
const dataPath = path.join(__dirname, 'data', 'places.json'); // Re-added dataPath definition
try {
    const data = fs.readFileSync(dataPath, 'utf8');
    places = JSON.parse(data);
    console.log("Travel data loaded successfully.");
} catch (err) {
    console.error("Error reading travel data synchronously:", err);
    process.exit(1); // Exit if data can't be loaded, as it's critical
}

// --- Helper Functions ---

// Haversine formula to calculate distance between two lat/lng points
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// --- API Endpoints ---

/**
 * @api {get} /api/places Get all travel destinations
 * @apiName GetPlaces
 * @apiGroup Places
 */
app.get('/api/places', (req, res) => {
    console.log('GET /api/places hit. Returning all places.');
    res.json(places);
});

/**
 * @api {get} /api/places/:name Get a specific travel destination by name
 * @apiName GetPlaceByName
 * @apiGroup Places
 * @apiParam {String} name The name of the destination (case-insensitive).
 */
app.get('/api/places/:name', (req, res) => {
    const { name } = req.params;
    console.log(`GET /api/places/${name} hit.`);
    const place = places.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (place) {
        res.json(place);
    } else {
        console.log(`Place '${name}' not found.`);
        res.status(404).json({ error: 'Place not found' });
    }
});


/**


 * @api {get} /api/nearby Get nearby travel destinations


 * @apiName GetNearby


 * @apiGroup Places


 * @apiParam {Number} lat User's latitude.


 * @apiParam {Number} lng User's longitude.


 * @apiParam {Number} [limit=5] Maximum number of places to return.


 */


app.get('/api/nearby', (req, res) => {


    const { lat, lng, limit = 5 } = req.query;


    console.log(`GET /api/nearby hit with lat=${lat}, lng=${lng}.`);





    if (!lat || !lng) {


        console.log('Missing lat or lng for /api/nearby.');


        return res.status(400).json({ error: 'Latitude and longitude are required' });


    }





    const userLat = parseFloat(lat);


    const userLng = parseFloat(lng);





    const placesWithDistance = places.map(place => ({


        ...place,


        distance: getDistance(userLat, userLng, place.coordinates.lat, place.coordinates.lng)


    }));





    placesWithDistance.sort((a, b) => a.distance - b.distance);





    res.json(placesWithDistance.slice(0, parseInt(limit, 10)));


});





/**


 * @api {get} /api/places/sorted-by-distance Get all places sorted by distance


 * @apiName GetSortedByDistance


 * @apiGroup Places


 * @apiParam {Number} lat User's latitude.


 * @apiParam {Number} lng User's longitude.


 */


app.get('/api/places/sorted-by-distance', (req, res) => {


    const { lat, lng } = req.query;


    console.log(`GET /api/places/sorted-by-distance hit with lat=${lat}, lng=${lng}.`);





    if (!lat || !lng) {


        console.log('Missing lat or lng for /api/places/sorted-by-distance.');


        return res.status(400).json({ error: 'Latitude and longitude are required' });


    }





    const userLat = parseFloat(lat);


    const userLng = parseFloat(lng);





    const placesWithDistance = places.map(place => ({


        ...place,


        distance: getDistance(userLat, userLng, place.coordinates.lat, place.coordinates.lng)


    }));





    placesWithDistance.sort((a, b) => a.distance - b.distance);





    res.json(placesWithDistance);


});





/**


 * @api {post} /api/ai/plan Generate a custom travel plan


 * @apiName AIPlanner


 * @apiGroup AI
 * @apiBody {String} currentLocation User's current location name.
 * @apiBody {String} [destination] Desired destination (optional).
 * @apiBody {Number} days Number of days available for travel.
 * @apiBody {String} budget User's budget (e.g., 'low', 'medium', 'high').
 * @apiBody {String} preference Travel preference (e.g., 'adventure', 'relaxation', 'culture').
 */
app.post('/api/ai/plan', async (req, res) => { // Made async for await
    const { currentLocation, destination: userDestination, days, budget, preference } = req.body;
    console.log('POST /api/ai/plan hit with:', { currentLocation, userDestination, days, budget, preference });

    if (!currentLocation || !days || !budget || !preference) {
        console.log('Missing required fields for /api/ai/plan.');
        return res.status(400).json({ error: 'Missing required fields for AI plan' });
    }

    // --- INTEGRATION WITH YOUR CUSTOM GOOGLE GEN AI CHATBOT ---
    // This section replaces the previous mock AI logic.
    // You need to fill in your chatbot's API endpoint and configure the request/response.

    const CHATBOT_API_ENDPOINT = 'http://localhost:5000/chatbot';
    // const CHATBOT_API_KEY = 'YOUR_CHATBOT_API_KEY_HERE'; // No longer needed, as Flask app handles its own API key

    // Construct the payload to send to your chatbot
    // The structure of this payload depends on what your chatbot expects.
    const chatbotPayload = {
        prompt: `Create a ${days}-day travel plan. I am currently in ${currentLocation}. ` +
                (userDestination ? `My desired destination is ${userDestination}. ` : 'Suggest a destination. ') +
                `My budget is ${budget}, and my travel preference is ${preference}. ` +
                `Provide a detailed itinerary including activities for each day, estimated cost, transport suggestions, and a route map link. ` +
                `Format the response as a JSON object with 'title', 'destination', 'days', 'estimatedCost', 'transport', 'routeMap', and 'itinerary' (array of objects with 'day', 'title', 'activities').`,
        // Add any other parameters your chatbot might need, e.g., model configuration, history, etc.
        user_input: {
            currentLocation,
            destination: userDestination,
            days,
            budget,
            preference
        }
    };

    try {
        console.log('Calling chatbot API...');
        const response = await axios.post(CHATBOT_API_ENDPOINT, chatbotPayload, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${CHATBOT_API_KEY}` // No longer needed
            }
        });

        const chatbotResponseData = response.data;
        console.log('Chatbot API response received.');

        // --- Transform Chatbot Response to Frontend's Expected Format ---
        // This is crucial. Your chatbot's raw output needs to be mapped
        // to the 'plan' structure that frontend/js/planner.js's displayPlan function expects.
        // The example below assumes your chatbot returns a JSON structure similar
        // to the mock plan, or a string that can be parsed into such a structure.

        let plan;
        
        // Example: If chatbot returns a JSON string, parse it.
        // If chatbot returns a direct JSON object, use it.
        if (typeof chatbotResponseData === 'string') {
            try {
                plan = JSON.parse(chatbotResponseData);
            } catch (parseError) {
                console.error("Failed to parse chatbot response as JSON:", parseError);
                // Fallback: If parsing fails, create a generic plan from the string
                plan = {
                    title: "Generated Plan (from Chatbot Text)",
                    destination: userDestination || "Unknown",
                    days: days,
                    estimatedCost: "N/A",
                    transport: "Check chatbot response for details.",
                    routeMap: "#",
                    itinerary: [{ day: 1, title: "Chatbot Response", activities: chatbotResponseData }]
                };
            }
        } else if (typeof chatbotResponseData === 'object' && chatbotResponseData !== null) {
            // Assuming the chatbot returns a well-structured JSON object directly
            plan = chatbotResponseData;
        } else {
            // Generic fallback if response is unexpected
            plan = {
                title: "Generated Plan (Unexpected Chatbot Response)",
                destination: userDestination || "Unknown",
                days: days,
                estimatedCost: "N/A",
                transport: "Check chatbot response for details.",
                routeMap: "#",
                itinerary: [{ day: 1, title: "Chatbot Response", activities: JSON.stringify(chatbotResponseData) }]
            };
        }

        // --- IMPORTANT: Ensure 'plan' matches the frontend's expected structure ---
        // Verify that 'plan' has properties like 'title', 'destination', 'days',
        // 'estimatedCost', 'transport', 'routeMap', and 'itinerary' (array of objects with 'day', 'title', 'activities').
        // You might need to adjust the mapping logic above based on your chatbot's actual output.
        if (!plan.itinerary || !Array.isArray(plan.itinerary) || plan.itinerary.length === 0) {
            console.warn("Chatbot response did not contain a valid itinerary. Using generic placeholder.");
            plan.itinerary = [{ day: 1, title: "Plan Details from Chatbot", activities: plan.title || "No specific activities provided." }];
        }
        if (!plan.destination) plan.destination = userDestination || "Unknown Destination";
        if (!plan.title) plan.title = `Your ${preference} trip to ${plan.destination}!`;


        res.json(plan);

    } catch (error) {
        console.error('Error calling custom chatbot API:', error.message);
        if (error.response) {
            console.error('Chatbot API Response Data:', error.response.data);
            console.error('Chatbot API Response Status:', error.response.status);
            console.error('Chatbot API Response Headers:', error.response.headers);
        }
        res.status(500).json({ error: 'Failed to get plan from chatbot. Please check chatbot API configuration.', details: error.message });
    }
});




// Start server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log("Make sure you have run 'npm install' in this directory.");
    console.log("IMPORTANT: Install axios by running 'npm install axios' in the backend directory.");
});