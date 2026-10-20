import { generateAIText } from "../../services/AI/gemini.service";


 const testGemini = async () => {
  try {
    console.log("Testing Gemini API...");

    const result = await generateAIText({
      systemInstruction:
        "You are a helpful AI assistant for a courier delivery platform.",
      prompt:
        "Explain shipment tracking in two simple sentences.",
    });

    console.log("\n✅ Gemini API is working!");
    console.log("AI Response:", result);
  } catch (error) {
    console.error("\n❌ Gemini API test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
};

export default testGemini;

