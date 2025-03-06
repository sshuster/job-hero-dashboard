
from app import app, db, User, Job
from werkzeug.security import generate_password_hash
import json
from datetime import datetime

# Mock jobs data that matches the frontend
mock_jobs = [
    {
        'title': 'Frontend Developer',
        'company': 'Tech Solutions Inc.',
        'location': 'San Francisco, CA',
        'salary': '$120,000 - $150,000',
        'description': 'We are looking for an experienced Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.',
        'requirements': [
            'At least 3 years of experience with React',
            'Strong TypeScript skills',
            'Experience with CSS frameworks like Tailwind',
            'Knowledge of state management solutions',
            'Good communication skills'
        ],
        'type': 'Full-time',
        'category': 'Development',
        'status': 'active'
    },
    {
        'title': 'Backend Engineer',
        'company': 'Data Systems Corp',
        'location': 'Remote',
        'salary': '$130,000 - $160,000',
        'description': 'Join our backend team to build scalable and efficient APIs and services. Work with modern technologies in a collaborative environment.',
        'requirements': [
            'Strong Node.js experience',
            'Knowledge of SQL and NoSQL databases',
            'Experience with RESTful API design',
            'Understanding of microservices architecture',
            'Good problem-solving skills'
        ],
        'type': 'Full-time',
        'category': 'Development',
        'status': 'active'
    },
    {
        'title': 'UI/UX Designer',
        'company': 'Creative Designs LLC',
        'location': 'New York, NY',
        'salary': '$100,000 - $120,000',
        'description': 'We are seeking a talented UI/UX Designer to create amazing user experiences. The ideal candidate should have a portfolio of design projects and experience with design tools.',
        'requirements': [
            'Experience with Figma and Adobe Creative Suite',
            'Understanding of user-centered design principles',
            'Knowledge of responsive design',
            'Ability to conduct user research',
            'Good communication skills'
        ],
        'type': 'Full-time',
        'category': 'Design',
        'status': 'active'
    },
    {
        'title': 'DevOps Engineer',
        'company': 'Cloud Services Inc.',
        'location': 'Seattle, WA',
        'salary': '$140,000 - $170,000',
        'description': 'Join our DevOps team to build and maintain our cloud infrastructure. Experience with AWS and CI/CD pipelines is required.',
        'requirements': [
            'Experience with AWS services',
            'Knowledge of Docker and Kubernetes',
            'Experience with CI/CD tools like Jenkins or GitHub Actions',
            'Understanding of infrastructure as code',
            'Good problem-solving skills'
        ],
        'type': 'Full-time',
        'category': 'DevOps',
        'status': 'active'
    },
    {
        'title': 'Product Manager',
        'company': 'Innovative Products Inc.',
        'location': 'Austin, TX',
        'salary': '$130,000 - $160,000',
        'description': 'We are looking for a Product Manager to lead our product development process. The ideal candidate should have experience with agile methodologies and a technical background.',
        'requirements': [
            'Experience with agile methodologies',
            'Technical background or understanding',
            'Good communication skills',
            'Ability to work with cross-functional teams',
            'Strategic thinking'
        ],
        'type': 'Full-time',
        'category': 'Management',
        'status': 'closed'
    },
    {
        'title': 'Data Scientist',
        'company': 'Analytics Corp',
        'location': 'Boston, MA',
        'salary': '$120,000 - $150,000',
        'description': 'Join our data science team to analyze and interpret complex data. Experience with machine learning and statistical analysis is required.',
        'requirements': [
            'Strong Python skills',
            'Experience with machine learning frameworks',
            'Knowledge of statistical analysis',
            'Understanding of data visualization',
            'Good problem-solving skills'
        ],
        'type': 'Contract',
        'category': 'Data Science',
        'status': 'draft'
    }
]

def init_db():
    with app.app_context():
        # Create all tables
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
            print("Admin user created")
            
            # Add mock jobs for admin
            admin_id = admin_user.id
            today = datetime.now().strftime('%Y-%m-%d')
            
            for job_data in mock_jobs:
                new_job = Job(
                    title=job_data['title'],
                    company=job_data['company'],
                    location=job_data['location'],
                    salary=job_data.get('salary', ''),
                    description=job_data['description'],
                    requirements=json.dumps(job_data['requirements']),
                    type=job_data['type'],
                    category=job_data['category'],
                    postedBy=admin_id,
                    postedDate=today,
                    status=job_data['status']
                )
                db.session.add(new_job)
            
            db.session.commit()
            print("Mock jobs added")
        else:
            print("Admin user already exists")

if __name__ == '__main__':
    init_db()
