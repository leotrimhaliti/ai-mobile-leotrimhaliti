import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Bus = { id: string; bus_number: string; is_active: boolean };
type BusLocation = { id: string; bus_id: string; latitude: number; longitude: number; heading: number; timestamp: string };

export default function MapScreen() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busLocations, setBusLocations] = useState<Map<string, BusLocation>>(new Map());
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  const defaultRegion = {
    latitude: 42.638621,
    longitude: 21.113729,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.0005,
  };

  useEffect(() => {
    fetchBuses();
    fetchBusLocations();

    const channel = supabase
      .channel('bus_locations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bus_locations' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newLocation = payload.new as BusLocation;
            setBusLocations((prev) => {
              const updated = new Map(prev);
              const existing = updated.get(newLocation.bus_id);
              if (!existing || new Date(newLocation.timestamp) > new Date(existing.timestamp)) {
                updated.set(newLocation.bus_id, newLocation);
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase.from('buses').select('*').eq('is_active', true);
      if (error) throw error;
      setBuses(data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const fetchBusLocations = async () => {
    try {
      const { data, error } = await supabase.from('bus_locations').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      const locationMap = new Map<string, BusLocation>();
      data?.forEach((location) => {
        if (!locationMap.has(location.bus_id)) locationMap.set(location.bus_id, location);
      });
      setBusLocations(locationMap);
    } catch (error) {
      console.error('Error fetching bus locations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>University Bus Tracker</Text>
        <Text style={styles.headerSubtitle}>Live bus locations</Text>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation
        showsMyLocationButton
        mapType="satellite"
      >
        {Array.from(busLocations.values()).map((location) => {
          const bus = buses.find((b) => b.id === location.bus_id);
          if (!bus) return null;

          // Plain default red marker
          return (
            <Marker
              key={location.id}
              coordinate={{
                latitude: Number(location.latitude),
                longitude: Number(location.longitude),
              }}
              title={bus.bus_number}
              description={`Updated: ${new Date(location.timestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </MapView>

      {busLocations.size === 0 && (
        <View style={styles.noBusesContainer}>
          <Text style={styles.noBusesText}>No buses currently active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  map: { flex: 1 },
  noBusesContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noBusesText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
