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

    // Re-initialize animations after content is loaded
    setTimeout(initializeScrollAnimations, 0);
}

function initializeScrollAnimations() {
    /**
     * Uses IntersectionObserver to add a class to elements when they enter the viewport,
     * triggering a CSS animation.
     */
    const animatedElements = document.querySelectorAll(".destination-card, .hero-section, .section-title");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    animatedElements.forEach(el => observer.observe(el));
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
