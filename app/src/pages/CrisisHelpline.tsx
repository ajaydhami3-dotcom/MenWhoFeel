import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Heart, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useState } from "react";

const defaultHelplines = [
  { country: "United States", countryCode: "US", organization: "988 Suicide & Crisis Lifeline", phoneNumber: "988", description: "Free, confidential support for people in distress", availableHours: "24/7", website: "https://988lifeline.org" },
  { country: "United Kingdom", countryCode: "GB", organization: "Samaritans", phoneNumber: "116 123", description: "Confidential listening service", availableHours: "24/7", website: "https://www.samaritans.org" },
  { country: "Canada", countryCode: "CA", organization: "Crisis Services Canada", phoneNumber: "1-833-456-4566", description: "Suicide prevention and support", availableHours: "24/7", website: "https://www.crisisservicescanada.ca" },
  { country: "Australia", countryCode: "AU", organization: "Lifeline Australia", phoneNumber: "13 11 14", description: "Crisis support and suicide prevention", availableHours: "24/7", website: "https://www.lifeline.org.au" },
  { country: "India", countryCode: "IN", organization: "Vandrevala Foundation", phoneNumber: "1860-2662-345", description: "Mental health helpline", availableHours: "24/7", website: "https://www.vandrevalafoundation.com" },
  { country: "Germany", countryCode: "DE", organization: "Telefonseelsorge", phoneNumber: "0800 111 0 111", description: "Crisis support and counseling", availableHours: "24/7", website: "https://www.telefonseelsorge.de" },
  { country: "France", countryCode: "FR", organization: "SOS Amitie", phoneNumber: "09 72 39 40 50", description: "Emotional support helpline", availableHours: "24/7", website: "https://www.sos-amitie.org" },
  { country: "South Africa", countryCode: "ZA", organization: "Lifeline South Africa", phoneNumber: "0861 322 322", description: "Crisis intervention and counseling", availableHours: "24/7", website: "https://www.lifelinesa.co.za" },
  { country: "New Zealand", countryCode: "NZ", organization: "Lifeline NZ", phoneNumber: "0800 543 354", description: "Crisis support", availableHours: "24/7", website: "https://www.lifeline.org.nz" },
  { country: "Singapore", countryCode: "SG", organization: "Samaritans of Singapore", phoneNumber: "1-767", description: "Crisis support and suicide prevention", availableHours: "24/7", website: "https://www.sos.org.sg" },
  { country: "Ireland", countryCode: "IE", organization: "Samaritans Ireland", phoneNumber: "116 123", description: "Confidential emotional support", availableHours: "24/7", website: "https://www.samaritans.org" },
  { country: "Netherlands", countryCode: "NL", organization: "113 Zelfmoordpreventie", phoneNumber: "0800-0113", description: "Suicide prevention helpline", availableHours: "24/7", website: "https://www.113.nl" },
];

export default function CrisisHelplinePage() {
  const { data: dbHelplines } = trpc.helplines.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const helplines = dbHelplines?.length ? dbHelplines : defaultHelplines;
  const filtered = searchTerm
    ? helplines.filter((h) => h.country.toLowerCase().includes(searchTerm.toLowerCase()) || h.organization.toLowerCase().includes(searchTerm.toLowerCase()))
    : helplines;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gradient flex items-center justify-center gap-3">
            <Phone className="h-8 w-8" />
            Crisis Helpline
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            If you or someone you know is in crisis, please reach out. Help is available 24/7 around the world.
          </p>
        </div>

        <Card className="mb-8 border-red-500/30 bg-red-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-400">Emergency Notice</p>
              <p className="text-sm text-red-300/80">
                If you are in immediate danger or having thoughts of harming yourself, please call your local emergency number (like 911, 999, 112) immediately. This page is not a substitute for emergency services.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by country or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/40 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((helpline, i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-sm border-border/40 card-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {helpline.country}
                  </CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {helpline.availableHours || "24/7"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium text-sm">{helpline.organization}</p>
                <p className="text-sm text-muted-foreground">{helpline.description}</p>
                <div className="flex items-center gap-3 pt-2">
                  <a href={`tel:${helpline.phoneNumber}`}>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <Phone className="h-3 w-3 mr-1" /> {helpline.phoneNumber}
                    </Button>
                  </a>
                  {helpline.website && (
                    <a href={helpline.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                        <ExternalLink className="h-3 w-3 mr-1" /> Website
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-card/80 border-border/40">
          <CardContent className="p-5 text-center">
            <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              You are not alone. Reaching out is a sign of strength, not weakness. These organizations exist because people care and want to help.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
