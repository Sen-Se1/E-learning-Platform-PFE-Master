const express = require("express");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

const router = express.Router();

function emitNotification(notification) {
  const io = getIO();

  if (notification.recipientType === "ADMIN") {
    io.to("role:ADMIN").emit("notification:new", notification);
  }

  if (notification.recipientType === "TEACHER") {
    io.to(`user:${notification.recipientId}`).emit("notification:new", notification);
    // io.to("role:TEACHER").emit("notification:new", notification);
  }

  if (notification.recipientType === "USER") {
    io.to(`user:${notification.recipientId}`).emit("notification:new", notification);
  }

  if (notification.recipientType === "ALL") {
    io.emit("notification:new", notification);
  }
}

router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

    emitNotification(notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { recipientType, recipientId, limit = 20 } = req.query;

    let filter = {};

    if (recipientType || recipientId) {
      filter = {
        $or: [
          { recipientType: "ALL" }
        ]
      };

      if (recipientId) {
        filter.$or.push({ recipientId });
      }
      
      if (recipientType) {
        filter.$or.push({ recipientType, recipientId: null });
      }
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get notifications",
      error: error.message
    });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const { recipientType, recipientId } = req.body;
    let filter = { isRead: false };
    
    if (recipientType || recipientId) {
      filter.$or = [{ recipientType: "ALL" }];
      
      if (recipientId) {
        filter.$or.push({ recipientId });
      }
      
      if (recipientType) {
        filter.$or.push({ recipientType, recipientId: null });
      }
    }

    await Notification.updateMany(filter, { isRead: true });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message
    });
  }
});

module.exports = router;