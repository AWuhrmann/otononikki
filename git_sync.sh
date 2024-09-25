#!/bin/bash

# Path to your Git repository
REPO_PATH="./vault/"

# Change to the repository directory
cd $REPO_PATH || exit

# Get the current date and time for the commit message
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Add all changes
git add .

# Commit with the current timestamp as the message
git commit -m "Automated commit at $TIMESTAMP"

# Pull the latest changes from the remote repository
git pull origin master

# Push the changes to the remote repository
git push --set-upstream origin master

# Log the completion of the script execution
echo "Git sync completed at $TIMESTAMP" >> /path/to/git_sync.log 2>&1
