import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tractionflo — first users without the grind";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #fafafa 0%, #ffffff 45%, #eff6ff 100%)",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#0A0A0A",
          }}
        >
          Tractionflo
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: 500,
            color: "#4B5563",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Find real leads, draft outreach, approve with confidence — get first
          users without the grind.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            fontWeight: 600,
            color: "#2563EB",
          }}
        >
          Early access for founders
        </div>
      </div>
    ),
    { ...size },
  );
}
