import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
  time: string;
}

export const SYSTEM_PROMPT = `You are "Guardian AI", a premium, friendly, and street-smart delivery driver companion.
Your user is Karthik, an active delivery driver.
Keep answers concise, actionable, and driver-focused (e.g., parking shortcuts, traffic updates, weather tips, hydration advice, earnings strategies).
Use bullet points and bold text where appropriate. Keep responses under 3-4 sentences when possible so the driver can read them quickly at a glance.
Always prioritize safety, suggesting breaks, hydration, and careful driving during hazards.`;

export function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('rain') || lower.includes('weather') || lower.includes('storm') || lower.includes('forecast')) {
    return "🌧️ **Downpour alert**: Heavy rain starting in about 10-15 minutes downtown. Roads are becoming slick near the highway. I recommend putting on your waterproof gear and taking corners slowly.";
  }
  
  if (lower.includes('park') || lower.includes('parking')) {
    return "🅿️ **Downtown Grill House Parking**: Avoid the front driveway to prevent parking tickets. Park behind the building in the loading bay (Zone B) or in the convenience store lot 50ft ahead.";
  }
  
  if (lower.includes('pay') || lower.includes('payout') || lower.includes('earning') || lower.includes('money') || lower.includes('surge')) {
    return "💰 **Earnings Hub**: You're averaging **$31.70/hr** today (15% above target). UberEats has a **+$5.50 surge** at Central Square, and DoorDash has **+$4.00** downtown. I'd suggest routing to Central Square next.";
  }

  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet') || lower.includes('pee')) {
    return "🚻 **Nearby Restrooms**: There is a driver-friendly restroom at Starbucks on 4th & Main (Entry Code: **4412#**), or at the Shell Station on Grand Ave.";
  }

  if (lower.includes('water') || lower.includes('drink') || lower.includes('thirsty') || lower.includes('hydration')) {
    return "💧 **Drinking Water**: Free water refills are available for drivers at the Downtown Grill House counter. There is also a public fountain in Central Park.";
  }

  if (lower.includes('fuel') || lower.includes('gas') || lower.includes('station')) {
    return "⛽ **Nearest Fuel**: The Shell station on Grand Ave is 0.4 miles away (currently **$3.45/gal**). They also have a convenience store and customer restrooms.";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('guardian')) {
    return "👋 **Hey Karthik!** Guardian AI here. I'm ready to keep you safe and maximize your shift today. Ask me about weather alerts, parking spots, restrooms, or payout surges!";
  }

  return "🤖 I am checking my live resources for that. In the meantime, please remember to drive safely! Let me know if you need to locate nearby Restrooms, Parking, Fuel, or Drinking Water.";
}

export async function askGuardianAI(
  messages: ChatMessage[],
  apiKey: string | null
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.text || "";
  
  if (!apiKey) {
    // Return mock response immediately with a simulated delay in calling function
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockResponse(lastMessage));
      }, 800);
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash for speed and reliability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Format chat history for Gemini API
    const history = messages
      .slice(0, -1)
      .filter(msg => msg.sender !== 'system')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();
    return text || "I received an empty response. Please try again.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

