"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationsDropdownProps {
  user: any;
  role: "instructor" | "student";
}

export function NotificationsDropdown({ user, role }: NotificationsDropdownProps) {
  const { notifications } = useNotifications(user);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "WARNING":
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-background h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border-border/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <DropdownMenuLabel className="p-0 font-bold text-sm">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 10).map((notification: any, index: number) => (
                <div key={notification._id || notification.id || index} className="border-b border-border/50 last:border-0">
                  <DropdownMenuItem className="p-3 cursor-pointer items-start gap-3 focus:bg-accent/50 group transition-colors rounded-none">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title || 'New Notification'}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border/50 bg-accent/20">
          <Link href={`/${role}/notifications`} passHref>
            <Button
              variant="ghost"
              className="w-full text-xs font-semibold h-8 rounded-xl justify-center text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
