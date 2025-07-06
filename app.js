import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

// 3D Sparkling Thunder Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-3d'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

const sparks = [];
for (let i = 0; i < 80; i++) {
  const geometry = new THREE.SphereGeometry(Math.random() * 0.08 + 0.04, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(`hsl(${Math.random() * 360},90%,60%)`) });
  const spark = new THREE.Mesh(geometry, material);
  spark.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 6);
  scene.add(spark);
  sparks.push(spark);
}

function animate() {
  requestAnimationFrame(animate);
  sparks.forEach((s, i) => {
    s.position.x += Math.sin(Date.now() / 700 + i) * 0.002;
    s.position.y += Math.cos(Date.now() / 900 + i) * 0.002;
    s.rotation.x += 0.01;
    s.rotation.y += 0.01;
  });
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Chat LLM UI
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
const chatBox = document.getElementById('chatBox');

function renderChat() {
  chatBox.innerHTML = chatHistory.map(
    msg => `<div class="msg ${msg.role}">${msg.content.replace(/\n/g, '<br>')}</div>`
  ).join('');
  chatBox.scrollTop = chatBox.scrollHeight;
}

renderChat();

document.getElementById('chatForm').onsubmit = async function (e) {
  e.preventDefault();
  const input = document.getElementById('chatInput').value.trim();
  if (!input) return;

  // Add user input
  chatHistory.push({ role: "user", content: input });
  renderChat();
  document.getElementById('chatInput').value = '';

  // Show typing placeholder
  chatHistory.push({ role: "assistant", content: "..." });
  renderChat();

  try {
    // ✅ Correct backend endpoint
    const res = await fetch('https://creativespark-back.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.filter(m => m.content !== "...") })
    });

    const data = await res.json();

    // Replace "..." with actual reply
    chatHistory.pop();
    chatHistory.push({ role: "assistant", content: data.reply || "No reply received." });

  } catch (err) {
    // Replace "..." with error message
    chatHistory.pop();
    chatHistory.push({ role: "assistant", content: "⚠️ Could not reach AI. Please try again later." });
  }

  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  renderChat();
};

// Prompts
const prompts = [
  "Invent a gadget that solves a daily problem.",
  "Describe a world where colors have flavors.",
  "Write a story about a thunderstorm that brings ideas.",
  "Draw a spark of inspiration as a creature.",
  "Imagine a city powered by creativity.",
  "If you could combine two animals, what would you create?",
  "Design a superhero with a unique, creative power.",
  "What if music could be seen as colors in the sky?",
  "Write a poem about a spark of genius.",
  "Imagine a festival celebrating imagination itself."
];

const promptList = document.getElementById('promptList');
promptList.innerHTML = prompts.map(
  p => `<button class="prompt-btn">${p}</button>`
).join('');

promptList.querySelectorAll('.prompt-btn').forEach(btn => {
  btn.onclick = () => {
    document.getElementById('chatInput').value = btn.textContent;
    document.getElementById('chatInput').focus();
  };
});

// Share Button
document.getElementById('shareBtn').onclick = function (e) {
  e.preventDefault();
  if (navigator.share) {
    navigator.share({
      title: 'Creativity Spark Studio',
      text: 'Unleash your imagination with AI, 3D, and thunderous inspiration!',
      url: window.location.href
    });
  } else {
    alert('Copy this link to share: ' + window.location.href);
  }
};
