import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Luggage, Plus, Check } from "lucide-react";
import { TravelItinerary } from "@/services/aiTravelService";

interface PackingChecklistProps {
  itinerary: TravelItinerary | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
  checked: boolean;
  climate?: string;
  season?: string;
}

const generatePackingList = (itinerary: TravelItinerary): PackingItem[] => {
  const baseItems: Omit<PackingItem, 'id' | 'checked'>[] = [
    // Documents & Money
    { name: "Passport/ID", category: "Documents", essential: true },
    { name: "Travel insurance", category: "Documents", essential: true },
    { name: "Flight tickets", category: "Documents", essential: true },
    { name: "Hotel confirmations", category: "Documents", essential: true },
    { name: "Credit cards", category: "Documents", essential: true },
    { name: "Cash (local currency)", category: "Documents", essential: true },
    { name: "Emergency contacts", category: "Documents", essential: true },

    // Clothing Essentials
    { name: "Underwear (7 pairs)", category: "Clothing", essential: true },
    { name: "Socks (7 pairs)", category: "Clothing", essential: true },
    { name: "Comfortable walking shoes", category: "Clothing", essential: true },
    { name: "Casual shirts/tops", category: "Clothing", essential: true },
    { name: "Pants/shorts", category: "Clothing", essential: true },
    { name: "Sleepwear", category: "Clothing", essential: true },
    { name: "Light jacket/sweater", category: "Clothing", essential: false },

    // Electronics
    { name: "Phone charger", category: "Electronics", essential: true },
    { name: "Portable power bank", category: "Electronics", essential: false },
    { name: "Camera", category: "Electronics", essential: false },
    { name: "Travel adapter", category: "Electronics", essential: true },
    { name: "Headphones", category: "Electronics", essential: false },

    // Health & Hygiene
    { name: "Toothbrush & toothpaste", category: "Health", essential: true },
    { name: "Medications", category: "Health", essential: true },
    { name: "Sunscreen", category: "Health", essential: true },
    { name: "Hand sanitizer", category: "Health", essential: true },
    { name: "Basic first aid", category: "Health", essential: false },
    { name: "Personal hygiene items", category: "Health", essential: true },

    // Travel Accessories
    { name: "Luggage locks", category: "Accessories", essential: false },
    { name: "Travel pillow", category: "Accessories", essential: false },
    { name: "Reusable water bottle", category: "Accessories", essential: false },
    { name: "Day backpack", category: "Accessories", essential: false },
    { name: "Umbrella", category: "Accessories", essential: false },
  ];

  // Add destination-specific items based on interests
  const destinationSpecific: Omit<PackingItem, 'id' | 'checked'>[] = [];
  
  itinerary.days.forEach(day => {
    [...day.morning, ...day.afternoon, ...day.evening].forEach(activity => {
      if (activity.category === 'nature' || activity.category === 'adventure') {
        if (!destinationSpecific.some(item => item.name === "Hiking boots")) {
          destinationSpecific.push({ name: "Hiking boots", category: "Clothing", essential: false });
        }
        if (!destinationSpecific.some(item => item.name === "Quick-dry clothes")) {
          destinationSpecific.push({ name: "Quick-dry clothes", category: "Clothing", essential: false });
        }
      }
      
      if (activity.category === 'beach') {
        if (!destinationSpecific.some(item => item.name === "Swimwear")) {
          destinationSpecific.push({ name: "Swimwear", category: "Clothing", essential: false });
        }
        if (!destinationSpecific.some(item => item.name === "Beach towel")) {
          destinationSpecific.push({ name: "Beach towel", category: "Accessories", essential: false });
        }
      }
      
      if (activity.category === 'culture' || activity.category === 'dining') {
        if (!destinationSpecific.some(item => item.name === "Smart casual outfit")) {
          destinationSpecific.push({ name: "Smart casual outfit", category: "Clothing", essential: false });
        }
      }
    });
  });

  return [...baseItems, ...destinationSpecific].map((item, index) => ({
    ...item,
    id: `item-${index}`,
    checked: false,
  }));
};

export default function PackingChecklist({ itinerary, isOpen, onClose }: PackingChecklistProps) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (itinerary && !initialized) {
    setPackingItems(generatePackingList(itinerary));
    setInitialized(true);
  }

  const toggleItem = (itemId: string) => {
    setPackingItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const categories = Array.from(new Set(packingItems.map(item => item.category)));
  const checkedCount = packingItems.filter(item => item.checked).length;
  const totalCount = packingItems.length;
  const progressPercentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (!itinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] neo-shadow border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Luggage className="w-5 h-5 text-primary" />
            Packing Checklist
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{checkedCount} of {totalCount} items packed</span>
            <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
              {progressPercentage}% Complete
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Trip Summary */}
            <Card className="p-4 neo-shadow border-2 bg-accent/5">
              <h3 className="font-bold text-lg">{itinerary.destination}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()} ({itinerary.days.length} days)
              </p>
            </Card>

            {/* Packing Progress */}
            {progressPercentage === 100 && (
              <Card className="p-4 border-2 bg-success/10 border-success">
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">All packed and ready to go! ✈️</span>
                </div>
              </Card>
            )}

            {/* Categories */}
            {categories.map(category => {
              const categoryItems = packingItems.filter(item => item.category === category);
              const categoryChecked = categoryItems.filter(item => item.checked).length;
              
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base">{category}</h4>
                    <Badge variant="outline">
                      {categoryChecked}/{categoryItems.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          item.checked
                            ? "bg-success/10 border-success"
                            : "border-border hover:border-accent/50"
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <span 
                          className={`flex-1 text-sm ${
                            item.checked ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.essential && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Essential
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {category !== categories[categories.length - 1] && <Separator />}
                </div>
              );
            })}

            {/* Tips */}
            <Card className="p-4 neo-shadow border-2 bg-warning/10">
              <h4 className="font-bold mb-2">💡 Packing Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pack essentials in carry-on bag</li>
                <li>• Roll clothes to save space</li>
                <li>• Check airline baggage restrictions</li>
                <li>• Leave space for souvenirs</li>
                <li>• Pack heavier items at bottom of suitcase</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setPackingItems(prev => prev.map(item => ({ ...item, checked: false })));
            }}
          >
            Reset All
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {progressPercentage === 100 && (
              <Button className="neo-shadow">
                <Check className="w-4 h-4 mr-2" />
                Ready to Travel!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}