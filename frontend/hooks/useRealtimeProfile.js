import { useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

/**
 * Custom hook to subscribe to real-time profile updates
 * @param {string} userId - The user ID to subscribe to
 * @param {function} onUpdate - Callback function when profile is updated
 */
export const useRealtimeProfile = (userId, onUpdate) => {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('Profile updated:', payload.new);
          onUpdate(payload.new);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
};
