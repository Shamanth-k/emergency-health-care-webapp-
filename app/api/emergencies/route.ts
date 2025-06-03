import { type NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb url";
const DB_NAME = "lifeline";

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get("lat") || "0");
    const lng = Number.parseFloat(searchParams.get("lng") || "0");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("ambulance_bookings");

    // Get all unassigned bookings
    const bookings = await collection.find({ assigned: false }).toArray();

    // Filter bookings within 10km radius
    const nearbyBookings = bookings
      .filter((booking) => {
        if (
          !booking.location ||
          !booking.location.lat ||
          !booking.location.lng
        ) {
          return false;
        }

        const distance = calculateDistance(
          lat,
          lng,
          booking.location.lat,
          booking.location.lng
        );

        return distance <= 10; // 10km radius
      })
      .map((booking) => ({
        ...booking,
        distance: calculateDistance(
          lat,
          lng,
          booking.location.lat,
          booking.location.lng
        ),
      }));

    // Sort by distance (closest first)
    nearbyBookings.sort((a, b) => a.distance - b.distance);

    await client.close();

    return NextResponse.json(nearbyBookings);
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergencies" },
      { status: 500 }
    );
  }
}
