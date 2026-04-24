const OPENAI_TIMEOUT_MS = 12_000;

export async function openaiJson<T>(
  apiKey: string,
  system: string,
  user: string,
  temperature = 0.35,
): Promise<T | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), OPENAI_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: ac.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[demand] OpenAI HTTP", res.status, t.slice(0, 400));
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    console.error(
      aborted ? "[demand] OpenAI timeout" : "[demand] OpenAI fetch error",
      e instanceof Error ? e.message.slice(0, 120) : e,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
