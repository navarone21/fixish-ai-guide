import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, conversationId, userId, title, messages, message } = await req.json();

    console.log('Conversations function called:', { action, conversationId, userId });

    // Set user context for RLS
    if (userId) {
      await supabase.rpc('set_user_context', { p_user_id: userId });
    }

    switch (action) {
      case 'create': {
        // Create new conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            title: title || 'New Repair Session',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (convError) throw convError;

        // Insert initial messages if provided
        if (messages && messages.length > 0) {
          const messagesToInsert = messages.map((msg: any) => ({
            conversation_id: conversation.id,
            role: msg.role,
            content: msg.content,
            files: msg.media ? [msg.media] : [],
            created_at: msg.timestamp || new Date().toISOString(),
          }));

          const { error: msgError } = await supabase
            .from('messages')
            .insert(messagesToInsert);

          if (msgError) throw msgError;
        }

        console.log('Created conversation:', conversation.id);

        return new Response(
          JSON.stringify({ success: true, conversation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add_message': {
        // Add message to existing conversation
        const { data: msg, error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: message.role,
            content: message.content,
            files: message.media ? [message.media] : [],
            created_at: message.timestamp || new Date().toISOString(),
          })
          .select()
          .single();

        if (msgError) throw msgError;

        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        console.log('Added message to conversation:', conversationId);

        return new Response(
          JSON.stringify({ success: true, message: msg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        // List all conversations for user
        const { data: conversations, error: listError } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false });

        if (listError) throw listError;

        console.log('Listed conversations:', conversations.length);

        return new Response(
          JSON.stringify({ success: true, conversations }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        // Get conversation with messages
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;

        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        console.log('Retrieved conversation:', conversationId, 'with', messages.length, 'messages');

        return new Response(
          JSON.stringify({ success: true, conversation, messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        // Delete conversation (messages cascade)
        const { error: deleteError } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);

        if (deleteError) throw deleteError;

        console.log('Deleted conversation:', conversationId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Conversations function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
