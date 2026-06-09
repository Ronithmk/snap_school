import type { School, SchoolClass, Student } from "@/types";

interface AccessCardProps {
  student: Student;
  school: School;
  schoolClass: SchoolClass | undefined;
  galleryUrl: string;
  cartUrl: string;
  orderClosingDate: string;
}

/**
 * Printable A5 access card — one per student.
 * Rendered inside a print-only container; do NOT wrap in any card/shadow UI.
 */
export function AccessCardTemplate({
  student,
  school,
  schoolClass,
  galleryUrl,
  cartUrl,
  orderClosingDate,
}: AccessCardProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(cartUrl)}&bgcolor=ffffff&color=000000&format=png`;
  const formattedDate = orderClosingDate
    ? new Date(orderClosingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  // Strip protocol for display
  const displayUrl = galleryUrl.replace(/^https?:\/\//, "");

  return (
    <div
      className="access-card-page"
      style={{
        width: "148mm",
        minHeight: "210mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: "#111",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        pageBreakAfter: "always",
        breakAfter: "page",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          backgroundColor: "#1a3a6b",
          color: "#fff",
          padding: "10px 14px 8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {school.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={school.logoUrl} alt={school.name} style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0, background: "#fff" }} />
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", lineHeight: 1.2, wordBreak: "break-word" }}>
            {school.name}
          </div>
          <div style={{ fontSize: "9px", marginTop: 2, opacity: 0.85, textAlign: "right" }}>
            Establishment number: {school.id.replace(/\D/g, "").slice(0, 5).padStart(5, "0")}
          </div>
        </div>
      </div>

      {/* ── Subtitle ── */}
      <div
        style={{
          borderBottom: "2px solid #1a3a6b",
          textAlign: "center",
          padding: "8px 12px",
          color: "#444",
          fontSize: "10px",
          lineHeight: 1.5,
        }}
      >
        This year, place your orders online.<br />
        <strong>Secure and unique access for your child.</strong>
      </div>

      {/* ── Student info row ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #ddd", minHeight: "80px" }}>
        {/* Photos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.coverPhotoUrl ?? ""}
            alt={student.name}
            style={{ width: 70, height: 70, objectFit: "cover", border: "1px solid #ccc" }}
          />
          {/* Class cover as second photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={school.bannerUrl ?? ""}
            alt="Class photo"
            style={{ width: 70, height: 70, objectFit: "cover", border: "1px solid #ccc" }}
          />
        </div>

        {/* Number, Class, QR */}
        <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "0.05em", color: "#111" }}>
              {student.number}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#222", marginTop: 2 }}>
              {student.name}
            </div>
            {schoolClass ? (
              <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#555", marginTop: 1 }}>
                {schoolClass.name}
              </div>
            ) : null}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR code" style={{ width: 70, height: 70 }} />
        </div>
      </div>

      {/* ── Steps ── */}
      <div style={{ padding: "12px 14px", flex: 1 }}>
        {/* Step 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <StepBadge n={1} />
          <div>
            <div style={{ fontWeight: "bold", fontSize: "10px", textTransform: "uppercase", marginBottom: 3 }}>
              Log in to:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#1a3a6b" }}>
              <span style={{ fontSize: "13px" }}>🏠</span>
              <span style={{ fontSize: "11px", fontWeight: "bold" }}>{displayUrl}</span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <StepBadge n={2} />
          <div>
            <div style={{ fontWeight: "bold", fontSize: "10px", textTransform: "uppercase", marginBottom: 3 }}>
              Enter your login details:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#1a3a6b", marginBottom: 3 }}>
              <span style={{ fontSize: "13px" }}>👤</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "0.04em" }}>{student.username}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#1a3a6b" }}>
              <span style={{ fontSize: "13px" }}>🔒</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "0.08em" }}>{student.accessCode}</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <StepBadge n={3} />
          <div style={{ fontWeight: "bold", fontSize: "10px", textTransform: "uppercase", paddingTop: 2 }}>
            Order your photos
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: "2px solid #1a3a6b",
          padding: "8px 14px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {formattedDate ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: "bold", fontSize: "10px", textTransform: "uppercase" }}>
              Orders closed on:
            </span>
            <span style={{ color: "#c0392b", fontWeight: "bold", fontSize: "12px" }}>
              {formattedDate}
            </span>
          </div>
        ) : null}
        <div style={{ fontSize: "8.5px", color: "#666", lineHeight: 1.5 }}>
          All orders will be delivered to the establishment within approximately 2 to 3 weeks after the closing date.
        </div>
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: "2px solid #1a3a6b",
        color: "#1a3a6b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "11px",
        flexShrink: 0,
        marginTop: 1,
      }}
    >
      {n}
    </div>
  );
}
