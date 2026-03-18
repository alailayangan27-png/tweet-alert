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
    lastTweet: ""
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
        <div class="status" id="status-${i}">Waiting...</div>
        <button class="remove" onclick="removeUser(${i})">Remove</button>
      </div>
    `;
  });
}

// FETCH TWEET
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

// MONITOR LOOP
async function monitor() {

  for (let i = 0; i < users.length; i++) {

    const tweet = await fetchTweet(users[i].name);

    const status = document.getElementById("status-" + i);

    if (!tweet) {
      status.innerText = "Error / Private";
      continue;
    }

    if (users[i].lastTweet && tweet !== users[i].lastTweet) {
      status.innerText = "🚨 NEW TWEET!";

      new Notification("New Tweet @" + users[i].name, {
        body: tweet
      });

    } else {
      status.innerText = "No update";
    }

    users[i].lastTweet = tweet;
  }

  save();
}

// INIT
load();

Notification.requestPermission();

setInterval(monitor, 10000);
