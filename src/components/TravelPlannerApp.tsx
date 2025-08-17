import { useState } from "react";
import TravelIntakeForm from "@/components/TravelIntakeForm";
import ItineraryDisplay from "@/components/ItineraryDisplay";
import ItineraryChat from "@/components/ItineraryChat";
import ActivityEditDialog from "@/components/ActivityEditDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { 
  TravelItinerary, 
  TravelPreferences, 
  Activity,
  aiTravelService 
} from "@/services/aiTravelService";

export default function TravelPlannerApp() {
  const [currentStep, setCurrentStep] = useState<'intake' | 'generating' | 'itinerary'>('intake');
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{
    activity: Activity;
    dayIndex: number;
    timeSlot: string;
    activityIndex: number;
  } | null>(null);
  
  const { toast } = useToast();

  const handleGenerateItinerary = async (preferences: TravelPreferences) => {
    setCurrentStep('generating');
    setGenerationProgress('');
    
    try {
      const result = await aiTravelService.generateItinerary(
        preferences,
        (chunk) => setGenerationProgress(prev => prev + chunk)
      );
      
      setItinerary(result);
      setCurrentStep('itinerary');
      
      toast({
        title: "Itinerary Generated! 🎉",
        description: `Your ${preferences.destination} adventure is ready!`,
      });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast({
        title: "Generation Failed",
        description: "Sorry, we couldn't generate your itinerary. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('intake');
    }
  };

  const handleRefineItinerary = async (request: string) => {
    if (!itinerary) return;
    
    setIsRefining(true);
    
    try {
      const refinedItinerary = await aiTravelService.refineItinerary(
        itinerary,
        request,
        (chunk) => console.log('Refinement chunk:', chunk)
      );
      
      setItinerary(refinedItinerary);
      
      toast({
        title: "Itinerary Updated! ✨",
        description: "Your changes have been applied successfully.",
      });
    } catch (error) {
      console.error('Error refining itinerary:', error);
      toast({
        title: "Update Failed",
        description: "Sorry, we couldn't update your itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleEditActivity = (dayIndex: number, timeSlot: string, activityIndex: number, activity: Activity) => {
    setEditingActivity({ activity, dayIndex, timeSlot, activityIndex });
  };

  const handleSaveActivity = (updatedActivity: Activity) => {
    if (!itinerary || !editingActivity) return;
    
    const newItinerary = { ...itinerary };
    const day = newItinerary.days[editingActivity.dayIndex];
    const activities = day[editingActivity.timeSlot as keyof typeof day] as Activity[];
    
    if (activities && activities[editingActivity.activityIndex]) {
      activities[editingActivity.activityIndex] = updatedActivity;
      setItinerary(newItinerary);
      
      toast({
        title: "Activity Updated",
        description: "Your changes have been saved.",
      });
    }
    
    setEditingActivity(null);
  };

  const handleDeleteActivity = (dayIndex: number, timeSlot: string, activityIndex: number) => {
    if (!itinerary) return;
    
    const newItinerary = { ...itinerary };
    const day = newItinerary.days[dayIndex];
    const activities = day[timeSlot as keyof typeof day] as Activity[];
    
    if (activities && activities.length > activityIndex) {
      activities.splice(activityIndex, 1);
      setItinerary(newItinerary);
      
      toast({
        title: "Activity Removed",
        description: "The activity has been deleted from your itinerary.",
      });
    }
  };

  const handleMoveActivity = (dayIndex: number, timeSlot: string, activityIndex: number, direction: 'up' | 'down') => {
    if (!itinerary) return;
    
    const newItinerary = { ...itinerary };
    const day = newItinerary.days[dayIndex];
    const activities = day[timeSlot as keyof typeof day] as Activity[];
    
    if (!activities) return;
    
    const newIndex = direction === 'up' ? activityIndex - 1 : activityIndex + 1;
    
    if (newIndex >= 0 && newIndex < activities.length) {
      const temp = activities[activityIndex];
      activities[activityIndex] = activities[newIndex];
      activities[newIndex] = temp;
      
      setItinerary(newItinerary);
      
      toast({
        title: "Activity Moved",
        description: `Activity moved ${direction}.`,
      });
    }
  };

  const handleShare = () => {
    // Placeholder for sharing functionality
    toast({
      title: "Share Feature Coming Soon! 🔗",
      description: "We're working on making it easy to share your itinerary.",
    });
  };

  const handleExport = () => {
    // Placeholder for PDF export functionality
    toast({
      title: "Export Feature Coming Soon! 📄",
      description: "PDF export will be available soon.",
    });
  };

  const handleStartOver = () => {
    setCurrentStep('intake');
    setItinerary(null);
    setGenerationProgress('');
    setIsRefining(false);
    setEditingActivity(null);
  };

  if (currentStep === 'intake') {
    return <TravelIntakeForm onSubmit={handleGenerateItinerary} />;
  }

  if (currentStep === 'generating') {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 p-8 neo-shadow border-4 border-border">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
            
            <div>
              <h2 className="heading-md mb-2">Crafting Your Perfect Trip ✨</h2>
              <p className="text-muted-foreground">
                Our AI is analyzing destinations, checking availability, and creating your personalized itinerary...
              </p>
            </div>
            
            {generationProgress && (
              <div className="bg-muted/30 border border-border rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground mb-2">Generation Progress:</p>
                <div className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {generationProgress}
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleStartOver}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Planning
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <Button variant="outline" onClick={handleStartOver}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Plan New Trip
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row">
        {/* Main Itinerary */}
        <div className="flex-1">
          {itinerary && (
            <ItineraryDisplay
              itinerary={itinerary}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
              onMoveActivity={handleMoveActivity}
              onShare={handleShare}
              onExport={handleExport}
            />
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="xl:w-96 xl:border-l border-border bg-card/50">
          <div className="p-4 h-screen xl:sticky xl:top-0">
            {itinerary && (
              <ItineraryChat
                itinerary={itinerary}
                onRefineItinerary={handleRefineItinerary}
                isRefining={isRefining}
              />
            )}
          </div>
        </div>
      </div>

      {/* Activity Edit Dialog */}
      <ActivityEditDialog
        activity={editingActivity?.activity || null}
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveActivity}
      />
    </div>
  );
}