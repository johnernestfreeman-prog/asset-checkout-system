const form = document.getElementById("authForm");
const msgBox = document.getElementById("msgBox");
const submitBtn = document.getElementById("submitBtn");
const usernameField = document.getElementById("usernameField");
const formTitle = document.getElementById("formTitle");
const formEyebrow = document.getElementById("formEyebrow");
const switchPrompt = document.getElementById("switchPrompt");
const switchLink = document.getElementById("switchLink");

let mode = "login"; // or "register"

// If already signed in, skip straight to the assets page.
if (getToken()) {
  window.location.href = "assets.html";
}

function showMessage(text, type) {
  msgBox.textContent = text;
  msgBox.className = `msg show ${type}`;
}

function clearMessage() {
  msgBox.className = "msg";
}

function setMode(newMode) {
  mode = newMode;
  clearMessage();

  if (mode === "login") {
    formEyebrow.textContent = "Sign in";
    formTitle.textContent = "Access the ledger";
    submitBtn.textContent = "Sign in";
    usernameField.style.display = "none";
    document.getElementById("username").removeAttribute("required");
    switchPrompt.textContent = "Need an account?";
    switchLink.textContent = "Register";
  } else {
    formEyebrow.textContent = "Register";
    formTitle.textContent = "Create your account";
    submitBtn.textContent = "Create account";
    usernameField.style.display = "block";
    document.getElementById("username").setAttribute("required", "required");
    switchPrompt.textContent = "Already have an account?";
    switchLink.textContent = "Sign in";
  }
}

switchLink.addEventListener("click", (e) => {
  e.preventDefault();
  setMode(mode === "login" ? "register" : "login");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = mode === "login" ? "Signing in…" : "Creating account…";

  try {
    if (mode === "login") {
      const data = await apiRequest(ENDPOINTS.login, {
        method: "POST",
        body: { email, password },
      });
      // Adjust this if your backend returns the token under a
      // different key (e.g. data.accessToken).
      const token = data.token || data.accessToken;
      if (!token) throw new Error("No token returned from server.");
      setToken(token);
      window.location.href = "assets.html";
    } else {
      await apiRequest(ENDPOINTS.register, {
        method: "POST",
        body: { username, email, password },
      });
      showMessage("Account created. You can sign in now.", "ok");
      setMode("login");
    }
  } catch (err) {
    showMessage(err.message, "err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "login" ? "Sign in" : "Create account";
  }
});