// services/search.ts
import { api } from "./api";

export interface SearchFilters {
  meetingIds?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export const searchService = {
  async fullTextSearch(
    query: string,
    filters?: SearchFilters,
    limit = 20,
    offset = 0
  ) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      ...(filters?.meetingIds && { meetingIds: filters.meetingIds.join(",") }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await api.get(`/search/fulltext?${params}`);
    return response.data;
  },

  async semanticSearch(query: string, filters?: SearchFilters, limit = 20) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      ...(filters?.meetingIds && { meetingIds: filters.meetingIds.join(",") }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await api.get(`/search/semantic?${params}`);
    return response.data;
  },

  async askQuestion(meetingId: string, question: string) {
    const response = await api.get(
      `/search/qa?meetingId=${meetingId}&question=${encodeURIComponent(
        question
      )}`
    );
    return response.data;
  },
};
