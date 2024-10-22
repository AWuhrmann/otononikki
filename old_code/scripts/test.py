from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  # This method loads environment variables from .env
client = OpenAI()

folder_path = 'audio_manual'  # Change this to your folder path

# Function to transcribe audio and save to a text file
def transcribe_audio_to_text(audio_path, text_path):
    audio_file = open(audio_path, "rb")
    result = client.audio.transcriptions.create(
      model="whisper-1",
      file=audio_file
    )
    audio_file.close()
    with open(text_path, 'w') as text_file:
        text_file.write(result['text'])

# Iterate through all files in the folder
for file_name in os.listdir(folder_path):
    # Construct full file path
    file_path = os.path.join(folder_path, file_name)

    # Check if the file is an audio file (you can adjust the extensions as needed)
    if file_path.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.flac')):
        # Set the output text file path with the same name but .txt extension
        text_file_path = os.path.splitext(file_path)[0] + '.txt'

        # Transcribe the audio file and save it as a text file
        transcribe_audio_to_text(file_path, text_file_path)

        print(f'Transcribed {file_name} to {text_file_path}')

print("Transcription completed for all audio files.")
