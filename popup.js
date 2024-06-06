document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search');
  const resultsList = document.getElementById('results');

  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();

    if (query) {
      chrome.bookmarks.search(query, function (bookmarks) {
        resultsList.innerHTML = '';

        bookmarks.forEach(function (bookmark) {
          const li = document.createElement('li');
          li.textContent = bookmark.title + ' - ' + bookmark.url;
          resultsList.appendChild(li);
        });
      });
    } else {
      resultsList.innerHTML = '';
    }
  });
});