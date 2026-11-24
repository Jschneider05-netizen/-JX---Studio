"use client";

import { useState } from "react";
import Link from "next/link";

export default function PraxisDemoFrame() {
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="page-main">
      <section className="page-intro">
        <Link href="/">← JX STUDIO</Link>

        <p className="eyebrow">Webdesign · Praxiswebsite</p>

        <h1>Bremen Ost Hausärzte.</h1>

        <p>Website-Entwurf von JX STUDIO.</p>

        {!loaded ? (
          <>
            <p>
              Die Website wird extern bei STRATO gehostet.
              Beim Laden werden Verbindungsdaten an den
              Anbieter übertragen.{" "}
              <Link href="/datenschutz">
                Datenschutzhinweise
              </Link>
            </p>

            <button
              className="btn-primary"
              onClick={() => setLoaded(true)}
            >
              Website ansehen
            </button>
          </>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => setLoaded(false)}
          >
            Website schließen
          </button>
        )}
      </section>

      {loaded && (
        <iframe
          src="https://571600095.swh.strato-hosting.eu/website/"
          title="Bremen Ost Hausärzte"
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "80dvh",
            border: 0,
            background: "white",
          }}
        />
      )}
    </main>
  );
}
