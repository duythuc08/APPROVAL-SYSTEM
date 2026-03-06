import { Bell, CheckCheck, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function getTypeLabel(type: string) {
    switch (type) {
        case "NEW_REQUEST": return { text: "Yêu cầu mới", color: "text-blue-600 bg-blue-50" };
        case "REQUEST_APPROVED": return { text: "Đã duyệt", color: "text-green-600 bg-green-50" };
        case "REQUEST_REJECTED": return { text: "Từ chối", color: "text-red-600 bg-red-50" };
        default: return { text: "Thông báo", color: "text-gray-600 bg-gray-50" };
    }
}

function NotificationItem({ noti, onRead }: { noti: Notification; onRead: (id: number) => void }) {
    const typeInfo = getTypeLabel(noti.type);

    return (
        <div
            onClick={() => { if (!noti.read) onRead(noti.id); }}
            className={`px-4 py-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/50 ${!noti.read ? "bg-blue-50/60" : ""}`}
        >
            <div className="flex items-start gap-2">
                {!noti.read ? (
                    <Circle className="h-2 w-2 mt-1.5 fill-blue-500 text-blue-500 shrink-0" />
                ) : (
                    <div className="w-2 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                            {typeInfo.text}
                        </span>
                    </div>
                    <p className={`text-sm leading-snug ${!noti.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {noti.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                </div>
            </div>
        </div>
    );
}

export const NotificationBell = () => {
    const { notifications, unreadCount, markOneRead, markAllRead } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Thông báo</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {unreadCount} chưa đọc
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={markAllRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">Không có thông báo nào</p>
                        </div>
                    ) : (
                        notifications.map((noti) => (
                            <NotificationItem key={noti.id} noti={noti} onRead={markOneRead} />
                        ))
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
