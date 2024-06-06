document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search');
  const resultsList = document.getElementById('results');

  let currentFocus = 0;

  // 検索と候補表示
  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();

    if (query) {
      chrome.bookmarks.search(query, function (bookmarks) {
        resultsList.innerHTML = '';
        currentFocus = -1; // Reset the current focus

        bookmarks.forEach(function (bookmark, index) {
          const li = document.createElement('li');
          li.textContent = bookmark.title + ' - ' + bookmark.url;
          li.tabIndex = index;
          li.addEventListener('click', function () {
            chrome.tabs.create({ url: bookmark.url });
          });
          resultsList.appendChild(li);
        });
      });
    } else {
      resultsList.innerHTML = '';
    }
  });

  // キーの押下を検知し処理
  searchInput.addEventListener('keydown', function (e) {
    const items = resultsList.getElementsByTagName('li');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      currentFocus++; // 基本は下に下に
      if (currentFocus >= items.length) currentFocus = 0; // 一番下までいったらスクロール
      addActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (currentFocus > 0) {
        currentFocus--; // 基本は上に上に
      } else {
        currentFocus = 0; // 初めての矢印操作の場合は、上キーであっても一番最初の要素にフォーカス
        window.scroll({
          top: 0,
          behavior: 'smooth',
        }); // かつ、要素が見えなくならないようトップへスクロール
      }
      if (currentFocus < 0) currentFocus = items.length - 1;
      addActive(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFocus >= 0) {
        if (items) {
          items[currentFocus].click();
        }
      }
    }
  });

  // parts: 適切なliアイテムに.activeを付与
  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add('active');
  }

  // parts: すべてのliアイテムから.activeを削除
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('active');
    }
  }
});
