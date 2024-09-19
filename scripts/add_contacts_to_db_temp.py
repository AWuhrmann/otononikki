import os
import psycopg2

# Function to create a user in the database
def create_user_in_db(name, cursor):
    try:
        query = "INSERT INTO Users (name) VALUES (%s);"
        cursor.execute(query, (name,))
        print(f"User '{name}' added to the database.")
    except Exception as e:
        print(f"Error adding user '{name}': {e}")

# Function to process .md files in a given folder
def process_md_files(folder_path, connection):
    try:
        # Create a cursor object
        cursor = connection.cursor()

        # Iterate over all files in the given folder
        for filename in os.listdir(folder_path):
            # Check if the file has a .md extension
            if filename.endswith('.md'):
                # Extract the filename without the .md extension
                user_name = os.path.splitext(filename)[0]
                
                # Create a user in the database with the extracted name
                create_user_in_db(user_name, cursor)

        # Commit the changes
        connection.commit()
        print("All users have been added successfully.")
    except FileNotFoundError:
        print(f"The folder '{folder_path}' does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close the cursor
        cursor.close()

# Database connection parameters
db_params = {
    'dbname': 'users_db',
    'user': 'wuhrmann',           # Replace with your PostgreSQL username
    'password': 'wuhrmann',   # Replace with your PostgreSQL password
    'host': 'localhost',              # PostgreSQL server address
    'port': 5432                      # PostgreSQL port
}

# Connect to the PostgreSQL database
try:
    connection = psycopg2.connect(**db_params)
    print("Connected to the database successfully.")

    # Replace 'your_folder_path' with the path to your folder containing .md files
    folder_path = '../vault/contacts'
    process_md_files(folder_path, connection)
except Exception as e:
    print(f"Database connection error: {e}")
finally:
    # Close the database connection
    if connection:
        connection.close()
        print("Database connection closed.")
