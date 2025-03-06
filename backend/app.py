
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
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sellbyowner.db'
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
    items = db.relationship('Item', backref='owner', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(200))
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(100))
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    posted_date = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'location': self.location,
            'category': self.category,
            'image_url': self.image_url,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'owner_id': str(self.owner_id),
            'owner_name': self.owner.name,
            'posted_date': self.posted_date,
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

# Item routes
@app.route('/api/items', methods=['GET'])
def get_all_items():
    items = Item.query.filter_by(status='active').all()
    return jsonify({
        'items': [item.to_dict() for item in items]
    }), 200

@app.route('/api/items/user/<user_id>', methods=['GET'])
def get_user_items(user_id):
    items = Item.query.filter_by(owner_id=user_id).all()
    return jsonify({
        'items': [item.to_dict() for item in items]
    }), 200

@app.route('/api/items/stats/<user_id>', methods=['GET'])
def get_item_stats(user_id):
    user_items = Item.query.filter_by(owner_id=user_id).all()
    
    # Count by status
    active = sum(1 for item in user_items if item.status == 'active')
    sold = sum(1 for item in user_items if item.status == 'sold')
    draft = sum(1 for item in user_items if item.status == 'draft')
    
    # Count by category
    by_category = {}
    for item in user_items:
        by_category[item.category] = by_category.get(item.category, 0) + 1
    
    # Calculate total value
    total_value = sum(item.price for item in user_items if item.status == 'active')
    sold_value = sum(item.price for item in user_items if item.status == 'sold')
    
    return jsonify({
        'stats': {
            'active': active,
            'sold': sold,
            'draft': draft,
            'byCategory': by_category,
            'totalValue': total_value,
            'soldValue': sold_value
        }
    }), 200

@app.route('/api/items', methods=['POST'])
@jwt_required()
def create_item():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    new_item = Item(
        title=data['title'],
        description=data['description'],
        price=data['price'],
        location=data['location'],
        category=data['category'],
        image_url=data.get('image_url', ''),
        contact_phone=data.get('contact_phone', ''),
        contact_email=data.get('contact_email', ''),
        owner_id=user_id,
        posted_date=today,
        status=data['status']
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item created successfully',
        'item': new_item.to_dict()
    }), 201

@app.route('/api/items/<item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    user_id = get_jwt_identity()
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
        
    # Ensure user owns the item or is admin
    user = User.query.get(user_id)
    if str(item.owner_id) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'price' in data:
        item.price = data['price']
    if 'location' in data:
        item.location = data['location']
    if 'category' in data:
        item.category = data['category']
    if 'image_url' in data:
        item.image_url = data['image_url']
    if 'contact_phone' in data:
        item.contact_phone = data['contact_phone']
    if 'contact_email' in data:
        item.contact_email = data['contact_email']
    if 'status' in data:
        item.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated successfully',
        'item': item.to_dict()
    }), 200

@app.route('/api/items/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    user_id = get_jwt_identity()
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
        
    # Ensure user owns the item or is admin
    user = User.query.get(user_id)
    if str(item.owner_id) != str(user_id) and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item deleted successfully'
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
