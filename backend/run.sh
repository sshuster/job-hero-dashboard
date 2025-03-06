
#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "Created virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
echo "Installed dependencies"

# Initialize database with mock data
python init_db.py
echo "Initialized database"

# Run the Flask application
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
