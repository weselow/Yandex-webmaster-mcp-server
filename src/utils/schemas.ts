import { z } from 'zod';

// Host ID — required by most tools, optional when default host is set
export const hostIdSchema = z.string()
  .describe('Host ID from Yandex Webmaster (e.g. "https:example.com:443"). Use ywm_list_hosts to find available host IDs.');

// Optional host ID — for tools that support default host
export const optionalHostIdSchema = z.string()
  .optional()
  .describe('Host ID. Optional if YANDEX_WEBMASTER_HOST_URL is configured.');

// Date range for history endpoints
export const dateRangeSchema = z.object({
  date_from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Start date in YYYY-MM-DD format'),
  date_to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('End date in YYYY-MM-DD format'),
});

// Pagination for list endpoints
export const paginationSchema = z.object({
  offset: z.number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Number of results to skip'),
  limit: z.number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .default(100)
    .describe('Maximum number of results to return'),
});

// Device type filter used in search queries
export const deviceTypeSchema = z.enum([
  'ALL', 'DESKTOP', 'MOBILE_AND_TABLET', 'MOBILE', 'TABLET'
]).optional().default('ALL').describe('Device type filter');

// Indicator for query analytics
export const queryIndicatorSchema = z.enum([
  'TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION'
]).describe('Query analytics indicator');
