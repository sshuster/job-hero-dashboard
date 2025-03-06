
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { Job } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface JobFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  job?: Job;
  onSave: (job: Omit<Job, "id" | "postedDate">) => Promise<void>;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const JOB_CATEGORIES = ["Development", "Design", "Marketing", "Sales", "Customer Service", "Data Science", "DevOps", "Management", "Other"];

export function JobForm({ open, setOpen, job, onSave }: JobFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || "");
  const [location, setLocation] = useState(job?.location || "");
  const [salary, setSalary] = useState(job?.salary || "");
  const [description, setDescription] = useState(job?.description || "");
  const [requirements, setRequirements] = useState<string[]>(job?.requirements || [""]);
  const [type, setType] = useState(job?.type || "Full-time");
  const [category, setCategory] = useState(job?.category || "Development");
  const [status, setStatus] = useState<"active" | "closed" | "draft">(job?.status || "active");

  const handleAddRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setRequirements(newRequirements);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate form
    if (!title || !company || !location || !description || !requirements[0]) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out empty requirements
      const filteredRequirements = requirements.filter((req) => req.trim() !== "");
      
      await onSave({
        title,
        company,
        location,
        salary,
        description,
        requirements: filteredRequirements,
        type,
        category,
        status,
        postedBy: user.id,
      });
      
      toast.success(job ? "Job updated successfully" : "Job created successfully");
      setOpen(false);
    } catch (error) {
      console.error("Failed to save job:", error);
      toast.error("Failed to save job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job" : "Add New Job"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details of your job posting." : "Fill out the form to create a new job posting."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title<span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Frontend Developer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company<span className="text-destructive">*</span></Label>
              <Input 
                id="company" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                placeholder="e.g. Acme Inc."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location<span className="text-destructive">*</span></Label>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. San Francisco, CA or Remote"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input 
                id="salary" 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)} 
                placeholder="e.g. $80,000 - $100,000"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Job Type<span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category<span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status<span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={(value: "active" | "closed" | "draft") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description<span className="text-destructive">*</span></Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the job, responsibilities, and any other details..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Requirements<span className="text-destructive">*</span></Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Requirement
              </Button>
            </div>
            
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    required={index === 0}
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRequirement(index)}
                      className="h-10 w-10 shrink-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "Saving..." 
                : job ? "Update Job" : "Create Job"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
