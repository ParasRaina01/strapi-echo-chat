import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const WS_URL = import.meta.env.VITE_WS_URL;

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface WebSocketContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  connectionError: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(WS_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      toast.success('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from chat server');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      setConnectionError('Unable to connect to chat server. Please check your internet connection.');
      toast.error('Connection error: ' + error.message);
    });

    newSocket.on('error', (error) => {
      toast.error('Chat error: ' + error.message);
    });

    setSocket(newSocket);

    // Load messages from local storage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load saved messages:', error);
        localStorage.removeItem('chatMessages');
      }
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (content: string) => {
    if (!socket) {
      toast.error('Not connected to chat server');
      return;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    try {
      socket.emit('message', content);
      setMessages((prev) => {
        const updated = [...prev, userMessage];
        localStorage.setItem('chatMessages', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('message', (message: string) => {
      const echoMessage: Message = {
        id: Date.now().toString(),
        content: message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, echoMessage];
        try {
          localStorage.setItem('chatMessages', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save messages:', error);
        }
        return updated;
      });
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage, isConnected, connectionError }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}