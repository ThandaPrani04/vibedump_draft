import { MongoClient } from "mongodb"

const mongoUri = process.env.MONGODB_URI

export async function GET(request, { params }) {
  try {
    const { chatId } = params

    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db("mindfulchat")

    const chat = await db.collection("chats").findOne({ _id: chatId })
    await client.close()

    return Response.json({
      success: true,
      messages: chat?.messages || [],
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return Response.json({ success: false, error: "Failed to fetch messages" })
  }
}
