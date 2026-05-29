// api.js — Simulates async API calls using mock data
// ⚠️ SECURITY NOTE: In production, passwords should NEVER be transmitted or stored on the client.
// Use server-side authentication with bcrypt hashing, JWT tokens, and HTTPS.

import {
  getUserByCredentials,
  getOrdersByPartner,
  getAllOrders,
  getAllUsers,
  INVESTMENT_PLANS,
  ORDERS,
  USERS,
} from "./mockData.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const api = {
  async login(username, password) {
    await delay(600);
    // ⚠️ In production: send credentials over HTTPS only, hash on server, use JWT
    const user = getUserByCredentials(username, password);
    if (!user) throw new Error("That password doesn't match. Try again.");
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async getMyOrders(partnerId) {
    await delay(400);
    return getOrdersByPartner(partnerId);
  },

  async getAllOrders() {
    await delay(400);
    return getAllOrders();
  },

  async getAllPartners() {
    await delay(300);
    return getAllUsers().filter((u) => u.role === "partner");
  },

  async getInvestmentPlans() {
    await delay(200);
    return INVESTMENT_PLANS;
  },

  // Admin: toggle partner active status (mutates mock array in-memory)
  async togglePartnerStatus(partnerId) {
    await delay(300);
    const user = USERS.find((u) => u.id === partnerId);
    if (!user) throw new Error("Partner not found.");
    user.is_active = !user.is_active;
    return user;
  },

  // Admin: update partner details (e.g., status, AWB number)
  async updatePartner(partnerId, updates) {
    await delay(300);
    const user = USERS.find((u) => u.id === partnerId);
    if (!user) throw new Error("Partner not found.");
    Object.assign(user, updates);
    return user;
  },

  // Admin: add new partner
  async addPartner(data) {
    await delay(400);
    const newUser = {
      id: `usr_p${Date.now()}`,
      role: "partner",
      is_active: true,
      status: data.status || "New",
      awb_number: data.awb_number || "N/A",
      joined: new Date().toISOString().split("T")[0],
      ...data,
    };
    USERS.push(newUser);
    return newUser;
  },

  // Admin: update investment plan
  async updatePlan(planId, updates) {
    await delay(300);
    const plan = INVESTMENT_PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error("Plan not found.");
    Object.assign(plan, updates);
    return plan;
  },

  // Admin: update order status
  async updateOrderStatus(orderId, status) {
    await delay(300);
    const order = ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found.");
    order.status = status;
    return order;  },

  async updateOrderAwb(orderId, awb_number) {
    await delay(300);
    const order = ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found.");
    order.awb_number = awb_number || "N/A";
    return order;  },
};
