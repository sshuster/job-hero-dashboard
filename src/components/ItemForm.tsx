
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item } from "@/lib/types";
import { toast } from "sonner";

interface ItemFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  item?: Item;
  onSave: (itemData: Omit<Item, "id" | "posted_date" | "owner_id" | "owner_name">) => Promise<void>;
}

export function ItemForm({ open, setOpen, item, onSave }: ItemFormProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [location, setLocation] = useState(item?.location || "");
  const [category, setCategory] = useState(item?.category || "");
  const [imageUrl, setImageUrl] = useState(item?.image_url || "");
  const [contactPhone, setContactPhone] = useState(item?.contact_phone || "");
  const [contactEmail, setContactEmail] = useState(item?.contact_email || "");
  const [status, setStatus] = useState<"active" | "sold" | "draft">(item?.status || "active");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !location || !category) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const numericPrice = parseFloat(price);
      
      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast.error("Please enter a valid price");
        setIsLoading(false);
        return;
      }
      
      await onSave({
        title,
        description,
        price: numericPrice,
        location,
        category,
        image_url: imageUrl,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        status: status,
      });
      
      setOpen(false);
      toast.success(`Item ${item ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error(`Failed to ${item ? "update" : "create"} item:`, error);
      toast.error(`Failed to ${item ? "update" : "create"} item`);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    "Electronics",
    "Furniture",
    "Vehicles",
    "Clothing",
    "Real Estate",
    "Services",
    "Collectibles",
    "Other"
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "sold", label: "Sold" },
    { value: "draft", label: "Draft" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Create New Item"}</DialogTitle>
          <DialogDescription>
            {item 
              ? "Make changes to your item listing below" 
              : "Fill out the form below to create a new listing"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title" className="font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description" className="font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed description"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="font-medium">
                  Price ($) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location" className="font-medium">
                  Location *
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="font-medium">
                  Category *
                </Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status" className="font-medium">
                  Status *
                </Label>
                <Select 
                  value={status} 
                  onValueChange={(value: "active" | "sold" | "draft") => setStatus(value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="imageUrl" className="font-medium">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPhone" className="font-medium">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="555-123-4567"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contactEmail" className="font-medium">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : item ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
