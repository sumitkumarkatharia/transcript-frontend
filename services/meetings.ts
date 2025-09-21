// services/meetings.ts
import { api } from "./api";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  host: any;
  participants?: any[];
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  attendeePassword?: string;
  moderatorPassword?: string;
}

export const meetingsService = {
  async getMeetings(): Promise<Meeting[]> {
    const response = await api.get("/meetings");
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

  async joinMeeting(id: string): Promise<any> {
    const response = await api.post(`/meetings/${id}/join`);
    return response.data;
  },

  async leaveMeeting(id: string): Promise<any> {
    const response = await api.post(`/meetings/${id}/leave`);
    return response.data;
  },

  async getMeetingAnalytics(id: string): Promise<any> {
    const response = await api.get(`/meetings/${id}/analytics`);
    return response.data;
  },
};
