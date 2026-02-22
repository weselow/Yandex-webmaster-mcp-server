import { z } from 'zod';

// Optional host ID — for tools that support default host
export const optionalHostIdSchema = z.string()
  .optional()
  .describe('Host ID. Optional if YANDEX_WEBMASTER_HOST_URL is configured.');

// Device type filter used in search queries
export const deviceTypeSchema = z.enum([
  'ALL', 'DESKTOP', 'MOBILE_AND_TABLET', 'MOBILE', 'TABLET'
]).optional().default('ALL').describe('Device type filter');

// Indicator for query analytics
export const queryIndicatorSchema = z.enum([
  'TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION'
]).describe('Query analytics indicator');
