import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function AIChatbot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize greeting message based on current language
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: "greeting",
        content: t('chatbot.greeting'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [t, messages.length]);
  
  // Listen for language changes using i18next's built-in event
  useEffect(() => {
    const handleLanguageChange = () => {
      setMessages((prev) => prev.map((msg, index) => 
        index === 0 && msg.id === "greeting" 
          ? { ...msg, content: t('chatbot.greeting') }
          : msg
      ));
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [t, i18n]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { 
        message,
        language: i18n.language || 'en'
      });
      const data = await response.json();
      return data.response;
    },
    onSuccess: (response: string) => {
      const botMessage: Message = {
        id: Date.now().toString() + "_bot",
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        content: t('chatbot.errorMessage'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      
      // Always scroll for new messages unless user has manually scrolled up
      if (!userHasScrolled || isAtBottom) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
          setUserHasScrolled(false); // Reset after auto-scroll
        }, 100);
      }
    }
  }, [messages, userHasScrolled]);

  // Track manual scrolling
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      
      // If user scrolls up manually, mark it
      if (!isAtBottom) {
        setUserHasScrolled(true);
      } else {
        setUserHasScrolled(false);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString() + "_user",
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserHasScrolled(false); // Reset scroll tracking when sending new message
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-[28rem] shadow-xl z-50 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          {t('chatbot.title')}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          data-testid="button-close-chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div 
          className="flex-1 overflow-y-auto px-3 py-2 min-h-0"
          ref={scrollAreaRef}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={{ 
            overflowY: 'auto',
            maxHeight: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            className="space-y-3 pr-2"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.isUser ? "user" : "bot"}-${message.id}`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-2.5 text-sm leading-relaxed ${
                    message.isUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {message.content}
                </div>
                {message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-2 justify-start" data-testid="message-loading">
                <Bot className="h-5 w-5 text-blue-600 mt-1" />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2.5 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            disabled={chatMutation.isPending}
            className="flex-1 bg-white dark:bg-gray-900"
            data-testid="input-chat-message"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}