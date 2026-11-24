import type { Metadata } from "next";
import PraxisDemoFrame from "@/components/praxis-demo-frame";

export const metadata: Metadata = {
  title: "Bremen Ost Hausärzte",
  description: "Hausärztliche Gemeinschaftspraxis in Bremen.",
  alternates: {
    canonical: "/praxis-demo",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PraxisDemo() {
  return <PraxisDemoFrame />;
}
