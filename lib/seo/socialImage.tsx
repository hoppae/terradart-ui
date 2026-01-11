import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type SocialImageOptions = {
  eyebrow: string;
  title: string;
  description: string;
};

export function createSocialImage({ eyebrow, title, description }: SocialImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b1020",
          color: "#ffffff",
          padding: 80,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 6, opacity: 0.9 }}>{eyebrow.toUpperCase()}</div>
        <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, marginTop: 20 }}>{title}</div>
        <div style={{ fontSize: 28, opacity: 0.85, marginTop: 28 }}>{description}</div>
        <div
          style={{
            position: "absolute",
            right: -200,
            top: -200,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.55), rgba(99,102,241,0.0) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -180,
            bottom: -220,
            width: 600,
            height: 600,
            borderRadius: 600,
            background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.35), rgba(34,197,94,0.0) 70%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}

