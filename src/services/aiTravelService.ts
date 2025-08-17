// @ts-ignore
import * as puter from 'puter';

export interface TravelDay {
  day: number;
  date: string;
  title: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  cost: string;
  category: string;
  coordinates?: [number, number];
  openingHours?: string;
  tips?: string;
}

export interface TravelItinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: TravelDay[];
  overview: string;
  totalBudget: string;
  tips: string[];
  createdAt: string;
}

export interface TravelPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  pace: string;
  interests: string[];
  groupSize: string;
  notes: string;
}

class AITravelService {
  private async streamItineraryGeneration(
    preferences: TravelPreferences,
    onUpdate: (chunk: string) => void
  ): Promise<string> {
    const prompt = this.buildItineraryPrompt(preferences);
    
    try {
      const response = await puter.ai.chat(
        prompt,
        { model: "gpt-4o" },
        { stream: true }
      );
      
      let fullResponse = '';
      
      for await (const part of response) {
        if (part?.text) {
          fullResponse += part.text;
          onUpdate(part.text);
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw new Error('Failed to generate itinerary. Please try again.');
    }
  }

  private buildItineraryPrompt(preferences: TravelPreferences): string {
    const startDate = new Date(preferences.startDate);
    const endDate = new Date(preferences.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return `Create a detailed ${days}-day travel itinerary for ${preferences.destination}.

TRAVEL DETAILS:
- Destination: ${preferences.destination}
- Dates: ${preferences.startDate} to ${preferences.endDate} (${days} days)
- Budget: ${preferences.budget}
- Pace: ${preferences.pace}
- Group: ${preferences.groupSize || 'Solo traveler'}
- Interests: ${preferences.interests.join(', ')}
- Special notes: ${preferences.notes || 'None'}

RESPONSE FORMAT (JSON only, no markdown):
{
  "destination": "${preferences.destination}",
  "startDate": "${preferences.startDate}",
  "endDate": "${preferences.endDate}",
  "overview": "Brief overview of the trip highlights",
  "totalBudget": "Estimated total cost range",
  "tips": ["Essential tip 1", "Essential tip 2", "Essential tip 3"],
  "days": [
    {
      "day": 1,
      "date": "${preferences.startDate}",
      "title": "Arrival & First Impressions",
      "morning": [
        {
          "id": "morning-1-1",
          "name": "Activity name",
          "description": "Detailed description",
          "location": "Specific address or area",
          "duration": "2 hours",
          "cost": "$15-25",
          "category": "transportation",
          "openingHours": "9:00 AM - 6:00 PM",
          "tips": "Useful tip"
        }
      ],
      "afternoon": [
        {
          "id": "afternoon-1-1",
          "name": "Activity name",
          "description": "Detailed description",
          "location": "Specific address or area",
          "duration": "3 hours",
          "cost": "$30-50",
          "category": "sightseeing",
          "openingHours": "10:00 AM - 8:00 PM",
          "tips": "Useful tip"
        }
      ],
      "evening": [
        {
          "id": "evening-1-1",
          "name": "Activity name",
          "description": "Detailed description",
          "location": "Specific address or area",
          "duration": "2-3 hours",
          "cost": "$25-40",
          "category": "dining",
          "openingHours": "6:00 PM - 11:00 PM",
          "tips": "Useful tip"
        }
      ],
      "notes": "Day-specific travel notes or weather considerations"
    }
  ]
}

REQUIREMENTS:
- Include 2-4 activities per time period based on pace preference
- Match activities to specified interests
- Include realistic costs within budget range
- Provide specific locations and practical details
- Include opening hours and useful tips
- Consider travel time between activities
- Return ONLY valid JSON, no additional text or formatting`;
  }

  async generateItinerary(
    preferences: TravelPreferences,
    onUpdate?: (chunk: string) => void
  ): Promise<TravelItinerary> {
    const streamUpdate = onUpdate || (() => {});
    
    const response = await this.streamItineraryGeneration(preferences, streamUpdate);
    
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      const parsedItinerary = JSON.parse(jsonString);
      
      return {
        id: Date.now().toString(),
        ...parsedItinerary,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse itinerary. Please try again.');
    }
  }

  async refineItinerary(
    itinerary: TravelItinerary,
    refinementRequest: string,
    onUpdate?: (chunk: string) => void
  ): Promise<TravelItinerary> {
    const prompt = `Modify this travel itinerary based on the user's request.

CURRENT ITINERARY:
${JSON.stringify(itinerary, null, 2)}

USER REQUEST:
${refinementRequest}

Return the modified itinerary in the exact same JSON format. Only change what the user requested, keep everything else the same.`;

    const streamUpdate = onUpdate || (() => {});
    const response = await this.streamItineraryGeneration(
      { 
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        budget: '',
        pace: '',
        interests: [],
        groupSize: '',
        notes: refinementRequest
      },
      streamUpdate
    );
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      const refinedItinerary = JSON.parse(jsonString);
      
      return {
        ...refinedItinerary,
        id: itinerary.id,
        createdAt: itinerary.createdAt,
      };
    } catch (error) {
      console.error('Error parsing refinement response:', error);
      throw new Error('Failed to refine itinerary. Please try again.');
    }
  }
}

export const aiTravelService = new AITravelService();