import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingUnread, setLoadingUnread] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }

        try {
            setLoadingUnread(true);
            const response = await api.get("/noti/notifications/unread-count");
            if (response.data && typeof response.data.count === "number") {
                setUnreadCount(Math.max(0, response.data.count));
            }
        } catch (error) {
            console.warn(
                "Failed to fetch unread count:",
                error.response?.data?.message || error.message
            );
        } finally {
            setLoadingUnread(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [isAuthenticated, user?._id, fetchUnreadCount]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleSync = () => {
            fetchUnreadCount();
        };

        window.addEventListener("focus", handleSync);
        window.addEventListener("snapzy:notifications-changed", handleSync);

        const intervalId = setInterval(handleSync, 30000);

        return () => {
            window.removeEventListener("focus", handleSync);
            window.removeEventListener("snapzy:notifications-changed", handleSync);
            clearInterval(intervalId);
        };
    }, [isAuthenticated, fetchUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        setUnreadCount(0);
        try {
            const res = await api.patch("/noti/notifications/read-all");
            window.dispatchEvent(new CustomEvent("snapzy:notifications-changed"));
            return res.data;
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            fetchUnreadCount();
            throw error;
        }
    }, [fetchUnreadCount]);

    const deleteNotificationApi = useCallback(
        async (notificationId, wasUnread = false) => {
            if (wasUnread) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }

            try {
                const res = await api.delete(
                    `/noti/delete-notifications/${notificationId}`
                );
                window.dispatchEvent(
                    new CustomEvent("snapzy:notifications-changed")
                );
                return res.data;
            } catch (error) {
                console.error("Failed to delete notification:", error);
                fetchUnreadCount();
                throw error;
            }
        },
        [fetchUnreadCount]
    );

    const deleteAllNotificationsApi = useCallback(async () => {
        setUnreadCount(0);
        try {
            const res = await api.delete(
                "/noti/notifications/delete-notifications"
            );
            window.dispatchEvent(
                new CustomEvent("snapzy:notifications-changed")
            );
            return res.data;
        } catch (error) {
            console.error("Failed to delete all notifications:", error);
            fetchUnreadCount();
            throw error;
        }
    }, [fetchUnreadCount]);

    const decrementUnreadCount = useCallback((amount = 1) => {
        setUnreadCount((prev) => Math.max(0, prev - amount));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                hasUnread: unreadCount > 0,
                loadingUnread,
                setUnreadCount,
                fetchUnreadCount,
                decrementUnreadCount,
                markAllAsRead,
                deleteNotificationApi,
                deleteAllNotificationsApi,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        return {
            unreadCount: 0,
            hasUnread: false,
            loadingUnread: false,
            setUnreadCount: () => {},
            fetchUnreadCount: async () => {},
            decrementUnreadCount: () => {},
            markAllAsRead: async () => {},
            deleteNotificationApi: async () => {},
            deleteAllNotificationsApi: async () => {},
        };
    }
    return context;
};
