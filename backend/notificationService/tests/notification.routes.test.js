const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");

const Notification = require("../src/models/Notification");
const { initSocket } = require("../src/config/socket");
const notificationRoutes = require("../src/routes/notification.routes");

// ─── Build a minimal Express app for route testing ────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use("/api/notifications", notificationRoutes);

// Initialize Socket.io (required by the routes)
initSocket(server);

// ─── Connect / Disconnect ─────────────────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/test-notification-db"
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  server.close();
});

afterEach(async () => {
  await Notification.deleteMany({});
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function createNotification(overrides = {}) {
  return Notification.create({
    recipientType: "ADMIN",
    title: "Test notification",
    message: "Test message",
    ...overrides
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("POST /api/notifications", () => {
  it("should create a notification and return 201", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({
        recipientType: "ADMIN",
        title: "Server alert",
        message: "CPU is high",
        type: "METRICS_ALERT",
        priority: "HIGH"
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Server alert");
    expect(res.body.type).toBe("METRICS_ALERT");
    expect(res.body.priority).toBe("HIGH");
    expect(res.body.isRead).toBe(false);
    expect(res.body._id).toBeDefined();
  });

  it("should return 500 for invalid data", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({
        recipientType: "INVALID_TYPE",
        title: "Bad",
        message: "Bad data"
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to create notification");
  });
});

describe("GET /api/notifications", () => {
  it("should return all notifications", async () => {
    await createNotification({ title: "Notif 1" });
    await createNotification({ title: "Notif 2" });

    const res = await request(app).get("/api/notifications");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("should filter by recipientType", async () => {
    await createNotification({ recipientType: "ADMIN", title: "Admin notif" });
    await createNotification({ recipientType: "USER", recipientId: "u1", title: "User notif" });

    const res = await request(app).get("/api/notifications?recipientType=ADMIN");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Admin notif");
  });

  it("should filter by recipientId", async () => {
    await createNotification({ recipientType: "USER", recipientId: "user1" });
    await createNotification({ recipientType: "USER", recipientId: "user2" });

    const res = await request(app).get("/api/notifications?recipientId=user1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].recipientId).toBe("user1");
  });

  it("should limit results", async () => {
    for (let i = 0; i < 5; i++) {
      await createNotification({ title: `Notif ${i}` });
    }

    const res = await request(app).get("/api/notifications?limit=3");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it("should return notifications sorted by createdAt desc", async () => {
    await createNotification({ title: "Oldest" });
    await createNotification({ title: "Newest" });

    const res = await request(app).get("/api/notifications");

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Newest");
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  it("should mark a notification as read", async () => {
    const notif = await createNotification();

    const res = await request(app).patch(`/api/notifications/${notif._id}/read`);

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
  });
});

describe("PATCH /api/notifications/read-all", () => {
  it("should mark all matching notifications as read", async () => {
    await createNotification({ recipientType: "ADMIN" });
    await createNotification({ recipientType: "ADMIN" });
    await createNotification({ recipientType: "USER", recipientId: "u1" });

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .send({ recipientType: "ADMIN" });

    expect(res.status).toBe(200);

    const admins = await Notification.find({ recipientType: "ADMIN" });
    expect(admins.every(n => n.isRead)).toBe(true);

    const user = await Notification.findOne({ recipientType: "USER" });
    expect(user.isRead).toBe(false);
  });
});

describe("DELETE /api/notifications/:id", () => {
  it("should delete a notification", async () => {
    const notif = await createNotification();

    const res = await request(app).delete(`/api/notifications/${notif._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Notification deleted successfully");

    const found = await Notification.findById(notif._id);
    expect(found).toBeNull();
  });

  it("should return 404 for non-existent notification", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/api/notifications/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Notification not found");
  });
});
