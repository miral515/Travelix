"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plane, ArrowLeft } from "lucide-react";

const INTERESTS = [
  { emoji: "🏖", label: "Beaches" },
  { emoji: "🏔", label: "Mountains" },
  { emoji: "🍜", label: "Food" },
  { emoji: "🏛", label: "Culture" },
  { emoji: "🌿", label: "Nature" },
  { emoji: "🧗", label: "Adventure" },
  { emoji: "💆", label: "Wellness" },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tvx-field">
      <label className="tvx-label">{label}</label>
      {children}
    </div>
  );
}

function Chip({
  emoji,
  label,
  active,
  onClick,
}: {
  emoji: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tvx-chip${active ? " tvx-chip-active" : ""}`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  );
}

export default function PlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [destination, setDestination] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [tripLength, setTripLength] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // letters + spaces only (supports Arabic and English), no digits or symbols
const onlyEnglishLetters = (value: string) =>
  value.replace(/[^a-zA-Z\s]/g, "");
  // digits only
  const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

  const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const params = new URLSearchParams({
    destination,
    departureCity,
    travelDate,
    tripLength,
    budget,
    travelers,
    interests: interests.join(","),
  });

  router.push(`/loading?${params.toString()}`);
};

  return (
    <main className="tvx-page min-h-screen flex flex-col items-center px-6 py-14 sm:py-20">
      {/* top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-12 sm:mb-16">
        <a href="/" className="tvx-mono flex items-center gap-2 text-[11px] text-[color:var(--tvx-muted)]">
          <ArrowLeft size={14} />
          BACK TO HOME
        </a>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[color:var(--tvx-navy)]">
            <Plane size={13} className="rotate-45 text-[color:var(--tvx-navy)]" />
          </div>
          <p className="tvx-mono text-[11px] text-[color:var(--tvx-navy)]">TRAVELIX</p>
        </div>
      </div>

      {/* headline */}
      <div className="mb-12 max-w-lg text-center sm:mb-16">
        <h1 className="tvx-serif text-4xl leading-tight sm:text-5xl">Design your next journey.</h1>
        <p className="tvx-sans mt-4 text-[color:var(--tvx-ink-soft)]">
          A few details, and Travelix drafts an itinerary built entirely around you.
        </p>
      </div>

      {/* form card */}
      <div className="tvx-card relative w-full max-w-2xl overflow-hidden p-8 sm:p-14">
        {/* decorative flight path */}
        <svg
          className="tvx-flightpath pointer-events-none absolute -right-10 -top-6 opacity-[0.08]"
          width="220"
          height="140"
          viewBox="0 0 220 140"
          aria-hidden="true"
        >
          <path d="M0 120 C 60 20, 140 20, 220 90" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
        </svg>

        {/* decorative passport stamp */}
        <div
          className="tvx-stamp pointer-events-none absolute left-6 top-6 hidden h-20 w-20 -rotate-[14deg] items-center justify-center rounded-full opacity-[0.14] sm:flex"
          aria-hidden="true"
        >
          <p className="tvx-mono text-center text-[8px] leading-tight">
            TRAVELIX
            <br />
            EST. AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-8 sm:gap-10">
          <Field label="Destination">
            <input
              type="text"
              placeholder="Riyadh,Dubai,Italy..."
              value={destination}
              onChange={(e) => setDestination(onlyEnglishLetters(e.target.value))}
              className="tvx-input"
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
            <Field label="Departure city">
              <input
                type="text"
                placeholder="Dammam"
                value={departureCity}
                onChange={(e) => setDepartureCity(onlyEnglishLetters(e.target.value))}
                className="tvx-input"
                required
              />
            </Field>
            <Field label="Travel date">
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="tvx-input"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
            <Field label="Trip length (days)">
              <input
                type="number"
                min={1}
                placeholder="7"
                value={tripLength}
                onChange={(e) => setTripLength(e.target.value)}
                className="tvx-input"
                required
              />
            </Field>
            <Field label="Travelers">
              <input
                type="number"
                min={1}
                placeholder="2"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="tvx-input"
                required
              />
            </Field>
          </div>

          <Field label="Budget">
            <input
              type="text"
              inputMode="numeric"
              placeholder="2500"
              value={budget}
              onChange={(e) => setBudget(onlyDigits(e.target.value))}
              className="tvx-input"
              required
            />
          </Field>

          <Field label="Travel interests">
            <div className="mt-1 flex flex-wrap gap-2.5">
              {INTERESTS.map(({ emoji, label }) => (
                <Chip
                  key={label}
                  emoji={emoji}
                  label={label}
                  active={interests.includes(label)}
                  onClick={() => toggleInterest(label)}
                />
              ))}
            </div>
          </Field>

          <div className="tvx-divider pt-8 sm:pt-10">
            <button
              type="submit"
              disabled={loading}
              className="tvx-cta tvx-sans flex w-full items-center justify-center gap-2 py-4 text-base font-medium"
            >
              {loading ? (
                <>
                  <span className="tvx-spinner" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  Generate itinerary
                  <Plane size={17} className="tvx-plane rotate-90" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="tvx-mono mt-8 text-[10px] text-[color:var(--tvx-muted-light)]">
Designed Around Your Journey      </p>
    </main>
  );
}