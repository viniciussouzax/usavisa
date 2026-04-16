import "server-only";
import type { DS160Applicant } from "./types";

const APIFY_API = "https://api.apify.com/v2";

export type DispatchResult = {
  runId: string;
  status: string;
  consoleUrl: string;
};

export type DispatchCredentials = {
  apifyApiToken: string;
  apifyActorId: string;
  capmonsterApiKey: string;
};

export async function dispatchDs160Run(
  applicant: DS160Applicant,
  credentials: DispatchCredentials,
  opts: { mode?: "real" | "dry_run"; applicationId?: string } = {},
): Promise<DispatchResult> {
  const { apifyApiToken, apifyActorId, capmonsterApiKey } = credentials;
  if (!apifyApiToken) throw new Error("apifyApiToken ausente");
  if (!apifyActorId) throw new Error("apifyActorId ausente");

  const url = `${APIFY_API}/acts/${encodeURIComponent(apifyActorId)}/runs?token=${apifyApiToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      applicant,
      applicationId: opts.applicationId,
      mode: opts.mode ?? "real",
      credentials: {
        capmonsterApiKey,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify dispatch falhou (${res.status}): ${text.slice(0, 500)}`);
  }

  const payload = (await res.json()) as { data: { id: string; status: string } };
  return {
    runId: payload.data.id,
    status: payload.data.status,
    consoleUrl: `https://console.apify.com/actors/runs/${payload.data.id}`,
  };
}
