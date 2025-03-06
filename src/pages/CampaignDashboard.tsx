
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { ChartCard, StatsPieChart, StatsBarChart } from "@/components/ui/chart-card";
import { CampaignForm } from "@/components/CampaignForm";
import { CampaignCard } from "@/components/ui/campaign-card";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { fetchUserCampaigns, fetchCampaignStats, createCampaign, updateCampaign, deleteCampaign } from "@/lib/api";
import { Campaign, CampaignStats } from "@/lib/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  PlusCircle, BarChart3, CheckCircle, XCircle, FileEdit, 
  Users, Trash2, Target, Calendar, Tag, 
  DollarSign, Mail, MessageSquare, Megaphone
} from "lucide-react";

export default function CampaignDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  
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
        const [campaignsData, statsData] = await Promise.all([
          fetchUserCampaigns(user.id),
          fetchCampaignStats(user.id)
        ]);
        
        setCampaigns(campaignsData);
        setCampaignStats(statsData);
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

  const handleCreateCampaign = async (campaignData: Omit<Campaign, "id" | "created_date" | "owner_id" | "owner_name">) => {
    if (!user) return;
    
    try {
      const newCampaign = await createCampaign({
        ...campaignData,
        owner_id: user.id,
      });
      
      setCampaigns([newCampaign, ...campaigns]);
      
      // Update stats
      if (campaignStats) {
        const updatedStats = { ...campaignStats };
        updatedStats[campaignData.status as 'active' | 'completed' | 'draft'] += 1;
        updatedStats.byPlatform[campaignData.platform] = (updatedStats.byPlatform[campaignData.platform] || 0) + 1;
        
        if (campaignData.status === 'active' || campaignData.status === 'completed') {
          updatedStats.totalBudget += campaignData.budget;
        }
        
        updatedStats.totalLeads += campaignData.leads_count;
        updatedStats.totalConversions += campaignData.responses_count;
        
        setCampaignStats(updatedStats);
      }
      
      toast.success("Campaign created successfully");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  const handleUpdateCampaign = async (campaignData: Omit<Campaign, "id" | "created_date" | "owner_id" | "owner_name">) => {
    if (!editingCampaign) return;
    
    try {
      const updatedCampaign = await updateCampaign(editingCampaign.id, campaignData);
      
      setCampaigns(campaigns.map(campaign => campaign.id === updatedCampaign.id ? updatedCampaign : campaign));
      setEditingCampaign(null);
      setSelectedCampaign(updatedCampaign);
      
      // Update stats if status changed
      if (campaignStats && editingCampaign.status !== campaignData.status) {
        const updatedStats = { ...campaignStats };
        updatedStats[editingCampaign.status as 'active' | 'completed' | 'draft'] -= 1;
        updatedStats[campaignData.status as 'active' | 'completed' | 'draft'] += 1;
        
        setCampaignStats(updatedStats);
      }
      
      toast.success("Campaign updated successfully");
    } catch (error) {
      console.error("Failed to update campaign:", error);
      toast.error("Failed to update campaign");
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    
    try {
      await deleteCampaign(campaignToDelete.id);
      
      setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete.id));
      setCampaignToDelete(null);
      setDeleteDialogOpen(false);
      
      if (selectedCampaign && selectedCampaign.id === campaignToDelete.id) {
        setSelectedCampaign(null);
      }
      
      // Update stats
      if (campaignStats) {
        const updatedStats = { ...campaignStats };
        updatedStats[campaignToDelete.status as 'active' | 'completed' | 'draft'] -= 1;
        updatedStats.byPlatform[campaignToDelete.platform] = Math.max(0, (updatedStats.byPlatform[campaignToDelete.platform] || 0) - 1);
        
        if (campaignToDelete.status === 'active' || campaignToDelete.status === 'completed') {
          updatedStats.totalBudget -= campaignToDelete.budget;
        }
        
        updatedStats.totalLeads -= campaignToDelete.leads_count;
        updatedStats.totalConversions -= campaignToDelete.responses_count;
        
        setCampaignStats(updatedStats);
      }
      
      toast.success("Campaign deleted successfully");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  const confirmDelete = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const columnDefs = [
    {
      headerName: "Name",
      field: "name",
      flex: 3,
    },
    {
      headerName: "Platform",
      field: "platform",
      flex: 1.5,
    },
    {
      headerName: "Budget",
      field: "budget",
      flex: 1.5,
      cellRenderer: (params: any) => {
        return formatCurrency(params.value);
      },
    },
    {
      headerName: "Leads",
      field: "leads_count",
      flex: 1,
    },
    {
      headerName: "Responses",
      field: "responses_count",
      flex: 1,
    },
    {
      headerName: "Conv. Rate",
      field: "conversion_rate",
      flex: 1,
      cellRenderer: (params: any) => {
        return params.value ? formatPercentage(params.value) : '-';
      },
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1.5,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          completed: "bg-blue-100 text-blue-800",
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
      headerName: "Actions",
      flex: 2,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCampaign(params.data)}
            className="h-8"
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingCampaign(params.data);
              setIsFormOpen(true);
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

  const getPlatformChartData = () => {
    if (!campaignStats) return [];
    return Object.entries(campaignStats.byPlatform).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getStatusChartData = () => {
    if (!campaignStats) return [];
    return [
      { name: "Active", value: campaignStats.active },
      { name: "Completed", value: campaignStats.completed },
      { name: "Draft", value: campaignStats.draft },
    ];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground">Manage your lead generation and outreach campaigns</p>
            </div>
            <Button 
              onClick={() => {
                setEditingCampaign(null);
                setIsFormOpen(true);
              }}
              className="mt-4 md:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Campaigns</p>
                    <h3 className="text-2xl font-bold">{campaigns.length}</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Megaphone className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:100ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Campaigns</p>
                    <h3 className="text-2xl font-bold">{campaignStats?.active || 0}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                    <h3 className="text-2xl font-bold">{campaignStats?.completed || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:300ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Draft</p>
                    <h3 className="text-2xl font-bold">{campaignStats?.draft || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <FileEdit className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="animate-scale-in [animation-delay:400ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(campaignStats?.totalBudget || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:500ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Leads</p>
                    <h3 className="text-2xl font-bold">{campaignStats?.totalLeads || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:600ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Responses</p>
                    <h3 className="text-2xl font-bold">{campaignStats?.totalConversions || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:700ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Conversion</p>
                    <h3 className="text-2xl font-bold">{formatPercentage(campaignStats?.averageConversionRate || 0)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Campaigns by Status" description="Distribution of campaigns by current status" className="animate-blur-in">
              <StatsPieChart data={getStatusChartData()} />
            </ChartCard>
            
            <ChartCard title="Campaigns by Platform" description="Distribution of campaigns by platform" className="animate-blur-in [animation-delay:100ms]">
              <StatsPieChart data={getPlatformChartData()} />
            </ChartCard>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-6">Your Campaigns</h2>
            
            <div className="space-y-6">
              <DataGrid 
                rowData={campaigns}
                columnDefs={columnDefs}
                onRowClick={setSelectedCampaign}
                loading={isLoading}
                className="animate-blur-in"
                height="50vh"
              />
              
              {selectedCampaign && (
                <div className="mt-8 pt-8 border-t animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Selected Campaign Details</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingCampaign(selectedCampaign);
                          setIsFormOpen(true);
                        }}
                      >
                        <FileEdit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(selectedCampaign)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col space-y-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{selectedCampaign.name}</h2>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase
                            ${selectedCampaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                              selectedCampaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {selectedCampaign.status}
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(selectedCampaign.budget)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground whitespace-pre-line">
                        {selectedCampaign.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h4>
                            <p>{selectedCampaign.target_audience}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Platform</h4>
                            <div className="flex items-center">
                              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                                {selectedCampaign.platform}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Campaign Period</h4>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(selectedCampaign.start_date).toLocaleDateString()} - {new Date(selectedCampaign.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Performance</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold">{selectedCampaign.leads_count}</div>
                                <div className="text-xs text-muted-foreground">Leads</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold">{selectedCampaign.responses_count}</div>
                                <div className="text-xs text-muted-foreground">Responses</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold">
                                  {selectedCampaign.conversion_rate ? formatPercentage(selectedCampaign.conversion_rate) : '-'}
                                </div>
                                <div className="text-xs text-muted-foreground">Conversion</div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedCampaign.tags && selectedCampaign.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCampaign.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedCampaign.message_template && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Message Template</h4>
                          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line text-sm">
                            {selectedCampaign.message_template}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {campaigns.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any lead generation campaigns yet
                  </p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Campaign
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <CampaignForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        campaign={editingCampaign || undefined}
        onSave={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign "{campaignToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCampaign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
