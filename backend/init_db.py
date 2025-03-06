
from app import db, User, Campaign
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

# Sample platforms
platforms = ['LinkedIn', 'Email', 'Twitter', 'Facebook', 'Instagram', 'Phone', 'In Person', 'Other']

# Sample statuses
statuses = ['active', 'completed', 'draft']
status_weights = [0.6, 0.3, 0.1]  # 60% active, 30% completed, 10% draft

# Sample tags
tags = ['B2B', 'B2C', 'Tech', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Sales', 'Product Launch', 
        'Lead Generation', 'Conversion', 'Cold Outreach', 'Warm Leads', 'Event', 'Webinar', 'Partnership']

def create_mock_data():
    with db.app.app_context():
        # Clear existing data
        db.session.query(Campaign).delete()
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

        # Create campaigns for each user
        print("Creating mock campaigns...")
        campaigns_count = 0
        
        # Campaigns for admin
        admin_campaigns = [
            {
                'name': 'LinkedIn Sales Outreach',
                'description': 'Contacting decision makers in the tech industry for our SaaS product.',
                'target_audience': 'CTOs and VPs of Engineering at tech companies',
                'platform': 'LinkedIn',
                'budget': 5000,
                'start_date': '2023-10-01',
                'end_date': '2023-12-31',
                'status': 'active',
                'leads_count': 250,
                'responses_count': 48,
                'message_template': 'Hi {{name}}, I noticed your company is expanding its tech division. I'd love to show you how our product can help with scaling challenges.',
                'tags': 'Tech,SaaS,B2B'
            },
            {
                'name': 'Email Marketing Campaign',
                'description': 'Targeted email campaign to previous customers for our new product launch.',
                'target_audience': 'Previous customers who purchased in the last 6 months',
                'platform': 'Email',
                'budget': 2500,
                'start_date': '2023-11-01',
                'end_date': '2023-11-30',
                'status': 'active',
                'leads_count': 1200,
                'responses_count': 156,
                'message_template': 'Dear {{name}}, As a valued customer, we wanted to give you early access to our newest product launch...',
                'tags': 'Email,Existing Customers,Product Launch'
            },
            {
                'name': 'Twitter Ad Campaign',
                'description': 'Targeted ads on Twitter for brand awareness in the finance sector.',
                'target_audience': 'Finance professionals and enthusiasts',
                'platform': 'Twitter',
                'budget': 7500,
                'start_date': '2023-08-15',
                'end_date': '2023-10-15',
                'status': 'completed',
                'leads_count': 1850,
                'responses_count': 215,
                'message_template': '',
                'tags': 'Social Media,Finance,Ads'
            },
            {
                'name': 'Trade Show Contacts',
                'description': 'Follow-up campaign for contacts collected at the industry trade show.',
                'target_audience': 'Trade show attendees who visited our booth',
                'platform': 'Phone',
                'budget': 3200,
                'start_date': '2023-12-01',
                'end_date': '2024-01-31',
                'status': 'draft',
                'leads_count': 0,
                'responses_count': 0,
                'message_template': 'Hi {{name}}, It was great meeting you at the trade show. I wanted to follow up on our conversation about...',
                'tags': 'Trade Show,Follow-up,Direct'
            }
        ]
        
        for campaign_data in admin_campaigns:
            # Calculate conversion rate
            conversion_rate = None
            if campaign_data['leads_count'] > 0:
                conversion_rate = (campaign_data['responses_count'] / campaign_data['leads_count']) * 100
                
            campaign = Campaign(
                name=campaign_data['name'],
                description=campaign_data['description'],
                target_audience=campaign_data['target_audience'],
                platform=campaign_data['platform'],
                budget=campaign_data['budget'],
                start_date=campaign_data['start_date'],
                end_date=campaign_data['end_date'],
                status=campaign_data['status'],
                leads_count=campaign_data['leads_count'],
                responses_count=campaign_data['responses_count'],
                conversion_rate=conversion_rate,
                message_template=campaign_data['message_template'],
                owner_id=admin.id,
                created_date=(datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d'),
                tags=campaign_data['tags']
            )
            db.session.add(campaign)
            campaigns_count += 1

        # Create random campaigns for each regular user
        for user in users:
            # Each user gets 2-5 campaigns
            num_campaigns = random.randint(2, 5)
            for _ in range(num_campaigns):
                # Generate random creation date within the last 90 days
                created_date = (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d')
                
                # Generate random start and end dates
                start_date = (datetime.now() - timedelta(days=random.randint(0, 60))).strftime('%Y-%m-%d')
                end_date = (datetime.now() + timedelta(days=random.randint(30, 180))).strftime('%Y-%m-%d')
                
                # Random campaign data
                platform = random.choice(platforms)
                status = random.choices(statuses, weights=status_weights)[0]
                
                # Random name based on platform
                prefixes = ["Q4", "Spring", "Summer", "Fall", "Winter", "2023", "2024", "Global", "Regional", "Industry"]
                suffixes = ["Outreach", "Campaign", "Initiative", "Program", "Drive", "Push", "Strategy"]
                name = f"{random.choice(prefixes)} {platform} {random.choice(suffixes)}"
                
                # Random budget between $1,000 and $20,000
                budget = round(random.uniform(1000, 20000), 2)
                
                # Random leads and conversions
                leads_count = random.randint(0, 2000) if status != 'draft' else 0
                response_rate = random.uniform(0.05, 0.3)  # 5% to 30% response rate
                responses_count = int(leads_count * response_rate) if leads_count > 0 else 0
                
                # Calculate conversion rate
                conversion_rate = (responses_count / leads_count) * 100 if leads_count > 0 else None
                
                # Random tags (2-4 tags)
                selected_tags = random.sample(tags, random.randint(2, 4))
                tags_str = ','.join(selected_tags)
                
                # Message template examples
                message_templates = [
                    "Hi {{name}}, I saw your profile and thought our {{product}} might be a good fit for your needs at {{company}}.",
                    "Dear {{name}}, I'm reaching out because I noticed you're in the {{industry}} industry and our solution addresses the common pain points.",
                    "Hello {{name}}, We recently helped a company similar to {{company}} achieve great results with our approach to {{problem}}.",
                    ""  # Empty template option
                ]
                
                campaign = Campaign(
                    name=name,
                    description=f"This is a {platform.lower()} campaign targeting potential customers in our database with personalized outreach.",
                    target_audience=f"Professionals in {random.choice(['tech', 'finance', 'healthcare', 'education', 'retail', 'manufacturing'])} industry",
                    platform=platform,
                    budget=budget,
                    start_date=start_date,
                    end_date=end_date,
                    status=status,
                    leads_count=leads_count,
                    responses_count=responses_count,
                    conversion_rate=conversion_rate,
                    message_template=random.choice(message_templates) if random.random() > 0.3 else "",
                    owner_id=user.id,
                    created_date=created_date,
                    tags=tags_str
                )
                
                db.session.add(campaign)
                campaigns_count += 1
        
        db.session.commit()
        print(f"Created {campaigns_count} campaigns")
        print("Mock data creation completed successfully!")

if __name__ == '__main__':
    create_mock_data()
