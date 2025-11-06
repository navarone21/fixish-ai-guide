import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemePreferences {
  theme_mode: 'light' | 'dark' | 'system';
  accent_color: string;
  brightness: number;
  background_style: string;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  theme_mode: 'dark',
  accent_color: '#00C2B2',
  brightness: 100,
  background_style: 'default',
};

export const useThemePreferences = (userId: string | null) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    if (!userId) {
      // Load from localStorage if no user
      const stored = localStorage.getItem('theme_preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing theme preferences:', e);
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
      });

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is ok
        throw error;
      }

      if (data) {
        setPreferences({
          theme_mode: data.theme_mode as any,
          accent_color: data.accent_color,
          brightness: data.brightness,
          background_style: data.background_style,
        });
      }
    } catch (err) {
      console.error('Error loading theme preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<ThemePreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    // Save to localStorage
    localStorage.setItem('theme_preferences', JSON.stringify(updated));

    // Save to database if user is logged in
    if (userId) {
      try {
        await supabase.rpc('set_config', {
          setting: 'app.user_id',
          value: userId
        });

        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            ...updated,
          });

        if (error) throw error;
      } catch (err) {
        console.error('Error saving theme preferences:', err);
      }
    }
  };

  const detectSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (preferences.theme_mode === 'system') {
      return detectSystemTheme();
    }
    return preferences.theme_mode;
  };

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferences.theme_mode === 'system') {
        // Trigger re-render
        setPreferences(prev => ({ ...prev }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme_mode]);

  return {
    preferences,
    loading,
    savePreferences,
    getEffectiveTheme,
    detectSystemTheme,
  };
};
