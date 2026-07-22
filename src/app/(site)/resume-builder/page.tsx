import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ResumeBuilderClient from "./ResumeBuilderClient";

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Resume Builder | Men Who Feel" },
  description: "Build a resume, get AI help with the wording, download it as a PDF.",
  alternates: { canonical: `${BASE_URL}/resume-builder` },
  // Personal, session-tied content — nothing here is meant to be crawled,
  // same posture as the assessment results / debrief pages.
  robots: { index: false, follow: true },
};

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      {/* Sensible print margins — the browser's own defaults are usually
          too wide for a resume. Scoped to this page only. */}
      <style>{`@media print { @page { margin: 0.5in; } }`}</style>

      <div className="mx-auto max-w-6xl print:max-w-none">
        <div className="print:hidden">
          <Breadcrumb crumbs={[
            { label: "Home", href: "/" },
            { label: "Career Hub", href: "/career-hub" },
            { label: "Resume Builder" },
          ]} />

          <div className="mb-8">
            <h1 className="font-display text-[2.2rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-4xl">
              Resume Builder
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Fill it in, get AI help tightening the wording, download a PDF. Saved automatically to your session so
              you can come back and keep working on it.
            </p>
          </div>
        </div>

        <ResumeBuilderClient />
      </div>
    </div>
  );
}
