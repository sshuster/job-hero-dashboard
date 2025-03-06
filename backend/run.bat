
@echo off

:: Create virtual environment if it doesn't exist
if not exist venv (
    python -m venv venv
    echo Created virtual environment
)

:: Activate virtual environment
call venv\Scripts\activate

:: Install dependencies
pip install -r requirements.txt
echo Installed dependencies

:: Initialize database with mock data
python init_db.py
echo Initialized database

:: Run the Flask application
set FLASK_APP=app.py
set FLASK_ENV=development
python app.py
