// app/meetings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/common/Layout";
import { meetingsService, Meeting } from "@/services/meetings";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

interface CreateMeetingForm {
  title: string;
  description: string;
  scheduledStartTime: string;
  duration: number;
  isRecording: boolean;
  autoTranscription: boolean;
  autoSummary: boolean;
  allowChat: boolean;
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingForm>();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingsService.getMeetings(
        1,
        10,
        user?.organizationId
      );
      setMeetings(response.meetings || []);
      setPagination(response.pagination || {});
    } catch (error: any) {
      toast.error("Failed to load meetings");
      console.error("Load meetings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (data: CreateMeetingForm) => {
    try {
      // Validate organizationId exists
      if (!user?.organizationId) {
        toast.error("Organization ID is missing. Please contact support.");
        return;
      }

      // Build clean payload - only include fields that have values
      const meetingData: any = {
        title: data.title.trim(),
        startTime: new Date(data.startTime).toISOString(), // Convert to proper ISO format
        organizationId: user.organizationId,
      };

      // Only add optional fields if they have actual values
      if (data.description && data.description.trim()) {
        meetingData.description = data.description.trim();
      }

      if (data.duration && data.duration > 0) {
        meetingData.duration = Number(data.duration);
      }

      if (data.maxParticipants && data.maxParticipants > 0) {
        meetingData.maxParticipants = Number(data.maxParticipants);
      }

      if (data.autoJoinBot !== undefined) {
        meetingData.autoJoinBot = Boolean(data.autoJoinBot);
      }

      console.log("Final payload being sent:", meetingData);
      console.log("Payload type check:", {
        titleType: typeof meetingData.title,
        startTimeType: typeof meetingData.startTime,
        organizationIdType: typeof meetingData.organizationId,
        durationType: meetingData.duration
          ? typeof meetingData.duration
          : "not included",
        maxParticipantsType: meetingData.maxParticipants
          ? typeof meetingData.maxParticipants
          : "not included",
      });

      const newMeeting = await meetingsService.createMeeting(meetingData);
      setMeetings([newMeeting, ...meetings]);
      setIsCreateModalOpen(false);
      reset();
      toast.success("Meeting created successfully!");
    } catch (error: any) {
      console.error("Create meeting error:", error);
      console.error("Error response:", error?.response);

      // More detailed error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create meeting";
      toast.error(errorMessage);
    }
  };

  const handleStartMeeting = async (meetingId: string) => {
    try {
      await meetingsService.startMeeting(meetingId);
      toast.success("Meeting started!");
      loadMeetings(); // Refresh to get updated status
    } catch (error: any) {
      toast.error("Failed to start meeting");
    }
  };

  const handleEndMeeting = async (meetingId: string) => {
    try {
      await meetingsService.endMeeting(meetingId);
      toast.success("Meeting ended!");
      loadMeetings(); // Refresh to get updated status
    } catch (error: any) {
      toast.error("Failed to end meeting");
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      const joinData = await meetingsService.joinMeeting(meetingId, {
        fullName: user?.name || "Anonymous User",
      });
      if (joinData.joinUrl) {
        window.open(joinData.joinUrl, "_blank");
      }
      toast.success("Joining meeting...");
    } catch (error: any) {
      toast.error("Failed to join meeting");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      await meetingsService.deleteMeeting(meetingId);
      setMeetings(meetings.filter((m) => m.id !== meetingId));
      toast.success("Meeting deleted!");
    } catch (error: any) {
      toast.error("Failed to delete meeting");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMeetings();
      return;
    }

    try {
      setLoading(true);
      const results = await meetingsService.searchMeetings(
        searchQuery,
        user?.organizationId
      );
      setMeetings(results);
    } catch (error: any) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      LIVE: "bg-green-100 text-green-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      ERROR: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.SCHEDULED
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && meetings.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="sm:flex sm:items-center mb-8">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
              <p className="mt-2 text-gray-600">
                Manage your meetings and access recordings, transcripts, and
                analytics.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Meeting
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    loadMeetings();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Meetings List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No meetings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new meeting.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Meeting
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {meeting.title}
                          </h3>
                          {getStatusBadge(meeting.status)}
                        </div>

                        {meeting.description && (
                          <p className="text-sm text-gray-500 mb-2">
                            {meeting.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDateTime(meeting.startTime)}
                          </div>

                          <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            {meeting._count?.participants || 0} participants
                          </div>

                          <div className="flex items-center">
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            {meeting._count?.transcripts || 0} transcripts
                          </div>

                          <div className="flex items-center">
                            <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                            {meeting._count?.actionItems || 0} action items
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-400">
                          Host: {meeting.host?.name} •{" "}
                          {meeting.organization?.name}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {meeting.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleStartMeeting(meeting.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <PlayIcon className="w-3 h-3 mr-1" />
                            Start
                          </button>
                        )}

                        {meeting.status === "LIVE" && (
                          <>
                            <button
                              onClick={() => handleJoinMeeting(meeting.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Join
                            </button>
                            <button
                              onClick={() => handleEndMeeting(meeting.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              <StopIcon className="w-3 h-3 mr-1" />
                              End
                            </button>
                          </>
                        )}

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === meeting.id
                                  ? null
                                  : meeting.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>

                          {actionMenuOpen === meeting.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActionMenuOpen(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setSelectedMeeting(meeting);
                                      setActionMenuOpen(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <PencilIcon className="w-4 h-4 mr-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteMeeting(meeting.id);
                                      setActionMenuOpen(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <TrashIcon className="w-4 h-4 mr-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsCreateModalOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleCreateMeeting)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Create New Meeting
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Title *
                          </label>
                          <input
                            {...register("title", {
                              required: "Title is required",
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter meeting title"
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Meeting description (optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            {...register("startTime", {
                              required: "Start time is required",
                            })}
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                          {errors.startTime && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.startTime.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            {...register("duration", {
                              valueAsNumber: true,
                              min: {
                                value: 15,
                                message: "Duration must be at least 15 minutes",
                              },
                              max: {
                                value: 480,
                                message: "Duration cannot exceed 8 hours",
                              },
                            })}
                            type="number"
                            min="15"
                            max="480"
                            defaultValue={60}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                          {errors.duration && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.duration.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Participants
                          </label>
                          <input
                            {...register("maxParticipants", {
                              valueAsNumber: true,
                              min: {
                                value: 1,
                                message: "At least 1 participant required",
                              },
                              max: {
                                value: 500,
                                message: "Cannot exceed 500 participants",
                              },
                            })}
                            type="number"
                            min="1"
                            max="500"
                            defaultValue={50}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                          {errors.maxParticipants && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.maxParticipants.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Meeting Settings
                          </h4>

                          <div className="flex items-center">
                            <input
                              {...register("autoJoinBot")}
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              Auto Join Bot (for transcription)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Meeting"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
