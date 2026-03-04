
/* =========================
   CONFIG
========================= */

const CONFIG = {
  name: "AKP Labs",
  username: "akp-labs",
  orgname: "apt-13",
  cacheTime: 1000 * 60 * 60 * 24 // 24 hours (less API stress)
};

/* =========================
   UTILITIES
========================= */

const $ = id => document.getElementById(id);

function setYear() {
  $("year").textContent = new Date().getFullYear();
}

function contactRedirect() {
  document.querySelector("[data-page='contact']").click();
}

/* =========================
   SIDEBAR
========================= */

function setupSidebar() {
  const sidebar = $("sidebar");
  const overlay = $("overlay");
  const menuBtn = $("menu-btn");

  const close = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    menuBtn.classList.remove("active");
  };

  menuBtn.onclick = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
    menuBtn.classList.toggle("active");
  };

  overlay.onclick = close;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });

  document.querySelectorAll("[data-page]").forEach(link => {
    link.onclick = () => {
      document.querySelectorAll("section")
        .forEach(s => s.classList.remove("active"));

      $(link.dataset.page).classList.add("active");
      window.scrollTo({ top: 0, behavior: "instant" });
      close();
    };
  });
}

/* =========================
   THEME
========================= */

function setupTheme() {
  if (localStorage.theme === "light") {
    document.body.classList.add("light");
  }

  $("theme-toggle").onclick = () => {
    document.body.classList.toggle("light");
    localStorage.theme =
      document.body.classList.contains("light") ? "light" : "dark";
  };
}

/* =========================
   SAFE FETCH + CACHE
========================= */

async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function cachedFetch(key, url) {
  const cached = localStorage.getItem(key);

  // return valid cache
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.time < CONFIG.cacheTime) {
      return data.value;
    }
  }

  // fetch fresh data
  try {
    const value = await safeFetch(url);

    // prevent caching API error responses
    if (value.message) throw new Error(value.message);

    localStorage.setItem(key, JSON.stringify({
      time: Date.now(),
      value
    }));

    return value;

  } catch (err) {
    console.error("Fetch failed:", err);

    // fallback to old cache
    if (cached) return JSON.parse(cached).value;

    throw err;
  }
}

/* =========================
   PROFILE + ABOUT
========================= */

async function loadProfile() {
  try {
    const data = await cachedFetch(
      "gh_user",
      `https://api.github.com/users/${CONFIG.username}`
    );

    $("avatar").src = data.avatar_url;
    $("bio").textContent = data.bio || "";

    $("stats").textContent =
      `📦 ${data.public_repos} Repositories · ` +
      `👥 ${data.followers} Followers · ` +
      `➡️ ${data.following} Following`;

  } catch (err) {
    console.error("Profile load failed:", err);
  }

  $("github-stats").src =
    `https://img.shields.io/github/stars/${CONFIG.username}?style=flat&logo=github`;

  $("github-streak").src =
    `https://github-readme-streak-stats.herokuapp.com/?user=${CONFIG.username}&theme=dark`;

  $("profile-link").href = `https://github.com/${CONFIG.username}`;
  $("org-link").href = `https://github.com/${CONFIG.orgname}`;
  $("website-link").href = `https://${CONFIG.username}.github.io`;
}

/* =========================
   REPOSITORIES
========================= */

function sortRepos(repos) {
  const special = [
    `${CONFIG.username}.github.io`,
    CONFIG.username
  ];

  return repos.sort((a, b) => {
    const ai = special.indexOf(a.name);
    const bi = special.indexOf(b.name);

    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return -1;
      if (bi === -1) return 1;
      return ai - bi;
    }

    return a.name.localeCompare(b.name);
  });
}

async function loadRepos() {
  const container = $("repo-container");

  try {
    const repos = await cachedFetch(
      "gh_repos",
      `https://api.github.com/users/${CONFIG.username}/repos`
    );

    container.innerHTML = "";

    sortRepos(repos).forEach(repo => {
      const updated =
        new Date(repo.updated_at).toISOString().split("T")[0];

      const card = document.createElement("div");
      card.className = "repo-card";

      card.innerHTML = `
        <h3>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            ${repo.name}
          </a>
        </h3>
        <p>${repo.description || "No description"}</p>
        <p>⭐ ${repo.stargazers_count} · 🍴 ${repo.forks_count}</p>
        <p>🛠 ${repo.language || "Unknown"} · Updated ${updated}</p>
        <p>Size: ${(repo.size / 1024).toFixed(2)} MB</p>
        ${repo.has_pages ? `<a class="pages-link" href="https://${CONFIG.username}.github.io/${repo.name}" target="_blank" rel="noopener noreferrer">🌐 Live Page</a>` : ''}
      `;

      container.appendChild(card);
      
    });
    document.getElementById("gist-link").href = `https://gist.github.com/${CONFIG.username}`;

  } catch (err) {
    container.innerHTML =
      "<div class='repo-card'>Failed to load repositories.</div>";
  }
}

/* =========================
   PROJECTS (JSON → UI)
========================= */

async function setupProjects() {
  const container = $("projects-container");

  try {
    // local file OR gist URL both work
    const projects = await safeFetch("https://gist.githubusercontent.com/akp-labs/dfbdbeb26f28fa95ab02bca603d43cd0/raw");
    if (!Array.isArray(projects)) throw new Error("Invalid project format");

    container.innerHTML = "";

    projects.forEach(project => {
      const progress = Math.max(0, Math.min(100, project.progress || 0));
      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <h3>${project.name || "Untitled Project"}</h3>
        <p>${project.description || "No description available"}</p>

        ${project.stage
          ? `<span class="stage">${project.stage}</span>`
          : ""}

        <div class="progress-bar">
          <div class="progress-fill"
               style="width:${progress}%"></div>
        </div>

        <small>${progress}% complete (current stage)</small>
        <small><br>Languages: ${project.languages ? project.languages.join(", ") : "Unknown"}</small>
        <p><a href="${project.link}" target="_blank" rel="noopener noreferrer">Check it out...</a></p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Projects load failed:", err);
    container.innerHTML =
      "<div class='project-card'>Failed to load projects.</div>";
  }
}

/* =========================
   CONTACT FORM
========================= */

function setupForm() {
  const form = $("form");  // $() is a shortcut for document.getElementById
  if (!form) return;

  const submitBtn = form.querySelector("button");
  const statusMsg = $("form-status");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    statusMsg.textContent = "";

    try {
      const res = await fetch(
        "https://api.web3forms.com/submit",
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (res.ok) {
        statusMsg.textContent = "Message sent.";
        statusMsg.style.color = "green";
        form.reset();
      } else {
        statusMsg.textContent = data.message || "Failed.";
        statusMsg.style.color = "red";
      }

    } catch {
      statusMsg.textContent = "Network error.";
      statusMsg.style.color = "red";
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

/* =========================
   NAME SETUP (MULTIPLE PLACES)
========================= */

function contentSetup() {

const aboutMe = $("about-me");
if (aboutMe) {
  aboutMe.textContent =`
    I’m a curious developer who loves building things, breaking things, and learning how systems actually work from the inside. 
    I’m deeply interested in programming, ethical hacking, and experimenting with new ideas — from web projects and automation tools to low-level concepts like assembly. 
    I don't like to talk too much but I enjoy turning curiosity into real projects, exploring technology beyond the surface, and constantly pushing myself to learn something new every day. 
    For me, coding isn’t just a skill — it’s how I try to explore the world.
    `;
  aboutMe.innerHTML += `<br><br>Feel free to explore my repositories and projects to see what I'm working on, and don't hesitate to <a href="#" onclick="contactRedirect()">reach out</a> if you want to collaborate! 
    If you have any questions regarding my work or want to send a Pull Request on GitHub, you are more than welcome to do so.
    <br><br><div style="font-style: italic; display: block; text-align: end;">-The mind behind <span class="name-holder">${CONFIG.name}</span></div>
    `;
  aboutMe.innerHTML += `<div style="margin-top: 20px; font-size: 14px; opacity: 0.8; text-align: center;border: 1px solid var(--border); padding: 10px; border-radius: 8px;" onmouseover="this.style.background='var(--border)'" onMouseOut="this.style.background='transparent'">
                        <br><br>
                        <h3>Support Me</h3><br>
                        <p>If you like my work, you can support development.</p>
                        <p>Consider starring my repositories you like on GitHub!</p>
                        <br><br>
                        </div>
                    `;
}

}

/* =========================
   INIT
========================= */

function init() {
  setYear();
  setupSidebar();
  setupTheme();
  setupForm();
  contentSetup();
  loadProfile();
  loadRepos();
  setupProjects();
}

document.addEventListener("DOMContentLoaded", init);
