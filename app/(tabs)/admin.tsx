import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MapPin, Navigation } from 'lucide-react-native';

type Bus = {
  id: string;
  bus_number: string;
  is_active: boolean;
};

type BusLocation = {
  bus_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
};

export default function AdminScreen() {
  const { profile } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [location, setLocation] = useState<BusLocation>({
    bus_id: '',
    latitude: 41.3275,
    longitude: 19.8187,
    heading: 0,
    speed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchBuses();
    }
  }, [profile]);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('buses').select('*').order('bus_number');

      if (error) throw error;
      setBuses(data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBus(busId);
    setLocation((prev) => ({ ...prev, bus_id: busId }));
  };

  const handleUpdateLocation = async () => {
    if (!selectedBus) {
      if (Platform.OS === 'web') {
        alert('Please select a bus first');
      }
      return;
    }

    if (!location.latitude || !location.longitude) {
      if (Platform.OS === 'web') {
        alert('Please enter valid coordinates');
      }
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.from('bus_locations').insert({
        bus_id: selectedBus,
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      if (Platform.OS === 'web') {
        alert('Location updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!profile?.is_admin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>You don't have admin access</Text>
          <Text style={styles.noAccessSubtext}>Contact your administrator for access</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Update bus locations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Bus</Text>
          <View style={styles.busGrid}>
            {buses.map((bus) => (
              <TouchableOpacity
                key={bus.id}
                style={[styles.busCard, selectedBus === bus.id && styles.busCardSelected]}
                onPress={() => handleSelectBus(bus.id)}
              >
                <Text style={[styles.busNumber, selectedBus === bus.id && styles.busNumberSelected]}>
                  {bus.bus_number}
                </Text>
                <View style={[styles.statusBadge, bus.is_active ? styles.statusActive : styles.statusInactive]}>
                  <Text style={styles.statusText}>{bus.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Latitude</Text>
            </View>
            <TextInput
              style={styles.input}
              value={String(location.latitude)}
              onChangeText={(text) => setLocation((prev) => ({ ...prev, latitude: Number(text) }))}
              keyboardType="numeric"
              placeholder="41.3275"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Longitude</Text>
            </View>
            <TextInput
              style={styles.input}
              value={String(location.longitude)}
              onChangeText={(text) => setLocation((prev) => ({ ...prev, longitude: Number(text) }))}
              keyboardType="numeric"
              placeholder="19.8187"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Navigation size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Heading (degrees)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={String(location.heading)}
              onChangeText={(text) => setLocation((prev) => ({ ...prev, heading: Number(text) }))}
              keyboardType="numeric"
              placeholder="0-360"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Navigation size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Speed (km/h)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={String(location.speed)}
              onChangeText={(text) => setLocation((prev) => ({ ...prev, speed: Number(text) }))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, updating && styles.updateButtonDisabled]}
            onPress={handleUpdateLocation}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MapPin size={20} color="#fff" />
                <Text style={styles.updateButtonText}>Update Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to use:</Text>
          <Text style={styles.infoText}>1. Select a bus from the list</Text>
          <Text style={styles.infoText}>2. Enter the current GPS coordinates</Text>
          <Text style={styles.infoText}>3. Set the heading direction and speed</Text>
          <Text style={styles.infoText}>4. Click "Update Location" to publish</Text>
          <Text style={styles.infoNote}>Updates will appear in real-time on the map</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  busGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  busCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  busCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  busNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  busNumberSelected: {
    color: '#3B82F6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoNote: {
    fontSize: 12,
    color: '#60A5FA',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
