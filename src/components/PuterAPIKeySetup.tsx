import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Key, Shield, ExternalLink } from "lucide-react";

interface PuterAPIKeySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export default function PuterAPIKeySetup({ isOpen, onClose, onApiKeySet }: PuterAPIKeySetupProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key already exists in localStorage
    const existingKey = localStorage.getItem("puter_api_key");
    if (existingKey) {
      setHasExistingKey(true);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Puter AI API key.",
        variant: "destructive",
      });
      return;
    }

    // Store in localStorage (note: this is for frontend-only approach)
    localStorage.setItem("puter_api_key", apiKey.trim());
    onApiKeySet(apiKey.trim());
    
    toast({
      title: "API Key Saved! 🔑",
      description: "You can now generate AI-powered itineraries.",
    });
    
    onClose();
  };

  const handleUseExistingKey = () => {
    const existingKey = localStorage.getItem("puter_api_key");
    if (existingKey) {
      onApiKeySet(existingKey);
      onClose();
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("puter_api_key");
    setHasExistingKey(false);
    setApiKey("");
    
    toast({
      title: "API Key Cleared",
      description: "You'll need to enter a new API key to use AI features.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md neo-shadow border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Puter AI Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> For production apps, API keys should be stored securely on the backend. 
              For this demo, we'll store it locally in your browser.
            </AlertDescription>
          </Alert>

          {/* Supabase Recommendation */}
          <Card className="p-4 border-2 bg-accent/5">
            <h4 className="font-bold mb-2">🔒 Recommended: Connect to Supabase</h4>
            <p className="text-sm text-muted-foreground mb-3">
              For secure API key storage and backend functionality, connect this project to Supabase.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://docs.lovable.dev/tips-tricks/supabase" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Integrate Supabase
              </a>
            </Button>
          </Card>

          {/* API Key Input */}
          {hasExistingKey ? (
            <div className="space-y-4">
              <Card className="p-4 border-2 bg-success/10">
                <div className="flex items-center gap-2 text-success mb-2">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">API Key Found</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You already have a Puter AI API key stored. You can use it or replace it with a new one.
                </p>
              </Card>
              
              <div className="flex gap-2">
                <Button onClick={handleUseExistingKey} className="flex-1 neo-shadow">
                  Use Existing Key
                </Button>
                <Button variant="outline" onClick={handleClearKey}>
                  Clear & Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Puter AI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Puter AI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="neo-shadow border-2"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a 
                    href="https://puter.ai/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    puter.ai
                  </a>
                </p>
              </div>
              
              <Button onClick={handleSaveApiKey} className="w-full neo-shadow">
                Save API Key
              </Button>
            </div>
          )}

          {/* Instructions */}
          <Card className="p-4 border-2 bg-muted/30">
            <h4 className="font-bold mb-2">📝 How to get your API key:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Visit <a href="https://puter.ai/" target="_blank" className="text-primary hover:underline">puter.ai</a></li>
              <li>2. Create an account or sign in</li>
              <li>3. Navigate to API settings</li>
              <li>4. Generate a new API key</li>
              <li>5. Copy and paste it here</li>
            </ol>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}