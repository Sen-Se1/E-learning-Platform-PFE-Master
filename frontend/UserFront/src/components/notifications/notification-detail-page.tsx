"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Trash2, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { useUserStore } from "@/lib/store";

export function NotificationDetailPageComponent() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  
  const basePath = pathname.split('/').slice(0, -1).join('/');
  
  const { user } = useUserStore();
  const { notifications, loading, deleteNotification, markAsRead } = useNotifications(user);

  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const found = notifications.find((n: any) => n._id === id || n.id === id);
      if (found) {
        setNotification(found);
        if (!found.isRead) {
          markAsRead(found._id || found.id);
        }
      } else {
        setNotification(null);
      }
    }
  }, [id, notifications, loading]);

  const handleDelete = () => {
    deleteNotification(id);
    router.push(basePath);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading notification details...</p>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="rounded-xl font-bold mb-4" 
          onClick={() => router.push(basePath)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notifications
        </Button>
        <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl p-12 text-center">
          <div className="bg-accent/50 p-4 rounded-full mb-4 inline-block">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-black mb-2">Notification Not Found</h2>
          <p className="text-muted-foreground">
            The notification you are looking for might have been deleted or does not exist.
          </p>
        </Card>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "WARNING":
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Info className="h-8 w-8 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
      case "CRITICAL":
        return <Badge className="bg-red-500 text-white hover:bg-red-600 border-0">Critical Priority</Badge>;
      case "High":
      case "HIGH":
        return <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-0">High Priority</Badge>;
      case "Low":
      case "LOW":
        return <Badge className="bg-slate-500 text-white hover:bg-slate-600 border-0">Low Priority</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-0">Medium Priority</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="rounded-xl font-bold hover:bg-background transition-colors" 
          onClick={() => router.push(basePath)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden backdrop-blur-xl bg-background/50">
        <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/50" />
        
        <CardHeader className="border-b border-border/50 bg-accent/10 px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className={`p-4 rounded-2xl bg-background shadow-sm border border-border/50 shrink-0`}>
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="rounded-lg font-bold uppercase tracking-wider text-[10px] bg-background">
                  {notification.type || "INFO"}
                </Badge>
                {notification.priority && getPriorityBadge(notification.priority)}
                {!notification.isRead && (
                   <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">New</Badge>
                )}
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black leading-tight">
                {notification.title || "Notification"}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 py-10">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-foreground/90">
              {notification.message}
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border/50">
               <div className="p-2 bg-background rounded-lg text-primary">
                 <Calendar className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Date Received</p>
                 <p className="text-sm font-semibold">{notification.createdAt ? format(new Date(notification.createdAt), 'PPP') : 'Unknown'}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border/50">
               <div className="p-2 bg-background rounded-lg text-primary">
                 <Clock className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Time</p>
                 <p className="text-sm font-semibold">{notification.createdAt ? format(new Date(notification.createdAt), 'pp') : 'Unknown'}</p>
               </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-border/50 bg-accent/5 px-8 py-4 flex items-center justify-between">
           <p className="text-xs font-semibold text-muted-foreground">
             ID: {notification._id || notification.id}
           </p>
           {notification.source && (
             <p className="text-xs font-semibold text-muted-foreground">
               Source: <span className="text-foreground">{notification.source}</span>
             </p>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
