// Create this as a temporary test page: pages/api-test.tsx or app/api-test/page.tsx

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function APITestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testOpenAIAPI = async () => {
    setLoading(true);
    setResult('Testing OpenAI API...\n');

    try {
      const testData = {
        projectName: "DeFi Test Project",
        description: "A revolutionary DeFi protocol for testing purposes",
        category: "DeFi",
        tokenAsk: "50000",
        fundingUse: "Development and testing of smart contracts",
        roadmap: "Q1: Development, Q2: Testing, Q3: Launch",
        team: "Experienced blockchain developers",
        website: "https://test.com"
      };

      console.log('Sending test data:', testData);
      
      const response = await fetch('/api/analyze-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        const errorMsg = typeof parseError === 'object' && parseError !== null && 'message' in parseError
          ? (parseError as { message: string }).message
          : String(parseError);
        setResult(prev => prev + `\nFailed to parse JSON: ${errorMsg}\nRaw response: ${responseText}`);
        setLoading(false);
        return;
      }

      setResult(prev => prev + `
Status: ${response.status}
Response: ${JSON.stringify(data, null, 2)}
`);

      if (data.score) {
        setResult(prev => prev + `\n✅ SUCCESS: AI analysis worked! Score: ${data.score}`);
      }

    } catch (error: any) {
      console.error('Test error:', error);
      setResult(prev => prev + `\n❌ ERROR: ${error.message}`);
    }

    setLoading(false);
  };

  const checkEnvironment = () => {
    setResult(`Environment Check:
- Window object: ${typeof window !== 'undefined' ? '✅' : '❌'}
- Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
- API URL: ${typeof window !== 'undefined' ? window.location.origin + '/api/analyze-pitch' : 'N/A'}
`);
  };

  const testBasicFetch = async () => {
    setLoading(true);
    setResult('Testing basic fetch...\n');

    try {
      const response = await fetch('/api/analyze-pitch', {
        method: 'GET', // Wrong method on purpose to test if endpoint exists
      });
      
      setResult(prev => prev + `GET request status: ${response.status}\n`);
      
      if (response.status === 405) {
        setResult(prev => prev + '✅ API endpoint exists (Method Not Allowed is expected for GET)\n');
      }
      
    } catch (error: any) {
      setResult(prev => prev + `❌ Fetch error: ${error.message}\n`);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>OpenAI API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={checkEnvironment} variant="outline">
              Check Environment
            </Button>
            <Button onClick={testBasicFetch} variant="outline" disabled={loading}>
              Test Endpoint Exists
            </Button>
            <Button onClick={testOpenAIAPI} disabled={loading}>
              {loading ? 'Testing...' : 'Test OpenAI API'}
            </Button>
          </div>

          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto whitespace-pre-wrap">
            {result || 'Click a button to run tests...'}
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Troubleshooting Checklist:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Check if you have <code>pages/api/analyze-pitch.ts</code> or <code>app/api/analyze-pitch/route.ts</code></li>
              <li>✅ Verify <code>OPENAI_API_KEY</code> is in <code>.env.local</code></li>
              <li>✅ Restart your development server after adding .env.local</li>
              <li>✅ Check if <code>openai</code> package is installed</li>
              <li>✅ Look at your terminal/console for server errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}