// Authentication state
let isAuthenticated = false;
let userProfile = null;

// Load saved authentication state
function loadAuthState() {
  const savedAuth = localStorage.getItem("authState");
  if (savedAuth) {
    const { isAuth, profile } = JSON.parse(savedAuth);
    isAuthenticated = isAuth;
    userProfile = profile;
    if (isAuthenticated && userProfile) {
      // Store user email in localStorage for script.js
      localStorage.setItem("userEmail", userProfile.email);
      updateUIAfterLogin();
      // Restore chat history for this user
      restoreUserHistory();
    } else {
      initializeUIState();
    }
  } else {
    initializeUIState();
  }
}

// Save authentication state
function saveAuthState() {
  localStorage.setItem(
    "authState",
    JSON.stringify({
      isAuth: isAuthenticated,
      profile: userProfile,
    })
  );
}

// Save user's chat history
function saveUserHistory() {
  if (isAuthenticated && userProfile) {
    const userEmail = userProfile.email;
    const chatSessions = JSON.parse(
      localStorage.getItem("chatSessions") || "[]"
    );
    localStorage.setItem(
      `userChats_${userEmail}`,
      JSON.stringify(chatSessions)
    );
  }
}

// Restore user's chat history
function restoreUserHistory() {
  if (isAuthenticated && userProfile) {
    const userEmail = userProfile.email;
    const savedHistory = localStorage.getItem(`userChats_${userEmail}`);
    if (savedHistory) {
      localStorage.setItem("chatSessions", savedHistory);
      // Call updateHistory from script.js
      if (typeof updateHistory === "function") {
        updateHistory();
      }
    }
  }
}

// Initialize UI state
function initializeUIState() {
  // Always enable chat input and send button
  const userInput = document.getElementById("userInput");
  const btnSend = document.getElementById("btn-send");
  const loginButton = document.getElementById("login-button");

  // Keep input and send button always enabled
  userInput.disabled = false;
  userInput.placeholder = "Type your message here...";
  btnSend.disabled = false;

  // Enable suggestion buttons
  const suggestionButtons = document.querySelectorAll(".suggestion-btn");
  suggestionButtons.forEach((button) => (button.disabled = false));

  if (!isAuthenticated) {
    // Disable new chat button
    document.getElementById("new-chat-btn").disabled = true;

    // Clear chat history
    document.getElementById("history-list").innerHTML = "";

    // Show welcome message
    document.getElementById("response").innerHTML = `
            <div id="welcome-message" class="welcome-container montserrat" data-aos="fade-up" data-aos-duration="1000">
                <div class="welcome-header" data-aos="fade-down" data-aos-delay="200">
                    <h3>Welcome to MindMate</h3>
                </div>
                <div class="welcome-content" data-aos="fade-up" data-aos-delay="400">
                    <p>Hi there! I'm your MindMate, a friendly AI companion ready to listen and support you.</p>
                    <p class="text-muted">Sign in to save your chat history and start new conversations.</p>
                </div>
                <div class="welcome-suggestions" data-aos="fade-up" data-aos-delay="600">
                    <p>Here are some ways I can help:</p>
                    <div class="suggestion-buttons">
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="800" onclick="suggestTopic('Im feeling anxious today')">I'm feeling anxious</button>
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="900" onclick="suggestTopic('Help me with stress management')">Stress management</button>
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="1000" onclick="suggestTopic('I need some positive affirmations')">Positive affirmations</button>
                    </div>
                </div>
            </div>
        `;

    // Clear any existing chat sessions from localStorage
    localStorage.removeItem("chatSessions");

    // Reset login button
    loginButton.innerHTML = '<i class="ri-login-box-line me-2"></i>Login';
    loginButton.setAttribute("data-bs-toggle", "modal");
    loginButton.setAttribute("data-bs-target", "#loginModal");
  }
}

// Handle Google Sign-In
function handleGoogleSignIn(response) {
  const credential = response.credential;
  const payload = JSON.parse(atob(credential.split(".")[1]));

  // Store user information
  userProfile = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };

  isAuthenticated = true;

  // Save authentication state
  saveAuthState();

  // Store user email in localStorage for script.js
  localStorage.setItem("userEmail", userProfile.email);

  // Update UI
  updateUIAfterLogin();

  // Restore user's chat history
  restoreUserHistory();

  // Close login modal
  const loginModal = bootstrap.Modal.getInstance(
    document.getElementById("loginModal")
  );
  if (loginModal) {
    loginModal.hide();
  }

  // Reload the page after a short delay to ensure all data is saved
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Update UI after login
function updateUIAfterLogin() {
  // Update login button
  const loginButton = document.getElementById("login-button");
  loginButton.innerHTML = `<img src="${userProfile.picture}" class="profile-picture">`;
  loginButton.classList.add("logged-in");
  loginButton.classList.remove("logged-out");
  loginButton.setAttribute("data-bs-toggle", "dropdown");
  loginButton.removeAttribute("data-bs-target");

  // Enable new chat button
  document.getElementById("new-chat-btn").disabled = false;

  // Ensure input and send button are enabled
  const userInput = document.getElementById("userInput");
  const btnSend = document.getElementById("btn-send");
  userInput.disabled = false;
  userInput.placeholder = "Type your message here...";
  btnSend.disabled = false;

  // Show user profile dropdown
  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdown-menu dropdown-menu-end";
  dropdownMenu.innerHTML = `
        <div class="dropdown-item">
            <img src="${userProfile.picture}" class="rounded-circle me-2" width="32" height="32">
            <span>${userProfile.name}</span>
        </div>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#" onclick="handleSignOut()">Sign Out</a>
    `;

  // Remove existing dropdown if any
  const existingDropdown = loginButton.nextElementSibling;
  if (
    existingDropdown &&
    existingDropdown.classList.contains("dropdown-menu")
  ) {
    existingDropdown.remove();
  }

  loginButton.parentNode.appendChild(dropdownMenu);
}

// Handle sign out
function handleSignOut() {
  // Save current chat history before signing out
  saveUserHistory();

  isAuthenticated = false;
  userProfile = null;

  // Clear saved authentication state
  localStorage.removeItem("authState");
  localStorage.removeItem("userEmail");

  // Reset UI
  const loginButton = document.getElementById("login-button");
  loginButton.innerHTML = '<i class="ri-login-box-line me-2"></i>Login';
  loginButton.classList.add("logged-out");
  loginButton.classList.remove("logged-in");
  loginButton.setAttribute("data-bs-toggle", "modal");
  loginButton.setAttribute("data-bs-target", "#loginModal");

  // Remove dropdown menu
  const dropdownMenu = loginButton.nextElementSibling;
  if (dropdownMenu && dropdownMenu.classList.contains("dropdown-menu")) {
    dropdownMenu.remove();
  }

  // Initialize UI state (this will disable new chat and clear history)
  initializeUIState();

  // Reload the page after a short delay to ensure all data is cleared
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Initialize Bootstrap components and UI state
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all tooltips
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Load saved authentication state
  loadAuthState();
});
