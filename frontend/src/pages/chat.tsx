import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';

const WS_URL = import.meta.env.VITE_WS_URL;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'server';
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const newSocket = io(WS_URL, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem('jwt'),
      },
    });

    newSocket.on('connect', () => {
      setIsConnecting(false);
      toast.success('Connected to chat server');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnecting(false);
      toast.error('Failed to connect: ' + error.message);
    });

    setSocket(newSocket);

    // Load messages from local storage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        toast.error('Failed to load message history');
        localStorage.removeItem('chatMessages');
      }
    }

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (message: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'server',
        timestamp: new Date()
      };
      
      setMessages(prev => {
        const updated = [...prev, newMessage];
        try {
          localStorage.setItem('chatMessages', JSON.stringify(updated));
        } catch (error) {
          toast.error('Failed to save message history');
        }
        return updated;
      });
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) {
      toast.error('Not connected to chat server');
      return;
    }

    if (!inputMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    try {
      socket.emit('message', inputMessage);
      setMessages(prev => {
        const updated = [...prev, newMessage];
        localStorage.setItem('chatMessages', JSON.stringify(updated));
        return updated;
      });
      setInputMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-card-foreground">Echo Chat</h1>
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-4">
        <div className="chat-container">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Connecting to chat server...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="messages-container">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start chatting!</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.sender === 'user' ? 'message-bubble user-message' : 'message-bubble echo-message'}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="input-container">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={socket?.connected ? "Type a message..." : "Connecting..."}
                    disabled={!socket?.connected}
                    className="flex-1 p-2 rounded-md border border-input bg-background text-foreground disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!socket?.connected}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 