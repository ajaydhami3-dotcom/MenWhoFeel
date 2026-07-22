import type { ResumeExperienceEntry, ResumeEducationEntry } from "@/db/schema";

// Renders the same data three different ways depending on `template`.
// This same component is what prints — the parent page's print stylesheet
// hides everything else and lets this fill the page, rather than this
// component needing its own separate "PDF version." No PDF-generation
// library involved: this is styled HTML, and "Download PDF" is the
// browser's own print-to-PDF, which is simpler and more reliable to get
// right than driving a PDF-rendering library blind.

export type ResumePreviewData = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  summary: string;
  template: string;
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
};

function formatRange(start?: string, end?: string, current?: boolean) {
  if (!start) return "";
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    if (!m) return y;
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[Number(m) - 1]} ${y}`;
  };
  return `${fmt(start)} – ${current ? "Present" : end ? fmt(end) : ""}`;
}

export default function ResumePreview({ data }: { data: ResumePreviewData }) {
  const contactLine = [data.email, data.phone, [data.city, data.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("  ·  ");

  if (data.template === "classic") {
    return (
      <div className="resume-page bg-white text-black p-10 font-serif">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">{data.fullName || "Your Name"}</h1>
          {contactLine && <p className="text-sm mt-1">{contactLine}</p>}
        </div>
        {data.summary && (
          <section className="mb-5">
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black mb-2 pb-1">Experience</h2>
            <div className="space-y-3">
              {data.experience.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-sm">{e.title}{e.company ? `, ${e.company}` : ""}</p>
                    <p className="text-xs italic">{formatRange(e.startDate, e.endDate, e.current)}</p>
                  </div>
                  {e.location && <p className="text-xs italic">{e.location}</p>}
                  <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black mb-2 pb-1">Education</h2>
            <div className="space-y-2">
              {data.education.map((ed) => (
                <div key={ed.id} className="flex justify-between items-baseline">
                  <p className="text-sm font-bold">{ed.degree}{ed.field ? `, ${ed.field}` : ""} — {ed.school}</p>
                  <p className="text-xs italic">{formatRange(ed.startDate, ed.endDate)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black mb-2 pb-1">Skills</h2>
            <p className="text-sm">{data.skills.join(" · ")}</p>
          </section>
        )}
      </div>
    );
  }

  if (data.template === "minimal") {
    return (
      <div className="resume-page bg-white text-black p-10 font-sans">
        <h1 className="text-xl font-semibold">{data.fullName || "Your Name"}</h1>
        {contactLine && <p className="text-xs text-gray-600 mt-0.5">{contactLine}</p>}
        {data.summary && <p className="text-sm mt-4 text-gray-800">{data.summary}</p>}

        {data.experience.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{e.title} — {e.company}</span>
                    <span className="text-gray-500 text-xs">{formatRange(e.startDate, e.endDate, e.current)}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="text-sm text-gray-700">— {b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Education</h2>
            <div className="space-y-1">
              {data.education.map((ed) => (
                <div key={ed.id} className="flex justify-between text-sm">
                  <span>{ed.degree}{ed.field ? `, ${ed.field}` : ""} — {ed.school}</span>
                  <span className="text-gray-500 text-xs">{formatRange(ed.startDate, ed.endDate)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Skills</h2>
            <p className="text-sm text-gray-700">{data.skills.join(", ")}</p>
          </section>
        )}
      </div>
    );
  }

  // "modern" — default
  return (
    <div className="resume-page bg-white text-black p-10 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#8a4a1f]">{data.fullName || "Your Name"}</h1>
        {contactLine && <p className="text-sm text-gray-600 mt-1">{contactLine}</p>}
      </div>
      {data.summary && <p className="text-sm leading-relaxed text-gray-800 mb-6">{data.summary}</p>}

      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8a4a1f] border-b-2 border-[#8a4a1f]/30 pb-1 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-sm">{e.title}</p>
                  <p className="text-xs text-gray-500">{formatRange(e.startDate, e.endDate, e.current)}</p>
                </div>
                <p className="text-sm text-gray-600">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                <ul className="mt-1.5 space-y-1">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="text-sm text-gray-800 flex gap-2">
                      <span className="text-[#8a4a1f]">•</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8a4a1f] border-b-2 border-[#8a4a1f]/30 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((ed) => (
              <div key={ed.id}>
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold">{ed.degree}{ed.field ? `, ${ed.field}` : ""}</p>
                  <p className="text-xs text-gray-500">{formatRange(ed.startDate, ed.endDate)}</p>
                </div>
                <p className="text-sm text-gray-600">{ed.school}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8a4a1f] border-b-2 border-[#8a4a1f]/30 pb-1 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span key={i} className="text-xs bg-[#8a4a1f]/10 text-[#8a4a1f] px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
