/* ============================================================
   Personal Portfolio - 交互脚本
   导航 / 相册 / 音乐播放 / 图片放大
   ============================================================ */

// ---------- 全局状态 ----------
let currentPage = null;          // 当前显示的页面 ID
let albumOpen = false;          // 相册是否打开
let currentPhotoIndex = 0;      // 当前照片索引
let currentAudio = null;        // 当前播放的歌曲元素

// 旅游照片列表（相对路径：旅游照片/）
const photoList = [
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230616_123601.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230616_163729.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230616_165513.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230617_153911.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230617_204511.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230619_135544.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230620_141734.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230621_092558.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230818_195840.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20230919_180616.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20231007_204612.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240121_105702.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240121_154126.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240124_160717.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240130_102825_1.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240131_122746.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20240131_132221.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20260217_125239.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20260226_200519.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20260228_162026.jpg',
  '%E6%97%85%E6%B8%B8%E7%85%A7%E7%89%87/IMG_20260228_162140.jpg'
];
const totalPhotos = photoList.length;

// ============================================================
//  页面导航
// ============================================================

/**
 * 导航到指定页面
 * @param {string} pageId - 目标页面 ID
 */
function navigateTo(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  // 如果是同一页面，不重复操作
  if (currentPage === pageId) return;

  // 如果离开目录页，重置卡片状态
  if (currentPage === 'toc') {
    resetTocCards();
  }

  // ⚡ 关键：先显示新页面，再隐藏旧页面，消除闪烁
  var oldPage = currentPage;
  currentPage = pageId;

  // 第一步：显示目标页面
  target.classList.add('active');

  // 第二步：隐藏旧页面
  if (oldPage) {
    document.getElementById(oldPage).classList.remove('active');
  }

  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 如果进入目录页，触发卡片依次渐入动画
  if (pageId === 'toc') {
    revealTocCards();
  }
}

/**
 * 目录卡片依次渐入
 */
function revealTocCards() {
  const cards = document.querySelectorAll('#toc .toc-card');
  cards.forEach(function(card, index) {
    // 先清除动画类，确保可以重新触发
    card.classList.remove('reveal');
    // 强制回流后添加动画
    void card.offsetWidth;
    // 依次延迟：第1张0ms，第2张150ms，第3张300ms
    setTimeout(function() {
      card.classList.add('reveal');
    }, index * 150);
  });
}

/**
 * 重置目录卡片状态
 */
function resetTocCards() {
  const cards = document.querySelectorAll('#toc .toc-card');
  cards.forEach(function(card) {
    card.classList.remove('reveal');
  });
}

// ============================================================
//  相册功能
// ============================================================

/**
 * 打开相册
 */
function openAlbum() {
  document.getElementById('albumCover').classList.add('hidden');
  document.getElementById('albumViewer').classList.remove('hidden');
  albumOpen = true;
  currentPhotoIndex = 0;
  showPhoto(0);
}

/**
 * 关闭相册
 */
function closeAlbum() {
  document.getElementById('albumViewer').classList.add('hidden');
  document.getElementById('albumCover').classList.remove('hidden');
  albumOpen = false;
}

/**
 * 显示指定索引的照片
 * 优先加载真实图片，文件不存在时显示占位提示
 * @param {number} index - 照片索引（从 0 开始）
 */
function showPhoto(index) {
  currentPhotoIndex = index;
  const photoDiv = document.getElementById('albumPhoto');
  const counter = document.getElementById('albumCounter');
  const photoPath = photoList[index];

  // 尝试加载真实图片
  const img = new Image();
  img.onload = function() {
    photoDiv.innerHTML = '<img src="' + photoPath + '" alt="旅游照片 ' + (index + 1) + '" style="width:100%;max-height:400px;object-fit:contain;border-radius:12px;">';
  };
  img.onerror = function() {
    // 图片不存在，显示占位提示
    photoDiv.innerHTML = '<div class="placeholder-box">📷 照片 ' + (index + 1) + '<br><small>请将图片放入 ' + photoPath + '</small></div>';
  };
  img.src = photoPath;

  counter.textContent = (index + 1) + ' / ' + totalPhotos;
}

/**
 * 上一张照片
 */
function prevPhoto() {
  if (!albumOpen) return;
  currentPhotoIndex = (currentPhotoIndex - 1 + totalPhotos) % totalPhotos;
  showPhoto(currentPhotoIndex);
}

/**
 * 下一张照片
 */
function nextPhoto() {
  if (!albumOpen) return;
  currentPhotoIndex = (currentPhotoIndex + 1) % totalPhotos;
  showPhoto(currentPhotoIndex);
}

// ============================================================
//  视频切换播放（与相册相同的左右切换模式）
// ============================================================

// 视频列表（文件位于 my-portfolio 根目录）
const videoList = [
  { src: '%E4%B9%9D%E7%8E%AF%E7%99%BD%E7%8E%89%E8%B9%80%E8%BA%9E%E5%B8%A6.mp4', name: '九环白玉蹀躞带' },
  { src: '%E7%8B%AC%E5%AD%A4%E4%BF%A1%E5%8D%B0%E5%A4%9A%E9%9D%A2%E4%BD%93%E7%85%A4%E7%B2%BE%E7%BB%84%E5%8D%B0.mp4', name: '独孤信印多面体煤精组印' }
];
let currentVideoIndex = 0;

/**
 * 切换并展示指定索引的视频
 * @param {number} index - 视频索引（从 0 开始）
 */
function showVideo(index) {
  currentVideoIndex = index;
  const item = videoList[index];
  const video = document.getElementById('mainVideo');

  // 先暂停当前视频，避免切换后旧视频声音残留
  video.pause();

  document.getElementById('videoTitle').textContent = item.name;
  document.getElementById('videoCounter').textContent = (index + 1) + ' / ' + videoList.length;

  video.src = item.src;
  video.load();
}

/**
 * 上一个视频
 */
function prevVideo() {
  showVideo((currentVideoIndex - 1 + videoList.length) % videoList.length);
}

/**
 * 下一个视频
 */
function nextVideo() {
  showVideo((currentVideoIndex + 1) % videoList.length);
}

// ============================================================
//  音乐播放
// ============================================================

/**
 * 播放/切换歌曲
 * 点击歌名即可播放，支持暂停/切换
 * @param {HTMLElement} item - 被点击的歌曲列表项
 */
function playSong(item) {
  const audio = document.getElementById('audioPlayer');
  const src = item.getAttribute('data-src');
  const songName = item.getAttribute('data-name') || '未知歌曲';

  // 如果点击的是同一首歌，切换播放/暂停
  if (currentAudio === item) {
    if (audio.paused) {
      audio.play().catch(function() {
        alert('⚠️ 音频文件不存在，请将 ' + songName + ' 的 .mp3 文件放入 audio/ 文件夹');
      });
      item.classList.add('playing');
      item.querySelector('i').className = 'fas fa-pause';
    } else {
      audio.pause();
      item.classList.remove('playing');
      item.querySelector('i').className = 'fas fa-play';
    }
    return;
  }

  // 切换歌曲：先恢复上一首歌的图标
  if (currentAudio) {
    currentAudio.classList.remove('playing');
    currentAudio.querySelector('i').className = 'fas fa-play';
  }

  // 设置新歌曲源
  audio.src = src;
  audio.load();

  // 尝试播放
  audio.play().then(function() {
    // 播放成功
    currentAudio = item;
    item.classList.add('playing');
    item.querySelector('i').className = 'fas fa-pause';
  }).catch(function() {
    // 文件不存在或无法播放
    alert('⚠️ 音频文件不存在，请将 .mp3 文件放入 audio/ 文件夹\n\n文件：' + src);
    currentAudio = null;
  });

  // 先标记为播放状态（成功时会保持，失败时 audio events 会重置）
  currentAudio = item;
  item.classList.add('playing');
  item.querySelector('i').className = 'fas fa-pause';
}

// （音频事件监听已合并到下方初始化 DOMContentLoaded 中）

// ============================================================
//  图片放大查看
// ============================================================

/**
 * 放大查看图片
 * @param {HTMLElement} card - 被点击的证书/图片卡片
 */
function zoomImage(card) {
  const overlay = document.getElementById('imageOverlay');
  const content = document.getElementById('overlayContent');

  // 获取卡片中的图片
  const img = card.querySelector('img');
  if (img) {
    // 如果有真实图片，显示原图
    content.innerHTML = '<img src="' + img.src + '" alt="放大查看">';
  } else {
    // 占位情况：复制卡片内容并放大
    content.innerHTML = card.innerHTML;
  }

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';  // 禁止背景滚动
}

/**
 * 关闭放大查看
 */
function closeZoom() {
  const overlay = document.getElementById('imageOverlay');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';  // 恢复背景滚动
}

// ESC 键关闭放大
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const overlay = document.getElementById('imageOverlay');
    if (!overlay.classList.contains('hidden')) {
      closeZoom();
    }
  }
});

// ============================================================
//  论文详情弹窗
// ============================================================
function openPaperDetail() {
  const modal = document.getElementById('paperModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePaperDetail() {
  const modal = document.getElementById('paperModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ESC 关闭论文弹窗（合并到已有 ESC 监听中）
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const paperModal = document.getElementById('paperModal');
    if (paperModal && !paperModal.classList.contains('hidden')) {
      closePaperDetail();
    }
  }
});

// ============================================================
//  公众号推文长图加载
// ============================================================
function loadArticleImage(screenId, imagePath) {
  const screen = document.getElementById(screenId);
  if (!screen) return;

  const img = new Image();
  img.onload = function() {
    screen.innerHTML = '<img src="' + imagePath + '" alt="推文长图" style="width:100%;height:auto;display:block;">';
  };
  img.onerror = function() {
    // 图片不存在，保持占位内容不变
  };
  img.src = imagePath;
}

// ============================================================
//  初始化（页面加载完成后执行）
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // 1. 设置当前页面为封面
  currentPage = 'cover';

  // 2. 设置音频播放器事件
  var audio = document.getElementById('audioPlayer');
  if (audio) {
    audio.addEventListener('error', function() {
      if (currentAudio) {
        currentAudio.classList.remove('playing');
        currentAudio.querySelector('i').className = 'fas fa-play';
        currentAudio = null;
      }
    });
    audio.addEventListener('ended', function() {
      if (currentAudio) {
        currentAudio.classList.remove('playing');
        currentAudio.querySelector('i').className = 'fas fa-play';
        currentAudio = null;
      }
    });
    audio.addEventListener('pause', function() {
      if (currentAudio) {
        currentAudio.classList.remove('playing');
        currentAudio.querySelector('i').className = 'fas fa-play';
      }
    });
    audio.addEventListener('play', function() {
      if (currentAudio) {
        currentAudio.classList.add('playing');
        currentAudio.querySelector('i').className = 'fas fa-pause';
      }
    });
  }

  // 3. 尝试加载公众号推文长图
  loadArticleImage('article1Screen', '%E4%B8%96%E7%95%8C%E5%8F%B2%E9%87%87%E8%AE%BF.png');
  loadArticleImage('article2Screen', '%E4%BF%9D%E7%A0%94%E8%80%83%E7%A0%94%E5%88%86%E4%BA%AB.png');
});

// ============================================================
//  PDF 导出模式（仅当 URL 带 ?pdf= 参数时生效）
//  用法：index.html?pdf=cover | toc | thanks | social | design
//        | writing1 | paper | video1 | video2 | volunteer
//  配合 export_pdf.sh 使用，将各页面导出为 A4 规格的 PDF
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var pdfKey = params.get('pdf');
  if (!pdfKey) return;

  document.body.classList.add('pdf-mode');
  document.body.setAttribute('data-pdf', pdfKey);

  /**
   * 只激活指定页面，其余全部隐藏
   * @param {string} pageId - 目标页面 ID
   */
  function activateOnly(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.toggle('active', pages[i].id === pageId);
    }
    currentPage = pageId;
  }

  /**
   * 隐藏指定的子模块
   * @param {string[]} ids - 要隐藏的元素 ID 列表
   */
  function hideSubModules(ids) {
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  /**
   * 视频页：截取视频画面作为静态图放入 PDF
   * @param {number} index - videoList 中的索引
   */
  function prepareVideo(index) {
    var video = document.getElementById('mainVideo');
    var item = videoList[index];

    // 更新标题（HTML 中默认写死的是第一个视频的名字）
    var titleEl = document.getElementById('videoTitle');
    if (titleEl) titleEl.textContent = item.name;

    video.src = item.src;
    video.preload = 'auto';
    video.muted = true;      // 静音，避免播放策略干扰
    video.load();

    var done = false;

    function tryCapture() {
      if (done) return;
      if (!video.videoWidth || !video.videoHeight) return;  // 元数据未就绪
      done = true;
      try {
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        var img = document.createElement('img');
        img.className = 'video-frame-img';
        img.alt = item.name;
        // 按打印最大尺寸（620x560）等比缩放，并写死像素宽高，
        // 避免浏览器分页时按原始尺寸计算导致画面被挤到下一页
        var scale = Math.min(1, 620 / video.videoWidth, 560 / video.videoHeight);
        img.style.width = Math.round(video.videoWidth * scale) + 'px';
        img.style.height = Math.round(video.videoHeight * scale) + 'px';
        img.src = canvas.toDataURL('image/jpeg', 0.85);
        video.replaceWith(img);
      } catch (e) {
        done = false;  // 截图失败：保留视频元素，由浏览器打印时渲染
      }
    }

    // 跳到 2 秒处截图，避开片头黑场
    video.addEventListener('loadeddata', function() {
      try { video.currentTime = 2; } catch (e) {}
    });
    video.addEventListener('seeked', tryCapture);

    // 兜底：4 秒后取当前帧；8 秒后再尝试一次 seek
    setTimeout(function() { if (!done) tryCapture(); }, 4000);
    setTimeout(function() {
      if (!done) { try { video.currentTime = 2; } catch (e) {} }
    }, 8000);
  }

  // ---------- 各导出页面的配置 ----------
  var paperCard, modalContent;

  switch (pdfKey) {

    case 'cover':
      activateOnly('cover');
      break;

    case 'toc':
      activateOnly('toc');
      break;

    case 'thanks':
      activateOnly('thanks');
      break;

    case 'social':  // 模块2 · 社媒运营
      activateOnly('module2');
      hideSubModules(['article1', 'article2', 'photo-video']);
      break;

    case 'design':  // 模块2 · 设计排版（公众号推文）
      activateOnly('module2');
      hideSubModules(['social-media', 'article2', 'photo-video']);
      break;

    case 'writing1':  // 模块2 · 文案写作：校园活动推文
      activateOnly('module2');
      hideSubModules(['social-media', 'article1', 'photo-video']);
      paperCard = document.querySelector('#article2 .article-card:last-child');
      if (paperCard) paperCard.style.display = 'none';
      break;

    case 'paper':  // 模块2 · 文案写作：史学论文（展开弹窗内容）
      activateOnly('module2');
      hideSubModules(['social-media', 'article1', 'photo-video']);
      paperCard = document.querySelector('#article2 .article-card:first-child');
      if (paperCard) paperCard.style.display = 'none';

      // 移除“查看详情”按钮，把弹窗正文搬进卡片
      var paperBody = document.querySelector('#article2 .article-card:last-child');
      if (paperBody) {
        var detailBtn = paperBody.querySelector('.btn-detail');
        if (detailBtn) detailBtn.remove();

        modalContent = document.getElementById('paperModal').querySelector('.modal-content');
        if (modalContent) {
          var clone = modalContent.cloneNode(true);
          var removeList = clone.querySelectorAll('.modal-close, .modal-title, .modal-meta, .article-tags');
          removeList.forEach(function(el) { el.remove(); });
          var wrap = document.createElement('div');
          wrap.className = 'article-card-body';
          while (clone.firstChild) wrap.appendChild(clone.firstChild);
          paperBody.appendChild(wrap);
        }
      }
      break;

    case 'video1':  // 模块2 · 视频作品 1
      activateOnly('module2');
      hideSubModules(['social-media', 'article1', 'article2']);
      prepareVideo(0);
      break;

    case 'video2':  // 模块2 · 视频作品 2
      activateOnly('module2');
      hideSubModules(['social-media', 'article1', 'article2']);
      prepareVideo(1);
      break;

    case 'volunteer':  // 模块3 · 志愿活动
      activateOnly('module3');
      hideSubModules(['game-anime', 'music']);
      break;

    default:
      break;
  }
});
