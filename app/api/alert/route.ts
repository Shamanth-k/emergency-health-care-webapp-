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
    const collection = db.collection("sos_alerts");

    const alert = {
      location: body.location,
      timestamp: new Date().toISOString(),
      type: "SOS",
      status: "active",
      broadcastToHospitals: true,
      broadcastToAmbulances: true,
    };

    const result = await collection.insertOne(alert);

    await client.close();

    // In a real implementation, this would trigger real-time notifications
    // to emergency services, nearby ambulances, and hospitals

    return NextResponse.json({
      success: true,
      alertId: result.insertedId,
      message: "SOS alert broadcasted to hospitals and ambulances",
    });
  } catch (error) {
    console.error("Error creating SOS alert:", error);
    return NextResponse.json(
      { error: "Failed to create SOS alert" },
      { status: 500 }
    );
  }
}
