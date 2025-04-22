#!/bin/bash

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Read database credentials from .env file
if [ -f .env ]; then
    source .env
else
    echo ".env file not found. Please create one with your database credentials."
    exit 1
fi

# Create database and tables
mysql -u $DB_USER -p$DB_PASSWORD < src/database/schema.sql

echo "Database setup completed successfully!" 