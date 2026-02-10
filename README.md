# SlotSaver 🏥📞

**AI Voice Agent That Sells Empty Appointment Slots**

Built at the Vapi AI x Lovable x Hathora Hackathon — Leverage.Work, SF, Feb 9 2026

## The Problem

A clinic has a $5,000 MRI machine sitting idle tomorrow at 2pm because someone cancelled. Every empty slot = lost revenue. Front desk staff don't have time to manually call waitlisted patients.

## The Solution

SlotSaver is an **outbound AI voice agent** that proactively calls patients on the waitlist, persuasively fills cancelled appointment slots, and handles objections — all in a natural, empathetic conversation.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Lovable App    │────▶│  Vapi Agent  │────▶│  Backend Server  │
│  (Admin Dashboard)│     │ (Voice AI)   │     │  (Express + API) │
└─────────────────┘     └──────────────┘     └──────────────────┘
        │                       │                       │
        │                       │              ┌────────┴────────┐
        │                       │              │  Mock Database   │
        │                       ▼              │  (appointments,  │
        │                  ┌──────────┐        │   waitlist,      │
        │                  │ Hathora  │        │   call logs)     │
        │                  │ (TTS)    │        └─────────────────┘
        │                  └──────────┘
        │
        └──── Real-time dashboard showing calls, bookings, recovery metrics
```

## Tech Stack

- **Vapi AI** — Voice agent orchestration, phone calls, intent handling
- **Hathora** — TTS model (Chatterbox Turbo for expressive, human-like voice)
- **Lovable** — Admin dashboard (React + Tailwind + Supabase)
- **Express.js** — Backend webhook server for Vapi tool calls
- **ngrok** — Tunnel for local development

## Quick Start

### 1. Backend Server (handles Vapi tool calls)

```bash
cd backend
npm install
cp .env.example .env
# Add your VAPI_API_KEY
npm run dev
```

### 2. Expose with ngrok

```bash
ngrok http 3000
# Copy the https URL → set as Server URL in Vapi dashboard
```

### 3. Vapi Agent Setup

1. Go to dashboard.vapi.ai → Create Assistant
2. Paste the system prompt from `vapi-system-prompt.md`
3. Add the tools defined in `vapi-tools.json`
4. Set Server URL to your ngrok URL + `/vapi/webhook`
5. Create a phone number and assign the assistant

### 4. Lovable Dashboard

1. Go to lovable.dev
2. Paste the prompt from `lovable-prompt.md`
3. Connect to Supabase for real-time data
4. Point API calls to your backend

## Project Structure

```
slotsaver/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js              # Express server + Vapi webhook handler
│   ├── data/
│   │   └── mockDatabase.js    # Mock appointments, waitlist, call logs
│   └── .env.example
├── vapi-system-prompt.md       # Copy into Vapi dashboard
├── vapi-tools.json             # Tool definitions for Vapi
└── lovable-prompt.md           # Prompt to paste into Lovable
```

## Pitch (60 seconds)

> "Every cancelled appointment costs clinics thousands in lost revenue. Using the framework from tonight's workshop, we identified appointment scheduling as the highest-scoring hotspot — HIGH volume, HIGH pain, HIGH fit.
>
> But we flipped the script. Instead of inbound scheduling, SlotSaver is an **outbound revenue recovery agent**. When a slot opens up, it calls waitlisted patients, persuades them to take the slot, handles objections, and books it — all autonomously.
>
> In our demo, you'll see a live call where the agent recovers a $2,000 MRI slot in under 90 seconds. That's revenue that would have been lost.
>
> SlotSaver: Don't just schedule appointments. **Sell** them."

## Workshop Framework Alignment

| Framework Element | SlotSaver |
|---|---|
| VPF Score | Volume: HIGH, Pain: HIGH, Fit: HIGH |
| Priority | P1 Flagship — mature APIs, low complexity, high value |
| Supported Intent | Fill cancelled slot from waitlist |
| Unsupported Intents | Medical advice, insurance, urgent care |
| Guardrails | Escalate if symptoms, no pressure tactics, respect decline |
| Channel | Phone, English, business hours, human backup |
| Success Metric | Slot recovery rate, revenue recovered, avg call duration |
