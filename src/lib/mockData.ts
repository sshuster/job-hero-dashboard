
import { Job, User, JobStats } from './types';

// Mock admin user
export const mockAdminUser: User = {
  id: 'admin',
  name: 'Administrator',
  email: 'admin@example.com',
  role: 'admin'
};

// Mock job postings for admin
export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    description: 'We are looking for an experienced Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.',
    requirements: [
      'At least 3 years of experience with React',
      'Strong TypeScript skills',
      'Experience with CSS frameworks like Tailwind',
      'Knowledge of state management solutions',
      'Good communication skills'
    ],
    type: 'Full-time',
    category: 'Development',
    postedBy: 'admin',
    postedDate: '2023-10-15',
    status: 'active'
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'Data Systems Corp',
    location: 'Remote',
    salary: '$130,000 - $160,000',
    description: 'Join our backend team to build scalable and efficient APIs and services. Work with modern technologies in a collaborative environment.',
    requirements: [
      'Strong Node.js experience',
      'Knowledge of SQL and NoSQL databases',
      'Experience with RESTful API design',
      'Understanding of microservices architecture',
      'Good problem-solving skills'
    ],
    type: 'Full-time',
    category: 'Development',
    postedBy: 'admin',
    postedDate: '2023-10-12',
    status: 'active'
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Designs LLC',
    location: 'New York, NY',
    salary: '$100,000 - $120,000',
    description: 'We are seeking a talented UI/UX Designer to create amazing user experiences. The ideal candidate should have a portfolio of design projects and experience with design tools.',
    requirements: [
      'Experience with Figma and Adobe Creative Suite',
      'Understanding of user-centered design principles',
      'Knowledge of responsive design',
      'Ability to conduct user research',
      'Good communication skills'
    ],
    type: 'Full-time',
    category: 'Design',
    postedBy: 'admin',
    postedDate: '2023-10-10',
    status: 'active'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Cloud Services Inc.',
    location: 'Seattle, WA',
    salary: '$140,000 - $170,000',
    description: 'Join our DevOps team to build and maintain our cloud infrastructure. Experience with AWS and CI/CD pipelines is required.',
    requirements: [
      'Experience with AWS services',
      'Knowledge of Docker and Kubernetes',
      'Experience with CI/CD tools like Jenkins or GitHub Actions',
      'Understanding of infrastructure as code',
      'Good problem-solving skills'
    ],
    type: 'Full-time',
    category: 'DevOps',
    postedBy: 'admin',
    postedDate: '2023-10-08',
    status: 'active'
  },
  {
    id: '5',
    title: 'Product Manager',
    company: 'Innovative Products Inc.',
    location: 'Austin, TX',
    salary: '$130,000 - $160,000',
    description: 'We are looking for a Product Manager to lead our product development process. The ideal candidate should have experience with agile methodologies and a technical background.',
    requirements: [
      'Experience with agile methodologies',
      'Technical background or understanding',
      'Good communication skills',
      'Ability to work with cross-functional teams',
      'Strategic thinking'
    ],
    type: 'Full-time',
    category: 'Management',
    postedBy: 'admin',
    postedDate: '2023-10-05',
    status: 'closed'
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'Analytics Corp',
    location: 'Boston, MA',
    salary: '$120,000 - $150,000',
    description: 'Join our data science team to analyze and interpret complex data. Experience with machine learning and statistical analysis is required.',
    requirements: [
      'Strong Python skills',
      'Experience with machine learning frameworks',
      'Knowledge of statistical analysis',
      'Understanding of data visualization',
      'Good problem-solving skills'
    ],
    type: 'Contract',
    category: 'Data Science',
    postedBy: 'admin',
    postedDate: '2023-10-03',
    status: 'draft'
  }
];

// Calculate job stats for the mock data
export const calculateJobStats = (jobs: Job[]): JobStats => {
  const active = jobs.filter(job => job.status === 'active').length;
  const closed = jobs.filter(job => job.status === 'closed').length;
  const draft = jobs.filter(job => job.status === 'draft').length;
  
  // Count by category
  const byCategory: Record<string, number> = {};
  jobs.forEach(job => {
    byCategory[job.category] = (byCategory[job.category] || 0) + 1;
  });
  
  // Count by type
  const byType: Record<string, number> = {};
  jobs.forEach(job => {
    byType[job.type] = (byType[job.type] || 0) + 1;
  });
  
  return {
    active,
    closed,
    draft,
    byCategory,
    byType
  };
};

// Generate mock job statistics for the dashboard
export const mockJobStats: JobStats = calculateJobStats(mockJobs);
