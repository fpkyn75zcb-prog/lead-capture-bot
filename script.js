/**
 * Lead Capture Bot — Frontend Script
 * © 2025 By Fogle Unlimited | v1.0
 */

(function () {
  "use strict";

  const form        = document.getElementById("leadForm");
  const submitBtn   = document.getElementById("submitBtn");
  const panel       = document.getElementById("responsePanel");
  const chatBubble  = document.getElementById("chatBubble");

  const MESSAGES = {
    idle:    "Hey there! Fill out the form and I'll make sure your info lands in the right hands — instantly.",
    sending: "On it! Sending your info to the pipeline right now... 📤",
    success: "You're in! Your lead has been captured and saved to our Google Sheet. Expect to hear from us soon. ✅",
    error:   "Hmm, something went sideways. Check your connection and try again. 🔄",
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validateField(input, errorId, validator) {
    const err = document.getElementById(errorId);
    const msg = validator(input.value.trim());
    if (msg) {
      input.classList.add("invalid");
      err.textContent = msg;
      return false;
    } else {
      input.classList.remove("invalid");
      err.textContent = "";
      return true;
    }
  }

  function validateName(val)  { return val.length < 2 ? "Please enter your full name." : ""; }
  function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "" : "Enter a valid email address."; }

  // Live validation on blur
  document.getElementById("name").addEventListener("blur",  () => validateField(document.getElementById("name"),  "nameErr",  validateName));
  document.getElementById("email").addEventListener("blur", () => validateField(document.getElementById("email"), "emailErr", validateEmail));

  // Clear errors on focus
  ["name", "email"].forEach(id => {
    document.getElementById(id).addEventListener("focus", () => {
      document.getElementById(id).classList.remove("invalid");
    });
  });

  // ─── Show Response Panel ─────────────────────────────────────────────────────
  function showPanel(type, message) {
    panel.className = `response-panel ${type}`;
    panel.textContent = message;
    // Force reflow for transition
    requestAnimationFrame(() => panel.classList.add("show"));
  }

  function hidePanel() {
    panel.classList.remove("show");
    setTimeout(() => { panel.className = "response-panel"; }, 400);
  }

  // ─── Update Chat Bubble ──────────────────────────────────────────────────────
  function setChatMessage(key) {
    const textEl = chatBubble.querySelector(".chat-text");
    textEl.style.opacity = "0";
    setTimeout(() => {
      textEl.textContent = MESSAGES[key];
      textEl.style.transition = "opacity 0.3s ease";
      textEl.style.opacity = "1";
    }, 200);
  }

  // ─── Submit Handler ──────────────────────────────────────────────────────────
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hidePanel();

    const nameOk  = validateField(document.getElementById("name"),  "nameErr",  validateName);
    const emailOk = validateField(document.getElementById("email"), "emailErr", validateEmail);
    if (!nameOk || !emailOk) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    setChatMessage("sending");

    const formData = new FormData(form);
    const payload  = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showPanel("success", "🎉 " + data.message);
        setChatMessage("success");
        form.reset();
        // Remove any invalid states
        document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("invalid"));
      } else {
        throw new Error(data.error || "Server error");
      }
    } catch (err) {
      showPanel("error", "❌ " + (err.message || "Something went wrong. Please try again."));
      setChatMessage("error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });

})();
