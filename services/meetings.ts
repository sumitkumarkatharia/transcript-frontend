// services/meetings.ts
import { api } from "./api";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status:
    | "SCHEDULED"
    | "LIVE"
    | "PROCESSING"
    | "COMPLETED"
    | "CANCELLED"
    | "ERROR";
  host: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  organization: {
    id: string;
    name: string;
  };
  participants?: any[];
  _count?: {
    participants: number;
    transcripts: number;
    actionItems: number;
  };
  bbbMeetingId?: string;
  joinUrl?: string;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  scheduledStartTime: string;
  duration?: number;
  isRecording?: boolean;
  settings?: {
    autoTranscription?: boolean;
    autoSummary?: boolean;
    allowChat?: boolean;
  };
}

export interface JoinMeetingData {
  fullName: string;
}

export const meetingsService = {
  async getMeetings(
    page = 1,
    limit = 10,
    organizationId?: string
  ): Promise<{ meetings: Meeting[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (organizationId) params.append("organizationId", organizationId);

    const response = await api.get(`/meetings?${params}`);
    return response.data;
  },

  async getMeeting(id: string): Promise<Meeting> {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  },

  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    const response = await api.post("/meetings", data);
    return response.data;
  },
  // async createMeeting(data: CreateMeetingData): Promise<Meeting> {
  //   console.log("Frontend sending data:", data);
  //   const response = await api.post("/meetings/simple", data); // Use /simple
  //   return response.data;
  // },

  
  async updateMeeting(
    id: string,
    data: Partial<CreateMeetingData>
  ): Promise<Meeting> {
    const response = await api.patch(`/meetings/${id}`, data);
    return response.data;
  },

  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`);
  },

  async startMeeting(id: string): Promise<any> {
    const response = await api.post(`/meetings/${id}/start`);
    return response.data;
  },

  async endMeeting(id: string): Promise<any> {
    const response = await api.post(`/meetings/${id}/end`);
    return response.data;
  },

  async joinMeeting(id: string, data: JoinMeetingData): Promise<any> {
    const response = await api.post(`/meetings/${id}/join`, data);
    return response.data;
  },

  async getMeetingAnalytics(id: string): Promise<any> {
    const response = await api.get(`/meetings/${id}/analytics`);
    return response.data;
  },

  async getMeetingTranscripts(id: string, page = 1, limit = 50): Promise<any> {
    const response = await api.get(
      `/meetings/${id}/transcripts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getMeetingActionItems(id: string): Promise<any> {
    const response = await api.get(`/meetings/${id}/action-items`);
    return response.data;
  },

  async getMeetingSummaries(id: string): Promise<any> {
    const response = await api.get(`/meetings/${id}/summaries`);
    return response.data;
  },

  async searchMeetings(
    query: string,
    organizationId?: string
  ): Promise<Meeting[]> {
    const params = new URLSearchParams({ q: query });
    if (organizationId) params.append("organizationId", organizationId);

    const response = await api.get(`/meetings/search?${params}`);
    return response.data;
  },
};
