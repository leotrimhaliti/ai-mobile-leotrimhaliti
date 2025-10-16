import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useBusLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('bus_locations')
        .select('*, buses(bus_number)')
        .order('timestamp', { ascending: false });

      if (!error && data) setLocations(data);
      setLoading(false);
    };

    fetchLocations();

    const subscription = supabase
      .channel('public:bus_locations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bus_locations' },
        payload => {
          setLocations(prev => {
            const idx = prev.findIndex(l => l.id === payload.new.id);
            if (idx >= 0) prev[idx] = payload.new;
            else prev.unshift(payload.new);
            return [...prev];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return { locations, loading };
}
