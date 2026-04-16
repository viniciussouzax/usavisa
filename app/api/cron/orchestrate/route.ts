import { orchestrate } from "@/shared/pipeline/orchestrator";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!secret || secret !== process.env.ORCHESTRATOR_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await orchestrate();
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
