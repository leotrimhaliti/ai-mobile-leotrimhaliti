"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, Animated, TouchableOpacity } from "react-native"
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { ROUTE_COORDINATES } from "@/constants/RouteCoordinates"

const { width, height } = Dimensions.get("window")

interface Bus {
  id: string
  bus_number: string
  current_location: { latitude: number; longitude: number }
  route_id: string | null
}

interface Route {
  id: string
  name: string
  description: string
  polyline: Array<{ latitude: number; longitude: number }>
  color: string
}

export default function TrackingScreen() {
  const [bus, setBus] = useState<Bus | null>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [pastLocations, setPastLocations] = useState<Array<{ latitude: number; longitude: number }>>([])
  const slideAnim = useRef(new Animated.Value(300)).current
  const mapRef = useRef<MapView>(null)
  const { session } = useAuth()
  const hasInitialFocus = useRef(false)

  // AnimatedRegion për lëvizje smooth
  const busLocation = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    })
  ).current

  // Load bus + route
  const loadBusData = async () => {
    const { data: routeData } = await supabase.from("routes").select("*").maybeSingle()
    if (routeData) setRoute(routeData)
    else setRoute(null)

    const { data: busData } = await supabase.from("buses").select("*").eq("status", "active").maybeSingle()
    console.log("Bus data from Supabase:", busData)

    if (busData) updateBusLocation(busData)
    else setBus(null)
  }

  // Update bus location
  const updateBusLocation = (newBus: Bus) => {
    let location = newBus.current_location
    if (typeof location === "string") location = JSON.parse(location)

    // Vendos bus në state
    setBus({ ...newBus, current_location: location })

    if (location && mapRef.current) {
      setPastLocations((prev) => [...prev, location])

      // AnimatedRegion lëviz smooth
      busLocation.timing({
        latitude: location.latitude,
        longitude: location.longitude,
        duration: 1000,
        useNativeDriver: false,
      }).start()

      // Animate camera për të fokusuar
      mapRef.current.animateCamera({ center: location, zoom: 17 }, { duration: 1000 })
    }
  }

  // Fetch initial data + subscribe to live updates
  useEffect(() => {
    loadBusData()

    const channel = supabase
      .channel("bus-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "buses" }, (payload) => {
        updateBusLocation(payload.new as Bus)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Animate bottom sheet
  useEffect(() => {
    if (bus) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()
    }
  }, [bus])

  // Focus map initially on bus
  useEffect(() => {
    if (bus && mapRef.current && !hasInitialFocus.current) {
      hasInitialFocus.current = true
      mapRef.current.animateCamera({ center: bus.current_location, zoom: 17 }, { duration: 1000 })

      // Vendos koordinatat e AnimatedRegion në fillim
      busLocation.setValue({
        latitude: bus.current_location.latitude,
        longitude: bus.current_location.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      })
    }
  }, [bus])

  const focusOnBus = () => {
    if (bus && mapRef.current) {
      mapRef.current.animateCamera({ center: bus.current_location, zoom: 17 }, { duration: 500 })
    }
  }

  if (!bus || !route) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType="hybrid"
        showsUserLocation={false}
        scrollEnabled
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false}
        initialRegion={{
          latitude: bus.current_location.latitude,
          longitude: bus.current_location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* Polyline për rrugën */}
        <Polyline
          coordinates={ROUTE_COORDINATES.map((coord) => ({ latitude: coord.latitude, longitude: coord.longitude }))}
          strokeColor={`${route.color}55`}
          strokeWidth={4}
        />

        {/* Polyline historiku i autobusit */}
        <Polyline coordinates={pastLocations} strokeColor="#3498db" strokeWidth={4} />

        {/* Marker i autobusit */}
        {bus && bus.current_location.latitude && (
          <Marker.Animated coordinate={busLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <Image source={require("../../assets/images/busloc.png")} style={{ width: 50, height: 50 }} resizeMode="contain" />
          </Marker.Animated>
        )}

        {/* Marker për stacionet */}
        {ROUTE_COORDINATES.filter((c) => c.name).map((stop, index) => (
          <Marker key={index} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.name}>
            <Image source={require("../../assets/images/bus-stop.png")} style={{ width: 40, height: 40 }} resizeMode="contain" />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={focusOnBus} activeOpacity={0.8}>
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Orari i Autobusave</Text>
        </View>

        <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
          {["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30"].map((time, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleText}>{time}</Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { width, height },
  recenterButton: {
    position: "absolute",
    bottom: 220,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterIcon: { fontSize: 24 },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHeader: { marginBottom: 8, alignItems: "center" },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: "#c62829" },
  scheduleContainer: { flex: 1 },
  scheduleItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  scheduleText: { fontSize: 16, color: "#333" },
})
