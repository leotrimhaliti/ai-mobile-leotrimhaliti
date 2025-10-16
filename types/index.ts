export interface Bus {
  id: string;
  bus_number: string;
  route_name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  created_at: string;
}

export interface BusWithLocation extends Bus {
  location?: BusLocation;
}
