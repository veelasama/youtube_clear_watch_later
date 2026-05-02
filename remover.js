/**
 * YouTube Watch Later Cleaner — Updated 2026
 * Запускайте в консоли браузера на странице: https://www.youtube.com/playlist?list=WL
 */


if (!location.href.includes('youtube.com/playlist?list=WL')) {
  console.log('❌ Запустите скрипт на странице "Смотреть позже": youtube.com/playlist?list=WL');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function queryShadow(selector, root = document) {
  for (const el of root.querySelectorAll(selector)) {
    if (el.shadowRoot) return queryShadow(selector, el.shadowRoot);
    if (el.matches?.(selector)) return el;
  }
  return root.querySelector(selector);
}

function findMenuButton(video) {
  return video.querySelector('button[aria-label*="меню"], button[aria-label*="Menu"], button[aria-label*="Действия"], #menu button, yt-button-renderer button');
}

function findRemoveOption() {
  const keywords = ['remove', 'удалить', 'usuń', 'entfernen', 'supprimer', 'eliminar'];
  const items = document.querySelectorAll('tp-yt-paper-item, ytd-menu-navigation-item-renderer, [role="menuitem"]');
  
  for (const item of items) {
    const text = item.textContent?.toLowerCase() || '';
    if (keywords.some(k => text.includes(k)) && text.includes('watch later') || text.includes('playlist')) {
      return item;
    }
  }
  return document.evaluate(
    '//span[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "remove") or contains(translate(text(), "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ", "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"), "удалить")]',
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
  ).singleNodeValue?.closest('tp-yt-paper-item, [role="menuitem"]');
}

async function removeVideos({ maxCount = Infinity, delay = 800 } = {}) {
  let removed = 0;
  
  while (removed < maxCount) {
    await sleep(300);
    const video = document.querySelector('ytd-playlist-video-renderer');
    if (!video) {
      console.log(`✅ Готово! Удалено видео: ${removed}`);
      break;
    }
    
    const menuBtn = findMenuButton(video);
    if (!menuBtn) {
      console.warn('⚠️ Кнопка меню не найдена, пропуск...');
      await sleep(500);
      continue;
    }
    menuBtn.click();
    await sleep(200);
    
    const removeOpt = findRemoveOption();
    if (removeOpt) {
      removeOpt.click();
      removed++;
      console.log(`🗑️ Удалено: ${removed}`);
    } else {
      console.warn('⚠️ Опция "Удалить" не найдена');
    }
    
    await sleep(delay);
    
    // Каждые 100 видео — длинная пауза
    if (removed % 100 === 0 && removed > 0) {
      console.log(`⏳ Пауза 30 сек после ${removed} удалений...`);
      await sleep(30000);
    }
  }
}

// можно настроить параметры
removeVideos({ maxCount: Infinity, delay: 1000 });
