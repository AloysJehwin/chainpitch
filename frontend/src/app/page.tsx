import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Rocket, Vote, Coins, Brain, Shield } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";

export default function LandingPage() {
  // Featured projects data
  const featuredProjects = [
    {
      id: "1",
      title: "DeFi Lending Protocol",
      founder: "Alex Johnson",
      description:
        "A decentralized lending protocol with dynamic interest rates based on market conditions.",
      fundingProgress: 75,
      fundingGoal: 50000,
      aiScore: 92,
      category: "DeFi",
      votes: 156,
    },
    {
      id: "2",
      title: "NFT Marketplace",
      founder: "Maria Garcia",
      description:
        "A marketplace for NFTs with focus on emerging artists and royalty distribution.",
      fundingProgress: 45,
      fundingGoal: 35000,
      aiScore: 85,
      category: "NFT",
      votes: 98,
    },
    {
      id: "3",
      title: "DAO Governance Tool",
      founder: "Sam Wilson",
      description:
        "A comprehensive tool for managing DAO governance with advanced voting mechanisms.",
      fundingProgress: 60,
      fundingGoal: 40000,
      aiScore: 88,
      category: "Governance",
      votes: 124,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:px-8 lg:px-16 flex flex-col items-center text-center bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-background">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Pitch. Vote. Launch. Decentralized.
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-3xl text-muted-foreground">
          ChainPitch is a DAO-driven startup incubator built on the Sei
          blockchain where great ideas get funded by the community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Join the DAO
          </Button>
          <Link href="/submit">
            <Button size="lg" variant="outline" className="border-2">
              Submit a Pitch
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 px-4 md:px-8 lg:px-16 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>1. Submit Your Pitch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create a detailed pitch for your startup idea and submit it to
                  the platform. Our AI will analyze and provide initial
                  feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Vote className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>2. Community Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  DAO members review and vote on pitches using their governance
                  tokens. The best ideas rise to the top.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Coins className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>3. Get Funded</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Successful pitches receive funding from the community
                  treasury. Backers receive NFT ownership stakes in your
                  project.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="w-full py-16 px-4 md:px-8 lg:px-16 bg-purple-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured Projects
            </h2>
            <Link href="/projects">
              <Button variant="ghost" className="flex items-center gap-2">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Why ChainPitch Section */}
      <section className="w-full py-16 px-4 md:px-8 lg:px-16 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Why ChainPitch?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Vote className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Token-Based Voting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Participate in a fair and transparent voting system using DAO
                  governance tokens to support the best ideas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>NFT Ownership Stakes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive NFT ownership stakes when you back projects, creating
                  a direct connection between supporters and founders.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Brain className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI provides objective analysis of pitches, helping the
                  community make informed decisions about which projects to
                  fund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Launch Your Startup?
          </h2>
          <p className="text-lg md:text-xl mb-10">
            Join our community of innovators and get the funding and support you
            need to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Join the DAO
            </Button>
            <Link href="/submit">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white hover:bg-white hover:text-purple-600"
              >
                Submit a Pitch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
