
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/lib/types";
import { Calendar, Target, Briefcase, PieChart, Users, DollarSign, Tag } from "lucide-react";
import { format } from "date-fns";

interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{campaign.name}</CardTitle>
            <CardDescription className="text-sm">
              {campaign.platform} · Created {format(new Date(campaign.created_date), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <Badge className={`ml-2 capitalize ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {campaign.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>
              {format(new Date(campaign.start_date), 'MMM d')} - {format(new Date(campaign.end_date), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{formatCurrency(campaign.budget)}</span>
          </div>
          <div className="flex items-center">
            <Target className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="line-clamp-1">{campaign.target_audience}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{campaign.leads_count} leads</span>
          </div>
        </div>
        
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {campaign.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {campaign.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{campaign.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
