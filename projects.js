"use strict"

const USERNAME = "rboswellj";
const PROJECTS_EL = document.getElementById("projects");
const STATUS_EL = document.getElementById("projects-status");

function repoCard(repo) {
  const topics = (repo.topics || []).slice(0, 6);

  return `
    <article class="card">
      <h3 class="title">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
          ${repo.name}
        </a>
      </h3>

      <div class="meta">
        ${repo.language ? `Language: ${repo.language} · ` : ""}
        ⭐ ${repo.stargazers_count} · Updated ${new Date(repo.updated_at).toLocaleDateString()}
      </div>

      <p>${repo.description ?? "No description yet."}</p>

      ${topics.length ? `
        <div class="badges" style="margin-top:.75rem;">
          ${topics.map(t => `<span class="badge accent">${t}</span>`).join("")}
        </div>
      ` : ""}
    </article>
  `;
}

async function fetchRepos() {
  STATUS_EL.textContent = "Loading projects…";

  const url = new URL(`https://api.github.com/users/${USERNAME}/repos`);
  url.searchParams.set("per_page", "100"); // most users fit in one page
  url.searchParams.set("sort", "updated");

  const res = await fetch(url.toString(), {
    headers: {
      // Recommended modern media type
      "Accept": "application/vnd.github+json",
    },
  });

  // fetch() doesn't throw on 404/500 — you must check status
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const repos = await res.json();

  // Filter + sort how YOU want
  const filtered = repos
    .filter(r => !r.fork)                 // hide forks
    .filter(r => !r.archived)             // hide archived
    .filter(r => r.visibility === "public")
    .sort((a, b) => b.stargazers_count - a.stargazers_count); // sort by stars

  PROJECTS_EL.innerHTML = filtered.map(repoCard).join("");
  STATUS_EL.textContent = `Showing ${filtered.length} repositories.`;
}

fetchRepos().catch(err => {
  console.error(err);
  STATUS_EL.textContent =
    "Could not load projects right now (rate limit or network). Please refresh later.";
});