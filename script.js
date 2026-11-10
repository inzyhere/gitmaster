// GitHub Finder — works with the current index.html structure

const input = document.querySelector('#searchInput');
const searchButton = document.querySelector('#modalSearchBtn');
const searchSection = document.querySelector('.search-modal .search-section');
const errorMessage = document.querySelector('#errorMessage');
const homeFeed = document.querySelector('.feed');

homeFeed.hidden=false;

if (!input || !searchButton || !searchModal) {
  console.error('Search setup failed: check #searchInput, #modalSearchBtn and #searchModal in index.html.');
} else {

  let results = document.querySelector('#githubResults');

  if (!results) {
    results = document.createElement('section');
    results.id = 'githubResults';
    results.className = 'github-results';

    const main = document.querySelector('main') || document.querySelector('.app');

    main.append(results);
  }

  let profile = document.querySelector('#userContainer');

  if (!profile) {
    profile = document.createElement('article');
    profile.id = 'userContainer';
    profile.className = 'profile-card';
    profile.hidden = true;

    profile.innerHTML = `
      <img id="img" class="avatar" alt="GitHub avatar" width="80">

      <div class="profile-info">
        <h2 id="username"></h2>
        <p id="name"></p>
        <p id="bio"></p>

        <a id="profileLink"
           target="_blank"
           rel="noopener noreferrer">
           View GitHub profile ↗
        </a>
      </div>

      <div class="stats">
        <span>Followers: <strong id="followers">0</strong></span>
        <span>Following: <strong id="following">0</strong></span>
        <span>Repositories: <strong id="repoCount">0</strong></span>
      </div>
    `;

    results.append(profile);
  }

  let repoHeading = document.querySelector('#repoLabel');

  if (!repoHeading) {
    const heading = document.createElement('h2');

    heading.textContent = 'Repositories';

    repoHeading = document.createElement('span');
    repoHeading.id = 'repoLabel';

    heading.append(' ', repoHeading);

    results.append(heading);
  }

  let repoList = document.querySelector('#repoList');

  if (!repoList) {
    repoList = document.createElement('div');
    repoList.id = 'repoList';
    repoList.className = 'repo-list';

    results.append(repoList);
  }

  let emptyState = document.querySelector('#emptyState');

  if (!emptyState) {
    emptyState = document.createElement('p');
    emptyState.id = 'emptyState';

    emptyState.textContent =
      'Search a GitHub username to see their profile and repositories.';

    results.append(emptyState);
  }

  const get = selector => document.querySelector(selector);

  const setError = message => {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.hidden = !message;
    } else if (message) {
      alert(message);
    }
  };

  function searchUser() {

    const login = input.value.trim();

    if (!login) {
      setError('Please enter a GitHub username.');
      input.focus();
      return;
    }
      homeFeed.hidden = true;

    setError('');

    profile.hidden = true;

    repoList.replaceChildren();

    repoHeading.textContent = '0';

    emptyState.hidden = false;

    emptyState.textContent =
      'Loading profile and repositories…';

    const encodedLogin = encodeURIComponent(login);

    const userURL =
      `https://api.github.com/users/${encodedLogin}`;

    const reposURL =
      `${userURL}/repos?per_page=100`;

    let profileDone = false;
    let reposDone = false;
    let profileFound = false;

    const maybeCloseModal = () => {

      if (profileDone && reposDone && profileFound) {

        searchModal.hidden = true;

        input.value = '';
      }
    };

    // PROFILE REQUEST

    const userXHR = new XMLHttpRequest();

    userXHR.open('GET', userURL);

    userXHR.onload = () => {

      profileDone = true;

      if (userXHR.status === 200) {

        const data = JSON.parse(userXHR.responseText);

        get('#img').src = data.avatar_url;

        get('#img').alt =
          `${data.login} avatar`;

        get('#username').textContent =
          data.login;

        get('#name').textContent =
          data.name || "Name isn't updated.";

        get('#bio').textContent =
          data.bio || "Bio isn't updated.";

        get('#profileLink').href =
          `https://github.com/${encodedLogin}`;

        get('#followers').textContent =
          data.followers;

        get('#following').textContent =
          data.following;

        get('#repoCount').textContent =
          data.public_repos;

        profile.hidden = false;

        profileFound = true;

      } else if (userXHR.status === 404) {

        profileFound = false;

        emptyState.hidden = false;

        emptyState.textContent =
          'GitHub user not found. Check the username and try again.';

        setError(
          'GitHub user not found. Check the username and try again.'
        );

      } else {

        setError(
          `Profile request failed (${userXHR.status}). Please try again.`
        );
      }

      maybeCloseModal();
    };

    userXHR.onerror = () => {

      profileDone = true;

      setError(
        'Network error while loading the profile. Check your connection.'
      );

      maybeCloseModal();
    };

    userXHR.send();

    // REPOSITORY REQUEST

    const reposXHR = new XMLHttpRequest();

    reposXHR.open('GET', reposURL);

    reposXHR.onload = () => {

      reposDone = true;

      if (reposXHR.status === 200) {

        const repos = JSON.parse(reposXHR.responseText);

        repos.sort((a, b) =>
          b.stargazers_count - a.stargazers_count
        );

        repoList.replaceChildren();

        if (repos.length === 0) {

          emptyState.hidden = false;

          emptyState.textContent =
            'This user has no public repositories.';

        } else {

          emptyState.hidden = true;

          repos.forEach(repo => {

            const card =
              document.createElement('article');

            card.className = 'repo-card active';

            const header =
              document.createElement('div');

            header.className = 'repo-header';

            const icon =
              document.createElement('span');

            icon.className = 'repo-icon';

            icon.textContent = '⌘';

            const title =
              document.createElement('a');

            title.className = 'repo-title';

            title.href = repo.html_url;

            title.target = '_blank';

            title.rel =
              'noopener noreferrer';

            title.textContent = repo.name;

            header.append(icon, title);

            const description =
              document.createElement('p');

            description.className =
              'repo-description';

            description.textContent =
              repo.description ||
              'No description available';

            const meta =
              document.createElement('div');

            meta.className = 'repo-meta';

            const language =
              document.createElement('span');

            language.className =
              'repo-language';

            language.textContent =
              repo.language || 'Not specified';

            const stars =
              document.createElement('span');

            stars.className =
              'repo-stars';

            stars.textContent =
              `☆ ${repo.stargazers_count}`;

            const forks =
              document.createElement('span');

            forks.className =
              'repo-forks';

            forks.textContent =
              `Forks ${repo.forks_count}`;

            meta.append(language, stars, forks);

            card.append(
              header,
              description,
              meta
            );

            repoList.append(card);

          });
        }

        repoHeading.textContent =
          String(repos.length);

      } else {

        setError(
          `Repository request failed (${reposXHR.status}). Please try again.`
        );
      }

      maybeCloseModal();
    };

    reposXHR.onerror = () => {

      reposDone = true;

      setError(
        'Network error while loading repositories. Check your connection.'
      );

      maybeCloseModal();
    };

    reposXHR.send();
  }

  // SEARCH BUTTON

  searchButton.addEventListener('click', event => {

    event.preventDefault();

    searchUser();

  });

  // ENTER KEY

  input.addEventListener('keydown', event => {

    if (event.key === 'Enter') {

      event.preventDefault();

      searchUser();

    }

  });

}