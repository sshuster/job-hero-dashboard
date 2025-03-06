
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  image_url?: string;
  contact_phone?: string;
  contact_email?: string;
  owner_id: string;
  owner_name?: string;
  posted_date: string;
  status: 'active' | 'sold' | 'draft';
}

export interface ItemStats {
  active: number;
  sold: number;
  draft: number;
  byCategory: Record<string, number>;
  totalValue: number;
  soldValue: number;
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  type: string;
  category: string;
  status: 'active' | 'closed' | 'draft';
  postedBy: string;
  postedDate?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  platform: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'draft';
  leads_count: number;
  responses_count: number;
  conversion_rate?: number;
  message_template?: string;
  owner_id: string;
  owner_name?: string;
  created_date: string;
  tags?: string[];
}

export interface CampaignStats {
  active: number;
  completed: number;
  draft: number;
  byPlatform: Record<string, number>;
  totalBudget: number;
  totalLeads: number;
  totalConversions: number;
  averageConversionRate: number;
}
