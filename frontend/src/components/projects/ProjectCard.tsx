import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Award, ThumbsUp } from "lucide-react";

interface ProjectCardProps {
  id?: string;
  title?: string;
  founder?: string;
  description?: string;
  fundingGoal?: number;
  fundingCurrent?: number;
  aiScore?: number;
  aiLabel?: string;
  category?: string;
  imageUrl?: string;
}

const ProjectCard = ({
  id = "1",
  title = "Decentralized Healthcare Platform",
  founder = "Jane Smith",
  description = "A blockchain solution for secure medical records and patient data sharing across healthcare providers.",
  fundingGoal = 50000,
  fundingCurrent = 32500,
  aiScore = 92,
  aiLabel = "High Potential",
  category = "Healthcare",
  imageUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
}: ProjectCardProps) => {
  const fundingPercentage = Math.min(
    Math.round((fundingCurrent / fundingGoal) * 100),
    100,
  );

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-lg bg-white">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary">
          {category}
        </Badge>
        {aiScore > 85 && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Award className="h-3.5 w-3.5" />
            {aiLabel}
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground">by {founder}</p>
      </CardHeader>

      <CardContent>
        <p className="text-sm line-clamp-3 mb-4 text-gray-600">{description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{fundingPercentage}% Funded</span>
            <span className="text-muted-foreground">
              {fundingCurrent.toLocaleString()} / {fundingGoal.toLocaleString()}{" "}
              SEI
            </span>
          </div>
          <Progress value={fundingPercentage} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1">
          <ThumbsUp className="mr-1 h-4 w-4" /> Vote
        </Button>
        <Button size="sm" className="flex-1">
          Details <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
