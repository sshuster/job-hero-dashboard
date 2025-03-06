
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  type: string; // Full-time, Part-time, Contract, etc.
  category: string;
  postedBy: string; // User ID
  postedDate: string;
  status: 'active' | 'closed' | 'draft';
}

export interface JobStats {
  active: number;
  closed: number;
  draft: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}
