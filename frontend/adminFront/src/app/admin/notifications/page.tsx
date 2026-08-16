"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, AlertCircle, Info, Trash2, Check, Search, Filter, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { useUserStore } from "@/lib/store";

export default function NotificationsPage() {
  const { user } = useUserStore();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD">("ALL");

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    deleteNotification(id);
  };

  const filteredNotifications = notifications
    .filter((n: any) => (filterType === "UNREAD" ? !n.isRead : true))
    .filter(
      (n: any) =>
        (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.message && n.message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "WARNING":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Success</Badge>;
      case "WARNING":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-0">Warning</Badge>;
      case "ERROR":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Error</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">Info</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <BellRing className="h-6 w-6" />
            </div>
            Notifications Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view all system and user alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden backdrop-blur-xl bg-background/50">
        <CardHeader className="border-b border-border/50 bg-accent/20 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-9 rounded-xl bg-background border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border/50">
              <Button
                variant={filterType === "ALL" ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg font-bold text-xs ${filterType === "ALL" ? "shadow-sm" : ""}`}
                onClick={() => setFilterType("ALL")}
              >
                All
              </Button>
              <Button
                variant={filterType === "UNREAD" ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg font-bold text-xs ${filterType === "UNREAD" ? "shadow-sm" : ""}`}
                onClick={() => setFilterType("UNREAD")}
              >
                Unread
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
               <p className="text-sm text-muted-foreground">Loading notifications...</p>
             </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-accent/50 p-4 rounded-full mb-4">
                <BellRing className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold mb-1">No notifications found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn't find any notifications matching your current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredNotifications.map((notification: any) => {
                const notifId = notification._id || notification.id;
                return (
                <Link
                  key={notifId}
                  href={`/admin/notifications/${notifId}`}
                  className={`block group transition-colors hover:bg-accent/30 ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="p-6 flex gap-4 sm:gap-6 items-start">
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-xl ${!notification.isRead ? 'bg-background shadow-sm border border-border/50' : 'bg-accent/50'}`}>
                         {getIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-base font-bold truncate ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                            {notification.title || "Notification"}
                          </h4>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getTypeBadge(notification.type)}
                          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : "Just now"}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors"
                          title="Mark as read"
                          onClick={(e) => handleMarkAsRead(notifId, e)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                        onClick={(e) => handleDelete(notifId, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
