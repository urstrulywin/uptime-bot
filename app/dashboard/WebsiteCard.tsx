"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Status } from "@prisma/client";

interface UptimeLog {
  id: string;
  status: Status;
  responseTime: number | null;
  timestamp: Date;
  websiteId: string;
}

interface Website {
  id: string;
  url: string;
  status: Status;
  lastChecked: Date | null;
  uptimeLogs: UptimeLog[];
  userId: string;
}

interface WebsiteCardProps {
  website: Website;
  onDelete: () => void;
}

const WebsiteCard = ({ website, onDelete }: WebsiteCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusIcon = (status: Status) => {
    if (status === Status.up) {
      return (
        <svg
          className="h-5 w-5 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      );
    } else {
      return (
        <svg
          className="h-5 w-5 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      );
    }
  };

  const getStatusBadge = (status: Status, responseTime?: number | null) => {
    if (status === Status.up) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-900/20 text-green-300 border border-green-800/30 text-sm">
          UP {responseTime != null && `• ${responseTime}ms`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-900/20 text-red-300 border border-red-800/30 text-sm">
          DOWN {responseTime != null && `• ${responseTime}ms`}
        </span>
      );
    }
  };

  const getResponseTimeColor = (responseTime: number | null) => {
    if (responseTime == null) return "text-gray-400";
    if (responseTime < 500) return "text-green-400";
    if (responseTime < 1000) return "text-yellow-400";
    return "text-red-400";
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <div
      className={`rounded-xl border border-gray-700/30 ${
        website.status === Status.up ? "bg-gray-800/50" : "bg-red-900/5"
      } shadow-lg transition-all duration-200 hover:shadow-xl hover:border-gray-600/50`}
    >
      <div className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(website.status)}
          <div>
            <h3 className="text-lg font-medium text-gray-100 truncate max-w-[160px] sm:max-w-[220px]">
              {getDomain(website.url)}
            </h3>
          </div>
        </div>
        <div className="flex gap-1">
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-900/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
          </a>
          <button
            onClick={handleDelete}
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7v12m6-12v12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center">
          <div>{getStatusBadge(website.status, website.lastChecked ? website.uptimeLogs[0]?.responseTime : null)}</div>
          {website.lastChecked && (
            <div className="flex items-center text-xs text-gray-400">
              <svg
                className="h-3 w-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{formatDistanceToNow(new Date(website.lastChecked), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pt-0 flex flex-col">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-gray-400 hover:text-gray-200 flex items-center justify-center mt-2 hover:bg-gray-700/30 py-2 rounded-md"
        >
          {expanded ? (
            <>
              <span>Hide history</span>
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                ></path>
              </svg>
            </>
          ) : (
            <>
              <span>View history</span>
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </>
          )}
        </button>
        {expanded && (
          <div className="mt-3 space-y-3 w-full">
            <div className="h-px bg-gray-700/50"></div>
            <h4 className="text-sm font-medium text-gray-300">Recent history</h4>
            <ul className="space-y-2">
              {website.uptimeLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className={getResponseTimeColor(log.responseTime)}>
                      {log.responseTime != null ? `${log.responseTime}ms` : "N/A"}
                    </span>
                  </div>
                  <span className="text-gray-400">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deletion (No Glass Effect) */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the website{" "}
              <span className="font-medium text-gray-100">{getDomain(website.url)}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-gray-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCard;