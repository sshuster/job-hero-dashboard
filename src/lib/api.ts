import { User, Item, ItemStats, Campaign, CampaignStats } from './types';
import { mockItems, mockItemStats } from './mockData';
import { mockCampaigns, mockCampaignStats } from './mockCampaignData';

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
    // Check for mock admin user
    if (email === 'admin@example.com' && password === 'admin') {
      const mockAdminUser: User = {
        id: 'admin',
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockAdminUser));
      return Promise.resolve(mockAdminUser);
    }

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
    // Clear mock user if it exists
    if (localStorage.getItem('mockUser')) {
      localStorage.removeItem('mockUser');
      return;
    }
    
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
    // First try to get user from localStorage (for mock admin)
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    const data = await fetchApi('/auth/me');
    return data.user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

// Campaign APIs
export const fetchAllCampaigns = async (): Promise<Campaign[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve([...mockCampaigns]);
  }

  try {
    const data = await fetchApi('/campaigns');
    return data.campaigns;
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    throw error;
  }
};

export const fetchUserCampaigns = async (userId: string): Promise<Campaign[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve(mockCampaigns.filter(campaign => campaign.owner_id === userId));
  }

  try {
    const data = await fetchApi(`/campaigns/user/${userId}`);
    return data.campaigns;
  } catch (error) {
    console.error('Failed to fetch user campaigns:', error);
    throw error;
  }
};

export const fetchCampaignStats = async (userId: string): Promise<CampaignStats> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve({...mockCampaignStats});
  }

  try {
    const data = await fetchApi(`/campaigns/stats/${userId}`);
    return data.stats;
  } catch (error) {
    console.error('Failed to fetch campaign stats:', error);
    throw error;
  }
};

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'created_date' | 'owner_name'>): Promise<Campaign> => {
  // Handle mock data
  if (isMockUser()) {
    const newCampaign: Campaign = {
      ...campaign,
      id: `mock-${Date.now()}`,
      created_date: new Date().toISOString().split('T')[0],
      owner_name: 'Administrator'
    };
    mockCampaigns.push(newCampaign);
    return Promise.resolve(newCampaign);
  }

  try {
    const data = await fetchApi('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
    return data.campaign;
  } catch (error) {
    console.error('Failed to create campaign:', error);
    throw error;
  }
};

export const updateCampaign = async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index >= 0) {
      mockCampaigns[index] = { ...mockCampaigns[index], ...campaign };
      return Promise.resolve(mockCampaigns[index]);
    }
    throw new Error('Campaign not found');
  }

  try {
    const data = await fetchApi(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });
    return data.campaign;
  } catch (error) {
    console.error('Failed to update campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<void> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index >= 0) {
      mockCampaigns.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Campaign not found');
  }

  try {
    await fetchApi(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    throw error;
  }
};

// Item APIs
export const fetchAllItems = async (): Promise<Item[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve([...mockItems]);
  }

  try {
    const data = await fetchApi('/items');
    return data.items;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
};

export const fetchUserItems = async (userId: string): Promise<Item[]> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve(mockItems.filter(item => item.owner_id === userId));
  }

  try {
    const data = await fetchApi(`/items/user/${userId}`);
    return data.items;
  } catch (error) {
    console.error('Failed to fetch user items:', error);
    throw error;
  }
};

export const fetchItemStats = async (userId: string): Promise<ItemStats> => {
  // Return mock data if using mock user
  if (isMockUser()) {
    return Promise.resolve({...mockItemStats});
  }

  try {
    const data = await fetchApi(`/items/stats/${userId}`);
    return data.stats;
  } catch (error) {
    console.error('Failed to fetch item stats:', error);
    throw error;
  }
};

export const createItem = async (item: Omit<Item, 'id' | 'posted_date' | 'owner_name'>): Promise<Item> => {
  // Handle mock data
  if (isMockUser()) {
    const newItem: Item = {
      ...item,
      id: `mock-${Date.now()}`,
      posted_date: new Date().toISOString().split('T')[0],
      owner_name: 'Administrator'
    };
    mockItems.push(newItem);
    return Promise.resolve(newItem);
  }

  try {
    const data = await fetchApi('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return data.item;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, item: Partial<Item>): Promise<Item> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockItems.findIndex(j => j.id === id);
    if (index >= 0) {
      mockItems[index] = { ...mockItems[index], ...item };
      return Promise.resolve(mockItems[index]);
    }
    throw new Error('Item not found');
  }

  try {
    const data = await fetchApi(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return data.item;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  // Handle mock data
  if (isMockUser()) {
    const index = mockItems.findIndex(j => j.id === id);
    if (index >= 0) {
      mockItems.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Item not found');
  }

  try {
    await fetchApi(`/items/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};
