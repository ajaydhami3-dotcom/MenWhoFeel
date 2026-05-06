import { Link } from "react-router";
import { Instagram, Youtube, MessageCircle, Twitter, Mail, Heart, Shield, FileText, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-slate-950/50 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MenWhoFeel" className="h-8 w-auto" />
              <span className="text-lg font-bold text-gradient">MenWhoFeel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A safe space for men to feel, heal, and grow together. Breaking the stigma around men's mental health.
            </p>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Navigate</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Heart className="h-3 w-3" /> About</Link></li>
              <li><Link to="/rules" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Shield className="h-3 w-3" /> Rules</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Mail className="h-3 w-3" /> Contact</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/policy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><FileText className="h-3 w-3" /> Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Shield className="h-3 w-3" /> Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Disclaimer</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Connect</h4>
            <div className="flex flex-wrap gap-3">
              <a href="https://instagram.com/menwhofeel.club" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="https://youtube.com/@menwhofeel.club" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors">
                <Youtube className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors" title="X (Twitter) - Coming Soon">
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors" title="Discord - Coming Soon">
                <MessageCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Insta: @menwhofeel.club</p>
              <p>YouTube: @menwhofeel.club</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
          <p>MenWhoFeel Club. All rights reserved. Not a substitute for professional mental health care.</p>
        </div>
      </div>
    </footer>
  );
}
