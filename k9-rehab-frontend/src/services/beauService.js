// src/services/beauService.js
// BEAU Metrics API service — sends patient data to /api/beau/chat
// with the 12-node Mars PetCare system prompt, parses JSON response

import { API } from "../api/axios";
import { BEAU_SYSTEM_PROMPT, BEAU_USER_PROMPT } from "../data/beauKnowledgeNodes";

/**
 * Generate a complete BEAU nutrition + rehab protocol for a patient.
 * Calls /api/beau/chat with the 12-node system prompt and patient data.
 * Parses the SSE streaming response and extracts JSON.
 *
 * @param {Object} patient - Patient form data
 * @param {string} authToken - JWT token
 * @param {string} language - UI locale (e.g. "en", "es", "ja")
 * @returns {Object} Parsed JSON protocol or { error: string }
 */
export async function generateBeauProtocol(patient, authToken, language = "en") {
  const userMessage = BEAU_USER_PROMPT(patient);

  const res = await fetch(`${API}/beau/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: `${BEAU_SYSTEM_PROMPT}\n\n${userMessage}` },
      ],
      language,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `BEAU API ${res.status}`);
  }

  // Parse SSE streaming response — collect all delta text
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === "delta" && parsed.text) fullText += parsed.text;
      } catch { /* skip non-JSON lines */ }
    }
  }

  // Extract JSON from response — BEAU may wrap it in text
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { error: "No JSON in response", rawText: fullText };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { error: "Invalid JSON in response", rawText: fullText };
  }
}
