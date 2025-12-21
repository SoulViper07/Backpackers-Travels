const API_URL = 'https://backpackers-travels.onrender.com';
let allPlaces = []; // Cache for all fetched places

document.addEventListener('DOMContentLoaded', () => {
    // Show loader immediately
    const loader = document.getElementById('destinations-loader');
    loader.style.display = 'block';

    fetchAllDestinations();
    setupSortButtons();
});

function fetchAllDestinations() {
    fetch(`${API_URL}/api/places`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(places => {
            allPlaces = places;
            renderPlaces(allPlaces);
        })
        .catch(error => {
            console.error('Error fetching all destinations:', error);
            const errorDiv = document.getElementById('destinations-error');
            errorDiv.textContent = `Could not load destinations. ${error.message}`;
            errorDiv.style.display = 'block';
        })
        .finally(() => {
            // Hide loader
            const loader = document.getElementById('destinations-loader');
            loader.style.display = 'none';
            // Hide full-page loader if it's still visible
            const pageLoader = document.getElementById('loader-wrapper');
            if (pageLoader) pageLoader.classList.add('hidden');
        });
}

function renderPlaces(places) {
    const container = document.getElementById('places-container');
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = '<p class="text-center col-12">No destinations found.</p>';
        return;
    }

    // Use the globally available card creation function from galleryLoader.js
    container.innerHTML = places.map((place, index) => 
        window.galleryLoader.createDestinationCardHtml(place, place.hasOwnProperty('distance'), index)
    ).join('');
}

function setupSortButtons() {
    const buttons = document.querySelectorAll('[data-sort]');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.dataset.sort;
            
            // Active button styling
            buttons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            handleSort(sortType);
        });
    });
    // Set 'All' as active by default
    document.querySelector('[data-sort="default"]').classList.add('active');
}

function handleSort(sortType) {
    switch (sortType) {
        case 'popular':
            sortByPopularity(true); // true for descending (most popular)
            break;
        case 'underrated':
            sortByPopularity(false); // false for ascending (least popular)
            break;
        case 'nearby':
            sortByNearby();
            break;
        case 'default':
        default:
            renderPlaces(allPlaces); // Render original unfiltered list
            break;
    }
}

function getAverageRating(place) {
    const ratings = [];
    if (place.restaurants) {
        place.restaurants.forEach(r => ratings.push(r.rating));
    }
    if (place.hotels) {
        place.hotels.forEach(h => ratings.push(h.rating));
    }
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
}

function sortByPopularity(descending = true) {
    const sortedPlaces = [...allPlaces].sort((a, b) => {
        const ratingA = getAverageRating(a);
        const ratingB = getAverageRating(b);
        return descending ? ratingB - ratingA : ratingA - ratingB;
    });
    renderPlaces(sortedPlaces);
}

function sortByNearby() {
    const container = document.getElementById('places-container');
    const loader = document.getElementById('destinations-loader');
    const errorDiv = document.getElementById('destinations-error');

    // Reset previous errors
    errorDiv.style.display = 'none';

    if (!navigator.geolocation) {
        errorDiv.textContent = 'Geolocation is not supported by your browser.';
        errorDiv.style.display = 'block';
        return;
    }

    loader.style.display = 'block';
    container.innerHTML = ''; // Clear current places

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetch(`${API_URL}/api/places/sorted-by-distance?lat=${latitude}&lng=${longitude}`)
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch nearby places.');
                    return response.json();
                })
                .then(places => {
                    renderPlaces(places);
                })
                .catch(error => {
                    console.error('Error fetching nearby sorted places:', error);
                    errorDiv.textContent = `Could not load nearby places. ${error.message}`;
                    errorDiv.style.display = 'block';
                })
                .finally(() => {
                    loader.style.display = 'none';
                });
        },
        (error) => {
            loader.style.display = 'none';
            let message = 'Could not get your location. Please allow location access.';
            if (error.code === 1) {
                message = 'Location access was denied. Please enable it in your browser settings to sort by "nearby".';
            }
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            // As a fallback, render the default list
            renderPlaces(allPlaces);
        }
    );
}
