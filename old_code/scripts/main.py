import sys

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

import os

# Get the directory of the current script
dir_path = os.path.dirname(os.path.realpath(__file__))

# Join the directory path with the name of your service account file
SERVICE_ACCOUNT_FILE = os.path.join(dir_path, 'account.json')

# Define the scopes
SCOPES = ['https://www.googleapis.com/auth/drive']

# Authenticate using the service account
creds = Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Build the Drive service
service = build('drive', 'v3', credentials=creds)

def upload_file(file_name, file_path, mime_type):
    file_metadata = {'name': file_name, 'parents': ['1J19CyIGagO5ehjPxYf2cESEzJwh_LhOf']}
    media = MediaFileUpload(file_path, mimetype=mime_type)
    file = service.files().create(body=file_metadata,
                                  media_body=media,
                                  fields='id').execute()
    print('File ID: %s' % file['id'])

if __name__ == "__main__":

    print("execution")

    if len(sys.argv) < 2:
        print("Usage: python main.py <file_name> <file_path>")
        sys.exit(1)

    file_name = sys.argv[1]
    file_path = sys.argv[2]

    upload_file(file_name, file_path, 'text/plain')
