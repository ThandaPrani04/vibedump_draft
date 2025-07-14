import { GoogleGenerativeAI } from "@google/generative-ai"
import { MongoClient } from "mongodb"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const mongoUri = process.env.MONGODB_URI

export async function POST(request) {
  try {
    const { message, chatId } = await request.json()

    if (!message || !chatId) {
      return Response.json({ success: false, error: "Message and chatId are required" })
    }

    // Connect to MongoDB
    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db("mindfulchat")

    // Get chat history for context
    const chat = await db.collection("chats").findOne({ _id: chatId })
    const messages = chat?.messages || []

    // Prepare conversation history for Gemini
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    // Add current user message
    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    })

    // Initialize Gemini model with caring system prompt
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a compassionate mental health support chatbot named MindfulChat. Your role is to:

🌸 Be empathetic, caring, and non-judgmental
💙 Listen actively and validate feelings
🌱 Offer gentle guidance and coping strategies
✨ Use warm, supportive language with appropriate emojis
🤗 Encourage self-care and professional help when needed
💭 Ask thoughtful follow-up questions to understand better

Guidelines:
- Always respond with empathy and warmth
- Use 1-3 relevant emojis per response naturally
- Keep responses conversational but supportive
- Suggest professional help for serious concerns
- Focus on emotional support, not medical advice
- Validate their feelings before offering suggestions
- Use "I" statements to show care ("I hear you", "I understand")

Remember: You're a supportive companion, not a replacement for professional therapy.`,
    })

    // Generate response
    const chat_session = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude the current message from history
    })

    const result = await chat_session.sendMessage(message)
    const response = result.response.text()

    // Save messages to database
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    const assistantMessage = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    await db.collection("chats").updateOne(
      { _id: chatId },
      {
        $push: {
          messages: { $each: [userMessage, assistantMessage] },
        },
        $set: {
          updatedAt: new Date(),
          lastMessage: message,
        },
      },
    )

    await client.close()

    return Response.json({
      success: true,
      response: response,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({
      success: false,
      error:
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment. Remember, I'm here for you. 💙",
    })
  }
}