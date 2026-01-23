// src/services/authDb.js
/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
import { apiClient } from "../../config/api";

/**
 * Login to the system using the database
 * Uses Express server
 */
export async function loginWithDb({ role, username, password }) {
  try {
    const userData = await apiClient("/api/users/login", {
      body: { role, username, password },
    });
    return userData;

  } catch (error) {
    if (error.status === 401) {
      return null;
    }
    console.error("Login API Error:", error);
    throw error;
  }
}