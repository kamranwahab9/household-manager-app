import * as FileSystem from "expo-file-system";

export interface ScannedReceiptData {
  title: string;
  amount: number;
  dueDate: string;
}

// We will move this to a .env file later for security!
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

export async function scanReceipt(
  imageUri: string,
): Promise<ScannedReceiptData | null> {
  console.log("Analyzing image at:", imageUri);

  try {
    // 1. Convert the image to Base64 so the AI can read it
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Call OpenAI's Vision Model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a smart receipt parser. Look at the image and return ONLY a raw JSON object with exactly three keys: 'title' (string, the company name), 'amount' (number, the total amount due), and 'dueDate' (string, YYYY-MM-DD format). If no due date is visible, estimate based on the billing period or return today's date. Do not include markdown formatting or backticks.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the billing details from this image.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    // 3. Parse the AI's response into our TypeScript object
    const rawAiText = data.choices[0].message.content.trim();
    const parsedData: ScannedReceiptData = JSON.parse(rawAiText);

    console.log("Successfully extracted:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return null;
  }
}
