"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Upload, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SubmitPitchPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [walletConnected, setWalletConnected] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<null | {
    score: number;
    feedback: string[];
    strengths: string[];
    weaknesses: string[];
  }>(null);

  // Mock function to simulate wallet connection
  const connectWallet = () => {
    setWalletConnected(true);
  };

  // Mock function to simulate AI analysis
  const runAiAnalysis = () => {
    // Simulate API call delay
    setTimeout(() => {
      setAiAnalysis({
        score: 78,
        feedback: [
          "Your pitch has a clear value proposition",
          "Consider expanding on your market analysis",
          "The roadmap timeline is realistic and well-structured",
        ],
        strengths: [
          "Strong founding team credentials",
          "Clear product-market fit",
          "Innovative technology approach",
        ],
        weaknesses: [
          "Limited competitive analysis",
          "Funding request could be more detailed",
          "Consider more specific user acquisition strategy",
        ],
      });
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep === 3) {
      runAiAnalysis();
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-background">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Submit Your Pitch
      </h1>
      <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Share your startup idea with the ChainPitch community to receive
        feedback, votes, and potential funding through our DAO-driven incubator.
      </p>

      {/* Progress indicator */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 5</span>
          <span className="text-sm font-medium">
            {Math.round((currentStep / 5) * 100)}%
          </span>
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>

      {/* Step 1: Connect Wallet */}
      {currentStep === 1 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              To submit a pitch, you need to connect your Sei blockchain wallet
              first.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-10">
            <Wallet className="h-16 w-16 mb-6 text-primary" />
            <p className="mb-6 text-center max-w-md">
              Connect with Keplr, Cosmostation, or Leap wallet to continue. This
              will be used to identify you as the pitch creator.
            </p>
            <Button
              size="lg"
              onClick={connectWallet}
              className="w-full max-w-xs"
              disabled={walletConnected}
            >
              {walletConnected ? "Wallet Connected" : "Connect Wallet"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={nextStep} disabled={!walletConnected}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Project Details */}
      {currentStep === 2 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Tell us about your startup project and its core value proposition.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input id="project-name" placeholder="Enter your project name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-description">Short Description *</Label>
              <Textarea
                id="short-description"
                placeholder="Describe your project in 2-3 sentences (max 200 characters)"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT & Digital Assets</SelectItem>
                  <SelectItem value="dao">DAO & Governance</SelectItem>
                  <SelectItem value="gaming">Gaming & Metaverse</SelectItem>
                  <SelectItem value="infrastructure">
                    Infrastructure & Tooling
                  </SelectItem>
                  <SelectItem value="social">Social & Community</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input id="website" placeholder="https://" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitch-deck">Pitch Deck *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop your PDF or click to browse
                </p>
                <Button variant="outline" size="sm">
                  Upload File
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Funding & Roadmap */}
      {currentStep === 3 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Funding & Roadmap</CardTitle>
            <CardDescription>
              Define your funding requirements and project roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-ask">Token Ask (in SEI) *</Label>
              <Input id="token-ask" type="number" placeholder="e.g. 50000" />
              <p className="text-xs text-muted-foreground">
                Current SEI price: $0.42 USD
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding-use">
                How will you use the funding? *
              </Label>
              <Textarea
                id="funding-use"
                placeholder="Explain how you plan to allocate the funds"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roadmap">Project Roadmap *</Label>
              <Textarea
                id="roadmap"
                placeholder="Outline your project milestones and timeline"
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team Information *</Label>
              <Textarea
                id="team"
                placeholder="Describe your team members and their relevant experience"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: AI Analysis */}
      {currentStep === 4 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>AI Pitch Analysis</CardTitle>
            <CardDescription>
              Our AI will analyze your pitch and provide feedback to help
              improve it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aiAnalysis ? (
              <div className="py-10 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Analyzing your pitch...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Pitch Score</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">
                      {aiAnalysis.score}/100
                    </span>
                    <Badge
                      variant={aiAnalysis.score > 70 ? "default" : "outline"}
                    >
                      {aiAnalysis.score > 80
                        ? "Excellent"
                        : aiAnalysis.score > 70
                          ? "Good"
                          : "Needs Work"}
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="feedback">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="weaknesses">
                      Areas to Improve
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="feedback" className="pt-4">
                    <ul className="space-y-2">
                      {aiAnalysis.feedback.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="strengths" className="pt-4">
                    <ul className="space-y-2">
                      {aiAnalysis.strengths.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="weaknesses" className="pt-4">
                    <ul className="space-y-2">
                      {aiAnalysis.weaknesses.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Recommendation</AlertTitle>
                  <AlertDescription>
                    Consider addressing the areas for improvement before final
                    submission, or proceed with your pitch as is.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!aiAnalysis}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>
              Review your pitch details before submitting to the ChainPitch DAO.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                By submitting your pitch, you agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  Your pitch will be publicly visible to all ChainPitch DAO
                  members
                </li>
                <li>
                  Community members can vote on your pitch using their DAO
                  tokens
                </li>
                <li>
                  If approved, you'll receive funding in SEI tokens based on
                  your request
                </li>
                <li>
                  You'll issue NFT ownership stakes to backers as specified
                </li>
                <li>
                  You agree to provide regular updates on your project progress
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pitch Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Project Name</p>
                  <p className="text-muted-foreground">Example Project</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-muted-foreground">DeFi</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Funding Request</p>
                  <p className="text-muted-foreground">50,000 SEI</p>
                </div>
                <div>
                  <p className="text-sm font-medium">AI Score</p>
                  <p className="text-muted-foreground">78/100 (Good)</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              className="w-full sm:w-auto"
            >
              Back to Edit
            </Button>
            <Button className="w-full sm:w-auto">Submit Pitch to DAO</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
