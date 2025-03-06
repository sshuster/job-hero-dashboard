
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { ItemCard } from "@/components/ui/item-card";
import { ChartCard, StatsPieChart, StatsBarChart } from "@/components/ui/chart-card";
import { ItemForm } from "@/components/ItemForm";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { fetchUserItems, fetchItemStats, createItem, updateItem, deleteItem } from "@/lib/api";
import { Item, ItemStats } from "@/lib/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, PackageOpen, CheckCircle, XCircle, FileEdit, Clock, Trash2, User, ShoppingBag, Tag, MapPin, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [itemStats, setItemStats] = useState<ItemStats | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [itemsData, statsData] = await Promise.all([
          fetchUserItems(user.id),
          fetchItemStats(user.id)
        ]);
        
        setItems(itemsData);
        setItemStats(statsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleCreateItem = async (itemData: Omit<Item, "id" | "posted_date" | "owner_id" | "owner_name">) => {
    if (!user) return;
    
    try {
      const newItem = await createItem({
        ...itemData,
        owner_id: user.id,
      });
      
      setItems([newItem, ...items]);
      
      // Update stats
      if (itemStats) {
        const updatedStats = { ...itemStats };
        updatedStats[itemData.status as 'active' | 'sold' | 'draft'] += 1;
        updatedStats.byCategory[itemData.category] = (updatedStats.byCategory[itemData.category] || 0) + 1;
        
        if (itemData.status === 'active') {
          updatedStats.totalValue += itemData.price;
        } else if (itemData.status === 'sold') {
          updatedStats.soldValue += itemData.price;
        }
        
        setItemStats(updatedStats);
      }
      
      toast.success("Item created successfully");
    } catch (error) {
      console.error("Failed to create item:", error);
      toast.error("Failed to create item");
    }
  };

  const handleUpdateItem = async (itemData: Omit<Item, "id" | "posted_date" | "owner_id" | "owner_name">) => {
    if (!editingItem) return;
    
    try {
      const updatedItem = await updateItem(editingItem.id, itemData);
      
      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditingItem(null);
      setSelectedItem(updatedItem);
      
      // Update stats if status changed
      if (itemStats && editingItem.status !== itemData.status) {
        const updatedStats = { ...itemStats };
        updatedStats[editingItem.status] -= 1;
        updatedStats[itemData.status] += 1;
        
        // Update values based on status change
        if (editingItem.status === 'active' && itemData.status !== 'active') {
          updatedStats.totalValue -= editingItem.price;
          if (itemData.status === 'sold') {
            updatedStats.soldValue += itemData.price;
          }
        } else if (editingItem.status === 'sold' && itemData.status !== 'sold') {
          updatedStats.soldValue -= editingItem.price;
          if (itemData.status === 'active') {
            updatedStats.totalValue += itemData.price;
          }
        } else if (editingItem.status === 'draft') {
          if (itemData.status === 'active') {
            updatedStats.totalValue += itemData.price;
          } else if (itemData.status === 'sold') {
            updatedStats.soldValue += itemData.price;
          }
        }
        
        setItemStats(updatedStats);
      }
      
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem(itemToDelete.id);
      
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
      setDeleteDialogOpen(false);
      
      if (selectedItem && selectedItem.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      
      // Update stats
      if (itemStats) {
        const updatedStats = { ...itemStats };
        updatedStats[itemToDelete.status] -= 1;
        updatedStats.byCategory[itemToDelete.category] -= 1;
        
        if (itemToDelete.status === 'active') {
          updatedStats.totalValue -= itemToDelete.price;
        } else if (itemToDelete.status === 'sold') {
          updatedStats.soldValue -= itemToDelete.price;
        }
        
        setItemStats(updatedStats);
      }
      
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const confirmDelete = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const columnDefs = [
    {
      headerName: "Title",
      field: "title",
      flex: 3,
    },
    {
      headerName: "Price",
      field: "price",
      flex: 1,
      cellRenderer: (params: any) => {
        return formatCurrency(params.value);
      },
    },
    {
      headerName: "Category",
      field: "category",
      flex: 1.5,
    },
    {
      headerName: "Location",
      field: "location",
      flex: 2,
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          sold: "bg-blue-100 text-blue-800",
          draft: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${colorMap[params.value]}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Posted Date",
      field: "posted_date",
      flex: 1.5,
    },
    {
      headerName: "Actions",
      flex: 2,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedItem(params.data)}
            className="h-8"
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(params.data);
              setIsItemFormOpen(true);
            }}
            className="h-8 w-8"
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(params.data);
            }}
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  // Prepare chart data
  const getCategoryChartData = () => {
    if (!itemStats) return [];
    return Object.entries(itemStats.byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getStatusChartData = () => {
    if (!itemStats) return [];
    return [
      { name: "Active", value: itemStats.active },
      { name: "Sold", value: itemStats.sold },
      { name: "Draft", value: itemStats.draft },
    ];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground">Manage your items for sale and track your listings</p>
            </div>
            <Button 
              onClick={() => {
                setEditingItem(null);
                setIsItemFormOpen(true);
              }}
              className="mt-4 md:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Items</p>
                    <h3 className="text-2xl font-bold">{items.length}</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:100ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Listings</p>
                    <h3 className="text-2xl font-bold">{itemStats?.active || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:200ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Sold Items</p>
                    <h3 className="text-2xl font-bold">{itemStats?.sold || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:300ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Draft Items</p>
                    <h3 className="text-2xl font-bold">{itemStats?.draft || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Value Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="animate-scale-in [animation-delay:400ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Value (Active Listings)</p>
                    <h3 className="text-2xl font-bold">{formatPrice(itemStats?.totalValue || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Tag className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:500ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Sold Value</p>
                    <h3 className="text-2xl font-bold">{formatPrice(itemStats?.soldValue || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Items by Status" description="Distribution of listings by status" className="animate-blur-in">
              <StatsPieChart data={getStatusChartData()} />
            </ChartCard>
            
            <ChartCard title="Items by Category" description="Distribution of listings by category" className="animate-blur-in [animation-delay:100ms]">
              <StatsPieChart data={getCategoryChartData()} />
            </ChartCard>
          </div>
          
          {/* Item Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Your Listed Items</h2>
            
            <div className="space-y-6">
              <DataGrid 
                rowData={items}
                columnDefs={columnDefs}
                onRowClick={setSelectedItem}
                loading={isLoading}
                className="animate-blur-in"
              />
              
              {selectedItem && (
                <div className="mt-8 pt-8 border-t animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Selected Item Details</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingItem(selectedItem);
                          setIsItemFormOpen(true);
                        }}
                      >
                        <FileEdit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(selectedItem)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  
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
                              {formatCurrency(selectedItem.price)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase mt-1
                              ${selectedItem.status === 'active' ? 'bg-green-100 text-green-800' : 
                                selectedItem.status === 'sold' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {selectedItem.status}
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {items.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any listings yet
                  </p>
                  <Button onClick={() => setIsItemFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Listing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Item Form Dialog */}
      <ItemForm
        open={isItemFormOpen}
        setOpen={setIsItemFormOpen}
        item={editingItem || undefined}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item "{itemToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
