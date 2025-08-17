import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Calendar, DollarSign, Clock, Heart, Users } from "lucide-react";
import { TravelPreferences } from "@/services/aiTravelService";

interface TravelIntakeFormProps {
  onSubmit: (preferences: TravelPreferences) => void;
}

const INTERESTS = [
  { id: "food", label: "Food & Dining", emoji: "🍽️" },
  { id: "museums", label: "Museums & Culture", emoji: "🏛️" },
  { id: "nature", label: "Nature & Outdoors", emoji: "🌲" },
  { id: "nightlife", label: "Nightlife & Entertainment", emoji: "🌙" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "architecture", label: "Architecture", emoji: "🏰" },
  { id: "beaches", label: "Beaches & Water", emoji: "🏖️" },
  { id: "adventure", label: "Adventure Sports", emoji: "🎢" },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", description: "Under ₹8,000/day" },
  { value: "mid-range", label: "Mid-Range", description: "₹8,000-20,000/day" },
  { value: "luxury", label: "Luxury", description: "₹20,000+/day" },
];

const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed", description: "2-3 activities per day" },
  { value: "moderate", label: "Moderate", description: "3-4 activities per day" },
  { value: "packed", label: "Packed", description: "5+ activities per day" },
];

export default function TravelIntakeForm({ onSubmit }: TravelIntakeFormProps) {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    pace: "",
    interests: [],
    groupSize: "",
    notes: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.destination || !preferences.startDate || !preferences.endDate) {
      return;
    }
    
    setIsGenerating(true);
    onSubmit(preferences);
  };

  const toggleInterest = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-xl text-foreground mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us what you're dreaming of, and our AI will craft a personalized itinerary in seconds
          </p>
        </div>

        {/* Main Form */}
        <Card className="neo-shadow border-4 border-border bg-card">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Destination & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2 text-base font-bold">
                  <MapPin className="w-5 h-5 text-primary" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="Paris, Tokyo, New York..."
                  value={preferences.destination}
                  onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))}
                  className="neo-shadow border-2"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2 text-base font-bold">
                  <Calendar className="w-5 h-5 text-accent" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={preferences.startDate}
                  onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                  className="neo-shadow border-2"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2 text-base font-bold">
                  <Calendar className="w-5 h-5 text-accent" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={preferences.endDate}
                  onChange={(e) => setPreferences(prev => ({ ...prev, endDate: e.target.value }))}
                  className="neo-shadow border-2"
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-bold">
                <DollarSign className="w-5 h-5 text-success" />
                Budget Range
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BUDGET_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all neo-shadow-hover ${
                      preferences.budget === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                    onClick={() => setPreferences(prev => ({ ...prev, budget: option.value }))}
                  >
                    <div className="font-bold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pace */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-bold">
                <Clock className="w-5 h-5 text-warning" />
                Travel Pace
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PACE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all neo-shadow-hover ${
                      preferences.pace === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                    onClick={() => setPreferences(prev => ({ ...prev, pace: option.value }))}
                  >
                    <div className="font-bold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-bold">
                <Heart className="w-5 h-5 text-destructive" />
                What are you interested in?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERESTS.map((interest) => (
                  <div
                    key={interest.id}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all neo-shadow-hover ${
                      preferences.interests.includes(interest.id)
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <Checkbox
                      checked={preferences.interests.includes(interest.id)}
                      onCheckedChange={() => toggleInterest(interest.id)}
                    />
                    <span className="text-xl">{interest.emoji}</span>
                    <span 
                      className="text-sm font-medium cursor-pointer flex-1"
                      onClick={() => toggleInterest(interest.id)}
                    >
                      {interest.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div className="space-y-2">
              <Label htmlFor="groupSize" className="flex items-center gap-2 text-base font-bold">
                <Users className="w-5 h-5 text-primary" />
                Group Size
              </Label>
              <Input
                id="groupSize"
                placeholder="2 adults, 1 child..."
                value={preferences.groupSize}
                onChange={(e) => setPreferences(prev => ({ ...prev, groupSize: e.target.value }))}
                className="neo-shadow border-2"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-bold">
                Special Requests or Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Dietary restrictions, accessibility needs, must-see places..."
                value={preferences.notes}
                onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                className="neo-shadow border-2 min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isGenerating || !preferences.destination || !preferences.startDate || !preferences.endDate}
                className="w-full"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Crafting Your Perfect Trip...
                  </div>
                ) : (
                  "Generate My Itinerary ✨"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}