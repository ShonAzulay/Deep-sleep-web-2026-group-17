// src/services/authDb.js
/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
// Imports removed as logic moved to server

/**
 * התחברות למערכת באמצעות מסד הנתונים
 * שימוש בשרת Express
 */
export async function loginWithDb({ role, username, password }) {
  try {
    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, username, password }),
    });

    if (!response.ok) {
      // אם הסרבר החזיר שגיאה (כגון 401), נזרוק אותה או נחזיר null
      // במקרה הזה נשמור על התנהגות הפונקציה המקורית שמחזירה null אם לא נמצא
      if (response.status === 401) return null;
      throw new Error("Server error");
    }

    const userData = await response.json();
    return userData;

  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
}