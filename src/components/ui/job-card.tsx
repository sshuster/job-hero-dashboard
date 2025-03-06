
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Job } from "@/lib/types";
import { CalendarDays, MapPin, Building, DollarSign, Tag, Clock } from "lucide-react";

interface JobCardProps {
  job: Job;
  isCompact?: boolean;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function JobCard({
  job,
  isCompact = false,
  actions,
  onClick,
  className,
}: JobCardProps) {
  const statusColorMap = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md", 
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold mb-1">
            {job.title}
          </CardTitle>
          <Badge className={cn(statusColorMap[job.status], "uppercase text-xs")}>
            {job.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-base">
          <Building className="h-4 w-4" /> {job.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" /> {job.salary}
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" /> {job.type}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> Posted: {job.postedDate}
          </div>
        </div>
        
        {!isCompact && (
          <>
            <p className="text-sm mt-2">{job.description}</p>
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Requirements:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {job.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
                {job.requirements.length > 3 && (
                  <li className="text-muted-foreground">
                    +{job.requirements.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </CardContent>
      {actions && <CardFooter className="flex justify-end gap-2 pt-1">{actions}</CardFooter>}
    </Card>
  );
}
