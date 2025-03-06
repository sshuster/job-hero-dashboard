
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobhero.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Initialize JWT and SQLAlchemy
jwt = JWTManager(app)
db = SQLAlchemy(app)

# Define database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    jobs = db.relationship('Job', backref='author', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    salary = db.Column(db.String(100))
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=False)  # Stored as JSON string
    type = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    postedBy = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    postedDate = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')

    def to_dict(self):
        import json
        return {
            'id': str(self.id),
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'salary': self.salary,
            'description': self.description,
            'requirements': json.loads(self.requirements),
            'type': self.type,
            'category': self.category,
            'postedBy': str(self.postedBy),
            'postedDate': self.postedDate,
            'status': self.status
        }

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
        
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
        
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=new_user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict(),
        'access_token': access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400
        
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
        
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    # In a stateless JWT setup, logout is handled client-side by removing the token
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    return jsonify({
        'user': user.to_dict()
    }), 200

# Job routes
@app.route('/api/jobs', methods=['GET'])
def get_all_jobs():
    jobs = Job.query.all()
    return jsonify({
        'jobs': [job.to_dict() for job in jobs]
    }), 200

@app.route('/api/jobs/user/<user_id>', methods=['GET'])
def get_user_jobs(user_id):
    jobs = Job.query.filter_by(postedBy=user_id).all()
    return jsonify({
        'jobs': [job.to_dict() for job in jobs]
    }), 200

@app.route('/api/jobs/stats/<user_id>', methods=['GET'])
def get_job_stats(user_id):
    user_jobs = Job.query.filter_by(postedBy=user_id).all()
    
    # Count by status
    active = sum(1 for job in user_jobs if job.status == 'active')
    closed = sum(1 for job in user_jobs if job.status == 'closed')
    draft = sum(1 for job in user_jobs if job.status == 'draft')
    
    # Count by category
    by_category = {}
    for job in user_jobs:
        by_category[job.category] = by_category.get(job.category, 0) + 1
    
    # Count by type
    by_type = {}
    for job in user_jobs:
        by_type[job.type] = by_type.get(job.type, 0) + 1
    
    return jsonify({
        'stats': {
            'active': active,
            'closed': closed,
            'draft': draft,
            'byCategory': by_category,
            'byType': by_type
        }
    }), 200

@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    import json
    today = datetime.now().strftime('%Y-%m-%d')
    
    new_job = Job(
        title=data['title'],
        company=data['company'],
        location=data['location'],
        salary=data.get('salary', ''),
        description=data['description'],
        requirements=json.dumps(data['requirements']),
        type=data['type'],
        category=data['category'],
        postedBy=user_id,
        postedDate=today,
        status=data['status']
    )
    
    db.session.add(new_job)
    db.session.commit()
    
    return jsonify({
        'message': 'Job created successfully',
        'job': new_job.to_dict()
    }), 201

@app.route('/api/jobs/<job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'message': 'Job not found'}), 404
        
    # Ensure user owns the job or is admin
    user = User.query.get(user_id)
    if str(job.postedBy) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    import json
    
    if 'title' in data:
        job.title = data['title']
    if 'company' in data:
        job.company = data['company']
    if 'location' in data:
        job.location = data['location']
    if 'salary' in data:
        job.salary = data['salary']
    if 'description' in data:
        job.description = data['description']
    if 'requirements' in data:
        job.requirements = json.dumps(data['requirements'])
    if 'type' in data:
        job.type = data['type']
    if 'category' in data:
        job.category = data['category']
    if 'status' in data:
        job.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Job updated successfully',
        'job': job.to_dict()
    }), 200

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = get_jwt_identity()
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'message': 'Job not found'}), 404
        
    # Ensure user owns the job or is admin
    user = User.query.get(user_id)
    if str(job.postedBy) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    db.session.delete(job)
    db.session.commit()
    
    return jsonify({
        'message': 'Job deleted successfully'
    }), 200

# Initialize the database
with app.app_context():
    db.create_all()
    
    # Check if admin user exists, if not create one
    admin = User.query.filter_by(email='admin@example.com').first()
    if not admin:
        admin_user = User(
            name='Administrator',
            email='admin@example.com',
            password=generate_password_hash('admin'),
            role='admin'
        )
        db.session.add(admin_user)
        db.session.commit()

# Start the application
if __name__ == '__main__':
    app.run(debug=True)
