// galleryLoader.js

/**
 * Generates the HTML for a Bootstrap carousel.
 *
 * @param {Array<string>} images An array of relative image paths (e.g., "images/darjeeling/1.jpg").
 * @param {string} idPrefix A unique prefix for carousel IDs (e.g., "carousel-place-name").
 * @returns {string} The HTML string for a Bootstrap carousel.
 */
function _generateCarouselHtml(images, idPrefix) {
    if (!images || images.length === 0) {
        return `<img src="https://picsum.photos/seed/generic-card-placeholder/800/600" class="dest-img" alt="No image available">`;
    }

    // Display only the first image instead of a carousel
    return `<img src="${images[0]}" class="d-block w-100 dest-img" alt="Destination Image">`;
}

/**
 * Generates the HTML for a destination card suitable for the homepage.
 *
 * @param {object} place The place object from the backend API.
 * @param {boolean} isNearby Whether this card is for a nearby place, affecting descriptive text.
 * @param {number} index The index of the card in the list for staggered animation.
 * @returns {string} The HTML string for a Bootstrap card.
 */
function createDestinationCardHtml(place, isNearby = false, index = 0) {
    const uniqueId = place.name.replace(/\s+/g, '-').toLowerCase(); // Create a URL-friendly ID

    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="destination-card">
                <a href="destination.html?name=${encodeURIComponent(place.name)}">
                    ${_generateCarouselHtml(place.images, uniqueId)}
                </a>
                <div class="dest-info">
                    <h3>${place.name}</h3>
                    <p>${place.description.substring(0, 100)}...</p>
                    ${isNearby ? `<p class="text-soft-white"><i class="fas fa-map-marker-alt me-2"></i>Approx. <strong>${Math.round(place.distance)} km</strong> away</p>` : ''}
                    <a href="destination.html?name=${encodeURIComponent(place.name)}" class="btn btn-outline-primary mt-3">View Details</a>
                </div>
            </div>
        </div>
    `;
}


// Expose the function globally
window.galleryLoader = {
    createDestinationCardHtml
};