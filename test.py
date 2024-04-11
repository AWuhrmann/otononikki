from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  # This method loads environment variables from .env
client = OpenAI()

audio_file = open("uploads/audioFile-1712787722628", "rb")
transcript = client.audio.transcriptions.create(
  model="whisper-1",
  file=audio_file
)
