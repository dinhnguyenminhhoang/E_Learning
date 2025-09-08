"use strict";
const mongoose = require("mongoose");
const {
  db: { host, name, port },
} = require("../configs/config.mongDb");
const connectString = `${host}${port}${name}`;
const { countConnect } = require("../helpers/check.connect");
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (process.env.NODE_ENV === "dev") {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      heartbeatFrequencyMS: 10000, // 10 seconds
      maxPoolSize: 10, // Giảm pool size cho Atlas
    };

    mongoose
      .connect(connectString, options)
      .then(() => {
        console.log("✅ Connected to MongoDB Atlas successfully");
        console.log(`📊 Database: e_learning_dev`);
        countConnect();
      })
      .catch((err) => {
        console.error("❌ Error connecting to MongoDB Atlas:");
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        console.error("Full error:", err);

        // Log additional debugging info
        console.error("\n🔍 Debugging info:");
        console.error("- Check your internet connection");
        console.error("- Verify MongoDB Atlas Network Access settings");
        console.error("- Confirm database user credentials");
        console.error("- Ensure your IP is whitelisted");
      });

    // Connection event handlers
    mongoose.connection.on("connecting", () => {
      console.log("🔄 Attempting to connect to MongoDB Atlas...");
    });

    mongoose.connection.on("connected", () => {
      console.log("🎉 Successfully connected to MongoDB Atlas!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("🚨 MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 Disconnected from MongoDB Atlas");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Reconnected to MongoDB Atlas");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });

    process.on("SIGTERM", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through SIGTERM");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Utility methods
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed manually");
    } catch (err) {
      console.error("Error disconnecting from MongoDB:", err);
      throw err;
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getConnectionState() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState] || "unknown";
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
