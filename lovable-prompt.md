# Lovable Dashboard Prompt

Paste this into lovable.dev to generate the admin dashboard.

---

## Prompt

```
Build a real-time admin dashboard called "SlotSaver" for a healthcare AI voice agent that recovers cancelled appointment slots by calling waitlisted patients.

DESIGN:
- Dark theme with a medical/professional feel
- Primary color: emerald green (#10B981) for "recovered" / success states
- Accent: red/coral for cancelled/empty slots
- Clean, data-dense layout — this is an ops dashboard, not a marketing page
- Use card-based layout with subtle borders

LAYOUT (single page):

1. TOP METRICS BAR (4 cards in a row):
   - "Slots Recovered" — big number with green highlight (e.g., "3")
   - "Revenue Recovered" — dollar amount in green (e.g., "$2,950")
   - "Recovery Rate" — percentage (e.g., "75%")
   - "Avg Call Duration" — in seconds (e.g., "47s")

2. LEFT COLUMN (60% width):
   
   "Open Slots" card:
   - Table showing cancelled appointment slots that need to be filled
   - Columns: Type, Date, Time, Provider, Est. Value, Status
   - Each row has a green "Trigger Call" button
   - Status badges: "Cancelled" (red), "Calling..." (yellow pulse animation), "Recovered" (green)
   
   "Call Activity Feed" card:
   - Real-time feed of call outcomes
   - Each entry shows: patient name, outcome (booked/declined/no answer), timestamp
   - Use icons: ✅ for booked, ❌ for declined, 📞 for no answer, ⚠️ for escalated
   - Most recent at top

3. RIGHT COLUMN (40% width):
   
   "Waitlist" card:
   - List of patients waiting for slots
   - Show: name, waiting for (appointment type), days waiting, priority
   - Priority badge: P1 (red), P2 (orange), P3 (gray)
   
   "Live Call" card (if a call is in progress):
   - Show patient name, slot being offered
   - Animated waveform or pulsing dot to indicate live call
   - Timer showing call duration
   - Status: "Ringing...", "Connected", "Wrapping Up"

FUNCTIONALITY:
- "Trigger Call" button on each open slot should POST to http://localhost:3000/api/trigger-call with the slot_id
- Poll http://localhost:3000/api/metrics every 5 seconds to update the metrics
- Poll http://localhost:3000/api/calls every 5 seconds to update the call feed
- Poll http://localhost:3000/api/slots every 5 seconds to update slot statuses
- Poll http://localhost:3000/api/waitlist every 5 seconds to update waitlist

HEADER:
- "SlotSaver" logo/text on the left with a small 🏥 emoji
- "Bay Area Medical Center" subtitle
- Small green dot with "System Active" on the right

Make it feel like a command center for recovering lost revenue. Every cancelled slot is money on the table — the dashboard should make that urgency visible.
```

## After Generation

1. The dashboard will work with mock data initially
2. Connect it to your backend by updating the API base URL
3. If using Supabase through Lovable, you can persist call logs there too
