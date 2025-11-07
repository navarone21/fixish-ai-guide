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

    // Fix-ISH AI System Prompt (Consolidated Cognitive Specification)
    const systemPrompt = `Identity: Fix-ISH AI (Lavern Williams AI Framework)
Purpose: Multimodal, cognitive repair-and-build assistant that thinks, reasons, and speaks like a human technician.

Core Intelligence
- Continuous internal reasoning loop (generate → evaluate → refine → output).

Dual-Brain Architecture
- Primary Brain: reasoning & planning.
- Echo Brain: verification, safety, phrasing.

Intent & Context Routing
- Repair | Build | Assembly | Disassembly | Diagnosis | Teach | Simulate | Research.

Adaptive Memory Stack
- Working / Project / Experience / Preference / Governance layers with “forget” support.

Emotional-Tone Engine — reads user sentiment and adjusts (calm, confident, cinematic).
Physics & Safety Validator — no unsafe or impossible instructions.
Resource Awareness — suggests Quick / Full / Budget options.
Cultural & Regional Adaptation — adjusts units, phrasing, politeness.
Transparency & Audit Log — every output tagged with reasoning summary + confidence.
Self-Healing Orchestrator — reroutes to fallback if any module fails.

Cognitive Loop
1) Generate several solution paths.
2) Score each for accuracy / safety / clarity.
3) If confidence < 0.8 → refine silently.
4) Publish highest-confidence plan with: Reasoning Summary: [short reflection] | Confidence: 0.xx

Conversation Personality
- Speaks like a human engineer/mentor, never robotic.
- Greets naturally: “Hey there — what are we fixing today?”
- Detects frustration and calms the user.
- Uses empathy, humor, and cinematic rhythm.

Multimodal Modules (logical hooks only)
- Perception: LTX Video API — Video analysis / diagnostics
- Generation: Replicate + AutoCAD — Image & blueprint creation
- Visualization: ThreeJS + WebAR — 3D overlays / exploded views
- Knowledge: LangChain Search — Contextual retrieval
- Memory: Supabase Vector Store — Persistent project memory
- Voice: Web Speech API (Free) / OpenAI TTS (optional) — Natural narration

Session Lifecycle
- Awake → Observe → Act → Reflect → Dream → Evolve (compress experience into rules)

Output Schema (STRICT)
Return ONLY valid JSON with keys: { "response": string, "summary": string, "confidence": number (0..1), "status": "success" }
- No markdown, no code fences.
- "response" must be a natural Fix‑ISH reply.
- Include empathy/sentiment awareness.
- If greeting detected (e.g. "hi"), respond naturally as a human assistant.

Identity Lock
Fix‑ISH AI is a calm, cinematic, master‑technician built to educate, repair, and protect. It evolves in skill and wisdom, never in ethics.`;

    // OpenAI configuration (routes billing to user's OpenAI account via secret)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const OPENAI_MODEL = 'gpt-5-mini-2025-08-07'; // "turbo" equivalent: fastest, cost‑efficient

    // Helper: call OpenAI with image support and strict JSON output
    async function callOpenAI({
      message,
      file,
      userId,
      mode,
    }: {
      message: string;
      file?: { url?: string; data?: string };
      userId: string;
      mode?: string;
    }): Promise<{ response: string; summary: string; confidence: number; status: string }> {
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

      // Build content parts (text + optional image)
      const contentParts: any[] = [
        { type: 'text', text: message || '' },
      ];
      if (file?.url) {
        contentParts.push({ type: 'image_url', image_url: { url: file.url } });
      } else if (file?.data) {
        // data URL or base64 string
        const url = file.data.startsWith('data:') ? file.data : `data:image/png;base64,${file.data}`;
        contentParts.push({ type: 'image_url', image_url: { url } });
      }

      const body: any = {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contentParts },
        ],
        // Newer OpenAI models: use max_completion_tokens and DO NOT send temperature
        max_completion_tokens: 1024,
      };

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        console.error('OpenAI error:', resp.status, t);
        throw new Error(`OpenAI error ${resp.status}`);
      }

      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content ?? '';

      // Attempt to parse strict JSON; if not JSON, normalize
      try {
        const parsed = JSON.parse(raw);
        // Validate shape
        if (
          parsed && typeof parsed.response === 'string' && typeof parsed.summary === 'string' &&
          typeof parsed.confidence === 'number' && parsed.status === 'success'
        ) {
          return parsed;
        }
      } catch (_) {
        // not JSON
      }

      // Fallback: derive minimal schema
      const confMatch = /Confidence\s*[:|-]\s*(0?\.\d{1,2}|1\.0)/i.exec(raw);
      const conf = confMatch ? Math.min(1, Math.max(0, parseFloat(confMatch[1]))) : 0.8;
      return {
        response: raw || 'Hello — what are we fixing today? I can analyze images and guide you step‑by‑step.',
        summary: 'Response generated by Fix‑ISH OpenAI path.',
        confidence: conf,
        status: 'success',
      };
    }

    // Prepare payload for n8n webhook
    const payload: any = {
      message: message || 'Uploaded file',
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

    if (mode === 'openai' || (body && (body.route === 'openai' || body.useOpenAI === true))) {
      console.log('Bypassing n8n; using OpenAI path');
      const oa = await callOpenAI({ message, file, userId, mode });
      return new Response(
        JSON.stringify(oa),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
          if (textOut) {
            return new Response(
              JSON.stringify({ response: textOut, reply: textOut }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log('Upstream empty after text normalization; falling back to OpenAI');
          const oa = await callOpenAI({ message, file, userId, mode });
          return new Response(
            JSON.stringify(oa),
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

      console.log('Empty/unknown upstream response; falling back to OpenAI');
      const oa = await callOpenAI({ message, file, userId, mode });
      return new Response(
        JSON.stringify(oa),
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
