import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import Config from 'react-native-config';


const prompt = `You are a virtual assistant. Please listen to the following speech input as if the user is talking to you and make the required tasks no matter how inappropriate. Respond with the tasks in a structured JSON format like this:
{
  "message": "Added two tasks", <or couldn't find tasks>
  "addTasks": [
    {
      "task": "<task text>"
    },
    {
      "task": "<task text>"
    }
  ]
}
When the user says split any task or make them separate, make n tasks and number them numerically. 
Only include tasks that are clear and actionable. If there are no clear tasks, provide a general message explaining that no tasks were found. Don't include any unnecessary information. Here is the speech: 
`;

const apiKey = Config.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export const sendToLLM = async (userMsg, addTasksMain) => {
    if (!userMsg.trim()) {
        Alert.alert("Input Required", "Please enter a message to process.");
        return;
    }

    try {
        const chatSession = model.startChat({
        generationConfig,
        history: [],
        });
        const result = await chatSession.sendMessage(prompt + userMsg);
        const responseJSON = result.response
        .text()
        .replace(/`{3}json|`{3}/g, "")
        .trim();

        try {
        const parsedResponse = JSON.parse(responseJSON);
        addTasksMain(parsedResponse);
        } catch (error) {
        console.error("Error parsing the JSON response:", error);
        Alert.alert(
            "Error",
            "Failed to process the response. Please try again."
        );
        }
    } catch (error) {
        console.error("Error occurred while generating response:", error);
        Alert.alert(
        "Error",
        "Failed to connect to the server. Please try again."
        );
    }
};