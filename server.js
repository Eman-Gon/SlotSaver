const express = require("express");
const cors = require("cors");
const db = require("./data/mockDatabase");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// VAPI WEBHOOK ENDPOINT
// This is where Vapi sends tool call requests
// ============================================
app.post("/vapi/webhook", (req, res) => {
  const { message } = req.body;

  console.log("\n📞 Vapi webhook received:", message?.type);

  // Handle tool calls (function-call event)
  if (message?.type === "tool-calls") {
    const toolCalls = message.toolCallList || [];
    const results = [];

    for (const toolCall of toolCalls) {
      const { id: toolCallId, function: fn } = toolCall;
      const fnName = fn?.name;
      const args = fn?.arguments ? JSON.parse(fn.arguments) : {};

      console.log(`  🔧 Tool: ${fnName}`, args);

      let result;

      switch (fnName) {
        case "check_waitlist": {
          // Get the first cancelled slot and its matching waitlist patient
          const cancelledSlots = db.getCancelledSlots();
          if (cancelledSlots.length === 0) {
            result = JSON.stringify({
              available: false,
              message: "No cancelled slots available right now.",
            });
          } else {
            const slot = cancelledSlots[0];
            const patient = db.getNextWaitlistPatient(slot.type);
            if (!patient) {
              result = JSON.stringify({
                available: false,
                message: `No waitlisted patients for ${slot.type}.`,
              });
            } else {
              result = JSON.stringify({
                available: true,
                slot: {
                  slot_id: slot.id,
                  type: slot.type,
                  date: slot.date,
                  time: slot.time,
                  duration_minutes: slot.duration_minutes,
                  provider: slot.provider,
                  location: slot.location,
                },
                patient: {
                  patient_id: patient.patient_id,
                  name: patient.name,
                  phone: patient.phone,
                  notes: patient.notes,
                },
              });
            }
          }
          break;
        }

        case "check_availability": {
          const slot = db.getAvailableSlot(args.slot_id);
          result = JSON.stringify({
            available: !!slot,
            slot: slot
              ? {
                  slot_id: slot.id,
                  type: slot.type,
                  date: slot.date,
                  time: slot.time,
                  provider: slot.provider,
                }
              : null,
            message: slot
              ? "This slot is still available!"
              : "Sorry, this slot has already been filled.",
          });
          break;
        }

        case "book_appointment": {
          const booking = db.bookSlot(args.slot_id, args.patient_id);
          result = JSON.stringify(booking);
          console.log(
            booking.success
              ? `  ✅ BOOKED: ${args.patient_name} → ${booking.details?.type} at ${booking.details?.time}`
              : `  ❌ Booking failed: ${booking.message}`
          );
          break;
        }

        case "log_call_outcome": {
          const log = db.logCallOutcome({
            patient_id: args.patient_id,
            outcome: args.outcome,
            reason: args.reason,
            stay_on_waitlist: args.stay_on_waitlist,
          });
          result = JSON.stringify({
            success: true,
            message: `Call outcome logged: ${args.outcome}`,
            log_id: log.id,
          });
          console.log(
            `  📝 Outcome: ${args.outcome} ${args.reason ? `(${args.reason})` : ""}`
          );
          break;
        }

        default:
          result = JSON.stringify({
            error: `Unknown function: ${fnName}`,
          });
      }

      results.push({ toolCallId, result });
    }

    return res.json({ results });
  }

  // Handle other Vapi events (status updates, end-of-call, etc.)
  if (message?.type === "status-update") {
    console.log(`  📊 Status: ${message.status}`);
  }

  if (message?.type === "end-of-call-report") {
    console.log(`  📋 Call ended. Duration: ${message.durationSeconds}s`);
    console.log(`  📋 Summary: ${message.summary}`);
  }

  if (message?.type === "transcript") {
    const role = message.role === "assistant" ? "🤖" : "👤";
    console.log(`  ${role} ${message.transcript}`);
  }

  res.json({ ok: true });
});

// ============================================
// DASHBOARD API ENDPOINTS
// Used by the Lovable frontend
// ============================================

// Get real-time metrics
app.get("/api/metrics", (req, res) => {
  res.json(db.getMetrics());
});

// Get all cancelled (available) slots
app.get("/api/slots", (req, res) => {
  res.json(db.getCancelledSlots());
});

// Get waitlist
app.get("/api/waitlist", (req, res) => {
  res.json(db.waitlist);
});

// Get call logs
app.get("/api/calls", (req, res) => {
  res.json(db.callLogs);
});

// Manually trigger a slot recovery call (for demo purposes)
app.post("/api/trigger-call", async (req, res) => {
  const { slot_id } = req.body;
  const slot = db.getAvailableSlot(slot_id);

  if (!slot) {
    return res.status(404).json({ error: "Slot not found or already filled" });
  }

  const patient = db.getNextWaitlistPatient(slot.type);
  if (!patient) {
    return res
      .status(404)
      .json({ error: "No waitlisted patients for this slot type" });
  }

  // In production, you'd trigger an outbound Vapi call here:
  // const vapi = require('@vapi-ai/server-sdk');
  // await vapi.calls.create({
  //   assistantId: process.env.VAPI_ASSISTANT_ID,
  //   customer: { number: patient.phone }
  // });

  console.log(
    `\n🚀 Triggered call to ${patient.name} (${patient.phone}) for ${slot.type} on ${slot.date} at ${slot.time}`
  );

  res.json({
    success: true,
    message: `Initiating call to ${patient.name}`,
    patient: { name: patient.name, phone: patient.phone },
    slot: { type: slot.type, date: slot.date, time: slot.time },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "slotsaver-backend" });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║         🏥 SlotSaver Backend             ║
  ║         Running on port ${PORT}              ║
  ╠═══════════════════════════════════════════╣
  ║  Vapi Webhook:  POST /vapi/webhook       ║
  ║  Dashboard API: GET  /api/metrics        ║
  ║                 GET  /api/slots          ║
  ║                 GET  /api/waitlist        ║
  ║                 GET  /api/calls          ║
  ║                 POST /api/trigger-call   ║
  ╚═══════════════════════════════════════════╝

  Set your Vapi Server URL to:
  http://localhost:${PORT}/vapi/webhook

  (Use ngrok for external access)
  `);
});
