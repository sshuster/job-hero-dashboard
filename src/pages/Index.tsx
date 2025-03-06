
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataGrid } from "@/components/ui/data-grid";
import { JobCard } from "@/components/ui/job-card";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { fetchAllJobs } from "@/lib/api";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, ArrowRight } from "lucide-react";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchAllJobs();
        setJobs(data.filter(job => job.status === 'active'));
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.category.toLowerCase().includes(searchLower) ||
      job.type.toLowerCase().includes(searchLower)
    );
  });

  const columnDefs = [
    {
      headerName: "Job Title",
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
      headerName: "Company",
      field: "company",
      flex: 1.5,
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
      headerName: "Type",
      field: "type",
      flex: 1,
      cellRenderer: (params: any) => {
        return <Badge variant="secondary">{params.value}</Badge>;
      },
    },
    {
      headerName: "Posted Date",
      field: "postedDate",
      flex: 1,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in">
            Find Your Perfect <span className="text-primary">Job</span> Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in opacity-90">
            Browse through our curated list of job opportunities from leading companies
          </p>
          
          <div className="relative max-w-3xl mx-auto mb-8 flex shadow-sm animate-slide-up">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
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
            {["Development", "Design", "Marketing", "Sales", "Data Science"].map((category) => (
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
            Latest Job Postings
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
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onClick={() => setSelectedJob(job)} 
                className="animate-scale-in"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later
            </p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <DataGrid 
            rowData={filteredJobs}
            columnDefs={columnDefs}
            onRowClick={setSelectedJob}
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
              <h3 className="font-bold text-xl mb-2">JobHero</h3>
              <p className="text-muted-foreground">Find your dream job today</p>
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
            <p>&copy; {new Date().getFullYear()} JobHero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
