import { MongoClient, ObjectId } from "mongodb"

const mongoUri = process.env.MONGODB_URI

export async function GET() {
  try {
    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db("mindfulchat")

    const chats = await db.collection("chats").find({}).sort({ updatedAt: -1 }).toArray()

    await client.close()

    return Response.json({ success: true, chats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return Response.json({ success: false, error: "Failed to fetch chats" })
  }
}

export async function POST(request) {
  try {
    const { title } = await request.json()

    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db("mindfulchat")

    const newChat = {
      _id: new ObjectId().toString(),
      title: title || "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: "",
    }

    await db.collection("chats").insertOne(newChat)
    await client.close()

    return Response.json({ success: true, chatId: newChat._id })
  } catch (error) {
    console.error("Error creating chat:", error)
    return Response.json({ success: false, error: "Failed to create chat" })
  }
}
