
import { User, Job, JobStats } from './types';
import { mockJobs, mockJobStats } from './mockData';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to check if we're using mock data
const isMockUser = () => {
  return !!localStorage.getItem('mockUser');
};

// General fetch wrapper with error handling
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // For cookies if using session auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication APIs
export const loginApi = async (email: string, password: string): Promise<User | null> => {
  try {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerApi = async (name: string, email: string, password: string): Promise<User | null> => {
  try {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    await fetchApi('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await fetchApi('/auth/me');
    return data.user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

// Job APIs
export const fetchAllJobs = async (): Promise<Job[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve([...mockJobs]);
  }

  try {
    const data = await fetchApi('/jobs');
    return data.jobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
};

export const fetchUserJobs = async (userId: string): Promise<Job[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve(mockJobs.filter(job => job.postedBy === userId));
  }

  try {
    const data = await fetchApi(`/jobs/user/${userId}`);
    return data.jobs;
  } catch (error) {
    console.error('Failed to fetch user jobs:', error);
    throw error;
  }
};

export const fetchJobStats = async (userId: string): Promise<JobStats> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve({...mockJobStats});
  }

  try {
    const data = await fetchApi(`/jobs/stats/${userId}`);
    return data.stats;
  } catch (error) {
    console.error('Failed to fetch job stats:', error);
    throw error;
  }
};

export const createJob = async (job: Omit<Job, 'id' | 'postedDate'>): Promise<Job> => {
  // Handle mock data
  if (isMockUser()) {
    const newJob: Job = {
      ...job,
      id: `mock-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0]
    };
    mockJobs.push(newJob);
    return Promise.resolve(newJob);
  }

  try {
    const data = await fetchApi('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
    return data.job;
  } catch (error) {
    console.error('Failed to create job:', error);
    throw error;
  }
};

export const updateJob = async (id: string, job: Partial<Job>): Promise<Job> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockJobs.findIndex(j => j.id === id);
    if (index >= 0) {
      mockJobs[index] = { ...mockJobs[index], ...job };
      return Promise.resolve(mockJobs[index]);
    }
    throw new Error('Job not found');
  }

  try {
    const data = await fetchApi(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
    return data.job;
  } catch (error) {
    console.error('Failed to update job:', error);
    throw error;
  }
};

export const deleteJob = async (id: string): Promise<void> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockJobs.findIndex(j => j.id === id);
    if (index >= 0) {
      mockJobs.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Job not found');
  }

  try {
    await fetchApi(`/jobs/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete job:', error);
    throw error;
  }
};
