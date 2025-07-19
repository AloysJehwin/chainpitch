// src/app/page.tsx - Enhanced Home Page with Civic

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useCivicAuth } from "@/contexts/CivicAuthContext";

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
import { 
  ArrowRight, 
  Rocket, 
  Vote, 
  Coins, 
  Brain, 
  Shield, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Enhanced types with Civic verification
interface SubmittedPitch {
  id: string;
  title: string;
  founder: string;
  description: string;
  category: string;
  website?: string;
  tokenAsk: number;
  fundingUse: string;
  roadmap: string;
  team: string;
  aiScore: number;
  votes: {
    upvotes: number;
    downvotes: number;
    userVotes: Record<string, 'up' | 'down'>;
  };
  fundingProgress: number;
  submittedAt: Date;
  pitchDeckUrl?: string;
  // Civic verification fields
  civicVerified?: boolean;
  verificationStatus?: string;
  submitterWallet?: string;
}

// Enhanced ProjectCard with Civic verification display
const EnhancedProjectCard = ({ 
  project, 
  onVote 
}: { 
  project: SubmittedPitch; 
  onVote: (id: string, type: 'up' | 'down') => void;
}) => {
  const { connected, publicKey } = useWallet();
  const { isVerified } = useCivicAuth();
  
  const userVote = publicKey ? project.votes.userVotes[publicKey.toString()] : null;
  const totalVotes = project.votes.upvotes + project.votes.downvotes;
  const upvotePercentage = totalVotes > 0 ? (project.votes.upvotes / totalVotes) * 100 : 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", variant: "default" as const };
    if (score >= 70) return { text: "Good", variant: "secondary" as const };
    return { text: "Needs Work", variant: "outline" as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canVote = connected && isVerified;

  return (
    <Card className="border-2 hover:shadow-lg transition-all duration-200 hover:border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {project.category}
            </Badge>
            {project.civicVerified && (
              <Badge variant="default" className="text-xs bg-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className={`text-sm font-medium ${getScoreColor(project.aiScore)}`}>
              {project.aiScore}/100
            </span>
            <Badge {...getScoreBadge(project.aiScore)}>
              {getScoreBadge(project.aiScore).text}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl mb-1">{project.title}</CardTitle>
        <CardDescription className="text-sm flex items-center gap-2">
          <span>by {project.founder?.slice(0, 8)}...</span>
          {project.civicVerified && (
            <CheckCircle className="h-3 w-3 text-blue-600" />
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>
        
        {/* Funding Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Target: {project.tokenAsk.toLocaleString()} SEI
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(project.tokenAsk * 0.42)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Progress: {project.fundingProgress}%</span>
            <span className="text-green-600 font-medium">
              {formatCurrency(project.tokenAsk * 0.42 * project.fundingProgress / 100)} raised
            </span>
          </div>
          <Progress value={project.fundingProgress} className="h-2" />
        </div>

        {/* Voting Section */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalVotes} votes</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {upvotePercentage.toFixed(0)}% positive
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={userVote === 'up' ? "default" : "outline"}
              className="flex-1"
              onClick={() => onVote(project.id, 'up')}
              disabled={!canVote}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {project.votes.upvotes}
            </Button>
            <Button
              size="sm"
              variant={userVote === 'down' ? "destructive" : "outline"}
              className="flex-1"
              onClick={() => onVote(project.id, 'down')}
              disabled={!canVote}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {project.votes.downvotes}
            </Button>
          </div>
          
          {!connected && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Connect wallet to vote
            </p>
          )}
          
          {connected && !isVerified && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Civic verification required to vote
            </p>
          )}
        </div>

        {/* Trust Score */}
        {project.civicVerified && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Trust Score</span>
              <Badge variant="default" className="bg-blue-600">High</Badge>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Founder verified through Civic identity verification
            </p>
          </div>
        )}

        {/* Time Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Submitted {new Date(project.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/projects/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Verification Status Banner
const VerificationBanner = () => {
  const { connected } = useWallet();
  const { isVerified, isLoading } = useCivicAuth();

  if (!connected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-3" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-800">Connect & Verify to Participate</h3>
            <p className="text-sm text-blue-600">
              Connect your wallet and complete Civic verification to vote on pitches and submit your own ideas.
            </p>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
          <div>
            <h3 className="font-medium text-yellow-800">Checking Verification Status</h3>
            <p className="text-sm text-yellow-600">Verifying your identity with Civic...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Verification Required</h3>
            <p className="text-sm text-amber-600">
              Complete Civic verification to vote on pitches and submit your own projects.
            </p>
          </div>
          <Link href="/submit">
            <Button variant="outline" className="border-amber-300 text-amber-700">
              Get Verified
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
        <div className="flex-1">
          <h3 className="font-medium text-green-800">Verified Member</h3>
          <p className="text-sm text-green-600">
            You're verified with Civic and can participate in all DAO activities.
          </p>
        </div>
        <Badge variant="default" className="bg-green-600">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      </div>
    </div>
  );
};

export default function EnhancedLandingPage() {
  const [submittedPitches, setSubmittedPitches] = useState<SubmittedPitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { connected, publicKey } = useWallet();
  const { isVerified } = useCivicAuth();

  // Load pitches with Civic verification data
  useEffect(() => {
    const loadPitches = () => {
      const stored = JSON.parse(localStorage.getItem('chainpitch_submissions') || '[]');
      
      if (stored.length === 0) {
        // Enhanced sample data with Civic verification
        const samplePitches: SubmittedPitch[] = [
          {
            id: "sample-1",
            title: "DeFi Lending Protocol",
            founder: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
            description: "A decentralized lending protocol with dynamic interest rates based on market conditions and automated risk assessment.",
            category: "DeFi",
            website: "https://defiprotocol.example.com",
            tokenAsk: 50000,
            fundingUse: "Development, security audits, and marketing",
            roadmap: "Q1: MVP, Q2: Testnet, Q3: Mainnet, Q4: Advanced features",
            team: "Experienced DeFi developers and financial analysts",
            aiScore: 92,
            votes: {
              upvotes: 156,
              downvotes: 12,
              userVotes: {}
            },
            fundingProgress: 75,
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            civicVerified: true,
            verificationStatus: "ACTIVE",
            submitterWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU"
          },
          {
            id: "sample-2",
            title: "NFT Marketplace for Artists",
            founder: "9yHpEe2i8qZ3d4jQ6gM8K7vF2cX1nB5oR3tY8uI7pL",
            description: "A marketplace for NFTs with focus on emerging artists and fair royalty distribution to creators.",
            category: "NFT",
            tokenAsk: 35000,
            fundingUse: "Platform development and artist onboarding",
            roadmap: "Q1: Beta platform, Q2: Artist partnerships, Q3: Mobile app",
            team: "Artists, developers, and community managers",
            aiScore: 85,
            votes: {
              upvotes: 98,
              downvotes: 8,
              userVotes: {}
            },
            fundingProgress: 45,
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            civicVerified: false,
            verificationStatus: "PENDING",
            submitterWallet: "9yHpEe2i8qZ3d4jQ6gM8K7vF2cX1nB5oR3tY8uI7pL"
          },
          {
            id: "sample-3",
            title: "DAO Governance Tool",
            founder: "3mF7nJ2kL8hQ9vB6xC4dE1gR5tP9wI3uY7zN8oS2kM",
            description: "A comprehensive tool for managing DAO governance with advanced voting mechanisms and proposal management.",
            category: "Governance",
            tokenAsk: 40000,
            fundingUse: "Development and DAO partnerships",
            roadmap: "Q1: Core features, Q2: Integrations, Q3: Advanced analytics",
            team: "Blockchain developers and governance experts",
            aiScore: 88,
            votes: {
              upvotes: 124,
              downvotes: 15,
              userVotes: {}
            },
            fundingProgress: 60,
            submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            civicVerified: true,
            verificationStatus: "ACTIVE",
            submitterWallet: "3mF7nJ2kL8hQ9vB6xC4dE1gR5tP9wI3uY7zN8oS2kM"
          },
        ];
        
        localStorage.setItem('chainpitch_submissions', JSON.stringify(samplePitches));
        setSubmittedPitches(samplePitches);
      } else {
        setSubmittedPitches(stored);
      }
      
      setIsLoading(false);
    };

    loadPitches();

    const handleNewSubmission = (event: CustomEvent) => {
      const newPitch = event.detail;
      setSubmittedPitches(prev => {
        const updated = [newPitch, ...prev];
        localStorage.setItem('chainpitch_submissions', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('pitchSubmitted', handleNewSubmission as EventListener);
    
    return () => {
      window.removeEventListener('pitchSubmitted', handleNewSubmission as EventListener);
    };
  }, []);

  // Handle voting (only for verified users)
  const handleVote = (pitchId: string, voteType: 'up' | 'down') => {
    if (!connected || !publicKey || !isVerified) return;

    setSubmittedPitches(prev => {
      const updated = prev.map(pitch => {
        if (pitch.id === pitchId) {
          const currentVote = pitch.votes.userVotes[publicKey.toString()];
          const newVotes = { ...pitch.votes };
          
          if (currentVote === 'up') {
            newVotes.upvotes--;
          } else if (currentVote === 'down') {
            newVotes.downvotes--;
          }
          
          if (currentVote !== voteType) {
            if (voteType === 'up') {
              newVotes.upvotes++;
            } else {
              newVotes.downvotes++;
            }
            newVotes.userVotes[publicKey.toString()] = voteType;
          } else {
            delete newVotes.userVotes[publicKey.toString()];
          }
          
          return { ...pitch, votes: newVotes };
        }
        return pitch;
      });
      
      localStorage.setItem('chainpitch_submissions', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter and sort functions
  const getVerifiedPitches = () => {
    return submittedPitches.filter(pitch => pitch.civicVerified);
  };

  const getTrendingPitches = () => {
    return [...submittedPitches]
      .sort((a, b) => {
        const aScore = (a.votes.upvotes - a.votes.downvotes) + (a.aiScore / 10) + (a.civicVerified ? 10 : 0);
        const bScore = (b.votes.upvotes - b.votes.downvotes) + (b.aiScore / 10) + (b.civicVerified ? 10 : 0);
        return bScore - aScore;
      })
      .slice(0, 6);
  };

  const getRecentPitches = () => {
    return [...submittedPitches]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 3);
  };

  const verifiedCount = getVerifiedPitches().length;
  const totalVotes = submittedPitches.reduce((sum, p) => sum + p.votes.upvotes + p.votes.downvotes, 0);

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:px-8 lg:px-16 flex flex-col items-center text-center bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-background">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Pitch. Vote. Launch. Verified.
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-3xl text-muted-foreground">
          ChainPitch is a DAO-driven startup incubator built on Solana with Civic identity verification
          ensuring trust and preventing fraud.
        </p>
        
        {/* Enhanced Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{submittedPitches.length}</div>
            <div className="text-sm text-muted-foreground">Active Pitches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{verifiedCount}</div>
            <div className="text-sm text-muted-foreground">Verified Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalVotes}</div>
            <div className="text-sm text-muted-foreground">Community Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {submittedPitches.reduce((sum, p) => sum + p.tokenAsk, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">SEI Requested</div>
          </div>
        </div>

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

      {/* Verification Status Banner */}
      <section className="w-full px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <VerificationBanner />
        </div>
      </section>

      {/* Verified Projects Section */}
      {!isLoading && verifiedCount > 0 && (
        <section className="w-full py-16 px-4 md:px-8 lg:px-16 bg-blue-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Shield className="text-blue-600" />
                  Verified Projects
                </h2>
                <p className="text-muted-foreground">
                  Identity-verified projects with enhanced trust and credibility
                </p>
              </div>
              <Link href="/projects">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getVerifiedPitches().slice(0, 3).map((project) => (
                <EnhancedProjectCard 
                  key={project.id} 
                  project={project} 
                  onVote={handleVote}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rest of the page sections... */}
      {/* Copy the remaining sections from the original home page */}
      
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          [Include remaining sections: How It Works, Trending Projects, Why ChainPitch, CTA]
        </p>
      </div>
    </main>
  );
}