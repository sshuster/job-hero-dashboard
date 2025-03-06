
# JobHero Backend

This is the backend API for the JobHero application, built with Flask and SQLite.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user information

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/user/<user_id>` - Get jobs posted by a specific user
- `GET /api/jobs/stats/<user_id>` - Get job statistics for a specific user
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/<job_id>` - Update a job
- `DELETE /api/jobs/<job_id>` - Delete a job

## Database

The application uses SQLite as its database. The database file (`jobhero.db`) will be created automatically when you run the application for the first time.

## JWT Authentication

The application uses JWT for authentication. When a user logs in or registers, a JWT token is returned. This token should be included in the Authorization header for protected routes.
