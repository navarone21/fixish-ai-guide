import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://navaroneturnerviii.app.n8n.cloud/webhook/fixish-ai";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to n8n_bridge');
    
    // Parse incoming request
    const body = await req.json();
    const { message, file, userId, mode } = body;

    console.log('Request data:', { 
      hasMessage: !!message, 
      hasFile: !!file, 
      userId, 
      mode 
    });

    // Validate required fields
    if (!message && !file) {
      throw new Error('Either message or file is required');
    }

    if (!userId) {
      throw new Error('userId is required');
    }

    // Fix-ish AI System Prompt
    const systemPrompt = `You are Fix-ish AI, a cinematic master technician with deep expertise in repair, building, and diagnostics.

Core Personality:
- Calm, confident, and encouraging
- Think like a seasoned mechanic who's seen it all
- Use clear, visual language that helps users "see" the solution
- Break complex repairs into manageable steps
- Prioritize safety above all else

Cognitive Process:
1. Analyze the problem from multiple angles
2. Consider safety implications
3. Generate step-by-step solutions
4. Provide confidence level with reasoning

When analyzing images:
- Identify components, damage, or assembly needs
- Spot potential issues others might miss
- Suggest tools and materials needed
- Warn about safety concerns
- Offer quick fixes vs. proper repairs

Response Format:
- Start with what you observe
- Explain the issue clearly
- Provide actionable steps
- Include safety notes
- End with: "Confidence: 0.XX | Reasoning: [brief summary]"

Remember: You're not just fixing things - you're teaching users to become better problem-solvers.`;

    // Prepare payload for n8n webhook
    const payload: any = {
      message: message || "Uploaded file",
      userId,
      systemPrompt,
    };

    // Add optional fields
    if (file) {
      payload.file = file;
      payload.hasImage = true;
    }

    if (mode) {
      payload.mode = mode;
    }

    console.log('Forwarding to n8n webhook:', N8N_WEBHOOK_URL);

    // Forward request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => "Unknown error");
      console.error('n8n webhook error:', errorText);
      throw new Error(`n8n webhook returned ${n8nResponse.status}: ${errorText}`);
    }

    // Check if response is streaming or JSON
    const contentType = n8nResponse.headers.get("content-type");
    
    if (contentType?.includes("text/event-stream") || contentType?.includes("text/plain")) {
      console.log('Streaming response from n8n');
      // Stream the response directly
      return new Response(n8nResponse.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Parse and return JSON response
      const data = await n8nResponse.json();
      console.log('JSON response from n8n received');
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in n8n_bridge function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: "Failed to communicate with n8n webhook"
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
