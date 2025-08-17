// Interface definitions
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

// Declare global puter object
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>;
      };
    };
  }
}

// Cache for storing generated itineraries and common destinations
class ItineraryCache {
  private cache = new Map<string, any>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  set(key: string, value: any) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

// Popular destinations for caching and quick suggestions
const POPULAR_DESTINATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand', 'Kashmir',
  'Agra', 'Varanasi', 'Rishikesh', 'Manali', 'Shimla', 'Darjeeling', 'Ooty', 'Kodaikanal',
  'Paris', 'London', 'Tokyo', 'New York', 'Dubai', 'Singapore', 'Bangkok', 'Bali',
  'Istanbul', 'Rome', 'Barcelona', 'Amsterdam', 'Prague', 'Vienna', 'Budapest'
];

class AITravelService {
  private cache = new ItineraryCache();
  private rateLimitCount = 0;
  private rateLimitWindow = Date.now();
  private readonly RATE_LIMIT = 10; // 10 requests per minute
  private readonly RATE_WINDOW = 60 * 1000; // 1 minute

  constructor() {
    // Wait for puter to be available
    if (typeof window !== 'undefined') {
      // Check if puter is already available
      if (window.puter) {
        console.log('Puter.js already loaded');
      } else {
        // Wait for the script to load
        let attempts = 0;
        const checkPuter = () => {
          attempts++;
          if (window.puter) {
            console.log('Puter.js loaded successfully');
          } else if (attempts < 50) { // Wait up to 5 seconds
            setTimeout(checkPuter, 100);
          } else {
            console.warn('Puter.js failed to load after 5 seconds');
          }
        };
        checkPuter();
      }
    }
  }

  hasApiKey(): boolean {
    // Always return true since Puter doesn't require API keys
    return true;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.rateLimitWindow > this.RATE_WINDOW) {
      this.rateLimitCount = 0;
      this.rateLimitWindow = now;
    }
    
    if (this.rateLimitCount >= this.RATE_LIMIT) {
      throw new Error('Rate limit exceeded. Please wait a moment before making another request.');
    }
    
    this.rateLimitCount++;
    return true;
  }

  private async streamItineraryGeneration(
    preferences: TravelPreferences,
    onUpdate: (chunk: string) => void
  ): Promise<string> {
    this.checkRateLimit();

    // Check cache first
    const cacheKey = JSON.stringify(preferences);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      console.log('Using cached result');
      // Return parsed JSON directly for cached results
      const response = JSON.stringify(cachedResult);
      onUpdate('Generation complete!');
      return response;
    }

    const prompt = this.buildItineraryPrompt(preferences);
    
    try {
      // Check if puter is available with retries
      if (!window.puter) {
        // Wait a bit for puter to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!window.puter) {
          throw new Error('Puter.js not available. Please refresh the page.');
        }
      }

      console.log('Calling Puter AI...');
      onUpdate('Connecting to AI...');
      
      // Use Puter AI chat function with error handling
      const response = await window.puter.ai.chat(prompt, { model: "gpt-4.1" });
      
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI service');
      }
      
      console.log('Puter AI response received:', response.length, 'characters');
      onUpdate('Processing response...');
      
      // Cache the result
      try {
        const parsedResponse = JSON.parse(response);
        this.cache.set(cacheKey, parsedResponse);
        onUpdate('Generation complete!');
      } catch (e) {
        console.warn('Could not parse AI response for caching');
        onUpdate('Finalizing itinerary...');
      }
      
      return response;
    } catch (error) {
      console.error('Error with Puter AI:', error);
      
      // Fallback to mock response for development
      console.log('Falling back to mock response...');
      onUpdate('Using fallback data...');
      return this.getMockItinerary(preferences, onUpdate);
    }
  }

  private async getMockItinerary(preferences: TravelPreferences, onUpdate: (chunk: string) => void): Promise<string> {
    // Calculate number of days for the trip
    const startDate = new Date(preferences.startDate);
    const endDate = new Date(preferences.endDate);
    const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Generate days array
    const days = [];
    for (let i = 0; i < tripDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      days.push({
        "day": i + 1,
        "date": currentDate.toISOString().split('T')[0],
        "title": i === 0 ? "Arrival & City Exploration" : 
                i === tripDays - 1 ? "Final Exploration & Departure" : 
                `${preferences.destination} Adventure Day ${i + 1}`,
        "morning": [
          {
            "id": `morning-${i + 1}-1`,
            "name": i === 0 ? "Airport Transfer" : "Morning Activity",
            "description": i === 0 ? "Take airport express metro or pre-paid taxi to city center" : `Explore ${preferences.destination} in the morning`,
            "location": i === 0 ? "Airport to City Center" : `${preferences.destination} Morning Location`,
            "duration": "2-3 hours",
            "cost": "₹250-800",
            "category": i === 0 ? "transportation" : "sightseeing",
            "openingHours": "9:00 AM - 12:00 PM",
            "tips": "Start early to avoid crowds and heat."
          }
        ],
        "afternoon": [
          {
            "id": `afternoon-${i + 1}-1`,
            "name": "Afternoon Exploration",
            "description": `Discover ${preferences.destination} attractions and local culture`,
            "location": `${preferences.destination} Central Area`,
            "duration": "3-4 hours",
            "cost": "₹500-1,500",
            "category": "sightseeing",
            "openingHours": "12:00 PM - 6:00 PM",
            "tips": "Take breaks and stay hydrated."
          }
        ],
        "evening": [
          {
            "id": `evening-${i + 1}-1`,
            "name": i === tripDays - 1 ? "Farewell Dinner" : "Evening Experience",
            "description": i === tripDays - 1 ? "Final authentic meal and reflection on the journey" : "Experience local nightlife and cuisine",
            "location": `${preferences.destination} Restaurant District`,
            "duration": "2-3 hours",
            "cost": "₹800-2,000",
            "category": "dining",
            "openingHours": "6:00 PM - 11:00 PM",
            "tips": "Make reservations for popular restaurants."
          }
        ],
        "notes": i === 0 ? "Take it easy on the first day to adjust to the new environment." : 
                i === tripDays - 1 ? "Pack early and confirm departure arrangements." : 
                "Enjoy the local experiences and stay flexible with timing."
      });
    }

    const mockResponse = JSON.stringify({
      "destination": preferences.destination,
      "startDate": preferences.startDate,
      "endDate": preferences.endDate,
      "overview": `A wonderful ${tripDays}-day journey through ${preferences.destination} with carefully curated experiences tailored to your ${preferences.interests.join(', ')} interests.`,
      "totalBudget": `₹${(tripDays * 2000)}-${(tripDays * 4000)} total`,
      "tips": [
        "Book accommodations in advance for better rates",
        "Try local street food for authentic experiences",
        "Carry a portable charger and power bank",
        "Download offline maps before traveling",
        "Keep emergency contacts handy"
      ],
      "days": days
    });
    
    onUpdate('Generating itinerary...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdate('Almost done...');
    
    return mockResponse;
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

IMPORTANT: Use Indian Rupees (₹) for all pricing. Convert international destinations to INR equivalents.

RESPONSE FORMAT (JSON only, no markdown):
{
  "destination": "${preferences.destination}",
  "startDate": "${preferences.startDate}",
  "endDate": "${preferences.endDate}",
  "overview": "Brief overview of the trip highlights",
  "totalBudget": "Estimated total cost range in INR",
  "tips": ["Essential tip 1", "Essential tip 2", "Essential tip 3", "Local etiquette tip", "Money saving tip"],
  "days": [
    {
      "day": 1,
      "date": "${preferences.startDate}",
      "title": "Arrival & First Impressions",
      "morning": [
        {
          "id": "morning-1-1",
          "name": "Activity name",
          "description": "Detailed description with local insights",
          "location": "Specific address or area",
          "duration": "X hours",
          "cost": "₹X-Y",
          "category": "transportation",
          "openingHours": "X:00 AM - Y:00 PM",
          "tips": "Practical local tip"
        }
      ],
      "afternoon": [...],
      "evening": [...],
      "notes": "Day-specific travel notes or weather considerations"
    }
  ]
}

REQUIREMENTS:
- Include 2-4 activities per time period based on pace preference
- Match activities to specified interests
- Use Indian Rupees (₹) for all costs
- Include realistic costs within budget range
- Provide specific locations and practical details
- Include opening hours and useful tips
- Consider travel time between activities
- Add local cultural insights and etiquette tips
- Return ONLY valid JSON, no additional text or formatting`;
  }

  async generateItinerary(
    preferences: TravelPreferences,
    onUpdate?: (chunk: string) => void
  ): Promise<TravelItinerary> {
    const streamUpdate = onUpdate || (() => {});
    
    try {
      const response = await this.streamItineraryGeneration(preferences, streamUpdate);
      
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
    this.checkRateLimit();

    const prompt = `Modify this travel itinerary based on the user's request. Use Indian Rupees (₹) for all pricing.

CURRENT ITINERARY:
${JSON.stringify(itinerary, null, 2)}

USER REQUEST:
${refinementRequest}

Return ONLY valid JSON in the exact same format. Only change what the user requested, keep everything else the same. Ensure all costs are in Indian Rupees (₹).`;

    const streamUpdate = onUpdate || (() => {});
    
    try {
      if (!window.puter) {
        // Wait a bit for puter to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!window.puter) {
          throw new Error('Puter.js not available. Please refresh the page.');
        }
      }

      streamUpdate('Processing your request...');
      const response = await window.puter.ai.chat(prompt, { model: "gpt-4.1" });
      streamUpdate('Updating itinerary...');
      
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

  // Phase 3: Enhanced methods
  getPopularDestinations(): string[] {
    return POPULAR_DESTINATIONS;
  }

  clearCache() {
    this.cache.clear();
  }

  async getDestinationSuggestions(query: string): Promise<string[]> {
    const filtered = POPULAR_DESTINATIONS.filter(dest => 
      dest.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.slice(0, 5);
  }
}

export const aiTravelService = new AITravelService();