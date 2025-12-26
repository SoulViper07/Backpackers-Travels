from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from os import getenv
import os
import logging
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
GEMINI_API_KEY = getenv("GEMINI_API_KEY")
GEMINI_MODEL = getenv("GEMINI_MODEL", "models/gemini-1.5-flash") # Default to models/gemini-1.5-flash if not set

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file or environment variables")

# Configure logging
logging.basicConfig(level=logging.INFO)

# Configure Google Gemini API
genai.configure(api_key=GEMINI_API_KEY)
system_instruction = "You are GuideAI, a friendly and expert travel assistant. You must only answer questions related to travel, tourism, geography, and trip planning. If a user asks about anything else, you must politely decline and state that you are a travel assistant and cannot answer questions on that topic. Your answers should be concise and to the point. Provide information in a nutshell, using bullet points if possible. If the user asks for more details, then you can elaborate."
model = genai.GenerativeModel(
    GEMINI_MODEL,
    system_instruction=system_instruction
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        app.logger.info(f"Received message: {user_message}")
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(user_message)
        
        return jsonify({"reply": response.text})

    except google_exceptions.DeadlineExceeded as e:
        app.logger.error(f"Timeout error processing message '{user_message}': {e}")
        return jsonify({"error": "The request to the AI service timed out. Please try again later."}), 504

    except google_exceptions.GoogleAPICallError as e:
        app.logger.error(f"API call error processing message '{user_message}': {e}")
        return jsonify({"error": "A problem occurred with the AI service. Please check credentials and configuration."}), 502

    except Exception as e:
        app.logger.error(f"An unexpected error occurred processing message '{user_message}': {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500

@app.route('/faqs', methods=['GET'])
def get_faqs():
    faqs = [
        {"question": "What is your return policy?", "answer": "Our return policy is 30 days, no questions asked."},
        {"question": "How do I track my order?", "answer": "You can track your order using the tracking number sent to your email."},
        {"question": "Do you ship internationally?", "answer": "Yes, we ship to most countries worldwide."}
    ]
    return jsonify(faqs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)