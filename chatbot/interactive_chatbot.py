import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Generative AI model with your API key
# The API key is loaded from the .env file
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def chat_with_gemini():
    """
    Starts an interactive chat session with the Gemini-2.5-flash model.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    chat = model.start_chat(history=[])

    print("Gemini Chatbot: Hello! Type 'exit' to end the conversation.")

    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            print("Gemini Chatbot: Goodbye!")
            break

        try:
            response = chat.send_message(user_input)
            print("Gemini Chatbot:", response.text)
        except Exception as e:
            print(f"Gemini Chatbot: An error occurred - {e}")
            print("Please ensure your GEMINI_API_KEY is correctly set in the .env file and is valid.")

if __name__ == '__main__':
    chat_with_gemini()
