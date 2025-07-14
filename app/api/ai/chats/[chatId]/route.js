import { MongoClient } from "mongodb"

const mongoUri = process.env.MONGODB_URI

export async function DELETE(request, { params }) {
  try {
    const { chatId } = params

    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db("mindfulchat")

    await db.collection("chats").deleteOne({ _id: chatId })
    await client.close()

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return Response.json({ success: false, error: "Failed to delete chat" })
  }
}
