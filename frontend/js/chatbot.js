document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeButton = document.getElementById('close-button');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const faqPanel = document.getElementById('faq-panel');
    const faqList = document.getElementById('faq-list');
    const toggleFaqButton = document.getElementById('toggle-faq-button');
    // const chatInterfaceContainer = document.querySelector('.chat-interface-container'); // Not directly used in JS logic here


    // Emoji pool for AI responses
    const travelEmojis = ['✈️', '🌍', '🗺️', '📍', '🎒', '✨'];

    if (chatButton) {
        chatButton.addEventListener('click', () => {
            chatModal.style.display = 'flex';
            fetchFAQs(); // Fetch FAQs when modal opens
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            chatModal.style.display = 'none';
        });
    }

    // Close modal if user clicks outside of it
    if (chatModal) {
        window.addEventListener('click', (event) => {
            if (event.target === chatModal) {
                chatModal.style.display = 'none';
            }
        });
    }

    // Toggle FAQ panel visibility
    let faqsVisible = false;
    if (toggleFaqButton && faqPanel && chatBox) {
        toggleFaqButton.addEventListener('click', () => {
            faqsVisible = !faqsVisible;
            if (faqsVisible) {
                faqPanel.classList.add('active');
                if (window.innerWidth > 600) { // Only shrink chatbox on larger screens
                    chatBox.style.width = '55%';
                }
                toggleFaqButton.textContent = 'Hide FAQs';
            } else {
                faqPanel.classList.remove('active');
                if (window.innerWidth > 600) { // Only expand chatbox on larger screens
                    chatBox.style.width = '100%';
                }
                toggleFaqButton.textContent = 'Show FAQs';
            }
        });
    }

    // Function to parse Markdown-like text to HTML
    function parseMarkdown(text) {
        if (!text) return '';

        // Bold: **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic: *text*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Bullet points: - item or * item
        // This regex tries to capture lines that look like list items
        text = text.replace(/(\n|^)\s*[-\*]\s+(.*?)($|\n)/g, (match, p1, p2, p3) => {
            // Check if we are starting a new list or continuing an existing one
            // This is a simplified approach, a full markdown parser would handle block elements better
            if (!p1.includes('<ul>') && !p1.includes('</ul>')) { // Avoid nesting lists unnecessarily
                return p1 + '<ul><li>' + p2.trim() + '</li>' + p3;
            }
            return p1 + '<li>' + p2.trim() + '</li>' + p3;
        });

        // Close any open ul tags if they exist at the end
        if (text.includes('<ul>') && !text.includes('</ul>')) {
            text += '</ul>';
        }

        // Clean up multiple </ul><ul> into just a single transition if lists are separated by non-list items
        text = text.replace(/<\/ul>\s*<ul>/g, '');

        // Convert remaining newlines to <br> for proper display if not within a list or other block
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Typewriter effect function (now accepts a callback for completion)
    function typeWriterEffect(element, text, delay = 1, callback = () => {}) {
        let i = 0;
        element.textContent = ''; // Clear content first
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                chatBox.scrollTop = chatBox.scrollHeight; // Keep scrolling
                i++;
            } else {
                clearInterval(interval);
                callback(); // Execute callback when typing is complete
            }
        }, delay);
    }

    // Function to add emojis to bot responses
    function addEmojis(text) {
        if (!text) return '';
        const words = text.split(' ');
        const newWords = words.map(word => {
            if (Math.random() < 0.15) { // 15% chance to add an emoji after a word
                return word + ' ' + travelEmojis[Math.floor(Math.random() * travelEmojis.length)];
            }
            return word;
        });
        return newWords.join(' ');
    }

    // Function to add a message to the chat box
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble', sender);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom

                if (sender === 'bot') {
                    const processedMessage = addEmojis(message);
                    typeWriterEffect(messageElement, processedMessage, 1, () => {
                        messageElement.innerHTML = parseMarkdown(messageElement.textContent);
                    });
                } else {
                    messageElement.textContent = message;
                }    }

    // Function to send message to backend
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            chatInput.value = ''; // Clear input field

            try {
                // Display a loading indicator
                const loadingBubble = document.createElement('div');
                loadingBubble.classList.add('chat-bubble', 'bot');
                loadingBubble.innerHTML = '<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'; // Animated dots
                chatBox.appendChild(loadingBubble);
                chatBox.scrollTop = chatBox.scrollHeight;

                const response = await fetch('https://backpackers-travels-chatbot.onrender.com/chat', { // Assuming Flask runs on 5000
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                });

                const data = await response.json();

                // Remove loading indicator
                chatBox.removeChild(loadingBubble);

                if (response.ok) {
                    addMessage(data.reply, 'bot');
                } else {
                    addMessage(`Error: ${data.error || 'Something went wrong'}`, 'bot');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Remove loading indicator if present
                const loadingBubble = chatBox.querySelector('.loading-dots')?.parentNode;
                if (loadingBubble) {
                    chatBox.removeChild(loadingBubble);
                }
                addMessage('Error: Could not connect to the chatbot.', 'bot');
            }
        }
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Voice recognition
    const voiceButton = document.getElementById('voice-button');
    if (voiceButton) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            voiceButton.addEventListener('click', () => {
                recognition.start();
                voiceButton.classList.add('listening');
                voiceButton.disabled = true;
            });

            recognition.addEventListener('result', (e) => {
                const transcript = Array.from(e.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                chatInput.value = transcript;
                sendMessage();
            });

            recognition.addEventListener('error', (e) => {
                console.error('Speech recognition error:', e.error);
                addMessage('Sorry, I had trouble understanding. Please try again.', 'bot');
            });

            recognition.addEventListener('end', () => {
                voiceButton.classList.remove('listening');
                voiceButton.disabled = false;
            });

        } else {
            voiceButton.style.display = 'none';
            console.log("Speech recognition not supported in this browser.");
        }
    }

    // Function to fetch and render FAQs
    async function fetchFAQs() {
        if (!faqList) return; // Ensure faqList element exists
        faqList.innerHTML = '<div class="loading-message" style="color: #00bcd4; text-align: center;">Loading FAQs...</div>';
        try {
            const response = await fetch('https://backpackers-travels-chatbot.onrender.com/faqs');
            const faqs = await response.json();
            faqList.innerHTML = ''; // Clear loading message

            if (faqs && faqs.length > 0) {
                faqs.forEach(faq => {
                    const faqItem = document.createElement('div');
                    faqItem.classList.add('faq-item');
                    faqItem.textContent = faq.question;
                    faqItem.addEventListener('click', () => {
                        chatInput.value = faq.question; // Auto-fill input
                        // sendMessage(); // Optionally send message immediately
                    });
                    faqList.appendChild(faqItem);
                });
            } else {
                faqList.innerHTML = '<div style="color: #aaa; text-align: center;">No FAQs available.</div>';
            }

        } catch (error) {
            console.error('Error fetching FAQs:', error);
            faqList.innerHTML = '<div style="color: red; text-align: center;">Failed to load FAQs.</div>';
        }
    }
});
