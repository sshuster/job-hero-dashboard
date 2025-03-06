
from app import db, User, Item
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

# Sample categories
categories = ['Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Real Estate', 'Services', 'Collectibles', 'Other']

# Sample locations
locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA']

# Sample statuses
statuses = ['active', 'sold', 'draft']
status_weights = [0.7, 0.2, 0.1]  # 70% active, 20% sold, 10% draft

def create_mock_data():
    with db.app.app_context():
        # Clear existing data
        db.session.query(Item).delete()
        db.session.query(User).delete()
        db.session.commit()

        print("Creating mock users...")
        # Create admin user
        admin = User(
            name='Administrator',
            email='admin@example.com',
            password=generate_password_hash('admin'),
            role='admin'
        )
        db.session.add(admin)

        # Create regular users
        users = []
        for i in range(1, 6):
            user = User(
                name=f'User {i}',
                email=f'user{i}@example.com',
                password=generate_password_hash(f'password{i}'),
                role='user'
            )
            users.append(user)
            db.session.add(user)
        
        db.session.commit()
        print(f"Created {len(users) + 1} users")

        # Create items for each user
        print("Creating mock items...")
        items_count = 0
        
        # Items for admin
        admin_items = [
            {
                'title': 'iPhone 13 Pro - Like New',
                'description': 'Selling my iPhone 13 Pro, only used for 3 months. Comes with original box and accessories.',
                'price': 899.99,
                'category': 'Electronics',
                'location': 'New York, NY',
                'image_url': 'https://example.com/iphone.jpg',
                'contact_phone': '555-123-4567',
                'contact_email': 'admin@example.com',
                'status': 'active'
            },
            {
                'title': 'Leather Sofa - Excellent Condition',
                'description': 'Beautiful brown leather sofa, 3 years old but in excellent condition. No scratches or tears.',
                'price': 650.00,
                'category': 'Furniture',
                'location': 'Los Angeles, CA',
                'image_url': 'https://example.com/sofa.jpg',
                'contact_phone': '555-123-4567',
                'contact_email': 'admin@example.com',
                'status': 'active'
            },
            {
                'title': '2018 Honda Civic - Low Mileage',
                'description': '2018 Honda Civic with only 25,000 miles. One owner, regular maintenance, all service records available.',
                'price': 18500.00,
                'category': 'Vehicles',
                'location': 'Chicago, IL',
                'image_url': 'https://example.com/civic.jpg',
                'contact_phone': '555-123-4567',
                'contact_email': 'admin@example.com',
                'status': 'sold'
            },
            {
                'title': 'Vintage Record Collection',
                'description': 'Collection of 200+ vinyl records from the 60s and 70s, including rare first pressings.',
                'price': 1200.00,
                'category': 'Collectibles',
                'location': 'San Francisco, CA',
                'image_url': 'https://example.com/records.jpg',
                'contact_phone': '555-123-4567',
                'contact_email': 'admin@example.com',
                'status': 'draft'
            }
        ]
        
        for item_data in admin_items:
            item = Item(
                title=item_data['title'],
                description=item_data['description'],
                price=item_data['price'],
                location=item_data['location'],
                category=item_data['category'],
                image_url=item_data['image_url'],
                contact_phone=item_data['contact_phone'],
                contact_email=item_data['contact_email'],
                owner_id=admin.id,
                posted_date=(datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d'),
                status=item_data['status']
            )
            db.session.add(item)
            items_count += 1

        # Create random items for each regular user
        for user in users:
            # Each user gets 3-7 items
            num_items = random.randint(3, 7)
            for _ in range(num_items):
                # Generate random posting date within the last 60 days
                posted_date = (datetime.now() - timedelta(days=random.randint(1, 60))).strftime('%Y-%m-%d')
                
                # Random item data
                title_prefixes = ["New", "Used", "Like New", "Vintage", "Rare", "Custom"]
                title_items = ["Table", "Laptop", "Camera", "Bicycle", "Jacket", "Guitar", "Watch", "Book Collection", "Shoes", "Painting"]
                title = f"{random.choice(title_prefixes)} {random.choice(title_items)}"
                
                price = round(random.uniform(10, 2000), 2)
                category = random.choice(categories)
                location = random.choice(locations)
                status = random.choices(statuses, weights=status_weights)[0]
                
                item = Item(
                    title=title,
                    description=f"This is a detailed description for {title.lower()}. The item is in good condition and ready for a new owner.",
                    price=price,
                    location=location,
                    category=category,
                    image_url=f"https://example.com/image{random.randint(1, 100)}.jpg",
                    contact_phone=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    contact_email=user.email,
                    owner_id=user.id,
                    posted_date=posted_date,
                    status=status
                )
                
                db.session.add(item)
                items_count += 1
        
        db.session.commit()
        print(f"Created {items_count} items")
        print("Mock data creation completed successfully!")

if __name__ == '__main__':
    create_mock_data()
