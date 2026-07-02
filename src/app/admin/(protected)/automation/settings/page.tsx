import { verifyAdminSession } from "@/lib/admin/dal";
import { getCategoriesForSelect } from "../../intel/queries";
import { getAutomationSettings } from "../queries";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Automation settings" };

export default async function SettingsPage() {
  await verifyAdminSession();

  const [settings, categories] = await Promise.all([
    getAutomationSettings(),
    getCategoriesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Automation settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure AI providers, image generation, social publishing, and prompt templates.
        </p>
      </div>
      <SettingsForm settings={settings} categories={categories} />
    </div>
  );
}
