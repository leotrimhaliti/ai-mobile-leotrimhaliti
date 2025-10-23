import dotenv from 'dotenv';
import { resolve } from 'path';

// Fix: Change resolve(process.cwd(), '.env') to look in the parent directory
dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

import { createClient } from '@supabase/supabase-js';

console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anon key missing. Check your .env file!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client created successfully');



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
];

let currentIndex = 0;

async function updateBusLocation() {
  const { data: buses } = await supabase
    .from('buses')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  if (buses) {
    currentIndex = (currentIndex + 1) % ROUTE_COORDINATES.length;

    await supabase
      .from('buses')
      .update({
        current_location: ROUTE_COORDINATES[currentIndex],
        last_updated: new Date().toISOString(),
      })
      .eq('id', buses.id);

    console.log(`Updated bus location to index ${currentIndex}`);
  }
}

setInterval(updateBusLocation, 5000);

console.log('Bus simulator started. Press Ctrl+C to stop.');
