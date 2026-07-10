export type QuestionType = "video" | "audio" | "text";

export const APP_NAME = "Voxflow";
export const AUTHOR_NAME = "Hassan Khan";

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  icon: string;
}[] = [
  { type: "video", label: "Video", icon: "Video" },
  { type: "audio", label: "Audio", icon: "Mic" },
  { type: "text", label: "Text", icon: "Type" },
];

export const SIDEBAR_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Flows", href: "/flows", icon: "Workflow" },
  { label: "Responses", href: "/responses", icon: "Inbox" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;
