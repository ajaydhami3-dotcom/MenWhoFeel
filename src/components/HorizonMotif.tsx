/**
 * The one signature visual device for this redesign: quiet, layered
 * horizon/contour lines — steady ground, not a literal mountain icon.
 * Fill uses currentColor so it automatically follows text-{token} classes
 * and adapts correctly between light and dark mode. Purely decorative.
 */
export default function HorizonMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 420"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0 210C120 176 240 244 360 216C480 188 600 250 720 214C840 178 960 240 1080 208C1140 192 1170 200 1200 196V420H0V210Z"
        fill="currentColor"
        className="text-primary/[0.05]"
      />
      <path
        d="M0 262C140 232 260 288 400 260C540 232 660 284 800 254C900 234 1020 270 1200 244V420H0V262Z"
        fill="currentColor"
        className="text-pine/[0.06]"
      />
      <path
        d="M0 314C160 292 320 330 480 308C640 286 780 322 940 300C1040 286 1120 292 1200 288V420H0V314Z"
        fill="currentColor"
        className="text-primary/[0.08]"
      />
      <path
        d="M0 220C120 186 240 254 360 226C480 198 600 260 720 224C840 188 960 250 1080 218C1140 202 1170 210 1200 206"
        stroke="currentColor"
        strokeWidth="1"
        className="text-primary/20"
      />
    </svg>
  );
}
