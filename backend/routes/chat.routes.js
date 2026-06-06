import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.use(protect);

// ======================================
// START CHAT
// ======================================
chatRouter.post("/start", async (req, res) => {
  try {
    const {
      propertyId,
      sellerId,
      buyerId: providedBuyerId,
    } = req.body;

    let buyerId;
    let finalSellerId;

    if (req.user.role === "seller") {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!buyerId || !finalSellerId) {
      return res.status(400).json({
        success: false,
        message: "Missing buyer or seller ID",
      });
    }

    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: finalSellerId,
    });

    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        buyer: buyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images");

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating chat",
      error: err.message,
    });
  }
});

// ======================================
// SEND MESSAGE
// ======================================
chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, text, image } = req.body;

    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this chat",
      });
    }

    const newMessage = {
      sender: userId,
      text,
      image,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);

    await chat.save();

    const savedMessage =
      chat.messages[chat.messages.length - 1];

    res.status(200).json({
      success: true,
      newMessage: savedMessage,
      chat,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: err.message,
    });
  }
});

// ======================================
// GET ALL CHATS FOR USER
// ======================================
chatRouter.get("/user", async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [
        { buyer: userId },
        { seller: userId },
      ],
    })
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching chats",
      error: err.message,
    });
  }
});

// ======================================
// GET SINGLE CHAT
// ======================================
chatRouter.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .populate("messages.sender", "name profilePic");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const userId = req.user._id.toString();

    if (
      chat.buyer._id.toString() !== userId &&
      chat.seller._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this chat",
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching chat",
      error: err.message,
    });
  }
});

// ======================================
// DELETE ENTIRE CHAT
// ======================================
chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const userId = req.user._id.toString();

    if (
      chat.buyer.toString() !== userId &&
      chat.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this chat",
      });
    }

    await Chat.findByIdAndDelete(req.params.chatId);

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting chat",
      error: err.message,
    });
  }
});

export default chatRouter;