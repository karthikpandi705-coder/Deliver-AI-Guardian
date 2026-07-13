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
    return "🌧️ **Guardian Weather Alert**:\nHeavy rain is projected to start in about **10-15 minutes** in the Downtown core. Road surfaces are becoming slick near the Main Highway exit. \n\n*Action plan*: I recommend equipping your waterproof jacket now. Consider sticking to secondary avenues (like 4th Ave) to avoid highway gridlock and hydroplaning hazards.";
  }
  
  if (lower.includes('park') || lower.includes('parking')) {
    return "🅿️ **Downtown Grill House Pick-Up Tip**:\nAvoid parking in the front driveway—parking enforcement is active there. \n\n*Recommendation*: Pull into the rear loading zone (**Zone B**) behind the restaurant, or use the convenience store lot just 50 feet past the restaurant. Both locations allow quick 10-minute loading for delivery partners.";
  }
  
  if (lower.includes('pay') || lower.includes('payout') || lower.includes('earning') || lower.includes('money') || lower.includes('surge') || lower.includes('platform')) {
    return "💰 **Earnings Hub Analysis**:\nYour current shift average is **$31.70/hr** (15% above your target of $27.00/hr). \n\n*Surge Hotspots Detected*:\n- **UberEats**: +$5.50 surge active near Central Square.\n- **DoorDash**: +$4.00 surge active downtown.\n\n*Strategic Tip*: Route toward Central Square after your current drop-off to capture the higher UberEats multiplier.";
  }

  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet') || lower.includes('pee')) {
    return "🚻 **Driver-Friendly Restrooms**:\nI have two clean, driver-accessible options nearby:\n1. **Starbucks** (4th & Main) — Door Entry Code is **4412#** (no purchase required for registered partners).\n2. **Shell Gas Station** (Grand Ave) — Request the key at the front counter; driver ID is accepted.";
  }

  if (lower.includes('water') || lower.includes('drink') || lower.includes('thirsty') || lower.includes('hydration')) {
    return "💧 **Hydration Stations**:\nYour health is my priority! Free water refills are available for delivery partners at the **Downtown Grill House** pickup counter (just ask for the partner hydration jug). Alternatively, there is a public purified water fountain in **Central Plaza** near the benches.";
  }

  if (lower.includes('fuel') || lower.includes('gas') || lower.includes('station')) {
    return "⛽ **Nearest Fuel & Charging**:\n- **Shell Station** (Grand Ave) — 0.4 miles away. Regular fuel is currently priced at **$3.45/gal**. They feature customer restrooms and hot food.\n- **Chevron** (Broadway) — 0.6 miles away. regular fuel is **$3.51/gal**, but they offer a free digital tire inflation pump.";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('guardian') || lower.includes('start')) {
    return "👋 **Welcome back, Karthik!**\nGuardian AI is active and synced with your current shift. I am monitoring live weather reports, traffic conditions, and platform surges in your immediate vicinity. \n\n*Ask me anything*:\n- *'Is it going to rain?'*\n- *'Where is the best place to park at Grill House?'*\n- *'Show me surge payouts'*\n- *'Locate nearby restrooms or water'*\n\nLet's make this a safe and highly profitable shift!";
  }

  return "🤖 **Guardian AI Guide**:\nI am tracking that query in your active delivery sector. To assist you quickly, please let me know if you need info on:\n- 🚻 **Restrooms** & 💧 **Drinking Water**\n- 🅿️ **Parking Spots** & ⛽ **Fuel Stations**\n- 💰 **Active Surge Rates** & 🌧️ **Weather Threat Forecasts**\n\n*Safety reminder*: Please keep your eyes on the road and only check this screen when your vehicle is fully stopped.";
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

