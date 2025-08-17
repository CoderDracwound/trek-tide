import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "@/services/aiTravelService";

interface ActivityEditDialogProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "culture", label: "Culture & Museums" },
  { value: "nature", label: "Nature & Outdoors" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "transportation", label: "Transportation" },
  { value: "accommodation", label: "Accommodation" },
  { value: "adventure", label: "Adventure" },
  { value: "architecture", label: "Architecture" }
];

export default function ActivityEditDialog({ 
  activity, 
  isOpen, 
  onClose, 
  onSave 
}: ActivityEditDialogProps) {
  const [editedActivity, setEditedActivity] = useState<Activity | null>(null);

  // Update local state when activity prop changes
  React.useEffect(() => {
    if (activity) {
      setEditedActivity({ ...activity });
    }
  }, [activity]);

  const handleSave = () => {
    if (editedActivity) {
      onSave(editedActivity);
      onClose();
    }
  };

  const updateField = (field: keyof Activity, value: string) => {
    if (editedActivity) {
      setEditedActivity(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  if (!editedActivity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl neo-shadow border-2">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Activity Name</Label>
              <Input
                id="name"
                value={editedActivity.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="neo-shadow border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editedActivity.category} 
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger className="neo-shadow border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedActivity.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="neo-shadow border-2"
              rows={3}
            />
          </div>

          {/* Location and Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedActivity.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="neo-shadow border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={editedActivity.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g., 2 hours"
                className="neo-shadow border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={editedActivity.cost}
                onChange={(e) => updateField('cost', e.target.value)}
                placeholder="e.g., $15-25"
                className="neo-shadow border-2"
              />
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-2">
            <Label htmlFor="openingHours">Opening Hours</Label>
            <Input
              id="openingHours"
              value={editedActivity.openingHours || ''}
              onChange={(e) => updateField('openingHours', e.target.value)}
              placeholder="e.g., 9:00 AM - 6:00 PM"
              className="neo-shadow border-2"
            />
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <Label htmlFor="tips">Tips & Notes</Label>
            <Textarea
              id="tips"
              value={editedActivity.tips || ''}
              onChange={(e) => updateField('tips', e.target.value)}
              placeholder="Any useful tips or notes..."
              className="neo-shadow border-2"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="neo-shadow">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}