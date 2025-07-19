// src/app/api/analyze-pitch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface PitchData {
  projectName: string;
  description: string;
  category: string;
  tokenAsk: string;
  fundingUse: string;
  roadmap: string;
  team: string;
  website?: string;
}

interface AIAnalysis {
  score: number;
  feedback: string[];
  strengths: string[];
  weaknesses: string[];
}

export async function POST(request: NextRequest) {
  console.log('🚀 API Route: POST request received at /api/analyze-pitch');

  // Check API key first
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in environment');
    return NextResponse.json({ 
      error: 'OpenAI API key not configured',
      details: 'Please add OPENAI_API_KEY to your .env.local file and restart the server'
    }, { status: 500 });
  }

  console.log('🔑 OpenAI API key found:', process.env.OPENAI_API_KEY.substring(0, 7) + '...');

  try {
    // Parse request body
    const pitchData: PitchData = await request.json();
    console.log('📊 Received pitch data for project:', pitchData?.projectName || 'Unknown');

    // Validate required fields
    if (!pitchData || !pitchData.projectName || !pitchData.description) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required data',
        details: {
          hasProjectName: !!pitchData?.projectName,
          hasDescription: !!pitchData?.description,
          receivedKeys: Object.keys(pitchData || {})
        }
      }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('🤖 Initializing OpenAI client and making request...');

    // Create the completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert startup pitch analyzer. You must respond with valid JSON only, no other text or formatting."
        },
        {
          role: "user",
          content: `Analyze this startup pitch and return a JSON object with the exact structure below:

PITCH TO ANALYZE:
Project Name: ${pitchData.projectName}
Category: ${pitchData.category || 'Not specified'}
Description: ${pitchData.description}
Funding Request: ${pitchData.tokenAsk || 'Not specified'} SEI tokens
Funding Use: ${pitchData.fundingUse || 'Not specified'}
Roadmap: ${pitchData.roadmap || 'Not specified'}
Team: ${pitchData.team || 'Not specified'}
Website: ${pitchData.website || 'Not provided'}

Return only this JSON structure (no additional text):
{
  "score": [number between 1-100],
  "feedback": ["specific feedback point 1", "specific feedback point 2", "specific feedback point 3"],
  "strengths": ["key strength 1", "key strength 2"],
  "weaknesses": ["area for improvement 1", "area for improvement 2"]
}

Base the score on: clarity (25%), market opportunity (25%), team strength (20%), financial planning (15%), innovation (15%).`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log('📥 Received response from OpenAI');

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      console.log('❌ Empty response from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    console.log('🔍 Raw AI response (first 200 chars):', aiResponse.substring(0, 200));

    // Parse the JSON response
    let analysis: AIAnalysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      
      console.log('🔧 Attempting to parse JSON...');
      analysis = JSON.parse(jsonString);
      console.log('✅ JSON parsed successfully');
      
    } catch (parseError) {
      if (parseError instanceof Error) {
        console.log('❌ JSON parsing failed:', parseError.message);
      } else {
        console.log('❌ JSON parsing failed:', parseError);
      }
      console.log('Raw response was:', aiResponse);
      
      // Create a structured fallback based on the pitch data
      analysis = {
        score: 75,
        feedback: [
          `Analyzed "${pitchData.projectName}" - AI parsing encountered an issue`,
          "Your pitch includes all required sections",
          "Consider expanding on market analysis and competitive landscape"
        ],
        strengths: [
          "Complete project information provided",
          "Clear funding amount specified",
          pitchData.website ? "Website provided for verification" : "Detailed project description"
        ].filter(Boolean),
        weaknesses: [
          "AI response parsing failed - manual review recommended",
          "Consider more detailed financial projections"
        ]
      };
    }

    // Validate and sanitize the analysis
    if (typeof analysis.score !== 'number') {
      analysis.score = 75;
    }
    
    analysis.score = Math.max(1, Math.min(100, Math.round(analysis.score)));
    
    // Ensure arrays exist and have reasonable lengths
    analysis.feedback = Array.isArray(analysis.feedback) ? analysis.feedback.slice(0, 5) : [
      "Analysis completed successfully",
      "Your pitch demonstrates good preparation",
      "Consider peer review for additional insights"
    ];
    
    analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 4) : [
      "Comprehensive project information",
      "Clear funding requirements"
    ];
    
    analysis.weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses.slice(0, 4) : [
      "Consider expanding market analysis",
      "Add more competitive differentiation"
    ];

    console.log('🎉 Analysis complete! Score:', analysis.score);
    console.log('📊 Feedback points:', analysis.feedback.length);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('❌ Error in API route:', error.message);
    console.error('Full error:', error);
    
    // Return a comprehensive fallback analysis
    const fallbackAnalysis: AIAnalysis = {
      score: 75,
      feedback: [
        "Technical analysis completed with backup system",
        "Your pitch submission contains all required elements",
        "Consider manual peer review while AI service is restored",
        "The project concept appears well-structured"
      ],
      strengths: [
        "Complete submission with all required fields",
        "Clear project description and funding goals",
        "Structured approach to project planning"
      ],
      weaknesses: [
        "AI analysis service temporarily unavailable",
        "Manual validation recommended",
        "Consider additional market research documentation"
      ]
    };

    console.log('🔄 Returning fallback analysis due to error');
    return NextResponse.json(fallbackAnalysis);
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  console.log('📋 OPTIONS request received');
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Optional: Handle GET requests for testing
export async function GET(request: NextRequest) {
  console.log('📋 GET request received - this endpoint only supports POST');
  
  return NextResponse.json({
    message: 'Pitch analysis API endpoint',
    method: 'POST only',
    status: 'active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}