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
    tweetText: ""
  });

  input.value = "";
  save();
  render();
}

function removeUser(index) {
  users.splice(index, 1);
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
        <div class="tweet">${u.tweetText || "Loading..."}</div>
        <div class="status" id="status-${i}">Waiting...</div>
        <button class="remove" onclick="removeUser(${i})">Remove</button>
      </div>
    `;
  });
}

// FETCH TWEET (NO WIDGET)
async function fetchTweet(username) {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://nitter.net/" +
      username +
      "/rss"
    );

    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return data.items[0].title;

  } catch {
    return null;
  }
}

// MONITOR
async function monitor() {
  for (let i = 0; i < users.length; i++) {

    const tweet = await fetchTweet(users[i].name);
    const status = document.getElementById("status-" + i);

    if (!tweet) {
      status.innerText = "Error / Private";
      continue;
    }

    // update UI tweet
    users[i].tweetText = tweet;

    if (users[i].lastTweet && tweet !== users[i].lastTweet) {
      status.innerText = "🚨 NEW TWEET!";

      new Notification("New Tweet @" + users[i].name, {
        body: tweet
      });

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

// refresh tiap 10 detik
setInterval(monitor, 10000);
