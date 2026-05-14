"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Heart, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc"; // Updated to match your actual trpc client path!
import { useState } from "react";

// Expanded to include Universal directories and comprehensive global coverage
const defaultHelplines = [
  // --- UNIVERSAL / GLOBAL DIRECTORIES ---
  { country: "Universal / Global", countryCode: "INT", organization: "Befrienders Worldwide", phoneNumber: "Directory Available Online", description: "Global directory of emotional support centers", availableHours: "24/7", website: "https://www.befrienders.org" },
  { country: "Universal / Global", countryCode: "INT", organization: "IASP Crisis Centers", phoneNumber: "Directory Available Online", description: "International Association for Suicide Prevention database", availableHours: "24/7", website: "https://www.iasp.info/resources/Crisis_Centres/" },
  { country: "Universal / Global", countryCode: "INT", organization: "Find A Helpline", phoneNumber: "Directory Available Online", description: "Searchable global database of helplines", availableHours: "24/7", website: "https://findahelpline.com/" },
  
  // --- NORTH AMERICA ---
  { country: "United States", countryCode: "US", organization: "988 Suicide & Crisis Lifeline", phoneNumber: "988", description: "Free, confidential support for people in distress", availableHours: "24/7", website: "https://988lifeline.org" },
  { country: "United States", countryCode: "US", organization: "The Trevor Project (LGBTQ+)", phoneNumber: "1-866-488-7386", description: "Crisis intervention and suicide prevention for LGBTQ youth", availableHours: "24/7", website: "https://www.thetrevorproject.org" },
  { country: "United States", countryCode: "US", organization: "Veterans Crisis Line", phoneNumber: "988 (Press 1)", description: "Confidential crisis support for Veterans and their loved ones", availableHours: "24/7", website: "https://www.veteranscrisisline.net/" },
  { country: "Canada", countryCode: "CA", organization: "Talk Suicide Canada", phoneNumber: "1-833-456-4566", description: "Suicide prevention and support", availableHours: "24/7", website: "https://talksuicide.ca/" },
  { country: "Mexico", countryCode: "MX", organization: "SAPTEL", phoneNumber: "(55) 5259-8121", description: "Mental health and crisis intervention", availableHours: "24/7", website: "http://www.saptel.org.mx/" },

  // --- EUROPE ---
  { country: "United Kingdom", countryCode: "GB", organization: "Samaritans", phoneNumber: "116 123", description: "Confidential listening service", availableHours: "24/7", website: "https://www.samaritans.org" },
  { country: "United Kingdom", countryCode: "GB", organization: "SHOUT", phoneNumber: "Text SHOUT to 85258", description: "Confidential 24/7 text service", availableHours: "24/7", website: "https://giveusashout.org/" },
  { country: "Ireland", countryCode: "IE", organization: "Samaritans Ireland", phoneNumber: "116 123", description: "Confidential emotional support", availableHours: "24/7", website: "https://www.samaritans.org" },
  { country: "Germany", countryCode: "DE", organization: "Telefonseelsorge", phoneNumber: "0800 111 0 111", description: "Crisis support and counseling", availableHours: "24/7", website: "https://www.telefonseelsorge.de" },
  { country: "France", countryCode: "FR", organization: "Suicide Écoute", phoneNumber: "01 45 39 40 00", description: "Emotional support helpline", availableHours: "24/7", website: "https://www.suicide-ecoute.fr/" },
  { country: "Italy", countryCode: "IT", organization: "Telefono Amico", phoneNumber: "02 2327 2327", description: "Emotional support and listening", availableHours: "10:00 - 24:00", website: "https://www.telefonoamico.it/" },
  { country: "Spain", countryCode: "ES", organization: "Teléfono de la Esperanza", phoneNumber: "717 003 717", description: "Crisis intervention and emotional support", availableHours: "24/7", website: "https://telefonodelaesperanza.org/" },
  { country: "Netherlands", countryCode: "NL", organization: "113 Zelfmoordpreventie", phoneNumber: "0800-0113", description: "Suicide prevention helpline", availableHours: "24/7", website: "https://www.113.nl" },
  { country: "Sweden", countryCode: "SE", organization: "Mind Självmordslinjen", phoneNumber: "90101", description: "Suicide prevention line", availableHours: "24/7", website: "https://mind.se/" },

  // --- ASIA ---
  { country: "India", countryCode: "IN", organization: "Vandrevala Foundation", phoneNumber: "9999 666 555", description: "Mental health helpline", availableHours: "24/7", website: "https://www.vandrevalafoundation.com" },
  { country: "India", countryCode: "IN", organization: "AASRA", phoneNumber: "9820466726", description: "Crisis intervention and suicide prevention", availableHours: "24/7", website: "http://www.aasra.info/" },
  { country: "Japan", countryCode: "JP", organization: "TELL Lifeline", phoneNumber: "03-5774-0992", description: "English-speaking crisis support", availableHours: "Varies", website: "https://telljp.com/" },
  { country: "South Korea", countryCode: "KR", organization: "Lifeline Korea", phoneNumber: "1588-9191", description: "Suicide prevention and crisis counseling", availableHours: "24/7", website: "https://www.lifeline.or.kr/" },
  { country: "Singapore", countryCode: "SG", organization: "Samaritans of Singapore", phoneNumber: "1-767", description: "Crisis support and suicide prevention", availableHours: "24/7", website: "https://www.sos.org.sg" },
  { country: "Philippines", countryCode: "PH", organization: "NCMH Crisis Hotline", phoneNumber: "1553", description: "National Center for Mental Health", availableHours: "24/7", website: "https://ncmh.gov.ph/" },

  // --- OCEANIA ---
  { country: "Australia", countryCode: "AU", organization: "Lifeline Australia", phoneNumber: "13 11 14", description: "Crisis support and suicide prevention", availableHours: "24/7", website: "https://www.lifeline.org.au" },
  { country: "Australia", countryCode: "AU", organization: "Beyond Blue", phoneNumber: "1300 22 4636", description: "Mental health support", availableHours: "24/7", website: "https://www.beyondblue.org.au/" },
  { country: "New Zealand", countryCode: "NZ", organization: "Lifeline NZ", phoneNumber: "0800 543 354", description: "Crisis support", availableHours: "24/7", website: "https://www.lifeline.org.nz" },

  // --- AFRICA ---
  { country: "South Africa", countryCode: "ZA", organization: "SADAG Mental Health Line", phoneNumber: "0800 456 789", description: "Crisis intervention and counseling", availableHours: "24/7", website: "https://www.sadag.org/" },
  { country: "Kenya", countryCode: "KE", organization: "Befrienders Kenya", phoneNumber: "+254 722 178 177", description: "Emotional support", availableHours: "24/7", website: "https://www.befrienderskenya.org/" },

  // --- SOUTH AMERICA ---
  { country: "Brazil", countryCode: "BR", organization: "CVV - Centro de Valorização da Vida", phoneNumber: "188", description: "Emotional support and suicide prevention", availableHours: "24/7", website: "https://www.cvv.org.br/" },
  { country: "Argentina", countryCode: "AR", organization: "Centro de Asistencia al Suicida", phoneNumber: "135", description: "Crisis support line (toll-free in Buenos Aires)", availableHours: "08:00 - 24:00", website: "https://www.casbuenosaires.com.ar/" },
  { country: "Colombia", countryCode: "CO", organization: "Línea 106", phoneNumber: "106", description: "Listening and psychological support", availableHours: "24/7", website: "" },
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
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/40 text-sm focus:outline-none focus:border-primary/50 text-foreground"
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
                  {helpline.phoneNumber.includes("Directory") ? (
                    <Button size="sm" variant="secondary" className="cursor-default pointer-events-none opacity-80">
                      <Globe className="h-3 w-3 mr-1" /> Online Directory
                    </Button>
                  ) : (
                    <a href={`tel:${helpline.phoneNumber.replace(/[^0-9+]/g, '')}`}>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
                        <Phone className="h-3 w-3 mr-1" /> {helpline.phoneNumber}
                      </Button>
                    </a>
                  )}
                  
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