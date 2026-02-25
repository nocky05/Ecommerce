"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="toast-container">
                {notifications.map(n => (
                    <Toast key={n.id} message={n.message} type={n.type} onDispose={() => setNotifications(prev => prev.filter(noti => noti.id !== n.id))} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

const Toast: React.FC<{ message: string, type: NotificationType, onDispose: () => void }> = ({ message, type, onDispose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <div className={`toast toast-${type}`} onClick={onDispose}>
            <span className="toast-icon">{getIcon()}</span>
            <p className="toast-message">{message}</p>
            <div className="toast-progress"></div>
        </div>
    );
};
