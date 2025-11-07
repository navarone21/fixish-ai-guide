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
    const contentType = n8nResponse.headers.get("content-type") || "";

    try {
      const isSSE = contentType.includes("text/event-stream");
      const isText = contentType.includes("text/plain");

      if (isSSE || isText) {
        console.log('Non-JSON upstream (SSE/text), buffering and normalizing to JSON');
        const raw = await n8nResponse.text();
        let combined = "";
        for (let rawLine of raw.split("\n")) {
          let line = rawLine.trim();
          if (!line) continue;
          if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") break;
            try {
              const parsed = JSON.parse(payload);
              const c = parsed.choices?.[0]?.delta?.content
                ?? parsed.choices?.[0]?.message?.content
                ?? parsed.content
                ?? parsed.text;
              if (c) combined += c;
            } catch {
              combined += payload + "\n";
            }
          }
        }
        if (!combined.trim()) combined = raw.trim();
        return new Response(
          JSON.stringify({ response: combined, reply: combined }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // JSON or unknown content-type: try JSON first, then fallback to text normalization
      let data: any = null;
      try {
        data = await n8nResponse.clone().json();
      } catch {
        const raw = await n8nResponse.text();
        if (raw) {
          let combined = "";
          for (let rawLine of raw.split("\n")) {
            let line = rawLine.trim();
            if (!line) continue;
            if (line.startsWith("data:")) {
              const payload = line.slice(5).trim();
              if (payload === "[DONE]") break;
              try {
                const parsed = JSON.parse(payload);
                const c = parsed.choices?.[0]?.delta?.content
                  ?? parsed.choices?.[0]?.message?.content
                  ?? parsed.content
                  ?? parsed.text;
                if (c) combined += c;
              } catch {
                combined += payload + "\n";
              }
            }
          }
          const textOut = combined.trim() || raw.trim() || "";
          return new Response(
            JSON.stringify({ response: textOut, reply: textOut }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ response: "", reply: "", error: "Empty response from upstream" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const textOut = data?.response ?? data?.reply ?? data?.message ?? data?.text ?? data?.content ?? (typeof data === 'string' ? data : "");
      if (textOut) {
        return new Response(
          JSON.stringify({ response: textOut, reply: textOut }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fallback: echo upstream object as JSON string to maintain shape
      return new Response(
        JSON.stringify({ response: JSON.stringify(data), reply: JSON.stringify(data) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error('n8n response handling error:', e);
      const raw = await n8nResponse.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: 'Failed to parse upstream response', details: e instanceof Error ? e.message : String(e), upstream: raw?.slice(0, 2000) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
