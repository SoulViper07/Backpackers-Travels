const API_URL = 'https://backpackers-travels.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const placeName = params.get('name');

    if (placeName) {
        fetchDestinationDetails(placeName);
    } else {
        const loader = document.getElementById('details-loader');
        const content = document.getElementById('destination-content');
        if (loader) loader.style.display = 'none';
        if (content) content.innerHTML = '<p class="text-danger text-center">No destination specified.</p>';
    }
});

function fetchDestinationDetails(name) {
    console.log("Fetching details for:", name); // for debugging
    const loader = document.getElementById('details-loader');
    const content = document.getElementById('destination-content');

    fetch(`${API_URL}/places/${name}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Destination not found');
            }
            return response.json();
        })
        .then(place => {
            if (loader) loader.style.display = 'none';
            if (content) content.style.display = 'block';
            displayDestinationDetails(place);
        })
        .catch(error => {
            console.error('Error fetching destination details:', error);
            if (loader) loader.style.display = 'none';
            if (content) {
                content.innerHTML = `<p class="text-danger text-center">${error.message}.</p>`;
                content.style.display = 'block';
            }
        });
}

function displayDestinationDetails(place) {
    // Populate Image Gallery (Bootstrap Carousel)
    const carouselInner = document.getElementById('image-gallery-container');
    const carouselIndicators = document.getElementById('carousel-indicators-container');

    if (carouselInner && carouselIndicators && place.images && place.images.length > 0) {
        carouselInner.innerHTML = ''; // Clear previous
        carouselIndicators.innerHTML = ''; // Clear previous

        place.images.forEach((imagePath, i) => {
            const fullImageUrl = `${imagePath}`;

            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${i === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = `<img src="${fullImageUrl}" class="d-block w-100 destination-carousel-img" alt="${place.name} image ${i + 1}">`;
            carouselInner.appendChild(carouselItem);

            const indicatorButton = document.createElement('button');
            indicatorButton.type = 'button';
            indicatorButton.setAttribute('data-bs-target', '#destinationCarousel');
            indicatorButton.setAttribute('data-bs-slide-to', i);
            indicatorButton.setAttribute('aria-label', `Slide ${i + 1}`);
            if (i === 0) {
                indicatorButton.className = 'active';
                indicatorButton.setAttribute('aria-current', 'true');
            }
            carouselIndicators.appendChild(indicatorButton);
        });
    } else if (carouselInner && carouselIndicators) {
        // Fallback if no images are available
        carouselInner.innerHTML = `<div class="carousel-item active"><img src="https://picsum.photos/seed/${place.name.toLowerCase()}-fallback/1200/800" class="d-block w-100 destination-carousel-img" alt="No image available"></div>`;
        carouselIndicators.innerHTML = `<button type="button" data-bs-target="#destinationCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>`;
    }


    // The header element's background will now be managed by the carousel or CSS directly.
    // Setting place-name and place-description remains the same
    const placeNameEl = document.getElementById('place-name');
    if (placeNameEl) placeNameEl.textContent = place.name;
    
    const placeDescriptionEl = document.getElementById('place-description');
    if (placeDescriptionEl) placeDescriptionEl.textContent = place.description;

    // Set info panel
    const bestSeasonEl = document.getElementById('best-season');
    if (bestSeasonEl) bestSeasonEl.innerHTML = `☀️ ${place.bestSeason}`;
    
    const suggestedDaysEl = document.getElementById('suggested-days');
    if (suggestedDaysEl) suggestedDaysEl.innerHTML = `🗓️ ${place.suggestedDays}`;
    
    const travelTipsEl = document.getElementById('travel-tips');
    if (travelTipsEl) travelTipsEl.innerHTML = `💡 ${place.travelTips}`;

    // Populate lists
    populateList('places-to-visit-list', place.placesToVisit, item => `📍 <b>${item.name}:</b> ${item.description}`);
    populateList('restaurants-list', place.restaurants, item => `🍽️ <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + place.name)}" target="_blank" class="map-link">${item.name}</a> <span class="badge bg-warning text-dark">${item.rating} <i class="fas fa-star"></i></span>`);
    populateList('hotels-list', place.hotels, item => `🏨 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + place.name)}" target="_blank" class="map-link">${item.name}</a> - ${item.price} <span class="badge bg-warning text-dark">${item.rating} <i class="fas fa-star"></i></span>`);
    populateList('rentals-list', place.rentals, item => `🚗 <b>${item.type}:</b> ${item.contact}`, 'list-unstyled');
}

function populateList(elementId, data, formatter, listClass = 'list-group list-group-flush') {
    const list = document.getElementById(elementId);
    if(list) {
        list.innerHTML = ''; // Clear existing
        if(listClass === 'list-unstyled') list.className = listClass;
        data.forEach(item => {
            const li = document.createElement('li');
            if(listClass.includes('list-group')) li.className = 'list-group-item';
            li.innerHTML = formatter(item);
            list.appendChild(li);
        });
    }
}
