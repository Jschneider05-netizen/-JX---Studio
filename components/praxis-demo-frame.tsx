"use client";

export default function PraxisDemoFrame() {
  return (
    <iframe
      src="/praxis-preview/index.html"
      title="Bremen Ost Hausärzte"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        border: 0,
        background: "#ffffff",
        zIndex: 999999,
      }}
    />
  );
}
