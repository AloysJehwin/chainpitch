import React from "react";
import { Search, Filter } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  // Mock data for projects
  const projects = [
    {
      id: "1",
      title: "DeFi Lending Protocol",
      founder: "Alex Johnson",
      description:
        "A decentralized lending platform with AI-powered risk assessment for optimal interest rates.",
      fundingProgress: 65,
      fundingGoal: 50000,
      category: "DeFi",
      aiScore: 92,
      votes: 156,
      imageUrl:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=500&q=80",
    },
    {
      id: "2",
      title: "NFT Marketplace",
      founder: "Maria Garcia",
      description:
        "A next-gen NFT marketplace with fractional ownership and integrated social features.",
      fundingProgress: 42,
      fundingGoal: 75000,
      category: "NFT",
      aiScore: 85,
      votes: 98,
      imageUrl:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&q=80",
    },
    {
      id: "3",
      title: "DAO Governance Tool",
      founder: "James Wilson",
      description:
        "Simplifying DAO governance with intuitive voting mechanisms and proposal templates.",
      fundingProgress: 78,
      fundingGoal: 30000,
      category: "Governance",
      aiScore: 88,
      votes: 203,
      imageUrl:
        "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&q=80",
    },
    {
      id: "4",
      title: "Cross-Chain Bridge",
      founder: "Sarah Lee",
      description:
        "Seamless asset transfer between Sei and other major blockchains with minimal fees.",
      fundingProgress: 25,
      fundingGoal: 100000,
      category: "Infrastructure",
      aiScore: 90,
      votes: 76,
      imageUrl:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&q=80",
    },
    {
      id: "5",
      title: "Decentralized Identity",
      founder: "Michael Chen",
      description:
        "Self-sovereign identity solution with privacy-preserving verification mechanisms.",
      fundingProgress: 53,
      fundingGoal: 45000,
      category: "Identity",
      aiScore: 87,
      votes: 112,
      imageUrl:
        "https://images.unsplash.com/photo-1639322537064-9c044ecf68d9?w=500&q=80",
    },
    {
      id: "6",
      title: "GameFi Platform",
      founder: "David Rodriguez",
      description:
        "Play-to-earn gaming ecosystem with interoperable assets and progressive rewards.",
      fundingProgress: 38,
      fundingGoal: 80000,
      category: "Gaming",
      aiScore: 84,
      votes: 145,
      imageUrl:
        "https://images.unsplash.com/photo-1640272331779-20a3c2582168?w=500&q=80",
    },
  ];

  // Categories for filtering
  const categories = [
    "All",
    "DeFi",
    "NFT",
    "Governance",
    "Infrastructure",
    "Identity",
    "Gaming",
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Explore Projects</h1>
          <p className="text-muted-foreground">
            Discover and support innovative projects on the Sei blockchain
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex flex-wrap h-auto mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="mb-1">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Trending
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Newest
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Funding % (High to Low)
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              AI Score (High to Low)
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Most Voted
            </Badge>
          </div>

          {/* Projects Grid */}
          <TabsContent value="All" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  founder={project.founder}
                  description={project.description}
                  fundingProgress={project.fundingProgress}
                  fundingGoal={project.fundingGoal}
                  category={project.category}
                  aiScore={project.aiScore}
                  votes={project.votes}
                  imageUrl={project.imageUrl}
                />
              ))}
            </div>
          </TabsContent>

          {/* Other category tabs would have similar content with filtered projects */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((project) => project.category === category)
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      founder={project.founder}
                      description={project.description}
                      fundingProgress={project.fundingProgress}
                      fundingGoal={project.fundingGoal}
                      category={project.category}
                      aiScore={project.aiScore}
                      votes={project.votes}
                      imageUrl={project.imageUrl}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="mx-1">
            1
          </Button>
          <Button variant="outline" className="mx-1">
            2
          </Button>
          <Button variant="outline" className="mx-1">
            3
          </Button>
          <Button variant="outline" className="mx-1">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
