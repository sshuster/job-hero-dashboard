
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { JobCard } from "@/components/ui/job-card";
import { ChartCard, StatsPieChart, StatsBarChart } from "@/components/ui/chart-card";
import { JobForm } from "@/components/JobForm";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { fetchUserJobs, fetchJobStats, createJob, updateJob, deleteJob } from "@/lib/api";
import { Job, JobStats } from "@/lib/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, PackageOpen, CheckCircle, XCircle, FileEdit, Clock, Trash2, User, Briefcase, Tag, Building } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  
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
        const [jobsData, statsData] = await Promise.all([
          fetchUserJobs(user.id),
          fetchJobStats(user.id)
        ]);
        
        setJobs(jobsData);
        setJobStats(statsData);
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

  const handleCreateJob = async (jobData: Omit<Job, "id" | "postedDate">) => {
    try {
      const newJob = await createJob(jobData);
      setJobs([newJob, ...jobs]);
      
      // Update stats
      if (jobStats) {
        const updatedStats = { ...jobStats };
        updatedStats[jobData.status] += 1;
        updatedStats.byCategory[jobData.category] = (updatedStats.byCategory[jobData.category] || 0) + 1;
        updatedStats.byType[jobData.type] = (updatedStats.byType[jobData.type] || 0) + 1;
        setJobStats(updatedStats);
      }
      
      toast.success("Job created successfully");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to create job");
    }
  };

  const handleUpdateJob = async (jobData: Omit<Job, "id" | "postedDate">) => {
    if (!editingJob) return;
    
    try {
      const updatedJob = await updateJob(editingJob.id, jobData);
      
      setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
      setEditingJob(null);
      setSelectedJob(updatedJob);
      
      // Update stats if status changed
      if (jobStats && editingJob.status !== jobData.status) {
        const updatedStats = { ...jobStats };
        updatedStats[editingJob.status] -= 1;
        updatedStats[jobData.status] += 1;
        setJobStats(updatedStats);
      }
      
      toast.success("Job updated successfully");
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error("Failed to update job");
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJob(jobToDelete.id);
      
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      setJobToDelete(null);
      setDeleteDialogOpen(false);
      
      if (selectedJob && selectedJob.id === jobToDelete.id) {
        setSelectedJob(null);
      }
      
      // Update stats
      if (jobStats) {
        const updatedStats = { ...jobStats };
        updatedStats[jobToDelete.status] -= 1;
        updatedStats.byCategory[jobToDelete.category] -= 1;
        updatedStats.byType[jobToDelete.type] -= 1;
        setJobStats(updatedStats);
      }
      
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

  const confirmDelete = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const columnDefs = [
    {
      headerName: "Title",
      field: "title",
      flex: 3,
    },
    {
      headerName: "Company",
      field: "company",
      flex: 2,
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          closed: "bg-red-100 text-red-800",
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
      field: "postedDate",
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
            onClick={() => setSelectedJob(params.data)}
            className="h-8"
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingJob(params.data);
              setIsJobFormOpen(true);
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
    if (!jobStats) return [];
    return Object.entries(jobStats.byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getTypeChartData = () => {
    if (!jobStats) return [];
    return Object.entries(jobStats.byType).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getStatusChartData = () => {
    if (!jobStats) return [];
    return [
      { name: "Active", value: jobStats.active },
      { name: "Closed", value: jobStats.closed },
      { name: "Draft", value: jobStats.draft },
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
              <p className="text-muted-foreground">Manage your job postings and track their performance</p>
            </div>
            <Button 
              onClick={() => {
                setEditingJob(null);
                setIsJobFormOpen(true);
              }}
              className="mt-4 md:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Job
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Jobs</p>
                    <h3 className="text-2xl font-bold">{jobs.length}</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:100ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
                    <h3 className="text-2xl font-bold">{jobStats?.active || 0}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Closed Jobs</p>
                    <h3 className="text-2xl font-bold">{jobStats?.closed || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <XCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-scale-in [animation-delay:300ms]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Draft Jobs</p>
                    <h3 className="text-2xl font-bold">{jobStats?.draft || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ChartCard title="Jobs by Status" description="Distribution of job postings by status" className="animate-blur-in">
              <StatsPieChart data={getStatusChartData()} />
            </ChartCard>
            
            <ChartCard title="Jobs by Category" description="Distribution of job postings by category" className="animate-blur-in [animation-delay:100ms]">
              <StatsPieChart data={getCategoryChartData()} />
            </ChartCard>
            
            <ChartCard title="Jobs by Type" description="Distribution of job postings by employment type" className="animate-blur-in [animation-delay:200ms]">
              <StatsBarChart data={getTypeChartData()} />
            </ChartCard>
          </div>
          
          {/* Job Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Your Job Postings</h2>
            
            <div className="space-y-6">
              <DataGrid 
                rowData={jobs}
                columnDefs={columnDefs}
                onRowClick={setSelectedJob}
                loading={isLoading}
                className="animate-blur-in"
              />
              
              {selectedJob && (
                <div className="mt-8 pt-8 border-t animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Selected Job Details</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingJob(selectedJob);
                          setIsJobFormOpen(true);
                        }}
                      >
                        <FileEdit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(selectedJob)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  <JobCard job={selectedJob} />
                </div>
              )}
              
              {jobs.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any job postings yet
                  </p>
                  <Button onClick={() => setIsJobFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Job
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Job Form Dialog */}
      <JobForm
        open={isJobFormOpen}
        setOpen={setIsJobFormOpen}
        job={editingJob || undefined}
        onSave={editingJob ? handleUpdateJob : handleCreateJob}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job "{jobToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
