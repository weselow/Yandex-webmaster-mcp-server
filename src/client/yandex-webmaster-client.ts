import { createApiError, YandexWebmasterError } from './errors.js';
import type {
  UserInfo,
  Host,
  HostList,
  HostSummary,
  Sitemap,
  SitemapList,
  IndexingStatus,
  SearchUrlList,
  ImportantUrlList,
  SearchQueryResult,
  SearchQueryParams,
  ExternalLinkList,
  SQIHistory,
  DiagnosticsInfo,
  RecrawlQuota,
  RecrawlTask,
  RecrawlTaskList,
  OriginalText,
  OriginalTexts,
  OriginalTextQuota,
  VerificationInfo,
  OwnerList,
  SearchEventList,
  BrokenLinkList,
  FeedList,
  FeedUploadStatus,
  QueryAnalyticsRequest,
  QueryAnalyticsResult,
  HistoryResponse,
  BatchFeedResult,
  DateRange,
  Pagination,
} from './types.js';
import { buildQueryString, buildPaginationParams, buildDateRangeParams, mergeParams } from '../utils/pagination.js';

const DEFAULT_BASE_URL = 'https://api.webmaster.yandex.net/v4';

export class YandexWebmasterClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private userId: number | null = null;
  private defaultHostId: string | null = null;

  constructor(token: string, baseUrl?: string) {
    this.token = token;
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL;
  }

  // --- User ID resolution ---

  async getUserId(): Promise<number> {
    if (this.userId !== null) {
      return this.userId;
    }
    const data = await this.request<UserInfo>('GET', '/user/');
    this.userId = data.user_id;
    return this.userId;
  }

  // --- Default host resolution ---

  async resolveDefaultHost(hostUrl: string): Promise<string> {
    const userId = await this.getUserId();
    const data = await this.request<HostList>('GET', `/user/${userId}/hosts`);
    const normalizedTarget = hostUrl.replace(/\/$/, '');

    const found = data.hosts.find((h) => {
      const ascii = h.ascii_host_url.replace(/\/$/, '');
      const unicode = h.unicode_host_url.replace(/\/$/, '');
      return ascii === normalizedTarget || unicode === normalizedTarget;
    });

    if (!found) {
      throw new YandexWebmasterError(
        `Host not found for URL: ${hostUrl}`,
        404,
      );
    }

    this.defaultHostId = found.host_id;
    return found.host_id;
  }

  resolveHostId(hostId?: string): string {
    if (hostId) return hostId;
    if (this.defaultHostId) return this.defaultHostId;
    throw new YandexWebmasterError(
      'No host ID provided and no default host configured. ' +
      'Pass a hostId or set YANDEX_WEBMASTER_HOST_URL.',
      400,
    );
  }

  // --- HTTP layer ---

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Authorization': `OAuth ${this.token}`,
      'Accept': 'application/json',
    };

    const init: RequestInit = { method, headers };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    if (response.status === 204) {
      return undefined as T;
    }

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = undefined;
    }

    if (!response.ok) {
      throw createApiError(response, responseBody);
    }

    return responseBody as T;
  }

  private async userPath(path: string): Promise<string> {
    const userId = await this.getUserId();
    return `/user/${userId}${path}`;
  }

  private async get<T>(path: string): Promise<T> {
    const fullPath = await this.userPath(path);
    return this.request<T>('GET', fullPath);
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const fullPath = await this.userPath(path);
    return this.request<T>('POST', fullPath, body);
  }

  private async del(path: string): Promise<void> {
    const fullPath = await this.userPath(path);
    await this.request<void>('DELETE', fullPath);
  }

  private async delWithBody<T>(path: string, body: unknown): Promise<T> {
    const fullPath = await this.userPath(path);
    return this.request<T>('DELETE', fullPath, body);
  }

  // --- User ---

  async getUser(): Promise<UserInfo> {
    return this.request<UserInfo>('GET', '/user/');
  }

  // --- Hosts ---

  async listHosts(): Promise<HostList> {
    return this.get<HostList>('/hosts');
  }

  async getHost(hostId: string): Promise<Host> {
    return this.get<Host>(`/hosts/${hostId}`);
  }

  async addHost(hostUrl: string): Promise<Host> {
    return this.post<Host>('/hosts', { host_url: hostUrl });
  }

  async deleteHost(hostId: string): Promise<void> {
    return this.del(`/hosts/${hostId}`);
  }

  async getHostSummary(hostId: string): Promise<HostSummary> {
    return this.get<HostSummary>(`/hosts/${hostId}/summary`);
  }

  // --- Verification ---

  async getVerificationStatus(hostId: string): Promise<VerificationInfo> {
    return this.get<VerificationInfo>(`/hosts/${hostId}/owner-verification`);
  }

  async verifyHost(hostId: string, verificationType: string): Promise<VerificationInfo> {
    return this.post<VerificationInfo>(
      `/hosts/${hostId}/owner-verification`,
      { verification_type: verificationType },
    );
  }

  // --- Owners ---

  async listOwners(hostId: string): Promise<OwnerList> {
    return this.get<OwnerList>(`/hosts/${hostId}/owners`);
  }

  // --- Sitemaps ---

  async listSitemaps(hostId: string): Promise<SitemapList> {
    return this.get<SitemapList>(`/hosts/${hostId}/sitemaps`);
  }

  async getSitemap(hostId: string, sitemapId: string): Promise<Sitemap> {
    return this.get<Sitemap>(`/hosts/${hostId}/sitemaps/${sitemapId}`);
  }

  async addSitemap(hostId: string, url: string): Promise<Sitemap> {
    return this.post<Sitemap>(`/hosts/${hostId}/user-added-sitemaps`, { url });
  }

  async deleteSitemap(hostId: string, sitemapId: string): Promise<void> {
    return this.del(`/hosts/${hostId}/user-added-sitemaps/${sitemapId}`);
  }

  async listUserSitemaps(hostId: string): Promise<SitemapList> {
    return this.get<SitemapList>(`/hosts/${hostId}/user-added-sitemaps`);
  }

  async getUserSitemap(hostId: string, sitemapId: string): Promise<Sitemap> {
    return this.get<Sitemap>(`/hosts/${hostId}/user-added-sitemaps/${sitemapId}`);
  }

  // --- Indexing ---

  async getIndexingHistory(hostId: string, params?: DateRange): Promise<IndexingStatus> {
    const qs = buildQueryString(undefined, params);
    return this.get<IndexingStatus>(`/hosts/${hostId}/indexing/history${qs}`);
  }

  async getIndexingSamples(hostId: string, params?: Pagination): Promise<SearchUrlList> {
    const qs = buildQueryString(params);
    return this.get<SearchUrlList>(`/hosts/${hostId}/indexing/samples${qs}`);
  }

  // --- Search URLs ---

  async getSearchUrls(hostId: string, params?: Pagination): Promise<SearchUrlList> {
    const qs = buildQueryString(params);
    return this.get<SearchUrlList>(`/hosts/${hostId}/search-urls/in-search/samples${qs}`);
  }

  async getSearchUrlsHistory(hostId: string, params?: DateRange): Promise<HistoryResponse> {
    const qs = buildQueryString(undefined, params);
    return this.get<HistoryResponse>(`/hosts/${hostId}/search-urls/in-search/history${qs}`);
  }

  async getSearchEventsSamples(hostId: string, params?: Pagination): Promise<SearchEventList> {
    const qs = buildQueryString(params);
    return this.get<SearchEventList>(`/hosts/${hostId}/search-urls/events/samples${qs}`);
  }

  async getSearchEventsHistory(hostId: string, params?: DateRange): Promise<HistoryResponse> {
    const qs = buildQueryString(undefined, params);
    return this.get<HistoryResponse>(`/hosts/${hostId}/search-urls/events/history${qs}`);
  }

  // --- Important URLs ---

  async getImportantUrls(hostId: string, params?: Pagination): Promise<ImportantUrlList> {
    const qs = buildQueryString(params);
    return this.get<ImportantUrlList>(`/hosts/${hostId}/important-urls${qs}`);
  }

  async getImportantUrlsHistory(hostId: string, params?: DateRange): Promise<HistoryResponse> {
    const qs = buildQueryString(undefined, params);
    return this.get<HistoryResponse>(`/hosts/${hostId}/important-urls/history${qs}`);
  }

  // --- Search Queries ---

  async getSearchQueries(hostId: string, params: SearchQueryParams): Promise<SearchQueryResult> {
    const qs = this.buildSearchQueryString(params);
    return this.get<SearchQueryResult>(`/hosts/${hostId}/search-queries/all/history${qs}`);
  }

  async getPopularQueries(hostId: string, params: SearchQueryParams): Promise<SearchQueryResult> {
    const qs = this.buildSearchQueryString(params);
    return this.get<SearchQueryResult>(`/hosts/${hostId}/search-queries/popular${qs}`);
  }

  async getQueryHistory(hostId: string, queryId: string, params: SearchQueryParams): Promise<SearchQueryResult> {
    const qs = this.buildSearchQueryString(params);
    return this.get<SearchQueryResult>(`/hosts/${hostId}/search-queries/${queryId}/history${qs}`);
  }

  async queryAnalytics(hostId: string, body: QueryAnalyticsRequest): Promise<QueryAnalyticsResult> {
    return this.post<QueryAnalyticsResult>(`/hosts/${hostId}/query-analytics/list`, body);
  }

  private buildSearchQueryString(params: SearchQueryParams): string {
    const extra = new URLSearchParams();
    extra.set('query_indicator', params.query_indicator);
    if (params.device_type_indicator) {
      extra.set('device_type_indicator', params.device_type_indicator);
    }

    const merged = mergeParams(
      buildPaginationParams(params),
      buildDateRangeParams(params),
      extra,
    );

    return `?${merged.toString()}`;
  }

  // --- External Links ---

  async getExternalLinks(hostId: string, params?: Pagination): Promise<ExternalLinkList> {
    const qs = buildQueryString(params);
    return this.get<ExternalLinkList>(`/hosts/${hostId}/links/external/samples${qs}`);
  }

  async getExternalLinksHistory(hostId: string, params?: DateRange): Promise<HistoryResponse> {
    const qs = buildQueryString(undefined, params);
    return this.get<HistoryResponse>(`/hosts/${hostId}/links/external/history${qs}`);
  }

  // --- Broken Internal Links ---

  async getBrokenInternalLinks(hostId: string, params?: Pagination): Promise<BrokenLinkList> {
    const qs = buildQueryString(params);
    return this.get<BrokenLinkList>(`/hosts/${hostId}/links/internal/broken/samples${qs}`);
  }

  async getBrokenLinksHistory(hostId: string, params?: DateRange): Promise<HistoryResponse> {
    const qs = buildQueryString(undefined, params);
    return this.get<HistoryResponse>(`/hosts/${hostId}/links/internal/broken/history${qs}`);
  }

  // --- SQI ---

  async getSQIHistory(hostId: string, params?: DateRange): Promise<SQIHistory> {
    const qs = buildQueryString(undefined, params);
    return this.get<SQIHistory>(`/hosts/${hostId}/sqi-history${qs}`);
  }

  // --- Diagnostics ---

  async getDiagnostics(hostId: string): Promise<DiagnosticsInfo> {
    return this.get<DiagnosticsInfo>(`/hosts/${hostId}/diagnostics`);
  }

  // --- Recrawl ---

  async getRecrawlQuota(hostId: string): Promise<RecrawlQuota> {
    return this.get<RecrawlQuota>(`/hosts/${hostId}/recrawl/quota`);
  }

  async listRecrawlTasks(hostId: string): Promise<RecrawlTaskList> {
    return this.get<RecrawlTaskList>(`/hosts/${hostId}/recrawl/tasks`);
  }

  async addRecrawlTask(hostId: string, url: string): Promise<RecrawlTask> {
    return this.post<RecrawlTask>(`/hosts/${hostId}/recrawl/tasks`, { url });
  }

  async getRecrawlTask(hostId: string, taskId: string): Promise<RecrawlTask> {
    return this.get<RecrawlTask>(`/hosts/${hostId}/recrawl/queue/${taskId}`);
  }

  // --- Feeds ---

  async listFeeds(hostId: string): Promise<FeedList> {
    return this.get<FeedList>(`/hosts/${hostId}/feeds/list`);
  }

  async startFeedUpload(hostId: string, body: { url: string }): Promise<FeedUploadStatus> {
    return this.post<FeedUploadStatus>(`/hosts/${hostId}/feeds/add/start`, body);
  }

  async getFeedUploadStatus(hostId: string): Promise<FeedUploadStatus> {
    return this.get<FeedUploadStatus>(`/hosts/${hostId}/feeds/add/info`);
  }

  async batchAddFeeds(hostId: string, body: { urls: string[] }): Promise<BatchFeedResult> {
    return this.post<BatchFeedResult>(`/hosts/${hostId}/feeds/batch/add`, body);
  }

  async batchRemoveFeeds(hostId: string, body: { urls: string[] }): Promise<BatchFeedResult> {
    return this.delWithBody<BatchFeedResult>(`/hosts/${hostId}/feeds/batch/remove`, body);
  }

  // --- Original Texts ---

  async getOriginalTexts(hostId: string, params?: Pagination): Promise<OriginalTexts> {
    const qs = buildQueryString(params);
    return this.get<OriginalTexts>(`/hosts/${hostId}/original-texts${qs}`);
  }

  async addOriginalText(hostId: string, content: string): Promise<OriginalText> {
    return this.post<OriginalText>(`/hosts/${hostId}/original-texts`, { content });
  }

  async deleteOriginalText(hostId: string, textId: string): Promise<void> {
    return this.del(`/hosts/${hostId}/original-texts/${textId}`);
  }

  async getOriginalTextQuota(hostId: string): Promise<OriginalTextQuota> {
    return this.get<OriginalTextQuota>(`/hosts/${hostId}/original-texts/quota`);
  }
}
