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
  BacklinksInfo,
  ExternalLinkList,
  SQIInfo,
  SQIHistory,
  DiagnosticsInfo,
  RecrawlQuota,
  RecrawlTask,
  RecrawlTaskList,
  OriginalText,
  OriginalTexts,
  OriginalTextQuota,
  VerificationInfo,
  DateRange,
  Pagination,
} from './types.js';
import { buildQueryString } from '../utils/pagination.js';

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

  // --- Indexing ---

  async getIndexingStatus(hostId: string): Promise<IndexingStatus> {
    return this.get<IndexingStatus>(`/hosts/${hostId}/indexing/status`);
  }

  async getIndexingHistory(hostId: string, params?: DateRange): Promise<IndexingStatus> {
    const qs = buildQueryString(undefined, params);
    return this.get<IndexingStatus>(`/hosts/${hostId}/indexing/history${qs}`);
  }

  // --- Search URLs ---

  async getSearchUrls(hostId: string, params?: Pagination): Promise<SearchUrlList> {
    const qs = buildQueryString(params);
    return this.get<SearchUrlList>(`/hosts/${hostId}/search-urls/in-search/samples${qs}`);
  }

  // --- Important URLs ---

  async getImportantUrls(hostId: string, params?: Pagination): Promise<ImportantUrlList> {
    const qs = buildQueryString(params);
    return this.get<ImportantUrlList>(`/hosts/${hostId}/important-urls${qs}`);
  }

  // --- Search Queries ---

  async getSearchQueries(hostId: string, params: SearchQueryParams): Promise<SearchQueryResult> {
    const qs = this.buildSearchQueryParams(params);
    return this.get<SearchQueryResult>(`/hosts/${hostId}/search-queries/all/history${qs}`);
  }

  async getPopularQueries(hostId: string, params: SearchQueryParams): Promise<SearchQueryResult> {
    const qs = this.buildSearchQueryParams(params);
    return this.get<SearchQueryResult>(`/hosts/${hostId}/search-queries/popular${qs}`);
  }

  private buildSearchQueryParams(params: SearchQueryParams): string {
    const sp = new URLSearchParams();
    sp.set('date_from', params.date_from);
    sp.set('date_to', params.date_to);
    sp.set('query_indicator', params.query_indicator);
    if (params.device_type_indicator) {
      sp.set('device_type_indicator', params.device_type_indicator);
    }
    if (params.offset !== undefined && params.offset > 0) {
      sp.set('offset', String(params.offset));
    }
    if (params.limit !== undefined) {
      sp.set('limit', String(params.limit));
    }
    return `?${sp.toString()}`;
  }

  // --- Backlinks ---

  async getBacklinks(hostId: string): Promise<BacklinksInfo> {
    return this.get<BacklinksInfo>(`/hosts/${hostId}/links/external/samples`);
  }

  async getExternalLinks(hostId: string, params?: Pagination): Promise<ExternalLinkList> {
    const qs = buildQueryString(params);
    return this.get<ExternalLinkList>(`/hosts/${hostId}/links/external/samples${qs}`);
  }

  // --- SQI ---

  async getSQI(hostId: string): Promise<SQIInfo> {
    return this.get<SQIInfo>(`/hosts/${hostId}/sqi`);
  }

  async getSQIHistory(hostId: string, params?: DateRange): Promise<SQIHistory> {
    const qs = buildQueryString(undefined, params);
    return this.get<SQIHistory>(`/hosts/${hostId}/sqi/history${qs}`);
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
