// Mock database for SlotSaver demo
// In production, this would be connected to an EHR/scheduling system

const appointments = [
  {
    id: "slot_001",
    type: "MRI - Knee",
    date: "2026-02-10",
    time: "2:00 PM",
    duration_minutes: 45,
    provider: "Dr. Rachel Kim",
    department: "Radiology",
    location: "Building A, Room 204",
    status: "cancelled", // This is the slot we're trying to fill
    original_patient: "P_REDACTED",
    estimated_value: 2200,
  },
  {
    id: "slot_002",
    type: "Follow-up - Cardiology",
    date: "2026-02-11",
    time: "10:30 AM",
    duration_minutes: 30,
    provider: "Dr. James Chen",
    department: "Cardiology",
    location: "Building B, Room 112",
    status: "cancelled",
    original_patient: "P_REDACTED",
    estimated_value: 450,
  },
  {
    id: "slot_003",
    type: "Physical Therapy - Shoulder",
    date: "2026-02-10",
    time: "4:00 PM",
    duration_minutes: 60,
    provider: "Dr. Maria Santos",
    department: "Physical Therapy",
    location: "Building C, Room 301",
    status: "cancelled",
    original_patient: "P_REDACTED",
    estimated_value: 350,
  },
];

const waitlist = [
  {
    patient_id: "P_101",
    name: "Michael Thompson",
    phone: "+14155551234",
    waitlist_for: "MRI - Knee",
    added_date: "2026-01-28",
    priority: 1,
    notes: "Referred by Dr. Park. Patient eager to get imaging done ASAP.",
    status: "waiting",
  },
  {
    patient_id: "P_102",
    name: "Jennifer Walsh",
    phone: "+14155555678",
    waitlist_for: "MRI - Knee",
    added_date: "2026-02-01",
    priority: 2,
    notes: "Sports injury. Works 9-5, prefers afternoon slots.",
    status: "waiting",
  },
  {
    patient_id: "P_103",
    name: "David Park",
    phone: "+14155559012",
    waitlist_for: "Follow-up - Cardiology",
    added_date: "2026-01-30",
    priority: 1,
    notes: "Routine follow-up. Flexible schedule.",
    status: "waiting",
  },
  {
    patient_id: "P_104",
    name: "Sarah Martinez",
    phone: "+14155553456",
    waitlist_for: "Physical Therapy - Shoulder",
    added_date: "2026-02-03",
    priority: 1,
    notes: "Post-surgery rehab. Currently doing home exercises.",
    status: "waiting",
  },
];

const callLogs = [];

// Track real-time metrics
const metrics = {
  total_calls: 0,
  slots_recovered: 0,
  revenue_recovered: 0,
  avg_call_duration_seconds: 0,
  call_durations: [],
};

function getNextWaitlistPatient(appointmentType) {
  const match = waitlist
    .filter((p) => p.waitlist_for === appointmentType && p.status === "waiting")
    .sort((a, b) => a.priority - b.priority);
  return match.length > 0 ? match[0] : null;
}

function getAvailableSlot(slotId) {
  return appointments.find((a) => a.id === slotId && a.status === "cancelled");
}

function getCancelledSlots() {
  return appointments.filter((a) => a.status === "cancelled");
}

function bookSlot(slotId, patientId) {
  const slot = appointments.find((a) => a.id === slotId);
  const patient = waitlist.find((p) => p.patient_id === patientId);

  if (!slot || slot.status !== "cancelled") {
    return { success: false, message: "Slot is no longer available" };
  }

  slot.status = "booked";
  slot.booked_patient = patientId;
  slot.booked_at = new Date().toISOString();

  if (patient) {
    patient.status = "booked";
  }

  metrics.slots_recovered++;
  metrics.revenue_recovered += slot.estimated_value;

  return {
    success: true,
    message: `Appointment confirmed for ${patient?.name || patientId}`,
    details: {
      type: slot.type,
      date: slot.date,
      time: slot.time,
      provider: slot.provider,
      location: slot.location,
      duration: slot.duration_minutes,
    },
  };
}

function logCallOutcome(data) {
  const log = {
    id: `call_${Date.now()}`,
    patient_id: data.patient_id,
    patient_name:
      waitlist.find((p) => p.patient_id === data.patient_id)?.name || "Unknown",
    outcome: data.outcome,
    reason: data.reason || "",
    stay_on_waitlist: data.stay_on_waitlist ?? true,
    timestamp: new Date().toISOString(),
  };

  callLogs.push(log);
  metrics.total_calls++;

  // Update waitlist status if they declined and don't want to stay
  if (data.outcome === "declined" && data.stay_on_waitlist === false) {
    const patient = waitlist.find((p) => p.patient_id === data.patient_id);
    if (patient) patient.status = "removed";
  }

  return log;
}

function getMetrics() {
  return {
    ...metrics,
    call_logs: callLogs.slice(-20), // last 20 calls
    cancelled_slots: getCancelledSlots(),
    recovery_rate:
      metrics.total_calls > 0
        ? ((metrics.slots_recovered / metrics.total_calls) * 100).toFixed(1) +
          "%"
        : "0%",
  };
}

module.exports = {
  appointments,
  waitlist,
  callLogs,
  metrics,
  getNextWaitlistPatient,
  getAvailableSlot,
  getCancelledSlots,
  bookSlot,
  logCallOutcome,
  getMetrics,
};
