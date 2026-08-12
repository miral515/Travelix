"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import Logo from "../components/Logo";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    async function generateTrip() {
      const params = new URLSearchParams(window.location.search);

      const body = {
        destination: params.get("destination"),
        departureCity: params.get("departureCity"),
        travelDate: params.get("travelDate"),
        tripLength: params.get("tripLength"),
        budget: params.get("budget"),
        travelers: params.get("travelers"),
        interests: (params.get("interests") || "").split(","),
      };

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
  const error = await res.json();
  console.log("API ERROR:", error);

  throw new Error(error.error || "Failed to generate trip");
}

        const data = await res.json();

        sessionStorage.setItem(
          "travelPlan",
          JSON.stringify(data)
        );
        sessionStorage.setItem(
  "tripInfo",
  JSON.stringify({
    departureCity: body.departureCity,
    destination: body.destination,
    travelDate: body.travelDate,
  })
);

        router.push("/result");

         }   catch (err) {
  console.error("GENERATE ERROR:", err);
  alert(String(err));
  router.push("/plan");
}
}

    generateTrip();
  }, [router]);

  return (
    <main className="tvx-page min-h-screen flex flex-col items-center justify-center px-6">
      <Logo variant="compact" className="mb-14" />

      <div className="relative mb-10 h-16 w-64">
        <div className="tvx-divider absolute left-0 right-0 top-1/2" />

        <Plane
          size={26}
          className="tvx-plane-fly absolute top-1/2 rotate-90 text-[color:var(--tvx-orange)]"
        />
      </div>

      <h1 className="tvx-serif text-3xl sm:text-4xl text-center mb-3">
        Planning your perfect trip...
      </h1>

      <p className="tvx-sans text-center max-w-md text-[color:var(--tvx-ink-soft)]">
        Travelix AI is creating a personalized itinerary based on your
        destination, budget, and interests.
      </p>

      <div className="flex gap-2 mt-10">
        <span className="tvx-dot" />
        <span
          className="tvx-dot"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="tvx-dot"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </main>
  );
}