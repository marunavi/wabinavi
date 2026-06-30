/* ============================================================
   わびなび CMS — ダッシュボード（記事一覧）
   LocalStorage の記事を一覧表示し、編集・プレビュー・複製・削除・公開書き出しを行う。
   ※ このファイルは不足していたため新規作成しました。
   ============================================================ */
(function () {
  'use strict';
  WabiStore.requireAuth();

  var currentFilter = 'all';

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function statusLabel(s) { return s === 'published' ? '公開中' : '下書き'; }

  function render() {
    var all = WabiStore.getArticles();
    var list = all.filter(function (a) {
      return currentFilter === 'all' ? true : a.status === currentFilter;
    });
    var el = $('list');

    if (!list.length) {
      el.innerHTML = '<div class="empty"><div class="ico">◔</div>' +
        (all.length ? 'この区分の記事はありません' : 'まだ記事がありません。「＋ 新規投稿」から作成してください') +
        '</div>';
      return;
    }

    el.innerHTML = list.map(function (a) {
      var title = (a.title || '無題').replace(/\n/g, ' ');
      var thumb = a.hero
        ? '<img src="' + esc(a.hero) + '" alt="">'
        : '';
      var meta = [];
      if (a.category) meta.push(esc(a.category));
      if (a.date) meta.push(esc(a.date));
      if (a.slug) meta.push('/' + esc(a.slug));
      return '<div class="art-item" data-id="' + esc(a.id) + '">' +
        '<div class="art-thumb">' + thumb + '</div>' +
        '<div class="art-main">' +
          '<span class="art-status ' + esc(a.status) + '">' + statusLabel(a.status) + '</span>' +
          '<div class="art-title">' + esc(title) + '</div>' +
          '<div class="art-meta">' + meta.join(' ・ ') + '</div>' +
          '<div class="art-ops">' +
            '<button class="art-op" data-act="edit">編集</button>' +
            '<button class="art-op" data-act="preview">プレビュー</button>' +
            '<button class="art-op" data-act="dup">複製</button>' +
            '<button class="art-op del" data-act="del">削除</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    bindOps();
  }

  function bindOps() {
    $('list').querySelectorAll('.art-item').forEach(function (item) {
      var id = item.getAttribute('data-id');
      item.querySelectorAll('.art-op').forEach(function (btn) {
        btn.onclick = function () {
          var act = btn.getAttribute('data-act');
          if (act === 'edit') {
            location.href = 'editor.html?id=' + encodeURIComponent(id);
          } else if (act === 'preview') {
            openPreview(id);
          } else if (act === 'dup') {
            WabiStore.duplicate(id);
            toast('複製しました');
            render();
          } else if (act === 'del') {
            if (confirm('この記事を削除します。よろしいですか？')) {
              WabiStore.remove(id);
              toast('削除しました');
              render();
            }
          }
        };
      });
    });
  }

  // ── プレビュー（記事ページを iframe で表示） ──
  function openPreview(id) {
    var a = WabiStore.getArticle(id);
    if (!a) return;
    sessionStorage.setItem('wabinavi_preview', JSON.stringify(a));
    var frame = $('previewFrame');
    frame.src = '../articles/article.html?preview=1&t=' + Date.now();
    $('previewModal').classList.add('show');
  }
  $('previewClose').onclick = function () {
    $('previewModal').classList.remove('show');
    $('previewFrame').src = '';
  };

  // ── タブ（すべて／公開中／下書き） ──
  $('tabs').querySelectorAll('.dash-tab').forEach(function (tab) {
    tab.onclick = function () {
      $('tabs').querySelectorAll('.dash-tab').forEach(function (t) { t.classList.remove('on'); });
      tab.classList.add('on');
      currentFilter = tab.getAttribute('data-filter');
      render();
    };
  });

  // ── ログアウト ──
  $('logoutBtn').onclick = function () {
    WabiStore.logout();
    location.href = 'login.html';
  };

  // ── articles.json 書き出し（公開記事のみ） ──
  $('exportBtn').onclick = function () {
    var n = WabiStore.exportJson();
    if (n > 0) {
      toast(n + '件の公開記事を articles.json に書き出しました');
    } else {
      toast('公開中の記事がありません（記事を「公開」にしてください）');
    }
  };

  render();
})();
