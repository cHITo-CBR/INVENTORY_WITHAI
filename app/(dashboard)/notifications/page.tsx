"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">System alerts and messages mapped to the notifications table.</p>
        </div>
        <Button variant="outline" className="text-gray-600">
          <Check className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {/* Unread Notification */}
        <Card className="shadow-sm border-l-4 border-l-[#005914] rounded-xl relative overflow-hidden bg-white">
           <CardContent className="p-4 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                 <Bell className="w-5 h-5 text-[#005914]" />
              </div>
              <div className="flex-1">
                 <h4 className="font-semibold text-gray-900">Manual Stock Adjustment Approved</h4>
                 <p className="text-gray-600 text-sm mt-1">Your request to deduct 5 cases of Century Tuna due to damage has been approved by the Supervisor.</p>
                 <span className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> 10 mins ago</span>
              </div>
           </CardContent>
        </Card>

        {/* Read Notification */}
        <Card className="shadow-sm border border-gray-100 rounded-xl relative overflow-hidden bg-gray-50/50">
           <CardContent className="p-4 flex gap-4 opacity-75">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                 <Check className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                 <h4 className="font-medium text-gray-900">New Account Created</h4>
                 <p className="text-gray-600 text-sm mt-1">Buyer 'John Doe' has successfully completed registration and is assigned to you.</p>
                 <span className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> 2 days ago</span>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
