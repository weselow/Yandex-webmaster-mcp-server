/**
 * TypeScript types for Yandex Webmaster API v4 entities.
 */

// --- Core ---

export interface UserInfo {
  user_id: number;
}

export interface Host {
  host_id: string;
  ascii_host_url: string;
  unicode_host_url: string;
  verified: boolean;
  main_mirror?: string;
}

export interface HostList {
  hosts: Host[];
}

export interface HostSummary {
  host_id: string;
  sqi?: number;
  excluded_pages_count?: number;
  searchable_pages_count?: number;
  site_problems?: SiteProblem[];
}

export interface SiteProblem {
  severity: string;
  problem_id: string;
  affect?: string;
  last_detected?: string;
}

// --- Sitemaps ---

export interface Sitemap {
  sitemap_id: string;
  sitemap_url: string;
  added_date: string;
  last_access_date?: string;
  errors_count?: number;
  urls_count?: number;
  children_count?: number;
  type?: string;
}

export interface SitemapList {
  sitemaps: Sitemap[];
}

// --- Indexing ---

export interface IndexingStatus {
  searchable_count?: number;
  excluded_count?: number;
  indexed_count?: number;
  downloaded_count?: number;
  history?: IndexingHistoryEntry[];
}

export interface IndexingHistoryEntry {
  date: string;
  searchable_count?: number;
  excluded_count?: number;
  downloaded_count?: number;
}

// --- Search URLs ---

export interface SearchUrlInfo {
  url: string;
  last_access?: string;
  change_frequency?: string;
  is_indexable?: boolean;
  http_code?: number;
}

export interface SearchUrlList {
  count?: number;
  samples: SearchUrlInfo[];
}

// --- Important URLs ---

export interface ImportantUrl {
  url: string;
  change_indicator?: string;
  issues?: ImportantUrlIssue[];
}

export interface ImportantUrlIssue {
  issue_type: string;
  severity?: string;
}

export interface ImportantUrlList {
  count?: number;
  urls: ImportantUrl[];
}

// --- Search Queries ---

export interface SearchQueryIndicator {
  date: string;
  value: number;
}

export interface SearchQueryEntry {
  query_text: string;
  indicators: Record<string, SearchQueryIndicator[]>;
}

export interface SearchQueryResult {
  count?: number;
  queries: SearchQueryEntry[];
}

// --- Backlinks ---

export interface BacklinksInfo {
  links_total_count?: number;
  hosts_total_count?: number;
  last_checked_date?: string;
}

export interface ExternalLink {
  source_url: string;
  destination_url: string;
  discovery_date?: string;
  source_last_access_date?: string;
}

export interface ExternalLinkList {
  count?: number;
  links: ExternalLink[];
}

// --- SQI ---

export interface SQIInfo {
  sqi: number;
}

export interface SQIHistoryEntry {
  date: string;
  sqi: number;
}

export interface SQIHistory {
  history: SQIHistoryEntry[];
}

// --- Diagnostics ---

export interface DiagnosticsEntry {
  problem_id: string;
  severity: string;
  affect?: string;
  count?: number;
  last_detected?: string;
}

export interface DiagnosticsInfo {
  problems: DiagnosticsEntry[];
}

// --- Recrawl ---

export interface RecrawlQuota {
  daily_quota: number;
  quota_remainder: number;
}

export interface RecrawlTask {
  task_id: string;
  url: string;
  added_date: string;
  status?: string;
}

export interface RecrawlTaskList {
  tasks: RecrawlTask[];
}

// --- Original Texts ---

export interface OriginalText {
  text_id: string;
  content: string;
  added_date: string;
}

export interface OriginalTexts {
  count?: number;
  texts: OriginalText[];
}

export interface OriginalTextQuota {
  daily_quota: number;
  quota_remainder: number;
}

// --- Verification ---

export interface VerificationInfo {
  verification_type?: string;
  verified?: boolean;
  verification_state?: string;
}

// --- Request parameter types ---

export interface DateRange {
  date_from?: string;
  date_to?: string;
}

export interface Pagination {
  offset?: number;
  limit?: number;
}

export interface SearchQueryParams {
  date_from: string;
  date_to: string;
  query_indicator: string;
  device_type_indicator?: string;
  offset?: number;
  limit?: number;
}
