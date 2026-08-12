"use client";

import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import {
  Plane,
  MapPin,
  CalendarDays,
  DollarSign,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Logo from "../components/Logo";

type ActivityItem = {
  activity: string;
  place: string;
  estimatedTime?: string;
  estimatedCost?: string;
  googleMaps?: string;
  image?: string;
};

type Day = {
  day: string;
  items: ActivityItem[];
  image?: string;
};

type TravelPlan = {
  destination: string;
  duration: string;
  budget: string;
  destinationCurrency?: string;

  budgetBreakdown?: {
    flights: string;
    hotel: string;
    food: string;
    transport: string;
    activities: string;
    shopping: string;
    other: string;
    total: string;
    remaining: string;
  };

  hotel: {
    name: string;
    address: string;
    googleMaps?: string;
    stars: string;
    pricePerNight: string;
    reason: string;
    image?: string;
  };

  restaurants: {
    name: string;
    googleMaps?: string;
    priceRange: string;
  }[];

  days: Day[];

  travelTips?: string[];
};

type OptimizationResult = {
  summary?: string;
  savings?: string;
  changes?: string[];
  optimizedBudget?: string;
  tips?: string[];
};

/* -------------------------------------------------------
   Stat Card
------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="tvx-card p-6">
      <div className="mb-3 text-[color:var(--tvx-orange)]">
        {icon}
      </div>

      <p className="tvx-label">{label}</p>

      <h2 className="tvx-serif mt-1 text-xl">
        {value}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------
   Google Maps
------------------------------------------------------- */

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

/* -------------------------------------------------------
   Fallback Images
------------------------------------------------------- */

function getActivityImage(place: string) {
  const p = place.toLowerCase();

  if (p.includes("eiffel")) {
    return "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200";
  }

  if (p.includes("louvre")) {
    return "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?w=1200";
  }

  return "";
}

/* -------------------------------------------------------
   Activity Text
------------------------------------------------------- */

function ActivityText({
  activity,
  place,
}: ActivityItem) {
  if (!place || !activity.includes(place)) {
    return <>{activity}</>;
  }

  const idx = activity.indexOf(place);

  const before = activity.slice(0, idx);
  const after = activity.slice(idx + place.length);

  return (
    <>
      {before}

      <a
        href={mapsSearchUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted decoration-[color:var(--tvx-muted-light)] underline-offset-2 transition-colors hover:text-[color:var(--tvx-orange)]"
      >
        {place}
      </a>

      {after}
    </>
  );
}

/* -------------------------------------------------------
   Day Block
------------------------------------------------------- */

function DayBlock({
  day,
  items,
  onRegenerate,
  isRegenerating,
}: {
  day: string;
  items: ActivityItem[];
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="tvx-mono text-xs text-[color:var(--tvx-orange)]">
          {day}
        </h3>

        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="tvx-mono flex items-center gap-2 rounded-full border border-[color:var(--tvx-border)] px-4 py-2 text-[10px] text-[color:var(--tvx-muted)] transition-all hover:border-[color:var(--tvx-orange)] hover:text-[color:var(--tvx-orange)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={isRegenerating ? "animate-spin" : ""}
          />

          {isRegenerating
            ? "REGENERATING..."
            : "REGENERATE DAY"}
        </button>
      </div>

      <ul className="tvx-sans mt-3 space-y-6 text-[color:var(--tvx-ink-soft)]">
        {items.map((item, index) => {
          const image =
            item.image ||
            getActivityImage(item.place || "");

          return (
            <li key={index}>
              {image && (
                <img
                  src={image}
                  alt={item.place || item.activity}
                  className="mb-3 h-48 w-full rounded-xl object-cover"
                />
              )}

              <div className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--tvx-muted-light)]" />

                <div>
                  <ActivityText
                    activity={item.activity}
                    place={item.place}
                  />

                  {item.estimatedTime && (
                    <p className="mt-1 text-xs text-[color:var(--tvx-muted)]">
                      ⏱ {item.estimatedTime}
                    </p>
                  )}

                  {item.estimatedCost && (
                    <p className="text-xs text-[color:var(--tvx-muted)]">
                      💰 {item.estimatedCost}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------
   PDF Colors
------------------------------------------------------- */

const PDF_COLORS = {
  bg: [242, 236, 218] as [number, number, number],
  card: [251, 245, 232] as [number, number, number],
  border: [216, 203, 160] as [number, number, number],
  navy: [22, 40, 58] as [number, number, number],
  orange: [217, 85, 46] as [number, number, number],
  green: [31, 111, 107] as [number, number, number],
  muted: [138, 127, 99] as [number, number, number],
  mutedLight: [183, 172, 139] as [number, number, number],
  inkSoft: [92, 86, 66] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* -------------------------------------------------------
   Result Page
------------------------------------------------------- */

export default function ResultPage() {
  const [plan, setPlan] =
    useState<TravelPlan | null>(null);

  const [regeneratingDay, setRegeneratingDay] =
    useState<number | null>(null);

  const [optimizing, setOptimizing] =
    useState(false);

  const [optimization, setOptimization] =
    useState<OptimizationResult | null>(null);

  /* -----------------------------------------------------
     Load itinerary
  ----------------------------------------------------- */

  useEffect(() => {
    const saved =
      sessionStorage.getItem("travelPlan");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      const normalized: TravelPlan = {
        ...parsed,

        days: (parsed.days ?? []).map(
          (d: any) => ({
            day: d.day,

            items: (d.items ?? []).map(
              (it: any) => {
                const item =
                  typeof it === "string"
                    ? {
                        activity: it,
                        place: "",
                      }
                    : it;

                return {
                  ...item,

                  image:
                    item.image ||
                    getActivityImage(
                      item.place || ""
                    ),
                };
              }
            ),
          })
        ),
      };

      setPlan(normalized);
    } catch (error) {
      console.error(
        "Failed to load itinerary:",
        error
      );
    }
  }, []);

  /* -----------------------------------------------------
     Optimize Trip
  ----------------------------------------------------- */

  const optimizeTrip = async () => {
    if (!plan) return;

    try {
      setOptimizing(true);
      setOptimization(null);

      const response = await fetch(
        "/api/optimize-trip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination: plan.destination,
            duration: plan.duration,
            budget: plan.budget,
            budgetBreakdown:
              plan.budgetBreakdown,
            days: plan.days,
            hotel: plan.hotel,
            travelers: 1,
            interests: [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Optimization failed"
        );
      }

      setOptimization(data);
    } catch (error) {
      console.error(
        "Optimization error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to optimize trip."
      );
    } finally {
      setOptimizing(false);
    }
  };

  /* -----------------------------------------------------
     Regenerate One Day
  ----------------------------------------------------- */

  const regenerateDay = async (
    dayIndex: number
  ) => {
    if (!plan) return;

    const selectedDay =
      plan.days[dayIndex];

    try {
      setRegeneratingDay(dayIndex);

      const response = await fetch(
        "/api/regenerate-day",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            destination:
              plan.destination,

            day: selectedDay.day,

            currentItems:
              selectedDay.items,

            budget: plan.budget,

            travelers:
              (plan as any).travelers ?? 1,

            interests:
              (plan as any).interests ?? [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to regenerate day"
        );
      }

      const updatedPlan: TravelPlan = {
        ...plan,

        days: plan.days.map(
          (day, index) =>
            index === dayIndex
              ? {
                  ...day,
                  ...data,
                  items:
                    data.items ?? [],
                }
              : day
        ),
      };

      setPlan(updatedPlan);

      sessionStorage.setItem(
        "travelPlan",
        JSON.stringify(updatedPlan)
      );
    } catch (error) {
      console.error(
        "Regenerate day error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to regenerate this day."
      );
    } finally {
      setRegeneratingDay(null);
    }
  };

  /* -----------------------------------------------------
     Loading
  ----------------------------------------------------- */

  if (!plan) {
    return (
      <main className="tvx-page min-h-screen flex items-center justify-center">
        <p className="tvx-serif text-2xl">
          Loading itinerary...
        </p>
      </main>
    );
  }

  /* -----------------------------------------------------
     Hotel Google Maps
  ----------------------------------------------------- */

  const mapsUrl = mapsSearchUrl(
    `${plan.hotel.name} ${plan.hotel.address}`
  );

  /* -----------------------------------------------------
     Google Flights
  ----------------------------------------------------- */

  const flightsUrl =
    "https://www.google.com/travel/flights?q=" +
    encodeURIComponent(
      `Flights to ${plan.destination}`
    );

  /* -----------------------------------------------------
     Download PDF
  ----------------------------------------------------- */

  const downloadPDF = () => {
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    let y = MARGIN;

    const fillPageBg = () => {
      pdf.setFillColor(
        ...PDF_COLORS.bg
      );

      pdf.rect(
        0,
        0,
        PAGE_W,
        PAGE_H,
        "F"
      );
    };

    const newPage = () => {
      pdf.addPage();

      fillPageBg();

      y = MARGIN;
    };

    const ensureSpace = (
      needed: number
    ) => {
      if (
        y + needed >
        PAGE_H - 24
      ) {
        newPage();
      }
    };

    const card = (
      height: number
    ) => {
      pdf.setFillColor(
        ...PDF_COLORS.card
      );

      pdf.setDrawColor(
        ...PDF_COLORS.border
      );

      pdf.setLineWidth(0.3);

      pdf.roundedRect(
        MARGIN,
        y,
        CONTENT_W,
        height,
        4,
        4,
        "FD"
      );
    };

    const label = (
      text: string,
      x: number,
      yy: number
    ) => {
      pdf.setFont(
        "courier",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.setTextColor(
        ...PDF_COLORS.muted
      );

      pdf.text(
        text.toUpperCase(),
        x,
        yy,
        {
          charSpace: 0.3,
        }
      );
    };

    const bulletList = (
      items: ActivityItem[],
      x: number,
      width: number
    ) => {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      for (const item of items) {
        const lines: string[] =
          pdf.splitTextToSize(
            item.activity || "",
            width - 5
          );

        ensureSpace(
          lines.length * 5 + 2
        );

        pdf.setFillColor(
          ...PDF_COLORS.mutedLight
        );

        pdf.circle(
          x + 1,
          y - 1.3,
          0.6,
          "F"
        );

        pdf.setTextColor(
          ...PDF_COLORS.inkSoft
        );

        if (
          item.place &&
          lines.length === 1 &&
          lines[0].includes(
            item.place
          )
        ) {
          const line = lines[0];

          const idx =
            line.indexOf(
              item.place
            );

          const before =
            line.slice(0, idx);

          const placeText =
            item.place;

          const after =
            line.slice(
              idx +
                placeText.length
            );

          const mapUrl =
            mapsSearchUrl(
              placeText
            );

          let cx = x + 4;

          pdf.text(
            before,
            cx,
            y
          );

          cx +=
            pdf.getTextWidth(
              before
            );

          pdf.setTextColor(
            ...PDF_COLORS.orange
          );

          pdf.textWithLink(
            placeText,
            cx,
            y,
            {
              url: mapUrl,
            }
          );

          cx +=
            pdf.getTextWidth(
              placeText
            );

          pdf.setTextColor(
            ...PDF_COLORS.inkSoft
          );

          pdf.text(
            after,
            cx,
            y
          );
        } else if (
          item.place
        ) {
          const mapUrl =
            mapsSearchUrl(
              item.place
            );

          lines.forEach(
            (
              line: string,
              i: number
            ) => {
              pdf.textWithLink(
                line,
                x + 4,
                y + i * 5,
                {
                  url: mapUrl,
                }
              );
            }
          );
        } else {
          pdf.text(
            lines,
            x + 4,
            y
          );
        }

        y +=
          lines.length * 5 + 2;
      }
    };

    fillPageBg();

    /* Logo */

    pdf.setDrawColor(
      ...PDF_COLORS.navy
    );

    pdf.setLineWidth(0.5);

    pdf.circle(
      MARGIN + 4,
      y + 3,
      4,
      "S"
    );

    pdf.setFillColor(
      ...PDF_COLORS.orange
    );

    pdf.circle(
      MARGIN + 7,
      y - 0.5,
      0.9,
      "F"
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(11);

    pdf.setTextColor(
      ...PDF_COLORS.navy
    );

    pdf.text(
      "TRAVELIX",
      MARGIN + 12,
      y + 2,
      {
        charSpace: 0.5,
      }
    );

    pdf.setFont(
      "courier",
      "normal"
    );

    pdf.setFontSize(6.5);

    pdf.setTextColor(
      ...PDF_COLORS.muted
    );

    pdf.text(
      "AI ITINERARY CO.",
      MARGIN + 12,
      y + 6,
      {
        charSpace: 0.3,
      }
    );

    y += 20;

    /* Title */

    pdf.setFont(
      "times",
      "bold"
    );

    pdf.setFontSize(22);

    pdf.setTextColor(
      ...PDF_COLORS.navy
    );

    pdf.text(
      `Your trip to ${plan.destination}`,
      MARGIN,
      y
    );

    y += 8;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.setTextColor(
      ...PDF_COLORS.inkSoft
    );

    pdf.text(
      "Here's your personalized itinerary, built by Travelix AI.",
      MARGIN,
      y
    );

    y += 14;

    /* Stats */

    const statGap = 6;

    const statW =
      (CONTENT_W -
        statGap * 2) /
      3;

    const statH = 22;

    const stats: [
      string,
      string
    ][] = [
      [
        "DESTINATION",
        plan.destination,
      ],
      [
        "DURATION",
        plan.duration,
      ],
      [
        "ESTIMATED BUDGET",
        plan.budget,
      ],
    ];

    stats.forEach(
      ([lbl, val], i) => {
        const x =
          MARGIN +
          i *
            (statW +
              statGap);

        pdf.setFillColor(
          ...PDF_COLORS.card
        );

        pdf.setDrawColor(
          ...PDF_COLORS.border
        );

        pdf.roundedRect(
          x,
          y,
          statW,
          statH,
          3,
          3,
          "FD"
        );

        pdf.setFillColor(
          ...PDF_COLORS.orange
        );

        pdf.circle(
          x + 5,
          y + 6,
          1,
          "F"
        );

        label(
          lbl,
          x + 4,
          y + 12
        );

        pdf.setFont(
          "times",
          "bold"
        );

        pdf.setFontSize(11);

        pdf.setTextColor(
          ...PDF_COLORS.navy
        );

        const valLines: string[] =
          pdf.splitTextToSize(
            val,
            statW - 8
          );

        pdf.text(
          valLines,
          x + 4,
          y + 18
        );
      }
    );

    y += statH + 10;

    /* Hotel */

    ensureSpace(50);

    const hotelStartY = y;

    const hotelLines =
      pdf.splitTextToSize(
        plan.hotel.reason || "",
        CONTENT_W - 8
      );

    const hotelAddrLines =
      pdf.splitTextToSize(
        plan.hotel.address || "",
        CONTENT_W - 8
      );

    const hotelH =
      24 +
      hotelAddrLines.length *
        5 +
      hotelLines.length * 5 +
      12;

    card(hotelH);

    pdf.setFont(
      "times",
      "bold"
    );

    pdf.setFontSize(14);

    pdf.setTextColor(
      ...PDF_COLORS.navy
    );

    pdf.text(
      "Recommended hotel",
      MARGIN + 6,
      y + 9
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(11);

    pdf.text(
      plan.hotel.name,
      MARGIN + 6,
      y + 17
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9.5);

    pdf.setTextColor(
      ...PDF_COLORS.inkSoft
    );

    pdf.text(
      hotelAddrLines,
      MARGIN + 6,
      y + 23
    );

    let hy =
      y +
      23 +
      hotelAddrLines.length *
        5;

    pdf.setFont(
      "courier",
      "normal"
    );

    pdf.setFontSize(8.5);

    pdf.setTextColor(
      ...PDF_COLORS.muted
    );

    pdf.text(
      `STARS: ${plan.hotel.stars}   ·   PRICE/NIGHT: ${plan.hotel.pricePerNight}`,
      MARGIN + 6,
      hy + 5
    );

    hy += 10;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9.5);

    pdf.setTextColor(
      ...PDF_COLORS.inkSoft
    );

    pdf.text(
      hotelLines,
      MARGIN + 6,
      hy
    );

    hy +=
      hotelLines.length * 5 +
      4;

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(9.5);

    pdf.setTextColor(
      ...PDF_COLORS.orange
    );

    pdf.textWithLink(
      "Open in Google Maps ->",
      MARGIN + 6,
      hy,
      {
        url: mapsUrl,
      }
    );

    y =
      hotelStartY +
      hotelH +
      10;

    /* Itinerary */

    ensureSpace(20);

    pdf.setFont(
      "times",
      "bold"
    );

    pdf.setFontSize(16);

    pdf.setTextColor(
      ...PDF_COLORS.navy
    );

    pdf.text(
      "Travel itinerary",
      MARGIN,
      y
    );

    y += 10;

    for (const day of plan.days) {
      ensureSpace(16);

      pdf.setFont(
        "courier",
        "normal"
      );

      pdf.setFontSize(8.5);

      pdf.setTextColor(
        ...PDF_COLORS.orange
      );

      pdf.text(
        day.day.toUpperCase(),
        MARGIN,
        y,
        {
          charSpace: 0.3,
        }
      );

      y += 6;

      bulletList(
        day.items,
        MARGIN,
        CONTENT_W
      );

      y += 4;

      ensureSpace(4);

      pdf.setDrawColor(
        ...PDF_COLORS.border
      );

      pdf.setLineWidth(0.2);

      pdf.setLineDashPattern(
        [1, 1],
        0
      );

      pdf.line(
        MARGIN,
        y,
        MARGIN + CONTENT_W,
        y
      );

      pdf.setLineDashPattern(
        [],
        0
      );

      y += 8;
    }

    /* Footer */

    const pageCount =
      pdf.getNumberOfPages();

    for (
      let i = 1;
      i <= pageCount;
      i++
    ) {
      pdf.setPage(i);

      pdf.setDrawColor(
        ...PDF_COLORS.border
      );

      pdf.setLineWidth(0.2);

      pdf.setLineDashPattern(
        [1, 1],
        0
      );

      pdf.line(
        PAGE_W / 2 - 15,
        PAGE_H - 16,
        PAGE_W / 2 + 15,
        PAGE_H - 16
      );

      pdf.setLineDashPattern(
        [],
        0
      );

      pdf.setFont(
        "courier",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        ...PDF_COLORS.mutedLight
      );

      pdf.text(
        "BY MIRAL ALSHARIEF",
        PAGE_W / 2,
        PAGE_H - 11,
        {
          align: "center",
          charSpace: 0.5,
        }
      );
    }

    pdf.save(
      "Travelix-Itinerary.pdf"
    );
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <main className="tvx-page min-h-screen px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">

        {/* Top bar */}

        <div className="mb-14 flex items-center justify-between">
          <Logo variant="compact" />

          <Link
            href="/plan"
            className="tvx-mono text-[11px] text-[color:var(--tvx-muted)]"
          >
            PLAN ANOTHER TRIP
          </Link>
        </div>

        {/* Header */}

        <div className="mb-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-[color:var(--tvx-navy)]">
            <Plane
              size={22}
              className="rotate-45 text-[color:var(--tvx-navy)]"
            />
          </div>

          <h1 className="tvx-serif mt-6 text-4xl leading-tight sm:text-5xl">
            Your trip is ready.
          </h1>

          <p className="tvx-sans mt-3 text-[color:var(--tvx-ink-soft)]">
            Here's your personalized itinerary, built by Travelix AI.
          </p>
        </div>

        {/* Summary */}

        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <StatCard
            icon={<MapPin size={20} />}
            label="DESTINATION"
            value={plan.destination}
          />

          <StatCard
            icon={<CalendarDays size={20} />}
            label="DURATION"
            value={plan.duration}
          />

          <StatCard
            icon={<DollarSign size={20} />}
            label="ESTIMATED BUDGET"
            value={plan.budget}
          />
        </div>

        {/* Budget */}

        {plan.budgetBreakdown && (
          <div className="tvx-card mb-8 p-8">
            <h2 className="tvx-serif mb-6 text-2xl">
              Budget Overview
            </h2>

            {[
              {
                label: "✈️ Flights",
                value:
                  plan.budgetBreakdown.flights,
                percent: 30,
              },
              {
                label: "🏨 Hotel",
                value:
                  plan.budgetBreakdown.hotel,
                percent: 30,
              },
              {
                label: "🍽 Food",
                value:
                  plan.budgetBreakdown.food,
                percent: 15,
              },
              {
                label: "🚕 Transport",
                value:
                  plan.budgetBreakdown.transport,
                percent: 8,
              },
              {
                label: "🎟 Activities",
                value:
                  plan.budgetBreakdown.activities,
                percent: 10,
              },
              {
                label: "🛍 Shopping",
                value:
                  plan.budgetBreakdown.shopping,
                percent: 4,
              },
              {
                label: "💵 Other",
                value:
                  plan.budgetBreakdown.other,
                percent: 3,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="mb-5"
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    {item.label}
                  </span>

                  <span>
                    {item.value}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--tvx-border)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--tvx-orange)]"
                    style={{
                      width: `${item.percent}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="tvx-divider my-6" />

            <div className="flex justify-between text-lg font-semibold">
              <span>
                Total Budget
              </span>

              <span>
                {
                  plan.budgetBreakdown
                    .total
                }
              </span>
            </div>

            <div className="mt-3 flex justify-between font-semibold text-[color:var(--tvx-green)]">
              <span>
                Remaining
              </span>

              <span>
                {
                  plan.budgetBreakdown
                    .remaining
                }
              </span>
            </div>
          </div>
        )}

        {/* Optimize */}

        <div className="tvx-card mb-8 p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={20}
                  className="text-[color:var(--tvx-orange)]"
                />

                <h2 className="tvx-serif text-2xl">
                  Optimize My Trip
                </h2>
              </div>

              <p className="mt-2 text-[color:var(--tvx-ink-soft)]">
                Let Travelix AI find ways to save money,
                reduce travel time, and improve your itinerary.
              </p>
            </div>

            <button
              onClick={optimizeTrip}
              disabled={optimizing}
              className="tvx-cta flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={16} />

              {optimizing
                ? "ANALYZING..."
                : "OPTIMIZE MY TRIP"}
            </button>
          </div>

          {/* Optimization result */}

          {optimization && (
            <div className="mt-8 rounded-2xl border border-[color:var(--tvx-border)] p-6">
              <h3 className="tvx-serif text-xl">
                ✨ Optimization Results
              </h3>

              {optimization.summary && (
                <p className="mt-3 text-[color:var(--tvx-ink-soft)]">
                  {optimization.summary}
                </p>
              )}

              {optimization.savings && (
                <div className="mt-4 rounded-xl bg-[color:var(--tvx-card)] p-4">
                  <p className="tvx-label">
                    POTENTIAL SAVINGS
                  </p>

                  <p className="mt-1 font-semibold text-[color:var(--tvx-green)]">
                    {optimization.savings}
                  </p>
                </div>
              )}

              {optimization.optimizedBudget && (
                <div className="mt-4">
                  <p className="tvx-label">
                    OPTIMIZED BUDGET
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {optimization.optimizedBudget}
                  </p>
                </div>
              )}

              {optimization.changes &&
                optimization.changes.length >
                  0 && (
                  <div className="mt-5">
                    <p className="tvx-label mb-3">
                      SUGGESTED CHANGES
                    </p>

                    <ul className="space-y-2 text-sm text-[color:var(--tvx-ink-soft)]">
                      {optimization.changes.map(
                        (
                          change,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-2"
                          >
                            <span className="text-[color:var(--tvx-orange)]">
                              •
                            </span>

                            <span>
                              {change}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {optimization.tips &&
                optimization.tips.length >
                  0 && (
                  <div className="mt-5">
                    <p className="tvx-label mb-3">
                      TIPS
                    </p>

                    <ul className="space-y-2 text-sm text-[color:var(--tvx-ink-soft)]">
                      {optimization.tips.map(
                        (
                          tip,
                          index
                        ) => (
                          <li
                            key={index}
                            className="flex gap-2"
                          >
                            <span className="text-[color:var(--tvx-orange)]">
                              •
                            </span>

                            <span>
                              {tip}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Hotel */}

        <div className="tvx-card mb-8 p-8">
          <h2 className="tvx-serif mb-6 text-2xl">
            Recommended Hotel
          </h2>

          {plan.hotel.image && (
            <img
              src={plan.hotel.image}
              alt={plan.hotel.name}
              className="mb-6 h-56 w-full rounded-xl object-cover"
            />
          )}

          <p className="font-semibold">
            {plan.hotel.name}
          </p>

          <p>
            {plan.hotel.address}
          </p>

          <p>
            ⭐ {plan.hotel.stars}
          </p>

          <p>
            💰 {plan.hotel.pricePerNight}
          </p>

          <p className="mb-4">
            {plan.hotel.reason}
          </p>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tvx-cta mt-6 inline-block rounded-full px-5 py-3"
          >
            📍 Open in Google Maps
          </a>
        </div>

        {/* Flights */}

        <div className="tvx-card mb-8 p-8">
          <h2 className="tvx-serif mb-6 text-2xl">
            Real Flights
          </h2>

          <p className="mb-6 text-[color:var(--tvx-ink-soft)]">
            Compare real flight prices for your selected trip.
          </p>

          <a
            href={flightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tvx-cta inline-block rounded-full px-5 py-3"
          >
            ✈️ Google Flights
          </a>
        </div>

        {/* Itinerary */}

        <div className="tvx-card relative overflow-hidden p-8 sm:p-12">
          <svg
            className="tvx-flightpath pointer-events-none absolute -right-10 -top-6 opacity-[0.08]"
            width="220"
            height="140"
            viewBox="0 0 220 140"
            aria-hidden="true"
          >
            <path
              d="M0 120 C 60 20, 140 20, 220 90"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
          </svg>

          <h2 className="tvx-serif relative mb-8 text-2xl">
            Travel itinerary
          </h2>

          <div className="relative space-y-8">
            {plan.days.map(
              (day, index) => (
                <div key={index}>
                  <DayBlock
                    day={day.day}
                    items={day.items}
                    onRegenerate={() =>
                      regenerateDay(
                        index
                      )
                    }
                    isRegenerating={
                      regeneratingDay ===
                      index
                    }
                  />

                  {index !==
                    plan.days.length -
                      1 && (
                    <div className="tvx-divider mt-8" />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Buttons */}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/plan"
            className="tvx-sans w-full rounded-full border border-[color:var(--tvx-border)] bg-transparent px-8 py-3.5 text-center text-[color:var(--tvx-navy)] transition-colors hover:border-[color:var(--tvx-navy)] sm:w-auto"
          >
            Plan another trip
          </Link>

          <button
            onClick={downloadPDF}
            className="tvx-cta tvx-sans w-full rounded-full px-8 py-3.5 font-medium sm:w-auto"
          >
            Download PDF
          </button>
        </div>

        <p className="tvx-mono mt-10 text-center text-[10px] text-[color:var(--tvx-muted-light)]">
          Designed Around Your Journey
        </p>

        <p className="tvx-mono mt-3 text-center text-[9px] tracking-[0.15em] text-[color:var(--tvx-muted-light)]">
          BY MIRAL ALSHARIEF
        </p>
      </div>
    </main>
  );
}