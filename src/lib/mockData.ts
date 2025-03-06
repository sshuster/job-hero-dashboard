
import { Item, User, ItemStats } from './types';

// Mock admin user
export const mockAdminUser: User = {
  id: 'admin',
  name: 'Administrator',
  email: 'admin@example.com',
  role: 'admin'
};

// Mock items for admin
export const mockItems: Item[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Like New',
    description: 'Selling my iPhone 13 Pro, only used for 3 months. Comes with original box and accessories.',
    price: 899.99,
    location: 'New York, NY',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1000',
    contact_phone: '555-123-4567',
    contact_email: 'admin@example.com',
    owner_id: 'admin',
    owner_name: 'Administrator',
    posted_date: '2023-10-15',
    status: 'active'
  },
  {
    id: '2',
    title: 'Leather Sofa - Excellent Condition',
    description: 'Beautiful brown leather sofa, 3 years old but in excellent condition. No scratches or tears.',
    price: 650.00,
    location: 'Los Angeles, CA',
    category: 'Furniture',
    image_url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25',
    contact_phone: '555-123-4567',
    contact_email: 'admin@example.com',
    owner_id: 'admin',
    owner_name: 'Administrator',
    posted_date: '2023-10-12',
    status: 'active'
  },
  {
    id: '3',
    title: '2018 Honda Civic - Low Mileage',
    description: '2018 Honda Civic with only 25,000 miles. One owner, regular maintenance, all service records available.',
    price: 18500.00,
    location: 'Chicago, IL',
    category: 'Vehicles',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    contact_phone: '555-123-4567',
    contact_email: 'admin@example.com',
    owner_id: 'admin',
    owner_name: 'Administrator',
    posted_date: '2023-10-10',
    status: 'sold'
  },
  {
    id: '4',
    title: 'Vintage Record Collection',
    description: 'Collection of 200+ vinyl records from the 60s and 70s, including rare first pressings.',
    price: 1200.00,
    location: 'San Francisco, CA',
    category: 'Collectibles',
    image_url: 'https://images.unsplash.com/photo-1619063408105-652246c75563',
    contact_phone: '555-123-4567',
    contact_email: 'admin@example.com',
    owner_id: 'admin',
    owner_name: 'Administrator',
    posted_date: '2023-10-08',
    status: 'draft'
  }
];

// Calculate item stats for the mock data
export const calculateItemStats = (items: Item[]): ItemStats => {
  const active = items.filter(item => item.status === 'active').length;
  const sold = items.filter(item => item.status === 'sold').length;
  const draft = items.filter(item => item.status === 'draft').length;
  
  // Count by category
  const byCategory: Record<string, number> = {};
  items.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });
  
  // Calculate total value
  const totalValue = items
    .filter(item => item.status === 'active')
    .reduce((sum, item) => sum + item.price, 0);
    
  const soldValue = items
    .filter(item => item.status === 'sold')
    .reduce((sum, item) => sum + item.price, 0);
  
  return {
    active,
    sold,
    draft,
    byCategory,
    totalValue,
    soldValue
  };
};

// Generate mock item statistics for the dashboard
export const mockItemStats: ItemStats = calculateItemStats(mockItems);
