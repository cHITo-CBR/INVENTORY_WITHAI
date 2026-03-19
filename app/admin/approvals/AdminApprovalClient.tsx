"use client";

import { useState } from "react";
import { approveUser, rejectUser } from "@/app/actions/admin";

export default function AdminApprovalClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    await approveUser(user.id);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!reason) return alert("Please provide a reason.");
    setLoading(true);
    await rejectUser(user.id, reason);
    setLoading(false);
    setRejectMode(false);
  };

  return (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {user.roles.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        <div className="text-sm text-gray-500">{user.phone_number}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {rejectMode ? (
          <div className="flex items-center justify-end space-x-2">
            <input 
              type="text" 
              placeholder="Reason..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-32"
            />
            <button 
              onClick={handleReject}
              disabled={loading}
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
            >
              Confirm
            </button>
            <button 
              onClick={() => setRejectMode(false)}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900 px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-x-3">
            <button 
              onClick={handleApprove}
              disabled={loading}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
            >
              Approve
            </button>
            <button 
              onClick={() => setRejectMode(true)}
              disabled={loading}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
