import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Menu, Phone } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface Bus {
  id: string;
  bus_number: string;
  driver_name: string;
  current_location: { latitude: number; longitude: number };
  route_id: string;
}

interface Route {
  id: string;
  name: string;
  description: string;
  polyline: Array<{ latitude: number; longitude: number }>;
  color: string;
}

const ROUTE_COORDINATES = [
  { latitude: 42.6387694, longitude: 21.1137539 },
  { latitude: 42.6388641, longitude: 21.1136037 },
  { latitude: 42.6388543, longitude: 21.1130834 },
  { latitude: 42.6391936, longitude: 21.1129037 },
  { latitude: 42.6395567, longitude: 21.1127105 },
  { latitude: 42.6401526, longitude: 21.1123779 },
  { latitude: 42.6409004, longitude: 21.1119837 },
  { latitude: 42.6414094, longitude: 21.1116832 },
  { latitude: 42.6426485, longitude: 21.1109591 },
  { latitude: 42.6437534, longitude: 21.1147892 },
  { latitude: 42.6456158, longitude: 21.1214089 },
  { latitude: 42.6461604, longitude: 21.1235762 },
  { latitude: 42.6478807, longitude: 21.1296916 },
  { latitude: 42.6499482, longitude: 21.1376524 },
  { latitude: 42.6501563, longitude: 21.1383297 },
  { latitude: 42.6501662, longitude: 21.1384504 },
  { latitude: 42.6501672, longitude: 21.1386140 },
  { latitude: 42.6502520, longitude: 21.1386958 },
  { latitude: 42.6503960, longitude: 21.1392309 },
  { latitude: 42.6508715, longitude: 21.1408979 },
  { latitude: 42.6511664, longitude: 21.1419466 },
  { latitude: 42.6513311, longitude: 21.1425300 },
  { latitude: 42.6515422, longitude: 21.1434312 },
  { latitude: 42.6517089, longitude: 21.1442077 },
  { latitude: 42.6517454, longitude: 21.1445805 },
  { latitude: 42.6517414, longitude: 21.1452699 },
  { latitude: 42.6516694, longitude: 21.1463991 },
  { latitude: 42.6515156, longitude: 21.1473794 },
  { latitude: 42.6513577, longitude: 21.1477523 },
  { latitude: 42.6501889, longitude: 21.1501086 },
  { latitude: 42.6492380, longitude: 21.1519003 },
  { latitude: 42.6483423, longitude: 21.1534560 },
  { latitude: 42.6478965, longitude: 21.1540192 },
  { latitude: 42.6474467, longitude: 21.1545342 },
  { latitude: 42.6471941, longitude: 21.1547810 },
  { latitude: 42.6469179, longitude: 21.1548963 },
  { latitude: 42.6467719, longitude: 21.1549419 },
  { latitude: 42.6466615, longitude: 21.1549848 },
  { latitude: 42.6463537, longitude: 21.1550331 },
  { latitude: 42.6461801, longitude: 21.1553121 },
  { latitude: 42.6462353, longitude: 21.1557680 },
  { latitude: 42.6464149, longitude: 21.1559223 },
  { latitude: 42.6466447, longitude: 21.1559732 },
  { latitude: 42.6468489, longitude: 21.1561449 },
  { latitude: 42.6471961, longitude: 21.1568007 },
  { latitude: 42.6472464, longitude: 21.1570783 },
  { latitude: 42.6471458, longitude: 21.1574605 },
  { latitude: 42.6471991, longitude: 21.1577475 },
  { latitude: 42.6474802, longitude: 21.1579017 },
  { latitude: 42.6476607, longitude: 21.1577649 },
  { latitude: 42.6477456, longitude: 21.1575222 },
  { latitude: 42.6477140, longitude: 21.1572634 },
  { latitude: 42.6476282, longitude: 21.1571373 },
  { latitude: 42.6475059, longitude: 21.1570783 },
  { latitude: 42.6473184, longitude: 21.1571024 },
  { latitude: 42.6472356, longitude: 21.1571816 },
  { latitude: 42.6471537, longitude: 21.1573492 },
  { latitude: 42.6471557, longitude: 21.1576469 },
  { latitude: 42.6472297, longitude: 21.1577931 },
  { latitude: 42.6473461, longitude: 21.1578736 },
  { latitude: 42.6475157, longitude: 21.1578789 },
  { latitude: 42.6476765, longitude: 21.1577636 },
  { latitude: 42.6478373, longitude: 21.1577113 },
  { latitude: 42.6480346, longitude: 21.1577542 },
  { latitude: 42.6485436, longitude: 21.1578950 },
  { latitude: 42.6530415, longitude: 21.1590886 },
  { latitude: 42.6544854, longitude: 21.1594507 },
  { latitude: 42.6555132, longitude: 21.1597243 },
  { latitude: 42.6555950, longitude: 21.1597075 },
  { latitude: 42.6556522, longitude: 21.1594487 },
  { latitude: 42.6557341, longitude: 21.1587292 },
  { latitude: 42.6557420, longitude: 21.1580828 },
  { latitude: 42.6556848, longitude: 21.1576295 },
  { latitude: 42.6554875, longitude: 21.1569643 },
  { latitude: 42.6552035, longitude: 21.1558726 },
  { latitude: 42.6549924, longitude: 21.1551619 },
  { latitude: 42.6546788, longitude: 21.1540541 },
  { latitude: 42.6541718, longitude: 21.1522195 },
  { latitude: 42.6534005, longitude: 21.1494514 },
  { latitude: 42.6526962, longitude: 21.1466029 },
  { latitude: 42.6522267, longitude: 21.1449024 },
  { latitude: 42.6521991, longitude: 21.1449373 },
  { latitude: 42.6517138, longitude: 21.1432260 },
  { latitude: 42.6512522, longitude: 21.1417991 },
  { latitude: 42.6506821, longitude: 21.1397874 },
  { latitude: 42.6505854, longitude: 21.1395970 },
  { latitude: 42.6503684, longitude: 21.1386690 },
  { latitude: 42.6503842, longitude: 21.1385027 },
  { latitude: 42.6503290, longitude: 21.1383605 },
  { latitude: 42.6502737, longitude: 21.1382666 },
  { latitude: 42.6497549, longitude: 21.1363301 },
  { latitude: 42.6492656, longitude: 21.1344847 },
  { latitude: 42.6468232, longitude: 21.1252177 },
  { latitude: 42.6464089, longitude: 21.1236405 },
  { latitude: 42.6464050, longitude: 21.1231685 },
  { latitude: 42.6463182, longitude: 21.1228520 },
  { latitude: 42.6461406, longitude: 21.1226910 },
  { latitude: 42.6453554, longitude: 21.1199445 },
  { latitude: 42.6440296, longitude: 21.1151648 },
  { latitude: 42.6436212, longitude: 21.1136734 },
  { latitude: 42.6430569, longitude: 21.1118683 },
  { latitude: 42.6427659, longitude: 21.1109363 },
  { latitude: 42.6426159, longitude: 21.1110020 },
  { latitude: 42.6421986, longitude: 21.1112380 },
  { latitude: 42.6414282, longitude: 21.1116859 },
  { latitude: 42.6411223, longitude: 21.1118616 },
  { latitude: 42.6408949, longitude: 21.1119984 },
  { latitude: 42.6406301, longitude: 21.1121446 },
  { latitude: 42.6404091, longitude: 21.1122559 },
  { latitude: 42.6400500, longitude: 21.1124477 },
  { latitude: 42.6394866, longitude: 21.1127561 },
  { latitude: 42.6392504, longitude: 21.1128835 },
];

export default function TrackingScreen() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const { session } = useAuth();

  useEffect(() => {
    loadBusData();

    const channel = supabase
      .channel('bus-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'buses',
        },
        (payload) => {
          setBus(payload.new as Bus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (bus) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [bus]);

  const loadBusData = async () => {
    const { data: routes } = await supabase
      .from('routes')
      .select('*')
      .maybeSingle();

    if (routes) {
      setRoute(routes);
    } else {
      await supabase.from('routes').insert({
        name: '07',
        description: '213 Millbrook Road - Pick Up Trip',
        polyline: ROUTE_COORDINATES,
        color: '#E74C3C',
      });

      const { data: newRoute } = await supabase
        .from('routes')
        .select('*')
        .maybeSingle();

      if (newRoute) {
        setRoute(newRoute);
      }
    }

    const { data: buses } = await supabase
      .from('buses')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (buses) {
      setBus(buses);
    } else {
      const middleIndex = Math.floor(ROUTE_COORDINATES.length / 2);
      await supabase.from('buses').insert({
        bus_number: 'Bus - 07',
        driver_name: 'Marvin Waters',
        current_location: ROUTE_COORDINATES[middleIndex],
        status: 'active',
        route_id: routes?.id,
      });

      const { data: newBus } = await supabase
        .from('buses')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (newBus) {
        setBus(newBus);
      }
    }
  };

  const calculateETA = () => {
    return '10 min away';
  };

  if (!bus || !route) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: ROUTE_COORDINATES[50].latitude,
          longitude: ROUTE_COORDINATES[50].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Polyline
          coordinates={ROUTE_COORDINATES}
          strokeColor={route.color}
          strokeWidth={4}
        />

        {bus.current_location && (
          <Marker
            coordinate={bus.current_location}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.busMarker}>
              <View style={styles.busIcon}>
                <Text style={styles.busEmoji}>🚌</Text>
              </View>
            </View>
          </Marker>
        )}

        <Marker
          coordinate={ROUTE_COORDINATES[0]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.pinCircle} />
            <View style={styles.pinTriangle} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ronald's{'\n'}School Bus</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.etaContainer}>
        <Text style={styles.etaText}>{calculateETA()}</Text>
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.sheetContent}>
          <View style={styles.busInfo}>
            <View style={styles.busIconSmall}>
              <Text style={styles.busEmojiSmall}>🚌</Text>
            </View>
            <View style={styles.busDetails}>
              <Text style={styles.busAddress}>{route.description}</Text>
              <Text style={styles.busNumber}>{bus.bus_number}</Text>
              <Text style={styles.busDistance}>2.3 km away 2536 Graythorne Lakes</Text>
            </View>
          </View>

          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverLabel}>Driver name</Text>
              <Text style={styles.driverName}>{bus.driver_name}</Text>
            </View>
            <TouchableOpacity style={styles.phoneButton}>
              <Phone size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    lineHeight: 24,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  busEmoji: {
    fontSize: 24,
  },
  destinationMarker: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
    marginTop: -2,
  },
  etaContainer: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.3,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#505050',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetContent: {
    padding: 20,
  },
  busInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  busIconSmall: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  busEmojiSmall: {
    fontSize: 28,
  },
  busDetails: {
    flex: 1,
  },
  busAddress: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  busDistance: {
    fontSize: 12,
    color: '#ccc',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  driverDetails: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  phoneButton: {
    width: 44,
    height: 44,
    backgroundColor: '#4A90E2',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
