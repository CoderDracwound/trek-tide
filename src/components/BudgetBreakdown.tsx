import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, 
  Utensils, 
  Camera, 
  MapPin, 
  Car, 
  Bed,
  ShoppingBag,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { TravelItinerary } from "@/services/aiTravelService";

interface BudgetBreakdownProps {
  itinerary: TravelItinerary | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BudgetCategory {
  name: string;
  icon: React.ReactNode;
  estimated: number;
  description: string;
  color: string;
}

const calculateBudgetBreakdown = (itinerary: TravelItinerary): BudgetCategory[] => {
  const days = itinerary.days.length;
  
  // Extract budget range for INR (₹15,000-25,000 format)
  const budgetMatch = itinerary.totalBudget.match(/₹([\d,]+)-([\d,]+)/);
  const totalBudgetMin = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 15000;
  const totalBudgetMax = budgetMatch ? parseInt(budgetMatch[2].replace(/,/g, '')) : 25000;
  const avgBudget = (totalBudgetMin + totalBudgetMax) / 2;

  // Count activities by category to estimate spending
  let foodActivities = 0;
  let sightseeingActivities = 0;
  let transportActivities = 0;
  let shoppingActivities = 0;

  itinerary.days.forEach(day => {
    [...day.morning, ...day.afternoon, ...day.evening].forEach(activity => {
      if (activity.category === 'food' || activity.category === 'dining') foodActivities++;
      if (activity.category === 'sightseeing' || activity.category === 'culture' || activity.category === 'museums') sightseeingActivities++;
      if (activity.category === 'transportation') transportActivities++;
      if (activity.category === 'shopping') shoppingActivities++;
    });
  });

  // Estimate breakdown percentages
  const accommodationPercentage = 40; // Usually the largest expense
  const foodPercentage = 25;
  const activitiesPercentage = 20;
  const transportPercentage = 10;
  const shoppingPercentage = 5;

  return [
    {
      name: "Accommodation",
      icon: <Bed className="w-5 h-5" />,
      estimated: Math.round(avgBudget * (accommodationPercentage / 100)),
      description: `Hotels/lodging for ${days} nights`,
      color: "bg-blue-500"
    },
    {
      name: "Food & Dining", 
      icon: <Utensils className="w-5 h-5" />,
      estimated: Math.round(avgBudget * (foodPercentage / 100)),
      description: `${foodActivities} dining experiences`,
      color: "bg-green-500"
    },
    {
      name: "Activities & Sightseeing",
      icon: <Camera className="w-5 h-5" />,
      estimated: Math.round(avgBudget * (activitiesPercentage / 100)),
      description: `${sightseeingActivities} attractions and tours`,
      color: "bg-purple-500"
    },
    {
      name: "Transportation",
      icon: <Car className="w-5 h-5" />,
      estimated: Math.round(avgBudget * (transportPercentage / 100)),
      description: "Local transport and transfers",
      color: "bg-orange-500"
    },
    {
      name: "Shopping & Misc",
      icon: <ShoppingBag className="w-5 h-5" />,
      estimated: Math.round(avgBudget * (shoppingPercentage / 100)),
      description: "Souvenirs and miscellaneous",
      color: "bg-pink-500"
    }
  ];
};

export default function BudgetBreakdown({ itinerary, isOpen, onClose }: BudgetBreakdownProps) {
  if (!itinerary) return null;

  const budgetCategories = calculateBudgetBreakdown(itinerary);
  const totalEstimated = budgetCategories.reduce((sum, category) => sum + category.estimated, 0);
  const dailyAverage = Math.round(totalEstimated / itinerary.days.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] neo-shadow border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Budget Breakdown
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Trip Summary */}
            <Card className="p-4 neo-shadow border-2 bg-accent/5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{itinerary.destination}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="default" className="text-lg px-3 py-1">
                  ₹{totalEstimated.toLocaleString('en-IN')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{itinerary.days.length} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Daily average:</span>
                  <span className="ml-2 font-medium">₹{dailyAverage.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>

            {/* Budget Categories */}
            <div className="space-y-4">
              <h4 className="font-bold text-base">Estimated Expenses</h4>
              
              {budgetCategories.map((category, index) => {
                const percentage = Math.round((category.estimated / totalEstimated) * 100);
                
                return (
                  <Card key={category.name} className="p-4 border-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <h5 className="font-medium">{category.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{category.estimated.toLocaleString('en-IN')}</div>
                        <div className="text-sm text-muted-foreground">{percentage}%</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </Card>
                );
              })}
            </div>

            <Separator />

            {/* Savings Tips */}
            <Card className="p-4 neo-shadow border-2 bg-success/10">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Money-Saving Tips
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>Book accommodations with kitchen facilities to save on meals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>Use public transportation instead of taxis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>Look for free walking tours and attractions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>Eat at local markets and street food vendors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>Book activities in advance for early bird discounts</span>
                </li>
              </ul>
            </Card>

            {/* Important Notice */}
            <Card className="p-4 border-2 bg-warning/10 border-warning">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning mb-1">Estimate Only</p>
                  <p className="text-muted-foreground">
                    This budget breakdown is an estimate based on your itinerary. 
                    Actual costs may vary depending on your choices, season, and local prices.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}