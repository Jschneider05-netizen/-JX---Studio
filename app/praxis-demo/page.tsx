export default function PraxisDemo() {
  return (
    <main style={{ margin: 0, background: "#fff" }}>
      <div style={{
        background: "#080b12",
        color: "white",
        padding: "12px 20px",
        fontFamily: "Arial",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap"
      }}>
        <strong>JX STUDIO · PRAXIS AM PARK</strong>
        
      </div>

      <iframe
        src="https://praxis-am-park-jx.ample-gem-3729.chatgpt.site/"
        title="Praxis am Park – Live-Demo"
        style={{
          width: "100%",
          height: "calc(100dvh - 52px)",
          border: 0,
          display: "block"
        }}
        allowFullScreen
      />
    </main>
  );
}
