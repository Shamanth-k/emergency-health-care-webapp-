import { type NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongo db url";
const DB_NAME = "lifeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("ambulance_bookings");

    const booking = {
      name: body.name,
      phone: body.phone,
      emergency: body.emergency,
      location: body.location,
      destination: body.destination || "",
      details: body.details || "",
      timestamp: new Date().toISOString(),
      assigned: false,
      driver: null,
    };

    const result = await collection.insertOne(booking);

    await client.close();

    return NextResponse.json({
      success: true,
      bookingId: result.insertedId,
    });
  } catch (error) {
    console.error("Error booking ambulance:", error);
    return NextResponse.json(
      { error: "Failed to book ambulance" },
      { status: 500 }
    );
  }
}
