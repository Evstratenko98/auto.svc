import { APDEX_TIME_MS_MAP } from './apdex.constants';

export type CustomerServiceRoutes = keyof typeof APDEX_TIME_MS_MAP;
