import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { solution_id, event_type } = await req.json();
    
    if (!solution_id || !event_type) {
      return new Response(
        JSON.stringify({ error: "Missing parameters: solution_id and event_type required" }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    if (!['view', 'click'].includes(event_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_type. Must be 'view' or 'click'" }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const ip = req.headers.get("x-real-ip") || 
               req.headers.get("x-forwarded-for") || 
               "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { error } = await supabase
      .from("ia_solution_analytics")
      .insert({
        solution_id,
        event_type,
        ip_address: ip,
        user_agent: userAgent,
      });

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    console.log(`📊 Logged ${event_type} event for solution ${solution_id}`);

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in log-ia-event:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
