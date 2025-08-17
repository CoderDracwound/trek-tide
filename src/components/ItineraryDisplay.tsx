import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Info,
  Share2,
  Download
} from "lucide-react";
import { TravelItinerary, TravelDay, Activity } from "@/services/aiTravelService";

interface ItineraryDisplayProps {
  itinerary: TravelItinerary;
  onEditActivity?: (dayIndex: number, timeSlot: string, activityIndex: number, activity: Activity) => void;
  onDeleteActivity?: (dayIndex: number, timeSlot: string, activityIndex: number) => void;
  onMoveActivity?: (dayIndex: number, timeSlot: string, activityIndex: number, direction: 'up' | 'down') => void;
  onShare?: () => void;
  onExport?: () => void;
}

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', icon: '🌅', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️', color: 'bg-orange-100 text-orange-800' },
  { key: 'evening', label: 'Evening', icon: '🌆', color: 'bg-purple-100 text-purple-800' }
];

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    food: '🍽️',
    dining: '🍽️',
    museum: '🏛️',
    culture: '🎭',
    nature: '🌲',
    sightseeing: '👁️',
    shopping: '🛍️',
    transportation: '🚗',
    accommodation: '🏨',
    entertainment: '🎪',
    adventure: '🎢',
    beach: '🏖️',
    architecture: '🏰'
  };
  return icons[category.toLowerCase()] || '📍';
};

export default function ItineraryDisplay({ 
  itinerary, 
  onEditActivity, 
  onDeleteActivity, 
  onMoveActivity,
  onShare,
  onExport 
}: ItineraryDisplayProps) {
  const [selectedDay, setSelectedDay] = useState(0);

  const renderActivity = (
    activity: Activity, 
    dayIndex: number, 
    timeSlot: string, 
    activityIndex: number,
    isFirst: boolean,
    isLast: boolean
  ) => (
    <Card key={activity.id} className="p-4 border-2 neo-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(activity.category)}</span>
          <h4 className="font-bold text-lg">{activity.name}</h4>
        </div>
        <div className="flex gap-1">
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveActivity?.(dayIndex, timeSlot, activityIndex, 'up')}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          {!isLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveActivity?.(dayIndex, timeSlot, activityIndex, 'down')}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditActivity?.(dayIndex, timeSlot, activityIndex, activity)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteActivity?.(dayIndex, timeSlot, activityIndex)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-3">{activity.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{activity.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-warning" />
          <span>{activity.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-success" />
          <span>{activity.cost}</span>
        </div>
      </div>

      {activity.openingHours && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Info className="w-4 h-4" />
          <span>Hours: {activity.openingHours}</span>
        </div>
      )}

      {activity.tips && (
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-sm"><strong>💡 Tip:</strong> {activity.tips}</p>
        </div>
      )}
    </Card>
  );

  const renderTimeSlot = (timeSlot: typeof TIME_SLOTS[0], dayIndex: number, activities: Activity[]) => (
    <div key={timeSlot.key} className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge className={`${timeSlot.color} px-3 py-1`}>
          <span className="mr-2">{timeSlot.icon}</span>
          {timeSlot.label}
        </Badge>
        <div className="h-px bg-border flex-1" />
      </div>
      
      <div className="space-y-4 pl-4">
        {activities.map((activity, activityIndex) =>
          renderActivity(
            activity,
            dayIndex,
            timeSlot.key,
            activityIndex,
            activityIndex === 0,
            activityIndex === activities.length - 1
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-4 border-border neo-shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="heading-lg text-foreground">{itinerary.destination}</h1>
              <p className="text-lg text-muted-foreground">
                {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" onClick={onExport}>
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 neo-shadow border-2">
              <h3 className="font-bold mb-2">Overview</h3>
              <p className="text-sm text-muted-foreground">{itinerary.overview}</p>
            </Card>
            <Card className="p-4 neo-shadow border-2">
              <h3 className="font-bold mb-2">Budget</h3>
              <p className="text-sm text-muted-foreground">{itinerary.totalBudget}</p>
            </Card>
            <Card className="p-4 neo-shadow border-2">
              <h3 className="font-bold mb-2">Duration</h3>
              <p className="text-sm text-muted-foreground">{itinerary.days.length} days</p>
            </Card>
          </div>

          {itinerary.tips.length > 0 && (
            <Card className="p-4 neo-shadow border-2 bg-accent/10">
              <h3 className="font-bold mb-2">✨ Essential Tips</h3>
              <ul className="space-y-1">
                {itinerary.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Day Navigation */}
      <div className="bg-muted/30 border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {itinerary.days.map((day, index) => (
              <Button
                key={day.day}
                variant={selectedDay === index ? "default" : "outline"}
                className={`whitespace-nowrap ${selectedDay === index ? 'neo-shadow' : ''}`}
                onClick={() => setSelectedDay(index)}
              >
                Day {day.day}
                <span className="hidden sm:inline ml-2">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Content */}
      <div className="container mx-auto px-4 py-8">
        {itinerary.days[selectedDay] && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="heading-md mb-2">
                Day {itinerary.days[selectedDay].day}: {itinerary.days[selectedDay].title}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {new Date(itinerary.days[selectedDay].date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {itinerary.days[selectedDay].notes && (
                <Card className="p-4 neo-shadow border-2 bg-warning/10">
                  <p className="text-sm"><strong>📝 Note:</strong> {itinerary.days[selectedDay].notes}</p>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              {TIME_SLOTS.map(timeSlot => {
                const activities = itinerary.days[selectedDay][timeSlot.key as keyof TravelDay] as Activity[];
                if (!activities || activities.length === 0) return null;
                
                return renderTimeSlot(timeSlot, selectedDay, activities);
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}