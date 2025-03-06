
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
