import Link from "next/link";
import {
  Camera,
  Play,
  MessageSquare,
  Mail,
  Heart,
  Shield,
  FileText,
  AlertTriangle,
  Phone,
  Coffee,
  Users,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-[#060810]/80 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Men Who Feel — Anonymous men's mental health community"
                className="h-8 w-auto"
                width={32}
                height={32}
                loading="lazy"
              />
              <span className="text-lg font-bold text-gradient">
                MenWhoFeel
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              A space where men don&apos;t have to explain themselves. Feel it,
              say it, move through it.
            </p>

            {/* Universal crisis prompt */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs font-semibold text-amber-400 mb-1">
                In crisis right now?
              </p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Free helplines are available 24/7 in most countries.
              </p>
            </div>

            <Link
              href="/crisis-helpline"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Phone className="h-3 w-3" />
              Find a helpline near you →
            </Link>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Navigate
            </h4>

            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Heart className="h-3 w-3" />
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/stories"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3 w-3" />
                  Stories
                </Link>
              </li>

              <li>
                <Link
                  href="/community"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="h-3 w-3" />
                  Community
                </Link>
              </li>

              <li>
                <Link
                  href="/family-and-friends"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  For Family &amp; Friends
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-3 w-3" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>

            <ul className="space-y-2">
              <li>
                <Link
                  href="/policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3 w-3" />
                  Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-3 w-3" />
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Disclaimer
                </Link>
              </li>

              <li>
                <Link
                  href="/rules"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-3 w-3" />
                  Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Connect
            </h4>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://instagram.com/men_whofeel"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                aria-label="Instagram"
              >
                <Camera className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>

              <a
                href="https://youtube.com/@MenWhoFeelClub"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                aria-label="YouTube"
              >
                <Play className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>

              <a
                href="https://x.com/men_whofeel"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors text-xs font-bold text-muted-foreground hover:text-primary flex items-center justify-center"
                aria-label="X"
              >
                X
              </a>
            </div>

            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>@men_whofeel</p>

              <p>
                <a
                  href="mailto:support@menwhofeel.online"
                  className="hover:text-primary"
                >
                  support@menwhofeel.online
                </a>
              </p>
            </div>

            {/* Ko-fi Support — tasteful, not desperate */}
            <div className="mt-5 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">
                This space is free and always will be. If it&apos;s helped you, you&apos;re welcome to keep it going.
              </p>
              <a
                href="https://ko-fi.com/menwhofeel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 hover:border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group"
                aria-label="Support Men Who Feel on Ko-fi"
              >
                <Coffee className="h-3.5 w-3.5 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
                Support us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/20 text-center text-xs text-muted-foreground">
          <p>
            © MenWhoFeel. Not a substitute for professional mental health care.
          </p>
        </div>
      </div>
    </footer>
  );
}
