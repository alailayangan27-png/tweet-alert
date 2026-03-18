let users = [];

function save() {
  localStorage.setItem("users", JSON.stringify(users));
}

function load() {
  const data = localStorage.getItem("users");
  if (data) {
    users = JSON.parse(data);
    render();
  }
}

function addUser() {
  const input = document.getElementById("username");
  const username = input.value.trim();

  if (!username) return alert("Masukkan username");

  users.push({
    name: username,
    lastTweet: "",
    tweetText: "Loading..."
  });

  input.value = "";
  save();
  render();
}

function removeUser(i) {
  users.splice(i, 1);
  save();
  render();
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  users.forEach((u, i) => {
    list.innerHTML += `
      <div class="card">
        <div class="name">@${u.name}</div>
        <div class="tweet">${u.tweetText}</div>
        <div class="status" id="status-${i}">Checking...</div>
        <button class="remove" onclick="removeUser(${i})">Remove</button>
      </div>
    `;
  });
}

// 🔥 FETCH VIA BACKEND (NO ERROR)
async function fetchTweet(username) {
  try {
    const res = await fetch("/api/tweet?user=" + username);
    const data = await res.json();
    return data.tweet;
  } catch {
    return null;
  }
}

// 🔥 MONITOR CEPAT
async function monitor() {

  for (let i = 0; i < users.length; i++) {

    const tweet = await fetchTweet(users[i].name);
    const status = document.getElementById("status-" + i);

    if (!tweet) {
      status.innerText = "Error / Private";
      continue;
    }

    users[i].tweetText = tweet;

    if (users[i].lastTweet && tweet !== users[i].lastTweet) {

      status.innerText = "🚨 NEW TWEET!";

      if (Notification.permission === "granted") {
        new Notification("New Tweet @" + users[i].name, {
          body: tweet
        });
      }

    } else {
      status.innerText = "Updated";
    }

    users[i].lastTweet = tweet;
  }

  save();
  render();
}

// INIT
load();
Notification.requestPermission();

// ⚡ UPDATE CEPAT
setInterval(monitor, 5000);
