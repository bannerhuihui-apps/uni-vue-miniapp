/** DeepSeek / 模板 AI 报告 → 页面可渲染块（轻量 Markdown 子集） */

export type AiReportInline = { kind: "text" | "bold"; text: string };

export type AiReportBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string; level: 2 | 3 }
  | { kind: "divider" }
  | { kind: "paragraph"; inlines: AiReportInline[] }
  | { kind: "disclaimer"; inlines: AiReportInline[] };

export function normalizeAiReportRaw(raw: string): string {
  return String(raw ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

export function parseAiReportInlines(line: string): AiReportInline[] {
  const src = line.trim();
  if (!src) return [];

  const parts: AiReportInline[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) {
      parts.push({ kind: "text", text: src.slice(last, m.index) });
    }
    parts.push({ kind: "bold", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) {
    parts.push({ kind: "text", text: src.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ kind: "text", text: src });
  }
  return parts;
}

function isDividerLine(line: string): boolean {
  const s = line.trim();
  return /^-{3,}$/.test(s) || /^\*{3,}$/.test(s);
}

function matchHeading(line: string): { level: 2 | 3; text: string } | null {
  const s = line.trim();
  const m3 = s.match(/^#{3}\s+(.+)$/);
  if (m3) return { level: 3, text: m3[1].trim() };
  const m2 = s.match(/^#{2}\s+(.+)$/);
  if (m2) return { level: 2, text: m2[1].trim() };
  const bracket = s.match(/^【(.+)】$/);
  if (bracket) return { level: 3, text: bracket[1].trim() };
  return null;
}

function isDisclaimerLine(line: string): boolean {
  return /免责声明/.test(line);
}

export function parseAiReportContent(raw: string): AiReportBlock[] {
  const text = normalizeAiReportRaw(raw);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: AiReportBlock[] = [];
  let titleUsed = false;

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("> ")) {
      line = line.slice(2).trim();
    } else if (line.startsWith(">")) {
      line = line.slice(1).trim();
    }

    if (isDividerLine(line)) {
      blocks.push({ kind: "divider" });
      continue;
    }

    const heading = matchHeading(line);
    if (heading) {
      blocks.push({ kind: "heading", level: heading.level, text: heading.text });
      continue;
    }

    if (!titleUsed && line === "AI 综合分析") {
      blocks.push({ kind: "title", text: line });
      titleUsed = true;
      continue;
    }

    const inlines = parseAiReportInlines(line);
    if (isDisclaimerLine(line)) {
      blocks.push({ kind: "disclaimer", inlines });
    } else {
      blocks.push({ kind: "paragraph", inlines });
    }
  }

  return blocks;
}
