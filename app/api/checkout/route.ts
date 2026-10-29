// Direct online payments intentionally disabled for the JX STUDIO public launch.
// Configurator, project inquiries and future checkout implementation remain preserved in Git history.
export async function GET() { return Response.json({ enabled: false, terms: "", privacy: "" }, { headers: { "cache-control": "no-store" } }); }
export async function POST() { return Response.json({ error: "Online-Zahlungen sind derzeit deaktiviert. Bitte sende deine Konfiguration als unverbindliche Anfrage." }, { status: 503, headers: { "cache-control": "no-store" } }); }
