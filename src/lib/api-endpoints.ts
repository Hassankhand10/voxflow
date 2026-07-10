export const API_ENDPOINTS = {
  auth: {
    createSession: '/auth/sessions',
    createAccount: '/auth/accounts',
    profile: '/auth/profile',
  },
  flows: {
    list: '/flows',
    create: '/flows',
    byId: (flowId: string) => `/flows/${flowId}`,
    publication: (flowId: string) => `/flows/${flowId}/publication`,
    sharingSettings: (flowId: string) => `/flows/${flowId}/sharing-settings`,
  },
  public: {
    flowBySlug: (slug: string) => `/public/flows/${slug}`,
    createResponseSession: (slug: string) =>
      `/public/flows/${slug}/response-sessions`,
    completeResponseSession: (sessionId: string) =>
      `/public/response-sessions/${sessionId}/completion`,
  },
  responses: {
    list: '/responses',
    byId: (responseId: string) => `/responses/${responseId}`,
    comments: (responseId: string) => `/responses/${responseId}/comments`,
  },
  analytics: {
    overview: '/analytics/overview',
    metrics: '/analytics/metrics',
  },
  ai: {
    followUpQuestions: '/ai/follow-up-questions',
  },
  media: {
    uploads: '/media/uploads',
  },
} as const;
