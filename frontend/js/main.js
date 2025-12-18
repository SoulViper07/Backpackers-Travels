/* ---
JS Enhancements for Backpackers Travels
- Scroll-triggered animations (IntersectionObserver)
- Typewriter effect for hero title
- Smooth scrolling for navigation
- Ripple effect for buttons
--- */

const API_URL = 'https://backpackers-travels.onrender.com'; // Base URL for the backend

// --- 1. CORE LOGIC: Fetching destination data ---

document.addEventListener('DOMContentLoaded', () => {
    fetchAllPlaces();
    fetchNearbyPlaces();
    initializeUIEnhancements(); // Initialize all new UI/UX enhancements
});

// Hide the full-screen loader once initial content is loaded
let initialFetchesCompleted = 0;
const totalInitialFetches = 2; // fetchAllPlaces and fetchNearbyPlaces

function checkInitialFetchesComplete() {
    initialFetchesCompleted++;
    if (initialFetchesCompleted >= totalInitialFetches) {
        const loaderWrapper = document.getElementById('loader-wrapper');
        if (loaderWrapper) {
            loaderWrapper.classList.add('hidden');
        }
    }
}

// Fetch and display all popular destinations
function fetchAllPlaces() {
    fetch(`${API_URL}/api/places`) // Updated API_URL usage
        .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
        .then(places => {
            const container = document.getElementById('places-container');
            if (container) {
                container.innerHTML = places.map((place, index) => window.galleryLoader.createDestinationCardHtml(place, false, index)).join('');
            }
        })
        .catch(error => {
            console.error('Error fetching all places:', error);
            const container = document.getElementById('places-container');
            if (container) {
                container.innerHTML = `<p class="text-danger">Could not load popular destinations. (Error: ${error.message})</p>`;
            }
        })
        .finally(() => {
            checkInitialFetchesComplete();
            // Re-initialize animations after content is loaded
            setTimeout(initializeScrollAnimations, 100);
        });
}

// Get user's location and fetch nearby places
function fetchNearbyPlaces() {
    const container = document.getElementById('nearby-places-container');
    const loader = document.getElementById('nearby-loader');
    const errorDiv = document.getElementById('location-error');

    if (!navigator.geolocation) {
        if(loader) loader.style.display = 'none';
        if(errorDiv) {
            errorDiv.textContent = 'Geolocation is not supported by your browser.';
            errorDiv.style.display = 'block';
        }
        checkInitialFetchesComplete();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetch(`${API_URL}/api/nearby?lat=${latitude}&lng=${longitude}`) // Updated API_URL usage
                .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
                .then(places => {
                    if (loader) loader.style.display = 'none';
                                if (container) {
                                    if (places.length > 0) {
                                        container.innerHTML = places.map((place, index) => window.galleryLoader.createDestinationCardHtml(place, true, index)).join('');
                                    } else {                            if (errorDiv) {
                                 errorDiv.textContent = 'No nearby destinations found.';
                                 errorDiv.style.display = 'block';
                            }
                        }
                    }
                })
                .catch(error => {
                    if(loader) loader.style.display = 'none';
                    if(errorDiv) {
                        errorDiv.textContent = `Could not load nearby places. (Error: ${error.message})`;
                        errorDiv.style.display = 'block';
                    }
                })
                .finally(() => {
                    checkInitialFetchesComplete();
                    // Re-initialize animations after content is loaded
                    setTimeout(initializeScrollAnimations, 100);
                });
        },
        (error) => {
            if(loader) loader.style.display = 'none';
            if(errorDiv) {
                let message = 'Could not get your location. Please allow location access.';
                if (error.code === 1) message = 'Location access was denied. Please enable it in your browser settings.';
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
            checkInitialFetchesCompleted();
        }
    );
}

// --- 2. UI/UX ENHANCEMENTS ---

function initializeUIEnhancements() {
    /**
     * Initializes all UI/UX enhancements like animations, smooth scrolling, etc.
     * This function is called once the DOM is fully loaded.
     */
    initializeScrollAnimations();
    initializeTypewriterEffect();
    initializeSmoothScrolling();
    initializeButtonRippleEffect();
    initializeHeroCarousel(); // Added hero wallpaper carousel
}

function initializeHeroCarousel() {
    /**
     * Cycles through a list of local wallpapers for the page background.
     * Relies on a simple CSS transition on the body's background-image property.
     */
    const backgroundContainer = document.body;
    if (!backgroundContainer) return;

    const basePath = "assets/images/wallpapers/";
    const wallpaperCount = 4;
    const wallpapers = [];
    for (let i = 1; i <= wallpaperCount; i++) {
        wallpapers.push(`${basePath}wallpaper${i}.jpg`);
    }

    let currentIndex = 0;

    const setBackground = (url) => {
        const tempImage = new Image();
        tempImage.src = url;
        tempImage.onload = () => {
            backgroundContainer.style.backgroundImage = `url(${url})`;
        };
        tempImage.onerror = () => {
            console.error(`Failed to load wallpaper: ${url}`);
        };
    };

    if (wallpapers.length > 0) {
        setBackground(wallpapers[0]);
        setInterval(() => {
            currentIndex = (currentIndex + 1) % wallpapers.length;
            setBackground(wallpapers[currentIndex]);
        }, 5000);
    }
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

function initializeTypewriterEffect() {
    /**
     * Applies a dynamic, looping typewriter effect to the hero title, cycling through random quotes.
     * Also "backs out" the initial text content before starting the loop.
     */
    const heroTitle = document.getElementById("hero-title");
    if (!heroTitle) return;

    const quotes = [
        "Travel is the only thing you buy that makes you richer.",
        "Jobs fill your pocket, adventures fill your soul.",
        "To travel is to live.",
        "Adventure is worthwhile.",
        "The world is a book and those who do not travel read only one page."
    ];

    const typeSpeed = 80; // ms per character
    const deleteSpeed = 40; // ms per character for backspacing
    const delay = 2000; // 2s delay after typing completes

    let quoteIndex = 0;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const backspaceOut = async (element, text) => {
        for (let i = text.length; i > 0; i--) {
            element.textContent = element.textContent.slice(0, -1);
            await sleep(deleteSpeed);
        }
    };

    const animateQuote = async () => {
        // One-time backspace out of the initial text
        const initialText = heroTitle.textContent;
        if (initialText && initialText.length > 0) {
            await sleep(delay); // Wait a moment before backspacing initial text
            await backspaceOut(heroTitle, initialText);
            await sleep(500); // Short pause after backspacing initial text
        }

        while (true) {
            // Select a random quote, ensuring it's not the same as the last one
            let newIndex = Math.floor(Math.random() * quotes.length);
            // Avoid repeating the exact previous quote immediately
            if (quotes.length > 1) { // Only if there's more than one quote
                while (quotes[newIndex] === heroTitle.lastTypedQuote) { // lastTypedQuote will be set below
                    newIndex = Math.floor(Math.random() * quotes.length);
                }
            }
            heroTitle.lastTypedQuote = quotes[newIndex]; // Store last typed quote to avoid immediate repetition
            
            const text = quotes[newIndex];

            // Type in the new quote
            for (let i = 0; i < text.length; i++) {
                heroTitle.textContent += text.charAt(i);
                await sleep(typeSpeed);
            }

            // Wait before deleting
            await sleep(delay);

            // "Fade out" by backspacing
            await backspaceOut(heroTitle, text);

            // Short pause before starting the next quote
            await sleep(500);
        }
    };

    // Start the continuous animation loop
    animateQuote();
}

function initializeSmoothScrolling() {
    /**
     * Adds a smooth scroll behavior to all anchor links in the navbar
     * that point to sections on the same page.
     */
    document.querySelectorAll(".navbar a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function initializeButtonRippleEffect() {
    /**
     * Adds a material design-style ripple effect to all primary buttons
     * on click for better tactile feedback.
     */
    document.querySelectorAll(".btn-primary").forEach(button => {
        button.addEventListener("click", function (e) {
            const circle = document.createElement("span");
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - this.offsetLeft - radius}px`;
            circle.style.top = `${e.clientY - this.offsetTop - radius}px`;
            circle.classList.add("ripple");

            const existingRipple = this.getElementsByClassName("ripple")[0];
            if (existingRipple) {
                existingRipple.remove();
            }

            this.appendChild(circle);
        });
    });
}