import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = "ur monogdb url";
const DB_NAME = "lifeline";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const bookingId = params.id;

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("ambulance_bookings");

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          assigned: true,
          driver: {
            name: body.driverName,
            ambulanceId: body.ambulanceId,
            location: body.location,
            acceptedAt: new Date().toISOString(),
          },
        },
      }
    );

    await client.close();

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Booking accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting booking:", error);
    return NextResponse.json(
      { error: "Failed to accept booking" },
      { status: 500 }
    );
  }
}
