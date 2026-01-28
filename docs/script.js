
const username = 'akp-labs';
const container = document.getElementById('repo-container');

document.querySelector('header .detail-profile').innerHTML = `<a href="https://github.com/${username}/${username}" target="_blank" rel="noopener noreferrer">Take a look to the profile repository...</a>`;

document.getElementById('year').textContent = new Date().getFullYear();

fetch(`https://api.github.com/users/${username}/repos`)
.then(res => {
    if (!res.ok) throw new Error('GitHub API error');
    return res.json();
})
.then(repos => {
    // Sort alphabetically by name first
    repos.sort((a, b) => a.name.localeCompare(b.name));

    // Push special repos to the end
    const specialNames = ['akp-labs.github.io', 'akp-labs'];
    repos.sort((a, b) => {
        if (specialNames.includes(a.name)) return 1;
        if (specialNames.includes(b.name)) return -1;
        return 0;
    });

    repos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';

        // Last updated date in YYYY-MM-DD
        const updatedDate = new Date(repo.updated_at).toISOString().split('T')[0];

        card.innerHTML = `
            <h3>↗ <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
            <p>${repo.description || 'No description'}</p>
            <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
            <p>Last updated: ${updatedDate}</p>
            <p class="languages">Most used language: ${repo.language || 'Unknown'}</p>
            ${repo.has_pages ? `<a class="pages-link" href="https://${username}.github.io/${repo.name}" target="_blank" rel="noopener noreferrer">🌐 Live Page</a>` : ''}
        `;

        // Confirmation popup before opening GitHub
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if(e.target.tagName.toLowerCase() !== 'a') {
                const confirmOpen = confirm(`Open GitHub repo "${repo.name}"?`);
                if(confirmOpen) window.open(repo.html_url, '_blank', 'noopener');
            }
        });

        container.appendChild(card);

/*The language fetch here*/
/*-----------------------*/
/*==========Here=========*/

    });
})
.catch(err => {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Failed to load repositories.</p>';
    console.error(err);
});


// Fetch and display profile picture and other info
fetch(`https://api.github.com/users/${username}`)
  .then(res => res.json())
  .then(data => {
      // Set avatar
      document.getElementById('profile-pic').src = data.avatar_url;
      // Set GitHub profile link
      document.querySelector('header a').href = data.html_url;

      // Set Github Stats 
      document.getElementById('github-stats').src = `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&include_all_commits=true&theme=dark`;
      document.getElementById('github-contributions').src = `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=dark`;

      // Update about section with icons & colors
      document.getElementById('about-section').innerHTML = `
          <span style="font-style: italic; color: #aaffaa;">${data.bio || 'No bio available.'}</span><br>
          <span style="color: #55ff55;">📦 ${data.public_repos} Repos</span> |
          <span style="color: #88ff88;">👥 ${data.followers} Followers</span> |
          <span style="color: #aaffaa;">➡️ ${data.following} Following</span>
      `;
  })
  .catch(err => console.error('Failed to fetch GitHub profile', err));



/*
The function below fetches the languages used in the repository and displays them in the card.
It is currently commented out to avoid hitting Github API rate limits,
 which is a common issue when fetching data for many repositories.
*/

/*
fetch(repo.languages_url)
  .then(res => res.json())
  .then(languages => {
      const total = Object.values(languages).reduce((a, b) => a + b, 0);

      if (!total) {
          card.querySelector(".languages").textContent = "🛠️ No code detected";
          return;
      }

      const breakdown = Object.entries(languages)
        .map(([lang, bytes]) => {
            const percent = ((bytes / total) * 100).toFixed(1);
            return `${lang} ${percent}%`;
        })
        .join(" · ");

      card.querySelector(".languages").textContent = `🛠️ ${breakdown}`;
  })
  .catch(() => {
      card.querySelector(".languages").textContent = "🛠️ Language data unavailable";
  });
*/