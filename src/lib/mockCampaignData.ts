
import { Campaign, User, CampaignStats } from './types';

// Mock admin user
export const mockAdminUser: User = {
  id: 'admin',
  name: 'Administrator',
  email: 'admin@example.com',
  role: 'admin'
};

// Mock campaigns for admin
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'LinkedIn Sales Outreach',
    description: 'Contacting decision makers in the tech industry for our SaaS product.',
    target_audience: 'CTOs and VPs of Engineering at tech companies',
    platform: 'LinkedIn',
    budget: 5000,
    start_date: '2023-10-01',
    end_date: '2023-12-31',
    status: 'active',
    leads_count: 250,
    responses_count: 48,
    conversion_rate: 19.2,
    message_template: 'Hi {{name}}, I noticed your company is expanding its tech division. I'd love to show you how our product can help with scaling challenges.',
    owner_id: 'admin',
    owner_name: 'Administrator',
    created_date: '2023-09-15',
    tags: ['Tech', 'SaaS', 'B2B']
  },
  {
    id: '2',
    name: 'Email Marketing Campaign',
    description: 'Targeted email campaign to previous customers for our new product launch.',
    target_audience: 'Previous customers who purchased in the last 6 months',
    platform: 'Email',
    budget: 2500,
    start_date: '2023-11-01',
    end_date: '2023-11-30',
    status: 'active',
    leads_count: 1200,
    responses_count: 156,
    conversion_rate: 13.0,
    message_template: 'Dear {{name}}, As a valued customer, we wanted to give you early access to our newest product launch...',
    owner_id: 'admin',
    owner_name: 'Administrator',
    created_date: '2023-10-20',
    tags: ['Email', 'Existing Customers', 'Product Launch']
  },
  {
    id: '3',
    name: 'Twitter Ad Campaign',
    description: 'Targeted ads on Twitter for brand awareness in the finance sector.',
    target_audience: 'Finance professionals and enthusiasts',
    platform: 'Twitter',
    budget: 7500,
    start_date: '2023-08-15',
    end_date: '2023-10-15',
    status: 'completed',
    leads_count: 1850,
    responses_count: 215,
    conversion_rate: 11.6,
    owner_id: 'admin',
    owner_name: 'Administrator',
    created_date: '2023-08-01',
    tags: ['Social Media', 'Finance', 'Ads']
  },
  {
    id: '4',
    name: 'Trade Show Contacts',
    description: 'Follow-up campaign for contacts collected at the industry trade show.',
    target_audience: 'Trade show attendees who visited our booth',
    platform: 'Phone',
    budget: 3200,
    start_date: '2023-12-01',
    end_date: '2024-01-31',
    status: 'draft',
    leads_count: 0,
    responses_count: 0,
    conversion_rate: 0,
    message_template: 'Hi {{name}}, It was great meeting you at the trade show. I wanted to follow up on our conversation about...',
    owner_id: 'admin',
    owner_name: 'Administrator',
    created_date: '2023-11-25',
    tags: ['Trade Show', 'Follow-up', 'Direct']
  }
];

// Calculate campaign stats for the mock data
export const calculateCampaignStats = (campaigns: Campaign[]): CampaignStats => {
  const active = campaigns.filter(campaign => campaign.status === 'active').length;
  const completed = campaigns.filter(campaign => campaign.status === 'completed').length;
  const draft = campaigns.filter(campaign => campaign.status === 'draft').length;
  
  // Count by platform
  const byPlatform: Record<string, number> = {};
  campaigns.forEach(campaign => {
    byPlatform[campaign.platform] = (byPlatform[campaign.platform] || 0) + 1;
  });
  
  // Calculate total budget
  const totalBudget = campaigns
    .filter(campaign => campaign.status === 'active' || campaign.status === 'completed')
    .reduce((sum, campaign) => sum + campaign.budget, 0);
    
  // Calculate total leads and conversions
  const totalLeads = campaigns
    .reduce((sum, campaign) => sum + campaign.leads_count, 0);
    
  const totalConversions = campaigns
    .reduce((sum, campaign) => sum + campaign.responses_count, 0);
    
  // Calculate average conversion rate
  const campaignsWithLeads = campaigns.filter(campaign => campaign.leads_count > 0);
  const averageConversionRate = campaignsWithLeads.length > 0 
    ? campaignsWithLeads.reduce((sum, campaign) => sum + (campaign.conversion_rate || 0), 0) / campaignsWithLeads.length
    : 0;
  
  return {
    active,
    completed,
    draft,
    byPlatform,
    totalBudget,
    totalLeads,
    totalConversions,
    averageConversionRate
  };
};

// Generate mock campaign statistics for the dashboard
export const mockCampaignStats: CampaignStats = calculateCampaignStats(mockCampaigns);
