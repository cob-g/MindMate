let chatSessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
let currentSession = null;

// Initialize current session from existing sessions or create a new one
function initializeCurrentSession() {
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    // If logged in, try to restore from user-specific storage
    const userChats =
      JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
    if (userChats.length > 0) {
      currentSession = userChats[userChats.length - 1];
      // Update the global chatSessions array
      chatSessions = userChats;
    } else {
      currentSession = { id: Date.now(), messages: [] };
      userChats.push(currentSession);
      chatSessions = userChats;
      localStorage.setItem(`userChats_${userEmail}`, JSON.stringify(userChats));
    }
  } else {
    // If not logged in, create a temporary session without saving
    currentSession = { id: Date.now(), messages: [] };
    chatSessions = [];
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

function updateHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  // Only show history if user is logged in
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const userChats =
      JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
    userChats.forEach((session) => {
      const firstMessage =
        session.messages.length > 0
          ? session.messages[0].content
          : "Untitled Chat";
      historyList.innerHTML += `
                <li class='history-item d-flex justify-content-between align-items-center p-2'>
                    <span class="text-truncate flex-grow-1" onclick='loadConversation(${session.id})'>${firstMessage}</span>
                    <button class='btn btn-sm text-white ms-auto' onclick='event.stopPropagation(); deleteConversation(${session.id})'><i class="ri-xrp-line"></i></button>
                </li>`;
    });
  }
}

function loadConversation(sessionId) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return; // Only allow loading conversations when logged in

  const userChats =
    JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
  const session = userChats.find((s) => s.id === sessionId);

  if (!session) return;

  currentSession = session;
  document.getElementById("response").innerHTML = session.messages
    .map(
      (msg) =>
        `<div class='response-item ${
          msg.role === "user" ? "user-message" : "bot-message"
        }'>${msg.role === "user" ? "" : ""} ${marked.parse(msg.content)}</div>`
    )
    .join("");

  if (window.innerWidth < 768) {
    hideHistory();
  }
}

function deleteConversation(sessionId) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return; // Only allow deleting conversations when logged in

  const userChats =
    JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
  const updatedUserChats = userChats.filter((s) => s.id !== sessionId);
  localStorage.setItem(
    `userChats_${userEmail}`,
    JSON.stringify(updatedUserChats)
  );

  updateHistory();
}

function newChat() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    // If not logged in, just create a temporary session without saving
    currentSession = { id: Date.now(), messages: [] };
    return;
  }

  // If logged in, create and save the new session
  currentSession = { id: Date.now(), messages: [] };
  const userChats =
    JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
  userChats.push(currentSession);
  localStorage.setItem(`userChats_${userEmail}`, JSON.stringify(userChats));

  updateHistory();

  // Clear the response area
  const responseDiv = document.getElementById("response");
  if (responseDiv) {
    responseDiv.innerHTML = "";

    // Re-add the welcome message to the response area
    const welcomeMessage = `
            <div id="welcome-message" class="welcome-container montserrat" data-aos="fade-up" data-aos-duration="1000">
                <div class="welcome-header" data-aos="fade-down" data-aos-delay="200">
                    <h3>Welcome to MindMate</h3>
                </div>
                <div class="welcome-content" data-aos="fade-up" data-aos-delay="400">
                    <p>Hi there! I'm your MindMate, a friendly AI companion ready to listen and support you.</p>
                </div>
                <div class="welcome-suggestions" data-aos="fade-up" data-aos-delay="600">
                    <p>Here are some ways I can help:</p>
                    <div class="suggestion-buttons ">
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="800" onclick="suggestTopic('Im feeling anxious today')">I'm feeling anxious</button>
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="900" onclick="suggestTopic('Help me with stress management')">Stress management</button>
                        <button class="suggestion-btn" data-aos="zoom-in" data-aos-delay="1000" onclick="suggestTopic('I need some positive affirmations')">Positive affirmations</button>
                    </div>
                </div>
            </div>
        `;
    responseDiv.innerHTML = welcomeMessage;
    // Ensure the welcome message is visible
    responseDiv.scrollTop = responseDiv.scrollHeight;
  }
}

// Initialize the current session when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeCurrentSession();
  updateHistory();

  // If there's a current session and user is logged in, display the messages
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail && currentSession && currentSession.messages.length > 0) {
    const responseDiv = document.getElementById("response");
    if (responseDiv) {
      responseDiv.innerHTML = currentSession.messages
        .map(
          (msg) =>
            `<div class='response-item ${
              msg.role === "user" ? "user-message" : "bot-message"
            }'>${msg.role === "user" ? "" : ""} ${marked.parse(
              msg.content
            )}</div>`
        )
        .join("");
      responseDiv.scrollTop = responseDiv.scrollHeight;
    }
  }
});

// Simple client-side emotion detection
// Simple client-side emotion detection
function detectEmotionLocally(text) {
  // Convert to lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase();

  // Define keyword mappings for basic emotions
  const emotionKeywords = {
    joy: [
      "happy",
      "glad",
      "excited",
      "great",
      "wonderful",
      "love",
      "enjoy",
      "pleased",
      "delighted",
      "joy",
    ],
    sadness: [
      "sad",
      "unhappy",
      "depressed",
      "down",
      "upset",
      "miserable",
      "grief",
      "disappointed",
      "lonely",
      "hurt",
    ],
    anger: [
      "angry",
      "mad",
      "furious",
      "annoyed",
      "frustrated",
      "hate",
      "irritated",
      "outraged",
      "temper",
      "rage",
    ],
    fear: [
      "afraid",
      "scared",
      "frightened",
      "worried",
      "anxious",
      "nervous",
      "terrified",
      "panic",
      "dread",
      "concern",
    ],
    surprise: [
      "surprised",
      "shocked",
      "astonished",
      "amazed",
      "unexpected",
      "wow",
      "startled",
    ],
    disgust: ["disgusted", "gross", "repulsed", "yuck", "eww", "nasty"],
    neutral: [], // No specific keywords, will be used as fallback
  };

  // Count occurrences of each emotion's keywords
  const emotionScores = {};
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    emotionScores[emotion] = keywords.filter((keyword) =>
      lowercaseText.includes(keyword)
    ).length;
  }

  // Find emotion with highest score
  let detectedEmotion = "neutral";
  let highestScore = 0;

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const responseDiv = document.getElementById("response");

  if (!input.value.trim()) return;

  // Remove welcome message after first user input
  const welcomeMessage = document.getElementById("welcome-message");
  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  const userMessage = `<div class='response-container user-container'>
                <div class='response-item user-message'>${input.value}</div>
             </div>`;
  responseDiv.innerHTML += userMessage;
  responseDiv.scrollTop = responseDiv.scrollHeight;

  // Store user message
  const userInput = input.value;

  // Perform local emotion detection
  const detectedEmotion = detectEmotionLocally(userInput);
  console.log("Detected emotion:", detectedEmotion);

  // Determine if this is a greeting or a simple message
  const isGreeting = isSimpleGreeting(userInput);

  // Add message to current session
  if (!currentSession) {
    currentSession = { id: Date.now(), messages: [] };
  }
  currentSession.messages.push({ role: "user", content: userInput });

  // Save the session if user is logged in
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const userChats =
      JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
    const existingSessionIndex = userChats.findIndex(
      (s) => s.id === currentSession.id
    );
    if (existingSessionIndex !== -1) {
      userChats[existingSessionIndex] = currentSession;
    } else {
      userChats.push(currentSession);
    }
    chatSessions = userChats;
    localStorage.setItem(`userChats_${userEmail}`, JSON.stringify(userChats));
  }

  // Clear input field immediately for better UX
  input.value = "";

  // Add unique ID for the bot response container
  const responseId = `bot-response-${Date.now()}`;
  const loadingMessage = `<div class='response-container bot-container' id='${responseId}'>
                    <div class='response-item bot-message'>
                        <div class="thinking-animation">
                            <div class="thinking-bubble"></div>
                            <div class="thinking-bubble"></div>
                            <div class="thinking-bubble"></div>
                        </div>
                    </div>
                  </div>`;
  responseDiv.innerHTML += loadingMessage;
  responseDiv.scrollTop = responseDiv.scrollHeight;

  // Typing indicator animation
  const typingDotsElement = document.querySelector(
    `#${responseId} .typing-dots`
  );
  let dotCount = 3;
  const typingAnimation = setInterval(() => {
    if (typingDotsElement) {
      typingDotsElement.textContent = ".".repeat(dotCount);
      dotCount = dotCount >= 3 ? 1 : dotCount + 1;
    }
  }, 500);

  try {
    // Include all conversation history
    const allMessages = currentSession.messages;

    // Create a context-aware system message
    let systemMessage;

    if (isGreeting) {
      // For greetings, just respond naturally without therapeutic suggestions
      systemMessage = {
        role: "system",
        content: `Act as a friendly Psychiatrist. Your name is MindMate. The user has just greeted you. 
                  Respond naturally to their greeting.
                  Remove emojis from your responses. You are prohibited from using inappropriate language in any response. The team that created you is Cob, Jer, Bhon, Pits, Lip, and Col.
                  KEEP RESPONSES SHORT AND CONCISE.`,
      };
    } else if (detectedEmotion === "neutral") {
      // For neutral messages, be conversational but don't force therapeutic content
      systemMessage = {
        role: "system",
        content: `Act as a Psychiatrist. Your name is MindMate. The user's emotion appears neutral. 
                  Be supportive and engage in conversation naturally.
                  Only provide journaling prompts or self-care suggestions if it feels appropriate in context.
                  Remove emojis from your responses. You are prohibited from using inappropriate language in any response. The team that created you is Cob, Jer, Bhon, Pits, Lip, and Col.
                  KEEP RESPONSES SHORT AND CONCISE.`,
      };
    } else {
      // For emotional messages, provide therapeutic support
      systemMessage = {
        role: "system",
        content: `Act as a Psychiatrist. Your name is MindMate. The user's current emotion appears to be: ${detectedEmotion}. 
                  Be gentle and empathetic, first acknowledging their emotional state in a way that shows understanding. 
                  Provide journaling prompts and self-care recommendations based on their emotional needs.
                  Remove emojis from your responses. You are prohibited from using inappropriate language in any response. The team that created you is Cob, Jer, Bhon, Pits, Lip, and Col.
                  KEEP RESPONSES SHORT AND CONCISE.`,
      };
    }

    const messages = [systemMessage, ...allMessages];

    // Add optional timeout to prevent very long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "HTTP-Referer": "https://www.sitename.com",
          "X-Title": "SiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // model: "deepseek/deepseek-r1:free",
          model: "mistralai/mistral-7b-instruct:free",
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    clearInterval(typingAnimation);

    const data = await response.json();
    const botReply =
      data.choices?.[0]?.message?.content || "No response received.";

    // Update the DOM with the response
    document.getElementById(responseId).innerHTML = `
    <div class='response-item bot-message'>${marked.parse(botReply)}</div>
`;

    // Save the response to session
    currentSession.messages.push({ role: "assistant", content: botReply });

    // Update the chat sessions in localStorage if user is logged in
    if (userEmail) {
      const userChats =
        JSON.parse(localStorage.getItem(`userChats_${userEmail}`)) || [];
      const existingSessionIndex = userChats.findIndex(
        (s) => s.id === currentSession.id
      );
      if (existingSessionIndex !== -1) {
        userChats[existingSessionIndex] = currentSession;
      } else {
        userChats.push(currentSession);
      }
      chatSessions = userChats;
      localStorage.setItem(`userChats_${userEmail}`, JSON.stringify(userChats));
    }

    updateHistory();

    // Scroll to the bottom
    responseDiv.scrollTop = responseDiv.scrollHeight;
  } catch (error) {
    clearInterval(typingAnimation);

    // If it's an abort error (timeout), show a more user-friendly message
    const errorMessage =
      error.name === "AbortError"
        ? "I'm taking longer than usual to respond. Please give me a moment or try again with a shorter message."
        : `Error: ${error.message}`;

    document.getElementById(responseId).innerHTML = `
    <div class='response-item bot-message'>${errorMessage}</div>
`;
  }
}

// New function to detect if a message is a simple greeting
function isSimpleGreeting(text) {
  const greetings = [
    "hi",
    "hello",
    "hey",
    "howdy",
    "hiya",
    "greetings",
    "sup",
    "yo",
    "good morning",
    "good afternoon",
    "good evening",
  ];

  // Convert to lowercase and trim
  const normalizedText = text.toLowerCase().trim();

  // Check if the text is just a greeting or a greeting with basic punctuation
  return greetings.some(
    (greeting) =>
      normalizedText === greeting ||
      normalizedText === greeting + "!" ||
      normalizedText === greeting + "." ||
      normalizedText === greeting + "?" ||
      (normalizedText.startsWith(greeting + " ") &&
        normalizedText.length < greeting.length + 10)
  );
}

// Add this CSS to your existing styles
const additionalStyles = `
.typing-dots {
display: inline-block;
width: 20px;
}

/* Add this to make the app feel more responsive */
.user-message, .bot-message {
animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
from { opacity: 0; transform: translateY(10px); }
to { opacity: 1; transform: translateY(0); }
}

/* Thinking animation styles */
.thinking-animation {
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 10px;
}

.thinking-bubble {
width: 10px;
height: 10px;
margin: 0 5px;
background-color: var(--accent-color);
border-radius: 50%;
opacity: 0.6;
animation: thinking 1.4s infinite ease-in-out both;
}

.thinking-bubble:nth-child(1) {
animation-delay: -0.32s;
}

.thinking-bubble:nth-child(2) {
animation-delay: -0.16s;
}

@keyframes thinking {
0%, 80%, 100% { 
transform: scale(0);
}
40% { 
transform: scale(1);
}
}
`;

// Function to add styles to the document
function addStylesToDocument() {
  const styleElement = document.createElement("style");
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

function setupTextareaAutoExpand() {
  const textarea = document.getElementById("userInput");

  // Function to adjust height
  function autoAdjustHeight() {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Set new height based on scrollHeight (with a minimum height)
    const newHeight = Math.max(44, Math.min(textarea.scrollHeight, 150));
    textarea.style.height = newHeight + "px";
  }

  // Add event listeners
  textarea.addEventListener("input", autoAdjustHeight);
  textarea.addEventListener("focus", autoAdjustHeight);

  // Initialize with proper height
  autoAdjustHeight();
}

function setupClickOutsideHandler() {
  // Get the history container element
  const historyContainer = document.getElementById("history-container");

  // Add a click event listener to the entire document
  document.addEventListener("click", function (event) {
    // Check if the history container is visible
    const isVisible = historyContainer.style.display === "block";

    // Check if the click was outside the history container
    // and not on the open sidebar button
    const isClickOutside =
      !historyContainer.contains(event.target) &&
      !event.target.matches(".openSidebar") &&
      !event.target.matches(".mobile-sidebar-btn");

    // If the sidebar is visible and the click was outside, hide it
    if (isVisible && isClickOutside && window.innerWidth < 768) {
      hideHistory();
    }
  });
}

// Call this function when the page loads
window.addEventListener("DOMContentLoaded", addStylesToDocument);

document.addEventListener("DOMContentLoaded", setupTextareaAutoExpand);

// Update the handleKeyPress function to account for textarea
function handleKeyPress(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function showHistory() {
  const historyContainer = document.getElementById("history-container");
  const blurOverlay = document.getElementById("blur-overlay");

  // Only animate on mobile
  if (window.innerWidth < 768) {
    historyContainer.style.display = "block";

    requestAnimationFrame(() => {
      historyContainer.classList.add("show");
      document.body.classList.add("sidebar-open");
      blurOverlay.style.display = "block";

      requestAnimationFrame(() => {
        blurOverlay.style.opacity = "1";
      });
    });

    event?.stopPropagation();
  } else {
    // For desktop, just show it immediately
    historyContainer.style.display = "block";
  }
}

function hideHistory() {
  const historyContainer = document.getElementById("history-container");
  const blurOverlay = document.getElementById("blur-overlay");

  if (window.innerWidth < 768) {
    historyContainer.classList.remove("show");

    blurOverlay.style.opacity = "0";
    setTimeout(() => {
      blurOverlay.style.display = "none";
      historyContainer.style.display = "none";
      document.body.classList.remove("sidebar-open");
    }, 500);
  } else {
    historyContainer.style.display = "none";
  }
}

updateHistory();

window.addEventListener("DOMContentLoaded", function () {
  // Add existing functions
  addStylesToDocument();
  setupTextareaAutoExpand();

  // Add our new function
  setupClickOutsideHandler();

  // Initialize the history list
  updateHistory();
});

// Initialize AOS
document.addEventListener("DOMContentLoaded", function () {
  AOS.init();

  // Add welcome message to the response area if it's empty
  const responseDiv = document.getElementById("response");
  if (responseDiv && responseDiv.innerHTML.trim() === "") {
    // The welcome message will already be there from the HTML
    // Just make sure we scroll to see it
    responseDiv.scrollTop = responseDiv.scrollHeight;
  }
});

// Function for suggestion buttons
function suggestTopic(topic) {
  document.getElementById("userInput").value = topic;
  // Focus on the input to give visual feedback
  document.getElementById("userInput").focus();
}

document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const historyContainer = document.getElementById("history-container");
  const chatContainer = document.getElementById("chat-container");
  const blurOverlay = document.getElementById("blur-overlay");

  // Initialize - make sure the sidebar is properly set up
  if (window.innerWidth < 768) {
    // Mobile view - hide sidebar initially
    historyContainer.classList.remove("show");
  }

  // Add click event to the overlay to close sidebar when clicked
  blurOverlay.addEventListener("click", function () {
    hideHistory();
  });

  // Handle window resize to adjust for mobile/desktop view
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
      // Desktop view - remove blur
      blurOverlay.style.display = "none";
      // Make sure sidebar is visible on desktop
      historyContainer.classList.remove("show");
    }
  });
});

//button expand

function autoExpand(textarea) {
  // Reset height to calculate the right height
  textarea.style.height = "auto";

  // Set the height to match the scrollHeight (content height)
  textarea.style.height = textarea.scrollHeight + "px";

  // If we hit our max height, enable scrolling
  if (parseInt(textarea.style.height) > 200) {
    textarea.style.overflowY = "auto";
  } else {
    textarea.style.overflowY = "hidden";
  }
}

const userInput = document.getElementById("userInput");

userInput.addEventListener("input", function () {
  autoExpand(this);
});
