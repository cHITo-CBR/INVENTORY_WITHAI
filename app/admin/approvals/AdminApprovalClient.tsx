"use client";

import { useState } from "react";
import { approveUser, rejectUser } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Check, X, Loader2 } from "lucide-react";

export default function AdminApprovalClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await approveUser(user.id);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectUser(user.id);
    setLoading(false);
    setRejectMode(false);
  };

  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">
        {user.full_name}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">
          {user.roles.name}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">{user.email}</div>
        <div className="text-xs text-muted-foreground">{user.phone_number}</div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {rejectMode ? (
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs text-muted-foreground">Confirm rejection?</span>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Reject"}
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setRejectMode(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3 w-3" /> Approve</>}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setRejectMode(true)}
              disabled={loading}
            >
              <X className="mr-1 h-3 w-3" /> Reject
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
