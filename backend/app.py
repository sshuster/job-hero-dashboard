
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
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leadcampaign.db'
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
    campaigns = db.relationship('Campaign', backref='owner', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(200), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.String(10), nullable=False)
    end_date = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='draft')
    leads_count = db.Column(db.Integer, default=0)
    responses_count = db.Column(db.Integer, default=0)
    conversion_rate = db.Column(db.Float)
    message_template = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_date = db.Column(db.String(10), nullable=False)
    tags = db.Column(db.Text)  # Store as comma-separated values

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'target_audience': self.target_audience,
            'platform': self.platform,
            'budget': self.budget,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'status': self.status,
            'leads_count': self.leads_count,
            'responses_count': self.responses_count,
            'conversion_rate': self.conversion_rate,
            'message_template': self.message_template,
            'owner_id': str(self.owner_id),
            'owner_name': self.owner.name,
            'created_date': self.created_date,
            'tags': self.tags.split(',') if self.tags else []
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

# Campaign routes
@app.route('/api/campaigns', methods=['GET'])
def get_all_campaigns():
    # Only get active and completed campaigns for public view
    campaigns = Campaign.query.filter(Campaign.status != 'draft').all()
    return jsonify({
        'campaigns': [campaign.to_dict() for campaign in campaigns]
    }), 200

@app.route('/api/campaigns/user/<user_id>', methods=['GET'])
def get_user_campaigns(user_id):
    campaigns = Campaign.query.filter_by(owner_id=user_id).all()
    return jsonify({
        'campaigns': [campaign.to_dict() for campaign in campaigns]
    }), 200

@app.route('/api/campaigns/stats/<user_id>', methods=['GET'])
def get_campaign_stats(user_id):
    user_campaigns = Campaign.query.filter_by(owner_id=user_id).all()
    
    # Count by status
    active = sum(1 for campaign in user_campaigns if campaign.status == 'active')
    completed = sum(1 for campaign in user_campaigns if campaign.status == 'completed')
    draft = sum(1 for campaign in user_campaigns if campaign.status == 'draft')
    
    # Count by platform
    by_platform = {}
    for campaign in user_campaigns:
        by_platform[campaign.platform] = by_platform.get(campaign.platform, 0) + 1
    
    # Calculate total budget
    total_budget = sum(campaign.budget for campaign in user_campaigns if campaign.status in ['active', 'completed'])
    
    # Calculate total leads and conversions
    total_leads = sum(campaign.leads_count for campaign in user_campaigns)
    total_conversions = sum(campaign.responses_count for campaign in user_campaigns)
    
    # Calculate average conversion rate
    campaigns_with_leads = [c for c in user_campaigns if c.leads_count > 0]
    avg_conversion_rate = sum(c.conversion_rate or 0 for c in campaigns_with_leads) / len(campaigns_with_leads) if campaigns_with_leads else 0
    
    return jsonify({
        'stats': {
            'active': active,
            'completed': completed,
            'draft': draft,
            'byPlatform': by_platform,
            'totalBudget': total_budget,
            'totalLeads': total_leads,
            'totalConversions': total_conversions,
            'averageConversionRate': avg_conversion_rate
        }
    }), 200

@app.route('/api/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Calculate conversion rate
    conversion_rate = None
    if data.get('leads_count', 0) > 0:
        conversion_rate = (data.get('responses_count', 0) / data.get('leads_count', 0)) * 100
    
    # Process tags
    tags_str = ','.join(data.get('tags', [])) if data.get('tags') else ''
    
    new_campaign = Campaign(
        name=data['name'],
        description=data['description'],
        target_audience=data['target_audience'],
        platform=data['platform'],
        budget=data['budget'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        status=data['status'],
        leads_count=data.get('leads_count', 0),
        responses_count=data.get('responses_count', 0),
        conversion_rate=conversion_rate,
        message_template=data.get('message_template', ''),
        owner_id=user_id,
        created_date=today,
        tags=tags_str
    )
    
    db.session.add(new_campaign)
    db.session.commit()
    
    return jsonify({
        'message': 'Campaign created successfully',
        'campaign': new_campaign.to_dict()
    }), 201

@app.route('/api/campaigns/<campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    user_id = get_jwt_identity()
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
        
    # Ensure user owns the campaign or is admin
    user = User.query.get(user_id)
    if str(campaign.owner_id) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        campaign.name = data['name']
    if 'description' in data:
        campaign.description = data['description']
    if 'target_audience' in data:
        campaign.target_audience = data['target_audience']
    if 'platform' in data:
        campaign.platform = data['platform']
    if 'budget' in data:
        campaign.budget = data['budget']
    if 'start_date' in data:
        campaign.start_date = data['start_date']
    if 'end_date' in data:
        campaign.end_date = data['end_date']
    if 'status' in data:
        campaign.status = data['status']
    if 'leads_count' in data:
        campaign.leads_count = data['leads_count']
    if 'responses_count' in data:
        campaign.responses_count = data['responses_count']
    if 'message_template' in data:
        campaign.message_template = data['message_template']
    if 'tags' in data:
        campaign.tags = ','.join(data['tags'])
    
    # Recalculate conversion rate
    if campaign.leads_count > 0:
        campaign.conversion_rate = (campaign.responses_count / campaign.leads_count) * 100
    
    db.session.commit()
    
    return jsonify({
        'message': 'Campaign updated successfully',
        'campaign': campaign.to_dict()
    }), 200

@app.route('/api/campaigns/<campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    user_id = get_jwt_identity()
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
        
    # Ensure user owns the campaign or is admin
    user = User.query.get(user_id)
    if str(campaign.owner_id) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    db.session.delete(campaign)
    db.session.commit()
    
    return jsonify({
        'message': 'Campaign deleted successfully'
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
