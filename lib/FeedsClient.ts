import {BaseClient} from "./BaseClient";
import {AxiosInstance} from "axios";
import {SerializedConfig} from "./types";

export interface FeedEvent {
  eventType: string;
  eventId: string;
  data?: any;
  encryptedData?: number;
}

export interface FeedPaginationOptions {
  since?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface FeedEntry {
  sequenceNumber: number;
  aggregateId: string;
  timestamp: number;
  feedName: string;
  events: FeedEvent[];
}

export interface FeedOverview {
  aggregateType: string;
  aggregateCount: number;
  batchCount: number;
  eventCount: number;
}

export interface LoadFeedResponse {
  entries: FeedEntry[],
  hasMore: boolean;
  currentSequenceNumber: number;
}

export interface LoadFeedsOverviewResponse {
  feeds: FeedOverview[];
}

export interface FeedRequest {
  feedName: string;
}

export interface LoadFeedRequest extends FeedRequest {
  paginationOptions?: FeedPaginationOptions;
}

export interface LoadAllFeedRequest {
  feedName: string;
  paginationOptions?: FeedPaginationOptions;
}

export class FeedsClient extends BaseClient {

  constructor(axiosClient: AxiosInstance, config: SerializedConfig) {
    super(axiosClient, config);
  }

  public async loadOverview(): Promise<LoadFeedsOverviewResponse> {
    return (await this.axiosClient.get(FeedsClient.feedsUrl())).data;
  }

  public async loadFeed(request: LoadFeedRequest): Promise<LoadFeedResponse> {
    const config = this.axiosConfig();
    config.params = request.paginationOptions;
    return (await this.axiosClient.get(FeedsClient.feedUrl(request.feedName), config)).data;
  }

  public async getCurrentSequenceNumber(feed: FeedRequest): Promise<number> {
    const headers = (await this.axiosClient.head(FeedsClient.feedUrl(feed.feedName))).headers;
    return headers['Serialized-SequenceNumber-Current']
  }

  public async loadAllFeed(request: LoadAllFeedRequest): Promise<LoadFeedResponse> {
    const config = this.axiosConfig();
    config.params = request.paginationOptions;
    return (await this.axiosClient.get(FeedsClient.allFeedUrl(), config)).data;
  }

  public async getGlobalSequenceNumber(): Promise<number> {
    const headers = (await this.axiosClient.head(FeedsClient.allFeedUrl())).headers;
    return headers['Serialized-SequenceNumber-Current']
  }

  public static feedsUrl() {
    return `/feeds`;
  }

  public static allFeedUrl() {
    return `/feeds/_all`;
  }

  public static feedUrl(feedName: string) {
    return `/feeds/${feedName}`;
  }

}
