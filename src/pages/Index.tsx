
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataGrid } from "@/components/ui/data-grid";
import { ItemCard } from "@/components/ui/item-card";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { fetchAllItems } from "@/lib/api";
import { Item } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, ArrowRight, DollarSign } from "lucide-react";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchAllItems();
        setItems(data.filter(item => item.status === 'active'));
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.owner_name && item.owner_name.toLowerCase().includes(searchLower))
    );
  });

  const columnDefs = [
    {
      headerName: "Title",
      field: "title",
      flex: 2,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center py-1">
            <div className="font-medium">{params.value}</div>
          </div>
        );
      },
    },
    {
      headerName: "Price",
      field: "price",
      flex: 1,
      cellRenderer: (params: any) => {
        return (
          <div className="font-semibold text-primary">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(params.value)}
          </div>
        );
      },
    },
    {
      headerName: "Location",
      field: "location",
      flex: 1.5,
    },
    {
      headerName: "Category",
      field: "category",
      flex: 1,
      cellRenderer: (params: any) => {
        return <Badge variant="outline">{params.value}</Badge>;
      },
    },
    {
      headerName: "Seller",
      field: "owner_name",
      flex: 1,
    },
    {
      headerName: "Posted Date",
      field: "posted_date",
      flex: 1,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in">
            Find Amazing <span className="text-primary">Deals</span> Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in opacity-90">
            Browse through quality items for sale from trusted sellers in your area
          </p>
          
          <div className="relative max-w-3xl mx-auto mb-8 flex shadow-sm animate-slide-up">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search items by title, description, location..."
                className="pl-10 pr-4 py-3 h-14 rounded-l-lg w-full border focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="h-14 px-6 rounded-l-none rounded-r-lg">
              Search
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
            {["Electronics", "Furniture", "Vehicles", "Clothing", "Real Estate", "Collectibles"].map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setSearchTerm(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>
      
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Featured Listings
          </h2>
          {isAuthenticated && (
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg bg-muted h-[320px]"></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
                className="animate-scale-in"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later
            </p>
          </div>
        )}
        
        {selectedItem && (
          <div className="mt-10 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Item Details</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {selectedItem.image_url && (
                  <div className="md:w-1/3">
                    <img 
                      src={selectedItem.image_url} 
                      alt={selectedItem.title} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <div className={selectedItem.image_url ? "md:w-2/3" : "w-full"}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(selectedItem.price)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.category}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>Seller: {selectedItem.owner_name}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedItem.description}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedItem.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{selectedItem.contact_phone}</span>
                        </div>
                      )}
                      {selectedItem.contact_email && (
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{selectedItem.contact_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button onClick={() => setSelectedItem(null)}>
                      Close Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">All Available Items</h2>
          <DataGrid 
            rowData={filteredItems}
            columnDefs={columnDefs}
            onRowClick={setSelectedItem}
            height="auto"
            loading={loading}
            className="animate-blur-in"
          />
        </div>
      </main>
      
      <footer className="bg-muted py-12 mt-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-xl mb-2">SellByOwner</h3>
              <p className="text-muted-foreground">Find great deals directly from owners</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link to="/" className="hover:text-primary">Home</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="hover:text-primary">Sign In</Link>
                  <Link to="/register" className="hover:text-primary">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SellByOwner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
