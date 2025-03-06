
import { Item } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, MapPin, Tag, DollarSign, Phone, Mail, Calendar } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ 
  item, 
  onClick, 
  className, 
  showActions = false,
  onEdit,
  onDelete
}: ItemCardProps) {
  const statusColorMap = {
    active: "bg-green-100 text-green-800 hover:bg-green-200",
    sold: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    draft: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md", 
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {item.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{item.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              {item.location}
            </CardDescription>
          </div>
          <Badge className={cn("ml-2", statusColorMap[item.status])}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{item.category}</span>
          </div>
          <div className="text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </div>
        </div>
        <p className="text-sm line-clamp-3">{item.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {item.posted_date}
          </div>
          <div>
            {item.owner_name}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between w-full mt-4">
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
