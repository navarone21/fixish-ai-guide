-- Create conversations table for chat history
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for conversation content
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create glossary table for technical terms
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category TEXT NOT NULL,
  examples TEXT[],
  related_terms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user preferences table for theme customization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark', 'system')),
  accent_color TEXT DEFAULT '#00C2B2',
  brightness INTEGER DEFAULT 100 CHECK (brightness >= 0 AND brightness <= 150),
  background_style TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_glossary_term ON public.glossary_terms(term);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON public.glossary_terms(category);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations (user-specific)
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- RLS Policies for messages (via conversations)
CREATE POLICY "Users can view messages from their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "Users can delete messages from their conversations"
  ON public.messages FOR DELETE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = current_setting('app.user_id', true)
    )
  );

-- RLS Policies for glossary (public read, no write)
CREATE POLICY "Anyone can view glossary terms"
  ON public.glossary_terms FOR SELECT
  USING (true);

-- RLS Policies for user preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_glossary_updated_at
  BEFORE UPDATE ON public.glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial glossary terms
INSERT INTO public.glossary_terms (term, definition, category, examples, related_terms) VALUES
  ('Torque', 'A measure of the rotational force applied to an object, typically measured in Newton-meters (Nm) or foot-pounds (ft-lb).', 'Automotive', ARRAY['Tighten the bolt to 85 Nm torque', 'Check wheel lug nut torque'], ARRAY['Force', 'Tension', 'Wrench']),
  ('PCB', 'Printed Circuit Board - a board that connects electronic components using conductive tracks, pads, and features etched from copper sheets.', 'Electronics', ARRAY['Solder components onto the PCB', 'Check for PCB traces'], ARRAY['Circuit', 'Solder', 'Trace']),
  ('Gasket', 'A mechanical seal that fills the space between two mating surfaces to prevent leakage.', 'Automotive', ARRAY['Replace the head gasket', 'Check gasket for cracks'], ARRAY['Seal', 'O-ring', 'Compression']),
  ('Resistor', 'An electronic component that limits or regulates the flow of electrical current in a circuit.', 'Electronics', ARRAY['Use a 10kΩ resistor', 'Test resistor with multimeter'], ARRAY['Capacitor', 'Ohm', 'Circuit']),
  ('Capacitor', 'An electronic component that stores electrical energy in an electric field.', 'Electronics', ARRAY['Replace the electrolytic capacitor', 'Test capacitor charge'], ARRAY['Resistor', 'Voltage', 'Farad']),
  ('Multimeter', 'A measuring instrument that combines several measurement functions including voltage, current, and resistance.', 'Tools', ARRAY['Measure voltage with multimeter', 'Set multimeter to ohm mode'], ARRAY['Voltage', 'Current', 'Resistance']),
  ('Soldering', 'The process of joining metal parts together using a filler metal (solder) that melts at a lower temperature.', 'Electronics', ARRAY['Solder the wire connections', 'Use flux when soldering'], ARRAY['Flux', 'Iron', 'Tin']),
  ('Compression', 'The amount of pressure or force applied to compress materials or gases, often measured in PSI.', 'Automotive', ARRAY['Check engine compression', 'Test compression ratio'], ARRAY['Pressure', 'PSI', 'Cylinder']),
  ('Voltage', 'The electrical potential difference between two points, measured in volts (V).', 'Electronics', ARRAY['Measure voltage across terminals', 'Supply 12V voltage'], ARRAY['Current', 'Amp', 'Watt']),
  ('Thermostat', 'A device that automatically regulates temperature by switching heating or cooling devices on or off.', 'Appliances', ARRAY['Replace faulty thermostat', 'Calibrate thermostat setting'], ARRAY['Temperature', 'HVAC', 'Sensor'])
ON CONFLICT (term) DO NOTHING;