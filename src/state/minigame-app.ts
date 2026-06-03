import { reactive } from "vue";

/** zhiwo app.globalData — 仅存状态，不写页面结构和样式逻辑 */
export type AuthStatus = "loading" | "success" | "fail";

export interface MinigameProfileState {
  nickName?: string;
  avatarUrl?: string;
  skipped?: boolean;
}

export interface QuizQuestion {
  id?: string;
  text?: string;
  options?: { text?: string; letter?: string }[];
}

/** 首页 / 测评流程当前套题；由选题或首页 `quizId` 参数写入 */
export type SessionQuizId =
  | "mbti"
  | "darkness_trend"
  | "peach_blossom"
  | "crush_index"
  | "birth_color";

export interface PendingQuizPersist {
  mode: string;
  answers: string[];
  result: { type: string; counts: Record<string, number> };
  inviteId?: string;
  createdAt?: number;
  /** 可选；与 SessionQuizId 对齐 */
  quizId?: SessionQuizId;
}

export const minigameApp = reactive({
  userId: "",
  authStatus: "loading" as AuthStatus,
  authError: "",
  profile: null as MinigameProfileState | null,
  records: [] as unknown[],
  invite: null as Record<string, unknown> | null,
  pendingInviteId: "",
  profileGatePending: false,
  pendingNavigateAfterProfile: null as null | { url: string },
  currentResult: null as { type?: string; counts?: Record<string, number> } | null,
  lastQuizContext: {
    mode: "self" as "self" | "mutual",
    inviteId: "",
    quizId: "crush_index" as SessionQuizId,
  },
  /** 首页轮播默认选中套题（无 URL 参数时） */
  sessionQuizId: "crush_index" as SessionQuizId,
  pendingQuizPersist: null as PendingQuizPersist | null,
  compareContext: null as Record<string, unknown> | null,
  selfTestQuestions: [] as QuizQuestion[],
  mutualTestQuestions: [] as QuizQuestion[],
  /** 互测页与 zhiwo globalData 对齐 */
  mutualResultsCache: {} as Record<string, unknown[]>,
  mutualAllList: null as unknown[] | null,
  /** 汇总页当前套题（scope=all 时与 mutualAllList 对齐） */
  mutualAllQuizId: "" as SessionQuizId | "",
  currentSelfRecord: null as unknown,
  showMutualSelfResult: true,
});
