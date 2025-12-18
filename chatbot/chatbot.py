import google.generativeai as genai
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()
print(f"DEBUG: GEMINI_API_KEY loaded: {bool(os.getenv('GEMINI_API_KEY'))}") # Debug statement
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    prompt = data.get("prompt", "")
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return jsonify({"response": response.text})

if __name__ == '__main__':
    app.run(port=5000)
