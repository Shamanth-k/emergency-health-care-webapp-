import { type NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { sendEmail } from "@/app/utils/email";

const MONGODB_URI = "mongodb url";
const DB_NAME = "lifeline";

// Mock email addresses for blood banks and donors
const bloodBankEmails = [
  "naikdhanush81@gmail.com",
  "meghashettyj@gmail.com",
  "sudhamabhat5@gmail.com",
  "shamanthk140@gmail.com",
  "gjsathwikrai@gmail.com",
];

async function sendBloodRequestEmails(requestData: any) {
  console.log("Starting to send blood request emails...");

  const emailContent = {
    subject: `URGENT: Blood Request - ${requestData.bloodGroup} (${requestData.unitsRequired} units)`,
    html: `
      <h2>Emergency Blood Request</h2>
      <p><strong>Blood Group:</strong> ${requestData.bloodGroup}</p>
      <p><strong>Units Required:</strong> ${requestData.unitsRequired}</p>
      <p><strong>Urgency:</strong> ${requestData.urgency.toUpperCase()}</p>
      <p><strong>Hospital:</strong> ${requestData.hospitalName}</p>
      <p><strong>Address:</strong> ${requestData.hospitalAddress}</p>
      <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
      ${
        requestData.additionalNotes
          ? `<p><strong>Notes:</strong> ${requestData.additionalNotes}</p>`
          : ""
      }
      <p>Please contact the hospital immediately if you can fulfill this request.</p>
    `,
  };

  let emailsSent = 0;
  let failedEmails = [];

  for (const email of bloodBankEmails) {
    try {
      console.log(`Attempting to send email to ${email}...`);
      await sendEmail(email, emailContent.subject, emailContent.html);
      console.log(`Successfully sent email to ${email}`);
      emailsSent++;
    } catch (error: any) {
      console.error(`Failed to send email to ${email}:`, {
        error: error.message,
        code: error.code,
      });
      failedEmails.push({ email, error: error.message });
    }
  }

  console.log("Email sending summary:", {
    totalAttempts: bloodBankEmails.length,
    successful: emailsSent,
    failed: failedEmails.length,
    failedEmails,
  });

  return {
    success: true,
    emailsSent,
    failedEmails,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("Received blood request...");
    const body = await request.json();
    console.log("Request body:", body);

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection("blood_requests");

    const bloodRequest = {
      bloodGroup: body.bloodGroup,
      unitsRequired: Number.parseInt(body.unitsRequired),
      urgency: body.urgency,
      hospitalName: body.hospitalName,
      hospitalAddress: body.hospitalAddress,
      contactNumber: body.contactNumber,
      additionalNotes: body.additionalNotes || "",
      location: body.location,
      timestamp: new Date().toISOString(),
      status: "active",
      emailsSent: 0,
    };

    console.log("Saving blood request to database...");
    const result = await collection.insertOne(bloodRequest);
    console.log("Blood request saved with ID:", result.insertedId);

    // Send email notifications
    console.log("Sending email notifications...");
    const emailResult = await sendBloodRequestEmails(bloodRequest);
    console.log("Email sending completed:", emailResult);

    // Update the record with email count
    await collection.updateOne(
      { _id: result.insertedId },
      { $set: { emailsSent: emailResult.emailsSent } }
    );
    console.log("Updated blood request with email count");

    await client.close();
    console.log("MongoDB connection closed");

    return NextResponse.json({
      success: true,
      requestId: result.insertedId,
      emailsSent: emailResult.emailsSent,
      failedEmails: emailResult.failedEmails,
    });
  } catch (error: any) {
    console.error("Error in blood request processing:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: "Failed to create blood request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
