

//  CONFIG


const CONFIG = {
  name: "AK Pandey",
  username: "akpandey-dev",
  cacheTime: 1000 * 60 * 60 * 24, // 24 hours (less API stress )
  projectGist:"https://gist.githubusercontent.com/akpandey-dev/dfbdbeb26f28fa95ab02bca603d43cd0/raw",
  contactGist: "https://gist.githubusercontent.com/akpandey-dev/c4a37c78f289e7ea15139c90f3694405/raw"
};


//  UTILITIES


const $ = id => document.getElementById(id);

function setYear() {
  $("year").textContent = new Date().getFullYear();
}

function contactRedirect() {
  document.querySelector("[data-page='contact']").click();
}

function customAlert(message){
  const overlay = document.getElementById("popup-overlay");
  const msg = document.getElementById("popup-message");
  const cancel = document.getElementById("popup-cancel");

  msg.textContent = message;
  cancel.style.display = "none";

  overlay.classList.add("show");

  document.getElementById("popup-ok").onclick = () => {
    overlay.classList.remove("show");
  };
}

function customConfirm(message){
  return new Promise(resolve=>{
    const overlay = document.getElementById("popup-overlay");
    const msg = document.getElementById("popup-message");
    const cancel = document.getElementById("popup-cancel");

    msg.textContent = message;
    cancel.style.display = "inline-block";

    overlay.classList.add("show");

    document.getElementById("popup-ok").onclick = ()=>{
      overlay.classList.remove("show");
      resolve(true);
    };

    cancel.onclick = ()=>{
      overlay.classList.remove("show");
      resolve(false);
    };
  });
}


// SIDEBAR + GLOBAL NAVIGATION


function switchSection(targetId) {
  const current = document.querySelector("section.active");
  const next = document.getElementById(targetId);

  if (!next || current === next) return;

  if (current) current.classList.remove("active");
  next.classList.add("active");
}

function setupNavigationSystem() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("sidebar-toggle");

  if (!sidebar || !overlay || !menuBtn) return;

  const open = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    menuBtn.classList.add("active");

  };

  const close = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    menuBtn.classList.remove("active");

  };

  // menu toggle
  menuBtn.addEventListener("click", e => {
    e.stopPropagation();
    sidebar.classList.contains("open") ? close() : open();
  });

 overlay.addEventListener("click", close);

  // ESC closes
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });

// GLOBAL navigation handler (event delegation)
document.addEventListener("click", e => {
  const link = e.target.closest("[data-page]");
  if (!link) return;

  const page = link.dataset.page;
  if (!page) return;

  switchSection(page);

  window.scrollTo({ top: 0, behavior: "auto" });

  close();
});
}

/* NAV SYNC (SIDEBAR to TOPBAR) */

function syncNavigation() {
  const sidebar = document.getElementById("sidebar");
  const topbarNav = document.getElementById("topbar-nav");

  if (!sidebar || !topbarNav) return;

  // clear previous links
  topbarNav.innerHTML = "";

  // clone sidebar navigation
  const navLinks = sidebar.querySelectorAll("[data-page]");

  navLinks.forEach(link => {
    const clone = link.cloneNode(true);

    // replace styling
    clone.className = "topbar-nav-options";

    topbarNav.appendChild(clone);
  });

  const themeToggleLink = sidebar.querySelector("[data-action]");
  const themeToggleClone = themeToggleLink.cloneNode(true);
  themeToggleClone.className = "topbar-nav-options";
  themeToggleClone.id = "topbar-theme-toggle";
  topbarNav.appendChild(themeToggleClone);
}

//  THEME SETUP AND MANAGEMENT


function toggleTheme() {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

function setupTheme() {

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }

  // Global event delegation
  document.addEventListener("click", (e) => {
    const actionElement = e.target.closest("[data-action]");
    if (!actionElement) return;

    if (actionElement.dataset.action === "theme-toggle") {
      toggleTheme();
    }
  });
}


//  SAFE FETCH + CACHE

   

async function safeFetch(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

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
    if (value.message) {
      throw new Error(value.message);
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        time: Date.now(),
        value
      })
    );

    return value;

  } catch (err) {
    console.error("Fetch failed:", err);

    // fallback to old cache
    if (cached) {
      return JSON.parse(cached).value;
    }

    throw err;
  }
}


// PROFILE + ABOUT


//  Setup Profile Information

async function loadProfile() {
  try {
    const data = await cachedFetch(
      "gh_user",
      `https://api.github.com/users/${CONFIG.username}`
    );

    $("avatar").src = data.avatar_url;
    $("bio").textContent = data.bio || "";

    $("stats").textContent =
      `${data.public_repos} Repositories · ` +
      `${data.followers} Followers · ` +
      `${data.following} Following`;

  } catch (err) {
    console.error("Profile load failed:", err);
  }

}

//  Setup about section
function aboutContentSetup() {
  const aboutMe = $("about-me");

  if (aboutMe) {
    aboutMe.textContent =`
      I'm a developer who enjoys building things, exploring technologies, and understanding how things actually work from the inside.
      My interests span programming, security, and experimenting with new ideas — from web projects and automation tools to low-level concepts like assembly.
      I'm always curious to learn something new and improve along the way.
    `;

    aboutMe.innerHTML += `
      <br><br>
      Feel free to explore my repositories and projects to see what I'm working on, and don't hesitate to 
      <a href="#" onclick="contactRedirect()">reach out</a> if you want to collaborate! 
      If you have any questions regarding my work or want to send a Pull Request on GitHub, you are more than welcome to do so.
      <br><br>
      <div style="font-style: italic; display: block; text-align: end;">
        -<span class="name-holder">${CONFIG.name}</span>
      </div>
    `;

    aboutMe.innerHTML += `
      <div style="
        margin-top:20px;
        font-size:14px;
        opacity:0.8;
        text-align:center;
        border:1px solid var(--border);
        padding:10px;
        border-radius:8px;"
        onmouseover="this.style.background='var(--border)'"
        onMouseOut="this.style.background='transparent'">

        <br><br>
        <h3>Support Me</h3><br>
        <p>If you like my work, you can support development.</p>
        <p>Consider starring my repositories you like on GitHub!</p>
        <br><br>
      </div>
    `;
  }


const statsImg = $("github-stats");
const streakImg = $("github-streak");
const langsImg = $("github-languages");

statsImg.src =
  `https://github-readme-stats.vercel.app/api?username=akpandey-dev&show_icons=true&theme=tokyonight&hide_border=true`;

streakImg.src =
  `https://streak-stats.demolab.com?user=akpandey-dev&theme=tokyonight&hide_border=true`;

streakImg.onerror = () => {
  streakImg.onerror = null;
  streakImg.src =
    `https://github-readme-streak-stats.herokuapp.com/?user=akpandey-dev&theme=dark`;
};

langsImg.src =
  `https://github-readme-stats.vercel.app/api/top-langs/?username=akpandey-dev&layout=compact&theme=tokyonight&hide_border=true`;
}

/* PROJECTS (JSON to UI) */

async function setupProjects() {
  const container = $("projects-container");

  try {
    const projects = await safeFetch(
      `${CONFIG.projectGist}`
    );

    if (!Array.isArray(projects)) {
      throw new Error("Invalid project format");
    }

    container.innerHTML = "";

    projects.forEach(project => {
      const progress =
        Math.max(0, Math.min(100, project.progress || 0));

      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <h3>${project.name || "Untitled Project"}</h3>
        <p>${project.description || "No description available"}</p>

    <div class="top-meta">
      ${project.stage ? `<span class="badge">${project.stage}</span>` : ""}
      ${project.actively_working ? `<span class="badge">Active</span>` : ""}
      ${project.contributions_welcome ? `<span class="badge">Open</span>` : ""}
    </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <small>${progress}% complete (current stage)</small>

    <details class="project-details">
      <summary>More details</summary>

      <div class="details-content">
        <p><strong>Languages:</strong> ${
          project.languages ? project.languages.join(", ") : "Unknown"
        }</p>
          ${
          project.tech_stack
            ? `<p><strong>Tech Stack:</strong> ${project.tech_stack.join(", ")}</p>`
            : ""}
          ${
          project.current_focus
            ? `<p><strong>Current Focus:</strong> ${project.current_focus}</p>`
            : ""}
          ${
          project.help_areas?.length
            ? `<p><strong>Help Needed:</strong> ${project.help_areas.join(", ")}</p>`
            : ""}
          ${
          project.planned_features?.length
            ? `<p><strong>Planned:</strong> ${project.planned_features.join(", ")}</p>`
            : ""}

  <small>
  ${
    project.available_on?.length
      ? `<strong>Available on:</strong> ` +
        project.available_on
          .map(p => `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.name}</a>`)
          .join(", ")
      : ""
  }
</small>
        <p>
          <a href="${project.link}" target="_blank" rel="noopener noreferrer">
            View Project →
          </a>
        </p>
      </div>
    </details>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Projects load failed:", err);

    container.innerHTML =
      "<div class='project-card'>Failed to load projects.</div>";
  }
}


// REPOSITORIES

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
      `https://api.github.com/users/${CONFIG.username}/repos?per_page=100`
    );

    container.innerHTML = "";

    sortRepos(repos).forEach(repo => {
      const updated =
        new Date(repo.updated_at)
          .toISOString()
          .split("T")[0];

      const card = document.createElement("div");
      card.className = "repo-card";

      card.innerHTML = `
        <h3>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            ⤤ ${repo.name}
          </a>
        </h3>
        <p>${repo.description || "No description"}</p>
        <p>⭐ ${repo.stargazers_count} · 🍴 ${repo.forks_count}</p>
        <p>🛠 ${repo.language || "Unknown"} · Updated ${updated}</p>
        <p>Size: ${repo.size} KB</p>
        ${
          repo.has_pages
            ? `<a class="pages-link" href="https://${CONFIG.username}.github.io/${repo.name}" target="_blank" rel="noopener noreferrer">🌐 Live Page</a>`
            : ""
        }
      `;

      container.appendChild(card);
    });

    document.getElementById("gist-link").href =
      `https://gist.github.com/${CONFIG.username}`;

  } catch (err) {
    container.innerHTML =
      "<div class='repo-card'>Failed to load repositories.</div>";
  }
}

// CONTACT INFORMATION AND FORM SETUP


// Contact info seup
async function loadContact() {
  const container = $("contact-information");

  try {
    const data = await safeFetch(CONFIG.contactGist);
    const list = data["contact-information"];

    if (!Array.isArray(list)) {
      throw new Error("Invalid contact format");
    }

    container.innerHTML = ""; // clear old

    const safeAttrs = ["href", "target", "rel", "title"];

    list.forEach(item => {
      // handle line breaks
      if (item.tag === "br") {
        container.appendChild(document.createElement("br"));
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "contact-row";

      // label (safe)
      if (item.label) {
        const label = document.createElement("span");
        label.textContent = item.label + ": ";
        wrapper.appendChild(label);
      }

      // element
      const el = document.createElement(item.tag || "span");
      el.textContent = item.text || "";

      // secure attribute application
      if (item.attrs) {
        Object.entries(item.attrs).forEach(([key, value]) => {
          if (safeAttrs.includes(key)) {
            el.setAttribute(key, value);
          }
        });
      }

      wrapper.appendChild(el);
      container.appendChild(wrapper);
    });

  } catch (err) {
    console.error("Dynamic contact load failed:", err);
    container.textContent = "Failed to load contact info.";
  }
}

// Contact Form setup
function setupForm() {
  const form = $("form");
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
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (res.ok) {
        statusMsg.textContent = "Message sent.";
        statusMsg.style.color = "green";
        form.reset();
        setTimeout(()=>{
          statusMsg.textContent = '';
          statusMsg.style.color = '';
        }, 2000)
        customAlert("✅Message sent successfully. Thanks for submission.")
      } else {
        statusMsg.textContent = data.message || "Failed.";
        statusMsg.style.color = "red";
        setTimeout(()=>{
          statusMsg.textContent = '';
          statusMsg.style.color = '';
        }, 5000)
      }

    } catch {
      statusMsg.textContent = "Network error.";
      statusMsg.style.color = "red";
        setTimeout(()=>{
          statusMsg.textContent = '';
          statusMsg.style.color = '';
        }, 5000)
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}


// INIT -> FUNCTION INVOCATIONS

function init() {
  setYear();
  syncNavigation();
  setupNavigationSystem();
  setupTheme();
  setupForm();
  aboutContentSetup();
  loadProfile();
  loadRepos();
  setupProjects();
  loadContact();
}

document.addEventListener("DOMContentLoaded", init);
