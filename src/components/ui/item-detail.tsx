
import { Item } from "@/lib/types";
import { MapPin, Tag, User, Phone, Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ItemDetailProps {
  item: Item;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ItemDetail({ 
  item, 
  onClose, 
  onEdit, 
  onDelete, 
  showActions = false 
}: ItemDetailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const statusColorMap = {
    active: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    draft: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {item.image_url && (
          <div className="md:w-1/3">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        <div className={item.image_url ? "md:w-2/3" : "w-full"}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(item.price)}
              </span>
              <Badge className={`mt-1 ${statusColorMap[item.status]}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center">
              <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{item.category}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>Posted: {item.posted_date}</span>
            </div>
            {item.owner_name && (
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>Seller: {item.owner_name}</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {item.description}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.contact_phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.contact_phone}</span>
                </div>
              )}
              {item.contact_email && (
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.contact_email}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            {onClose && (
              <Button onClick={onClose}>
                Close Details
              </Button>
            )}
            
            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
