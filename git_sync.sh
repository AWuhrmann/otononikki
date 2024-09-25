#!/bin/bash

# Path to your Git repository
REPO_PATH="./vault/"

LOG_FILE="./logs/git_sync.log"

# Ensure the log directory exists, relative to the script's directory
SCRIPT_DIR=$(dirname "$0") # Get the directory where the script is located
LOG_DIR="$SCRIPT_DIR/logs" # Set the log directory relative to the script's directory

# Create the logs directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
fi

echo $(ls)

# Change to the repository directory
cd $REPO_PATH || exit

# Get the current date and time for the commit message
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Add all changes
git add .

# Commit with the current timestamp as the message
git commit -m "Automated commit at $TIMESTAMP"

# Pull the latest changes from the remote repository
git pull --rebase 

# Push the changes to the remote repository
git push --set-upstream origin master

# Log the completion of the script execution
echo "Git sync completed at $TIMESTAMP" >> ../logs/git_sync.log 1>&1
