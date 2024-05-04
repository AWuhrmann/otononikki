from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Path to your service account key file
SERVICE_ACCOUNT_FILE = 'account.json'

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

# Call the function to upload files
upload_file('example.md', 'example.md', 'text/plain')
<<<<<<< HEAD

=======
>>>>>>> c436995464ecb191c209ed423be1767b420e1609
