// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { meetingsService } from "@/services/meetings";
import { api } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  VideoCameraIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
  });

  const { data: recentMeetings } = useQuery({
    queryKey: ["recent-meetings"],
    queryFn: async () => {
      const meetings = await meetingsService.getMeetings();
      return meetings.slice(0, 5); // Get 5 most recent
    },
  });

  const stats = [
    {
      name: "Total Meetings",
      value: dashboardStats?.data?.totalMeetings || 0,
      icon: VideoCameraIcon,
      color: "bg-blue-500",
    },
    {
      name: "Hours Transcribed",
      value: dashboardStats?.data?.totalHours || 0,
      icon: ClockIcon,
      color: "bg-green-500",
    },
    {
      name: "Search Queries",
      value: dashboardStats?.data?.totalSearches || 0,
      icon: MagnifyingGlassIcon,
      color: "bg-purple-500",
    },
    {
      name: "Action Items",
      value: dashboardStats?.data?.totalActionItems || 0,
      icon: ChartBarIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Heres whats happening with your meetings today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/meetings/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <VideoCameraIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">New Meeting</h4>
                <p className="text-sm text-gray-500">
                  Start a new recorded meeting
                </p>
              </div>
            </Link>

            <Link
              href="/search"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MagnifyingGlassIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Search</h4>
                <p className="text-sm text-gray-500">Find meeting content</p>
              </div>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-500">View meeting insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Meetings
            </h3>
            <Link
              href="/meetings"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>

          {recentMeetings && recentMeetings.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentMeetings.map((meeting) => (
                  <li key={meeting.id} className="py-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {meeting.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(meeting.startTime),
                            "MMM d, yyyy h:mm a"
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            meeting.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : meeting.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No meetings yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first meeting.
              </p>
              <div className="mt-6">
                <Link href="/meetings/new" className="btn-primary">
                  New Meeting
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
