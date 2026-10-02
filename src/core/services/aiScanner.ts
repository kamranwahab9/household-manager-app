// We will integrate the actual Vision API (like OpenAI or Google Cloud Vision) here tomorrow.

export interface ScannedReceiptData {
  title: string;
  amount: number;
  dueDate: string;
}

export async function scanReceipt(imageUri: string): Promise<ScannedReceiptData | null> {
  console.log("Analyzing image at:", imageUri);
  
  // TODO: Add AI Vision logic here tomorrow to extract data from the image
  
  return null;
}