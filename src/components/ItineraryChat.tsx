import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Sparkles, Loader2 } from "lucide-react";
import { TravelItinerary } from "@/services/aiTravelService";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ItineraryChatProps {
  itinerary: TravelItinerary;
  onRefineItinerary: (request: string) => Promise<void>;
  isRefining?: boolean;
}

export default function ItineraryChat({ 
  itinerary, 
  onRefineItinerary, 
  isRefining = false 
}: ItineraryChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I've created your ${itinerary.destination} itinerary. Feel free to ask me to make any changes! For example:\n\n• "Make Day 2 less walking-intensive"\n• "Add more food experiences"\n• "Replace the museum with something outdoors"\n• "Make the evenings more relaxed"`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isRefining) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'I\'m updating your itinerary based on your request...',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputMessage('');

    try {
      await onRefineItinerary(inputMessage);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: 'Great! I\'ve updated your itinerary. Take a look at the changes and let me know if you\'d like any other adjustments!' }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: 'Sorry, I encountered an error updating your itinerary. Please try again with a different request.' }
            : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    "Add more food experiences",
    "Make it less walking",
    "Include more outdoor activities",
    "Add cultural sites",
    "Make evenings more relaxed",
    "Include local markets"
  ];

  return (
    <Card className="h-[600px] flex flex-col neo-shadow border-2">
      {/* Header */}
      <div className="p-4 border-b border-border bg-accent/5">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          <h3 className="font-bold">Refine Your Itinerary</h3>
          <Sparkles className="w-4 h-4 text-warning" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Tell me what you'd like to change and I'll update your plan
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground neo-shadow'
                    : 'bg-muted border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isRefining && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Updating your itinerary...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Suggestions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInputMessage(suggestion)}
              disabled={isRefining}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Input */}
      <div className="p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe what you'd like to change..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[60px] resize-none"
            disabled={isRefining}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isRefining}
            className="neo-shadow"
          >
            {isRefining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}