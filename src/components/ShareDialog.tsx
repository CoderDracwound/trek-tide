import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Link2, 
  Mail, 
  MessageSquare, 
  Copy,
  Facebook,
  Twitter,
  QrCode
} from "lucide-react";
import { TravelItinerary } from "@/services/aiTravelService";

interface ShareDialogProps {
  itinerary: TravelItinerary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareDialog({ itinerary, isOpen, onClose }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { toast } = useToast();

  const generateShareUrl = async () => {
    if (!itinerary) return;
    
    setIsGeneratingLink(true);
    
    // Simulate generating a share URL - in real implementation, save to backend
    setTimeout(() => {
      const mockShareId = Date.now().toString(36);
      const url = `${window.location.origin}/shared/${mockShareId}`;
      setShareUrl(url);
      setIsGeneratingLink(false);
      
      toast({
        title: "Share Link Created! 🔗",
        description: "Your itinerary is now ready to share.",
      });
    }, 1500);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! 📋",
        description: "Link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Check out my ${itinerary?.destination} travel itinerary! ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `My ${itinerary?.destination} Travel Itinerary`;
    const body = `I've planned an amazing trip to ${itinerary?.destination}! Check out my detailed itinerary:\n\n${shareUrl}\n\nGenerated with AI Travel Planner`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const shareViaTwitter = () => {
    const message = `Just planned my ${itinerary?.destination} adventure with AI! 🧳✨ ${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  if (!itinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md neo-shadow border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Itinerary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Trip Summary */}
          <Card className="p-4 neo-shadow border-2 bg-accent/5">
            <h3 className="font-bold text-lg">{itinerary.destination}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{itinerary.days.length} days</Badge>
              <Badge variant="secondary">{itinerary.totalBudget}</Badge>
            </div>
          </Card>

          {/* Generate Share Link */}
          {!shareUrl ? (
            <div className="text-center">
              <Button 
                onClick={generateShareUrl} 
                disabled={isGeneratingLink}
                className="neo-shadow"
              >
                {isGeneratingLink ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating Share Link...
                  </div>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Share Link
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Creates a public link that anyone can view
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Share URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Quick Share Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Share</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaWhatsApp}
                    className="justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                    WhatsApp
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaEmail}
                    className="justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    Email
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaTwitter}
                    className="justify-start"
                  >
                    <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                    Twitter
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaFacebook}
                    className="justify-start"
                  >
                    <Facebook className="w-4 h-4 mr-2 text-blue-700" />
                    Facebook
                  </Button>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center p-4 border-2 border-dashed border-border rounded-lg">
                <QrCode className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  QR Code feature coming soon!
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}