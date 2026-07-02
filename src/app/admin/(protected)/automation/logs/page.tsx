import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/admin/dal";
import { getAutomationLogs } from "../queries";
import { LogsTable } from "./LogsTable";

export const metadata = { title: "Automation logs" };

type SearchParams = Promise<{ job?: string }>;

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  await verifyAdminSession();
  const { job } = await searchParams;
  const jobId = job ? Number(job) : undefined;
  const logs = await getAutomationLogs(jobId, 200);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Logs</h1>
        <p className="text-sm text-muted-foreground">
          {jobId ? `Showing logs for job #${jobId}` : `Latest ${logs.length} log entries`}
        </p>
      </div>
      <Suspense>
        <LogsTable logs={logs} jobId={jobId} />
      </Suspense>
    </div>
  );
}
