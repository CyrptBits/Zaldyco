// ============================
// IMPORTS & FIREBASE SETUP
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your NEW Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ3kvWjHfORRjsWI9LWYI_CPUAXi9Mub4",
  authDomain: "zaldy-623eb.firebaseapp.com",
  databaseURL: "https://zaldy-623eb-default-rtdb.firebaseio.com/",
  projectId: "zaldy-623eb",
  storageBucket: "zaldy-623eb.firebasestorage.app",
  messagingSenderId: "1027139635306",
  appId: "1:1027139635306:web:2849cb6b4ee8147c226213",
  measurementId: "G-0SZEEBEVYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================
// LOGIN SYSTEM
// ============================
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');

// Show login modal when page loads
document.addEventListener('DOMContentLoaded', () => {
  loginModal.style.display = 'flex';
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    showLoading(true);
    
    // In a real implementation, you would use Firebase Auth here
    // For demo purposes, we'll simulate a successful login
    await simulateLogin(email, password);
    
    // Store login status
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    // Hide login modal
    loginModal.style.display = 'none';
    
    // Show success message
    showVoteMessage('Login successful! You can now vote.');
    
  } catch (error) {
    alert('Login failed: ' + error.message);
  } finally {
    showLoading(false);
  }
});

// Simulate login (replace with actual Firebase Auth)
function simulateLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation for demo
      if (email.includes('@') && password.length >= 6) {
        resolve({ email: email });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000);
  });
}

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('userLoggedIn') === 'true';
}

// ============================
// POLL SYSTEM
// ============================
const polls = {
  1: ["Sarah Discaya", "Henry Alcantara", "Brice Hernandez", "Zaldy Co"],
  2: ["Education", "Health", "Infrastructure", "Others"],
};

// Add a loading indicator
const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loading-overlay";
loadingOverlay.innerHTML = `<div class="loader"></div>`;
document.body.appendChild(loadingOverlay);

function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// Vote function
async function vote(pollId, choice) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    alert('Please login to vote');
    loginModal.style.display = 'flex';
    return;
  }

  const voteKey = `poll${pollId}-voted`;
  if (localStorage.getItem(voteKey)) {
    alert("You've already voted in this poll.");
    return;
  }

  try {
    showLoading(true);
    const voteRef = ref(db, `polls/${pollId}/${choice}`);
    const snapshot = await get(voteRef);
    const currentVotes = snapshot.exists() ? snapshot.val() : 0;
    await set(voteRef, currentVotes + 1);
    localStorage.setItem(voteKey, "true");
    
    // Send user data to backend
    await sendUserVoteData(pollId, choice);
    
    await showResults(pollId);
    showVoteMessage('Thank you for voting!');
  } catch (error) {
    console.error("Voting error:", error);
    alert("Something went wrong while voting: " + error.message);
  } finally {
    showLoading(false);
  }
}

// Send user vote data to backend
async function sendUserVoteData(pollId, choice) {
  const userEmail = localStorage.getItem('userEmail');
  const timestamp = new Date().toISOString();
  
  const userVoteRef = ref(db, `userVotes/${pollId}/${userEmail.replace('.', '_')}`);
  await set(userVoteRef, {
    choice: choice,
    timestamp: timestamp,
    email: userEmail
  });
}

// Show results
async function showResults(pollId) {
  showLoading(true);
  const container = document.getElementById("results-container");
  container.innerHTML = "";
  document.getElementById("results").style.display = "block";

  const pollRef = ref(db, `polls/${pollId}`);
  const snapshot = await get(pollRef);
  const results = snapshot.exists() ? snapshot.val() : {};

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  for (const option of polls[pollId]) {
    const votes = results[option] || 0;
    const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;

    const label = document.createElement("div");
    label.className = "bar-label";
    label.innerHTML = `<span>${option}</span><span>${percent}%</span>`;

    const bar = document.createElement("div");
    bar.className = "bar";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = "0";

    bar.appendChild(fill);
    container.appendChild(label);
    container.appendChild(bar);

    setTimeout(() => (fill.style.width = percent + "%"), 100);
  }

  showLoading(false);
}

// Show vote message
function showVoteMessage(message) {
  const existingMessage = document.querySelector('.vote-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'vote-message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.classList.add('fade-out');
    setTimeout(() => messageDiv.remove(), 600);
  }, 3000);
}

// ============================
// NAVIGATION (Home / About / Donate)
// ============================
const pollsSection = document.getElementById("polls-section");
const aboutSection = document.getElementById("about-section");
const donateSection = document.getElementById("donate-section");

document.getElementById("home-link").addEventListener("click", () => {
  showSection("home");
});
document.getElementById("about-link").addEventListener("click", () => {
  showSection("about");
});
document.getElementById("donate-link").addEventListener("click", () => {
  showSection("donate");
});

function showSection(section) {
  pollsSection.style.display = section === "home" ? "block" : "none";
  aboutSection.style.display = section === "about" ? "block" : "none";
  donateSection.style.display = section === "donate" ? "block" : "none";
  document.getElementById("results").style.display = section === "home" ? "block" : "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================
// PAGE LOADING ANIMATION
// ============================
document.addEventListener("DOMContentLoaded", () => {
  showLoading(false);
  showSection("home");
  
  // Check if user is already logged in
  if (isUserLoggedIn()) {
    loginModal.style.display = 'none';
  }
});

// Make vote and showResults globally accessible (for inline buttons)
window.vote = vote;
window.showResults = showResults;
