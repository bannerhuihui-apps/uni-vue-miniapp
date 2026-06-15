/** AI 综合分析门槛（与后端 MinigameAiDataAggregator 一致） */
import { mgAiReport, mgAiReportReady } from "@/api/minigame";
import type { SessionQuizId } from "@/state/minigame-app";

export const AI_REQUIRED_QUIZ_IDS: SessionQuizId[] = [
  "mbti",
  "darkness_trend",
  "peach_blossom",
  "crush_index",
  "birth_color",
];

export const MIN_MUTUAL_FOR_AI = 3;

export const AI_INELIGIBLE_MSG =
  "数据不足以支持AI分析，请确保每一种测试，都有测试记录，并且每种测试至少有3位朋友完成互测。";

export interface AiEligibilityMissingItem {
  quizId: string;
  label: string;
  needSelf: boolean;
  needMutual: number;
}

export interface AiEligibilityResult {
  eligible: boolean;
  message?: string;
  missing?: AiEligibilityMissingItem[];
  /** 当前测试数据指纹；互测/自测变化后会变 */
  dataHash?: string;
}

export interface AiReportResult {
  content: string;
  cached?: boolean;
  generatedAt?: number;
  model?: string;
  dataHash?: string;
}

const AI_REPORT_POLL_INTERVAL_MS = 3000;
const AI_REPORT_POLL_MAX = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAiReportPendingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return msg.includes("报告生成中") || msg.includes("4024");
}

function isAiIneligibleError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return msg.includes(AI_INELIGIBLE_MSG) || msg.includes("数据不足以支持");
}

/**
 * 请求 AI 报告：先 POST 触发生成；若客户端/网关超时，则轮询 ready 接口直至 Mongo 写入完成。
 */
export async function fetchAiReport(
  userId: string,
  onStatus?: (hint: string) => void,
): Promise<AiReportResult> {
  onStatus?.("正在生成分析报告，首次约需 1～2 分钟…");

  try {
    return (await mgAiReport(userId)) as AiReportResult;
  } catch (firstErr) {
    if (isAiIneligibleError(firstErr)) throw firstErr;

    onStatus?.("生成时间较长，正在等待后台完成…");
    for (let i = 0; i < AI_REPORT_POLL_MAX; i += 1) {
      await sleep(AI_REPORT_POLL_INTERVAL_MS);
      try {
        return (await mgAiReportReady(userId)) as AiReportResult;
      } catch (pollErr) {
        if (isAiReportPendingError(pollErr)) continue;
        if (isAiIneligibleError(pollErr)) throw pollErr;
        if (i === AI_REPORT_POLL_MAX - 1) throw pollErr;
      }
    }
    throw new Error("报告生成超时，请稍后重试");
  }
}
