from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from os import getenv
import os
import logging
from groq import Groq, APIError

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
GROQ_API_KEY = getenv("GROQ_API_KEY")
GROQ_MODEL = getenv("GROQ_MODEL", "llama-3.3-70b-versatile") # Default to the fastest free chat model

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file or environment variables")

# Configure logging
logging.basicConfig(level=logging.INFO)

# Configure Groq client
client = Groq(api_key=GROQ_API_KEY)
system_instruction = "You are GuideAI, a friendly and expert travel assistant. You must only answer questions related to travel, tourism, geography, and trip planning. If a user asks about anything else, you must politely decline and state that you are a travel assistant and cannot answer questions on that topic. Your answers should be concise and to the point. Provide information in a nutshell, using bullet points if possible. If the user asks for more details, then you can elaborate."

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        app.logger.info(f"Received message: {user_message}")

        messages = [
            ChatCompletionMessageParam(role="system", content=system_instruction),
            ChatCompletionMessageParam(role="user", content=user_message),
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL,
            temperature=0.7, # You can adjust temperature for creativity
            max_tokens=1024, # Adjust based on desired response length
        )

        reply_content = chat_completion.choices[0].message.content
        return jsonify({"reply": reply_content})

    except APIError as e:
        app.logger.error(f"Groq API call error processing message '{user_message}': {e}")
        # Groq API errors can have specific codes, but generally we return 502 for upstream API issues
        status_code = e.status_code if hasattr(e, 'status_code') else 502
        return jsonify({"error": f"A problem occurred with the AI service: {e.message}. Please check credentials and configuration, or try again later."}), status_code

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