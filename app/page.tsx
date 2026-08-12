import Link from "next/link";
import { Plane, MapPin } from "lucide-react";

const barcode = [7, 4, 6, 2, 5, 3, 7, 4];

type FieldProps = {
  label: string;
  value: string;
  big?: boolean;
};

function Field({ label, value, big }: FieldProps) {
  return (
    <div>
      <p className="tvx-label">{label}</p>
      <p className={big ? "tvx-value-big" : "tvx-value"}>{value}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="tvx-page min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Wordmark */}
      <div className="flex items-center gap-3 mb-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ border: "1.5px solid #16283A" }}
        >
          <Plane
            size={18}
            color="#16283A"
            style={{ transform: "rotate(45deg)" }}
          />
        </div>

        <div>
          <p className="tvx-mono text-xs" style={{ color: "#16283A" }}>
            TRAVELIX
          </p>
          <p className="tvx-mono text-[10px]" style={{ color: "#8A7F63" }}>
            AI ITINERARY CO.
          </p>
        </div>
      </div>

      {/* Headline */}
      <h1 className="tvx-serif text-center text-4xl sm:text-5xl leading-tight max-w-2xl">
        Plan the trip only you would take.
      </h1>

      <p
        className="tvx-sans mt-4 text-center max-w-md"
        style={{ color: "#5C5642" }}
      >
        Tell Travelix where you're headed and what you love. It builds the
        itinerary.
      </p>

      {/* Boarding Pass */}
      <div className="tvx-card mt-12 w-full max-w-xl flex shadow-sm">
        <div className="flex-1 p-6 sm:p-8">
          <div className="flex justify-between tvx-label">
            <span>BOARDING PASS</span>
            <span>CLASS: ADVENTURE</span>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Field label="FROM" value="HERE" big />

            <div className="flex-1 mx-4 relative h-6 flex items-center">
              <div
                className="w-full border-t border-dashed"
                style={{ borderColor: "#C7B896" }}
              />

              <Plane
                size={16}
                color="#D9552E"
                style={{
                  transform: "rotate(90deg)",
                  position: "absolute",
                  left: "50%",
                  marginLeft: "-8px",
                  backgroundColor: "#FBF5E8",
                }}
              />
            </div>

            <div className="text-right">
              <Field label="TO" value="ANYWHERE" big />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <Field label="PASSENGER" value="YOU" />
            <Field label="GATE" value="AI-01" />
            <Field label="SEAT" value="1A" />
          </div>
        </div>

        <div className="tvx-perf tvx-stub w-6 flex flex-col justify-between py-2" />

        <div className="tvx-stub w-28 sm:w-32 p-4 flex flex-col justify-between items-center">
          <MapPin size={18} color="#1F6F6B" />

          <div className="flex flex-col gap-[3px] items-center">
            {barcode.map((w, i) => (
              <div
                key={i}
                style={{
                  width: w * 2,
                  height: 2,
                  backgroundColor: "#16283A",
                }}
              />
            ))}
          </div>

          <p className="tvx-label text-[9px]">NO. 0042</p>
        </div>
      </div>

      {/* CTA */}
      <Link
  href="/plan"
  className="tvx-btn tvx-sans mt-10 rounded-full px-7 py-3 font-medium text-sm flex items-center gap-2"
>
  Plan your trip
  <Plane
    size={16}
    className="tvx-plane"
    style={{ transform: "rotate(90deg)" }}
  />
</Link>
    </main>
  );
}
