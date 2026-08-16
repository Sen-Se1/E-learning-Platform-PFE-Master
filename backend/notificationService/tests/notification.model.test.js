const mongoose = require("mongoose");
const Notification = require("../src/models/Notification");

// ─── Connect / Disconnect ─────────────────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/test-notification-db"
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Notification.deleteMany({});
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Notification Model", () => {
  it("should create a notification with valid data", async () => {
    const notification = await Notification.create({
      recipientType: "ADMIN",
      title: "Test notification",
      message: "This is a test"
    });

    expect(notification._id).toBeDefined();
    expect(notification.recipientType).toBe("ADMIN");
    expect(notification.title).toBe("Test notification");
    expect(notification.message).toBe("This is a test");
    expect(notification.isRead).toBe(false);
    expect(notification.type).toBe("SYSTEM");
    expect(notification.priority).toBe("MEDIUM");
    expect(notification.createdAt).toBeDefined();
  });

  it("should fail without required recipientType", async () => {
    await expect(
      Notification.create({ title: "Test", message: "msg" })
    ).rejects.toThrow();
  });

  it("should fail without required title", async () => {
    await expect(
      Notification.create({ recipientType: "ADMIN", message: "msg" })
    ).rejects.toThrow();
  });

  it("should fail without required message", async () => {
    await expect(
      Notification.create({ recipientType: "ADMIN", title: "Test" })
    ).rejects.toThrow();
  });

  it("should reject invalid recipientType enum", async () => {
    await expect(
      Notification.create({
        recipientType: "INVALID",
        title: "Test",
        message: "msg"
      })
    ).rejects.toThrow();
  });

  it("should reject invalid type enum", async () => {
    await expect(
      Notification.create({
        recipientType: "ADMIN",
        title: "Test",
        message: "msg",
        type: "INVALID_TYPE"
      })
    ).rejects.toThrow();
  });

  it("should reject invalid priority enum", async () => {
    await expect(
      Notification.create({
        recipientType: "ADMIN",
        title: "Test",
        message: "msg",
        priority: "ULTRA"
      })
    ).rejects.toThrow();
  });

  it("should accept all valid recipientType values", async () => {
    for (const type of ["USER", "TEACHER", "ADMIN", "ALL"]) {
      const n = await Notification.create({
        recipientType: type,
        title: `Test ${type}`,
        message: "msg"
      });
      expect(n.recipientType).toBe(type);
    }
  });

  it("should accept all valid type values", async () => {
    for (const type of ["ENROLLMENT", "COURSE_UPDATE", "METRICS_ALERT", "SYSTEM", "SECURITY"]) {
      const n = await Notification.create({
        recipientType: "ADMIN",
        title: `Test ${type}`,
        message: "msg",
        type
      });
      expect(n.type).toBe(type);
    }
  });

  it("should accept all valid priority values", async () => {
    for (const priority of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]) {
      const n = await Notification.create({
        recipientType: "ADMIN",
        title: `Test ${priority}`,
        message: "msg",
        priority
      });
      expect(n.priority).toBe(priority);
    }
  });

  it("should store metadata as an object", async () => {
    const n = await Notification.create({
      recipientType: "ADMIN",
      title: "Alert",
      message: "CPU high",
      metadata: { cpuPercent: 95, ramPercent: 80 }
    });

    expect(n.metadata.cpuPercent).toBe(95);
    expect(n.metadata.ramPercent).toBe(80);
  });

  it("should default recipientId to null", async () => {
    const n = await Notification.create({
      recipientType: "ALL",
      title: "Broadcast",
      message: "Hello everyone"
    });

    expect(n.recipientId).toBeNull();
  });

  it("should store a specific recipientId", async () => {
    const n = await Notification.create({
      recipientType: "USER",
      recipientId: "abc123",
      title: "Personal",
      message: "Just for you"
    });

    expect(n.recipientId).toBe("abc123");
  });
});
