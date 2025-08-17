import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, Check } from "lucide-react";
import { TravelItinerary } from "@/services/aiTravelService";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportDialogProps {
  itinerary: TravelItinerary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDialog({ itinerary, isOpen, onClose }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!itinerary) return;
    
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      // Simulate progress updates
      const updateProgress = (progress: number) => {
        setExportProgress(progress);
      };

      updateProgress(10);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      updateProgress(25);

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.35) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.35 + 5;
        return yPosition;
      };

      // Title
      addText(`${itinerary.destination} Travel Itinerary`, 20, true);
      addText(`${new Date(itinerary.startDate).toLocaleDateString()} - ${new Date(itinerary.endDate).toLocaleDateString()}`, 12);
      yPosition += 10;

      updateProgress(40);

      // Overview
      addText('Overview', 14, true);
      addText(itinerary.overview, 10);
      yPosition += 5;

      // Budget
      addText('Budget Estimate', 14, true);
      addText(itinerary.totalBudget, 10);
      yPosition += 10;

      updateProgress(60);

      // Essential Tips
      if (itinerary.tips.length > 0) {
        addText('Essential Tips', 14, true);
        itinerary.tips.forEach((tip, index) => {
          addText(`${index + 1}. ${tip}`, 10);
        });
        yPosition += 10;
      }

      updateProgress(75);

      // Daily Itinerary
      itinerary.days.forEach((day, dayIndex) => {
        // Check if we need a new page for the day
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        addText(`Day ${day.day}: ${day.title}`, 16, true);
        addText(new Date(day.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }), 10);
        
        if (day.notes) {
          addText(`Note: ${day.notes}`, 10);
        }
        yPosition += 5;

        // Morning
        if (day.morning.length > 0) {
          addText('🌅 Morning', 12, true);
          day.morning.forEach(activity => {
            addText(`• ${activity.name} (${activity.duration}, ${activity.cost})`, 10);
            addText(`  ${activity.description}`, 9);
            addText(`  📍 ${activity.location}`, 9);
            if (activity.tips) {
              addText(`  💡 ${activity.tips}`, 9);
            }
            yPosition += 3;
          });
        }

        // Afternoon
        if (day.afternoon.length > 0) {
          addText('☀️ Afternoon', 12, true);
          day.afternoon.forEach(activity => {
            addText(`• ${activity.name} (${activity.duration}, ${activity.cost})`, 10);
            addText(`  ${activity.description}`, 9);
            addText(`  📍 ${activity.location}`, 9);
            if (activity.tips) {
              addText(`  💡 ${activity.tips}`, 9);
            }
            yPosition += 3;
          });
        }

        // Evening
        if (day.evening.length > 0) {
          addText('🌆 Evening', 12, true);
          day.evening.forEach(activity => {
            addText(`• ${activity.name} (${activity.duration}, ${activity.cost})`, 10);
            addText(`  ${activity.description}`, 9);
            addText(`  📍 ${activity.location}`, 9);
            if (activity.tips) {
              addText(`  💡 ${activity.tips}`, 9);
            }
            yPosition += 3;
          });
        }

        yPosition += 10;
        updateProgress(75 + (dayIndex + 1) / itinerary.days.length * 20);
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by AI Travel Planner', margin, pageHeight - 10);

      updateProgress(95);

      // Save the PDF
      const fileName = `${itinerary.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);

      updateProgress(100);
      setExportComplete(true);

      toast({
        title: "PDF Generated! 📄",
        description: "Your itinerary has been downloaded successfully.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Sorry, we couldn't generate your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportComplete(false);
      }, 2000);
    }
  };

  if (!itinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md neo-shadow border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Itinerary
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

          {/* Export Options */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Export Format</h4>
              
              {/* PDF Export */}
              <Card className="p-4 border-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-destructive" />
                    <div>
                      <h5 className="font-medium">PDF Document</h5>
                      <p className="text-sm text-muted-foreground">
                        Complete itinerary with all details
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={generatePDF}
                    disabled={isExporting}
                    className="neo-shadow"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : exportComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating PDF...</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} className="h-2" />
                  </div>
                )}
                
                {exportComplete && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Check className="w-4 h-4" />
                    PDF downloaded successfully!
                  </div>
                )}
              </Card>

              {/* Future formats */}
              <Card className="p-4 border-2 border-dashed opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs">📱</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Mobile Calendar</h5>
                      <p className="text-sm text-muted-foreground">
                        Export to phone calendar
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </Card>
            </div>
          </div>

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