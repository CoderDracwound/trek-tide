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
  private apiKey: string | null = null;
  private rateLimitCount = 0;
  private rateLimitWindow = Date.now();
  private readonly RATE_LIMIT = 10; // 10 requests per minute
  private readonly RATE_WINDOW = 60 * 1000; // 1 minute

  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem('puter_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('puter_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
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
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your Puter AI API key.');
    }

    this.checkRateLimit();

    // Check cache first
    const cacheKey = JSON.stringify(preferences);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      console.log('Using cached result');
      // Simulate streaming for cached results
      setTimeout(() => onUpdate(JSON.stringify(cachedResult)), 100);
      return JSON.stringify(cachedResult);
    }

    const prompt = this.buildItineraryPrompt(preferences);
    
    try {
      // Use Puter AI with dynamic import to avoid build issues
      const puter = await import('puter');
      
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
      
      // Cache the result
      try {
        const parsedResponse = JSON.parse(fullResponse);
        this.cache.set(cacheKey, parsedResponse);
      } catch (e) {
        // Don't cache if parsing fails
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error with Puter AI:', error);
      
      // Fallback to mock response for development
      console.log('Falling back to mock response...');
      return this.getMockItinerary(preferences, onUpdate);
    }
  }

  private async getMockItinerary(preferences: TravelPreferences, onUpdate: (chunk: string) => void): Promise<string> {
    const mockResponse = `{
      "destination": "${preferences.destination}",
      "startDate": "${preferences.startDate}",
      "endDate": "${preferences.endDate}",
      "overview": "A wonderful journey through ${preferences.destination} with carefully curated experiences tailored to your interests.",
      "totalBudget": "₹15,000-25,000 total",
      "tips": [
        "Book accommodations in advance for better rates",
        "Try local street food for authentic experiences",
        "Carry a portable charger and power bank",
        "Download offline maps before traveling",
        "Keep emergency contacts handy"
      ],
      "days": [
        {
          "day": 1,
          "date": "${preferences.startDate}",
          "title": "Arrival & City Exploration",
          "morning": [
            {
              "id": "morning-1-1",
              "name": "Airport Transfer",
              "description": "Take airport express metro or pre-paid taxi to city center",
              "location": "Airport to City Center",
              "duration": "45-60 minutes",
              "cost": "₹250-500",
              "category": "transportation",
              "openingHours": "24/7",
              "tips": "Metro is cheaper and faster during peak hours. Book airport pickup in advance for convenience."
            }
          ],
          "afternoon": [
            {
              "id": "afternoon-1-1",
              "name": "Historic City Center Walk",
              "description": "Explore the main landmarks and get oriented with the city layout",
              "location": "Central Business District",
              "duration": "2-3 hours",
              "cost": "Free",
              "category": "sightseeing",
              "openingHours": "All day",
              "tips": "Best lighting for photos during golden hour. Wear comfortable walking shoes."
            },
            {
              "id": "afternoon-1-2",
              "name": "Local Market Visit",
              "description": "Experience local culture and shop for souvenirs",
              "location": "Main Market Area",
              "duration": "1-2 hours",
              "cost": "₹500-1,000",
              "category": "shopping",
              "openingHours": "10:00 AM - 8:00 PM",
              "tips": "Bargaining is expected. Keep small denominations handy."
            }
          ],
          "evening": [
            {
              "id": "evening-1-1",
              "name": "Welcome Dinner",
              "description": "Try authentic local cuisine at a highly-rated restaurant",
              "location": "Traditional Restaurant District",
              "duration": "2 hours",
              "cost": "₹800-1,500",
              "category": "dining",
              "openingHours": "6:00 PM - 11:00 PM",
              "tips": "Make reservations for popular restaurants. Ask for recommendations from locals."
            }
          ],
          "notes": "Take it easy on the first day to adjust to the new environment and recover from travel fatigue."
        }
      ]
    }`;
    
    // Simulate streaming by yielding chunks
    const chunks = mockResponse.split(' ');
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      onUpdate(chunks[i] + ' ');
    }
    
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
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your Puter AI API key.');
    }

    this.checkRateLimit();

    const prompt = `Modify this travel itinerary based on the user's request. Use Indian Rupees (₹) for all pricing.

CURRENT ITINERARY:
${JSON.stringify(itinerary, null, 2)}

USER REQUEST:
${refinementRequest}

Return the modified itinerary in the exact same JSON format. Only change what the user requested, keep everything else the same. Ensure all costs are in Indian Rupees (₹).`;

    const streamUpdate = onUpdate || (() => {});
    
    try {
      const puter = await import('puter');
      
      const response = await puter.ai.chat(
        prompt,
        { model: "gpt-4o" },
        { stream: true }
      );
      
      let fullResponse = '';
      
      for await (const part of response) {
        if (part?.text) {
          fullResponse += part.text;
          streamUpdate(part.text);
        }
      }
      
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : fullResponse;
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