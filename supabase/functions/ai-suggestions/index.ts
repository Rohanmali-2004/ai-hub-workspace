import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tools, categories, recentlyUsed } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toolsList = tools.map((t: { name: string; url: string; tags?: string[] }) => 
      `- ${t.name} (${t.url})${t.tags?.length ? ` [${t.tags.join(', ')}]` : ''}`
    ).join('\n');

    const categoriesList = categories.map((c: { name: string }) => c.name).join(', ');
    const recentList = recentlyUsed?.slice(0, 5).join(', ') || 'None';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for INTELYX, a personal AI workspace for tech professionals. 
Analyze the user's existing tools and suggest 3 new AI tools they might find useful.

Current tools:
${toolsList || 'No tools yet'}

Categories: ${categoriesList || 'None'}
Recently used: ${recentList}

Suggest 3 AI tools that would complement their workflow. Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "Tool Name",
    "url": "https://example.com",
    "description": "Brief description under 100 chars",
    "icon": "🔧",
    "tags": ["tag1", "tag2"],
    "reason": "Why this fits their workflow"
  }
]

Focus on popular, real AI tools. Consider gaps in their current toolkit.`
          },
          {
            role: "user",
            content: "Suggest 3 AI tools for my workspace based on my current setup."
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON from the response
    let suggestions;
    try {
      // Extract JSON array from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse AI response:", content);
      suggestions = [];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-suggestions:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
