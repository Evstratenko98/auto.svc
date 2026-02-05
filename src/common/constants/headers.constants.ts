export const HEADERS = {
  /** Идентификатор текущего запроса */
  TRACE_ID: 'X-Trace-Id',
  /** Идентификатор сессии */
  SESSION_ID: 'X-Session-Id',
  /** Идентификатор пользователя SravniId */
  OWNER_ID: 'X-Owner-Id',
  /** Страница и контекст, с которой поступил запрос */
  PAGE_CONTEXT: 'X-Page-Context',
  //** Access token *//
  AUTHORIZATION: 'Authorization',
  /** Список экспериментов AbGroups */
  AB_GROUPS: 'x-ab-groups',
} as const;
