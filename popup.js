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
        currentFocus = 0; // Reset the current focus

        bookmarks.forEach(async function (bookmark, index) {
          if (!bookmark.url) return;
          const li = document.createElement('li');
          li.tabIndex = index;
          if (index === 0) {
            li.classList.add('active');
          }

          let domain;
          try {
            domain = new URL(bookmark.url).hostname;
          } catch (e) {
            domain = null;
          }
          const icon = document.createElement('img');
          icon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
          icon.style.width = '12px';
          icon.style.height = '12px';
          icon.style.marginRight = '2px';

          const bookmark_parent = await chrome.bookmarks.get(bookmark.parentId);

          const parent = document.createElement('span');
          parent.textContent = bookmark_parent ? bookmark_parent[0].title + ' / ' : '';
          parent.classList.add('parent');
          const title = document.createElement('span');
          title.textContent = bookmark.title;
          title.classList.add('title');
          const url = document.createElement('p');
          url.textContent = ' - ' + bookmark.url;
          url.classList.add('url');

          li.append(icon, parent, title, url);

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

    // parts: 適切なliアイテムに.activeを付与
    function addActive(items) {
      if (!items) return false;
      removeActive(items);
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      items[currentFocus].classList.add('active');
      items[currentFocus].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // parts: すべてのliアイテムから.activeを削除
    function removeActive(items) {
      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
      }
    }

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
});
