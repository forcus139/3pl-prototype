/* ── Window Tab State ── */
function closeWindowTab(btn, currentFile) {
  var file = btn.dataset.tabClose;
  var tabs;
  try { tabs = JSON.parse(sessionStorage.getItem('pcOpenTabs') || '[]'); }
  catch(e) { tabs = []; }
  tabs = tabs.filter(function(t) { return t !== file; });
  sessionStorage.setItem('pcOpenTabs', JSON.stringify(tabs));
  if (file === currentFile) {
    if (tabs.length > 0) {
      window.location.href = tabs[tabs.length - 1];
    } else {
      window.location.href = 'index.html';
    }
  }
}
function getAllPageNames() {
  var map = {};
  pcMenu.forEach(function(g) {
    g.items.forEach(function(item) {
      map[item.file] = item.name;
    });
  });
  return map;
}

function getOpenTabs() {
  try { return JSON.parse(sessionStorage.getItem('pcOpenTabs') || '[]'); }
  catch(e) { return []; }
}

function setOpenTabs(tabs) {
  sessionStorage.setItem('pcOpenTabs', JSON.stringify(tabs));
}

function addOpenTab(file) {
  var tabs = getOpenTabs();
  if (!tabs.some(function(t) { return t === file; })) {
    tabs.push(file);
    setOpenTabs(tabs);
  }
}

function removeOpenTab(file) {
  var tabs = getOpenTabs();
  tabs = tabs.filter(function(t) { return t !== file; });
  setOpenTabs(tabs);
  return tabs;
}

function renderWindowTabs(currentFile) {
  var nameMap = getAllPageNames();
  var tabs = getOpenTabs();
  if (tabs.length === 0) return '';
  return '<div class="window-tabs">' + tabs.map(function(f) {
    var isActive = f === currentFile;
    var name = nameMap[f] || f.replace('.html', '').replace('pc-', '');
    return '<div class="window-tab' + (isActive ? ' active' : '') + '" data-tab-file="' + f + '">' +
      '<span class="window-tab-name">' + name + '</span>' +
      '<span class="window-tab-close" data-tab-close="' + f + '" onclick="closeWindowTab(this,\'' + currentFile + '\')">✕</span>' +
    '</div>';
  }).join('') + '</div>';
}

function bindWindowTabEvents(currentFile) {
  document.querySelectorAll('.window-tab').forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      if (e.target.classList.contains('window-tab-close')) return;
      var file = tab.dataset.tabFile;
      if (file && file !== currentFile) {
        window.location.href = file;
      }
    });
    tab.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showTabContextMenu(e.clientX, e.clientY, tab.dataset.tabFile, currentFile);
    });
  });
  document.querySelectorAll('.window-tab-close').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var file = btn.dataset.tabClose;
      var remaining = removeOpenTab(file);
      if (file === currentFile) {
        if (remaining.length > 0) {
          window.location.href = remaining[remaining.length - 1];
        } else {
          window.location.href = 'index.html';
        }
      }
    });
  });
  document.addEventListener('click', hideTabContextMenu);
}

function showTabContextMenu(x, y, tabFile, currentFile) {
  hideTabContextMenu();
  var menu = document.createElement('div');
  menu.className = 'tab-context-menu';
  var nameMap = getAllPageNames();
  var tabs = getOpenTabs();
  var items = [
    { label: '首页', cls: 'home-item', action: function() { window.location.href = 'pc-dashboard.html'; } },
    { sep: true },
    { label: '刷新页面\u21BB', action: function() { location.reload(); } },
    { label: '关闭其他', action: function() {
      var name = nameMap[tabFile] || tabFile;
      setOpenTabs([tabFile]);
      if (tabFile !== currentFile) { window.location.href = tabFile; }
      else { hideTabContextMenu(); renderWindowTabsInPlace(currentFile); }
    }},
    { label: '关闭右侧\u2192', action: function() {
      var idx = tabs.indexOf(tabFile);
      if (idx >= 0) { tabs = tabs.slice(0, idx + 1); setOpenTabs(tabs); }
      if (tabs.indexOf(currentFile) < 0) { window.location.href = tabFile; }
      else { hideTabContextMenu(); renderWindowTabsInPlace(currentFile); }
    }},
    { label: '全部关闭', action: function() {
      setOpenTabs([]);
      window.location.href = 'index.html';
    }}
  ];
  items.forEach(function(item) {
    if (item.sep) { var sep = document.createElement('div'); sep.className = 'tab-context-menu-sep'; menu.appendChild(sep); return; }
    var el = document.createElement('div');
    el.className = 'tab-context-menu-item' + (item.cls ? ' ' + item.cls : '');
    el.textContent = item.label;
    el.addEventListener('click', function(e) { e.stopPropagation(); item.action(); });
    menu.appendChild(el);
  });
  document.body.appendChild(menu);
  var mw = menu.offsetWidth, mh = menu.offsetHeight;
  if (x + mw > window.innerWidth) x = window.innerWidth - mw - 4;
  if (y + mh > window.innerHeight) y = window.innerHeight - mh - 4;
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function hideTabContextMenu() {
  var m = document.querySelector('.tab-context-menu');
  if (m) m.remove();
}

function renderWindowTabsInPlace(currentFile) {
  var container = document.querySelector('.window-tabs');
  if (container) {
    var tmp = document.createElement('div');
    tmp.innerHTML = renderWindowTabs(currentFile);
    var newTabs = tmp.querySelector('.window-tabs');
    if (newTabs) {
      container.parentNode.replaceChild(newTabs, container);
      bindWindowTabEvents(currentFile);
    }
  }
}

const pcMenuIcons = {
  "首页工作台": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  "组织管理": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  "供应商档案": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  "新品录入单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  "商品信息": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  "配送仓管理": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  "车辆管理": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  "仓库关系表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="10" y1="16" x2="14" y2="16"/></svg>',
  "门店要货周期定义表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
  "标准时效": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  "货主档案": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  "货主供应商": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  "客户档案": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  "客户门店档案": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  "货主客户关系": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="5" r="3"/><path d="M6 21v-2a4 4 0 0 1 4-4h0"/><path d="M18 21v-2a4 4 0 0 0-4-4h0"/></svg>',
  "货主仓库关系表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  "客户门店仓库关系表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="9" y1="18" x2="15" y2="18"/></svg>',
  "客户要货单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  "入库申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/><path d="M3 3h18v18H3z" stroke="none"/></svg>',
  "入库通知单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="2.01"/></svg>',
  "退货申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  "退货通知单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><polyline points="1 4 1 10 7 10"/></svg>',
  "退仓申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 6 15 11"/><line x1="12" y1="6" x2="12" y2="18"/></svg>',
  "退仓通知单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><polyline points="9 11 12 6 15 11"/></svg>',
  "转货主申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  "物权转移通知单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><polyline points="17 1 21 5 17 9"/></svg>',
  "入库单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/></svg>',
  "配送单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  "退货单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 13 12 18 17 13"/><polyline points="17 11 12 6 7 11"/></svg>',
  "退仓单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 6 15 11"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  "调拨单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
  "损溢单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  "库存地点调整单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="8" height="6" rx="1"/><rect x="14" y="6" width="8" height="6" rx="1"/><path d="M10 9h4"/><path d="M10 15l4 0"/><path d="M7 12v6"/><path d="M17 12v6"/><rect x="3" y="15" width="6" height="5" rx="1"/><rect x="15" y="15" width="6" height="5" rx="1"/></svg>',
  "物权转移单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  "库存台账": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  "盘点结果单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
  "盘点计划申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
  "盘点通知单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="5"/></svg>',
  "配送发货申请": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  "运输服务申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M15 6l2 2-2 2"/><path d="M17 8H9"/></svg>',
  "差错申请单": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  "出入库记录": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  "审批中心": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  "报表中心": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  "运营综合报表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  "配送履约报表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><polyline points="9 11 12 14 22 4"/></svg>',
  "库存分析报表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="3.27" y1="6.96" x2="12" y2="12.01"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  "财务对账报表": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  "财务协同": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  "质检报告": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  "接口日志": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>'
};

const pcMenu = [
  { group: "首页", items: [{ file: "pc-dashboard.html", name: "首页工作台" }] },
  { group: "基础信息", items: [
    { file: "pc-org.html", name: "组织管理" },
    { file: "pc-supplier.html", name: "供应商档案" },
    { file: "pc-newproduct.html", name: "新品录入单" },
    { file: "pc-productinfo.html", name: "商品信息" },
    { file: "pc-warehouse.html", name: "配送仓管理" },
    { file: "pc-vehicle.html", name: "车辆管理" },
    { file: "pc-sla.html", name: "标准时效" },
    { file: "pc-warehouserelation.html", name: "仓库关系表" },
    { file: "pc-storeordercycle.html", name: "门店要货周期定义表" }
  ] },
  { group: "货主管理", items: [
    { file: "pc-owner.html", name: "货主档案" },
    { file: "pc-customer.html", name: "客户档案" },
    { file: "pc-ownersupplier.html", name: "货主供应商" },
    { file: "pc-customerstore.html", name: "客户门店档案" },
    { file: "pc-ownercustomer.html", name: "货主客户关系" },
    { file: "pc-ownerwarehouse.html", name: "货主仓库关系表" },
    { file: "pc-customerstorerelation.html", name: "客户门店仓库关系表" }
  ] },
  { group: "业务管理", items: [
    { file: "pc-demand.html", name: "客户要货单" },
    { file: "pc-inbound.html", name: "入库申请单" },
    { file: "pc-inboundnotice.html", name: "入库通知单" },
    { file: "pc-returnapply.html", name: "退货申请单" },
    { file: "pc-returnnotice.html", name: "退货通知单" },
    { file: "pc-delivery.html", name: "配送发货申请" },
    { file: "pc-errororder.html", name: "差错申请单" },
    { file: "pc-transportservice.html", name: "运输服务申请单" },
    { file: "pc-qualityreport.html", name: "质检报告" },
    { file: "pc-returnapplyin.html", name: "退仓申请单" },
    { file: "pc-returnnoticein.html", name: "退仓通知单" },
    { file: "pc-ownershipapply.html", name: "转货主申请单" },
    { file: "pc-ownershipnotice.html", name: "物权转移通知单" },
    { file: "pc-inventoryplan.html", name: "盘点计划申请单" },
    { file: "pc-inventorynotify.html", name: "盘点通知单" }
  ] },
  { group: "仓储管理", items: [
    { file: "pc-purchasein.html", name: "入库单" },
    { file: "pc-deliveryorder.html", name: "配送单" },
    { file: "pc-purchasereturn.html", name: "退货单" },
    { file: "pc-return.html", name: "退仓单" },
    { file: "pc-transfer.html", name: "调拨单" },
    { file: "pc-loss.html", name: "损溢单" },
    { file: "pc-positionadjust.html", name: "库存地点调整单" },
    { file: "pc-inventorycheck.html", name: "盘点结果单" },
    { file: "pc-ownership.html", name: "物权转移单" },
    { file: "pc-inventory.html", name: "库存台账" },
    { file: "pc-inoutrecord.html", name: "出入库记录" }
  ] },
  { group: "报表中心", items: [
    { file: "pc-reportcenter.html", name: "运营综合报表" },
    { file: "pc-reportcenter.html", name: "配送履约报表" },
    { file: "pc-reportcenter.html", name: "库存分析报表" },
    { file: "pc-reportcenter.html", name: "财务对账报表" }
  ] },
  { group: "运营支撑", items: [
    { file: "pc-approval.html", name: "审批中心" },
    { file: "pc-finance.html", name: "财务协同" },
    { file: "pc-logs.html", name: "接口日志" }
  ] }
];

const pcDemoRoutes = {
  dashboard: [
    { label: "客户要货单", file: "pc-demand.html" },
    { label: "配送发货申请", file: "pc-delivery.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  demand: [
    { label: "配送发货申请", file: "pc-delivery.html" },
    { label: "审批中心", file: "pc-approval.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  newproduct: [
    { label: "审批中心", file: "pc-approval.html" },
    { label: "商品信息", file: "pc-productinfo.html" }
  ],
  newproductcreate: [
    { label: "新品编辑页", file: "pc-newproduct-edit.html" },
    { label: "审批中心", file: "pc-approval.html" },
    { label: "商品信息", file: "pc-productinfo.html" }
  ],
  newproductedit: [
    { label: "审批中心", file: "pc-approval.html" },
    { label: "商品信息", file: "pc-productinfo.html" },
    { label: "新品录入单", file: "pc-newproduct.html" }
  ],
  
  inbound: [
    { label: "入库通知单", file: "pc-inboundnotice.html" },
    { label: "入库单", file: "pc-purchasein.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  inboundnotice: [
    { label: "入库单", file: "pc-purchasein.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  purchasein: [
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  returnapply: [
    { label: "退货通知单", file: "pc-returnnotice.html" },
    { label: "退货单", file: "pc-purchasereturn.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  returnnotice: [
    { label: "退货单", file: "pc-purchasereturn.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  purchasereturn: [
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  qualityreport: [
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  delivery: [
    { label: "退仓申请单", file: "pc-returnapplyin.html" },
    { label: "退仓通知单", file: "pc-returnnoticein.html" },
    { label: "退仓单", file: "pc-return.html" }
  ],
  deliveryorder: [
    { label: "配送发货申请", file: "pc-delivery.html" },
    { label: "差错申请单", file: "pc-errororder.html" },
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  transportservice: [
    { label: "配送发货申请", file: "pc-delivery.html" },
    { label: "接口日志", file: "pc-logs.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  returnapplyin: [
    { label: "退仓通知单", file: "pc-returnnoticein.html" },
    { label: "退仓单", file: "pc-return.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  returnnoticein: [
    { label: "退仓单", file: "pc-return.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  return: [
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  transfer: [
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  loss: [
    { label: "审批中心", file: "pc-approval.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  inventoryplan: [
    { label: "盘点通知单", file: "pc-inventorynotify.html" },
    { label: "盘点结果单", file: "pc-inventorycheck.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  inventorynotify: [
    { label: "盘点结果单", file: "pc-inventorycheck.html" },
    { label: "接口日志", file: "pc-logs.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  inventorycheck: [
    { label: "盘点计划申请单", file: "pc-inventoryplan.html" },
    { label: "盘点通知单", file: "pc-inventorynotify.html" },
    { label: "损溢单", file: "pc-loss.html" },
    { label: "库存地点调整单", file: "pc-positionadjust.html" },
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  ownershipapply: [
    { label: "物权转移通知单", file: "pc-ownershipnotice.html" },
    { label: "物权转移单", file: "pc-ownership.html" },
    { label: "财务协同", file: "pc-finance.html" }
  ],
  ownershipnotice: [
    { label: "物权转移单", file: "pc-ownership.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  ownership: [
    { label: "审批中心", file: "pc-approval.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  inoutrecord: [
    { label: "库存台账", file: "pc-inventory.html" },
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" }
  ],
  inventory: [
    { label: "商品信息", file: "pc-productinfo.html" },
    { label: "货主信息表", file: "pc-owner.html" },
    { label: "客户信息", file: "pc-customer.html" },
    { label: "货主仓库关系表", file: "pc-ownerwarehouse.html" }
  ],
  org: [
    { label: "供应商档案", file: "pc-supplier.html" },
    { label: "配送仓管理", file: "pc-warehouse.html" },
    { label: "货主档案", file: "pc-owner.html" }
  ],
  supplier: [
    { label: "组织管理", file: "pc-org.html" },
    { label: "商品信息", file: "pc-productinfo.html" },
    { label: "货主档案", file: "pc-owner.html" }
  ],
  warehouse: [
    { label: "车辆管理", file: "pc-vehicle.html" },
    { label: "货主仓库关系表", file: "pc-ownerwarehouse.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  vehicle: [
    { label: "配送仓管理", file: "pc-warehouse.html" },
    { label: "标准时效", file: "pc-sla.html" },
    { label: "配送发货申请", file: "pc-delivery.html" }
  ],
  sla: [
    { label: "配送仓管理", file: "pc-warehouse.html" },
    { label: "车辆管理", file: "pc-vehicle.html" },
    { label: "配送发货申请", file: "pc-delivery.html" }
  ],
  storeordercycle: [
    { label: "客户门店档案", file: "pc-customerstore.html" },
    { label: "客户要货单", file: "pc-demand.html" },
    { label: "客户门店仓库关系表", file: "pc-customerstorerelation.html" }
  ],
  productinfo: [
    { label: "新品录入单", file: "pc-newproduct.html" },
    { label: "货主信息表", file: "pc-owner.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  owner: [
    { label: "商品信息", file: "pc-productinfo.html" },
    { label: "客户信息", file: "pc-customer.html" },
    { label: "货主客户关系表", file: "pc-ownercustomer.html" },
    { label: "货主仓库关系表", file: "pc-ownerwarehouse.html" }
  ],
  ownersupplier: [
    { label: "货主档案", file: "pc-owner.html" },
    { label: "供应商档案", file: "pc-supplier.html" },
    { label: "入库申请单", file: "pc-inbound.html" }
  ],
  customer: [
    { label: "货主客户关系表", file: "pc-ownercustomer.html" },
    { label: "客户门店档案", file: "pc-customerstore.html" },
    { label: "客户要货单", file: "pc-demand.html" }
  ],
  customerstore: [
    { label: "客户档案", file: "pc-customer.html" },
    { label: "客户要货单", file: "pc-demand.html" },
    { label: "配送发货申请", file: "pc-delivery.html" }
  ],
  ownercustomer: [
    { label: "客户要货单", file: "pc-demand.html" },
    { label: "货主仓库关系表", file: "pc-ownerwarehouse.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  ownerwarehouse: [
    { label: "入库申请单", file: "pc-inbound.html" },
    { label: "调拨单", file: "pc-transfer.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  customerstorerelation: [
    { label: "客户门店档案", file: "pc-customerstore.html" },
    { label: "客户要货单", file: "pc-demand.html" },
    { label: "货主仓库关系表", file: "pc-ownerwarehouse.html" }
  ],
  approval: [
    { label: "财务协同", file: "pc-finance.html" },
    { label: "接口日志", file: "pc-logs.html" },
    { label: "首页工作台", file: "pc-dashboard.html" }
  ],
  finance: [
    { label: "接口日志", file: "pc-logs.html" },
    { label: "首页工作台", file: "pc-dashboard.html" },
    { label: "库存台账", file: "pc-inventory.html" }
  ],
  logs: [
    { label: "财务协同", file: "pc-finance.html" },
    { label: "首页工作台", file: "pc-dashboard.html" },
    { label: "审批中心", file: "pc-approval.html" }
  ]
};

const miniMenu = [
  { file: "mini-home.html", name: "首页" },
  { file: "mini-todo.html", name: "待办" },
  { file: "mini-apply.html", name: "客户要货申请" },
  { file: "mini-inboundapply.html", name: "入库申请" },
  { file: "mini-returnapply.html", name: "退货申请" },
  { file: "mini-return.html", name: "退仓申请" },
  { file: "mini-loss.html", name: "损溢申请" },
  { file: "mini-ownershipapply.html", name: "物权转移申请" },
  { file: "mini-transfer.html", name: "调拨单" },
  { file: "mini-inventory.html", name: "库存查询" },
  { file: "mini-message.html", name: "消息中心" },
  { file: "mini-detail.html", name: "单据详情" }
];

const miniDemoRoutes = {
  home: [
    { label: "待办", file: "mini-todo.html" },
    { label: "客户要货申请", file: "mini-apply.html" },
    { label: "单据详情", file: "mini-detail.html" }
  ],
  todo: [
    { label: "客户要货申请", file: "mini-apply.html" },
    { label: "退仓申请", file: "mini-return.html" },
    { label: "损溢申请", file: "mini-loss.html" }
  ],
  apply: [
    { label: "入库申请", file: "mini-inboundapply.html" },
    { label: "退货申请", file: "mini-returnapply.html" },
    { label: "退仓申请", file: "mini-return.html" }
  ],
  inboundapply: [
    { label: "退货申请", file: "mini-returnapply.html" },
    { label: "物权转移申请", file: "mini-ownershipapply.html" },
    { label: "待办", file: "mini-todo.html" }
  ],
  returnapply: [
    { label: "退仓申请", file: "mini-return.html" },
    { label: "物权转移申请", file: "mini-ownershipapply.html" },
    { label: "待办", file: "mini-todo.html" }
  ],
  return: [
    { label: "物权转移申请", file: "mini-ownershipapply.html" },
    { label: "单据详情", file: "mini-detail.html" },
    { label: "库存查询", file: "mini-inventory.html" }
  ],
  ownershipapply: [
    { label: "单据详情", file: "mini-detail.html" },
    { label: "库存查询", file: "mini-inventory.html" },
    { label: "待办", file: "mini-todo.html" }
  ],
  loss: [
    { label: "待办", file: "mini-todo.html" },
    { label: "单据详情", file: "mini-detail.html" },
    { label: "消息中心", file: "mini-message.html" }
  ],
  transfer: [
    { label: "单据详情", file: "mini-detail.html" },
    { label: "库存查询", file: "mini-inventory.html" },
    { label: "消息中心", file: "mini-message.html" }
  ],
  inventory: [
    { label: "单据详情", file: "mini-detail.html" },
    { label: "消息中心", file: "mini-message.html" },
    { label: "首页", file: "mini-home.html" }
  ],
  message: [
    { label: "待办", file: "mini-todo.html" },
    { label: "单据详情", file: "mini-detail.html" },
    { label: "首页", file: "mini-home.html" }
  ],
  detail: [
    { label: "消息中心", file: "mini-message.html" },
    { label: "库存查询", file: "mini-inventory.html" },
    { label: "首页", file: "mini-home.html" }
  ]
};

const miniStageConfigs = {
  apply: [
    { key: "apply", label: "基础信息", file: "mini-apply.html" },
    { key: "applygoods", label: "商品录入", file: "mini-applygoods.html" },
    { key: "applygoodsreview", label: "已录入商品", file: "mini-applygoodsreview.html" }
  ],
  inboundapply: [
    { key: "inboundapply", label: "基础信息", file: "mini-inboundapply.html" },
    { key: "inboundapplygoods", label: "商品录入", file: "mini-inboundapplygoods.html" },
    { key: "inboundapplygoodsreview", label: "已录入商品", file: "mini-inboundapplygoodsreview.html" }
  ],
  returnapply: [
    { key: "returnapply", label: "基础信息", file: "mini-returnapply.html" },
    { key: "returnapplygoods", label: "商品录入", file: "mini-returnapplygoods.html" },
    { key: "returnapplygoodsreview", label: "已录入商品", file: "mini-returnapplygoodsreview.html" }
  ],
  return: [
    { key: "return", label: "基础信息", file: "mini-return.html" },
    { key: "returngoods", label: "商品录入", file: "mini-returngoods.html" },
    { key: "returngoodsreview", label: "已录入商品", file: "mini-returngoodsreview.html" }
  ],
  loss: [
    { key: "loss", label: "基础信息", file: "mini-loss.html" },
    { key: "lossgoods", label: "异常商品", file: "mini-lossgoods.html" },
    { key: "lossgoodsreview", label: "已录入商品", file: "mini-lossgoodsreview.html" }
  ],
  ownershipapply: [
    { key: "ownershipapply", label: "基础信息", file: "mini-ownershipapply.html" },
    { key: "ownershipapplygoods", label: "商品录入", file: "mini-ownershipapplygoods.html" },
    { key: "ownershipapplygoodsreview", label: "已录入商品", file: "mini-ownershipapplygoodsreview.html" }
  ],
  scan: [
    { key: "scan", label: "扫码概览", file: "mini-scan.html" },
    { key: "scanresult", label: "识别结果", file: "mini-scanresult.html" }
  ],
  selectgoods: [
    { key: "selectgoods", label: "候选商品", file: "mini-selectgoods.html" },
    { key: "selectgoodsresult", label: "已选结果", file: "mini-selectgoodsresult.html" }
  ],
  uploadvoucher: [
    { key: "uploadvoucher", label: "上传入口", file: "mini-uploadvoucher.html" },
    { key: "uploadvoucherresult", label: "文件结果", file: "mini-uploadvoucherresult.html" }
  ]
};

const pcPages = {
  dashboard: {
    title: "首页工作台",
    desc: "运营总览、待办、异常预警和建议演示路径。",
    actions: ["刷新看板", "导出日报"],
    content: `
      <div class="db-notice">
        <div class="db-notice-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div class="db-notice-body">
          <div class="db-notice-title">今日运营概览</div>
          <div class="db-notice-desc">重点关注客户要货履约、WMS回传时效和BMS财务回执。建议按 <strong>首页 → 客户要货 → 配送 → 财务协同 → 接口日志</strong> 的路径演示。</div>
        </div>
        <div class="db-notice-time">更新于 09:30</div>
      </div>

      <div class="db-kpi-grid">
        <div class="db-kpi-card db-kpi-blue">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">待履约客户要货单</div>
            <div class="db-kpi-value" style="color:#2563eb;">128</div>
            <div class="db-kpi-trend db-trend-up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 7H2L6 2Z"/></svg>
              较昨日 +18
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,22 12,18 22,20 32,14 42,16 52,10 62,8" fill="none" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-green">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">今日出库量</div>
            <div class="db-kpi-value" style="color:#0D904F;">3,560</div>
            <div class="db-kpi-trend db-trend-up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 7H2L6 2Z"/></svg>
              履约准时率 97.3%
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,20 12,16 22,18 32,12 42,10 52,8 62,6" fill="none" stroke="#0D904F" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-red">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">接口异常数</div>
            <div class="db-kpi-value" style="color:#D93025;">7</div>
            <div class="db-kpi-trend db-trend-danger">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="3"/></svg>
              待处理 3 项高优先
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,16 12,14 22,18 32,12 42,16 52,10 62,14" fill="none" stroke="#D93025" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-amber">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">库存预警项</div>
            <div class="db-kpi-value" style="color:#B45309;">46</div>
            <div class="db-kpi-trend db-trend-warn">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 7H2L6 2Z"/></svg>
              待检/残次/损溢
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,18 12,14 22,20 32,16 42,12 52,18 62,10" fill="none" stroke="#B45309" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>
      </div>

      <!-- Extended KPI Row: 补充关键运营指标 -->
      <div class="db-kpi-grid" style="margin-top:10px;">
        <div class="db-kpi-card db-kpi-cyan">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="3" y="3" width="18" height="18" rx="2" stroke="none" fill="none"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">今日入库量</div>
            <div class="db-kpi-value" style="color:#0891b2;">2,840</div>
            <div class="db-kpi-trend db-trend-up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 7H2L6 2Z"/></svg>
              较昨日 +5.2%
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,20 12,18 22,16 32,14 42,12 52,10 62,8" fill="none" stroke="#0891b2" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-indigo">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">在途配送单</div>
            <div class="db-kpi-value" style="color:#4f46e5;">34</div>
            <div class="db-kpi-trend" style="background:#eef2ff;color:#4f46e5;">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="2.5"/></svg>
              预计 12 单今日到达
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,14 12,16 22,12 32,18 42,10 52,14 62,12" fill="none" stroke="#4f46e5" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-rose">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">今日退货单</div>
            <div class="db-kpi-value" style="color:#be185d;">16</div>
            <div class="db-kpi-trend" style="background:#fff1f2;color:#be185d;">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 5H10L6 10Z"/></svg>
              较昨日 -3
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,10 12,14 22,12 32,16 42,18 52,14 62,16" fill="none" stroke="#be185d" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>

        <div class="db-kpi-card db-kpi-teal">
          <div class="db-kpi-accent"></div>
          <div class="db-kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="db-kpi-content">
            <div class="db-kpi-label">客户签收率</div>
            <div class="db-kpi-value" style="color:#0f766e;">94.2%</div>
            <div class="db-kpi-trend db-trend-up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 7H2L6 2Z"/></svg>
              较昨日 +0.8%
            </div>
          </div>
          <div class="db-kpi-sparkline">
            <svg width="64" height="28" viewBox="0 0 64 28"><polyline points="2,18 12,16 22,14 32,12 42,10 52,8 62,6" fill="none" stroke="#0f766e" stroke-width="1.5" opacity="0.5"/></svg>
          </div>
        </div>
      </div>

      <!-- 今日任务进度 + 系统协同健康 -->
      <div class="db-grid-2" style="margin-top:12px;">
        <div class="section-card" style="padding:14px;border-radius:14px !important;">
          <div class="section-head">
            <div class="db-section-title">
              <div class="db-section-icon db-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              </div>
              <h3>今日任务进度</h3>
            </div>
            <div class="db-chart-badge">截至今日 09:30</div>
          </div>
          <div class="db-progress-list">
            <div class="db-progress-item">
              <div class="db-progress-head">
                <span class="db-progress-label">客户要货单处理</span>
                <span class="db-progress-nums"><b>72</b> / 128</span>
              </div>
              <div class="db-progress-bar"><div class="db-progress-fill" style="width:56%;background:linear-gradient(90deg,#3b82f6,#2563eb);"></div></div>
              <div class="db-progress-pct">56%</div>
            </div>
            <div class="db-progress-item">
              <div class="db-progress-head">
                <span class="db-progress-label">配送单发货</span>
                <span class="db-progress-nums"><b>28</b> / 34</span>
              </div>
              <div class="db-progress-bar"><div class="db-progress-fill" style="width:82%;background:linear-gradient(90deg,#22c55e,#0D904F);"></div></div>
              <div class="db-progress-pct">82%</div>
            </div>
            <div class="db-progress-item">
              <div class="db-progress-head">
                <span class="db-progress-label">入库通知回传</span>
                <span class="db-progress-nums"><b>18</b> / 20</span>
              </div>
              <div class="db-progress-bar"><div class="db-progress-fill" style="width:90%;background:linear-gradient(90deg,#0891b2,#0e7490);"></div></div>
              <div class="db-progress-pct">90%</div>
            </div>
            <div class="db-progress-item">
              <div class="db-progress-head">
                <span class="db-progress-label">财务对账完成</span>
                <span class="db-progress-nums"><b>45</b> / 52</span>
              </div>
              <div class="db-progress-bar"><div class="db-progress-fill" style="width:87%;background:linear-gradient(90deg,#f59e0b,#d97706);"></div></div>
              <div class="db-progress-pct">87%</div>
            </div>
            <div class="db-progress-item">
              <div class="db-progress-head">
                <span class="db-progress-label">审批单据处理</span>
                <span class="db-progress-nums"><b>15</b> / 18</span>
              </div>
              <div class="db-progress-bar"><div class="db-progress-fill" style="width:83%;background:linear-gradient(90deg,#a78bfa,#7c3aed);"></div></div>
              <div class="db-progress-pct">83%</div>
            </div>
          </div>
        </div>

        <div class="section-card" style="padding:14px;border-radius:14px !important;">
          <div class="section-head">
            <div class="db-section-title">
              <div class="db-section-icon db-icon-teal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h3>系统协同健康度</h3>
            </div>
            <div class="db-chart-badge">实时</div>
          </div>
          <div class="db-health-grid">
            <div class="db-health-item db-health-ok">
              <div class="db-health-dot"></div>
              <div class="db-health-body">
                <div class="db-health-name">WMS 仓储系统</div>
                <div class="db-health-detail">回传延迟 <b>23ms</b> · 今日回执 <b>42</b> 单</div>
              </div>
              <div class="db-health-status">正常</div>
            </div>
            <div class="db-health-item db-health-warn">
              <div class="db-health-dot"></div>
              <div class="db-health-body">
                <div class="db-health-name">TMS 运输系统</div>
                <div class="db-health-detail">签收回传延迟 <b>6</b> 单 · 平均 <b>18min</b></div>
              </div>
              <div class="db-health-status">注意</div>
            </div>
            <div class="db-health-item db-health-error">
              <div class="db-health-dot"></div>
              <div class="db-health-body">
                <div class="db-health-name">BMS 财务系统</div>
                <div class="db-health-detail">回执失败 <b>3</b> 单 · 最近失败 08:42</div>
              </div>
              <div class="db-health-status">异常</div>
            </div>
            <div class="db-health-item db-health-ok">
              <div class="db-health-dot"></div>
              <div class="db-health-body">
                <div class="db-health-name">MDM 主数据</div>
                <div class="db-health-detail">同步正常 · 上次同步 <b>09:15</b></div>
              </div>
              <div class="db-health-status">正常</div>
            </div>
            <div class="db-health-item db-health-ok">
              <div class="db-health-dot"></div>
              <div class="db-health-body">
                <div class="db-health-name">资源资产系统</div>
                <div class="db-health-detail">库存同步正常 · 差异数 <b>0</b></div>
              </div>
              <div class="db-health-status">正常</div>
            </div>
          </div>
        </div>
      </div>

      <div class="db-grid-3" style="margin-top:12px;">
        <div class="section-card db-chart-card" style="padding:14px;">
          <div class="db-chart-header">
            <div>
              <h3 class="chart-title">出入库品种数与数量对比</h3>
              <div class="chart-legend-row" style="margin-bottom:0;margin-top:2px;"><span class="chart-legend"><i style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:3px;"></i>入库</span><span class="chart-legend"><i style="background:linear-gradient(135deg,#FF6D3A,#C6211A);border-radius:3px;"></i>出库</span></div>
            </div>
            <div class="db-chart-badge">今日</div>
          </div>
          <svg viewBox="0 0 280 170" class="chart-svg" style="margin-top:4px;">
            <defs>
              <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>
              <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF6D3A"/><stop offset="100%" stop-color="#C6211A"/></linearGradient>
            </defs>
            <line x1="40" y1="30" x2="260" y2="30" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="40" y1="60" x2="260" y2="60" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="40" y1="90" x2="260" y2="90" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="40" y1="120" x2="260" y2="120" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="40" y1="145" x2="260" y2="145" stroke="#e5e7eb"/>
            <rect x="65" y="38" width="32" height="107" rx="4" fill="url(#barBlue)" opacity="0.9"/>
            <text x="81" y="33" text-anchor="middle" font-size="10" fill="#1d4ed8" font-weight="700">86</text>
            <rect x="103" y="57" width="32" height="88" rx="4" fill="url(#barRed)" opacity="0.9"/>
            <text x="119" y="52" text-anchor="middle" font-size="10" fill="#C6211A" font-weight="700">72</text>
            <text x="100" y="162" text-anchor="middle" font-size="10" fill="#9ca3af" font-weight="500">品种数</text>
            <rect x="168" y="58" width="32" height="87" rx="4" fill="url(#barBlue)" opacity="0.9"/>
            <text x="184" y="53" text-anchor="middle" font-size="10" fill="#1d4ed8" font-weight="700">2,840</text>
            <rect x="206" y="33" width="32" height="112" rx="4" fill="url(#barRed)" opacity="0.9"/>
            <text x="222" y="28" text-anchor="middle" font-size="10" fill="#C6211A" font-weight="700">3,560</text>
            <text x="203" y="162" text-anchor="middle" font-size="10" fill="#9ca3af" font-weight="500">数量（件）</text>
          </svg>
        </div>

        <div class="section-card db-chart-card" style="padding:14px;">
          <div class="db-chart-header">
            <div>
              <h3 class="chart-title">按货主出入库分析</h3>
            </div>
            <div class="db-chart-badge">本月</div>
          </div>
          <div class="db-pie-wrap" style="gap:24px;">
            <div class="db-pie-item">
              <div class="db-pie-outer">
                <div class="db-pie-chart" style="width:228px;height:228px;border-width:3px;"></div>
                <div class="db-pie-center" style="width:90px;height:90px;"><span class="db-pie-center-val" style="font-size:24px;">86</span><span class="db-pie-center-label" style="font-size:11px;">品种</span></div>
              </div>
              <div class="db-pie-caption">入库分布</div>
            </div>
            <div class="db-pie-item">
              <div class="db-pie-outer">
                <div class="db-pie-chart" style="width:228px;height:228px;border-width:3px;background:conic-gradient(#C6211A 0% 40%,#FF6D3A 40% 68%,#3b82f6 68% 88%,#FBBF24 88% 100%)"></div>
                <div class="db-pie-center" style="width:90px;height:90px;"><span class="db-pie-center-val" style="font-size:24px;">72</span><span class="db-pie-center-label" style="font-size:11px;">品种</span></div>
              </div>
              <div class="db-pie-caption">出库分布</div>
            </div>
          </div>
          <div class="db-pie-legend" style="margin-top:4px;padding-top:4px;">
            <span class="db-legend-item"><i style="background:#C6211A"></i><b>家家悦</b> 45%</span>
            <span class="db-legend-item"><i style="background:#FF6D3A"></i><b>中粮食品</b> 25%</span>
            <span class="db-legend-item"><i style="background:#3b82f6"></i><b>华润怡宝</b> 20%</span>
            <span class="db-legend-item"><i style="background:#FBBF24"></i><b>其他</b> 10%</span>
          </div>
        </div>

        <div class="section-card db-chart-card" style="padding:14px;">
          <div class="db-chart-header">
            <div>
              <h3 class="chart-title">近一周出入库数量趋势</h3>
              <div class="chart-legend-row" style="margin-bottom:0;margin-top:2px;"><span class="chart-legend"><i style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:3px;"></i>入库</span><span class="chart-legend"><i style="background:linear-gradient(135deg,#FF6D3A,#C6211A);border-radius:3px;"></i>出库</span></div>
            </div>
            <div class="db-chart-badge">近7日</div>
          </div>
          <svg viewBox="0 0 280 170" class="chart-svg" style="margin-top:4px;">
            <defs>
              <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01"/></linearGradient>
              <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C6211A" stop-opacity="0.18"/><stop offset="100%" stop-color="#C6211A" stop-opacity="0.01"/></linearGradient>
            </defs>
            <line x1="30" y1="15" x2="260" y2="15" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="30" y1="45" x2="260" y2="45" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="30" y1="75" x2="260" y2="75" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="30" y1="105" x2="260" y2="105" stroke="#f3f4f6" stroke-dasharray="4"/>
            <line x1="30" y1="135" x2="260" y2="135" stroke="#e5e7eb"/>
            <text x="26" y="19" text-anchor="end" font-size="8" fill="#9ca3af">4k</text>
            <text x="26" y="49" text-anchor="end" font-size="8" fill="#9ca3af">3.5k</text>
            <text x="26" y="79" text-anchor="end" font-size="8" fill="#9ca3af">3k</text>
            <text x="26" y="109" text-anchor="end" font-size="8" fill="#9ca3af">2.5k</text>
            <text x="26" y="139" text-anchor="end" font-size="8" fill="#9ca3af">2k</text>
            <polygon points="30,135 30,114 68,90 105,102 143,75 180,85 218,90 255,72 255,135" fill="url(#areaBlue)"/>
            <polyline points="30,114 68,90 105,102 143,75 180,85 218,90 255,72" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="30,135 30,90 68,72 105,84 143,60 180,75 218,48 255,66 255,135" fill="url(#areaRed)"/>
            <polyline points="30,90 68,72 105,84 143,60 180,75 218,48 255,66" fill="none" stroke="#C6211A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="30" cy="114" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="68" cy="90" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="105" cy="102" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="143" cy="75" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="180" cy="85" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="218" cy="90" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/><circle cx="255" cy="72" r="2.5" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/>
            <circle cx="30" cy="90" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="68" cy="72" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="105" cy="84" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="143" cy="60" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="180" cy="75" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="218" cy="48" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/><circle cx="255" cy="66" r="2.5" fill="#fff" stroke="#C6211A" stroke-width="1.5"/>
            <text x="30" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/3</text>
            <text x="68" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/4</text>
            <text x="105" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/5</text>
            <text x="143" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/6</text>
            <text x="180" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/7</text>
            <text x="218" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/8</text>
            <text x="255" y="150" text-anchor="middle" font-size="8" fill="#9ca3af">6/9</text>
          </svg>
        </div>
      </div>

      <div class="db-grid-2" style="margin-top:12px;">
        <div class="section-card db-todo-card" style="padding:14px;">
          <div class="section-head">
            <div class="db-section-title">
              <div class="db-section-icon db-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h3>待办事项</h3>
              <span class="db-count-badge">3</span>
            </div>
            <button class="ghost-button" style="font-size:12px;padding:5px 12px;">查看全部</button>
          </div>
          <div class="db-todo-list">
            <div class="db-todo-item">
              <div class="db-todo-dot" style="background:#FF9900;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">客户要货单待审核</div>
                <div class="db-todo-meta">
                  <span>单据数 <b>18</b></span>
                  <span class="db-meta-sep">|</span>
                  <span>平均等待 1.6 小时</span>
                </div>
              </div>
              <span class="tag orange" style="font-size:11px;">待审批</span>
            </div>
            <div class="db-todo-item">
              <div class="db-todo-dot" style="background:#D93025;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">退仓单待处理</div>
                <div class="db-todo-meta">
                  <span>异常回仓 <b>4</b> 单</span>
                  <span class="db-meta-sep">|</span>
                  <span>需确认原货主与仓库</span>
                </div>
              </div>
              <span class="tag red" style="font-size:11px;">高优先</span>
            </div>
            <div class="db-todo-item">
              <div class="db-todo-dot" style="background:#2563eb;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">财务回执差异待跟进</div>
                <div class="db-todo-meta">
                  <span>BMS回执失败 <b>3</b> 单</span>
                  <span class="db-meta-sep">|</span>
                  <span>含配送单与退货单</span>
                </div>
              </div>
              <span class="tag blue" style="font-size:11px;">待处理</span>
            </div>
          </div>
        </div>
        <div class="section-card db-alert-card" style="padding:14px;">
          <div class="section-head">
            <div class="db-section-title">
              <div class="db-section-icon db-icon-red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3>异常预警</h3>
              <span class="db-count-badge db-count-danger">3</span>
            </div>
            <button class="ghost-button" style="font-size:12px;padding:5px 12px;">生成工单</button>
          </div>
          <div class="db-todo-list">
            <div class="db-todo-item db-alert-item">
              <div class="db-todo-dot db-dot-pulse" style="background:#FF9900;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">库存不足预警</div>
                <div class="db-todo-meta">
                  <span>华东1仓 / 货主 A</span>
                  <span class="db-meta-sep">|</span>
                  <span>低值易耗品 <b>12</b> 项</span>
                </div>
              </div>
              <span class="tag orange" style="font-size:11px;">库存预警</span>
            </div>
            <div class="db-todo-item db-alert-item">
              <div class="db-todo-dot db-dot-pulse" style="background:#D93025;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">WMS回传超时</div>
                <div class="db-todo-meta">
                  <span>配送通知单 <b>6</b> 单</span>
                  <span class="db-meta-sep">|</span>
                  <span>超过 30 分钟未回传</span>
                </div>
              </div>
              <span class="tag red" style="font-size:11px;">接口异常</span>
            </div>
            <div class="db-todo-item db-alert-item">
              <div class="db-todo-dot" style="background:#9ca3af;"></div>
              <div class="db-todo-body">
                <div class="db-todo-title">客户签收延迟</div>
                <div class="db-todo-meta">
                  <span>TMS 签收回传延迟 <b>8</b> 单</span>
                </div>
              </div>
              <span class="tag gray" style="font-size:11px;">待关注</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期动态时间线 -->
      <div class="section-card db-timeline-card" style="padding:14px;margin-top:12px;border-radius:14px !important;">
        <div class="section-head">
          <div class="db-section-title">
            <div class="db-section-icon db-icon-indigo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>近期动态</h3>
          </div>
          <button class="ghost-button" style="font-size:12px;padding:5px 12px;">查看全部</button>
        </div>
        <div class="db-timeline">
          <div class="db-timeline-item">
            <div class="db-timeline-dot" style="background:#22c55e;"></div>
            <div class="db-timeline-body">
              <div class="db-timeline-title">配送单 <b>PS202606090042</b> 已签收</div>
              <div class="db-timeline-meta">客户「家家悦烟台旗舰店」确认签收 · TMS回传成功</div>
            </div>
            <div class="db-timeline-time">09:28</div>
          </div>
          <div class="db-timeline-item">
            <div class="db-timeline-dot" style="background:#3b82f6;"></div>
            <div class="db-timeline-body">
              <div class="db-timeline-title">入库通知单 <b>IN202606090018</b> WMS回传完成</div>
              <div class="db-timeline-meta">华东1仓 · 实收 2,340 件 / 品种 68 · 差异数 0</div>
            </div>
            <div class="db-timeline-time">09:15</div>
          </div>
          <div class="db-timeline-item">
            <div class="db-timeline-dot" style="background:#f59e0b;"></div>
            <div class="db-timeline-body">
              <div class="db-timeline-title">客户要货单 <b>XH202606090156</b> 审批通过</div>
              <div class="db-timeline-meta">货主「中粮食品」· 配送仓已锁定 · 待生成配送单</div>
            </div>
            <div class="db-timeline-time">08:52</div>
          </div>
          <div class="db-timeline-item">
            <div class="db-timeline-dot" style="background:#ef4444;"></div>
            <div class="db-timeline-body">
              <div class="db-timeline-title">BMS财务回执失败</div>
              <div class="db-timeline-meta">配送单 PS202606090038 · 回执码 ERR_BMS_003 · 已自动重试 1 次</div>
            </div>
            <div class="db-timeline-time">08:42</div>
          </div>
          <div class="db-timeline-item">
            <div class="db-timeline-dot" style="background:#8b5cf6;"></div>
            <div class="db-timeline-body">
              <div class="db-timeline-title">退仓申请单 <b>TC202606090005</b> 已提交</div>
              <div class="db-timeline-meta">货主「华润怡宝」· 退仓原因：临期商品 · 待审批</div>
            </div>
            <div class="db-timeline-time">08:30</div>
          </div>
        </div>
      </div>

      <div class="db-quick-actions" style="margin-top:12px;">
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#2563eb;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="db-qa-label">创建要货单</div>
        </div>
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);color:#C6211A;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="db-qa-label">配送发货</div>
        </div>
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#0D904F;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/></svg>
          </div>
          <div class="db-qa-label">入库登记</div>
        </div>
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#B45309;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div class="db-qa-label">库存查询</div>
        </div>
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#fef2f2,#fee2e2);color:#D93025;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="db-qa-label">审批中心</div>
        </div>
        <div class="db-qa-item">
          <div class="db-qa-icon" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);color:#7C3AED;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="db-qa-label">运营报表</div>
        </div>
      </div>`
  },
  org: {
    title: "组织管理",
    desc: "维护企业内部组织架构信息，用于业务单据、审批流程和仓储配送的区域归属。",
    actions: ["新增组织", "导出组织"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>组织编码</th><th>组织名称</th><th>组织类型</th><th>上级组织</th><th>所属区域</th><th>负责人</th><th>联系电话</th><th>状态</th></tr></thead><tbody>
        <tr><td>ORG001</td><td>总部运营中心</td><td>总部</td><td>—</td><td>全国</td><td>张伟</td><td>010-88880001</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>ORG002</td><td>华东运营分部</td><td>区域分部</td><td>总部运营中心</td><td>华东</td><td>李波</td><td>021-66660002</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>ORG003</td><td>华南运营分部</td><td>区域分部</td><td>总部运营中心</td><td>华南</td><td>陈华</td><td>020-77770003</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>ORG004</td><td>华北运营分部</td><td>区域分部</td><td>总部运营中心</td><td>华北</td><td>王雪</td><td>010-99990004</td><td><span class="tag blue">已配置</span></td></tr>
      </tbody></table></div>`
  },
  supplier: {
    title: "供应商档案",
    desc: "维护供应商基础信息，用于采购入库、退仓回退和财务结算时的供应商识别与关联。",
    actions: ["新增供应商", "导出供应商"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>供应商编码</th><th>供应商名称</th><th>供应商类型</th><th>合作模式</th><th>联系人</th><th>联系电话</th><th>主营品类</th><th>结算方式</th><th>状态</th></tr></thead><tbody>
        <tr><td>SUP001</td><td>华润怡宝供应链</td><td>品牌供应商</td><td>直配入库</td><td>刘明</td><td>13800010001</td><td>饮品/清洁</td><td>月结30天</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>SUP002</td><td>中粮食品配送</td><td>品牌供应商</td><td>直配入库</td><td>赵刚</td><td>13800020002</td><td>粮油/食品</td><td>月结45天</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>SUP003</td><td>华南区域集采中心</td><td>区域供应商</td><td>集采分拨</td><td>周婷</td><td>13800030003</td><td>综合品类</td><td>季结</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>SUP004</td><td>安洁防护用品厂</td><td>品牌供应商</td><td>新品直配</td><td>孙磊</td><td>13800040004</td><td>清洁消杀/防护</td><td>单笔结算</td><td><span class="tag blue">已配置</span></td></tr>
      </tbody></table></div>`
  },
  warehouse: {
    title: "配送仓管理",
    desc: "维护配送仓库基础信息，用于入库、发货、退仓等业务环节的仓库分配与调度。",
    actions: ["新增仓库", "导出仓库"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>仓库编码</th><th>仓库名称</th><th>仓库类型</th><th>所属区域</th><th>详细地址</th><th>仓库负责人</th><th>联系电话</th><th>仓库面积(m2)</th><th>温层支持</th><th>状态</th></tr></thead><tbody>
        <tr><td>WH001</td><td>华东1仓</td><td>常温仓</td><td>华东</td><td>上海市浦东新区XX路100号</td><td>陈明</td><td>021-55550001</td><td>12,000</td><td>常温/冷藏</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>WH002</td><td>华南2仓</td><td>常温仓</td><td>华南</td><td>广州市天河区XX大道200号</td><td>黄华</td><td>020-66660002</td><td>8,500</td><td>常温</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>WH003</td><td>华北3仓</td><td>冷链仓</td><td>华北</td><td>北京市大兴区XX路300号</td><td>张磊</td><td>010-77770003</td><td>6,200</td><td>冷藏/冷冻</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>WH004</td><td>华东4仓（临时）</td><td>临时仓</td><td>华东</td><td>上海市松江区XX路50号</td><td>周婷</td><td>021-88880004</td><td>3,000</td><td>常温</td><td><span class="tag blue">已配置</span></td></tr>
      </tbody></table></div>`
  },
  vehicle: {
    title: "车辆管理",
    desc: "维护配送车辆基础信息与状态，用于配送调度、运力规划和时效管理。",
    actions: ["新增车辆", "导出车辆"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>车辆编码</th><th>车牌号</th><th>车辆类型</th><th>载重(吨)</th><th>所属区域</th><th>承运商</th><th>司机</th><th>联系电话</th><th>温控能力</th><th>状态</th></tr></thead><tbody>
        <tr><td>VH001</td><td>沪A·12345</td><td>4.2米厢式</td><td>2.0</td><td>华东</td><td>自营车队</td><td>张师傅</td><td>13700010001</td><td>常温</td><td><span class="tag green">在用</span></td></tr>
        <tr><td>VH002</td><td>粤B·67890</td><td>7.6米厢式</td><td>5.0</td><td>华南</td><td>顺达物流</td><td>李师傅</td><td>13700020002</td><td>常温</td><td><span class="tag green">在用</span></td></tr>
        <tr><td>VH003</td><td>京C·11111</td><td>冷链车</td><td>3.0</td><td>华北</td><td>自营车队</td><td>王师傅</td><td>13700030003</td><td>冷藏/冷冻</td><td><span class="tag green">在用</span></td></tr>
        <tr><td>VH004</td><td>沪A·99999</td><td>9.6米厢式</td><td>8.0</td><td>华东</td><td>中远物流</td><td>赵师傅</td><td>13700040004</td><td>常温</td><td><span class="tag orange">维修中</span></td></tr>
      </tbody></table></div>`
  },
  warehouserelation: {
    title: "仓库关系表",
    desc: "定义前置仓与中央仓的对应关系，一个前置仓仅对应一个中央仓，用于配送、调拨和补货业务中的仓库自动匹配。",
    actions: ["新增关系", "导出"],
    content: `
      <div class="notice" style="margin-bottom:14px;"><div class="title">关系说明</div><div class="desc">仓库关系表定义前置仓（发起方）与中央仓（供应方）的一对一映射。配送补货、调拨出库等业务场景中，系统根据此关系自动带出对应仓库。</div></div>
      <div class="data-table-wrap"><table><thead><tr><th>关系编号</th><th>前置仓编码</th><th>前置仓名称</th><th>前置仓类型</th><th>中央仓编码</th><th>中央仓名称</th><th>中央仓类型</th><th>关系状态</th><th>生效日期</th><th>失效日期</th><th>备注</th></tr></thead><tbody>
        <tr><td>WR-001</td><td>WH004</td><td>华东4仓（临时）</td><td>前置仓</td><td>WH001</td><td>华东1仓</td><td>中央仓</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td><td>—</td><td>华东区域前置配送</td></tr>
        <tr><td>WR-002</td><td>WH005</td><td>华南5仓（前置）</td><td>前置仓</td><td>WH002</td><td>华南2仓</td><td>中央仓</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td><td>—</td><td>华南区域前置配送</td></tr>
        <tr><td>WR-003</td><td>WH006</td><td>华北6仓（前置）</td><td>前置仓</td><td>WH003</td><td>华北3仓</td><td>中央仓</td><td><span class="tag green">生效中</span></td><td>2026-02-15</td><td>—</td><td>华北区域前置配送</td></tr>
        <tr><td>WR-004</td><td>WH007</td><td>浦东7仓（前置）</td><td>前置仓</td><td>WH001</td><td>华东1仓</td><td>中央仓</td><td><span class="tag green">生效中</span></td><td>2026-03-01</td><td>—</td><td>上海浦东前置仓</td></tr>
        <tr><td>WR-005</td><td>WH008</td><td>天河8仓（前置）</td><td>前置仓</td><td>WH002</td><td>华南2仓</td><td>中央仓</td><td><span class="tag blue">待生效</span></td><td>2026-07-01</td><td>—</td><td>广州天河新增前置仓</td></tr>
        <tr><td>WR-006</td><td>WH009</td><td>大兴9仓（前置）</td><td>前置仓</td><td>WH003</td><td>华北3仓</td><td>中央仓</td><td><span class="tag green">生效中</span></td><td>2026-04-01</td><td>—</td><td>北京大兴前置仓</td></tr>
        <tr><td>WR-007</td><td>WH010</td><td>松江10仓（前置）</td><td>前置仓</td><td>WH001</td><td>华东1仓</td><td>中央仓</td><td><span class="tag red">已失效</span></td><td>2025-06-01</td><td>2026-03-31</td><td>临时仓已关闭</td></tr>
      </tbody></table></div>`
  },
  storeordercycle: {
    title: "门店要货周期定义表",
    desc: "定义每个门店的可要货周期规则，支持按周和按月两种模式。客户要货单创建时校验门店是否在允许要货日期内。",
    actions: ["新增规则", "导出规则"],
    content: `
      <div class="notice" style="margin-bottom:12px;"><div class="title">规则说明</div><div class="desc">门店要货周期定义表用于控制每个门店的可要货日期。<strong>按周模式</strong>指定每周哪几天可要货（如周三、周五），<strong>按月模式</strong>指定每月哪几号可要货（如5号、15号）。客户要货单提交时，系统自动校验当前日期是否符合该门店的要货周期规则。</div></div>
      <div class="data-table-wrap"><table><thead><tr><th>规则编码</th><th>门店编码</th><th>门店名称</th><th>所属客户</th><th>要货周期类型</th><th>可要货日期</th><th>生效日期</th><th>状态</th><th>备注</th></tr></thead><tbody>
        <tr><td>OC001</td><td>STORE001</td><td>浦东旗舰店</td><td>内部客户-华东分部</td><td><span class="tag blue">按周</span></td><td>周三、周五</td><td>2026-01-01</td><td><span class="tag green">生效中</span></td><td>每周两次配送</td></tr>
        <tr><td>OC002</td><td>STORE002</td><td>临港社区店</td><td>内部客户-华东分部</td><td><span class="tag orange">按月</span></td><td>每月 5号、15号</td><td>2026-01-01</td><td><span class="tag green">生效中</span></td><td>半月度补货</td></tr>
        <tr><td>OC003</td><td>STORE003</td><td>天河中心店</td><td>外部客户-门店联盟</td><td><span class="tag blue">按周</span></td><td>周一、周二、周三、周四、周五</td><td>2026-01-15</td><td><span class="tag green">生效中</span></td><td>工作日均可要货</td></tr>
        <tr><td>OC004</td><td>STORE004</td><td>海珠网点</td><td>外部客户-门店联盟</td><td><span class="tag orange">按月</span></td><td>每月 1号、10号、20号</td><td>2026-02-01</td><td><span class="tag blue">待确认</span></td><td>旬度要货，待客户确认</td></tr>
        <tr><td>OC005</td><td>STORE005</td><td>大兴新城店</td><td>内部客户-区域共享仓</td><td><span class="tag blue">按周</span></td><td>周二、周四、周六</td><td>2026-01-01</td><td><span class="tag green">生效中</span></td><td>含周末配送</td></tr>
      </tbody></table></div>`
  },
  sla: {
    title: "标准时效",
    desc: "定义各业务环节的标准时效规则，用于配送履约监控、超时预警和KPI考核。",
    actions: ["新增时效规则", "导出规则"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>规则编码</th><th>规则名称</th><th>业务环节</th><th>起始节点</th><th>截止节点</th><th>标准时效</th><th>区域</th><th>温层要求</th><th>超时处理</th><th>状态</th></tr></thead><tbody>
        <tr><td>SLA001</td><td>华东同城配送时效</td><td>配送签收</td><td>配送单生成</td><td>客户签收</td><td>24小时</td><td>华东</td><td>常温</td><td>自动预警</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>SLA002</td><td>华南跨城配送时效</td><td>配送签收</td><td>配送单生成</td><td>客户签收</td><td>48小时</td><td>华南</td><td>常温</td><td>自动预警</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>SLA003</td><td>冷链配送时效</td><td>配送签收</td><td>出库装车</td><td>客户签收</td><td>12小时</td><td>华北</td><td>冷藏/冷冻</td><td>自动预警+升级</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>SLA004</td><td>入库回传时效</td><td>WMS回传</td><td>入库通知发送</td><td>入库结果回传</td><td>2小时</td><td>全国</td><td>—</td><td>接口告警</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>SLA005</td><td>退仓处理时效</td><td>退仓入库</td><td>退仓通知到达</td><td>退仓入库完成</td><td>4小时</td><td>全国</td><td>—</td><td>自动预警</td><td><span class="tag blue">待生效</span></td></tr>
      </tbody></table></div>`
  },
  reportcenter: {
    title: "报表中心",
    desc: "运营综合报表、配送履约、库存分析和财务对账的集中查看与导出。",
    actions: ["导出报表", "订阅报表"],
    content: `
      <div class="section-card" style="margin-bottom:14px;">
        <div class="section-head"><h3>运营综合报表</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">刷新数据</button></div></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px;">
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;"><div style="font-size:12px;color:#64748b;">本月配送单总量</div><div style="font-size:24px;font-weight:700;color:#0369a1;margin-top:4px;">1,286</div><div style="font-size:11px;color:#16a34a;margin-top:2px;">↑ 12.3% 环比上月</div></div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;"><div style="font-size:12px;color:#64748b;">履约准时率</div><div style="font-size:24px;font-weight:700;color:#16a34a;margin-top:4px;">96.8%</div><div style="font-size:11px;color:#16a34a;margin-top:2px;">↑ 1.2% 环比上月</div></div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;"><div style="font-size:12px;color:#64748b;">库存周转天数</div><div style="font-size:24px;font-weight:700;color:#d97706;margin-top:4px;">18.5 天</div><div style="font-size:11px;color:#dc2626;margin-top:2px;">↑ 2.1天 需关注</div></div>
          <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:14px;"><div style="font-size:12px;color:#64748b;">异常工单数</div><div style="font-size:24px;font-weight:700;color:#db2777;margin-top:4px;">23</div><div style="font-size:11px;color:#16a34a;margin-top:2px;">↓ 8.7% 环比上月</div></div>
        </div>
        <div class="data-table-wrap"><table><thead><tr><th>指标</th><th>本月</th><th>上月</th><th>环比</th><th>趋势</th></tr></thead><tbody>
          <tr><td>配送单总量</td><td>1,286</td><td>1,145</td><td><span style="color:#16a34a;">↑ 12.3%</span></td><td>持续上升</td></tr>
          <tr><td>入库单总量</td><td>892</td><td>856</td><td><span style="color:#16a34a;">↑ 4.2%</span></td><td>平稳</td></tr>
          <tr><td>退仓单总量</td><td>67</td><td>72</td><td><span style="color:#16a34a;">↓ 6.9%</span></td><td>持续下降</td></tr>
          <tr><td>签收完成率</td><td>94.5%</td><td>93.1%</td><td><span style="color:#16a34a;">↑ 1.4%</span></td><td>稳步提升</td></tr>
          <tr><td>库存准确率</td><td>99.2%</td><td>99.0%</td><td><span style="color:#16a34a;">↑ 0.2%</span></td><td>保持稳定</td></tr>
        </tbody></table></div>
      </div>
      <div class="section-card" style="margin-bottom:14px;">
        <div class="section-head"><h3>配送履约报表</h3><div class="action-row"><button class="ghost-button">导出</button></div></div>
        <div class="data-table-wrap"><table><thead><tr><th>区域</th><th>配送单数</th><th>准时签收</th><th>延迟签收</th><th>异常签收</th><th>准时率</th><th>平均时效(h)</th></tr></thead><tbody>
          <tr><td>华东</td><td>523</td><td>501</td><td>18</td><td>4</td><td><span style="color:#16a34a;font-weight:500;">95.8%</span></td><td>18.2</td></tr>
          <tr><td>华南</td><td>412</td><td>396</td><td>14</td><td>2</td><td><span style="color:#16a34a;font-weight:500;">96.1%</span></td><td>22.5</td></tr>
          <tr><td>华北</td><td>351</td><td>332</td><td>16</td><td>3</td><td><span style="color:#16a34a;font-weight:500;">94.6%</span></td><td>25.8</td></tr>
          <tr><td style="font-weight:600;">合计</td><td style="font-weight:600;">1,286</td><td style="font-weight:600;">1,229</td><td style="font-weight:600;">48</td><td style="font-weight:600;">9</td><td style="font-weight:600;color:#16a34a;">95.6%</td><td style="font-weight:600;">21.7</td></tr>
        </tbody></table></div>
      </div>
      <div class="section-card" style="margin-bottom:14px;">
        <div class="section-head"><h3>库存分析报表</h3><div class="action-row"><button class="ghost-button">导出</button></div></div>
        <div class="data-table-wrap"><table><thead><tr><th>仓库</th><th>SKU数</th><th>库存总量</th><th>库存金额(万元)</th><th>周转天数</th><th>滞销品占比</th><th>临期品占比</th></tr></thead><tbody>
          <tr><td>华东1仓</td><td>286</td><td>42,580</td><td>1,285.6</td><td>16.3</td><td>3.2%</td><td>2.1%</td></tr>
          <tr><td>华南2仓</td><td>198</td><td>28,340</td><td>856.2</td><td>19.8</td><td>4.5%</td><td>1.8%</td></tr>
          <tr><td>华北3仓</td><td>215</td><td>31,260</td><td>942.8</td><td>21.5</td><td>5.1%</td><td>3.6%</td></tr>
          <tr style="font-weight:600;background:#f8fafc;"><td>合计</td><td>699</td><td>102,180</td><td>3,084.6</td><td>18.5</td><td>4.1%</td><td>2.4%</td></tr>
        </tbody></table></div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>财务对账报表</h3><div class="action-row"><button class="ghost-button">导出</button></div></div>
        <div class="data-table-wrap"><table><thead><tr><th>对账批次</th><th>对账期间</th><th>业务单据数</th><th>对账金额(万元)</th><th>差异金额(元)</th><th>差异率</th><th>对账状态</th></tr></thead><tbody>
          <tr><td>DZ202605</td><td>2026-05</td><td>1,286</td><td>892.5</td><td>1,256.00</td><td>0.014%</td><td><span class="tag green">已对平</span></td></tr>
          <tr><td>DZ202604</td><td>2026-04</td><td>1,145</td><td>823.6</td><td>3,420.00</td><td>0.042%</td><td><span class="tag green">已对平</span></td></tr>
          <tr><td>DZ202603</td><td>2026-03</td><td>1,032</td><td>758.2</td><td>5,680.00</td><td>0.075%</td><td><span class="tag orange">有差异</span></td></tr>
          <tr><td>DZ202602</td><td>2026-02</td><td>956</td><td>685.4</td><td>2,180.00</td><td>0.032%</td><td><span class="tag green">已对平</span></td></tr>
          <tr><td>DZ202601</td><td>2026-01</td><td>1,089</td><td>786.9</td><td>4,520.00</td><td>0.057%</td><td><span class="tag orange">有差异</span></td></tr>
        </tbody></table></div>
      </div>`
  },
  demand: {
    title: "客户要货单",
    desc: "支持手工创建和接口导入，校验货主、仓库、合同和库存。",
    actions: ["新建要货单", "批量导出"],
    content: `
      <div class="filter-bar">
        <div class="input">客户：全部客户</div><div class="input">货主：全部货主</div><div class="input">仓库：默认发货仓</div><div class="input">状态：待履约</div><div class="input">日期：近7天</div><button class="button">查询</button>
      </div>
      <table><thead><tr><th>要货单号</th><th>客户</th><th>货主</th><th>发货仓</th><th>商品数</th><th>数量</th><th>履约状态</th><th>来源</th><th>操作</th></tr></thead><tbody>
        <tr><td>YH20260526001</td><td>内部客户-华东分部</td><td>自有货主A</td><td>华东1仓</td><td>5</td><td>260</td><td><span class="tag blue">待履约</span></td><td>小程序</td><td><div class="table-action-group"><button class="table-action-button primary" data-demand-detail="YH20260526001">查看</button><button class="table-action-button" data-demand-delivery="YH20260526001">生成配送</button></div></td></tr>
        <tr><td>YH20260526002</td><td>外部客户-门店联盟</td><td>外部货主B</td><td>华南2仓</td><td>3</td><td>125</td><td><span class="tag orange">待审核</span></td><td>接口导入</td><td><div class="table-action-group"><button class="table-action-button primary" data-demand-detail="YH20260526002">查看</button><button class="table-action-button" data-modal="approve" data-action-label="审核">审核</button></div></td></tr>
        <tr><td>YH20260526003</td><td>内部客户-区域共享仓</td><td>自有货主C</td><td>华北3仓</td><td>8</td><td>420</td><td><span class="tag gray">部分签收</span></td><td>PC端</td><td><div class="table-action-group"><button class="table-action-button primary" data-demand-detail="YH20260526003">查看</button><button class="table-action-button" data-modal="view" data-action-label="履约跟踪">跟踪</button></div></td></tr>
      </tbody></table>`
  },
  newproduct: {
    title: "新品录入单",
    desc: "支持外部货主手工录入或通过Excel导入新品资料，审批通过后自动写入商品信息。",
    actions: ["新建录入单", "导出录入单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>新品录入单列表</h3><div class="action-row"><button class="ghost-button">批量导入Excel</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">XP20260526001</div><div class="muted">外部货主A / 清洁消杀 / 商品2项 / 待审核</div></div><span class="tag orange">待审核</span></div>
          <div class="list-row"><div><div class="list-title">XP20260526003</div><div class="muted">外部货主B / 防护用品 / 商品2项 / 已写入商品信息</div></div><span class="tag green">已写入</span></div>
          <div class="list-row"><div><div class="list-title">XP20260526005</div><div class="muted">外部货主C / 包材辅料 / 商品3项 / 待补主数据</div></div><span class="tag blue">待补充</span></div>
        </div></div>
        <div class="section-card"><h3>录入详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">单号</div><div>XP20260526003</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">录入状态</div><div><span class="tag blue">已提交</span></div></div>
          <div class="info-item"><div class="k">审批状态</div><div><span class="tag green">已审核通过</span></div></div>
          <div class="info-item"><div class="k">写入商品信息</div><div>已写入</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>新品商品明细</h3><div class="action-row"><button class="ghost-button" data-tab-switch="create">录入</button><button class="primary-button" data-tab-switch="edit">修改</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>商品分类</th><th>品牌</th><th>型号</th><th>温层</th><th>保质期天数</th><th>长(cm)</th><th>宽(cm)</th><th>高(cm)</th><th>体积(m3)</th><th>重量(kg)</th><th>包装数量</th><th>是否批次管理</th><th>是否效期管理</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>附件资料</th></tr></thead><tbody>
        <tr><td>MAT-NEW-001</td><td>6923000000018</td><td>新品-消杀喷雾</td><td>24瓶/箱</td><td>箱</td><td>清洁消杀</td><td>安洁</td><td>AJ-XP-24</td><td>常温</td><td>365</td><td>42</td><td>30</td><td>28</td><td>0.0353</td><td>12.5</td><td>24</td><td>是</td><td>是</td><td>13%</td><td>38.94</td><td>44.00</td><td>检测报告/图片</td></tr>
        <tr><td>MAT-NEW-002</td><td>6923000000025</td><td>新品-医用手套</td><td>50盒/箱</td><td>箱</td><td>防护用品</td><td>护安</td><td>HA-GLOVE-50</td><td>常温</td><td>730</td><td>48</td><td>36</td><td>32</td><td>0.0553</td><td>16.8</td><td>50</td><td>是</td><td>是</td><td>13%</td><td>61.95</td><td>70.00</td><td>资质证照/图片</td></tr>
      </tbody></table></div></div>`
  },
  newproductcreate: {
    title: "新品录入页",
    desc: "用于外部货主手工录入新品资料，提交审批前补齐商品属性、价格税率和附件信息。",
    actions: ["保存", "提交"],
    content: `
      <div class="grid-2">
        <div class="section-card">
          <div class="section-head"><h3>基础信息录入</h3><div class="action-row"><a class="ghost-button" href="pc-newproduct.html">返回新品录入单</a><a class="primary-button" href="pc-newproduct-edit.html">查看编辑页</a></div></div>
          <div class="pc-form-grid">
            <div class="pc-form-field" data-pc-form-label="货主" data-pc-filled-value="外部货主B"><div class="pc-form-label">货主</div><div class="pc-form-value">请选择外部货主</div></div>
            <div class="pc-form-field" data-pc-form-label="来源方式" data-pc-filled-value="手工录入"><div class="pc-form-label">来源方式</div><div class="pc-form-value">请选择来源方式</div></div>
            <div class="pc-form-field" data-pc-form-label="商品分类" data-pc-filled-value="防护用品"><div class="pc-form-label">商品分类</div><div class="pc-form-value">请选择商品分类</div></div>
            <div class="pc-form-field" data-pc-form-label="温层" data-pc-filled-value="常温"><div class="pc-form-label">温层</div><div class="pc-form-value">请选择温层</div></div>
            <div class="pc-form-field" data-pc-form-label="长(cm)" data-pc-filled-value="48"><div class="pc-form-label">长(cm)</div><div class="pc-form-value">请填写长度</div></div>
            <div class="pc-form-field" data-pc-form-label="宽(cm)" data-pc-filled-value="36"><div class="pc-form-label">宽(cm)</div><div class="pc-form-value">请填写宽度</div></div>
            <div class="pc-form-field" data-pc-form-label="高(cm)" data-pc-filled-value="32"><div class="pc-form-label">高(cm)</div><div class="pc-form-value">请填写高度</div></div>
            <div class="pc-form-field" data-pc-form-label="体积(m3)" data-pc-filled-value="0.0553"><div class="pc-form-label">体积(m3)</div><div class="pc-form-value">请填写体积</div></div>
            <div class="pc-form-field" data-pc-form-label="重量(kg)" data-pc-filled-value="16.8"><div class="pc-form-label">重量(kg)</div><div class="pc-form-value">请填写重量</div></div>
            <div class="pc-form-field" data-pc-form-label="包装数量" data-pc-filled-value="50"><div class="pc-form-label">包装数量</div><div class="pc-form-value">请填写包装数量</div></div>
            <div class="pc-form-field full" data-pc-form-label="录入说明" data-pc-filled-value="新增外部货主新品，待审批后写入商品信息"><div class="pc-form-label">录入说明</div><div class="pc-form-value">请填写录入说明</div></div>
            <div class="pc-form-field full" data-pc-form-label="附件资料" data-pc-filled-value="已上传商品图片、检测报告和资质证照"><div class="pc-form-label">附件资料</div><div class="pc-form-value">请上传附件资料</div></div>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>录入说明</h3><div class="action-row"><button class="ghost-button" data-modal="permission" data-action-label="查看权限">查看权限</button></div></div>
          <div class="list">
            <div class="list-row"><div><div class="list-title">录入方式</div><div class="muted">支持手工逐条录入，适合少量新品维护。</div></div><span class="tag blue">手工</span></div>
            <div class="list-row"><div><div class="list-title">主数据要求</div><div class="muted">条码、规格、单位、分类、品牌、型号、温层和效期属性需完整。</div></div><span class="tag orange">必填</span></div>
            <div class="list-row"><div><div class="list-title">审批前校验</div><div class="muted">系统将校验条码唯一性、分类映射和附件完整性。</div></div><span class="tag green">自动</span></div>
          </div>
        </div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>商品明细录入</h3><div class="action-row"><button class="ghost-button" data-modal="form" data-action-label="导入商品明细">导入商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品名称</th><th>规格</th><th>单位</th><th>商品分类</th><th>品牌</th><th>型号</th><th>温层</th><th>保质期天数</th><th>长(cm)</th><th>宽(cm)</th><th>高(cm)</th><th>体积(m3)</th><th>重量(kg)</th><th>包装数量</th><th>是否批次管理</th><th>是否效期管理</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>附件资料</th></tr></thead><tbody>
        <tr><td>新品-医用手套</td><td>50盒/箱</td><td>箱</td><td>防护用品</td><td>护安</td><td>HA-GLOVE-50</td><td>常温</td><td>730</td><td>48</td><td>36</td><td>32</td><td>0.0553</td><td>16.8</td><td>50</td><td>是</td><td>是</td><td>13%</td><td>61.95</td><td>70.00</td><td>资质证照/图片</td></tr>
      </tbody></table></div></div>`
  },
  newproductedit: {
    title: "新品编辑页",
    desc: "用于对待审核或驳回的新品录入单进行修改，补齐主数据属性后重新提交审批。",
    actions: ["保存修改", "重新提交"],
    content: `
      <div class="grid-2">
        <div class="section-card">
          <div class="section-head"><h3>编辑信息</h3><div class="action-row"><a class="ghost-button" href="pc-newproduct.html">返回新品录入单</a><a class="primary-button" href="pc-newproduct-create.html">去录入页</a></div></div>
          <div class="pc-form-grid">
            <div class="pc-form-field" data-pc-form-label="单号" data-pc-filled-value="XP20260526005"><div class="pc-form-label">单号</div><div class="pc-form-value">XP20260526005</div></div>
            <div class="pc-form-field" data-pc-form-label="货主" data-pc-filled-value="外部货主C"><div class="pc-form-label">货主</div><div class="pc-form-value">外部货主C</div></div>
            <div class="pc-form-field" data-pc-form-label="商品分类" data-pc-filled-value="包材辅料"><div class="pc-form-label">商品分类</div><div class="pc-form-value">请选择商品分类</div></div>
            <div class="pc-form-field" data-pc-form-label="品牌" data-pc-filled-value="包易达"><div class="pc-form-label">品牌</div><div class="pc-form-value">请填写品牌</div></div>
            <div class="pc-form-field" data-pc-form-label="型号" data-pc-filled-value="BYD-BOX-12"><div class="pc-form-label">型号</div><div class="pc-form-value">请填写型号</div></div>
            <div class="pc-form-field" data-pc-form-label="长(cm)" data-pc-filled-value="60"><div class="pc-form-label">长(cm)</div><div class="pc-form-value">请填写长度</div></div>
            <div class="pc-form-field" data-pc-form-label="宽(cm)" data-pc-filled-value="40"><div class="pc-form-label">宽(cm)</div><div class="pc-form-value">请填写宽度</div></div>
            <div class="pc-form-field" data-pc-form-label="高(cm)" data-pc-filled-value="35"><div class="pc-form-label">高(cm)</div><div class="pc-form-value">请填写高度</div></div>
            <div class="pc-form-field" data-pc-form-label="体积(m3)" data-pc-filled-value="0.0840"><div class="pc-form-label">体积(m3)</div><div class="pc-form-value">请填写体积</div></div>
            <div class="pc-form-field" data-pc-form-label="重量(kg)" data-pc-filled-value="18.6"><div class="pc-form-label">重量(kg)</div><div class="pc-form-value">请填写重量</div></div>
            <div class="pc-form-field" data-pc-form-label="包装数量" data-pc-filled-value="12"><div class="pc-form-label">包装数量</div><div class="pc-form-value">请填写包装数量</div></div>
            <div class="pc-form-field full" data-pc-form-label="附件资料" data-pc-filled-value="已补传商品图片与合格证"><div class="pc-form-label">附件资料</div><div class="pc-form-value">请补传附件资料</div></div>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>编辑原因</h3><div class="action-row"><button class="ghost-button" data-modal="view" data-action-label="查看驳回原因">查看驳回原因</button></div></div>
          <div class="list">
            <div class="list-row"><div><div class="list-title">驳回原因 1</div><div class="muted">商品分类未命中标准主数据分类，请补充分类映射。</div></div><span class="tag red">需修改</span></div>
            <div class="list-row"><div><div class="list-title">驳回原因 2</div><div class="muted">附件缺少合格证或检测报告，请补传后再提交。</div></div><span class="tag orange">待补充</span></div>
            <div class="list-row"><div><div class="list-title">编辑要求</div><div class="muted">修改完成后需重新触发分类映射与条码校验。</div></div><span class="tag blue">重校验</span></div>
          </div>
        </div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>编辑后商品明细</h3><div class="action-row"><button class="ghost-button" data-modal="refresh" data-action-label="刷新校验结果">刷新校验结果</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>商品分类</th><th>品牌</th><th>型号</th><th>温层</th><th>保质期天数</th><th>长(cm)</th><th>宽(cm)</th><th>高(cm)</th><th>体积(m3)</th><th>重量(kg)</th><th>包装数量</th><th>是否批次管理</th><th>是否效期管理</th><th>税率</th><th>附件资料</th><th>编辑结果</th></tr></thead><tbody>
        <tr><td>MAT-NEW-003</td><td>6923000000032</td><td>新品-周转箱</td><td>12个/箱</td><td>箱</td><td>包材辅料</td><td>包易达</td><td>BYD-BOX-12</td><td>常温</td><td>3650</td><td>60</td><td>40</td><td>35</td><td>0.0840</td><td>18.6</td><td>12</td><td>是</td><td>否</td><td>13%</td><td>合格证/图片</td><td>待重新提交</td></tr>
      </tbody></table></div></div>`
  },
  inbound: {
    title: "入库申请单",
    desc: "外部货主提交入库申请，审核通过后自动生成入库通知单并下发WMS执行，后续结果再回传BMS。",
    actions: ["新增申请", "导出申请单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>入库申请单</h3><div class="action-row"><button class="ghost-button">批量审核</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">RK20260526001</div><div class="muted">外部货主B / 华南2仓 / 商品6项 / 数量320 / 待审核</div></div><span class="tag orange">待审核</span></div>
          <div class="list-row"><div><div class="list-title">RK20260526003</div><div class="muted">外部货主C / 华东1仓 / 商品4项 / 数量180 / 已审核</div></div><span class="tag blue">已下发WMS</span></div>
          <div class="list-row"><div><div class="list-title">RK20260526005</div><div class="muted">外部货主A / 华北3仓 / 商品8项 / 数量460 / 已完成</div></div><span class="tag green">已入库</span></div>
        </div></div>
        <div class="section-card"><h3>申请详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>RK20260526003</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主C</div></div>
          <div class="info-item"><div class="k">仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">申请状态</div><div><span class="tag blue">已下发WMS</span></div></div>
          <div class="info-item"><div class="k">审核结果</div><div>已审核通过</div></div>
          <div class="info-item"><div class="k">财务协同</div><div>待回传BMS</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>申请入库商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>申请数量</th><th>进项税率</th><th>未税进价</th><th>含税进价</th><th>未税进价金额</th><th>含税进价金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-RK-001</td><td>6903000000013</td><td>低值易耗品-清洁剂</td><td>12瓶/箱</td><td>箱</td><td>60</td><td>13%</td><td>42.48</td><td>48.00</td><td>2548.80</td><td>2880.00</td><td>331.20</td></tr>
        <tr><td>MAT-RK-002</td><td>6903000000020</td><td>低值易耗品-防护手套</td><td>24包/箱</td><td>箱</td><td>40</td><td>13%</td><td>26.55</td><td>30.00</td><td>1062.00</td><td>1200.00</td><td>138.00</td></tr>
        <tr><td>MAT-RK-003</td><td>6903000000037</td><td>低值易耗品-标签纸</td><td>10卷/箱</td><td>箱</td><td>50</td><td>13%</td><td>17.70</td><td>20.00</td><td>885.00</td><td>1000.00</td><td>115.00</td></tr>
        <tr><td>MAT-RK-004</td><td>6903000000044</td><td>低值易耗品-工具包</td><td>6套/箱</td><td>箱</td><td>30</td><td>13%</td><td>88.50</td><td>100.00</td><td>2655.00</td><td>3000.00</td><td>345.00</td></tr>
      </tbody></table></div></div>`
  },
  inboundnotice: {
    title: "入库通知单",
    desc: "入库申请单审核通过后自动生成入库通知单，并下发WMS执行入库作业。",
    actions: ["刷新通知状态", "导出通知单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>入库通知单列表</h3><div class="action-row"><button class="ghost-button">查看来源申请</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">RKTZ20260526001</div><div class="muted">来源申请 RK20260526001 / 外部货主B / 华南2仓 / 商品6项 / 数量320</div></div><span class="tag blue">待WMS接收</span></div>
          <div class="list-row"><div><div class="list-title">RKTZ20260526003</div><div class="muted">来源申请 RK20260526003 / 外部货主C / 华东1仓 / 商品4项 / 数量180</div></div><span class="tag green">已下发WMS</span></div>
          <div class="list-row"><div><div class="list-title">RKTZ20260526005</div><div class="muted">来源申请 RK20260526005 / 外部货主A / 华北3仓 / 商品8项 / 数量460</div></div><span class="tag gray">部分入库</span></div>
        </div></div>
        <div class="section-card"><h3>通知详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">通知单号</div><div>RKTZ20260526003</div></div>
          <div class="info-item"><div class="k">来源申请单</div><div>RK20260526003</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主C</div></div>
          <div class="info-item"><div class="k">通知仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">生成方式</div><div>审核通过自动生成</div></div>
          <div class="info-item"><div class="k">WMS状态</div><div>已下发待执行</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>通知商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>通知数量</th><th>进项税率</th><th>未税进价</th><th>含税进价</th><th>未税进价金额</th><th>含税进价金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-RK-001</td><td>6903000000013</td><td>低值易耗品-清洁剂</td><td>12瓶/箱</td><td>箱</td><td>60</td><td>13%</td><td>42.48</td><td>48.00</td><td>2548.80</td><td>2880.00</td><td>331.20</td></tr>
        <tr><td>MAT-RK-002</td><td>6903000000020</td><td>低值易耗品-防护手套</td><td>24包/箱</td><td>箱</td><td>40</td><td>13%</td><td>26.55</td><td>30.00</td><td>1062.00</td><td>1200.00</td><td>138.00</td></tr>
        <tr><td>MAT-RK-003</td><td>6903000000037</td><td>低值易耗品-标签纸</td><td>10卷/箱</td><td>箱</td><td>50</td><td>13%</td><td>17.70</td><td>20.00</td><td>885.00</td><td>1000.00</td><td>115.00</td></tr>
        <tr><td>MAT-RK-004</td><td>6903000000044</td><td>低值易耗品-工具包</td><td>6套/箱</td><td>箱</td><td>30</td><td>13%</td><td>88.50</td><td>100.00</td><td>2655.00</td><td>3000.00</td><td>345.00</td></tr>
      </tbody></table></div></div>`
  },
  purchasein: {
    title: "入库单",
    desc: "入库单由WMS直接传入，更新库存并同步资源资产和BMS。",
    actions: ["刷新接收", "导出结果"],
    content: `
      <table><thead><tr><th>单据号</th><th>申请单号</th><th>通知单号</th><th>来源系统</th><th>货主</th><th>仓库</th><th>库存地点</th><th>数量</th><th>库存状态</th><th>资源资产回传</th><th>BMS状态</th></tr></thead><tbody>
        <tr><td>CGRK20260526001</td><td>CGRK-SQ-20260526001</td><td>CGTH-TZ-20260526001</td><td>WMS</td><td>自有货主A</td><td>华东1仓</td><td>1000</td><td>220</td><td><span class="tag blue">已同步库存</span></td><td><span class="tag green">已发送</span></td><td><span class="tag orange">待回执</span></td></tr>
        <tr><td>CGRK20260526004</td><td>CGRK-SQ-20260526004</td><td>CGTH-TZ-20260526004</td><td>WMS</td><td>外部货主B</td><td>华南2仓</td><td>1001</td><td>130</td><td><span class="tag green">已完成</span></td><td><span class="tag green">已发送</span></td><td><span class="tag green">已回执</span></td></tr>
      </tbody></table>`
  },
  returnapply: {
    title: "退货申请单",
    desc: "支持手工创建和资源资产系统传入，审核通过后自动生成退货通知单。",
    actions: ["新建申请", "导出申请单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>退货申请单列表</h3><div class="action-row"><button class="ghost-button">批量审核</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">THSQ20260526001</div><div class="muted">手工创建 / 自有货主A / 华东1仓 / 商品2项 / 数量80 / 待审核</div></div><span class="tag orange">待审核</span></div>
          <div class="list-row"><div><div class="list-title">THSQ20260526003</div><div class="muted">资源资产系统 / 外部货主B / 华南2仓 / 商品3项 / 数量95 / 已审核</div></div><span class="tag blue">已生成通知单</span></div>
          <div class="list-row"><div><div class="list-title">THSQ20260526005</div><div class="muted">资源资产系统 / 自有货主C / 华北3仓 / 商品2项 / 数量60 / 已完成</div></div><span class="tag green">已处理完成</span></div>
        </div></div>
        <div class="section-card"><h3>申请详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>THSQ20260526003</div></div>
          <div class="info-item"><div class="k">来源方式</div><div>资源资产系统传入</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">申请仓库</div><div>华南2仓</div></div>
          <div class="info-item"><div class="k">申请状态</div><div><span class="tag blue">已审核通过</span></div></div>
          <div class="info-item"><div class="k">生成通知</div><div>已生成退货通知单</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>申请退货商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>申请数量</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>未税金额</th><th>含税金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-TH-001</td><td>6905000000011</td><td>低值易耗品-清洁剂</td><td>12瓶/箱</td><td>箱</td><td>BATCH20260508A</td><td>2026-05-08</td><td>2027-05-08</td><td>45</td><td>13%</td><td>42.48</td><td>48.00</td><td>1911.60</td><td>2160.00</td><td>248.40</td></tr>
        <tr><td>MAT-TH-002</td><td>6905000000028</td><td>低值易耗品-防护手套</td><td>24袋/箱</td><td>箱</td><td>BATCH20260510B</td><td>2026-05-10</td><td>2027-05-10</td><td>35</td><td>13%</td><td>26.55</td><td>30.00</td><td>929.25</td><td>1050.00</td><td>120.75</td></tr>
      </tbody></table></div></div>`
  },
  returnnotice: {
    title: "退货通知单",
    desc: "退货申请单审核通过后自动生成退货通知单，并下发WMS执行退货作业。",
    actions: ["刷新通知状态", "导出通知单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>退货通知单列表</h3><div class="action-row"><button class="ghost-button">查看来源申请</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">THTZ20260526001</div><div class="muted">来源申请 THSQ20260526001 / 自有货主A / 华东1仓 / 商品2项 / 数量80</div></div><span class="tag blue">待WMS接收</span></div>
          <div class="list-row"><div><div class="list-title">THTZ20260526003</div><div class="muted">来源申请 THSQ20260526003 / 外部货主B / 华南2仓 / 商品2项 / 数量80</div></div><span class="tag green">已下发WMS</span></div>
          <div class="list-row"><div><div class="list-title">THTZ20260526005</div><div class="muted">来源申请 THSQ20260526005 / 自有货主C / 华北3仓 / 商品2项 / 数量60</div></div><span class="tag gray">部分退货</span></div>
        </div></div>
        <div class="section-card"><h3>通知详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">通知单号</div><div>THTZ20260526003</div></div>
          <div class="info-item"><div class="k">来源申请单</div><div>THSQ20260526003</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">通知仓库</div><div>华南2仓</div></div>
          <div class="info-item"><div class="k">生成方式</div><div>审核通过自动生成</div></div>
          <div class="info-item"><div class="k">WMS下发</div><div>已下发待执行</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>通知退货商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>通知数量</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>未税金额</th><th>含税金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-TH-001</td><td>6905000000011</td><td>低值易耗品-清洁剂</td><td>12瓶/箱</td><td>箱</td><td>BATCH20260508A</td><td>2026-05-08</td><td>2027-05-08</td><td>45</td><td>13%</td><td>42.48</td><td>48.00</td><td>1911.60</td><td>2160.00</td><td>248.40</td></tr>
        <tr><td>MAT-TH-002</td><td>6905000000028</td><td>低值易耗品-防护手套</td><td>24袋/箱</td><td>箱</td><td>BATCH20260510B</td><td>2026-05-10</td><td>2027-05-10</td><td>35</td><td>13%</td><td>26.55</td><td>30.00</td><td>929.25</td><td>1050.00</td><td>120.75</td></tr>
      </tbody></table></div></div>`
  },
  purchasereturn: {
    title: "退货单",
    desc: "退货单由WMS传入后同步减少库存并传资源资产和BMS。",
    actions: ["查看失败单", "重新传单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>退货单列表</h3><div class="action-row"><button class="ghost-button">导出退货单</button></div></div><div class="data-table-wrap"><table><thead><tr><th>单据号</th><th>申请单号</th><th>通知单号</th><th>货主</th><th>仓库</th><th>库存地点</th><th>数量</th><th>库存状态</th><th>状态</th></tr></thead><tbody>
          <tr><td>CGTH20260526002</td><td>THSQ20260526001</td><td>THTZ20260526001</td><td>自有货主A</td><td>华东1仓</td><td>1000</td><td>80</td><td>已扣减</td><td><span class="tag blue">待传BMS</span></td></tr>
          <tr><td>CGTH20260526005</td><td>THSQ20260526003</td><td>THTZ20260526003</td><td>外部货主B</td><td>华南2仓</td><td>1001</td><td>45</td><td>已扣减</td><td><span class="tag green">已完成</span></td></tr>
        </tbody></table></div></div>
        <div class="section-card"><div class="notice"><div class="title">处理口径</div><div class="desc">来源于WMS，接收后同步减少库存台账和可用量，再自动同步资源资产系统与BMS。</div></div><div class="info-grid">
          <div class="info-item"><div class="k">当前单据</div><div>CGTH20260526002</div></div>
          <div class="info-item"><div class="k">申请单号</div><div>THSQ20260526001</div></div>
          <div class="info-item"><div class="k">通知单号</div><div>THTZ20260526001</div></div>
          <div class="info-item"><div class="k">来源系统</div><div>WMS</div></div>
          <div class="info-item"><div class="k">库存扣减</div><div>已完成</div></div>
          <div class="info-item"><div class="k">资源资产回传</div><div>已发送</div></div>
          <div class="info-item"><div class="k">BMS状态</div><div>待回执</div></div>
          <div class="info-item"><div class="k">异常状态</div><div>无差异</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>退货商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="data-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>批次库存数量</th><th>原入库数量</th><th>退货数量</th><th>进项税率</th><th>未税进价</th><th>含税进价</th><th>未税进价金额</th><th>含税进价金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-TH-001</td><td>6905000000011</td><td>低值易耗品-清洁剂</td><td>12瓶/箱</td><td>箱</td><td>BATCH20260508A</td><td>2026-05-08</td><td>2027-05-08</td><td>75</td><td>120</td><td>45</td><td>13%</td><td>42.48</td><td>48.00</td><td>1911.60</td><td>2160.00</td><td>248.40</td></tr>
        <tr><td>MAT-TH-002</td><td>6905000000028</td><td>低值易耗品-防护手套</td><td>24袋/箱</td><td>箱</td><td>BATCH20260510B</td><td>2026-05-10</td><td>2027-05-10</td><td>40</td><td>60</td><td>35</td><td>13%</td><td>26.55</td><td>30.00</td><td>929.25</td><td>1050.00</td><td>120.75</td></tr>
      </tbody></table></div></div>`
  },
  delivery: {
    title: "配送发货申请",
    desc: "基于客户要货生成配送单并下发WMS/TMS，跟踪履约和签收。",
    actions: ["刷新状态", "导出配送单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>配送申请单详情</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">刷新状态</button></div></div><div class="info-grid">
          <div class="info-item"><div class="k">单据号</div><div>PS20260526001</div></div>
          <div class="info-item"><div class="k">配送申请单号</div><div>DZT20260526001</div></div>
          <div class="info-item"><div class="k">来源要货单</div><div>YH20260526001</div></div>
          <div class="info-item"><div class="k">客户</div><div>内部客户-华东分部</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">发货仓</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">库存地点</div><div>1000</div></div>
          <div class="info-item"><div class="k">是否需要运输服务</div><div><span class="tag green">是</span></div></div>
          <div class="info-item"><div class="k">运输单号</div><div>YD9087612</div></div>
          <div class="info-item"><div class="k">配送状态</div><div><span class="tag blue">执行中</span></div></div>
          <div class="info-item"><div class="k">WMS状态</div><div>已拣货，待复核</div></div>
          <div class="info-item"><div class="k">TMS状态</div><div>已生成运单，待发运</div></div>
        </div></div>
        <div class="section-card"><h3>执行轨迹</h3><div class="list">
          <div class="list-row"><div><div class="list-title">10:10 已下发WMS/TMS</div><div class="muted">系统自动生成配送通知单并下发执行系统</div></div><span class="tag blue">节点1</span></div>
          <div class="list-row"><div><div class="list-title">10:35 WMS开始拣货</div><div class="muted">已锁定库存并生成出库作业任务</div></div><span class="tag blue">节点2</span></div>
          <div class="list-row"><div><div class="list-title">11:20 TMS已接单</div><div class="muted">承运商：顺捷物流，运单号 YD9087612</div></div><span class="tag green">节点3</span></div>
        </div></div>
      </div>`
  },
  deliveryorder: {
    title: "配送单",
    desc: "WMS出库执行完成后回传生成配送单，同步扣减库存并传资源资产和BMS。",
    actions: ["刷新状态", "导出配送单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>配送单详情</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">刷新状态</button></div></div><div class="info-grid">
          <div class="info-item"><div class="k">配送单号</div><div>PSDD20260526001</div></div>
          <div class="info-item"><div class="k">要货单号</div><div>YH20260526001</div></div>
          <div class="info-item"><div class="k">配送申请单号</div><div>DZT20260526001</div></div>
          <div class="info-item"><div class="k">客户</div><div>内部客户-华东分部</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">发货仓</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">库存地点</div><div>1000</div></div>
          <div class="info-item"><div class="k">签收状态</div><div><span class="tag green">已签收</span></div></div>
          <div class="info-item"><div class="k">库存扣减</div><div>已完成</div></div>
          <div class="info-item"><div class="k">资源资产回传</div><div><span class="tag green">已发送</span></div></div>
          <div class="info-item"><div class="k">BMS状态</div><div><span class="tag green">已回执</span></div></div>
          <div class="info-item"><div class="k">来源系统</div><div>WMS</div></div>
        </div></div>
        <div class="section-card"><h3>执行轨迹</h3><div class="list">
          <div class="list-row"><div><div class="list-title">14:02 WMS出库回传</div><div class="muted">WMS复核完成并回传出库结果，生成配送单</div></div><span class="tag green">节点1</span></div>
          <div class="list-row"><div><div class="list-title">14:02 库存扣减完成</div><div class="muted">3PL库存台账和可用量同步扣减</div></div><span class="tag green">节点2</span></div>
          <div class="list-row"><div><div class="list-title">14:03 资源资产系统已回传</div><div class="muted">配送结果已写入资源资产系统</div></div><span class="tag green">节点3</span></div>
          <div class="list-row"><div><div class="list-title">14:03 BMS已回执</div><div class="muted">财务单据已传递BMS并收到回执</div></div><span class="tag green">节点4</span></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>配送商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="data-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>库存地点</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>拣货数量</th><th>出库数量</th><th>签收数量</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>未税金额</th><th>含税金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-PS-001</td><td>6907000000016</td><td>物料-商品001</td><td>12瓶/箱</td><td>箱</td><td>1000</td><td>BATCH20260518A</td><td>2026-05-18</td><td>2027-05-18</td><td>100</td><td>100</td><td>100</td><td>13%</td><td>42.48</td><td>48.00</td><td>4248.00</td><td>4800.00</td><td>552.00</td></tr>
        <tr><td>MAT-PS-002</td><td>6907000000023</td><td>物料-商品002</td><td>24袋/箱</td><td>箱</td><td>1000</td><td>BATCH20260520B</td><td>2026-05-20</td><td>2027-05-20</td><td>160</td><td>160</td><td>160</td><td>13%</td><td>26.55</td><td>30.00</td><td>4248.00</td><td>4800.00</td><td>552.00</td></tr>
      </tbody></table></div></div>`
  },
  transportservice: {
    title: "运输服务申请单",
    desc: "配送申请单触发运输服务需求，生成运输服务申请单并匹配承运商，跟踪运输执行和签收状态。",
    actions: ["刷新状态", "导出运输服务申请单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>运输服务申请单详情</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">刷新状态</button></div></div><div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>YS20260526001</div></div>
          <div class="info-item"><div class="k">配送申请单号</div><div>DZT20260526001</div></div>
          <div class="info-item"><div class="k">来源要货单</div><div>YH20260526001</div></div>
          <div class="info-item"><div class="k">客户</div><div>内部客户-华东分部</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">发货仓</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">收货地址</div><div>上海市浦东新区张江路100号</div></div>
          <div class="info-item"><div class="k">要求到货日期</div><div>2026-05-28</div></div>
          <div class="info-item"><div class="k">运输方式</div><div>公路运输</div></div>
          <div class="info-item"><div class="k">承运商</div><div>顺捷物流</div></div>
          <div class="info-item"><div class="k">运输状态</div><div><span class="tag blue">运输中</span></div></div>
        </div></div>
        <div class="section-card"><h3>执行轨迹</h3><div class="list">
          <div class="list-row"><div><div class="list-title">10:12 配送申请单触发运输服务需求</div><div class="muted">系统自动匹配承运商并生成运输服务申请单</div></div><span class="tag green">节点1</span></div>
          <div class="list-row"><div><div class="list-title">10:30 承运商确认接单</div><div class="muted">顺捷物流已确认，预计10:40提货</div></div><span class="tag green">节点2</span></div>
          <div class="list-row"><div><div class="list-title">11:00 运输中</div><div class="muted">已提货出发，预计2026-05-28到达</div></div><span class="tag blue">节点3</span></div>
        </div></div>
      </div>`
  },
  errororder: {
    title: "差错申请单",
    desc: "记录配送发货与实际收货之间的数量差异，支持差错确认、补发和扣减处理。",
    actions: ["新建差错申请单", "导出"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>差错申请单详情</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">刷新状态</button></div></div><div class="info-grid">
          <div class="info-item"><div class="k">差错单号</div><div>CC20260526001</div></div>
          <div class="info-item"><div class="k">关联配送单</div><div>PS20260526001</div></div>
          <div class="info-item"><div class="k">客户</div><div>内部客户-华东分部</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">发货仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">差错类型</div><div><span class="tag orange">数量差异</span></div></div>
          <div class="info-item"><div class="k">差错状态</div><div><span class="tag blue">处理中</span></div></div>
          <div class="info-item"><div class="k">发现日期</div><div>2026-05-27</div></div>
        </div></div>
        <div class="section-card"><h3>处理轨迹</h3><div class="list">
          <div class="list-row"><div><div class="list-title">05-27 14:00 客户签收时反馈差异</div><div class="muted">签收数量与发货数量不一致，触发差错流程</div></div><span class="tag orange">节点1</span></div>
          <div class="list-row"><div><div class="list-title">05-27 15:30 仓库确认差异</div><div class="muted">仓库复核确认发货数量无误，差异出在配送途中</div></div><span class="tag blue">节点2</span></div>
          <div class="list-row"><div><div class="list-title">05-28 09:00 生成补发任务</div><div class="muted">按差错明细生成补发出库任务</div></div><span class="tag green">节点3</span></div>
        </div></div>
      </div>`
  },
  qualityreport: {
    title: "质检报告",
    desc: "记录商品每个生产批号的质检报告，跟踪质检结果与合格状态。",
    actions: ["新建报告", "导出报告"],
    content: `      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>质检报告列表</h3><div class="action-row"><button class="primary-button">新建报告</button><button class="ghost-button">导出报告</button></div></div><div class="data-table-wrap"><table><thead><tr><th>报告编号</th><th>货主</th><th>仓库</th><th>商品编码</th><th>商品名称</th><th>生产批号</th><th>供应商</th><th>报告类型</th><th>检验结论</th><th>报告日期</th><th>状态</th></tr></thead><tbody>
          <tr><td>ZJBG20260526001</td><td>自有货主A</td><td>华东1仓</td><td>MAT-PD-001</td><td>物料-低值易耗品001</td><td>BATCH20260526A</td><td>供应商A-华东物料</td><td>入库质检</td><td><span class="tag green">合格</span></td><td>2026-05-26</td><td><span class="tag green">已生效</span></td></tr>
          <tr><td>ZJBG20260526002</td><td>自有货主A</td><td>华东1仓</td><td>MAT-PD-002</td><td>物料-低值易耗品002</td><td>BATCH20260526B</td><td>供应商A-华东物料</td><td>入库质检</td><td><span class="tag green">合格</span></td><td>2026-05-26</td><td><span class="tag green">已生效</span></td></tr>
          <tr><td>ZJBG20260526003</td><td>外部货主B</td><td>华南2仓</td><td>MAT-PD-004</td><td>防护手套-无粉</td><td>BATCH20260510A</td><td>供应商B-华南日化</td><td>入库质检</td><td><span class="tag orange">让步接收</span></td><td>2026-05-10</td><td><span class="tag green">已生效</span></td></tr>
          <tr><td>ZJBG20260526004</td><td>自有货主A</td><td>华北3仓</td><td>MAT-PD-003</td><td>低值易耗品-清洁剂</td><td>BATCH20260508A</td><td>供应商A-华东物料</td><td>定期送检</td><td><span class="tag green">合格</span></td><td>2026-05-08</td><td><span class="tag green">已生效</span></td></tr>
          <tr><td>ZJBG20260526005</td><td>自有货主C</td><td>华北3仓</td><td>MAT-PD-006</td><td>低值易耗品-办公用品</td><td>BATCH20260512A</td><td>供应商C-华北食品</td><td>入库质检</td><td><span class="tag red">不合格</span></td><td>2026-05-12</td><td><span class="tag red">已作废</span></td></tr>
        </tbody></table></div></div>
        <div class="section-card"><div class="notice"><div class="title">处理口径</div><div class="desc">质检报告记录每个生产批号的检验结果，合格批次方可正常出入库，不合格批次触发退货或销毁流程。</div></div><div class="info-grid">
          <div class="info-item"><div class="k">报告编号</div><div>ZJBG20260526001</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">商品编码</div><div>MAT-PD-001</div></div>
          <div class="info-item"><div class="k">生产批号</div><div>BATCH20260526A</div></div>
          <div class="info-item"><div class="k">供应商</div><div>供应商A-华东物料</div></div>
          <div class="info-item"><div class="k">检验结论</div><div><span class="tag green">合格</span></div></div>
          <div class="info-item"><div class="k">报告状态</div><div>已生效</div></div>
        </div></div>
      </div>`
  },
  returnapplyin: {
    title: "退仓申请单",
    desc: "支持手工创建和资源资产系统传入，审批通过后自动生成退仓通知单。",
    actions: ["新建申请", "导出申请单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>退仓申请单列表</h3><div class="action-row"><button class="ghost-button">批量审批</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">TKSQ20260526001</div><div class="muted">手工创建 / 内部客户-华东分部 / 自有货主A / 商品2项 / 草稿</div></div><span class="tag gray">草稿</span></div>
          <div class="list-row"><div><div class="list-title">TKSQ20260526003</div><div class="muted">资源资产系统 / 外部客户-门店联盟 / 外部货主B / 商品2项 / 待审批</div></div><span class="tag orange">待审批</span></div>
          <div class="list-row"><div><div class="list-title">TKSQ20260526005</div><div class="muted">手工创建 / 内部客户-共享仓 / 自有货主C / 商品3项 / 已生成通知</div></div><span class="tag blue">已审核通过</span></div>
        </div></div>
        <div class="section-card"><h3>申请详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>TKSQ20260526003</div></div>
          <div class="info-item"><div class="k">来源方式</div><div>资源资产系统传入</div></div>
          <div class="info-item"><div class="k">客户</div><div>外部客户-门店联盟</div></div>
          <div class="info-item"><div class="k">原货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">申请状态</div><div><span class="tag orange">待审批</span></div></div>
          <div class="info-item"><div class="k">生成通知</div><div>待审批通过后生成</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>申请退仓商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>原配送数量</th><th>可退数量</th><th>申请数量</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>未税金额</th><th>含税金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-TK-001</td><td>6908100000013</td><td>物料-商品011</td><td>12瓶/箱</td><td>箱</td><td>BATCH20260506A</td><td>2026-05-06</td><td>2027-05-06</td><td>50</td><td>30</td><td>30</td><td>13%</td><td>42.48</td><td>48.00</td><td>1274.40</td><td>1440.00</td><td>165.60</td></tr>
        <tr><td>MAT-TK-002</td><td>6908100000020</td><td>物料-商品012</td><td>24袋/箱</td><td>箱</td><td>BATCH20260509B</td><td>2026-05-09</td><td>2027-05-09</td><td>25</td><td>15</td><td>15</td><td>13%</td><td>26.55</td><td>30.00</td><td>398.25</td><td>450.00</td><td>51.75</td></tr>
      </tbody></table></div></div>`
  },
  returnnoticein: {
    title: "退仓通知单",
    desc: "退仓申请单审批通过后自动生成退仓通知单，并下发WMS执行退仓收货。",
    actions: ["刷新通知状态", "导出通知单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>退仓通知单列表</h3><div class="action-row"><button class="ghost-button">查看来源申请</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">TKTZ20260526001</div><div class="muted">来源申请 TKSQ20260526001 / 自有货主A / 华东1仓 / 商品2项</div></div><span class="tag blue">待WMS接收</span></div>
          <div class="list-row"><div><div class="list-title">TKTZ20260526003</div><div class="muted">来源申请 TKSQ20260526003 / 外部货主B / 华南2仓 / 商品2项</div></div><span class="tag green">已下发WMS</span></div>
          <div class="list-row"><div><div class="list-title">TKTZ20260526005</div><div class="muted">来源申请 TKSQ20260526005 / 自有货主C / 华北3仓 / 商品3项</div></div><span class="tag gray">部分收货</span></div>
        </div></div>
        <div class="section-card"><h3>通知详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">通知单号</div><div>TKTZ20260526003</div></div>
          <div class="info-item"><div class="k">来源申请单</div><div>TKSQ20260526003</div></div>
          <div class="info-item"><div class="k">原货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">退回仓</div><div>华南2仓</div></div>
          <div class="info-item"><div class="k">生成方式</div><div>审批通过自动生成</div></div>
          <div class="info-item"><div class="k">WMS状态</div><div>已下发待执行</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;"><div class="section-head"><h3>通知退仓商品明细</h3><div class="action-row"><button class="ghost-button">导出商品明细</button></div></div><div class="drawer-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>生产批号</th><th>生产日期</th><th>保质日期</th><th>通知数量</th><th>税率</th><th>未税进价</th><th>含税进价</th><th>未税金额</th><th>含税金额</th><th>税额</th></tr></thead><tbody>
        <tr><td>MAT-TK-001</td><td>6908100000013</td><td>物料-商品011</td><td>12瓶/箱</td><td>箱</td><td>BATCH20260506A</td><td>2026-05-06</td><td>2027-05-06</td><td>30</td><td>13%</td><td>42.48</td><td>48.00</td><td>1274.40</td><td>1440.00</td><td>165.60</td></tr>
        <tr><td>MAT-TK-002</td><td>6908100000020</td><td>物料-商品012</td><td>24袋/箱</td><td>箱</td><td>BATCH20260509B</td><td>2026-05-09</td><td>2027-05-09</td><td>15</td><td>13%</td><td>26.55</td><td>30.00</td><td>398.25</td><td>450.00</td><td>51.75</td></tr>
      </tbody></table></div></div>`
  },
  return: {
    title: "退仓单",
    desc: "退仓单由WMS回传或通知执行结果生成，用于跟踪退仓收货、库存回写和财务联动。",
    actions: ["导出退仓单", "刷新结果"],
    content: `
      <div class="grid-2">
        <div class="section-card"><h3>退仓单列表</h3><table><thead><tr><th>退仓单号</th><th>来源单据</th><th>客户</th><th>原货主</th><th>退回仓</th><th>库存地点</th><th>状态</th></tr></thead><tbody>
          <tr><td>TK20260526008</td><td>PS20260521012</td><td>内部客户-华东分部</td><td>自有货主A</td><td>华东1仓</td><td>1000</td><td><span class="tag orange">审批中</span></td></tr>
          <tr><td>TK20260526011</td><td>PS20260522003</td><td>外部客户-门店联盟</td><td>外部货主B</td><td>华南2仓</td><td>1001</td><td><span class="tag blue">仓库收货中</span></td></tr>
          <tr><td>TK20260526015</td><td>PS20260523006</td><td>内部客户-共享仓</td><td>自有货主C</td><td>华北3仓</td><td>1000</td><td><span class="tag green">已入库</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><h3>退仓处理侧栏</h3><div class="list">
          <div class="list-row"><div><div class="list-title">原单回溯结果</div><div class="muted">已匹配原货主、自有货主A；已匹配原仓库、华东1仓</div></div><span class="tag green">已完成</span></div>
          <div class="list-row"><div><div class="list-title">WMS收货状态</div><div class="muted">待下发退仓收货指令</div></div><span class="tag orange">待处理</span></div>
          <div class="list-row"><div><div class="list-title">财务协同</div><div class="muted">退仓结果入库后自动传 BMS</div></div><span class="tag gray">未触发</span></div>
        </div></div>
      </div>`
  },
  transfer: {
    title: "调拨单",
    desc: "调拨单来源于WMS，接收后同步库存，并传资源资产和BMS。",
    actions: ["刷新WMS结果", "批量导出"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>调拨单列表</h3><div class="action-row"><button class="primary-button">查看库存变化</button></div></div><table><thead><tr><th>调拨单号</th><th>调出仓</th><th>调入仓</th><th>货主</th><th>商品数</th><th>状态</th></tr></thead><tbody>
          <tr><td>DB20260526001</td><td>华东1仓</td><td>华东2仓</td><td>自有货主A</td><td>4</td><td><span class="tag blue">已同步库存</span></td></tr>
          <tr><td>DB20260526003</td><td>华南2仓</td><td>华中1仓</td><td>外部货主B</td><td>2</td><td><span class="tag orange">待传BMS</span></td></tr>
          <tr><td>DB20260526005</td><td>华北3仓</td><td>华北4仓</td><td>自有货主C</td><td>6</td><td><span class="tag green">已完成</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><h3>调拨执行视图</h3><div class="info-grid">
          <div class="info-item"><div class="k">来源系统</div><div>WMS</div></div>
          <div class="info-item"><div class="k">当前状态</div><div><span class="tag blue">已同步库存</span></div></div>
          <div class="info-item"><div class="k">调出仓影响</div><div>库存 -120</div></div>
          <div class="info-item"><div class="k">调入仓影响</div><div>库存 +120</div></div>
          <div class="info-item"><div class="k">资源资产回传</div><div>已发送</div></div>
          <div class="info-item"><div class="k">BMS传单</div><div>待回执</div></div>
        </div></div>
      </div>`
  },
  loss: {
    title: "损溢单",
    desc: "记录损溢申请、审批、库存调整和财务联动。",
    actions: ["发起损溢", "查看审计"],
    content: `
      <div class="grid-2">
        <div class="section-card"><h3>损溢单列表</h3><div class="list">
          <div class="list-row"><div><div class="list-title">SY20260526005</div><div class="muted">华南2仓 / 破损 / 数量 32 / 责任人 王婷</div></div><span class="tag red">审批中</span></div>
          <div class="list-row"><div><div class="list-title">SY20260526009</div><div class="muted">华东1仓 / 自然损耗 / 数量 18 / 责任人 李波</div></div><span class="tag blue">处理中</span></div>
          <div class="list-row"><div><div class="list-title">SY20260526012</div><div class="muted">华北3仓 / 污染报废 / 数量 9 / 责任人 陈明</div></div><span class="tag green">已完成</span></div>
        </div></div>
        <div class="section-card"><h3>损溢处理说明</h3><div class="list">
          <div class="list-row"><div><div class="list-title">库存影响</div><div class="muted">扣减可用库存并记录损溢明细</div></div><span class="tag orange">关键</span></div>
          <div class="list-row"><div><div class="list-title">财务联动</div><div class="muted">审批完成后同步 BMS 进行财务处理</div></div><span class="tag blue">自动</span></div>
          <div class="list-row"><div><div class="list-title">审计留痕</div><div class="muted">保留责任认定、原因、图片与处理记录</div></div><span class="tag gray">必备</span></div>
        </div></div>
      </div>`
  },
  positionadjust: {
    title: "库存地点调整单",
    desc: "用于调整库存库存地点，支持同一仓库内库存地点间的商品移位操作。",
    actions: ["新建调整", "导出"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>库存地点调整单列表</h3><div class="action-row"><button class="primary-button">新建调整</button><button class="ghost-button">导出</button></div></div><table><thead><tr><th>调整单号</th><th>货主</th><th>仓库</th><th>原库存地点</th><th>目标库存地点</th><th>商品数</th><th>调整状态</th></tr></thead><tbody>
          <tr><td>CW20260601001</td><td>自有货主A</td><td>华东1仓</td><td>1000</td><td>1000</td><td>4</td><td><span class="tag green">已完成</span></td></tr>
          <tr><td>CW20260601002</td><td>外部货主B</td><td>华南2仓</td><td>1001</td><td>1001</td><td>2</td><td><span class="tag orange">调整中</span></td></tr>
          <tr><td>CW20260601003</td><td>自有货主C</td><td>华北3仓</td><td>1005</td><td>1000</td><td>3</td><td><span class="tag blue">待确认</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><h3>库存地点调整说明</h3><div class="info-grid">
          <div class="info-item"><div class="k">调整类型</div><div>库存地点移位</div></div>
          <div class="info-item"><div class="k">影响范围</div><div>源库存地点扣减、目标库存地点增加</div></div>
          <div class="info-item"><div class="k">库存联动</div><div>实时同步WMS库存</div></div>
          <div class="info-item"><div class="k">资源资产回传</div><div>调整后自动回传</div></div>
          <div class="info-item"><div class="k">BMS传单</div><div>调整完成后自动传单</div></div>
          <div class="info-item"><div class="k">审计留痕</div><div>保留调整原因、操作人和审批记录</div></div>
        </div></div>
      </div>`
  },
  inventorycheck: {
    title: "盘点结果单",
    desc: "记录WMS盘点完成后的盘点结果，3PL确认后可联动生成损溢单，完成库存调整闭环。",
    actions: ["确认结果", "生成损溢单", "导出盘点结果"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>盘点结果单列表</h3><div class="action-row"><button class="ghost-button">导出</button></div></div><table><thead><tr><th>盘点单号</th><th>计划单号</th><th>通知单号</th><th>仓库</th><th>货主</th><th>盘点类型</th><th>商品数</th><th>差异数</th><th>状态</th></tr></thead><tbody>
          <tr><td>PD20260526001</td><td>PDJH20260526001</td><td>PDTZ20260526001</td><td>华东1仓</td><td>自有货主A</td><td>全盘</td><td>86</td><td>3</td><td><span class="tag orange">待确认</span></td></tr>
          <tr><td>PD20260526003</td><td>PDJH20260526003</td><td>PDTZ20260526003</td><td>华南2仓</td><td>外部货主B</td><td>抽盘</td><td>42</td><td>1</td><td><span class="tag green">已确认</span></td></tr>
          <tr><td>PD20260526005</td><td>PDJH20260526004</td><td>PDTZ20260526004</td><td>华北3仓</td><td>自有货主C</td><td>抽盘</td><td>28</td><td>0</td><td><span class="tag blue">已生成损溢单</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><div class="notice"><div class="title">处理口径</div><div class="desc">确认盘点差异后可联动生成损溢单，完成库存调整闭环。</div></div><div class="info-grid">
          <div class="info-item"><div class="k">盘点单号</div><div>PD20260526001</div></div>
          <div class="info-item"><div class="k">申请单号</div><div>PDJH20260526001</div></div>
          <div class="info-item"><div class="k">通知单号</div><div>PDTZ20260526001</div></div>
          <div class="info-item"><div class="k">仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">盘点类型</div><div>全盘</div></div>
          <div class="info-item"><div class="k">盘点结果</div><div>有差异</div></div>
          <div class="info-item"><div class="k">确认状态</div><div>待确认</div></div>
        </div></div>
      </div>`
  },
  inventoryplan: {
    title: "盘点计划申请单",
    desc: "支持手工创建和资源资产系统传入盘点计划，审核通过后自动生成盘点通知单。",
    actions: ["新建申请", "导出申请单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>盘点计划申请单列表</h3><div class="action-row"><button class="primary-button">新建申请</button><button class="ghost-button">批量审核</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">PDJH20260526001</div><div class="muted">自有货主A / 华东1仓 / 库存地点 A-01 全区 / 全盘 / 预计2026-06-15 / 待审核</div></div><span class="tag orange">待审核</span></div>
          <div class="list-row"><div><div class="list-title">PDJH20260526002</div><div class="muted">自有货主A / 华东1仓 / 库存地点 1000 / 抽盘 / 预计2026-06-18 / 品类：清洁剂、防护手套 / 待审批</div></div><span class="tag orange">待审批</span></div>
          <div class="list-row"><div><div class="list-title">PDJH20260526003</div><div class="muted">外部货主B / 华南2仓 / 库存地点 1001 / 抽盘 / 预计2026-06-20 / 品类：防护手套、低值易耗品 / 已生成通知单</div></div><span class="tag blue">已生成通知单</span></div>
          <div class="list-row"><div><div class="list-title">PDJH20260526004</div><div class="muted">自有货主A / 华北3仓 / 库存地点 1000 / 抽盘 / 预计2026-06-22 / 品类：低值易耗品、清洁剂 / 已生成通知单</div></div><span class="tag blue">已生成通知单</span></div>
          <div class="list-row"><div><div class="list-title">PDJH20260526005</div><div class="muted">自有货主C / 华北3仓 / 库存地点 1005 / 抽盘 / 预计2026-06-25 / 品类：清洁剂 / 审批驳回</div></div><span class="tag red">审批驳回</span></div>
        </div></div>
        <div class="section-card"><div class="notice"><div class="title">处理口径</div><div class="desc">审核通过后自动生成盘点通知单，下发WMS执行盘点作业。</div></div><div class="info-grid">
          <div class="info-item"><div class="k">当前单据</div><div>PDJH20260526001</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">盘点仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">盘点库存地点</div><div>A-01 全区</div></div>
          <div class="info-item"><div class="k">盘点类型</div><div>全盘</div></div>
          <div class="info-item"><div class="k">预计盘点日期</div><div>2026-06-15</div></div>
          <div class="info-item"><div class="k">盘点时间</div><div>2026-05-28 08:00</div></div>
          <div class="info-item"><div class="k">申请状态</div><div>待审核</div></div>
          <div class="info-item"><div class="k">生成通知</div><div>待审核通过</div></div>
        </div></div>
      </div>`
  },
  inventorynotify: {
    title: "盘点通知单",
    desc: "盘点计划申请单审核通过后自动生成盘点通知单，并下发WMS执行盘点作业。",
    actions: ["刷新通知状态", "导出通知单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>盘点通知单列表</h3><div class="action-row"><button class="ghost-button">导出通知单</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">PDTZ20260526001</div><div class="muted">来源申请 PDJH20260526001 / 自有货主A / 华东1仓 / 库存地点 A-01 全区 / 全盘 / 待WMS接收</div></div><span class="tag orange">待WMS接收</span></div>
          <div class="list-row"><div><div class="list-title">PDTZ20260526003</div><div class="muted">来源申请 PDJH20260526003 / 外部货主B / 华南2仓 / 库存地点 1001 / 抽盘 / 已下发WMS</div></div><span class="tag blue">已下发WMS</span></div>
          <div class="list-row"><div><div class="list-title">PDTZ20260526005</div><div class="muted">来源申请 PDJH20260526004 / 自有货主A / 华北3仓 / 库存地点 1000 / 抽盘 / 盘点执行中</div></div><span class="tag green">盘点执行中</span></div>
        </div></div>
        <div class="section-card"><div class="notice"><div class="title">处理口径</div><div class="desc">盘点通知单下发WMS后，等待WMS回传盘点结果，自动生成盘点结果单。</div></div><div class="info-grid">
          <div class="info-item"><div class="k">通知单号</div><div>PDTZ20260526001</div></div>
          <div class="info-item"><div class="k">来源申请单</div><div>PDJH20260526001</div></div>
          <div class="info-item"><div class="k">货主</div><div>自有货主A</div></div>
          <div class="info-item"><div class="k">盘点仓库</div><div>华东1仓</div></div>
          <div class="info-item"><div class="k">盘点库存地点</div><div>A-01 全区</div></div>
          <div class="info-item"><div class="k">盘点类型</div><div>全盘</div></div>
          <div class="info-item"><div class="k">盘点时间</div><div>2026-05-28 08:00</div></div>
          <div class="info-item"><div class="k">商品范围</div><div>库存地点 A-01 全部商品（86项）</div></div>
          <div class="info-item"><div class="k">生成方式</div><div>审核通过自动生成</div></div>
          <div class="info-item"><div class="k">WMS下发</div><div>已下发待执行</div></div>
        </div></div>
      </div>`
  },
  ownershipapply: {
    title: "物权转移申请单",
    desc: "支持手工创建物权转移申请单，审批通过后自动生成物权转移通知单。",
    actions: ["新建申请", "查看规则"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>物权转移申请单列表</h3><div class="action-row"><button class="ghost-button">批量审批</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">WQSQ20260526001</div><div class="muted">外部货主B -> 自有货主A / 华东1仓 / 商品2项 / 草稿</div></div><span class="tag gray">草稿</span></div>
          <div class="list-row"><div><div class="list-title">WQSQ20260526003</div><div class="muted">外部货主C -> 自有货主C / 华北3仓 / 商品2项 / 待审批</div></div><span class="tag orange">待审批</span></div>
          <div class="list-row"><div><div class="list-title">WQSQ20260526005</div><div class="muted">外部货主A -> 自有货主A / 华南2仓 / 商品1项 / 已生成通知</div></div><span class="tag blue">已审核通过</span></div>
        </div></div>
        <div class="section-card"><h3>申请详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>WQSQ20260526003</div></div>
          <div class="info-item"><div class="k">原货主</div><div>外部货主C</div></div>
          <div class="info-item"><div class="k">目标货主</div><div>自有货主C</div></div>
          <div class="info-item"><div class="k">仓库</div><div>华北3仓</div></div>
          <div class="info-item"><div class="k">申请状态</div><div><span class="tag orange">待审批</span></div></div>
          <div class="info-item"><div class="k">生成通知</div><div>待审批通过后生成</div></div>
        </div></div>
      </div>`
  },
  ownershipnotice: {
    title: "物权转移通知单",
    desc: "物权转移申请单审批通过后自动生成通知单，并下发WMS执行库存归属调整。",
    actions: ["刷新通知状态", "导出通知单"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>物权转移通知单列表</h3><div class="action-row"><button class="ghost-button">查看来源申请</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">WQTZ20260526001</div><div class="muted">来源申请 WQSQ20260526001 / 外部货主B -> 自有货主A / 华东1仓</div></div><span class="tag blue">待WMS接收</span></div>
          <div class="list-row"><div><div class="list-title">WQTZ20260526003</div><div class="muted">来源申请 WQSQ20260526003 / 外部货主C -> 自有货主C / 华北3仓</div></div><span class="tag green">已下发WMS</span></div>
        </div></div>
        <div class="section-card"><h3>通知详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">通知单号</div><div>WQTZ20260526003</div></div>
          <div class="info-item"><div class="k">来源申请单</div><div>WQSQ20260526003</div></div>
          <div class="info-item"><div class="k">原货主</div><div>外部货主C</div></div>
          <div class="info-item"><div class="k">目标货主</div><div>自有货主C</div></div>
          <div class="info-item"><div class="k">WMS状态</div><div>已下发待执行</div></div>
          <div class="info-item"><div class="k">财务协同</div><div>待WMS执行完成后传BMS</div></div>
        </div></div>
      </div>`
  },
  ownership: {
    title: "物权转移单",
    desc: "支持原货主到目标货主的货权转换结果回写，联动WMS和BMS。",
    actions: ["查看转移结果", "查看规则"],
    content: `
      <div class="grid-2">
        <div class="section-card"><h3>物权转移单列表</h3><table><thead><tr><th>转移单号</th><th>原货主</th><th>目标货主</th><th>仓库</th><th>数量</th><th>状态</th></tr></thead><tbody>
          <tr><td>WQ20260526003</td><td>外部货主B</td><td>自有货主A</td><td>华东1仓</td><td>260</td><td><span class="tag orange">待审批</span></td></tr>
          <tr><td>WQ20260526007</td><td>外部货主C</td><td>自有货主C</td><td>华北3仓</td><td>140</td><td><span class="tag blue">待WMS确认</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><h3>货权变化概览</h3><div class="list">
          <div class="list-row"><div><div class="list-title">校验项目</div><div class="muted">合同有效性、库存可用量、货主属性、仓库范围</div></div><span class="tag blue">已配置</span></div>
          <div class="list-row"><div><div class="list-title">WMS结果回传</div><div class="muted">回传库存属性变更结果后更新归属台账</div></div><span class="tag orange">待确认</span></div>
          <div class="list-row"><div><div class="list-title">BMS协同</div><div class="muted">转移完成后传递物权转移财务数据</div></div><span class="tag gray">自动处理</span></div>
        </div></div>
      </div>`
  },
  inoutrecord: {
    title: "出入库记录",
    desc: "统一记录各类入库、出库及库存归属调整操作，便于追溯库存变化和对账留痕。",
    actions: ["导出记录", "刷新记录"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>出入库动态概览</h3><div class="action-row"><button class="ghost-button">查看异常</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">今日入库动作</div><div class="muted">入库单、退仓单入库、调拨入库共 42 条，已同步库存台账。</div></div><span class="tag blue">入库</span></div>
          <div class="list-row"><div><div class="list-title">今日出库动作</div><div class="muted">配送单、退货单、调拨出库共 37 条，已登记出库留痕。</div></div><span class="tag orange">出库</span></div>
          <div class="list-row"><div><div class="list-title">库存归属调整</div><div class="muted">物权转移和跨货主调整共 5 条，已记录归属变更前后结果。</div></div><span class="tag gray">归属调整</span></div>
          <div class="list-row"><div><div class="list-title">异常回执</div><div class="muted">资源资产 / BMS 回传异常 3 条，待补偿处理。</div></div><span class="tag red">异常</span></div>
        </div></div>
        <div class="section-card"><h3>记录口径</h3><div class="info-grid">
          <div class="info-item"><div class="k">记录范围</div><div>所有影响库存的出入库动作与归属调整动作</div></div>
          <div class="info-item"><div class="k">记录粒度</div><div>单据头 + 商品明细 + 批次 + 操作时间</div></div>
          <div class="info-item"><div class="k">记录来源</div><div>WMS / PC申请 / 资源资产系统 / 接口回传</div></div>
          <div class="info-item"><div class="k">主要用途</div><div>库存追溯、对账留痕、异常核查、财务协同</div></div>
          <div class="info-item"><div class="k">覆盖单据</div><div>入库单、配送单、退货单、退仓单、调拨单、物权转移单</div></div>
          <div class="info-item"><div class="k">刷新方式</div><div>按接口回传和业务动作实时登记</div></div>
        </div></div>
      </div>
      <div class="section-card" style="margin-top:10px;">
        <div class="section-head"><h3>今日重点记录</h3><div class="action-row"><button class="ghost-button">导出重点流水</button></div></div>
        <div class="drawer-table-wrap"><table><thead><tr><th>记录号</th><th>业务单据</th><th>动作方向</th><th>单据类型</th><th>货主</th><th>仓库</th><th>商品编码</th><th>商品名称</th><th>数量</th><th>库存影响</th><th>资源资产</th><th>BMS</th><th>记录时间</th></tr></thead><tbody>
          <tr><td>IOR202605280001</td><td>RK20260528003</td><td><span class="tag blue">入库</span></td><td>入库单</td><td>外部货主B</td><td>华南2仓</td><td>MAT-RK-001</td><td>低值易耗品-清洁剂</td><td>60</td><td>库存 +60</td><td>待回执</td><td>待回执</td><td>2026-05-28 09:18</td></tr>
          <tr><td>IOR202605280014</td><td>PS20260528009</td><td><span class="tag orange">出库</span></td><td>配送单</td><td>自有货主A</td><td>华东1仓</td><td>MAT-PS-021</td><td>物料-商品021</td><td>120</td><td>库存 -120</td><td>已发送</td><td>已回执</td><td>2026-05-28 10:06</td></tr>
          <tr><td>IOR202605280025</td><td>TK20260528005</td><td><span class="tag blue">入库</span></td><td>退仓单</td><td>自有货主C</td><td>华北3仓</td><td>MAT-TK-002</td><td>物料-商品012</td><td>15</td><td>库存 +15</td><td>已发送</td><td>待回执</td><td>2026-05-28 10:48</td></tr>
          <tr><td>IOR202605280036</td><td>WQ20260528002</td><td><span class="tag gray">归属调整</span></td><td>物权转移单</td><td>外部货主C -> 自有货主C</td><td>华北3仓</td><td>MAT-WQ-008</td><td>低值易耗品-工具包</td><td>40</td><td>归属调整</td><td>-</td><td>待回执</td><td>2026-05-28 11:23</td></tr>
        </tbody></table></div>
      </div>`
  },
  inventory: {
    title: "库存台账",
    desc: "按货主、仓库、商品维度查看库存和异常状态。",
    actions: ["导出库存", "查看预警"],
    content: `
      <div class="grid-3">
        <div class="kpi-card"><div class="kpi-label">总库存SKU</div><div class="kpi-value">12,860</div><div class="kpi-desc">覆盖18个仓库</div></div>
        <div class="kpi-card"><div class="kpi-label">可用库存</div><div class="kpi-value">92.6%</div><div class="kpi-desc">较上周 +1.8%</div></div>
        <div class="kpi-card"><div class="kpi-label">异常库存</div><div class="kpi-value">46</div><div class="kpi-desc">待检/残次/损溢</div></div>
      </div>
      <div class="sub-tabs">
        <div class="sub-tab active" data-sub-tab="general">总账库存</div>
        <div class="sub-tab" data-sub-tab="batch">批次库存</div>
      </div>
      <div class="sub-tab-content active" data-sub-tab-content="general">
        <div class="data-table-wrap"><table><thead><tr><th>货主</th><th>仓库</th><th>库存地点</th><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>可用库存</th><th>锁定库存</th><th>待检库存</th><th>在途库存</th><th>未税金额</th><th>含税金额</th><th>税额</th><th>预警状态</th></tr></thead><tbody>
          <tr><td>自有货主A</td><td>华东1仓</td><td>合格品区</td><td>MAT-INV-001</td><td>6906000000019</td><td>物料-低值易耗品001</td><td>12瓶/箱</td><td>箱</td><td>1,220</td><td>80</td><td>20</td><td>40</td><td>51825.60</td><td>58560.00</td><td>6734.40</td><td><span class="tag green">正常</span></td></tr>
          <tr><td>外部货主B</td><td>华南2仓</td><td>待退货区</td><td>MAT-INV-002</td><td>6906000000026</td><td>物料-商品002</td><td>24袋/箱</td><td>箱</td><td>120</td><td>60</td><td>0</td><td>15</td><td>3186.00</td><td>3600.00</td><td>414.00</td><td><span class="tag orange">低库存</span></td></tr>
          <tr><td>自有货主C</td><td>华北3仓</td><td>报废品区</td><td>MAT-INV-003</td><td>6906000000033</td><td>物料-商品003</td><td>6盒/箱</td><td>箱</td><td>680</td><td>100</td><td>15</td><td>0</td><td>12036.00</td><td>13600.00</td><td>1564.00</td><td><span class="tag red">异常库存</span></td></tr>
        </tbody></table></div>
      </div>
      <div class="sub-tab-content" data-sub-tab-content="batch">
        <div class="data-table-wrap"><table><thead><tr><th>货主</th><th>仓库</th><th>库存地点</th><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>可用库存</th><th>锁定库存</th><th>待检库存</th><th>在途库存</th><th>含税单价</th><th>未税单价</th><th>未税金额</th><th>含税金额</th><th>税额</th><th>生产日期</th><th>生产批次</th><th>失效日期</th><th>供应商</th><th>入库日期</th><th>入库批次</th><th>预警状态</th></tr></thead><tbody>
          <tr><td>自有货主A</td><td>华东1仓</td><td>合格品区</td><td>MAT-INV-001</td><td>6906000000019</td><td>物料-低值易耗品001</td><td>12瓶/箱</td><td>箱</td><td>1,220</td><td>80</td><td>20</td><td>40</td><td>48.00</td><td>42.48</td><td>51825.60</td><td>58560.00</td><td>6734.40</td><td>2026-03-15</td><td>PC2026031501</td><td>2027-03-15</td><td>供应商A-华东物料</td><td>2026-03-18</td><td>RK20260318001</td><td><span class="tag green">正常</span></td></tr>
          <tr><td>自有货主A</td><td>华东1仓</td><td>合格品区</td><td>MAT-INV-001</td><td>6906000000019</td><td>物料-低值易耗品001</td><td>12瓶/箱</td><td>箱</td><td>800</td><td>50</td><td>10</td><td>0</td><td>48.00</td><td>42.48</td><td>33984.00</td><td>38400.00</td><td>4416.00</td><td>2026-04-20</td><td>PC2026042002</td><td>2027-04-20</td><td>供应商A-华东物料</td><td>2026-04-22</td><td>RK20260422003</td><td><span class="tag green">正常</span></td></tr>
          <tr><td>外部货主B</td><td>华南2仓</td><td>待退货区</td><td>MAT-INV-002</td><td>6906000000026</td><td>物料-商品002</td><td>24袋/箱</td><td>箱</td><td>120</td><td>60</td><td>0</td><td>15</td><td>30.00</td><td>26.55</td><td>3186.00</td><td>3600.00</td><td>414.00</td><td>2026-05-01</td><td>PC2026050101</td><td>2026-10-28</td><td>供应商B-华南日化</td><td>2026-05-03</td><td>RK20260503002</td><td><span class="tag orange">低库存</span></td></tr>
          <tr><td>自有货主C</td><td>华北3仓</td><td>报废品区</td><td>MAT-INV-003</td><td>6906000000033</td><td>物料-商品003</td><td>6盒/箱</td><td>箱</td><td>680</td><td>100</td><td>15</td><td>0</td><td>20.00</td><td>17.70</td><td>12036.00</td><td>13600.00</td><td>1564.00</td><td>2026-02-10</td><td>PC2026021003</td><td>2026-05-11</td><td>供应商C-华北食品</td><td>2026-02-12</td><td>RK20260212005</td><td><span class="tag red">异常库存</span></td></tr>
          <tr><td>自有货主C</td><td>华北3仓</td><td>合格品区</td><td>MAT-INV-003</td><td>6906000000033</td><td>物料-商品003</td><td>6盒/箱</td><td>箱</td><td>340</td><td>40</td><td>5</td><td>0</td><td>20.00</td><td>17.70</td><td>6018.00</td><td>6800.00</td><td>782.00</td><td>2026-04-05</td><td>PC2026040504</td><td>2026-07-04</td><td>供应商C-华北食品</td><td>2026-04-07</td><td>RK20260407006</td><td><span class="tag green">正常</span></td></tr>
        </tbody></table></div>
      </div>`
  },
  productinfo: {
    title: "商品信息",
    desc: "维护商品主数据，承接审批通过后的新品信息写入，用于业务单据和库存识别。",
    actions: ["新增商品", "导出商品"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>商品分类</th><th>品牌</th><th>型号</th><th>温层</th><th>保质期天数</th><th>长(cm)</th><th>宽(cm)</th><th>高(cm)</th><th>体积(m3)</th><th>重量(kg)</th><th>包装数量</th><th>批次管理</th><th>效期管理</th><th>状态</th><th>维护方式</th><th>来源单据</th></tr></thead><tbody>
        <tr><td>MAT-NEW-001</td><td>6923000000018</td><td>新品-消杀喷雾</td><td>24瓶/箱</td><td>箱</td><td>清洁消杀</td><td>安洁</td><td>AJ-XP-24</td><td>常温</td><td>365</td><td>42</td><td>30</td><td>28</td><td>0.0353</td><td>12.5</td><td>24</td><td>是</td><td>是</td><td><span class="tag green">已启用</span></td><td>审批写入</td><td>XP20260526003</td></tr>
        <tr><td>MAT-NEW-002</td><td>6923000000025</td><td>新品-医用手套</td><td>50盒/箱</td><td>箱</td><td>防护用品</td><td>护安</td><td>HA-GLOVE-50</td><td>常温</td><td>730</td><td>48</td><td>36</td><td>32</td><td>0.0553</td><td>16.8</td><td>50</td><td>是</td><td>是</td><td><span class="tag blue">已配置</span></td><td>Excel导入</td><td>XP20260526005</td></tr>
        <tr><td>MAT-INV-001</td><td>6906000000019</td><td>物料-低值易耗品001</td><td>12瓶/箱</td><td>箱</td><td>低值易耗品</td><td>自有品牌A</td><td>INV-A-12</td><td>常温</td><td>540</td><td>40</td><td>28</td><td>26</td><td>0.0291</td><td>10.2</td><td>12</td><td>是</td><td>是</td><td><span class="tag green">已启用</span></td><td>人工维护</td><td>历史主数据</td></tr>
      </tbody></table></div>`
  },
  owner: {
    title: "货主信息表",
    desc: "维护自有货主与外部货主主数据，供业务单据、库存和财务协同引用。",
    actions: ["新增货主", "导出货主"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>货主编码</th><th>货主名称</th><th>货主类型</th><th>结算主体</th><th>默认状态</th><th>联系人</th><th>联系电话</th></tr></thead><tbody>
        <tr><td>OWNER001</td><td>自有货主A</td><td>自有货主</td><td>总部结算中心</td><td><span class="tag green">启用</span></td><td>李波</td><td>13800000001</td></tr>
        <tr><td>OWNER002</td><td>外部货主B</td><td>外部货主</td><td>华南区域结算中心</td><td><span class="tag green">启用</span></td><td>陈华</td><td>13800000002</td></tr>
        <tr><td>OWNER003</td><td>自有货主C</td><td>自有货主</td><td>华北共享结算主体</td><td><span class="tag orange">待复核</span></td><td>王雪</td><td>13800000003</td></tr>
      </tbody></table></div>`
  },
  customer: {
    title: "客户信息",
    desc: "统一维护内部客户、门店客户及外部客户基础信息，用于要货、配送和退仓识别。",
    actions: ["新增客户", "导出客户"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>客户编码</th><th>客户名称</th><th>客户类型</th><th>所属区域</th><th>默认收货仓</th><th>联系人</th><th>联系电话</th><th>状态</th></tr></thead><tbody>
        <tr><td>CUST001</td><td>内部客户-华东分部</td><td>内部客户</td><td>华东</td><td>华东1仓</td><td>张三</td><td>13900000001</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>CUST002</td><td>外部客户-门店联盟</td><td>外部客户</td><td>华南</td><td>华南2仓</td><td>陈华</td><td>13900000002</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>CUST003</td><td>内部客户-区域共享仓</td><td>内部客户</td><td>华北</td><td>华北3仓</td><td>王雪</td><td>13900000003</td><td><span class="tag blue">已配置</span></td></tr>
      </tbody></table></div>
      <div class="section-card" style="margin-top:10px;">
        <div class="section-head"><h3>收货地点记录表</h3><div class="action-row"><button class="ghost-button">导出收货地点</button></div></div>
        <div class="notice"><div class="title">记录目的</div><div class="desc">用于记录单个客户下的多个收货地点，支撑客户要货、配送履约和收货地址自动带出。</div></div>
        <div class="data-table-wrap"><table><thead><tr><th>客户编码</th><th>客户名称</th><th>地点编码</th><th>收货地点名称</th><th>所属区域</th><th>详细地址</th><th>联系人</th><th>联系电话</th><th>默认地点</th><th>状态</th></tr></thead><tbody>
          <tr><td>CUST001</td><td>内部客户-华东分部</td><td>ADDR001</td><td>浦东办公点</td><td>上海浦东</td><td>上海市浦东新区XX路18号1楼收货区</td><td>张三</td><td>13900000001</td><td>是</td><td><span class="tag green">启用</span></td></tr>
          <tr><td>CUST001</td><td>内部客户-华东分部</td><td>ADDR002</td><td>临港仓配点</td><td>上海临港</td><td>上海市临港新片区XX大道66号月台2</td><td>李婷</td><td>13900000011</td><td>否</td><td><span class="tag blue">已配置</span></td></tr>
          <tr><td>CUST002</td><td>外部客户-门店联盟</td><td>ADDR003</td><td>天河配送门店</td><td>广州天河</td><td>广州市天河区XX大道88号后场收货口</td><td>陈华</td><td>13900000002</td><td>是</td><td><span class="tag green">启用</span></td></tr>
          <tr><td>CUST002</td><td>外部客户-门店联盟</td><td>ADDR004</td><td>海珠直营网点</td><td>广州海珠</td><td>广州市海珠区XX路168号门店仓侧门</td><td>赵敏</td><td>13900000012</td><td>否</td><td><span class="tag green">启用</span></td></tr>
        </tbody></table></div>
      </div>`
  },
  ownersupplier: {
    title: "货主供应商",
    desc: "维护货主与供应商的关联关系，用于入库、采购和财务结算时自动匹配供应商。",
    actions: ["新增关联", "导出关联"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>关联编码</th><th>货主名称</th><th>供应商名称</th><th>供应商类型</th><th>合作模式</th><th>主营品类</th><th>结算方式</th><th>生效日期</th><th>状态</th></tr></thead><tbody>
        <tr><td>OS001</td><td>自有货主A</td><td>华润怡宝供应链</td><td>品牌供应商</td><td>直配入库</td><td>饮品/清洁</td><td>月结30天</td><td>2026-01-01</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OS002</td><td>自有货主A</td><td>中粮食品配送</td><td>品牌供应商</td><td>直配入库</td><td>粮油/食品</td><td>月结45天</td><td>2026-01-15</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OS003</td><td>外部货主B</td><td>华南区域集采中心</td><td>区域供应商</td><td>集采分拨</td><td>综合品类</td><td>季结</td><td>2026-02-01</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OS004</td><td>自有货主C</td><td>安洁防护用品厂</td><td>品牌供应商</td><td>新品直配</td><td>清洁消杀/防护</td><td>单笔结算</td><td>2026-03-01</td><td><span class="tag blue">待确认</span></td></tr>
      </tbody></table></div>`
  },
  customerstore: {
    title: "客户门店档案",
    desc: "维护客户下属门店的详细信息，用于配送地址分配、签收确认和门店级别对账。",
    actions: ["新增门店", "导出门店"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>门店编码</th><th>门店名称</th><th>所属客户</th><th>门店类型</th><th>所属区域</th><th>详细地址</th><th>联系人</th><th>联系电话</th><th>配送仓</th><th>默认收货时段</th><th>状态</th></tr></thead><tbody>
        <tr><td>STORE001</td><td>浦东旗舰店</td><td>内部客户-华东分部</td><td>直营门店</td><td>上海浦东</td><td>上海市浦东新区XX路18号</td><td>张三</td><td>13900000001</td><td>华东1仓</td><td>08:00-12:00</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>STORE002</td><td>临港社区店</td><td>内部客户-华东分部</td><td>直营门店</td><td>上海临港</td><td>上海市临港新片区XX大道66号</td><td>李婷</td><td>13900000011</td><td>华东1仓</td><td>13:00-17:00</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>STORE003</td><td>天河中心店</td><td>外部客户-门店联盟</td><td>加盟门店</td><td>广州天河</td><td>广州市天河区XX大道88号</td><td>陈华</td><td>13900000002</td><td>华南2仓</td><td>08:00-12:00</td><td><span class="tag green">启用</span></td></tr>
        <tr><td>STORE004</td><td>海珠网点</td><td>外部客户-门店联盟</td><td>加盟门店</td><td>广州海珠</td><td>广州市海珠区XX路168号</td><td>赵敏</td><td>13900000012</td><td>华南2仓</td><td>13:00-17:00</td><td><span class="tag blue">已配置</span></td></tr>
        <tr><td>STORE005</td><td>大兴新城店</td><td>内部客户-区域共享仓</td><td>直营门店</td><td>北京大兴</td><td>北京市大兴区XX路300号</td><td>王磊</td><td>13900000003</td><td>华北3仓</td><td>08:00-12:00</td><td><span class="tag green">启用</span></td></tr>
      </tbody></table></div>`
  },
  ownercustomer: {
    title: "货主客户关系表",
    desc: "定义客户与货主的归属关系，支持客户要货、配送履约及退仓回溯时自动匹配货主。",
    actions: ["新增关系", "导出关系"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>关系编码</th><th>客户名称</th><th>货主名称</th><th>关系类型</th><th>默认货主</th><th>生效日期</th><th>状态</th></tr></thead><tbody>
        <tr><td>OCREL001</td><td>内部客户-华东分部</td><td>自有货主A</td><td>要货/配送</td><td>是</td><td>2026-01-01</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OCREL002</td><td>外部客户-门店联盟</td><td>外部货主B</td><td>要货/退仓</td><td>是</td><td>2026-01-15</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OCREL003</td><td>内部客户-区域共享仓</td><td>自有货主C</td><td>要货/配送</td><td>否</td><td>2026-02-01</td><td><span class="tag blue">待调整</span></td></tr>
      </tbody></table></div>`
  },
  ownerwarehouse: {
    title: "货主仓库关系表",
    desc: "定义货主与仓库的服务关系，支持默认入库仓、发货仓和退回仓自动带出。",
    actions: ["新增关系", "导出关系"],
    content: `
      <div class="data-table-wrap"><table><thead><tr><th>关系编码</th><th>货主名称</th><th>仓库名称</th><th>关系类型</th><th>默认入库仓</th><th>默认发货仓</th><th>默认退回仓</th><th>状态</th></tr></thead><tbody>
        <tr><td>OWREL001</td><td>自有货主A</td><td>华东1仓</td><td>存储/配送</td><td>是</td><td>是</td><td>是</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OWREL002</td><td>外部货主B</td><td>华南2仓</td><td>存储/退仓</td><td>是</td><td>是</td><td>是</td><td><span class="tag green">生效中</span></td></tr>
        <tr><td>OWREL003</td><td>自有货主C</td><td>华北3仓</td><td>存储/调拨</td><td>否</td><td>是</td><td>否</td><td><span class="tag blue">待确认</span></td></tr>
      </tbody></table></div>`
  },
  customerstorerelation: {
    title: "客户门店仓库关系表",
    desc: "定义门店与配送仓库的对应关系，一个门店只能绑定一个仓库。用于客户要货时自动匹配配送仓和库存地点。",
    actions: ["新增关系", "导出关系"],
    content: `
      <div class="notice" style="margin-bottom:12px;"><div class="title">关系说明</div><div class="desc">客户门店仓库关系表定义门店的默认要货仓库与库存地点。客户要货单创建时，系统根据门店编码自动带出对应的配送仓库和库存地点。<strong>一个门店只能绑定一个仓库</strong>。</div></div>
      <div class="data-table-wrap"><table><thead><tr><th>关系编码</th><th>门店编码</th><th>门店名称</th><th>所属客户</th><th>配送仓库编码</th><th>配送仓库名称</th><th>库存地点</th><th>关系状态</th><th>生效日期</th><th>备注</th></tr></thead><tbody>
        <tr><td>CSREL001</td><td>STORE001</td><td>浦东旗舰店</td><td>内部客户-华东分部</td><td>WH001</td><td>华东1仓</td><td>HD01-A区</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td><td>直营门店默认配送仓</td></tr>
        <tr><td>CSREL002</td><td>STORE002</td><td>临港社区店</td><td>内部客户-华东分部</td><td>WH001</td><td>华东1仓</td><td>HD01-B区</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td><td></td></tr>
        <tr><td>CSREL003</td><td>STORE003</td><td>天河中心店</td><td>外部客户-门店联盟</td><td>WH002</td><td>华南2仓</td><td>HN02-A区</td><td><span class="tag green">生效中</span></td><td>2026-01-15</td><td>加盟门店统一华南仓</td></tr>
        <tr><td>CSREL004</td><td>STORE004</td><td>海珠网点</td><td>外部客户-门店联盟</td><td>WH002</td><td>华南2仓</td><td>HN02-B区</td><td><span class="tag blue">待确认</span></td><td>2026-02-01</td><td>仓库切换待确认</td></tr>
        <tr><td>CSREL005</td><td>STORE005</td><td>大兴新城店</td><td>内部客户-区域共享仓</td><td>WH003</td><td>华北3仓</td><td>HB03-A区</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td><td></td></tr>
      </tbody></table></div>`
  },
  approval: {
    title: "审批中心",
    desc: "统一处理客户要货、退仓、损溢、物权转移等审批动作。",
    actions: ["审批通过", "驳回"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>待审批列表</h3><div class="action-row"><button class="ghost-button">转交</button><button class="danger-button">驳回</button><button class="primary-button">通过</button></div></div><div class="list">
          <div class="list-row"><div><div class="list-title">客户要货单 YH20260526002</div><div class="muted">申请人：李明 / 提交时间：09:28 / 金额影响：中</div></div><span class="tag orange">待审批</span></div>
          <div class="list-row"><div><div class="list-title">损溢单 SY20260526005</div><div class="muted">申请人：王婷 / 数量：32 / 原因：破损</div></div><span class="tag red">高优先</span></div>
          <div class="list-row"><div><div class="list-title">物权转移单 WQ20260526003</div><div class="muted">原货主：外部货主B / 目标货主：自有货主A</div></div><span class="tag blue">待确认</span></div>
        </div></div>
        <div class="section-card"><h3>审批详情</h3><div class="info-grid">
          <div class="info-item"><div class="k">单据类型</div><div>客户要货单</div></div>
          <div class="info-item"><div class="k">单据编号</div><div>YH20260526002</div></div>
          <div class="info-item"><div class="k">客户</div><div>外部客户-门店联盟</div></div>
          <div class="info-item"><div class="k">货主</div><div>外部货主B</div></div>
          <div class="info-item"><div class="k">审核结论</div><div><span class="tag orange">待审批</span></div></div>
          <div class="info-item"><div class="k">审批动作</div><div>通过 / 驳回 / 转交</div></div>
        </div></div>
      </div>`
  },
  finance: {
    title: "财务协同",
    desc: "展示业务传单、BMS回执和差异处理。",
    actions: ["批量重推", "导出差异"],
    content: `
      <div class="grid-2">
        <div class="section-card"><div class="section-head"><h3>财务协同任务</h3><div class="action-row"><button class="ghost-button">导出差异</button><button class="primary-button">批量重推</button></div></div><table><thead><tr><th>业务单据</th><th>单据类型</th><th>传单状态</th><th>BMS回执</th><th>差异状态</th></tr></thead><tbody>
          <tr><td>PS20260526003</td><td>配送单</td><td><span class="tag blue">已传BMS</span></td><td><span class="tag orange">待回执</span></td><td><span class="tag gray">无</span></td></tr>
          <tr><td>TK20260526011</td><td>退仓单</td><td><span class="tag blue">已传BMS</span></td><td><span class="tag green">已回执</span></td><td><span class="tag gray">无</span></td></tr>
          <tr><td>SY20260526005</td><td>损溢单</td><td><span class="tag red">传单失败</span></td><td><span class="tag red">失败</span></td><td><span class="tag red">待处理</span></td></tr>
        </tbody></table></div>
        <div class="section-card"><h3>差异处理看板</h3><div class="list">
          <div class="list-row"><div><div class="list-title">待处理差异 3 项</div><div class="muted">主要集中在损溢单和退货单</div></div><span class="tag red">异常</span></div>
          <div class="list-row"><div><div class="list-title">今日已完成回执 42 项</div><div class="muted">配送、退仓和入库单回执正常</div></div><span class="tag green">正常</span></div>
        </div><div class="empty-state" style="margin-top:10px;"><div class="empty-title">暂无新增财务差异工单</div><div class="empty-desc">当前展示的是系统自动归集的差异摘要，后续可在此生成人工处理工单。</div><button class="ghost-button">查看历史工单</button></div></div>
      </div>`
  },
  logs: {
    title: "接口日志",
    desc: "查看接口调用、失败重试和补偿任务状态。",
    actions: ["失败日志", "重试异常接口"],
    content: `
      <div class="section-card"><div class="section-head"><h3>接口日志中心</h3><div class="action-row"><button class="ghost-button">查看失败日志</button><button class="primary-button">重试异常接口</button></div></div><table><thead><tr><th>时间</th><th>接口名称</th><th>方向</th><th>关联单据</th><th>状态</th><th>说明</th></tr></thead><tbody>
        <tr><td>10:12:23</td><td>WMS入库单接口</td><td>WMS -> 3PL</td><td>CGRK20260526001</td><td><span class="tag green">成功</span></td><td>库存同步完成，已回传资源资产</td></tr>
        <tr><td>10:18:45</td><td>BMS财务回执接口</td><td>BMS -> 3PL</td><td>PS20260526003</td><td><span class="tag orange">重试中</span></td><td>回执超时，等待第2次重试</td></tr>
        <tr><td>10:26:17</td><td>资源资产结果回传接口</td><td>3PL -> CRS</td><td>DB20260526003</td><td><span class="tag red">失败</span></td><td>签名校验失败，待重发</td></tr>
      </tbody></table><div class="empty-state" style="margin-top:10px;"><div class="empty-title">暂无新的高优先接口告警</div><div class="empty-desc">当前失败日志已进入自动重试或人工处理流程。该区域可替换为真实的失败任务列表。</div><button class="ghost-button">查看重试策略</button></div></div>`
  }
};

const miniPages = {
  home: {
    title: "",
    hideHeader: true,
    desc: "",
    actions: [],
    content: `
      <div class="mini-home-greeting">
        <div class="mini-home-user">
          <div class="mini-home-avatar">张</div>
          <div class="mini-home-welcome">
            <div class="mini-home-name">你好，张经理</div>
            <div class="mini-home-company">恒顺调味品有限公司</div>
          </div>
        </div>
        <a class="mini-home-bell" href="mini-message.html">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="mini-bell-dot"></span>
        </a>
      </div>
      <div class="mini-home-stats">
        <a class="mini-stat-card" href="mini-todo.html">
          <div class="mini-stat-num">5</div>
          <div class="mini-stat-label">待办事项</div>
        </a>
        <div class="mini-stat-card">
          <div class="mini-stat-num">12</div>
          <div class="mini-stat-label">本月配送</div>
        </div>
        <a class="mini-stat-card mini-stat-warn" href="mini-inventory.html">
          <div class="mini-stat-num">2</div>
          <div class="mini-stat-label">库存预警</div>
        </a>
      </div>
      <div class="mini-section"><div class="mini-section-head"><h4>常用功能</h4></div>
        <div class="mini-home-actions">
          <a class="mini-action-card" href="mini-apply.html">
            <div class="mini-action-icon" data-icon="order"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg></div>
            <span>客户要货</span>
          </a>
          <a class="mini-action-card" href="mini-inboundapply.html">
            <div class="mini-action-icon" data-icon="inbound"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
            <span>入库申请</span>
          </a>
          <a class="mini-action-card" href="mini-returnapply.html">
            <div class="mini-action-icon" data-icon="return"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg></div>
            <span>退货申请</span>
          </a>
          <a class="mini-action-card" href="mini-return.html">
            <div class="mini-action-icon" data-icon="warehouse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <span>退仓申请</span>
          </a>
        </div>
      </div>
      <div class="mini-section"><div class="mini-section-head"><h4>更多服务</h4></div>
        <div class="mini-home-actions">
          <a class="mini-action-card" href="mini-ownershipapply.html">
            <div class="mini-action-icon" data-icon="ownership"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
            <span>物权转移</span>
          </a>
          <a class="mini-action-card" href="mini-loss.html">
            <div class="mini-action-icon" data-icon="loss"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            <span>损溢申请</span>
          </a>
          <a class="mini-action-card" href="mini-transfer.html">
            <div class="mini-action-icon" data-icon="allocate"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
            <span>调拨单</span>
          </a>
          <a class="mini-action-card" href="mini-inventory.html">
            <div class="mini-action-icon" data-icon="inventory"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div>
            <span>库存查询</span>
          </a>
        </div>
      </div>
      <div class="mini-section"><div class="mini-section-head"><h4>最新动态</h4><a class="mini-section-more" href="mini-message.html">查看全部</a></div>
        <div class="mini-home-timeline">
          <a class="mini-timeline-item" href="mini-detail.html">
            <div class="mini-timeline-dot green"></div>
            <div class="mini-timeline-content">
              <div class="mini-timeline-title">配送单已签收</div>
              <div class="mini-timeline-desc">PS20260605001 · 华南2仓 → 广州天河门店</div>
              <div class="mini-timeline-time">今天 10:23</div>
            </div>
          </a>
          <a class="mini-timeline-item" href="mini-detail.html">
            <div class="mini-timeline-dot blue"></div>
            <div class="mini-timeline-content">
              <div class="mini-timeline-title">客户要货单待审批</div>
              <div class="mini-timeline-desc">YH20260605002 · 外部客户-门店联盟 · 125件</div>
              <div class="mini-timeline-time">今天 09:28</div>
            </div>
          </a>
          <a class="mini-timeline-item" href="mini-inventory.html">
            <div class="mini-timeline-dot orange"></div>
            <div class="mini-timeline-content">
              <div class="mini-timeline-title">库存预警提醒</div>
              <div class="mini-timeline-desc">恒顺香醋500ml · 华南2仓 · 可用量低于安全库存</div>
              <div class="mini-timeline-time">今天 08:15</div>
            </div>
          </a>
          <a class="mini-timeline-item" href="mini-detail.html">
            <div class="mini-timeline-dot green"></div>
            <div class="mini-timeline-content">
              <div class="mini-timeline-title">入库完成</div>
              <div class="mini-timeline-desc">RK20260604003 · 恒顺酱油系列 · 320件已入库</div>
              <div class="mini-timeline-time">昨天 16:42</div>
            </div>
          </a>
        </div>
      </div>`
  },
  todo: {
    title: "待办",
    desc: "支持审批和待处理动作集中查看。",
    actions: ["通过", "驳回"],
    content: `
      <div class="mini-section"><h4>待审批</h4>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">客户要货单 YH20260526002</div><span class="tag orange">待审批</span></div><div class="muted">客户：外部客户-门店联盟 / 数量：125 / 提交时间：09:28</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">损溢单 SY20260526005</div><span class="tag red">高优先</span></div><div class="muted">原因：破损 / 仓库：华南2仓 / 数量：32</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">退仓申请 TK20260526008</div><span class="tag blue">待处理</span></div><div class="muted">需确认原货主和原发货仓后提交审批</div></div>
      </div>`
  },
  apply: {
    title: "客户要货申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniApplyInfoPage()
  },
  applydetail: {
    title: "要货申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["暂存", "下一步"],
    content: renderMiniApplyDetailPage()
  },
  inboundapply: {
    title: "入库申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniInboundApplyInfoPage()
  },
  inboundapplydetail: {
    title: "入库申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["暂存", "下一步"],
    content: renderMiniInboundApplyDetailPage()
  },
  returnapply: {
    title: "退货申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniReturnApplyInfoPage()
  },
  returnapplydetail: {
    title: "退货申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["暂存", "下一步"],
    content: renderMiniReturnApplyDetailPage()
  },
  return: {
    title: "退仓申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniReturnInApplyInfoPage()
  },
  returndetail: {
    title: "退仓申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["暂存", "下一步"],
    content: renderMiniReturnInApplyDetailPage()
  },
  transfer: {
    title: "调拨单",
    desc: "展示仓库间调拨执行和库存变更结果。",
    actions: ["刷新状态"],
    content: `
      <div class="mini-section">
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">DB20260526001</div><span class="tag blue">已同步库存</span></div><div class="muted">华东1仓 -> 华东2仓 / 自有货主A / 数量 120</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">DB20260526003</div><span class="tag orange">待传BMS</span></div><div class="muted">华南2仓 -> 华中1仓 / 外部货主B / 数量 80</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">DB20260526005</div><span class="tag green">已完成</span></div><div class="muted">华北3仓 -> 华北4仓 / 自有货主C / 数量 160</div></div>
      </div>`
  },
  loss: {
    title: "损溢申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniLossInfoPage()
  },
  lossdetail: {
    title: "损溢申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["暂存", "下一步"],
    content: renderMiniLossDetailPage()
  },
  ownershipapply: {
    title: "物权转移申请",
    desc: "",
    actions: ["新增单据"],
    content: renderMiniOwnershipApplyInfoPage()
  },
  ownershipapplydetail: {
    title: "物权转移申请明细",
    desc: "单据信息与商品明细，草稿可编辑商品。",
    actions: ["返回基础信息", "下一步"],
    content: renderMiniOwnershipApplyDetailPage()
  },
  applygoods: {
    title: "客户要货申请-商品录入",
    desc: "独立商品录入页，用于维护要货商品、数量和库存校验。",
    actions: ["保存", "下一步"],
    content: renderMiniApplyGoodsPage()
  },
  applygoodsreview: {
    title: "客户要货申请-已录入商品",
    desc: "单独查看当前已录入商品，确认后再提交审核。",
    actions: ["返回录入", "提交审核"],
    content: renderMiniApplyGoodsReviewPage()
  },
  inboundapplygoods: {
    title: "入库申请-商品录入",
    desc: "独立商品录入页，用于维护入库商品、税价和附件。",
    actions: ["保存", "下一步"],
    content: renderMiniInboundApplyGoodsPage()
  },
  inboundapplygoodsreview: {
    title: "入库申请-已录入商品",
    desc: "单独查看当前已录入商品，确认后再提交审核。",
    actions: ["返回录入", "提交审核"],
    content: renderMiniInboundApplyGoodsReviewPage()
  },
  returnapplygoods: {
    title: "退货申请-商品录入",
    desc: "独立商品录入页，用于维护退货商品、可退数量和退货金额。",
    actions: ["保存", "下一步"],
    content: renderMiniReturnApplyGoodsPage()
  },
  returnapplygoodsreview: {
    title: "退货申请-已录入商品",
    desc: "单独查看当前已录入商品，确认后再提交审核。",
    actions: ["返回录入", "提交审核"],
    content: renderMiniReturnApplyGoodsReviewPage()
  },
  returngoods: {
    title: "退仓申请-商品录入",
    desc: "独立商品录入页，用于维护退仓商品、原单回溯和现场凭证。",
    actions: ["保存", "下一步"],
    content: renderMiniReturnInApplyGoodsPage()
  },
  returngoodsreview: {
    title: "退仓申请-已录入商品",
    desc: "单独查看当前已录入商品，确认后再提交审核。",
    actions: ["返回录入", "提交审核"],
    content: renderMiniReturnInApplyGoodsReviewPage()
  },
  lossgoods: {
    title: "损溢申请-异常商品",
    desc: "独立异常商品页，用于维护损溢商品、数量、原因和现场资料。",
    actions: ["保存", "下一步"],
    content: renderMiniLossGoodsPage()
  },
  lossgoodsreview: {
    title: "损溢申请-已录入商品",
    desc: "单独查看当前已录入异常商品，确认后再提交审批。",
    actions: ["返回录入", "提交审批"],
    content: renderMiniLossGoodsReviewPage()
  },
  ownershipapplygoods: {
    title: "物权转移申请-商品录入",
    desc: "独立商品录入页，用于维护可转库存和货主归属调整明细。",
    actions: ["保存", "下一步"],
    content: renderMiniOwnershipApplyGoodsPage()
  },
  ownershipapplygoodsreview: {
    title: "物权转移申请-已录入商品",
    desc: "单独查看当前已录入商品，确认后再提交审核。",
    actions: ["返回录入", "提交审核"],
    content: renderMiniOwnershipApplyGoodsReviewPage()
  },
  scan: {
    title: "扫码识别",
    desc: "用于扫码带出商品、批次或业务单据。",
    actions: ["开始扫码", "查看结果"],
    content: renderMiniScanPage
  },
  scanresult: {
    title: "扫码识别-结果确认",
    desc: "用于查看扫码结果并确认带入原业务页面。",
    actions: ["返回扫码", "确认带入"],
    content: renderMiniScanResultPage
  },
  selectgoods: {
    title: "手工选品",
    desc: "用于手工选择商品并带回原业务页面。",
    actions: ["筛选商品", "下一步"],
    content: renderMiniSelectGoodsPage
  },
  selectgoodsresult: {
    title: "手工选品-结果确认",
    desc: "用于确认已选商品并带回原业务页面。",
    actions: ["返回候选", "确认选品"],
    content: renderMiniSelectGoodsResultPage
  },
  uploadvoucher: {
    title: "上传凭证",
    desc: "用于上传现场照片、附件和业务凭证。",
    actions: ["拍照上传", "下一步"],
    content: renderMiniUploadVoucherPage
  },
  uploadvoucherresult: {
    title: "上传凭证-文件结果",
    desc: "用于查看上传结果和附件关联状态。",
    actions: ["返回上传", "完成上传"],
    content: renderMiniUploadVoucherResultPage
  },
  inventorylookup: {
    title: "库存查看",
    desc: "用于查看库存可用量、推荐批次和锁定情况。",
    actions: ["刷新库存", "带入推荐批次"],
    content: renderMiniInventoryLookupPage
  },
  editgoods: {
    title: "编辑商品明细",
    desc: "用于修改商品数量、批次和税价信息。",
    actions: ["取消返回", "保存并返回"],
    content: renderMiniEditGoodsPage
  },
  batchdetail: {
    title: "批次详情",
    desc: "用于查看批次库存、日期和可退数量。",
    actions: ["返回原页面", "确认批次"],
    content: renderMiniBatchDetailPage
  },
  originorder: {
    title: "来源单据",
    desc: "用于查看原单信息并回带退仓来源数据。",
    actions: ["返回原页面", "带回原单信息"],
    content: renderMiniOriginOrderPage
  },
  rulecheck: {
    title: "规则校验",
    desc: "用于查看货权转移规则和库存归属校验结果。",
    actions: ["返回原页面", "确认规则"],
    content: renderMiniRuleCheckPage
  },
  location: {
    title: "定位结果",
    desc: "用于获取现场定位并回填地址信息。",
    actions: ["刷新定位", "确认定位"],
    content: renderMiniLocationPage
  },
  inventory: {
    title: "库存查询",
    desc: "输入商品编码或条形码查询各仓库库存。",
    actions: [],
    content: renderMiniInventoryQueryPage()
  },
  message: {
    title: "消息中心",
    desc: "系统消息、审批通知和异常提醒统一查看。",
    actions: ["全部已读"],
    content: `
      <div class="mini-section">
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">审批提醒</div><span class="tag orange">新消息</span></div><div class="muted">客户要货单 YH20260526002 待你审批</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">库存预警</div><span class="tag red">高优先</span></div><div class="muted">华南2仓 2 项商品低库存，请及时处理</div></div>
        <div class="mini-list-row"><div class="mini-top"><div class="list-title">接口异常</div><span class="tag blue">提醒</span></div><div class="muted">资源资产结果回传接口失败 1 次，已自动重试</div></div>
        <div class="empty-state" style="margin-top:12px;"><div class="empty-title">没有更多未读消息</div><div class="empty-desc">后续可在这里增加消息筛选、已读标记和批量处理能力。</div></div>
      </div>`
  },
  detail: {
    title: "单据详情",
    desc: "查看配送、退仓、调拨等单据的移动端详情。",
    actions: ["分享", "催办"],
    content: `
      <div class="mini-section"><h4>当前状态</h4><div class="mini-list-row"><div class="mini-top"><div class="list-title">配送中</div><span class="tag blue">执行中</span></div><div class="muted">TMS已接单，待客户签收</div></div></div>
      <div class="mini-section"><h4>基础信息</h4>
        <div class="mini-list-row"><div class="muted">客户：内部客户-华东分部</div></div>
        <div class="mini-list-row"><div class="muted">货主：自有货主A</div></div>
        <div class="mini-list-row"><div class="muted">发货仓：华东1仓</div></div>
        <div class="mini-list-row"><div class="muted">运单号：YD9087612</div></div>
      </div>
      <div class="mini-section"><h4>商品明细</h4><div class="mini-goods-list">
        <div class="mini-goods-item">
          <div class="mini-goods-head"><div><div class="mini-goods-title">物料-低值易耗品001</div><div class="mini-goods-code">商品编码：MAT-001 / 条形码：6901000000012</div></div><span class="tag green">已出库</span></div>
          <div class="mini-goods-grid">
            <div class="mini-goods-meta"><div class="label">规格</div><div class="value">12瓶/箱</div></div>
            <div class="mini-goods-meta"><div class="label">单位</div><div class="value">箱</div></div>
            <div class="mini-goods-meta"><div class="label">申请数量</div><div class="value">80</div></div>
            <div class="mini-goods-meta"><div class="label">签收数量</div><div class="value">80</div></div>
          </div>
        </div>
        <div class="mini-goods-item">
          <div class="mini-goods-head"><div><div class="mini-goods-title">物料-低值易耗品002</div><div class="mini-goods-code">商品编码：MAT-002 / 条形码：6901000000029</div></div><span class="tag blue">配送中</span></div>
          <div class="mini-goods-grid">
            <div class="mini-goods-meta"><div class="label">规格</div><div class="value">24袋/箱</div></div>
            <div class="mini-goods-meta"><div class="label">单位</div><div class="value">箱</div></div>
            <div class="mini-goods-meta"><div class="label">申请数量</div><div class="value">60</div></div>
            <div class="mini-goods-meta"><div class="label">签收数量</div><div class="value">0</div></div>
          </div>
        </div>
      </div></div>
      <div class="mini-section"><h4>状态轨迹</h4>
        <div class="mini-list-row"><div class="muted">10:10 已下发WMS/TMS</div></div>
        <div class="mini-list-row"><div class="muted">10:35 WMS开始拣货</div></div>
        <div class="mini-list-row"><div class="muted">11:20 TMS已接单</div></div>
        <div class="mini-list-row"><div class="muted">预计 15:00 到达门店</div></div>
      </div>`
  }
};

function getMiniStageGroupKey(key) {
  return Object.keys(miniStageConfigs).find((groupKey) => miniStageConfigs[groupKey].some((item) => item.key === key)) || key;
}

function shouldUseMiniPagedLayout(key) {
  return Boolean(miniStageConfigs[getMiniStageGroupKey(key)]);
}

function shouldHideMiniHeader(key) {
  return [
    "home",
    "applygoods", "applygoodsreview",
    "inboundapplygoods", "inboundapplygoodsreview",
    "returnapplygoods", "returnapplygoodsreview",
    "returngoods", "returngoodsreview",
    "lossgoods", "lossgoodsreview",
    "ownershipapplygoods", "ownershipapplygoodsreview"
  ].includes(key);
}

function shouldHideMiniTabbar(key) {
  return [
    "apply", "inboundapply", "returnapply", "return", "loss", "ownershipapply",
    "applydetail", "inboundapplydetail", "returnapplydetail", "returndetail", "lossdetail", "ownershipapplydetail",
    "applygoods", "applygoodsreview",
    "inboundapplygoods", "inboundapplygoodsreview",
    "returnapplygoods", "returnapplygoodsreview",
    "returngoods", "returngoodsreview",
    "lossgoods", "lossgoodsreview",
    "ownershipapplygoods", "ownershipapplygoodsreview",
    "inventory",
    "transfer"
  ].includes(key);
}
function isMiniListPage(key) {
  return ["apply", "inboundapply", "returnapply", "return", "loss", "ownershipapply"].includes(key);
}
function shouldHideMiniDemoChrome(key) {
  return shouldHideMiniTabbar(key) || ["home", "todo", "message", "detail"].includes(key);
}

function getMiniDocListDetailKey(key) {
  const map = {
    apply: "applydetail",
    inboundapply: "inboundapplydetail",
    returnapply: "returnapplydetail",
    return: "returndetail",
    loss: "lossdetail",
    ownershipapply: "ownershipapplydetail"
  };
  return map[key] || key;
}

function renderMiniStageTabs(key) {
  if (shouldUseMiniPagedLayout(key)) return "";
  if (isMiniListPage(key)) return "";
  const groupKey = getMiniStageGroupKey(key);
  const stages = miniStageConfigs[groupKey];
  if (!stages || stages.length <= 1) return "";
  return `<div class="mini-stage-tabs">${stages.map((item) => `
    ${item.key === key
      ? `<span class="mini-stage-pill active">${item.label}</span>`
      : `<a class="mini-stage-pill" href="${item.file}">${item.label}</a>`}
  `).join("")}</div>`;
}

function renderMiniSplitPageIntro(title, desc, metrics, actions = []) {
  const currentKey = document.body?.dataset?.pageKey || "";
  if (shouldUseMiniPagedLayout(currentKey)) return "";
  return `
    <div class="mini-section">
      <h4>${title}</h4>
      <div class="mini-form-summary">
        ${metrics.map((item) => `<div class="mini-summary-card"><div class="label">${item[0]}</div><div class="value">${item[1]}</div><div class="desc">${item[2]}</div></div>`).join("")}
      </div>
      ${actions.length ? `<div class="mini-goods-toolbar">${actions.map((item) => `<button class="mini-tool-button">${item}</button>`).join("")}</div>` : ""}
      <div class="mini-inline-note">${desc}</div>
    </div>`;
}

function getMiniRuntimeContext() {
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from") || "";
  const entry = params.get("entry") || "";
  return {
    from,
    entry,
    fromTitle: miniPages[from]?.title || "原页面"
  };
}

function buildMiniPageFile(key) {
  return key ? `mini-${key}.html` : "index.html";
}

function getMiniBackHref(defaultKey = "home") {
  const context = getMiniRuntimeContext();
  return buildMiniPageFile(context.from || defaultKey);
}

function buildMiniActionHref(file, pageKey, label) {
  return `${file}?from=${encodeURIComponent(pageKey)}&entry=${encodeURIComponent(label)}`;
}

function renderMiniGoodsScanBar(pageKey, label = "扫码识别") {
  return `
    <div class="mini-scan-bar">
      <input class="mini-scan-bar-input" placeholder="请输入商品名称/条码或扫码" />
      <a class="mini-scan-trigger" href="${buildMiniActionHref("mini-scan.html", pageKey, label)}" aria-label="${label}" title="${label}">⌶</a>
    </div>`;
}

function renderMiniInfoList(fields, status, options = {}) {
  const { fullpage = false, title = "单据信息" } = options;
  const cls = fullpage ? "mini-info-list fullpage" : "mini-info-list";
  const statusTag = status
    ? `<span class="mini-status-tag ${status.type}">${status.text}</span>`
    : "";
  const fieldItems = fields
    .map(
      (f) => `
      <div class="mini-info-field">
        <span class="mini-info-label">${f.label}</span>
        <span class="mini-info-value${f.empty ? " empty" : ""}">${f.value}</span>
      </div>`
    )
    .join("");
  if (fullpage) {
    return `
    <div class="${cls}">
      <div class="mini-info-list-header">
        <h4>${title}</h4>
        ${statusTag}
      </div>
      <div class="mini-info-grid">${fieldItems}</div>
    </div>`;
  }
  const rows = fields
    .map(
      (f) => `
    <div class="mini-info-row">
      <span class="mini-info-label">${f.label}</span>
      <span class="mini-info-value${f.empty ? " empty" : ""}">${f.value}</span>
    </div>`
    )
    .join("");
  return `
    <div class="${cls}">
      <div class="mini-info-list-header">
        <h4>${title}</h4>
        ${statusTag}
      </div>
      ${rows}
    </div>`;
}

function renderMiniDocCardActions(doc) {
  const s = doc.status.type;
  const actions = [];
  if (s === "draft") {
    actions.push({ label: "编辑", cls: "edit", action: "edit" });
    actions.push({ label: "删除", cls: "delete", action: "delete" });
  } else if (s === "pending") {
    actions.push({ label: "撤回", cls: "withdraw", action: "withdraw" });
  } else if (s === "rejected") {
    actions.push({ label: "重新编辑", cls: "edit", action: "edit" });
    actions.push({ label: "删除", cls: "delete", action: "delete" });
  }
  actions.push({ label: "查看详情", cls: "view", action: "view", href: doc.href });
  return actions;
}

function renderMiniDocList(documents, newHref) {
  const cards = documents
    .map(
      (doc) => {
        const actions = renderMiniDocCardActions(doc);
        const actionBtns = actions.map(a =>
          a.href
            ? `<a class="mini-doc-card-act ${a.cls}" href="${a.href}">${a.label}</a>`
            : `<button class="mini-doc-card-act ${a.cls}" data-action="${a.action}" data-doc="${doc.docNo}">${a.label}</button>`
        ).join("");
        return `
    <div class="mini-doc-card">
      <a class="mini-doc-card-main" href="${doc.href}">
        <div class="mini-doc-card-header">
          <div>
            <div class="mini-doc-card-title">${doc.title}</div>
            <div class="mini-doc-card-no">${doc.docNo}</div>
          </div>
          <span class="mini-status-tag ${doc.status.type}">${doc.status.text}</span>
        </div>
        <div class="mini-doc-card-body">
          ${doc.fields.map((f) => `<div class="mini-doc-card-field"><span class="label">${f.label}</span><span class="value">${f.value}</span></div>`).join("")}
        </div>
      </a>
      <div class="mini-doc-card-footer">
        <div class="mini-doc-card-actions">${actionBtns}</div>
      </div>
    </div>`;
      }
    )
    .join("");
  return `
    <div class="mini-doc-list">
      ${cards}
    </div>`;
}

function renderMiniGoodsEditList(goodsItems, options = {}) {
  const {
    isDraft = true,
    addHref = "#",
    editHref = "#",
    emptyText = "暂无商品，请点击添加"
  } = options;
  const count = goodsItems.length;
  const listHtml = goodsItems.map((item) => `
      <div class="mini-goods-edit-item${item.editing ? " editing" : ""}">
        <div class="mini-goods-edit-row">
          <div class="mini-goods-edit-info">
            <div class="mini-goods-edit-name">${item.name}</div>
            <div class="mini-goods-edit-code">${item.code}${item.barcode ? " / " + item.barcode : ""}</div>
            <div class="mini-goods-edit-metas">
              ${item.spec ? `<span class="mini-goods-edit-tag">${item.spec}</span>` : ""}
              ${item.unit ? `<span class="mini-goods-edit-tag">${item.unit}</span>` : ""}
            </div>
          </div>
          <div class="mini-goods-edit-qty">${item.qty}<span class="unit">${item.unit || ""}</span></div>
        </div>
        ${isDraft ? `<div class="mini-goods-edit-actions">
          <a class="mini-goods-action-btn edit" href="${editHref}">编辑</a>
          <button class="mini-goods-action-btn delete">删除</button>
        </div>` : ""}
      </div>`).join("");

  return `
    <div class="mini-section">
      <div class="mini-goods-edit-bar">
        <h4>商品明细<span class="mini-goods-count">${count}项</span></h4>
        ${isDraft ? `<a class="mini-goods-add-btn" href="${addHref}">+ 添加</a>` : ""}
      </div>
      ${count > 0 ? listHtml : `<div class="mini-goods-empty"><span class="icon">📦</span>${emptyText}</div>`}
      ${isDraft && count > 0 ? `<a class="mini-goods-add-trigger" href="${addHref}"><span class="icon">+</span> 继续添加商品</a>` : ""}
    </div>`;
}

function renderMiniApplyInfoPage() {
  return renderMiniDocList([
    { title: "华南大润发要货", docNo: "YH20260526002", status: { text: "草稿", type: "draft" },
      fields: [{ label: "客户", value: "华南大润发" }, { label: "发货仓", value: "华南2仓" }, { label: "商品数", value: "2项 / 140箱" }],
      href: "mini-applygoodsreview.html" },
    { title: "深圳沃尔玛要货", docNo: "YH20260526008", status: { text: "待审批", type: "pending" },
      fields: [{ label: "客户", value: "深圳沃尔玛" }, { label: "发货仓", value: "华南1仓" }, { label: "商品数", value: "3项 / 260箱" }],
      href: "mini-applygoodsreview.html" },
    { title: "广州永辉要货", docNo: "YH20260526015", status: { text: "已审核", type: "approved" },
      fields: [{ label: "客户", value: "广州永辉" }, { label: "发货仓", value: "华南2仓" }, { label: "商品数", value: "1项 / 80箱" }],
      href: "mini-applygoodsreview.html" }
  ], "mini-applygoodsreview.html");
}

function renderMiniApplyDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "客户", value: "华南大润发" },
      { label: "货主", value: "外部货主A" },
      { label: "发货仓", value: "华南2仓" },
      { label: "期望发货时间", value: "2026-06-05 09:00" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "YH20260526002" })}
    ${renderMiniGoodsEditList([
      { name: "物料-低值易耗品001", code: "MAT-001", barcode: "6901000000012", spec: "12瓶/箱", unit: "箱", qty: 80 },
      { name: "物料-低值易耗品002", code: "MAT-002", barcode: "6901000000029", spec: "24袋/箱", unit: "箱", qty: 60 }
    ], { isDraft: true, addHref: "mini-applygoods.html", editHref: "mini-editgoods.html?from=apply" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-applygoods.html">下一步：商品录入</a></div>`;
}

function renderMiniInventoryQueryPage() {
  return `
    <div class="mini-section mini-inv-query">
      ${renderMiniGoodsScanBar("inventory", "扫码查询")}
      <div class="mini-inv-result">
        <div class="mini-inv-product">
          <div class="mini-inv-product-name">物料-低值易耗品001 <span class="mini-inv-code">MAT-001</span></div>
          <div class="mini-inv-product-meta">条码: 6901000000012 | 规格: 12瓶/箱 | 单位: 箱</div>
        </div>
        <div class="mini-inv-table">
          <div class="mini-inv-table-header">
            <span class="mini-inv-th">仓库</span>
            <span class="mini-inv-th">库存数</span>
            <span class="mini-inv-th">可用数</span>
            <span class="mini-inv-th">在途数</span>
          </div>
          <div class="mini-inv-table-row">
            <span class="mini-inv-td">华南2仓</span>
            <span class="mini-inv-td">260</span>
            <span class="mini-inv-td">240</span>
            <span class="mini-inv-td">20</span>
          </div>
          <div class="mini-inv-table-row">
            <span class="mini-inv-td">华北3仓</span>
            <span class="mini-inv-td">180</span>
            <span class="mini-inv-td">165</span>
            <span class="mini-inv-td">15</span>
          </div>
          <div class="mini-inv-table-row">
            <span class="mini-inv-td">华东1仓</span>
            <span class="mini-inv-td">120</span>
            <span class="mini-inv-td">110</span>
            <span class="mini-inv-td">10</span>
          </div>
          <div class="mini-inv-table-row">
            <span class="mini-inv-td">西南4仓</span>
            <span class="mini-inv-td">200</span>
            <span class="mini-inv-td">185</span>
            <span class="mini-inv-td">15</span>
          </div>
          <div class="mini-inv-table-row total">
            <span class="mini-inv-td">合计</span>
            <span class="mini-inv-td">760</span>
            <span class="mini-inv-td">700</span>
            <span class="mini-inv-td">60</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderMiniApplyGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("applygoods")}
      <div class="mini-free-form">
        <div class="mini-ff-row"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value"><input placeholder="扫码或输入商品编码" value="物料-低值易耗品001" /></div></div>
        <div class="mini-ff-row"><div class="mini-ff-label">商品编码</div><div class="mini-ff-value">MAT-001</div></div>
        <div class="mini-ff-dual">
          <div class="mini-ff-row"><div class="mini-ff-label">规格</div><div class="mini-ff-value">12瓶/箱</div></div>
          <div class="mini-ff-row"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
        </div>
        <div class="mini-ff-row"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6901000000012</div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row"><div class="mini-ff-label required">申请数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入申请数量" value="80" /></div></div>
        <div class="mini-ff-row"><div class="mini-ff-label">备注</div><div class="mini-ff-value"><input placeholder="选填" value="门店促销补货" /></div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-apply.html">返回列表</a><a class="primary-button" href="mini-applygoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniApplyGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">2项</span></h4>
        <a class="mini-goods-add-btn" href="mini-applygoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">物料-低值易耗品001 / MAT-001</div>
            <div class="mini-goods-simple-meta"><span>12瓶/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x80</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-applygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-001">删除</button>
        </div>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">物料-低值易耗品002 / MAT-002</div>
            <div class="mini-goods-simple-meta"><span>24袋/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x60</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-applygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-002">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-applygoods.html">返回商品录入</a><a class="primary-button" href="mini-apply.html">提交审核</a></div>`;
}

function renderMiniInboundApplyInfoPage() {
  return renderMiniDocList([
    { title: "外部货主B入库", docNo: "RK20260526001", status: { text: "草稿", type: "draft" },
      fields: [{ label: "货主", value: "外部货主B" }, { label: "申请仓库", value: "华南2仓" }, { label: "商品数", value: "2项 / 120箱" }],
      href: "mini-inboundapplygoodsreview.html" },
    { title: "外部货主A入库", docNo: "RK20260526006", status: { text: "待审批", type: "pending" },
      fields: [{ label: "货主", value: "外部货主A" }, { label: "申请仓库", value: "华北3仓" }, { label: "商品数", value: "1项 / 50箱" }],
      href: "mini-inboundapplygoodsreview.html" }
  ], "mini-inboundapplygoodsreview.html");
}

function renderMiniInboundApplyDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "货主", value: "外部货主B" },
      { label: "申请仓库", value: "华南2仓" },
      { label: "预计到仓时间", value: "2026-06-06 14:00" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "RK20260526001" })}
    ${renderMiniGoodsEditList([
      { name: "低值易耗品-清洁剂", code: "MAT-RK-001", barcode: "6903000000013", spec: "12瓶/箱", unit: "箱", qty: 60 },
      { name: "低值易耗品-工具包", code: "MAT-RK-004", barcode: "6903000000044", spec: "6套/箱", unit: "箱", qty: 60 }
    ], { isDraft: true, addHref: "mini-inboundapplygoods.html", editHref: "mini-editgoods.html?from=inboundapply" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-inboundapplygoods.html">下一步：商品录入</a></div>`;
}

function renderMiniInboundApplyGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("inboundapplygoods")}
      <div class="mini-free-form">
        <div class="mini-free-form-img">\u2615</div>
        <div class="mini-free-form-title">低值易耗品-清洁剂 / MAT-RK-001</div>
        <div class="mini-ff-row"><div class="mini-ff-label required">数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入数量" value="60" /></div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value">低值易耗品-清洁剂 / MAT-RK-001</div></div>
        <div class="mini-ff-dual">
          <div class="mini-ff-row readonly"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
          <div class="mini-ff-row readonly"><div class="mini-ff-label">规格</div><div class="mini-ff-value">12瓶/箱</div></div>
        </div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6903000000013</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装数量</div><div class="mini-ff-value">12</div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-inboundapply.html">返回列表</a><a class="primary-button" href="mini-inboundapplygoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniInboundApplyGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">2项</span></h4>
        <a class="mini-goods-add-btn" href="mini-inboundapplygoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-清洁剂 / MAT-RK-001</div>
            <div class="mini-goods-simple-meta"><span>12瓶/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x60</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-inboundapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-RK-001">删除</button>
        </div>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-工具包 / MAT-RK-004</div>
            <div class="mini-goods-simple-meta"><span>6套/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x60</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-inboundapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-RK-004">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-inboundapplygoods.html">返回商品录入</a><a class="primary-button" href="mini-inboundapply.html">提交审核</a></div>`;
}

function renderMiniReturnApplyInfoPage() {
  return renderMiniDocList([
    { title: "外部货主B退货", docNo: "TH20260526003", status: { text: "草稿", type: "draft" },
      fields: [{ label: "货主", value: "外部货主B" }, { label: "退货仓库", value: "华南2仓" }, { label: "商品数", value: "2项 / 80箱" }],
      href: "mini-returnapplygoodsreview.html" },
    { title: "外部货主C退货", docNo: "TH20260526009", status: { text: "已审核", type: "approved" },
      fields: [{ label: "货主", value: "外部货主C" }, { label: "退货仓库", value: "华北3仓" }, { label: "商品数", value: "1项 / 30箱" }],
      href: "mini-returnapplygoodsreview.html" }
  ], "mini-returnapplygoodsreview.html");
}

function renderMiniReturnApplyDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "货主", value: "外部货主B" },
      { label: "退货仓库", value: "华南2仓" },
      { label: "退货原因", value: "质量异常" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "TH20260526003" })}
    ${renderMiniGoodsEditList([
      { name: "低值易耗品-清洁剂", code: "MAT-TH-001", barcode: "6905000000011", spec: "12瓶/箱", unit: "箱", qty: 45 },
      { name: "低值易耗品-防护手套", code: "MAT-TH-006", barcode: "6905000000066", spec: "24袋/箱", unit: "箱", qty: 35 }
    ], { isDraft: true, addHref: "mini-returnapplygoods.html", editHref: "mini-editgoods.html?from=returnapply" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-returnapplygoods.html">下一步：商品录入</a></div>`;
}

function renderMiniReturnApplyGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("returnapplygoods")}
      <div class="mini-free-form">
        <div class="mini-free-form-title">低值易耗品-清洁剂 / MAT-TH-001</div>
        <div class="mini-ff-row"><div class="mini-ff-label required">退货数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入退货数量" value="45" /></div></div>
        <div class="mini-ff-row"><div class="mini-ff-label">退货原因</div><div class="mini-ff-value"><input placeholder="选填" value="质量异常" /></div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value">低值易耗品-清洁剂 / MAT-TH-001</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装规格</div><div class="mini-ff-value">12瓶/箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6905000000011</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装数量</div><div class="mini-ff-value">12</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">可退数量</div><div class="mini-ff-value">45</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">含税进价</div><div class="mini-ff-value">48.00</div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-returnapply.html">返回列表</a><a class="primary-button" href="mini-returnapplygoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniReturnApplyGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">2项</span></h4>
        <a class="mini-goods-add-btn" href="mini-returnapplygoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-清洁剂 / MAT-TH-001</div>
            <div class="mini-goods-simple-meta"><span>12瓶/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x45</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-returnapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-TH-001">删除</button>
        </div>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-防护手套 / MAT-TH-006</div>
            <div class="mini-goods-simple-meta"><span>24袋/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x35</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-returnapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-TH-006">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-returnapplygoods.html">返回商品录入</a><a class="primary-button" href="mini-returnapply.html">提交审核</a></div>`;
}

function renderMiniReturnInApplyInfoPage() {
  return renderMiniDocList([
    { title: "华南大润发退仓", docNo: "TK20260526008", status: { text: "草稿", type: "draft" },
      fields: [{ label: "客户", value: "华南大润发" }, { label: "退回仓库", value: "华南2仓" }, { label: "商品数", value: "1项 / 20箱" }],
      href: "mini-returngoodsreview.html" },
    { title: "深圳沃尔玛退仓", docNo: "TK20260526012", status: { text: "待审批", type: "pending" },
      fields: [{ label: "客户", value: "深圳沃尔玛" }, { label: "退回仓库", value: "华南1仓" }, { label: "商品数", value: "2项 / 50箱" }],
      href: "mini-returngoodsreview.html" }
  ], "mini-returngoodsreview.html");
}

function renderMiniReturnInApplyDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "原配送单", value: "YH20260526002" },
      { label: "客户", value: "华南大润发" },
      { label: "退仓原因", value: "门店误收" },
      { label: "退回仓库", value: "华南2仓" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "TK20260526008" })}
    ${renderMiniGoodsEditList([
      { name: "物料-低值易耗品001", code: "MAT-001", barcode: "6901000000012", spec: "12瓶/箱", unit: "箱", qty: 20 }
    ], { isDraft: true, addHref: "mini-returngoods.html", editHref: "mini-editgoods.html?from=returngoods" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-returngoods.html">下一步：商品录入</a></div>`;
}

function renderMiniReturnInApplyGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("returngoods")}
      <div class="mini-free-form">
        <div class="mini-free-form-title">物料-低值易耗品001 / MAT-001</div>
        <div class="mini-ff-row"><div class="mini-ff-label required">退仓数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入退仓数量" value="20" /></div></div>
        <div class="mini-ff-row"><div class="mini-ff-label">现场说明</div><div class="mini-ff-value"><input placeholder="选填" value="包装完整，门店误收" /></div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value">物料-低值易耗品001 / MAT-001</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装规格</div><div class="mini-ff-value">12瓶/箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6901000000012</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装数量</div><div class="mini-ff-value">12</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">可退数量</div><div class="mini-ff-value">20</div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-return.html">返回列表</a><a class="primary-button" href="mini-returngoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniReturnInApplyGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">1项</span></h4>
        <a class="mini-goods-add-btn" href="mini-returngoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">物料-低值易耗品001 / MAT-001</div>
            <div class="mini-goods-simple-meta"><span>12瓶/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x20</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-returngoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-001">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-returngoods.html">返回商品录入</a><a class="primary-button" href="mini-return.html">提交审核</a></div>`;
}

function renderMiniLossInfoPage() {
  return renderMiniDocList([
    { title: "华南2仓损溢", docNo: "SY20260526005", status: { text: "草稿", type: "draft" },
      fields: [{ label: "仓库", value: "华南2仓" }, { label: "货主", value: "外部货主A" }, { label: "商品数", value: "2项 / 40箱" }],
      href: "mini-lossgoodsreview.html" },
    { title: "华北3仓损溢", docNo: "SY20260526011", status: { text: "审批驳回", type: "rejected" },
      fields: [{ label: "仓库", value: "华北3仓" }, { label: "货主", value: "外部货主B" }, { label: "商品数", value: "1项 / 15箱" }],
      href: "mini-lossgoodsreview.html" }
  ], "mini-lossgoodsreview.html");
}

function renderMiniLossDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "仓库", value: "华南2仓" },
      { label: "货主", value: "外部货主A" },
      { label: "损溢原因", value: "运输破损" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "SY20260526005" })}
    ${renderMiniGoodsEditList([
      { name: "物料-防护手套", code: "MAT-SS-002", barcode: "6907000000028", spec: "50盒/箱", unit: "箱", qty: 32 },
      { name: "物料-消毒喷雾", code: "MAT-SS-003", barcode: "6907000000035", spec: "24瓶/箱", unit: "箱", qty: 8 }
    ], { isDraft: true, addHref: "mini-lossgoods.html", editHref: "mini-editgoods.html?from=lossgoods" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-lossgoods.html">下一步：异常商品</a></div>`;
}

function renderMiniLossGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("lossgoods")}
      <div class="mini-free-form">
        <div class="mini-free-form-title">低值易耗品-防护手套 / MAT-SY-005</div>
        <div class="mini-ff-row"><div class="mini-ff-label required">损溢数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入数量" value="32" /></div></div>
        <div class="mini-ff-row"><div class="mini-ff-label required">损溢原因</div><div class="mini-ff-value"><select><option>运输破损</option><option>丢失</option><option>污染</option><option>自然损耗</option></select></div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value">低值易耗品-防护手套 / MAT-SY-005</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装规格</div><div class="mini-ff-value">24袋/箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6906000000059</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装数量</div><div class="mini-ff-value">24</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">可用库存</div><div class="mini-ff-value">86</div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-loss.html">返回列表</a><a class="primary-button" href="mini-lossgoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniLossGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">1项</span></h4>
        <a class="mini-goods-add-btn" href="mini-lossgoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-防护手套 / MAT-SY-005</div>
            <div class="mini-goods-simple-meta"><span>24袋/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x32</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-lossgoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-SY-005">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-lossgoods.html">返回商品录入</a><a class="primary-button" href="mini-loss.html">提交审批</a></div>`;
}

function renderMiniOwnershipApplyInfoPage() {
  return renderMiniDocList([
    { title: "外部货主C→自有货主A转移", docNo: "WQ20260526004", status: { text: "草稿", type: "draft" },
      fields: [{ label: "原货主", value: "外部货主C" }, { label: "目标货主", value: "自有货主A" }, { label: "商品数", value: "2项 / 65箱" }],
      href: "mini-ownershipapplygoodsreview.html" },
    { title: "外部货主A→自有货主B转移", docNo: "WQ20260526010", status: { text: "待审批", type: "pending" },
      fields: [{ label: "原货主", value: "外部货主A" }, { label: "目标货主", value: "自有货主B" }, { label: "商品数", value: "1项 / 100箱" }],
      href: "mini-ownershipapplygoodsreview.html" }
  ], "mini-ownershipapplygoodsreview.html");
}

function renderMiniOwnershipApplyDetailPage() {
  return `
    ${renderMiniInfoList([
      { label: "原货主", value: "外部货主C" },
      { label: "目标货主", value: "自有货主A" },
      { label: "仓库", value: "华北3仓" }
    ], { text: "草稿", type: "draft" }, { fullpage: true, title: "WQ20260526004" })}
    ${renderMiniGoodsEditList([
      { name: "低值易耗品-工具包", code: "MAT-WQ-008", barcode: "6909200000086", spec: "6套/箱", unit: "箱", qty: 40 },
      { name: "低值易耗品-消毒液", code: "MAT-WQ-012", barcode: "6909200000123", spec: "12瓶/箱", unit: "箱", qty: 25 }
    ], { isDraft: true, addHref: "mini-ownershipapplygoods.html", editHref: "mini-editgoods.html?from=ownershipapplygoods" })}
    <div class="bottom-actions"><button class="ghost-button">暂存</button><a class="primary-button" href="mini-ownershipapplygoods.html">下一步：商品录入</a></div>`;
}

function renderMiniOwnershipApplyGoodsPage() {
  return `
    <div class="mini-section">
      <h4>扫码/录入商品</h4>
      ${renderMiniGoodsScanBar("ownershipapplygoods")}
      <div class="mini-free-form">
        <div class="mini-free-form-title">低值易耗品-工具包 / MAT-WQ-008</div>
        <div class="mini-ff-row"><div class="mini-ff-label required">转移数量</div><div class="mini-ff-value"><input type="number" placeholder="请输入转移数量" value="40" /></div></div>
        <div class="mini-ff-divider"></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">商品名称</div><div class="mini-ff-value">低值易耗品-工具包 / MAT-WQ-008</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">单位</div><div class="mini-ff-value">箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装规格</div><div class="mini-ff-value">6套/箱</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">条形码</div><div class="mini-ff-value">6909200000086</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">包装数量</div><div class="mini-ff-value">6</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">可转数量</div><div class="mini-ff-value">40</div></div>
        <div class="mini-ff-row readonly"><div class="mini-ff-label">含税进价</div><div class="mini-ff-value">86.00</div></div>
        <button class="mini-ff-save">保存</button>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-ownershipapply.html">返回列表</a><a class="primary-button" href="mini-ownershipapplygoodsreview.html">下一步：已录入商品</a></div>`;
}

function renderMiniOwnershipApplyGoodsReviewPage() {
  return `
    <div class="mini-section">
      <div class="mini-goods-review-bar">
        <h4>已录入商品 <span class="mini-goods-count">2项</span></h4>
        <a class="mini-goods-add-btn" href="mini-ownershipapplygoods.html">+ 新增</a>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-工具包 / MAT-WQ-008</div>
            <div class="mini-goods-simple-meta"><span>6套/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x40</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-ownershipapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-WQ-008">删除</button>
        </div>
      </div>
      <div class="mini-goods-review-item">
        <div class="mini-goods-review-main">
          <div class="mini-goods-simple-img">\u2615</div>
          <div class="mini-goods-simple-info">
            <div class="mini-goods-simple-name">低值易耗品-标签纸 / MAT-WQ-010</div>
            <div class="mini-goods-simple-meta"><span>10卷/箱</span><span>箱</span></div>
          </div>
          <div class="mini-goods-simple-qty">x30</div>
        </div>
        <div class="mini-goods-review-actions">
          <a class="mini-goods-row-act edit" href="mini-ownershipapplygoods.html">编辑</a>
          <button class="mini-goods-row-act delete" data-action="delete-goods" data-doc="MAT-WQ-010">删除</button>
        </div>
      </div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="mini-ownershipapplygoods.html">返回商品录入</a><a class="primary-button" href="mini-ownershipapply.html">提交审核</a></div>`;
}

function renderMiniScanPage() {
  const context = getMiniRuntimeContext();
  const nextHref = buildMiniActionHref("mini-scanresult.html", getMiniStageGroupKey(context.from || "inboundapplygoods"), context.entry || "扫码识别");
  return `
    ${renderMiniSplitPageIntro("扫码识别", `当前页承接“${context.entry || "扫码"}”动作，扫码成功后会自动带出单据或商品信息，并回填到原页面。`, [
      ["识别模式", "条码/二维码", "支持商品码、批次码和业务单号"],
      ["最近识别", "2 次", "最近一次识别成功率 100%"],
      ["下一步", "识别结果", "扫描完成后进入结果页确认带入"]
    ], ["重新扫码", "切换识别类型"])}
    <div class="mini-section"><h4>扫码准备</h4>
      <div class="quick-grid">
        <div class="quick-card"><div class="qc-title">商品码识别</div><div class="qc-desc">用于快速带出商品编码、规格、单位和库存信息。</div></div>
        <div class="quick-card"><div class="qc-title">批次码识别</div><div class="qc-desc">用于带出生产批次、生产日期、保质日期和税价。</div></div>
      </div>
    </div>
    <div class="mini-section"><h4>扫码校验</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">识别范围</div><span class="tag blue">3 类</span></div><div class="muted">支持商品码、批次码、来源单据码。</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">回填方式</div><span class="tag green">自动</span></div><div class="muted">识别成功后进入结果页确认，再回填原页面。</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${getMiniBackHref("inboundapplygoods")}">返回${context.fromTitle}</a><a class="primary-button" href="${nextHref}">开始扫码</a></div>`;
}

function renderMiniScanResultPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("inboundapplygoods");
  return `
    ${renderMiniSplitPageIntro("识别结果", `这里展示扫码后的识别结果和待带入字段，确认后回填到 ${context.fromTitle}。`, [
      ["识别结果", "2 条", "已识别商品码和批次码"],
      ["回填状态", "待确认", "确认后写回原业务页"],
      ["返回方式", "确认带入", `完成后返回 ${context.fromTitle}`]
    ])}
    <div class="mini-section"><h4>扫码结果</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">商品条码 6903000000013</div><span class="tag green">识别成功</span></div><div class="muted">已匹配：低值易耗品-清洁剂 / 规格 12瓶/箱 / 单位 箱</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">批次码 BATCH20260526A</div><span class="tag blue">已回填</span></div><div class="muted">生产日期 2026-05-26 / 保质日期 2027-05-26</div></div>
    </div>
    <div class="mini-section"><h4>待带入字段</h4>
      <div class="form-field"><div class="field-label">商品名称</div><div>低值易耗品-清洁剂 / MAT-RK-001</div></div>
      <div class="form-field"><div class="field-label">默认数量</div><div>60</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回${context.fromTitle}</a><a class="primary-button" href="${backHref}">确认带入</a></div>`;
}

function renderMiniSelectGoodsPage() {
  const context = getMiniRuntimeContext();
  const nextHref = buildMiniActionHref("mini-selectgoodsresult.html", getMiniStageGroupKey(context.from || "inboundapplygoods"), context.entry || "手工新增");
  return `
    ${renderMiniSplitPageIntro("手工选品", `当前页承接“${context.entry || "手工新增"}”动作，用于手工选择商品、补录数量并返回原页面。`, [
      ["可选商品", "18 个", "按货主、仓库和业务场景过滤"],
      ["最近常用", "6 个", "优先展示最近 7 天高频商品"],
      ["下一步", "已选结果", "先选候选商品，再进入结果页确认"]
    ], ["按分类筛选", "查看最近常用"])}
    <div class="mini-section"><h4>候选商品</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">低值易耗品-清洁剂</div><span class="tag blue">常用</span></div><div class="muted">商品编码 MAT-RK-001 / 华南2仓可用库存 260</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">低值易耗品-工具包</div><span class="tag green">可选</span></div><div class="muted">商品编码 MAT-RK-004 / 华南2仓可用库存 180</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">低值易耗品-标签纸</div><span class="tag gray">最近常用</span></div><div class="muted">商品编码 MAT-WQ-010 / 近 3 次申请均有使用</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${getMiniBackHref("inboundapplygoods")}">取消返回</a><a class="primary-button" href="${nextHref}">下一步</a></div>`;
}

function renderMiniSelectGoodsResultPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("inboundapplygoods");
  return `
    ${renderMiniSplitPageIntro("已选结果", `这里汇总已选择商品及带入方式，确认后回到 ${context.fromTitle}。`, [
      ["已暂选", "2 个", "已从候选商品中加入"],
      ["数量合计", "120 箱", "支持回原页面继续编辑"],
      ["回写方式", "覆盖原明细", "保留批次税价字段"]
    ])}
    <div class="mini-section"><h4>暂选结果</h4>
      <div class="form-field"><div class="field-label">已选商品</div><div>2 个商品 / 120 箱</div></div>
      <div class="form-field"><div class="field-label">带入方式</div><div>覆盖原页面商品明细并保留批次税价</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">取消返回</a><a class="primary-button" href="${backHref}">确认选品</a></div>`;
}

function renderMiniUploadVoucherPage() {
  const context = getMiniRuntimeContext();
  const nextHref = buildMiniActionHref("mini-uploadvoucherresult.html", getMiniStageGroupKey(context.from || "inboundapplygoods"), context.entry || "上传图片");
  return `
    ${renderMiniSplitPageIntro("上传凭证", `当前页承接“${context.entry || "上传图片"}”动作，用于上传现场凭证、送货清单或异常照片，并回填到原页面。`, [
      ["上传方式", "拍照/相册", "支持现场拍照和已有图片上传"],
      ["当前文件", "2 份", "已上传送货清单和检测报告"],
      ["下一步", "文件结果", "上传后进入文件结果页确认"]
    ], ["拍照上传", "相册选择"])}
    <div class="mini-section"><h4>上传入口</h4>
      <div class="quick-grid">
        <div class="quick-card"><div class="qc-title">现场拍照</div><div class="qc-desc">用于上传实物照片、签收单和异常现场图。</div></div>
        <div class="quick-card"><div class="qc-title">相册选择</div><div class="qc-desc">用于补传送货清单、检测报告和历史附件。</div></div>
      </div>
    </div>
    <div class="mini-section"><h4>上传规则</h4>
      <div class="mini-list-row"><div class="muted">支持 JPG、PNG、PDF；单文件不超过 10MB。</div></div>
      <div class="mini-list-row"><div class="muted">上传后自动关联当前单据，并在商品录入页展示附件状态。</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${getMiniBackHref("inboundapplygoods")}">返回原页面</a><a class="primary-button" href="${nextHref}">下一步</a></div>`;
}

function renderMiniUploadVoucherResultPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("inboundapplygoods");
  return `
    ${renderMiniSplitPageIntro("文件结果", `这里展示已上传附件及关联结果，确认后返回 ${context.fromTitle}。`, [
      ["上传结果", "2 份", "送货清单和检测报告均已上传"],
      ["关联状态", "已关联", "已挂到当前单据和商品录入页"],
      ["返回方式", "完成上传", "确认后返回原页面"]
    ])}
    <div class="mini-section"><h4>已上传文件</h4>
      <div class="quick-grid">
        <div class="quick-card"><div class="qc-title">送货清单</div><div class="qc-desc">2026-05-26 14:18 上传 / JPG / 1.2MB</div></div>
        <div class="quick-card"><div class="qc-title">检测报告</div><div class="qc-desc">2026-05-26 14:20 上传 / PDF / 2.8MB</div></div>
      </div>
    </div>
    <div class="mini-section"><h4>上传回执</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">关联对象</div><span class="tag green">成功</span></div><div class="muted">已关联入库申请商品录入页，可继续提交审核。</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">完成上传</a></div>`;
}

function renderMiniInventoryLookupPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("applygoods");
  return `
    ${renderMiniSplitPageIntro("查看库存", `当前页承接“${context.entry || "查看库存"}”动作，用于确认库存可用量、建议批次和锁定情况。`, [
      ["查询仓库", "华南2仓", "按来源页面自动带出仓库"],
      ["可用库存", "260", "满足当前申请数量"],
      ["建议批次", "2 个", "按先进先出推荐"]
    ], ["刷新库存", "切换仓库"])}
    <div class="mini-section"><h4>库存结果</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">低值易耗品-清洁剂</div><span class="tag green">库存充足</span></div><div class="muted">可用 260 / 锁定 20 / 待检 10 / 在途 40</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">推荐批次 BATCH20260526A</div><span class="tag blue">优先出库</span></div><div class="muted">生产日期 2026-05-26 / 保质日期 2027-05-26 / 可用 120</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">推荐批次 BATCH20260518B</div><span class="tag gray">次优先</span></div><div class="muted">生产日期 2026-05-18 / 保质日期 2027-05-18 / 可用 140</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">带入推荐批次</a></div>`;
}

function renderMiniEditGoodsPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("inboundapplygoods");
  return `
    ${renderMiniSplitPageIntro("编辑商品明细", `当前页承接“${context.entry || "编辑明细"}”动作，用于修改数量、批次、税价和备注，并回写到原页面。`, [
      ["当前商品", "低值易耗品-清洁剂", "来源于原页面已选商品"],
      ["编辑重点", "数量/税价", "支持补录税价与附件说明"],
      ["回写方式", "实时覆盖", `保存后返回 ${context.fromTitle}`]
    ])}
    <div class="mini-section">
      <div class="form-field"><div class="field-label">商品名称</div><div>低值易耗品-清洁剂</div></div>
      <div class="form-field"><div class="field-label">申请数量</div><div>60 箱</div></div>
      <div class="form-field"><div class="field-label">进项税率</div><div>13%</div></div>
      <div class="form-field"><div class="field-label">含税进价</div><div>48.00</div></div>
      <div class="form-field"><div class="field-label">备注</div><div>送货资料齐全，可直接提交审核</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">取消返回</a><a class="primary-button" href="${backHref}">保存并返回</a></div>`;
}

function renderMiniBatchDetailPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("returnapplygoods");
  return `
    ${renderMiniSplitPageIntro("批次详情", `当前页承接“${context.entry || "查看批次"}”动作，用于确认批次库存、生产日期和可退数量。`, [
      ["批次数量", "2 个", "按当前商品展示可选批次"],
      ["可退总量", "80", "本次申请数量在可退范围内"],
      ["校验状态", "通过", "批次与仓库、货主口径一致"]
    ])}
    <div class="mini-section"><h4>批次列表</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">BATCH20260508A</div><span class="tag green">可退 45</span></div><div class="muted">生产日期 2026-05-08 / 保质日期 2027-05-08 / 含税进价 48.00</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">BATCH20260510B</div><span class="tag blue">可退 35</span></div><div class="muted">生产日期 2026-05-10 / 保质日期 2027-05-10 / 含税进价 30.00</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">确认批次</a></div>`;
}

function renderMiniOriginOrderPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("returngoods");
  return `
    ${renderMiniSplitPageIntro("来源单据", `当前页承接“${context.entry || "查看原单"}”动作，用于查看退仓来源单、客户与仓库信息。`, [
      ["来源单号", "PS20260521012", "自动回溯自配送执行结果"],
      ["客户信息", "内部客户-华东分部", "用于确认退回路径"],
      ["状态", "已签收", "允许发起退仓申请"]
    ])}
    <div class="mini-section"><h4>原单信息</h4>
      <div class="form-field"><div class="field-label">配送单号</div><div>PS20260521012</div></div>
      <div class="form-field"><div class="field-label">客户</div><div>内部客户-华东分部</div></div>
      <div class="form-field"><div class="field-label">货主</div><div>自有货主A</div></div>
      <div class="form-field"><div class="field-label">退回仓库</div><div>华东1仓</div></div>
    </div>
    <div class="mini-section"><h4>商品摘要</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">物料-低值易耗品001</div><span class="tag blue">原配送 20</span></div><div class="muted">当前可退 20 / 现场说明：门店误收</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">带回原单信息</a></div>`;
}

function renderMiniRuleCheckPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("ownershipapplygoods");
  return `
    ${renderMiniSplitPageIntro("规则校验", `当前页承接“${context.entry || "查看规则"}”动作，用于核对货权转移规则、合同口径和库存归属限制。`, [
      ["校验规则", "4 项", "合同、货主、库存、通知口径全部检查"],
      ["当前结果", "全部通过", "可继续提交物权转移申请"],
      ["回写结果", "已记录", "返回原页面后展示校验通过状态"]
    ])}
    <div class="mini-section"><h4>校验结果</h4>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">合同关系校验</div><span class="tag green">通过</span></div><div class="muted">原货主与目标货主均存在有效协同关系。</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">库存归属校验</div><span class="tag green">通过</span></div><div class="muted">当前库存数量不变，仅变更货主归属。</div></div>
      <div class="mini-list-row"><div class="mini-top"><div class="list-title">通知生成规则</div><span class="tag green">通过</span></div><div class="muted">审批通过后自动生成物权转移通知单。</div></div>
    </div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">确认规则</a></div>`;
}

function renderMiniLocationPage() {
  const context = getMiniRuntimeContext();
  const backHref = getMiniBackHref("return");
  return `
    ${renderMiniSplitPageIntro("定位结果", `当前页承接“${context.entry || "获取定位"}”动作，用于记录现场位置并回填到原页面。`, [
      ["定位状态", "已获取", "室外精度 12 米"],
      ["当前位置", "青岛市市南区香港中路", "已完成地址逆解析"],
      ["回填方式", "自动写入", `返回 ${context.fromTitle} 后可见`]
    ], ["刷新定位"])}
    <div class="mini-section"><h4>定位信息</h4>
      <div class="form-field"><div class="field-label">经纬度</div><div>120.3826, 36.0671</div></div>
      <div class="form-field"><div class="field-label">详细地址</div><div>山东省青岛市市南区香港中路 68 号门店收货区</div></div>
      <div class="form-field"><div class="field-label">定位时间</div><div>2026-06-01 09:41:12</div></div>
    </div>
    <div class="mini-section"><h4>地图预览</h4><div class="quick-card"><div class="qc-title">当前位置已标记</div><div class="qc-desc">后续可继续补真实地图组件、轨迹记录和地址校验能力。</div></div></div>
    <div class="bottom-actions"><a class="ghost-button" href="${backHref}">返回原页面</a><a class="primary-button" href="${backHref}">确认定位</a></div>`;
}

const pcSummaries = {
  dashboard: [
    ["待办总数", "28", "审批与异常混合"],
    ["履约准时率", "97.3%", "较昨日提升 1.2%"],
    ["高优异常", "3", "需今日闭环"],
    ["跨系统回执", "42", "BMS/WMS/TMS"]
  ],
  demand: [
    ["待审核单", "18", "含接口导入 6 单"],
    ["待履约单", "128", "锁定库存已生效"],
    ["内部客户占比", "62%", "资源资产需回传"],
    ["命中关系表", "96%", "少量待人工确认"]
  ],
  newproduct: [
    ["待审核录入单", "6", "含Excel导入 3 单"],
    ["外部货主录入", "4", "近7日"],
    ["已写入商品", "9", "审批通过后自动写入"],
    ["主数据待补充", "2", "分类待确认"]
  ],
  newproductcreate: [
    ["待补录字段", "6", "点击字段可模拟填写"],
    ["附件待上传", "2", "检测报告与图片"],
    ["分类待映射", "1", "需主数据确认"],
    ["目标结果", "提交审批", "保存后进入审批流程"]
  ],
  newproductedit: [
    ["待修改单据", "1", "当前演示样例"],
    ["驳回原因", "2", "分类与附件问题"],
    ["待重校验", "3", "条码/分类/附件"],
    ["目标结果", "重新提交", "修改后再次送审"]
  ],
  inbound: [
    ["待审核申请", "9", "外部货主为主"],
    ["WMS在途作业", "6", "待上架和复核"],
    ["已入库完成", "24", "近24小时"],
    ["待财务回传", "5", "BMS回执中"]
  ],
  inboundnotice: [
    ["自动生成通知", "18", "审核通过后生成"],
    ["待WMS接收", "4", "待接口确认"],
    ["已下发WMS", "11", "执行中"],
    ["部分入库", "3", "待后续接收"]
  ],
  purchasein: [
    ["WMS接收成功", "32", "近24小时"],
    ["库存已同步", "32", "3PL库存已更新"],
    ["资源资产回传", "30", "2 单待补偿"],
    ["BMS待回执", "4", "财务处理中"]
  ],
  returnapply: [
    ["待审核申请", "7", "手工与资源资产混合"],
    ["资源资产传入", "4", "近24小时"],
    ["已生成通知", "5", "审核通过后自动生成"],
    ["待财务关注", "2", "需跟踪回执"]
  ],
  returnnotice: [
    ["自动生成通知", "5", "由退货申请单触发"],
    ["待WMS接收", "2", "待接口确认"],
    ["已下发WMS", "3", "执行中"],
    ["部分退货", "1", "待后续完成"]
  ],
  purchasereturn: [
    ["退货单总数", "11", "近7日"],
    ["库存已扣减", "11", "同步完成"],
    ["待BMS传单", "2", "需跟进回执"],
    ["差异工单", "0", "当前无新增"]
  ],
  delivery: [
    ["配送执行中", "46", "WMS/TMS联动"],
    ["待签收", "19", "门店与客户侧"],
    ["异常运单", "4", "需物流跟进"],
    ["资源资产回传", "14", "内部客户场景"]
  ],
  transportservice: [
    ["运输中", "12", "承运商已接单出发"],
    ["待发运", "5", "待承运安排"],
    ["已完成", "28", "近7日签收"],
    ["异常运单", "2", "需跟进"]
  ],
  returnapplyin: [
    ["待审批申请", "4", "手工与接口混合"],
    ["草稿申请", "2", "待补商品明细"],
    ["已生成通知", "3", "审批通过后自动生成"],
    ["待WMS下发", "1", "通知待发送"]
  ],
  returnnoticein: [
    ["自动生成通知", "3", "由退仓申请单触发"],
    ["待WMS接收", "1", "待接口确认"],
    ["已下发WMS", "2", "执行中"],
    ["部分收货", "1", "待后续完成"]
  ],
  ownershipapply: [
    ["待审批申请", "3", "货权校验中"],
    ["草稿申请", "2", "待补商品明细"],
    ["已生成通知", "2", "审批通过自动生成"],
    ["待WMS下发", "1", "通知待发送"]
  ],
  ownershipnotice: [
    ["自动生成通知", "2", "由物权转移申请单触发"],
    ["待WMS接收", "1", "待接口确认"],
    ["已下发WMS", "2", "执行中"],
    ["待BMS传单", "1", "待结果回写"]
  ],
  return: [
    ["退仓审批中", "7", "待确认原单信息"],
    ["仓库收货中", "5", "WMS处理中"],
    ["已完成入库", "21", "近7日"],
    ["异常退仓", "2", "待质检分流"]
  ],
  transfer: [
    ["调拨执行单", "15", "WMS结果直传"],
    ["库存同步成功", "15", "调出调入均已处理"],
    ["资源资产待回执", "1", "需人工确认"],
    ["BMS待回执", "3", "财务处理中"]
  ],
  loss: [
    ["审批中", "6", "高优先 2 单"],
    ["处理中", "4", "待WMS执行"],
    ["已完成", "18", "近7日"],
    ["审计补证", "2", "待上传图片"]
  ],
  inventoryplan: [
    ["待审核申请", "5", "手工与资源资产混合"],
    ["资源资产传入", "3", "近24小时"],
    ["已生成通知", "6", "审核通过后自动生成"],
    ["待财务关注", "1", "需跟踪回执"]
  ],
  inventorynotify: [
    ["自动生成通知", "6", "由盘点计划申请单触发"],
    ["待WMS接收", "2", "待接口确认"],
    ["已下发WMS", "4", "执行中"],
    ["盘点执行中", "3", "等待WMS回传结果"]
  ],
  inventorycheck: [
    ["待确认盘点", "3", "含差异项待核实"],
    ["已确认盘点", "8", "近7日"],
    ["差异商品数", "12", "盘盈4 / 盘亏8"],
    ["已生成损溢单", "5", "差异确认后自动联动"]
  ],
  positionadjust: [
    ["待审批", "2", "库存地点调整申请待审核"],
    ["调整中", "3", "WMS正在执行"],
    ["已完成", "5", "近7日"],
    ["待BMS传单", "1", "调整后待财务处理"]
  ],
  ownership: [
    ["待审批", "5", "合同与库存校验中"],
    ["待WMS确认", "3", "货权结果待回传"],
    ["已完成", "12", "近30日"],
    ["财务同步中", "2", "待BMS回执"]
  ],
  inoutrecord: [
    ["今日记录数", "79", "入库与出库混合"],
    ["入库动作", "42", "含退仓入库与调拨入库"],
    ["出库动作", "37", "含配送出库与退货出库"],
    ["异常回执", "3", "待资源资产/BMS补偿"]
  ],
  inventory: [
    ["总库存SKU", "12,860", "覆盖 18 仓"],
    ["可用库存率", "92.6%", "较上周提升"],
    ["低库存项", "12", "重点关注"],
    ["异常库存", "46", "待检/残次/损溢"]
  ],
  productinfo: [
    ["商品总数", "2,860", "含新品与历史商品"],
    ["新品已写入", "9", "近7日审批通过"],
    ["待启用商品", "3", "待补主数据属性"],
    ["条码异常", "1", "需复核重复条码"]
  ],
  org: [
    ["组织总数", "46", "含总部与区域分部"],
    ["区域分部", "6", "覆盖全国主要区域"],
    ["待配置", "2", "待补充负责人信息"],
    ["已启用", "44", "正常运行中"]
  ],
  supplier: [
    ["供应商总数", "128", "含品牌与区域供应商"],
    ["活跃供应商", "96", "近30日有业务往来"],
    ["待审核", "5", "新提交供应商资质"],
    ["合作到期", "3", "需续签合作协议"]
  ],
  warehouse: [
    ["配送仓总数", "18", "覆盖全国主要区域"],
    ["启用仓库", "15", "正常运行"],
    ["临时仓", "2", "旺季临时启用"],
    ["利用率均值", "78.5%", "较上月提升"]
  ],
  vehicle: [
    ["车辆总数", "86", "含自营与外包车辆"],
    ["在用车辆", "72", "当前运营中"],
    ["维修中", "5", "预计3日内恢复"],
    ["闲置车辆", "9", "可调度运力"]
  ],
  sla: [
    ["时效规则总数", "24", "覆盖主要业务环节"],
    ["生效规则", "21", "当前生效中"],
    ["待生效", "3", "待审批或待发布"],
    ["超时预警(今日)", "7", "需关注处理"]
  ],
  storeordercycle: [
    ["已定义门店数", "152", "覆盖主要门店"],
    ["按周模式", "98", "指定每周可要货日"],
    ["按月模式", "54", "指定每月可要货号"],
    ["未配置门店", "34", "需定义要货周期"]
  ],
  owner: [
    ["货主总数", "36", "自有与外部并存"],
    ["启用货主", "32", "4 个待复核"],
    ["外部货主", "14", "支持独立结算"],
    ["主数据异常", "2", "待补联系人"]
  ],
  customer: [
    ["客户总数", "58", "含内部与外部"],
    ["内部客户", "24", "需回传资源资产"],
    ["默认仓已配", "52", "关系表已生效"],
    ["待完善资料", "3", "联系电话缺失"]
  ],
  ownersupplier: [
    ["关联总数", "42", "货主与供应商绑定"],
    ["活跃关联", "36", "近30日有业务"],
    ["待确认", "4", "新增待审核"],
    ["合作到期", "2", "需续签协议"]
  ],
  customerstore: [
    ["门店总数", "186", "覆盖直营与加盟"],
    ["启用门店", "168", "正常收货"],
    ["待配置配送仓", "12", "需分配默认仓"],
    ["加盟门店", "78", "外部客户下属"]
  ],
  ownercustomer: [
    ["关系总数", "74", "客户与货主绑定"],
    ["默认关系", "58", "可自动带出"],
    ["待调整关系", "5", "新客户待配置"],
    ["冲突关系", "1", "需人工确认"]
  ],
  ownerwarehouse: [
    ["关系总数", "42", "覆盖主要仓库"],
    ["默认入库仓", "28", "自动带出"],
    ["默认发货仓", "31", "满足配送匹配"],
    ["待确认关系", "2", "仓库切换中"]
  ],
  customerstorerelation: [
    ["关系总数", "186", "门店与仓库绑定"],
    ["生效关系", "168", "正常配送"],
    ["待配置门店", "12", "需分配仓库"],
    ["库存地点", "24", "WMS 库位映射"]
  ],
  approval: [
    ["待审批", "18", "客户要货为主"],
    ["高优先", "3", "损溢/物权转移"],
    ["超时审批", "2", "超过 4 小时"],
    ["今日已办", "26", "处理效率稳定"]
  ],
  finance: [
    ["待回执", "6", "BMS处理中"],
    ["传单失败", "3", "需人工干预"],
    ["已回执", "42", "近24小时"],
    ["差异工单", "3", "待闭环"]
  ],
  logs: [
    ["成功调用", "268", "近24小时"],
    ["失败重试", "7", "自动重试中"],
    ["人工补偿", "2", "待执行"],
    ["签名异常", "1", "需集成排查"]
  ]
};

const pcInsights = {
  dashboard: {
    focus: "优先关注 WMS 回传超时和 BMS 财务差异，这两类问题最影响汇报中的闭环展示。",
    roles: "运营经理、仓储运营、财务协同、接口管理员",
    next: ["先看异常预警", "再切客户要货和配送", "最后展示财务与接口日志"]
  },
  demand: {
    focus: "本页最适合展示关系表自动匹配货主和发货仓，以及客户要货转配送的起点。",
    roles: "客户运营、履约专员、审批人",
    next: ["演示筛选条件", "打开一条要货单", "切到配送管理继续讲履约"]
  },
  newproduct: {
    focus: "本页用于展示外部货主新品录入、Excel导入、审批写入商品信息的完整主数据链路。",
    roles: "货主服务、主数据管理员、审批人",
    next: ["先看录入来源", "再看商品明细", "审批通过后切到商品信息"]
  },
  newproductcreate: {
    focus: "本页用于演示外部货主手工录入新品资料的页面形态，重点展示字段录入、附件上传和提交审批前校验。",
    roles: "外部货主、货主服务、主数据管理员",
    next: ["先填写基础信息", "再维护商品明细", "提交审批后回到新品录入单"]
  },
  newproductedit: {
    focus: "本页用于演示新品录入单被驳回后的编辑页面，重点展示修改原因、字段补录和重新提交审批。",
    roles: "外部货主、审批人、主数据管理员",
    next: ["先看驳回原因", "再修改商品属性", "最后重新提交审批"]
  },
  inbound: {
    focus: "突出入库申请单、审核、申请商品明细、WMS执行和财务回传的完整链路。",
    roles: "货主服务、仓储运营、财务专员",
    next: ["先看申请列表", "审核通过后生成入库通知单", "再说明WMS执行和BMS回传口径"]
  },
  inboundnotice: {
    focus: "本页重点说明入库申请单审核通过后，平台自动生成入库通知单并下发WMS的衔接过程。",
    roles: "仓储运营、接口专员、货主服务",
    next: ["先看通知单来源申请", "再看通知商品明细", "继续切到入库单"]
  },
  purchasein: {
    focus: "强调入库单由 WMS 直传，不在 3PL 本地新建。",
    roles: "仓储运营、接口专员、财务专员",
    next: ["说明 WMS 来源", "展示库存同步", "补充资源资产和 BMS 回传"]
  },
  returnapply: {
    focus: "本页用于说明退货申请既支持手工创建，也支持资源资产系统传入，并通过审核生成退货通知单。",
    roles: "客户运营、仓储运营、审批人",
    next: ["先看申请来源", "再看申请商品明细", "审核后切到退货通知单"]
  },
  returnnotice: {
    focus: "本页重点说明退货申请单审核通过后，平台自动生成退货通知单并下发WMS的衔接过程。",
    roles: "仓储运营、接口专员、客户运营",
    next: ["先看通知单来源申请", "再看通知商品明细", "继续切到退货单"]
  },
  purchasereturn: {
    focus: "突出退货单由 WMS 传入后立即扣减库存，并同步下游系统。",
    roles: "采购协同、仓储运营、财务专员",
    next: ["看退货单列表", "再讲库存扣减", "最后说明无差异时的空态"]
  },
  delivery: {
    focus: "本页最适合讲客户要货 -> 配送单 -> WMS/TMS 执行 -> 签收跟踪。",
    roles: "履约专员、物流专员、客户服务",
    next: ["先看单据基本信息", "再看执行轨迹", "再切财务协同"]
  },
  deliveryorder: {
    focus: "配送单是WMS出库执行完成后的回传结果，重点展示库存扣减、签收数量和财务回传状态。",
    roles: "仓储运营、财务专员、接口管理员",
    next: ["先看出库与签收对比", "再看库存扣减", "最后说明BMS回传"]
  },
  returnapplyin: {
    focus: "本页用于展示退仓申请单从草稿、提交审批到自动生成退仓通知单的完整前置链路。",
    roles: "客户运营、仓储运营、审批人",
    next: ["先看草稿与待审批", "再看弹窗录入和修改", "审批通过后切到退仓通知单"]
  },
  returnnoticein: {
    focus: "本页重点说明退仓申请单审批通过后，平台自动生成退仓通知单并下发WMS的衔接过程。",
    roles: "仓储运营、接口专员、客户运营",
    next: ["先看通知来源申请", "再看通知商品明细", "继续切到退仓单"]
  },
  return: {
    focus: "这里重点说明退仓单回写收货结果、库存更新和财务联动口径。",
    roles: "客户运营、仓储运营、质检专员",
    next: ["查看退仓单", "说明原单回溯", "补充质检与财务处理"]
  },
  transfer: {
    focus: "本页适合突出新增调拨单场景：WMS 来源、库存同步、资源资产和 BMS 双传。",
    roles: "仓储运营、接口专员、财务专员",
    next: ["先看调拨列表", "再看库存变化", "最后说明回传状态"]
  },
  loss: {
    focus: "损溢页面适合展示异常处理闭环和审计留痕要求。",
    roles: "仓储运营、质检、财务、审计",
    next: ["讲审批", "讲库存影响", "讲审计资料沉淀"]
  },
  inventoryplan: {
    focus: "本页用于说明盘点计划申请既支持手工创建，也支持资源资产系统传入，审核通过后自动生成盘点通知单。",
    roles: "仓储运营、审批人、客户运营",
    next: ["先看申请来源", "再看申请商品明细", "审核后切到盘点通知单"]
  },
  inventorynotify: {
    focus: "本页重点说明盘点计划申请单审核通过后，平台自动生成盘点通知单并下发WMS的衔接过程。",
    roles: "仓储运营、接口专员、客户运营",
    next: ["先看通知单来源申请", "再看通知商品明细", "继续切到盘点结果单"]
  },
  inventorycheck: {
    focus: "本页展示WMS盘点结果推送、3PL确认和联动损溢单的库存调整闭环。",
    roles: "仓储运营、财务专员、审计",
    next: ["先看盘点结果列表", "再确认差异明细", "最后说明损溢单联动"]
  },
  positionadjust: {
    focus: "本页用于库存地点调整单的创建、审批和执行，调整库存库存地点并同步WMS和资源资产系统。",
    roles: "仓储运营、审批人、接口专员",
    next: ["先看调整单列表", "再看调整商品明细", "最后说明库存联动"]
  },
  ownershipapply: {
    focus: "本页用于展示物权转移申请单从草稿、提交审批到自动生成物权转移通知单的完整前置链路。",
    roles: "货主服务、仓储运营、审批人",
    next: ["先看草稿与待审批", "再看弹窗录入和修改", "审批通过后切到物权转移通知单"]
  },
  ownershipnotice: {
    focus: "本页重点说明物权转移申请单审批通过后，平台自动生成物权转移通知单并下发WMS调整库存归属。",
    roles: "仓储运营、接口专员、财务专员",
    next: ["先看通知来源申请", "再看通知商品明细", "继续切到物权转移单"]
  },
  ownership: {
    focus: "物权转移单页面重点是结果回写、库存归属变更和财务协同。",
    roles: "货主管理、仓储运营、财务专员",
    next: ["讲校验项", "讲WMS确认", "讲BMS回执"]
  },
  inoutrecord: {
    focus: "本页适合集中展示所有影响库存的出入库操作记录，突出留痕、追溯和对账能力。",
    roles: "仓储运营、财务专员、运营经理、接口专员",
    next: ["先看记录筛选", "再看单据明细追溯", "最后切库存台账或财务协同"]
  },
  inventory: {
    focus: "库存台账更适合做管理层汇报，可快速体现货主、仓库和异常库存情况。",
    roles: "运营经理、仓储经理、财务协同",
    next: ["看KPI", "看库存明细", "补充库存预警说明"]
  },
  productinfo: {
    focus: "商品信息页用于说明新品审批通过后如何沉淀为正式商品主数据，并供各业务单据引用。",
    roles: "主数据管理员、货主服务、仓储运营",
    next: ["查看商品列表", "说明新品来源单据", "切回新品录入单演示前置流程"]
  },
  owner: {
    focus: "本页用于讲清货主主数据来源、货主分类和与业务单据、库存归属的关系。",
    roles: "主数据管理员、运营经理、财务专员",
    next: ["查看货主列表", "说明自有与外部货主差异", "切换货主仓库关系表"]
  },
  customer: {
    focus: "客户信息页适合展示内部客户和外部客户的差异化管理口径。",
    roles: "客户运营、主数据管理员、履约专员",
    next: ["先看客户列表", "再讲客户类型", "切到货主客户关系表"]
  },
  ownercustomer: {
    focus: "货主客户关系表是客户要货和退仓回溯的关键基础关系配置。",
    roles: "主数据管理员、客户运营、履约专员",
    next: ["说明默认货主匹配", "查看关系生效状态", "切到客户要货单"]
  },
  ownerwarehouse: {
    focus: "货主仓库关系表用于解释入库、发货和退仓时仓库自动带出的规则。",
    roles: "主数据管理员、仓储运营、接口专员",
    next: ["查看关系列表", "说明默认仓口径", "切到入库或调拨业务页"]
  },
  customerstorerelation: {
    focus: "客户门店仓库关系表定义门店与配送仓库的一对一映射，用于客户要货单创建时自动带出仓库和库存地点。",
    roles: "主数据管理员、客户运营、仓储运营",
    next: ["说明一对一绑定规则", "展示库存地点与WMS映射", "切到客户要货单演示自动匹配"]
  },
  storeordercycle: {
    focus: "门店要货周期定义表控制每个门店的可要货日期，支持按周和按月两种模式，用于客户要货单提交时的日期校验。",
    roles: "主数据管理员、客户运营、配送调度",
    next: ["说明按周与按月两种模式", "展示不同门店的规则差异", "切到客户要货单演示日期校验"]
  },
  approval: {
    focus: "审批中心是跨业务统一入口，适合讲平台化价值。",
    roles: "审批人、部门负责人、业务经理",
    next: ["先看待办列表", "打开审批详情", "说明转交/驳回/通过动作"]
  },
  finance: {
    focus: "财务协同页能体现业务闭环是否完整，是汇报中的关键页。",
    roles: "财务专员、接口专员、项目经理",
    next: ["看任务列表", "看差异看板", "最后切接口日志"]
  },
  logs: {
    focus: "接口日志页适合证明系统具备可追溯、可重试、可补偿能力。",
    roles: "接口管理员、研发、运维",
    next: ["看失败日志", "看重试策略", "说明人工补偿入口"]
  }
};

const miniHighlights = {
  home: ["待办 12", "异常 5", "快速发起"],
  todo: ["待审批 8", "高优先 2", "移动处理"],
  apply: ["轻量发起", "自动带出", "支持暂存"],
  applygoods: ["独立商品页", "库存校验", "两步录入"],
  inboundapply: ["预约入库", "附件资料", "批次税价"],
  inboundapplygoods: ["独立商品页", "批次税价", "附件资料"],
  returnapply: ["退货申请", "可退数量", "金额联动"],
  returnapplygoods: ["独立商品页", "可退校验", "金额联动"],
  return: ["原单回溯", "自动匹配", "提交审批"],
  returngoods: ["独立商品页", "原单回溯", "现场凭证"],
  transfer: ["查看结果", "库存变化", "跨仓调拨"],
  loss: ["异常上报", "责任说明", "审批流转"],
  lossgoods: ["独立商品页", "异常留痕", "现场资料"],
  ownershipapply: ["货权调整", "规则校验", "生成通知"],
  ownershipapplygoods: ["独立商品页", "货权归属", "规则校验"],
  scan: ["扫码识别", "自动带入", "移动采集"],
  scanresult: ["识别结果", "待带入字段", "确认回写"],
  selectgoods: ["手工选品", "最近常用", "快速回填"],
  selectgoodsresult: ["已选结果", "数量汇总", "确认带入"],
  uploadvoucher: ["现场凭证", "拍照上传", "附件留痕"],
  uploadvoucherresult: ["文件结果", "附件关联", "确认回填"],
  inventorylookup: ["库存查询", "推荐批次", "锁定校验"],
  editgoods: ["明细编辑", "实时回写", "字段补录"],
  batchdetail: ["批次明细", "日期校验", "数量确认"],
  originorder: ["来源单据", "原单回溯", "退仓依据"],
  rulecheck: ["规则校验", "合同口径", "归属确认"],
  location: ["定位结果", "地址回填", "现场留痕"],
  inventory: ["快速查询", "库存状态", "预警展示"],
  message: ["审批提醒", "异常通知", "统一消息"],
  detail: ["状态轨迹", "基础信息", "履约跟踪"]
};

const miniTips = {
  home: "建议先展示首页的待办和快捷发起，再切到待办中心和申请单页面。",
  todo: "本页适合演示审批人在移动端快速通过、驳回和转交的操作方式。",
  apply: "这里建议重点讲自动带出货主和发货仓，体现移动端轻量录入体验。",
  applygoods: "本页是独立商品录入页，建议重点说明要货申请拆成基础信息和商品录入两个真实页面。",
  inboundapply: "入库申请适合重点说明移动端如何录入商品批次、税价和附件资料。",
  inboundapplygoods: "这里是独立的商品录入页，适合重点讲批次、税价和附件不再和基础信息混排。",
  returnapply: "退货申请适合强调可退数量校验、退货原因和财务联动口径。",
  returnapplygoods: "本页独立展示退货商品与金额信息，更贴近真实移动端申请流程。",
  return: "退仓申请适合说明按原单回溯，减少人工判断和错退仓风险。",
  returngoods: "退仓商品录入页独立后，更适合演示原单回溯、现场凭证和数量维护。",
  transfer: "调拨单更适合做结果查看页面，不强调移动端发起，而强调移动端跟踪。",
  loss: "损溢申请建议搭配现场图片上传和责任说明，后续可继续补这一能力。",
  lossgoods: "这里是损溢商品独立页，适合专门演示异常商品、数量和现场凭证采集。",
  ownershipapply: "物权转移申请适合说明库存数量不变，但货主归属、通知和财务规则会变化。",
  ownershipapplygoods: "这里独立承载可转商品与归属调整明细，更符合两步式业务录入。",
  scan: "扫码页适合演示小程序调起摄像头、识别条码后自动带出单据或商品信息。",
  scanresult: "识别结果页适合展示扫码后的结果确认和回填，避免一个页面内容过长。",
  selectgoods: "手工选品页适合演示候选商品、最近常用商品和带回原页面的过程。",
  selectgoodsresult: "已选结果页适合展示选品汇总与确认带回，保持页面长度更接近移动端规范。",
  uploadvoucher: "上传凭证页适合演示拍照、附件上传和现场资料留痕能力。",
  uploadvoucherresult: "文件结果页适合展示附件上传回执和关联结果，避免上传页过长。",
  inventorylookup: "库存查看页适合演示库存可用量、推荐批次和锁定库存校验。",
  editgoods: "编辑明细页适合承接商品数量、批次、税价等字段的补录与修改。",
  batchdetail: "批次详情页适合承接退货和退仓场景中的批次核对与数量确认。",
  originorder: "来源单据页适合展示退仓场景中的原配送单回溯能力。",
  rulecheck: "规则校验页适合展示物权转移场景中的合同、库存和通知规则。",
  location: "定位结果页适合展示移动端现场定位、地址逆解析和回填能力。",
  inventory: "库存查询页适合给仓储和运营主管使用，快速确认当前库存可用量。",
  message: "消息中心可以继续扩展已读标记、筛选和批量处理，目前已具备展示框架。",
  detail: "单据详情页适合做领导演示收尾页，展示状态轨迹和跨系统结果回传。"
};

const demandDetailConfigs = {
  YH20260526001: {
    title: "客户要货单详情",
    sub: "适合演示内部客户要货后进入待履约阶段的完整业务信息。",
    primaryAction: "生成配送通知",
    summary: [
      ["单据状态", "待履约", "已锁定库存与履约基础数据"],
      ["客户类型", "内部客户", "需回传资源资产系统"],
      ["来源渠道", "小程序", "移动端发起"],
      ["最近更新", "2026-05-26 10:18", "待生成配送通知单"]
    ],
    baseInfo: [
      ["要货单号", "YH20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓", "华东1仓"],
      ["期望发货时间", "2026-05-27 09:00"],
      ["收货信息", "上海浦东XX路18号 / 张三 / 13800000000"]
    ],
    goodsHeaders: ["商品", "商品编码", "条形码", "规格", "单位", "申请数量", "可用库存", "锁定状态", "备注"],
    goodsRows: [
      ["物料-商品001", "MAT-001", "6901000000012", "12瓶/箱", "箱", "80", "260", "已锁定", "常规补货"],
      ["物料-商品002", "MAT-002", "6901000000029", "24袋/箱", "箱", "60", "180", "已锁定", "门店促销"],
      ["物料-商品003", "MAT-003", "6901000000036", "6盒/箱", "箱", "45", "120", "已锁定", "安全库存补充"],
      ["物料-商品004", "MAT-004", "6901000000043", "10支/盒", "盒", "35", "92", "已锁定", "新品备货"],
      ["物料-商品005", "MAT-005", "6901000000050", "20个/箱", "箱", "40", "105", "已锁定", "项目需求"]
    ],
    timeline: [
      ["09:28", "小程序", "提交客户要货申请", "成功"],
      ["09:31", "系统", "匹配货主和发货仓", "成功"],
      ["09:33", "库存服务", "锁定履约库存", "成功"],
      ["当前", "履约专员", "待生成配送通知", "进行中"]
    ],
    links: [
      ["上游", "客户要货申请", "成功", "申请已完成审核并进入履约"],
      ["下游", "配送通知单", "待生成", "查看后可继续生成配送通知"],
      ["下游", "资源资产系统", "待触发", "发货后同步内部客户履约结果"],
      ["下游", "BMS", "待触发", "发货后传递财务基础单据"]
    ]
  },
  YH20260526002: {
    title: "客户要货单详情",
    sub: "适合演示外部客户待审核场景下的校验信息与审批关注点。",
    primaryAction: "进入审核处理",
    summary: [
      ["单据状态", "待审核", "待审批人确认"],
      ["客户类型", "外部客户", "不回传资源资产系统"],
      ["来源渠道", "接口导入", "OMS 同步"],
      ["最近更新", "2026-05-26 09:35", "等待审批中心处理"]
    ],
    baseInfo: [
      ["要货单号", "YH20260526002"],
      ["客户", "外部客户-门店联盟"],
      ["货主", "外部货主B"],
      ["发货仓", "华南2仓"],
      ["期望发货时间", "2026-05-27 14:00"],
      ["收货信息", "广州天河XX大道88号 / 陈华 / 13900001111"]
    ],
    goodsHeaders: ["商品", "商品编码", "条形码", "规格", "单位", "申请数量", "可用库存", "合同校验", "备注"],
    goodsRows: [
      ["物料-商品008", "MAT-008", "6901000000081", "12瓶/箱", "箱", "60", "180", "通过", "常规补货"],
      ["物料-商品009", "MAT-009", "6901000000098", "24罐/箱", "箱", "40", "96", "通过", "门店补货"],
      ["物料-商品010", "MAT-010", "6901000000104", "6盒/箱", "箱", "25", "52", "通过", "活动补货"]
    ],
    timeline: [
      ["09:28", "OMS接口", "导入客户要货单", "成功"],
      ["09:30", "系统", "校验合同和关系表", "成功"],
      ["09:35", "审批中心", "分配审批人张经理", "成功"],
      ["当前", "张经理", "待审批", "进行中"]
    ],
    links: [
      ["上游", "OMS", "导入要货单", "成功", "接口同步完成"],
      ["支撑", "审批中心", "审核任务", "处理中", "待审批人处理"],
      ["下游", "配送管理", "待创建", "审批通过后进入履约"],
      ["下游", "BMS", "待触发", "发货后回传财务单据"]
    ]
  },
  YH20260526003: {
    title: "客户要货单详情",
    sub: "适合演示部分签收场景下的履约进度、物流轨迹与后续处理动作。",
    primaryAction: "查看履约轨迹",
    summary: [
      ["单据状态", "部分签收", "仍有 2 项待门店确认"],
      ["客户类型", "内部客户", "需回传资源资产系统"],
      ["来源渠道", "PC端", "运营手工创建"],
      ["最近更新", "2026-05-26 11:20", "TMS 回传部分签收"]
    ],
    baseInfo: [
      ["要货单号", "YH20260526003"],
      ["客户", "内部客户-区域共享仓"],
      ["货主", "自有货主C"],
      ["发货仓", "华北3仓"],
      ["期望发货时间", "2026-05-26 15:00"],
      ["收货信息", "北京朝阳XX中心 / 王雪 / 13700002222"]
    ],
    goodsHeaders: ["商品", "商品编码", "条形码", "规格", "单位", "申请数量", "已签收", "待签收", "备注"],
    goodsRows: [
      ["物料-商品021", "MAT-021", "6901000000210", "10盒/箱", "箱", "120", "120", "0", "已签收完成"],
      ["物料-商品022", "MAT-022", "6901000000227", "8袋/箱", "箱", "90", "50", "40", "门店待复核"],
      ["物料-商品023", "MAT-023", "6901000000234", "24瓶/箱", "箱", "110", "80", "30", "运输延迟"],
      ["物料-商品024", "MAT-024", "6901000000241", "15个/箱", "箱", "100", "100", "0", "已签收完成"]
    ],
    timeline: [
      ["08:40", "PC端", "创建客户要货单", "成功"],
      ["09:10", "系统", "生成配送通知单", "成功"],
      ["10:35", "WMS", "完成拣货与出库", "成功"],
      ["11:20", "TMS", "回传部分签收", "成功"]
    ],
    links: [
      ["上游", "客户要货单", "成功", "已转配送单执行"],
      ["下游", "WMS", "出库执行", "成功", "已出库完成"],
      ["下游", "TMS", "物流签收", "处理中", "仍有2项待签收"],
      ["下游", "资源资产系统", "结果回传", "待更新", "全部签收后同步"]
    ]
  }
};

const demandDeliveryConfigs = {
  YH20260526001: {
    title: "生成配送通知单",
    sub: "用于演示客户要货单在校验通过后生成配送通知单的业务确认过程。",
    fields: [
      ["来源要货单", "YH20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主/仓库", "自有货主A / 华东1仓"],
      ["是否需要运输服务", "是"],
      ["运输单号", "YD9087612"],
      ["预计结果", "生成配送通知单 DZT20260526001"],
      ["下发系统", "WMS / TMS"],
      ["后续联动", "发货后同步 BMS，并向资源资产系统回传内部客户履约结果"]
    ],
    note: "当前原型会模拟完成生成配送通知单、下发WMS/TMS并进入配送管理页面的前置动作。",
    primary: "确认生成"
  }
};

const modalConfigs = {
  view: {
    title: "查看详情",
    sub: "用于演示点击“查看”类按钮后打开详情弹窗的效果，后续可继续细化为抽屉式详情页。",
    fields: [
      ["适用动作", "查看 / 查看详情 / 查看历史"],
      ["展示范围", "单头、明细、状态、轨迹"],
      ["交互方式", "弹窗或右侧抽屉"],
      ["后续演进", "可继续补字段和审批记录"]
    ],
    note: "当前原型先采用通用弹窗承接点击效果，重点让汇报时能看到“点击后有反馈”。",
    primary: "进入详情"
  },
  approve: {
    title: "审核处理",
    sub: "用于演示点击“审核”“通过”“驳回”“转交”等按钮后的确认效果。",
    fields: [
      ["适用动作", "审核 / 通过 / 驳回 / 转交"],
      ["校验项", "合同、库存、关系表、权限"],
      ["处理结果", "回写业务状态并进入下一节点"],
      ["留痕要求", "审批意见与处理人均需保留"]
    ],
    note: "后续可增加审批意见输入框、流程轨迹和驳回原因录入。",
    primary: "确认处理"
  },
  export: {
    title: "导出确认",
    sub: "用于演示点击“导出”后确认导出范围和方式的效果。",
    fields: [
      ["导出对象", "当前列表 / 当前筛选结果"],
      ["导出格式", "Excel / CSV / PDF"],
      ["字段范围", "默认字段 / 全字段"],
      ["生成方式", "即时下载 / 后台生成"]
    ],
    note: "后续可继续补字段勾选、模板选择和导出记录。",
    primary: "开始导出"
  },
  retry: {
    title: "异常重试",
    sub: "用于演示点击“重试”“刷新接收”“重试异常接口”等按钮后的确认效果。",
    fields: [
      ["重试对象", "接口调用 / 财务传单 / 结果回传"],
      ["失败原因", "示例：签名校验失败 / 回执超时"],
      ["当前次数", "第 1 次人工重试"],
      ["处理提醒", "发送前请确认幂等规则"]
    ],
    note: "后续可继续补失败报文查看、重试历史和补偿任务入口。",
    primary: "立即重试"
  },
  push: {
    title: "批量重推",
    sub: "用于演示批量重推财务单或结果回传任务的效果。",
    fields: [
      ["重推范围", "当前筛选结果"],
      ["目标系统", "BMS / 资源资产系统"],
      ["数据量", "示例：3 条待处理任务"],
      ["执行方式", "后台异步处理"]
    ],
    note: "后续可增加批次号、任务进度和完成结果统计。",
    primary: "确认重推"
  },
  log: {
    title: "失败日志查看",
    sub: "用于演示点击“查看失败日志”“查看日志”等按钮后的查看窗口。",
    fields: [
      ["接口名称", "当前失败接口"],
      ["失败时间", "最近一次调用时间"],
      ["失败类型", "超时 / 校验失败 / 映射异常"],
      ["处理状态", "待处理 / 已重试 / 已关闭"]
    ],
    note: "后续可补报文摘要、时间线和人工处理记录。",
    primary: "查看完整日志"
  },
  permission: {
    title: "权限说明",
    sub: "用于演示点击“查看权限”后弹出的权限说明窗口。",
    fields: [
      ["可见范围", "按组织、角色、货主、仓库控制"],
      ["可操作动作", "查看 / 审核 / 导出 / 重试"],
      ["限制规则", "高风险动作需特定角色"],
      ["审计要求", "关键操作保留日志"]
    ],
    note: "后续可继续关联菜单权限矩阵和字段级权限方案。",
    primary: "我已知晓"
  },
  refresh: {
    title: "刷新状态",
    sub: "用于演示点击“刷新状态”“刷新联动状态”等按钮后的确认效果。",
    fields: [
      ["刷新对象", "当前页面业务状态"],
      ["数据来源", "WMS / TMS / BMS / 资源资产系统"],
      ["刷新方式", "即时获取最新状态"],
      ["影响范围", "仅更新当前页面展示"]
    ],
    note: "后续可扩展轮询刷新和结果提示反馈。",
    primary: "立即刷新"
  }
};

const pcTabConfigs = {
  demand: {
    detailFields: [
      ["要货单号", "YH20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓", "华东1仓"],
      ["来源", "小程序"],
      ["履约状态", "待履约"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "申请数量", "可用库存", "锁定状态", "备注"],
    detailRows: [
      ["MAT-001", "6901000000012", "物料-商品001", "12瓶/箱", "箱", "80", "260", "已锁定", "常规补货"],
      ["MAT-002", "6901000000029", "物料-商品002", "24袋/箱", "箱", "60", "180", "已锁定", "门店促销"],
      ["MAT-003", "6901000000036", "物料-商品003", "6盒/箱", "箱", "45", "120", "已锁定", "安全库存补充"]
    ],
    listFilters: ["要货单号", "客户", "货主", "发货仓", "履约状态", "来源", "商品编码", "条形码", "日期范围"],
    listHeaders: ["要货单号", "客户", "货主", "发货仓", "履约状态", "来源", "商品编码", "条形码", "商品名称", "规格", "单位", "申请数量", "可用库存", "锁定状态", "备注"],
    listRows: [
      ["YH20260526001", "内部客户-华东分部", "自有货主A", "华东1仓", "待履约", "小程序", "MAT-001", "6901000000012", "物料-商品001", "12瓶/箱", "箱", "80", "260", "已锁定", "常规补货"],
      ["YH20260526001", "内部客户-华东分部", "自有货主A", "华东1仓", "待履约", "小程序", "MAT-002", "6901000000029", "物料-商品002", "24袋/箱", "箱", "60", "180", "已锁定", "门店促销"],
      ["YH20260526002", "外部客户-门店联盟", "外部货主B", "华南2仓", "待审核", "接口导入", "MAT-008", "6901000000081", "物料-商品008", "12瓶/箱", "箱", "60", "180", "待审批", "常规补货"],
      ["YH20260526003", "内部客户-区域共享仓", "自有货主C", "华北3仓", "部分签收", "PC端", "MAT-021", "6901000000210", "物料-商品021", "10盒/箱", "箱", "120", "120", "已签收", "履约中"]
    ],
    actions: [
      ["步骤 1", "接收手工创建或接口导入的客户要货单"],
      ["步骤 2", "校验客户、货主、发货仓和商品库存"],
      ["步骤 3", "按商品粒度形成待履约明细数据"],
      ["步骤 4", "生成配送通知并进入履约执行"]
    ],
    actionLogs: [
      ["09:28", "小程序", "提交客户要货申请", "成功"],
      ["09:31", "系统", "校验客户与货主关系", "成功"],
      ["09:33", "库存服务", "锁定库存", "成功"],
      ["当前", "履约专员", "待生成配送通知", "进行中"]
    ],
    integrationRows: [
      ["上游", "客户申请", "客户要货单发起", "成功", "支持手工和接口导入"],
      ["下游", "配送管理", "生成配送通知", "待触发", "审核或履约后生成"],
      ["支撑", "库存服务", "锁定可用库存", "成功", "已完成库存校验"]
    ]
  },
  newproduct: {
    detailFields: [
      ["单号", "XP20260526003"],
      ["货主", "外部货主B"],
      ["商品分类", "防护用品"],
      ["温层", "常温"],
      ["包装数量", "50"],
      ["重量(kg)", "16.8"],
      ["体积(m3)", "0.0553"],
      ["录入状态", "已提交"],
      ["审批状态", "已审核通过"],
      ["写入商品信息", "已写入"],
      ["附件资料", "已上传 2 份"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "商品分类", "品牌", "型号", "温层", "保质期天数", "长(cm)", "宽(cm)", "高(cm)", "体积(m3)", "重量(kg)", "包装数量", "是否批次管理", "是否效期管理", "税率", "未税进价", "含税进价", "附件资料", "结果"],
    detailRows: [
      ["MAT-NEW-001", "6923000000018", "新品-消杀喷雾", "24瓶/箱", "箱", "清洁消杀", "安洁", "AJ-XP-24", "常温", "365", "42", "30", "28", "0.0353", "12.5", "24", "是", "是", "13%", "38.94", "44.00", "检测报告/图片", "已写入商品信息"],
      ["MAT-NEW-002", "6923000000025", "新品-医用手套", "50盒/箱", "箱", "防护用品", "护安", "HA-GLOVE-50", "常温", "730", "48", "36", "32", "0.0553", "16.8", "50", "是", "是", "13%", "61.95", "70.00", "资质证照/图片", "已写入商品信息"]
    ],
    actions: [
      ["步骤 1", "外部货主手工录入或通过 Excel 导入新品录入单"],
      ["步骤 2", "平台校验商品名称、条码、规格、型号、温层和批次效期属性"],
      ["步骤 3", "审批通过后自动写入商品信息主数据"],
      ["步骤 4", "商品信息生效后供后续业务单据直接引用"]
    ],
    actionLogs: [
      ["09:06", "外部货主B", "Excel导入新品录入单", "成功"],
      ["09:10", "外部货主B", "上传商品图片与检测报告", "成功"],
      ["09:12", "主数据服务", "校验条码、分类与批次效期属性", "成功"],
      ["09:18", "审批人", "审核通过新品录入单", "成功"],
      ["09:20", "商品主数据", "写入商品信息", "成功"]
    ],
    integrationRows: [
      ["上游", "外部货主/Excel", "新品录入单提交", "成功", "支持手工和导入两种方式"],
      ["下游", "审批中心", "新品录入审批", "成功", "通过后自动写入商品信息"],
      ["下游", "商品信息", "商品主数据写入", "成功", "已生成正式商品编码"]
    ],
    extraTabs: [
      {
        key: "approval",
        label: "审批记录",
        title: "新品录入审批记录",
        desc: "用于展示新品录入单从提交、待审批、审批通过或审批驳回到再次提交的审批轨迹，便于业务演示提交人、审批人、审批意见、驳回原因和下一处理人。",
        headers: ["审批时间", "单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"],
        render: renderNewProductApprovalTab
      },
      {
        key: "create",
        label: "录入",
        title: "新品录入",
        render: renderNewProductCreateTab
      },
      {
        key: "edit",
        label: "修改",
        title: "新品修改",
        render: renderNewProductEditTab
      },
      {
        key: "attachments",
        label: "附件记录",
        title: "附件上传记录表",
        desc: "用于展示新品录入单上传的图片、检测报告、资质证照和模板导入附件，便于审批和主数据复核。",
        headers: ["附件类型", "文件名称", "上传方式", "上传人", "上传时间", "校验状态", "用途"],
        rows: [
          ["商品图片", "新品-消杀喷雾-主图.jpg", "手工上传", "外部货主B", "2026-05-26 09:08", "通过", "商品主图展示"],
          ["检测报告", "消杀喷雾-检测报告.pdf", "Excel导入附带", "外部货主B", "2026-05-26 09:09", "通过", "审批校验"],
          ["资质证照", "医用手套-备案证.pdf", "手工上传", "外部货主B", "2026-05-26 09:10", "通过", "商品准入校验"],
          ["导入模板", "新品录入模板-20260526.xlsx", "Excel导入", "外部货主B", "2026-05-26 09:06", "通过", "批量导入留痕"]
        ]
      },
      {
        key: "validation",
        label: "校验结果",
        title: "商品分类映射与校验结果",
        desc: "用于展示新品录入单在写入商品信息前的分类映射、条码校验、批次效期属性校验和附件完整性校验结果。",
        headers: ["校验项", "3PL值", "映射结果", "校验状态", "说明"],
        rows: [
          ["商品分类", "防护用品", "PPE-防护用品", "通过", "已映射到主数据标准分类"],
          ["品牌", "护安", "护安", "通过", "品牌主数据已存在"],
          ["条形码唯一性", "6923000000025", "唯一", "通过", "未发现重复条码"],
          ["批次/效期属性", "批次管理=是, 效期管理=是", "已继承", "通过", "满足仓储批次管理要求"],
          ["附件完整性", "资质证照/图片", "完整", "通过", "审批所需附件齐全"]
        ]
      }
    ]
  },
  newproductcreate: {
    detailFields: [
      ["单号", "XP20260526007"],
      ["来源方式", "手工录入"],
      ["货主", "外部货主B"],
      ["商品分类", "防护用品"],
      ["温层", "常温"],
      ["包装数量", "50"],
      ["重量(kg)", "16.8"],
      ["体积(m3)", "0.0553"],
      ["录入状态", "草稿"],
      ["审批状态", "待提交"],
      ["附件资料", "待补充"]
    ],
    detailHeaders: ["字段", "当前录入值", "说明"],
    detailRows: [
      ["货主", "外部货主B", "录入页支持外部货主选择"],
      ["商品分类", "防护用品", "需命中标准主数据分类"],
      ["温层", "常温", "决定仓储和运输属性"],
      ["包装数量", "50", "用于包装和库存计量换算"],
      ["重量(kg)", "16.8", "用于仓储和运输重量口径"],
      ["体积(m3)", "0.0553", "用于体积计费和仓容测算"],
      ["附件资料", "待补传 2 份", "图片、检测报告、资质证照"]
    ],
    actions: [
      ["步骤 1", "录入货主、分类、品牌、型号和温层等基础字段"],
      ["步骤 2", "维护新品商品明细并补齐价格税率属性"],
      ["步骤 3", "上传商品图片、检测报告和资质证照等附件"],
      ["步骤 4", "保存草稿或提交审批进入新品录入单流程"]
    ],
    actionLogs: [
      ["10:02", "外部货主B", "打开新品录入页", "成功"],
      ["10:05", "外部货主B", "填写基础字段", "成功"],
      ["10:08", "外部货主B", "维护商品明细", "成功"],
      ["当前", "外部货主B", "待提交审批", "处理中"]
    ],
    integrationRows: [
      ["上游", "外部货主", "手工录入新品资料", "成功", "当前页面用于录入入口"],
      ["下游", "新品录入单", "保存为正式申请单", "待触发", "提交后生成录入单"],
      ["支撑", "附件服务", "上传图片与资质证照", "成功", "用于审批与主数据校验"]
    ]
  },
  newproductedit: {
    detailFields: [
      ["单号", "XP20260526005"],
      ["来源方式", "Excel导入后编辑"],
      ["货主", "外部货主C"],
      ["商品分类", "包材辅料"],
      ["包装数量", "12"],
      ["重量(kg)", "18.6"],
      ["体积(m3)", "0.0840"],
      ["编辑状态", "编辑中"],
      ["审批状态", "已驳回待修改"],
      ["重校验", "待执行"],
      ["附件资料", "已补传"]
    ],
    detailHeaders: ["字段", "修改前", "修改后", "说明"],
    detailRows: [
      ["商品分类", "未映射", "包材辅料", "已补齐标准业务分类"],
      ["品牌", "-", "包易达", "已补录品牌信息"],
      ["型号", "-", "BYD-BOX-12", "已补录型号属性"],
      ["包装数量", "-", "12", "已补录装箱数量"],
      ["重量(kg)", "-", "18.6", "已补录重量信息"],
      ["体积(m3)", "-", "0.0840", "已补录体积信息"],
      ["附件资料", "缺少合格证", "合格证/图片", "已补传附件"]
    ],
    actions: [
      ["步骤 1", "查看驳回原因并定位缺失字段"],
      ["步骤 2", "修改分类、品牌、型号和附件等关键属性"],
      ["步骤 3", "刷新条码、分类和附件完整性校验结果"],
      ["步骤 4", "保存修改并重新提交审批"]
    ],
    actionLogs: [
      ["10:20", "审批人", "驳回新品录入单", "成功"],
      ["10:28", "外部货主C", "打开新品编辑页", "成功"],
      ["10:31", "外部货主C", "补录品牌与型号", "成功"],
      ["当前", "外部货主C", "待重新提交审批", "处理中"]
    ],
    integrationRows: [
      ["上游", "新品录入单", "驳回后进入编辑页", "成功", "用于二次修改"],
      ["支撑", "校验服务", "重新执行分类与附件校验", "待触发", "提交前再次校验"],
      ["下游", "审批中心", "重新提交审批", "待触发", "通过后继续写入商品信息"]
    ]
  },
  inbound: {
    detailFields: [
      ["申请单号", "RK20260526003"],
      ["货主", "外部货主C"],
      ["申请仓库", "华东1仓"],
      ["申请状态", "已审核通过"],
      ["生成通知", "已生成入库通知单"],
      ["财务协同", "待回传BMS"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "申请数量", "进项税率", "未税进价", "含税进价", "未税进价金额", "含税进价金额", "税额"],
    detailRows: [
      ["MAT-RK-001", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "60", "13%", "42.48", "48.00", "2548.80", "2880.00", "331.20"],
      ["MAT-RK-002", "6903000000020", "低值易耗品-防护手套", "24包/箱", "箱", "40", "13%", "26.55", "30.00", "1062.00", "1200.00", "138.00"],
      ["MAT-RK-003", "6903000000037", "低值易耗品-标签纸", "10卷/箱", "箱", "50", "13%", "17.70", "20.00", "885.00", "1000.00", "115.00"],
      ["MAT-RK-004", "6903000000044", "低值易耗品-工具包", "6套/箱", "箱", "30", "13%", "88.50", "100.00", "2655.00", "3000.00", "345.00"]
    ],
    listFilters: ["申请单号", "货主", "申请仓库", "申请状态", "生成通知", "财务协同", "商品编码", "条形码", "日期范围"],
    listHeaders: ["操作", "勾选", "申请单号", "货主", "申请仓库", "申请状态", "生成通知", "财务协同", "商品编码", "条形码", "商品名称", "规格", "单位", "申请数量", "进项税率", "未税进价", "含税进价", "未税进价金额", "含税进价金额", "税额"],
    listRows: [
      [buildInboundActionCell("草稿", "RK20260526001"), buildInboundSelectCell("草稿", "RK20260526001", "外部货主B"), "RK20260526001", "外部货主B", "华南2仓", buildInboundStatusTag("草稿"), "未生成", "待回传BMS", "MAT-RK-001", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "60", "13%", "42.48", "48.00", "2548.80", "2880.00", "331.20"],
      [buildInboundActionCell("草稿", "RK20260526001"), buildInboundSelectCell("草稿", "RK20260526001", "外部货主B"), "RK20260526001", "外部货主B", "华南2仓", buildInboundStatusTag("草稿"), "未生成", "待回传BMS", "MAT-RK-002", "6903000000020", "低值易耗品-防护手套", "24包/箱", "箱", "40", "13%", "26.55", "30.00", "1062.00", "1200.00", "138.00"],
      [buildInboundActionCell("已审核通过", "RK20260526003"), buildInboundSelectCell("已审核通过", "RK20260526003", "外部货主C"), "RK20260526003", "外部货主C", "华东1仓", buildInboundStatusTag("已审核通过"), "已生成入库通知单", "待回传BMS", "MAT-RK-003", "6903000000037", "低值易耗品-标签纸", "10卷/箱", "箱", "50", "13%", "17.70", "20.00", "885.00", "1000.00", "115.00"],
      [buildInboundActionCell("已入库", "RK20260526005"), buildInboundSelectCell("已入库", "RK20260526005", "外部货主A"), "RK20260526005", "外部货主A", "华北3仓", buildInboundStatusTag("已入库"), "已下发WMS", "已回传BMS", "MAT-RK-004", "6903000000044", "低值易耗品-工具包", "6套/箱", "箱", "30", "13%", "88.50", "100.00", "2655.00", "3000.00", "345.00"]
    ],
    actions: [
      ["步骤 1", "外部货主提交入库申请并录入申请商品明细"],
      ["步骤 2", "平台审核申请单并校验价格税率等申请字段"],
      ["步骤 3", "审核通过后下发 WMS 执行入库作业"],
      ["步骤 4", "入库完成后传递 BMS 并进入后续财务协同"]
    ],
    actionLogs: [
      ["09:20", "外部货主", "提交入库申请", "成功"],
      ["09:28", "仓储运营", "审核申请单", "成功"],
      ["09:31", "系统", "下发 WMS 入库任务", "成功"],
      ["当前", "财务协同", "待回传 BMS", "处理中"]
    ],
    integrationRows: [
      ["上游", "外部货主", "入库申请发起", "成功", "已提交完整申请明细"],
      ["下游", "入库通知单", "审核通过自动生成", "成功", "生成后再下发 WMS"],
      ["下游", "BMS", "财务传单", "待触发", "入库完成后传递"]
    ]
  },
  inboundnotice: {
    detailFields: [
      ["通知单号", "RKTZ20260526003"],
      ["来源申请单", "RK20260526003"],
      ["货主", "外部货主C"],
      ["通知仓库", "华东1仓"],
      ["生成方式", "审核通过自动生成"],
      ["WMS下发", "已下发待执行"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "通知数量", "进项税率", "未税进价", "含税进价", "未税进价金额", "含税进价金额", "税额"],
    detailRows: [
      ["MAT-RK-001", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "60", "13%", "42.48", "48.00", "2548.80", "2880.00", "331.20"],
      ["MAT-RK-002", "6903000000020", "低值易耗品-防护手套", "24包/箱", "箱", "40", "13%", "26.55", "30.00", "1062.00", "1200.00", "138.00"],
      ["MAT-RK-003", "6903000000037", "低值易耗品-标签纸", "10卷/箱", "箱", "50", "13%", "17.70", "20.00", "885.00", "1000.00", "115.00"],
      ["MAT-RK-004", "6903000000044", "低值易耗品-工具包", "6套/箱", "箱", "30", "13%", "88.50", "100.00", "2655.00", "3000.00", "345.00"]
    ],
    actions: [
      ["步骤 1", "入库申请单审核通过后自动生成入库通知单"],
      ["步骤 2", "按审核通过的商品明细形成通知数量和价格税率口径"],
      ["步骤 3", "平台将入库通知单下发给 WMS 执行入库作业"],
      ["步骤 4", "待 WMS 回传入库结果后进入入库单环节"]
    ],
    actionLogs: [
      ["09:28", "仓储运营", "审核入库申请单", "成功"],
      ["09:29", "系统", "自动生成入库通知单", "成功"],
      ["09:30", "接口服务", "下发 WMS 通知", "成功"],
      ["当前", "WMS", "待回传入库执行结果", "处理中"]
    ],
    integrationRows: [
      ["上游", "入库申请单", "审核通过回写", "成功", "触发自动生成通知单"],
      ["下游", "WMS", "入库通知下发", "成功", "已生成执行任务"],
      ["下游", "入库单", "等待结果回传", "待触发", "WMS 回传后接收"]
    ]
  },
  purchasein: {
    detailFields: [
      ["单据号", "CGRK20260526001"],
      ["申请单号", "CGRK-SQ-20260526001"],
      ["通知单号", "CGTH-TZ-20260526001"],
      ["来源系统", "WMS"],
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["库存地点", "1000"],
      ["库存状态", "已完成"],
      ["BMS状态", "待回执"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "接收数量", "上架数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额", "结果"],
    detailRows: [
      ["MAT-RK-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "1000", "BATCH20260526A", "2026-05-26", "2027-05-26", "120", "120", "13%", "42.48", "48.00", "5097.60", "5760.00", "662.40", "已入库"],
      ["MAT-RK-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "1000", "BATCH20260526B", "2026-05-26", "2027-05-26", "100", "100", "13%", "26.55", "30.00", "2655.00", "3000.00", "345.00", "已入库"]
    ],
    actions: [
      ["步骤 1", "接收 WMS 入库单报文并进行幂等校验"],
      ["步骤 2", "生成入库单记录并更新 3PL 库存"],
      ["步骤 3", "回传资源资产系统入库结果"],
      ["步骤 4", "组装财务单据并发送 BMS"]
    ],
    actionLogs: [
      ["10:12:23", "接口服务", "接收入库报文", "成功"],
      ["10:12:25", "库存服务", "同步库存", "成功"],
      ["10:12:31", "资源资产接口", "发送入库结果", "成功"],
      ["10:12:42", "BMS接口", "传财务单", "待回执"]
    ],
    integrationRows: [
      ["上游", "WMS", "入库单接口", "成功", "已接收入库单"],
      ["下游", "资源资产系统", "入库结果回传", "成功", "写入低值易耗品采购入库"],
      ["下游", "BMS", "入库单传单", "待回执", "财务处理中"]
    ]
  },
  returnapply: {
    detailFields: [
      ["申请单号", "THSQ20260526003"],
      ["来源方式", "资源资产系统传入"],
      ["货主", "外部货主B"],
      ["申请仓库", "华南2仓"],
      ["申请状态", "已审核通过"],
      ["生成通知", "已生成退货通知单"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "申请数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-TH-001", "6905000000011", "低值易耗品-清洁剂", "12瓶/箱", "箱", "BATCH20260508A", "2026-05-08", "2027-05-08", "45", "13%", "42.48", "48.00", "1911.60", "2160.00", "248.40"],
      ["MAT-TH-002", "6905000000028", "低值易耗品-防护手套", "24袋/箱", "箱", "BATCH20260510B", "2026-05-10", "2027-05-10", "35", "13%", "26.55", "30.00", "929.25", "1050.00", "120.75"]
    ],
    actions: [
      ["步骤 1", "手工创建或接收资源资产系统传入的退货申请单"],
      ["步骤 2", "审核退货申请并校验货主、仓库和商品批次信息"],
      ["步骤 3", "审核通过后自动生成退货通知单"],
      ["步骤 4", "待 WMS 执行后进入退货单环节"]
    ],
    actionLogs: [
      ["09:12", "资源资产系统", "传入退货申请单", "成功"],
      ["09:18", "客户运营", "补充申请说明", "成功"],
      ["09:26", "审批人", "审核通过申请单", "成功"],
      ["当前", "系统", "待生成退货通知单", "处理中"]
    ],
    integrationRows: [
      ["上游", "资源资产系统", "退货申请单传入", "成功", "支持接口直接导入"],
      ["上游", "PC端", "手工创建申请单", "成功", "支持人工补录"],
      ["下游", "退货通知单", "审核通过自动生成", "待触发", "生成后再下发 WMS"]
    ],
    listFilters: ["申请单号", "来源方式", "货主", "申请仓库", "申请状态", "生成通知", "商品编码", "条形码", "日期范围"],
    listHeaders: ["操作", "勾选", "申请单号", "来源方式", "货主", "申请仓库", "提交人", "审批人", "时间", "申请状态", "生成通知", "审批意见", "驳回原因", "商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "申请数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    listRows: [],
    extraTabs: [
      {
        key: "approval",
        label: "审批记录",
        title: "退货申请审批记录",
        desc: "用于展示退货申请单从草稿、提交审批、审批通过或驳回到再次提交的审批轨迹。",
        headers: ["审批时间", "申请单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"],
        render: renderReturnApplyApprovalTab
      }
    ]
  },
  returnapplyin: {
    detailFields: [
      ["申请单号", "TKSQ20260526003"],
      ["来源方式", "资源资产系统传入"],
      ["客户", "外部客户-门店联盟"],
      ["原货主", "外部货主B"],
      ["退回仓", "华南2仓"],
      ["申请状态", "待审批"],
      ["生成通知", "待审批通过后生成"]
    ],
    listFilters: ["申请单号", "来源方式", "客户", "原货主", "退回仓", "申请状态", "生成通知", "商品编码", "条形码", "日期范围"],
    listHeaders: ["操作", "勾选", "申请单号", "来源方式", "客户", "原货主", "退回仓", "提交人", "审批人", "时间", "申请状态", "生成通知", "审批意见", "驳回原因", "商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "原配送数量", "可退数量", "申请数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    listRows: [],
    actions: [
      ["步骤 1", "手工创建或接收资源资产系统传入的退仓申请单"],
      ["步骤 2", "校验原配送单、客户、原货主、退回仓和可退数量"],
      ["步骤 3", "申请单提交审批并支持审批通过或驳回"],
      ["步骤 4", "审批通过后自动生成退仓通知单并下发WMS"]
    ],
    actionLogs: [
      ["09:42", "资源资产系统", "传入退仓申请单", "成功"],
      ["09:48", "客户运营", "补充退仓说明", "成功"],
      ["09:55", "审批人", "待审批", "处理中"],
      ["当前", "系统", "待审批通过后生成退仓通知单", "待触发"]
    ],
    integrationRows: [
      ["上游", "资源资产系统", "退仓申请单传入", "成功", "支持资源资产直接推送"],
      ["上游", "PC端", "手工创建申请单", "成功", "支持人工补录和修改"],
      ["下游", "退仓通知单", "审批通过自动生成", "待触发", "生成后再下发WMS"]
    ],
    extraTabs: [
      {
        key: "approval",
        label: "审批记录",
        title: "退仓申请审批记录",
        desc: "用于展示退仓申请单从草稿、提交审批、审批通过或驳回到再次提交的审批轨迹。",
        headers: ["审批时间", "申请单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"],
        render: renderReturnApplyInApprovalTab
      }
    ]
  },
  ownershipapply: {
    detailFields: [
      ["申请单号", "WQSQ20260526003"],
      ["原货主", "外部货主C"],
      ["目标货主", "自有货主C"],
      ["仓库", "华北3仓"],
      ["申请状态", "待审批"],
      ["生成通知", "待审批通过后生成"]
    ],
    listFilters: ["申请单号", "原货主", "目标货主", "仓库", "申请状态", "生成通知", "商品编码", "条形码", "日期范围"],
    listHeaders: ["操作", "勾选", "申请单号", "原货主", "目标货主", "仓库", "提交人", "审批人", "时间", "申请状态", "生成通知", "审批意见", "驳回原因", "商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "可转数量", "申请数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    listRows: [],
    actions: [
      ["步骤 1", "手工创建物权转移申请单并维护原货主到目标货主的转移商品明细"],
      ["步骤 2", "平台校验目标货主、库存可转数量和合同规则"],
      ["步骤 3", "申请单提交审批并支持审批通过或驳回"],
      ["步骤 4", "审批通过后自动生成物权转移通知单并下发WMS"]
    ],
    actionLogs: [
      ["09:36", "货主管理", "创建物权转移申请单", "成功"],
      ["09:40", "系统", "校验合同与库存", "成功"],
      ["09:46", "审批中心", "提交审批", "处理中"],
      ["当前", "系统", "待审批通过后生成物权转移通知单", "待触发"]
    ],
    integrationRows: [
      ["上游", "PC端", "物权转移申请发起", "成功", "已登记转移商品明细"],
      ["下游", "物权转移通知单", "审批通过自动生成", "待触发", "生成后再下发WMS"],
      ["下游", "BMS", "物权转移财务传单", "待触发", "结果完成后传递"]
    ],
    extraTabs: [
      {
        key: "approval",
        label: "审批记录",
        title: "物权转移申请审批记录",
        desc: "用于展示物权转移申请单从草稿、提交审批、审批通过或驳回到再次提交的审批轨迹。",
        headers: ["审批时间", "申请单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"],
        render: renderOwnershipApplyApprovalTab
      }
    ]
  },
  inoutrecord: {
    detailFields: [
      ["记录号", "IOR202605280014"],
      ["业务单据", "PS20260528009"],
      ["单据类型", "配送单"],
      ["动作方向", "出库"],
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["记录状态", "已完成"],
      ["资源资产", "已发送"],
      ["BMS", "已回执"],
      ["记录时间", "2026-05-28 10:06:18"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "数量", "库存影响", "操作人", "来源系统", "备注"],
    detailRows: [
      ["MAT-PS-021", "6901000000210", "物料-商品021", "10盒/箱", "箱", "BATCH20260508A", "2026-05-08", "2027-05-08", "120", "库存 -120", "WMS", "WMS/TMS", "已完成出库并回传签收"],
      ["MAT-PS-022", "6901000000227", "物料-商品022", "24袋/箱", "箱", "BATCH20260510B", "2026-05-10", "2027-05-10", "36", "库存 -36", "WMS", "WMS/TMS", "门店补货配送"]
    ],
    listFilters: ["记录号", "业务单据", "动作方向", "单据类型", "货主", "仓库", "商品编码", "条形码", "资源资产状态", "BMS状态", "日期范围"],
    listHeaders: ["记录号", "业务单据", "动作方向", "单据类型", "货主", "仓库", "商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "数量", "库存影响", "来源系统", "资源资产状态", "BMS状态", "记录时间", "备注"],
    listRows: [
      ["IOR202605280001", "RK20260528003", "入库", "入库单", "外部货主B", "华南2仓", "MAT-RK-001", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "BATCH20260526A", "2026-05-26", "2027-05-26", "60", "库存 +60", "WMS", "待回执", "待回执", "2026-05-28 09:18:22", "外部货主预约入库"],
      ["IOR202605280006", "RK20260528005", "入库", "入库单", "外部货主A", "华东1仓", "MAT-RK-004", "6903000000044", "低值易耗品-工具包", "6套/箱", "箱", "BATCH20260526B", "2026-05-26", "2027-05-26", "30", "库存 +30", "WMS", "已发送", "待回执", "2026-05-28 09:32:10", "已生成入库留痕"],
      ["IOR202605280014", "PS20260528009", "出库", "配送单", "自有货主A", "华东1仓", "MAT-PS-021", "6901000000210", "物料-商品021", "10盒/箱", "箱", "BATCH20260508A", "2026-05-08", "2027-05-08", "120", "库存 -120", "WMS/TMS", "已发送", "已回执", "2026-05-28 10:06:18", "门店配送已签收"],
      ["IOR202605280017", "CGTH20260528004", "出库", "退货单", "外部货主B", "华南2仓", "MAT-TH-002", "6905000000028", "低值易耗品-防护手套", "24袋/箱", "箱", "BATCH20260510B", "2026-05-10", "2027-05-10", "35", "库存 -35", "WMS", "已发送", "待回执", "2026-05-28 10:22:45", "采购退货已扣减库存"],
      ["IOR202605280025", "TK20260528005", "入库", "退仓单", "自有货主C", "华北3仓", "MAT-TK-002", "6908100000020", "物料-商品012", "24袋/箱", "箱", "BATCH20260509B", "2026-05-09", "2027-05-09", "15", "库存 +15", "WMS", "已发送", "待回执", "2026-05-28 10:48:06", "退仓收货完成"],
      ["IOR202605280031", "DB20260528003", "出库", "调拨单", "外部货主B", "华南2仓", "MAT-DB-003", "6907000000035", "低值易耗品-标签纸", "10卷/箱", "箱", "BATCH20260515A", "2026-05-15", "2027-05-15", "50", "调出 -50", "WMS", "-", "待回执", "2026-05-28 11:05:19", "调出仓库存减少"],
      ["IOR202605280032", "DB20260528003", "入库", "调拨单", "外部货主B", "华中1仓", "MAT-DB-003", "6907000000035", "低值易耗品-标签纸", "10卷/箱", "箱", "BATCH20260515A", "2026-05-15", "2027-05-15", "50", "调入 +50", "WMS", "-", "待回执", "2026-05-28 11:05:36", "调入仓库存增加"],
      ["IOR202605280036", "WQ20260528002", "归属调整", "物权转移单", "外部货主C -> 自有货主C", "华北3仓", "MAT-WQ-008", "6909200000086", "低值易耗品-工具包", "6套/箱", "箱", "BATCH20260518C", "2026-05-18", "2027-05-18", "40", "归属调整", "WMS", "-", "待回执", "2026-05-28 11:23:11", "库存数量不变，货主归属调整"]
    ],
    actions: [
      ["步骤 1", "接收 WMS 结果、申请单执行结果或接口回传后生成出入库记录"],
      ["步骤 2", "按商品、批次、仓库和货主粒度登记库存影响值"],
      ["步骤 3", "同步记录资源资产系统与 BMS 回执状态"],
      ["步骤 4", "支持按记录号、业务单据、商品编码和时间区间追溯留痕"]
    ],
    actionLogs: [
      ["09:18:22", "WMS接口", "写入入库记录 IOR202605280001", "成功"],
      ["10:06:18", "配送履约服务", "写入出库记录 IOR202605280014", "成功"],
      ["10:48:06", "退仓服务", "写入退仓入库记录 IOR202605280025", "成功"],
      ["11:23:11", "物权转移服务", "写入归属调整记录 IOR202605280036", "成功"],
      ["当前", "补偿任务", "待处理 3 条资源资产/BMS 回执异常", "处理中"]
    ],
    integrationRows: [
      ["上游", "WMS", "入库 / 出库 / 调拨结果回传", "成功", "实时写入出入库记录表"],
      ["上游", "PC端申请链路", "审批通过后的执行结果登记", "成功", "覆盖入库申请、退仓申请、物权转移申请"],
      ["下游", "库存台账", "库存影响追溯", "成功", "可按记录号回溯库存变化"],
      ["下游", "资源资产系统", "结果回传留痕", "处理中", "3 条待补偿回执"],
      ["下游", "BMS", "财务传单留痕", "处理中", "支持对账核查"]
    ],
    extraTabs: [
      {
        key: "abnormal",
        label: "异常回执",
        title: "异常回执记录",
        desc: "用于展示资源资产系统和 BMS 回执失败、超时或待补偿的出入库记录，便于统一核查与补偿。",
        headers: ["记录号", "业务单据", "下游系统", "异常类型", "当前状态", "最近处理时间", "处理建议"],
        rows: [
          ["IOR202605280001", "RK20260528003", "BMS", "回执超时", "待补偿", "2026-05-28 09:46", "重推财务传单并记录补偿结果"],
          ["IOR202605280017", "CGTH20260528004", "资源资产系统", "接口失败", "重试中", "2026-05-28 10:31", "校验签名与单据映射后重试"],
          ["IOR202605280036", "WQ20260528002", "BMS", "业务校验失败", "待人工确认", "2026-05-28 11:28", "确认目标货主财务主体后再次传单"]
        ]
      }
    ]
  },
  returnnotice: {
    detailFields: [
      ["通知单号", "THTZ20260526003"],
      ["来源申请单", "THSQ20260526003"],
      ["货主", "外部货主B"],
      ["通知仓库", "华南2仓"],
      ["生成方式", "审核通过自动生成"],
      ["WMS下发", "已下发待执行"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "通知数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-TH-001", "6905000000011", "低值易耗品-清洁剂", "12瓶/箱", "箱", "BATCH20260508A", "2026-05-08", "2027-05-08", "45", "13%", "42.48", "48.00", "1911.60", "2160.00", "248.40"],
      ["MAT-TH-002", "6905000000028", "低值易耗品-防护手套", "24袋/箱", "箱", "BATCH20260510B", "2026-05-10", "2027-05-10", "35", "13%", "26.55", "30.00", "929.25", "1050.00", "120.75"]
    ],
    actions: [
      ["步骤 1", "退货申请单审核通过后自动生成退货通知单"],
      ["步骤 2", "平台按申请明细形成通知数量和价格税率口径"],
      ["步骤 3", "平台将退货通知单下发给 WMS 执行退货作业"],
      ["步骤 4", "待 WMS 回传执行结果后进入退货单环节"]
    ],
    actionLogs: [
      ["09:26", "审批人", "审核通过退货申请单", "成功"],
      ["09:27", "系统", "自动生成退货通知单", "成功"],
      ["09:28", "接口服务", "下发 WMS 通知", "成功"],
      ["当前", "WMS", "待回传退货执行结果", "处理中"]
    ],
    integrationRows: [
      ["上游", "退货申请单", "审核通过回写", "成功", "触发自动生成通知单"],
      ["下游", "WMS", "退货通知下发", "成功", "已生成执行任务"],
      ["下游", "退货单", "等待结果回传", "待触发", "WMS 回传后接收"]
    ]
  },
  purchasereturn: {
    detailFields: [
      ["单据号", "CGTH20260526002"],
      ["申请单号", "THSQ20260526001"],
      ["通知单号", "THTZ20260526001"],
      ["来源系统", "WMS"],
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["库存地点", "1000"],
      ["库存状态", "已完成"],
      ["BMS状态", "待回执"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "批次库存数量", "原入库数量", "退货数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额", "结果"],
    detailRows: [
      ["MAT-TH-001", "6905000000011", "低值易耗品-清洁剂", "12瓶/箱", "箱", "1000", "BATCH20260508A", "2026-05-08", "2027-05-08", "75", "120", "45", "13%", "42.48", "48.00", "1911.60", "2160.00", "248.40", "已退货"],
      ["MAT-TH-002", "6905000000028", "低值易耗品-防护手套", "24袋/箱", "箱", "1000", "BATCH20260510B", "2026-05-10", "2027-05-10", "40", "60", "35", "13%", "26.55", "30.00", "929.25", "1050.00", "120.75", "已退货"]
    ],
    actions: [
      ["步骤 1", "接收 WMS 退货单结果并校验退货单号与批次信息"],
      ["步骤 2", "按退货数量扣减 3PL 库存并记录原入库批次关联"],
      ["步骤 3", "回传资源资产系统退货结果"],
      ["步骤 4", "组装退货单财务单并发送 BMS"]
    ],
    actionLogs: [
      ["10:08:12", "接口服务", "接收退货单报文", "成功"],
      ["10:08:18", "库存服务", "扣减库存", "成功"],
      ["10:08:25", "资源资产接口", "发送退货结果", "成功"],
      ["10:08:41", "BMS接口", "传退货单财务单", "待回执"]
    ],
    integrationRows: [
      ["上游", "WMS", "退货单结果接口", "成功", "已接收退货单与商品明细"],
      ["下游", "资源资产系统", "退货结果回传", "成功", "写入低值易耗品采购退货"],
      ["下游", "BMS", "退货单传单", "待回执", "财务处理中"]
    ]
  },
  qualityreport: {
    detailFields: [
      ["报告编号", "ZJBG20260526001"],
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["商品编码", "MAT-PD-001"],
      ["商品名称", "物料-低值易耗品001"],
      ["规格", "12瓶/箱"],
      ["单位", "箱"],
      ["生产批号", "BATCH20260526A"],
      ["供应商", "供应商A-华东物料"],
      ["检验结论", "合格"]
    ],
    detailHeaders: ["检验项目", "标准要求", "实测值", "判定", "检验方法", "检验员", "检验日期", "备注"],
    detailRows: [
      ["外观检查", "无破损、无污染", "符合", "合格", "目视检查", "张检验", "2026-05-26", ""],
      ["数量核对", "与送货单一致", "120箱", "合格", "称重/点数", "张检验", "2026-05-26", ""],
      ["包装完整性", "密封良好、标识清晰", "符合", "合格", "目视检查", "张检验", "2026-05-26", ""],
      ["效期检查", "距失效期>=180天", "剩余364天", "合格", "核对标签", "张检验", "2026-05-26", ""],
      ["抽检化验", "符合国标要求", "合格", "合格", "实验室化验", "李化验", "2026-05-27", "送第三方实验室"]
    ],
    actions: [
      ["步骤 1", "接收商品并登记生产批号信息"],
      ["步骤 2", "按检验标准逐项进行质检"],
      ["步骤 3", "记录检验结果并生成质检报告"],
      ["步骤 4", "合格批次放行，不合格批次触发退货或销毁"]
    ],
    actionLogs: [
      ["09:00", "仓储运营", "登记批次信息", "成功"],
      ["09:30", "质检员", "开始检验", "进行中"],
      ["10:15", "质检员", "完成检验", "成功"],
      ["10:20", "系统", "生成质检报告", "成功"]
    ],
    integrationRows: [
      ["上游", "入库单", "触发质检", "成功", "入库时自动触发"],
      ["下游", "库存台账", "合格放行", "成功", "合格批次可正常出入库"],
      ["下游", "退货单", "不合格处理", "待触发", "不合格批次触发退货"]
    ]
  },
  delivery: {
    detailFields: [
      ["单据号", "PS20260526001"],
      ["配送申请单号", "DZT20260526001"],
      ["来源要货单", "YH20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓", "华东1仓"],
      ["库存地点", "1000"],
      ["是否需要运输服务", "是"],
      ["运输单号", "YD9087612"],
      ["当前节点", "TMS已接单"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "申请数量", "拣货数量", "发运数量", "签收数量", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-DEL-001", "6907000000016", "物料-商品001", "12瓶/箱", "箱", "1000", "BATCH20260518A", "2026-05-18", "2027-05-18", "13%", "42.48", "48.00", "100", "100", "100", "0", "4248.00", "4800.00", "552.00"],
      ["MAT-DEL-002", "6907000000023", "物料-商品002", "24袋/箱", "箱", "1000", "BATCH20260520B", "2026-05-20", "2027-05-20", "13%", "26.55", "30.00", "160", "160", "160", "0", "4248.00", "4800.00", "552.00"]
    ],
    actions: [
      ["步骤 1", "客户要货单生成配送通知单"],
      ["步骤 2", "同时下发 WMS 拣货和 TMS 运输任务"],
      ["步骤 3", "WMS 回传出库结果并生成正式配送单"],
      ["步骤 4", "TMS 回传物流轨迹与签收状态"]
    ],
    actionLogs: [
      ["10:10", "系统", "生成配送通知单", "成功"],
      ["10:10", "WMS接口", "下发出库任务", "成功"],
      ["10:11", "TMS接口", "下发运输任务", "成功"],
      ["11:20", "TMS", "承运商接单", "成功"]
    ],
    integrationRows: [
      ["上游", "客户要货", "客户要货单", "成功", "已生成配送通知"],
      ["下游", "WMS", "出库执行", "处理中", "待复核完成"],
      ["下游", "TMS", "运输执行", "成功", "已生成运单"],
      ["下游", "BMS", "配送财务传单", "待触发", "发货完成后传递"]
    ]
  },
  deliveryorder: {
    detailFields: [
      ["配送单号", "PSDD20260526001"],
      ["要货单号", "YH20260526001"],
      ["配送申请单号", "DZT20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓", "华东1仓"],
      ["库存地点", "1000"],
      ["签收状态", "已签收"],
      ["库存扣减", "已完成"],
      ["资源资产回传", "已发送"],
      ["BMS状态", "已回执"],
      ["来源系统", "WMS"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "拣货数量", "出库数量", "签收数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-PS-001", "6907000000016", "物料-商品001", "12瓶/箱", "箱", "1000", "BATCH20260518A", "2026-05-18", "2027-05-18", "100", "100", "100", "13%", "42.48", "48.00", "4248.00", "4800.00", "552.00"],
      ["MAT-PS-002", "6907000000023", "物料-商品002", "24袋/箱", "箱", "1000", "BATCH20260520B", "2026-05-20", "2027-05-20", "160", "160", "160", "13%", "26.55", "30.00", "4248.00", "4800.00", "552.00"]
    ],
    actions: [
      ["步骤 1", "接收 WMS 出库回传报文并生成配送单"],
      ["步骤 2", "扣减 3PL 库存台账和可用量"],
      ["步骤 3", "回传资源资产系统配送结果"],
      ["步骤 4", "组装财务单据并发送 BMS"]
    ],
    actionLogs: [
      ["14:02:18", "WMS接口", "接收出库回传", "成功"],
      ["14:02:20", "库存服务", "扣减库存", "成功"],
      ["14:02:28", "资源资产接口", "发送配送结果", "成功"],
      ["14:02:35", "BMS接口", "传财务单", "已回执"]
    ],
    integrationRows: [
      ["上游", "WMS", "出库回传接口", "成功", "已生成配送单"],
      ["下游", "资源资产系统", "配送结果回传", "成功", "写入配送出库"],
      ["下游", "BMS", "配送单传单", "已回执", "财务处理完成"]
    ]
  },
  transportservice: {
    detailFields: [
      ["申请单号", "YS20260526001"],
      ["配送申请单号", "DZT20260526001"],
      ["来源要货单", "YH20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓", "华东1仓"],
      ["收货地址", "上海市浦东新区张江路100号"],
      ["要求到货日期", "2026-05-28"],
      ["运输方式", "公路运输"],
      ["承运商", "顺捷物流"],
      ["运输状态", "运输中"]
    ],
    detailHeaders: ["商品编码", "商品名称", "规格", "单位", "申请数量", "重量(kg)", "体积(m³)", "温控要求", "备注"],
    detailRows: [
      ["MAT-TS-001", "物料-商品001", "12瓶/箱", "箱", "100", "480", "1.2", "常温", "—"],
      ["MAT-TS-002", "物料-商品002", "24袋/箱", "箱", "160", "320", "0.8", "常温", "—"]
    ],
    actions: [
      ["步骤 1", "配送申请单触发运输服务需求"],
      ["步骤 2", "生成运输服务申请单并匹配承运商"],
      ["步骤 3", "承运商确认接单并安排运输"],
      ["步骤 4", "运输完成回传签收状态"]
    ],
    actionLogs: [
      ["10:12", "系统", "生成运输服务申请单", "成功"],
      ["10:30", "承运商", "确认接单", "成功"],
      ["11:00", "TMS", "运输出发", "处理中"],
      ["当前", "系统", "待签收回传", "待触发"]
    ],
    integrationRows: [
      ["上游", "配送申请单", "触发运输需求", "成功", "已生成运输服务申请单"],
      ["下游", "TMS", "运输执行", "处理中", "承运商已接单"],
      ["下游", "BMS", "运费结算", "待触发", "运输完成后结算"]
    ]
  },
  errororder: {
    detailFields: [
      ["差错单号", "CC20260526001"],
      ["关联配送单", "PS20260526001"],
      ["客户", "内部客户-华东分部"],
      ["货主", "自有货主A"],
      ["发货仓库", "华东1仓"],
      ["差错类型", "数量差异"],
      ["差错状态", "处理中"],
      ["发现日期", "2026-05-27"]
    ],
    detailHeaders: ["商品编码", "商品名称", "规格", "单位", "发货数量", "签收数量", "差异数量", "差异类型", "处理方式", "处理状态"],
    detailRows: [
      ["MAT-DEL-001", "物料-商品001", "12瓶/箱", "箱", "100", "98", "-2", "短少", "补发", "处理中"],
      ["MAT-DEL-002", "物料-商品002", "24袋/箱", "箱", "160", "155", "-5", "短少", "补发", "处理中"]
    ],
    actions: [
      ["步骤 1", "客户签收时反馈数量差异"],
      ["步骤 2", "仓库复核确认差异原因"],
      ["步骤 3", "生成差错单并确认差错明细"],
      ["步骤 4", "根据差错类型执行补发或扣减"]
    ],
    actionLogs: [
      ["14:00", "客户", "签收反馈差异", "触发"],
      ["15:30", "仓库", "复核确认", "成功"],
      ["16:00", "系统", "生成差错单", "成功"],
      ["次日 09:00", "运营", "确认处理方案", "处理中"]
    ],
    integrationRows: [
      ["上游", "配送发货申请", "关联配送单", "成功", "发货数量为基准"],
      ["上游", "签收回传", "触发差错", "成功", "签收数量与发货数量对比"],
      ["下游", "补发出库", "差异补发", "待触发", "确认后生成补发任务"],
      ["下游", "BMS", "财务调整", "待触发", "补发完成后调整费用"]
    ]
  },
  return: {
    detailFields: [
      ["退仓单号", "TK20260526011"],
      ["来源单据", "PS20260522003"],
      ["客户", "外部客户-门店联盟"],
      ["原货主", "外部货主B"],
      ["退回仓", "华南2仓"],
      ["库存地点", "1001"],
      ["当前状态", "仓库收货中"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "退仓数量", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-RET-001", "6908000000013", "物料-商品011", "12瓶/箱", "箱", "1000", "BATCH20260506A", "2026-05-06", "2027-05-06", "13%", "42.48", "48.00", "30", "1274.40", "1440.00", "165.60"],
      ["MAT-RET-002", "6908000000020", "物料-商品012", "24袋/箱", "箱", "1001", "BATCH20260509B", "2026-05-09", "2027-05-09", "13%", "26.55", "30.00", "15", "398.25", "450.00", "51.75"]
    ],
    actions: [
      ["步骤 1", "根据原配送单回溯原货主、原仓库和可退商品批次"],
      ["步骤 2", "接收退仓商品并记录批次、价格和税率信息"],
      ["步骤 3", "同步更新库存并回传资源资产系统"],
      ["步骤 4", "将退仓结果传递 BMS 进行后续财务处理"]
    ],
    actionLogs: [
      ["10:02", "客户运营", "发起退仓申请", "成功"],
      ["10:10", "仓储运营", "确认退回仓和批次明细", "成功"],
      ["10:18", "WMS", "仓库开始收货", "处理中"],
      ["当前", "BMS接口", "待退仓完成后传单", "待触发"]
    ],
    integrationRows: [
      ["上游", "客户/门店", "退仓申请", "成功", "已带出原单和原货主信息"],
      ["下游", "WMS", "退仓收货执行", "处理中", "待完成上架"],
      ["下游", "BMS", "退仓财务传单", "待触发", "收货完成后传递"]
    ]
  },
  transfer: {
    detailFields: [
      ["调拨单号", "DB20260526003"],
      ["来源系统", "WMS"],
      ["调出仓", "华南2仓"],
      ["调入仓", "华中1仓"],
      ["库存地点", "1000"],
      ["货主", "外部货主B"],
      ["库存同步", "已完成"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "调拨数量", "未税金额", "含税金额", "税额", "调出结果", "调入结果", "备注"],
    detailRows: [
      ["MAT-TRF-005", "6909000000055", "物料-商品005", "12瓶/箱", "箱", "1000", "BATCH20260511A", "2026-05-11", "2027-05-11", "13%", "42.48", "48.00", "50", "2124.00", "2400.00", "276.00", "已扣减", "已增加", "正常调拨"],
      ["MAT-TRF-006", "6909000000062", "物料-商品006", "24袋/箱", "箱", "1000", "BATCH20260513B", "2026-05-13", "2027-05-13", "13%", "26.55", "30.00", "30", "796.50", "900.00", "103.50", "已扣减", "已增加", "正常调拨"]
    ],
    actions: [
      ["步骤 1", "WMS 回传调拨结果"],
      ["步骤 2", "同步调出仓和调入仓库存"],
      ["步骤 3", "向资源资产系统回传调拨结果"],
      ["步骤 4", "向 BMS 发送财务处理单据"]
    ],
    actionLogs: [
      ["10:21", "WMS接口", "接收调拨结果", "成功"],
      ["10:22", "库存服务", "同步调出调入库存", "成功"],
      ["10:23", "资源资产接口", "发送调拨结果", "成功"],
      ["10:24", "BMS接口", "传财务单", "待回执"]
    ],
    integrationRows: [
      ["上游", "WMS", "调拨结果接口", "成功", "已接收结果"],
      ["下游", "资源资产系统", "调拨结果回传", "成功", "待对方确认"],
      ["下游", "BMS", "调拨财务传单", "待回执", "处理中"]
    ]
  },
  loss: {
    detailFields: [
      ["损溢单号", "SY20260526005"],
      ["仓库", "华南2仓"],
      ["库存地点", "1008"],
      ["货主", "自有货主A"],
      ["损溢类型", "报损"],
      ["责任人", "王婷"],
      ["审批状态", "审批中"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批号", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "损溢数量", "未税金额", "含税金额", "税额", "原因"],
    detailRows: [
      ["MAT-LOS-001", "6910000000017", "物料-商品031", "12瓶/箱", "箱", "1008", "BATCH20260515A", "2026-05-15", "2027-05-15", "13%", "42.48", "48.00", "20", "849.60", "960.00", "110.40", "运输破损"],
      ["MAT-LOS-002", "6910000000024", "物料-商品032", "24袋/箱", "箱", "1005", "BATCH20260516B", "2026-05-16", "2027-05-16", "13%", "26.55", "30.00", "12", "318.60", "360.00", "41.40", "包装污染"]
    ],
    actions: [
      ["步骤 1", "登记损溢商品并带出批次、价格和税率信息"],
      ["步骤 2", "提交审批并记录责任人与损溢原因"],
      ["步骤 3", "审批通过后更新库存并形成损溢结果"],
      ["步骤 4", "同步 BMS 进行财务处理和审计留痕"]
    ],
    actionLogs: [
      ["09:42", "仓储运营", "登记损溢商品", "成功"],
      ["09:48", "系统", "计算损溢金额", "成功"],
      ["09:55", "审批中心", "提交审批", "处理中"],
      ["当前", "财务协同", "待审批完成后传单", "待触发"]
    ],
    integrationRows: [
      ["上游", "仓库现场", "损溢上报", "成功", "已登记批次和责任信息"],
      ["下游", "审批中心", "损溢审批", "处理中", "待审批完成"],
      ["下游", "BMS", "损溢财务传单", "待触发", "审批通过后传递"]
    ]
  },
  positionadjust: {
    detailFields: [
      ["调整单号", "CW20260601001"],
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["原库存地点", "1000"],
      ["目标库存地点", "1000"],
      ["调整类型", "库存地点移位"],
      ["调整原因", "库存地点整理优化"],
      ["调整状态", "已完成"],
      ["调整人", "张伟"],
      ["时间", "2026-06-01 14:30"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "调整数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-CW-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "50", "13%", "42.48", "48.00", "2124.00", "2400.00", "276.00"],
      ["MAT-CW-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "30", "13%", "26.55", "30.00", "796.50", "900.00", "103.50"],
      ["MAT-CW-003", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "40", "13%", "42.48", "48.00", "1699.20", "1920.00", "220.80"],
      ["MAT-CW-004", "6903000000020", "低值易耗品-防护手套", "100只/盒", "盒", "60", "13%", "35.40", "40.00", "2124.00", "2400.00", "276.00"]
    ],
    actions: [
      ["步骤 1", "选择需要调整的库存地点和目标库存地点"],
      ["步骤 2", "选择需要调整的商品和数量"],
      ["步骤 3", "提交审批后调整库存库存地点"],
      ["步骤 4", "同步WMS库存并回传资源资产系统"]
    ],
    actionLogs: [
      ["14:30", "仓储运营", "创建库存地点调整单", "成功"],
      ["14:35", "审批人", "审核通过调整申请", "成功"],
      ["14:36", "库存服务", "同步库存地点库存变更", "成功"],
      ["当前", "接口服务", "回传资源资产系统", "待回执"]
    ],
    integrationRows: [
      ["上游", "仓库运营", "库存地点调整申请", "成功", "库存地点移位需求"],
      ["下游", "WMS", "库存地点库存同步", "成功", "已更新库存地点库存"],
      ["下游", "资源资产系统", "调整结果回传", "待回执", "等待对方确认"],
      ["下游", "BMS", "库存调整财务传单", "待触发", "调整完成后自动传单"]
    ]
  },
  inventorycheck: {
    detailFields: [
      ["盘点单号", "PD20260526001"],
      ["计划单号", "PDJH20260526001"],
      ["通知单号", "PDTZ20260526001"],
      ["仓库", "华东1仓"],
      ["库存地点", "1000"],
      ["货主", "自有货主A"],
      ["盘点类型", "全盘"],
      ["盘点结果", "有差异"],
      ["确认状态", "待确认"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "账面数量", "实盘数量", "差异数量", "差异类型", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额", "备注"],
    detailRows: [
      ["MAT-PD-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "BATCH20260526A", "120", "118", "-2", "盘亏", "13%", "42.48", "48.00", "-84.96", "-96.00", "-11.04", "待确认"],
      ["MAT-PD-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "BATCH20260526B", "100", "103", "+3", "盘盈", "13%", "26.55", "30.00", "79.65", "90.00", "10.35", "待确认"],
      ["MAT-PD-003", "6903000000013", "低值易耗品-清洁剂", "12瓶/箱", "箱", "BATCH20260508A", "75", "72", "-3", "盘亏", "13%", "42.48", "48.00", "-127.44", "-144.00", "-16.56", "已确认"]
    ],
    actions: [
      ["步骤 1", "WMS 完成盘点后推送盘点结果到 3PL 平台"],
      ["步骤 2", "3PL 仓储运营确认盘点差异并核实原因"],
      ["步骤 3", "确认后联动生成损溢单进行库存调整"],
      ["步骤 4", "库存调整完成后同步 BMS 进行财务处理"]
    ],
    actionLogs: [
      ["09:00", "WMS", "推送盘点结果", "成功"],
      ["09:15", "仓储运营", "开始核实差异", "处理中"],
      ["当前", "系统", "待确认后生成损溢单", "待触发"]
    ],
    integrationRows: [
      ["上游", "WMS", "盘点结果推送", "成功", "已完成全盘"],
      ["下游", "损溢单", "联动生成损溢单", "待触发", "确认差异后自动生成"],
      ["下游", "BMS", "库存调整财务传单", "待触发", "损溢单审批后传递"]
    ]
  },
  inventoryplan: {
    detailFields: [
      ["计划单号", "PDJH20260526003"],
      ["货主", "外部货主B"],
      ["盘点仓库", "华南2仓"],
      ["盘点库存地点", "1001"],
      ["盘点类型", "抽盘"],
      ["预计盘点日期", "2026-06-20"],
      ["盘点时间", "2026-05-29 09:00"],
      ["申请状态", "已审核通过"],
      ["生成通知", "已生成盘点通知单"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "盘点数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-PDJH-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "120", "13%", "42.48", "48.00", "5097.60", "5760.00", "662.40"],
      ["MAT-PDJH-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "80", "13%", "26.55", "30.00", "2124.00", "2400.00", "276.00"]
    ],
    actions: [
      ["步骤 1", "手工创建或接收资源资产系统传入的盘点计划申请单"],
      ["步骤 2", "审核盘点计划并校验仓库、盘点类型和商品范围"],
      ["步骤 3", "审核通过后自动生成盘点通知单"],
      ["步骤 4", "待 WMS 执行盘点后进入盘点结果单环节"]
    ],
    actionLogs: [
      ["09:00", "资源资产系统", "传入盘点计划申请", "成功"],
      ["09:12", "仓储运营", "补充盘点范围说明", "成功"],
      ["09:26", "审批人", "审核通过申请单", "成功"],
      ["当前", "系统", "待生成盘点通知单", "处理中"]
    ],
    integrationRows: [
      ["上游", "资源资产系统", "盘点计划传入", "成功", "支持接口直接导入"],
      ["上游", "PC端", "手工创建申请单", "成功", "支持人工补录"],
      ["下游", "盘点通知单", "审核通过自动生成", "待触发", "生成后再下发 WMS"]
    ],
    listFilters: ["计划单号", "货主", "盘点仓库", "盘点库存地点", "盘点类型", "盘点范围", "申请状态", "生成通知", "日期范围"],
    listHeaders: ["操作", "勾选", "计划单号", "货主", "盘点仓库", "盘点库存地点", "盘点类型", "预计盘点日期", "盘点时间", "盘点范围", "提交人", "审批人", "时间", "申请状态", "生成通知", "审批意见", "驳回原因"],
    listRows: [],
    extraTabs: [
      {
        key: "approval",
        label: "审批记录",
        title: "盘点计划申请审批记录",
        desc: "用于展示盘点计划申请单从草稿、提交审批、审批通过或驳回到再次提交的审批轨迹。",
        headers: ["审批时间", "计划单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"],
        render: renderReturnApplyApprovalTab
      },
      {
        key: "create",
        label: "新增",
        title: "新增盘点计划申请单",
        render: renderInventoryPlanCreateTab
      }
    ]
  },
  inventorynotify: {
    detailFields: [
      ["通知单号", "PDTZ20260526003"],
      ["来源申请单", "PDJH20260526003"],
      ["货主", "外部货主B"],
      ["盘点仓库", "华南2仓"],
      ["盘点库存地点", "1001"],
      ["盘点类型", "抽盘"],
      ["盘点时间", "2026-05-29 09:00"],
      ["商品范围", "库存地点 1001 低值易耗品类（42项）"],
      ["生成方式", "审核通过自动生成"],
      ["WMS下发", "已下发待执行"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "通知数量", "税率", "未税进价", "含税进价", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-PDJH-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "120", "13%", "42.48", "48.00", "5097.60", "5760.00", "662.40"],
      ["MAT-PDJH-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "80", "13%", "26.55", "30.00", "2124.00", "2400.00", "276.00"]
    ],
    actions: [
      ["步骤 1", "盘点计划申请单审核通过后自动生成盘点通知单"],
      ["步骤 2", "平台按申请明细形成通知数量和价格税率口径"],
      ["步骤 3", "平台将盘点通知单下发给 WMS 执行盘点作业"],
      ["步骤 4", "待 WMS 回传盘点结果后进入盘点结果单环节"]
    ],
    actionLogs: [
      ["09:26", "审批人", "审核通过盘点计划申请", "成功"],
      ["09:27", "系统", "自动生成盘点通知单", "成功"],
      ["09:28", "接口服务", "下发 WMS 盘点通知", "成功"],
      ["当前", "WMS", "待回传盘点执行结果", "处理中"]
    ],
    integrationRows: [
      ["上游", "盘点计划申请单", "审核通过回写", "成功", "触发自动生成通知单"],
      ["下游", "WMS", "盘点通知下发", "成功", "已生成盘点执行任务"],
      ["下游", "盘点结果单", "等待结果回传", "待触发", "WMS 回传后接收"]
    ]
  },
  ownership: {
    detailFields: [
      ["转移单号", "WQ20260526003"],
      ["原货主", "外部货主B"],
      ["目标货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["当前状态", "待审批"],
      ["库存归属", "待调整"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "生产批号", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "转移数量", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-OWN-001", "6911000000014", "物料-商品041", "12瓶/箱", "箱", "BATCH20260507A", "2026-05-07", "2027-05-07", "13%", "42.48", "48.00", "120", "5097.60", "5760.00", "662.40"],
      ["MAT-OWN-002", "6911000000021", "物料-商品042", "24袋/箱", "箱", "BATCH20260508B", "2026-05-08", "2027-05-08", "13%", "26.55", "30.00", "140", "3717.00", "4200.00", "483.00"]
    ],
    actions: [
      ["步骤 1", "登记待转移商品并带出原货主下的批次价格信息"],
      ["步骤 2", "校验目标货主、合同和库存可转移数量"],
      ["步骤 3", "审批通过后调整库存归属并保留批次信息"],
      ["步骤 4", "同步 BMS 进行物权转移财务处理"]
    ],
    actionLogs: [
      ["09:36", "货主管理", "创建物权转移单", "成功"],
      ["09:40", "系统", "校验合同与库存", "成功"],
      ["09:46", "审批中心", "提交审批", "处理中"],
      ["当前", "BMS接口", "待审批通过后传单", "待触发"]
    ],
    integrationRows: [
      ["上游", "业务申请", "物权转移发起", "成功", "已登记转移商品明细"],
      ["下游", "WMS", "库存属性调整", "待触发", "审批通过后执行"],
      ["下游", "BMS", "物权转移财务传单", "待触发", "审批通过后传递"]
    ]
  },
  inventory: {
    detailFields: [
      ["货主", "自有货主A"],
      ["仓库", "华东1仓"],
      ["库存地点", "合格品区"],
      ["商品编码", "MAT-INV-001"],
      ["商品名称", "物料-低值易耗品001"],
      ["库存状态", "正常"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "库存地点", "生产批次", "生产日期", "保质日期", "税率", "未税进价", "含税进价", "可用库存", "锁定库存", "待检库存", "在途库存", "未税金额", "含税金额", "税额"],
    detailRows: [
      ["MAT-INV-001", "6906000000019", "物料-低值易耗品001", "12瓶/箱", "箱", "合格品区", "BATCH20260501A", "2026-05-01", "2027-05-01", "13%", "42.48", "48.00", "1220", "80", "20", "40", "51825.60", "58560.00", "6734.40"],
      ["MAT-INV-002", "6906000000026", "物料-商品002", "24袋/箱", "箱", "待退货区", "BATCH20260508B", "2026-05-08", "2027-05-08", "13%", "26.55", "30.00", "120", "60", "0", "15", "3186.00", "3600.00", "414.00"],
      ["MAT-INV-003", "6906000000033", "物料-商品003", "6盒/箱", "箱", "报废品区", "BATCH20260512C", "2026-05-12", "2027-05-12", "13%", "17.70", "20.00", "680", "100", "15", "0", "12036.00", "13600.00", "1564.00"]
    ],
    actions: [
      ["步骤 1", "按货主、仓库、库存地点和商品维度汇总库存余额"],
      ["步骤 2", "展示商品基础属性与库存金额信息"],
      ["步骤 3", "在明细中展示生产批次对应的税率和价格金额"],
      ["步骤 4", "为业务履约、财务协同和异常处理提供库存依据"]
    ],
    actionLogs: [
      ["09:55", "库存服务", "汇总库存余额", "成功"],
      ["09:58", "主数据服务", "补充商品属性", "成功"],
      ["10:02", "价格服务", "计算库存金额", "成功"],
      ["10:05", "页面端", "加载库存明细", "成功"]
    ],
    integrationRows: [
      ["上游", "WMS", "库存结果回传", "成功", "已同步最新库存数量与批次"],
      ["支撑", "主数据系统", "商品与条码信息", "成功", "已补充商品主数据字段"],
      ["支撑", "BMS", "价格税率口径", "成功", "用于库存金额展示"]
    ]
  },
  productinfo: {
    detailFields: [
      ["商品编码", "MAT-NEW-001"],
      ["商品名称", "新品-消杀喷雾"],
      ["型号", "AJ-XP-24"],
      ["温层", "常温"],
      ["保质期天数", "365"],
      ["长(cm)", "42"],
      ["宽(cm)", "30"],
      ["高(cm)", "28"],
      ["体积(m3)", "0.0353"],
      ["重量(kg)", "12.5"],
      ["包装数量", "24"],
      ["状态", "已启用"],
      ["维护方式", "审批写入"],
      ["来源单据", "XP20260526003"],
      ["审批结果", "已审核通过"]
    ],
    detailHeaders: ["商品编码", "条形码", "商品名称", "规格", "单位", "商品分类", "品牌", "型号", "温层", "保质期天数", "长(cm)", "宽(cm)", "高(cm)", "体积(m3)", "重量(kg)", "包装数量", "是否批次管理", "是否效期管理", "税率", "未税进价", "含税进价", "状态", "维护方式"],
    detailRows: [
      ["MAT-NEW-001", "6923000000018", "新品-消杀喷雾", "24瓶/箱", "箱", "清洁消杀", "安洁", "AJ-XP-24", "常温", "365", "42", "30", "28", "0.0353", "12.5", "24", "是", "是", "13%", "38.94", "44.00", "已启用", "审批写入"],
      ["MAT-NEW-002", "6923000000025", "新品-医用手套", "50盒/箱", "箱", "防护用品", "护安", "HA-GLOVE-50", "常温", "730", "48", "36", "32", "0.0553", "16.8", "50", "是", "是", "13%", "61.95", "70.00", "已启用", "Excel导入"]
    ],
    actions: [
      ["步骤 1", "接收审批通过后的新品主数据写入请求"],
      ["步骤 2", "生成正式商品编码并校验条码唯一性"],
      ["步骤 3", "补齐商品分类、品牌、型号、温层和批次效期属性"],
      ["步骤 4", "发布商品信息供业务单据和库存使用"]
    ],
    actionLogs: [
      ["09:20", "商品主数据", "写入新品商品信息", "成功"],
      ["09:22", "编码服务", "生成正式商品编码", "成功"],
      ["09:25", "主数据管理员", "补充商品分类", "成功"],
      ["当前", "业务模块", "已可引用商品信息", "成功"]
    ],
    integrationRows: [
      ["上游", "新品录入单", "审批通过回写", "成功", "触发商品信息写入"],
      ["支撑", "编码服务", "正式商品编码生成", "成功", "已避免重复编码"],
      ["下游", "业务单据", "商品信息引用", "成功", "入库/退货/配送可直接使用"]
    ],
    extraTabs: [
      {
        key: "mapping",
        label: "分类映射",
        title: "商品分类映射表",
        desc: "用于展示新品写入商品信息时，业务分类、标准分类、温层和批次效期策略的映射关系。",
        headers: ["商品编码", "业务分类", "标准分类", "温层", "批次管理", "效期管理", "映射状态"],
        rows: [
          ["MAT-NEW-001", "清洁消杀", "MRO-CLEAN", "常温", "是", "是", "已映射"],
          ["MAT-NEW-002", "防护用品", "PPE-PROTECT", "常温", "是", "是", "已映射"],
          ["MAT-INV-001", "低值易耗品", "MRO-GENERAL", "常温", "是", "是", "历史已映射"]
        ]
      }
    ]
  },
  approval: {
    detailFields: [
      ["审批单号", "APR20260526002"],
      ["单据类型", "客户要货单"],
      ["业务单号", "YH20260526002"],
      ["申请人", "李明"],
      ["当前审批人", "张经理"],
      ["审批状态", "待审批"]
    ],
    detailHeaders: ["校验项", "结果", "说明"],
    detailRows: [
      ["合同有效性", "通过", "合同在有效期内"],
      ["库存可用量", "通过", "库存可满足本次需求"],
      ["关系表匹配", "通过", "已匹配默认货主与仓库"]
    ],
    actions: [
      ["动作 1", "审批通过后进入待履约或待执行状态"],
      ["动作 2", "驳回时记录驳回原因并回退申请方"],
      ["动作 3", "转交时保留原审批痕迹和新处理人"],
      ["动作 4", "所有动作均记录审批留痕"]
    ],
    actionLogs: [
      ["09:28", "李明", "提交审批", "成功"],
      ["09:35", "系统", "分配审批人", "成功"],
      ["当前", "张经理", "待处理", "进行中"]
    ],
    integrationRows: [
      ["上游", "业务单据", "审批发起", "成功", "进入审批中心"],
      ["下游", "业务模块", "审批结果回写", "待触发", "通过后回写"],
      ["审计", "日志中心", "审批留痕", "成功", "全量记录"]
    ]
  },
  finance: {
    detailFields: [
      ["业务单据", "SY20260526005"],
      ["单据类型", "损溢单"],
      ["传单状态", "传单失败"],
      ["BMS回执", "失败"],
      ["差异状态", "待处理"],
      ["处理人", "财务专员-王丽"]
    ],
    detailHeaders: ["字段", "3PL值", "BMS值", "差异说明"],
    detailRows: [
      ["货主", "自有货主A", "自有货主A", "一致"],
      ["数量", "32", "32", "一致"],
      ["损溢原因", "破损", "空", "BMS未接收该字段"]
    ],
    actions: [
      ["动作 1", "检查传单报文与基础映射"],
      ["动作 2", "修正差异字段或补充配置"],
      ["动作 3", "重新发起 BMS 传单"],
      ["动作 4", "记录差异处理结论并关闭工单"]
    ],
    actionLogs: [
      ["10:08", "接口服务", "首次传单", "失败"],
      ["10:12", "财务专员", "分析差异", "处理中"],
      ["10:18", "接口管理员", "准备重推", "待执行"]
    ],
    integrationRows: [
      ["上游", "业务模块", "业务单据推送", "成功", "已生成财务任务"],
      ["下游", "BMS", "财务传单", "失败", "字段差异待处理"],
      ["支撑", "差异工单", "人工处理", "处理中", "待关闭"]
    ]
  },
  logs: {
    detailFields: [
      ["接口名称", "资源资产结果回传接口"],
      ["调用方向", "3PL -> CRS"],
      ["关联单据", "DB20260526003"],
      ["当前状态", "失败"],
      ["失败类型", "签名校验失败"],
      ["重试次数", "1"]
    ],
    detailHeaders: ["报文节点", "内容摘要", "状态"],
    detailRows: [
      ["请求头", "含签名、时间戳、系统编码", "已记录"],
      ["请求体", "调拨单结果与库存影响信息", "已记录"],
      ["响应体", "签名校验失败", "失败"]
    ],
    actions: [
      ["动作 1", "查看失败原因与报文摘要"],
      ["动作 2", "校验密钥、签名算法和时间戳"],
      ["动作 3", "执行自动或人工重试"],
      ["动作 4", "如仍失败则生成补偿任务"]
    ],
    actionLogs: [
      ["10:26:17", "接口服务", "首次调用", "失败"],
      ["10:26:48", "自动重试", "第1次重试", "失败"],
      ["当前", "接口管理员", "待人工处理", "处理中"]
    ],
    integrationRows: [
      ["上游", "业务模块", "结果推送", "成功", "已生成待发送报文"],
      ["下游", "资源资产系统", "接口接收", "失败", "签名校验异常"],
      ["支撑", "补偿任务", "异常补偿", "待创建", "可人工触发"]
    ]
  }
};

const newProductPageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 8,
  approvalLogs: null,
  nextLogMinute: 47,
  approvalFilters: null
};

const returnApplyInPageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 6,
  approvalLogs: null,
  nextLogMinute: 36
};

const returnApplyInFormState = {
  mode: "create",
  record: null,
  goodsRows: null,
  goodsSourceLabel: "手工录入"
};

const returnApplyFormState = {
  mode: "create",
  record: null,
  goodsRows: null,
  goodsSourceLabel: "手工录入"
};

const returnApplyPageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 6,
  approvalLogs: null,
  nextLogMinute: 22
};

const ownershipApplyFormState = {
  mode: "create",
  record: null,
  goodsRows: null,
  goodsSourceLabel: "手工录入"
};

// -- 盘点计划申请单 CRUD State --
const inventoryPlanPageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 8,
  approvalLogs: null,
  nextLogMinute: 22
};
const inventoryPlanFormState = {
  mode: "create",
  record: null,
  goodsRows: null,
  goodsSourceLabel: "手工录入"
};

// ========== 盘点计划申请单 CRUD Functions ==========

function getInventoryPlanListRecords() {
  if (!inventoryPlanPageState.listRecords) {
    inventoryPlanPageState.listRecords = [
      { orderNo: "PDJH20260526001", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "全盘", submitStatus: "草稿", generateNotice: "未生成", submitter: "张伟", approver: "", time: "2026-05-26 09:00", approvalOpinion: "", rejectReason: "", checkTime: "2026-05-28 08:00", expectedDate: "2026-06-15", checkScope: "", categories: [], productRange: "全部商品（86项）", goodsSummary: "已选择 3 个商品 / 盘点数量 320", applyQty: 320, contact: "张伟 / 13900000001", reason: "月度全盘", remark: "" },
      { orderNo: "PDJH20260526002", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "抽盘", submitStatus: "待审批", generateNotice: "未生成", submitter: "张伟", approver: "李明", time: "2026-05-26 10:30", approvalOpinion: "", rejectReason: "", checkTime: "2026-05-29 14:00", expectedDate: "2026-06-18", checkScope: "中类", categories: ["清洁剂", "防护手套", "消毒液", "洗衣液", "洗洁精"], productRange: "库存地点 1000 低值易耗品类（42项）", goodsSummary: "已选择 5 个品类 / 盘点数量 200", applyQty: 200, contact: "张伟 / 13900000001", reason: "系统触发抽盘", remark: "重点关注临期商品" },
      { orderNo: "PDJH20260526003", owner: "外部货主B", warehouse: "华南2仓", position: "1001", checkType: "抽盘", submitStatus: "已审核通过", generateNotice: "已生成盘点通知单", submitter: "系统", approver: "王芳", time: "2026-05-26 11:00", approvalOpinion: "同意", rejectReason: "", checkTime: "2026-05-29 09:00", expectedDate: "2026-06-20", checkScope: "小类", categories: ["防护手套", "低值易耗品", "一次性口罩"], productRange: "库存地点 1001 清洁剂/防护手套（42项）", goodsSummary: "已选择 3 个品类 / 盘点数量 180", applyQty: 180, contact: "赵强 / 13800000002", reason: "季度抽盘", remark: "" },
      { orderNo: "PDJH20260526004", owner: "自有货主A", warehouse: "华北3仓", position: "1000", checkType: "抽盘", submitStatus: "已审核通过", generateNotice: "已生成盘点通知单", submitter: "刘洋", approver: "王芳", time: "2026-05-26 14:00", approvalOpinion: "同意", rejectReason: "", checkTime: "2026-05-30 10:00", expectedDate: "2026-06-22", checkScope: "大类", categories: ["低值易耗品", "清洁剂", "防护用品", "办公用品"], productRange: "库存地点 1000 动销商品（28项）", goodsSummary: "已选择 4 个品类 / 盘点数量 150", applyQty: 150, contact: "刘洋 / 13700000003", reason: "抽盘核实", remark: "" },
      { orderNo: "PDJH20260526005", owner: "自有货主C", warehouse: "华北3仓", position: "1005", checkType: "抽盘", submitStatus: "审批驳回", generateNotice: "未生成", submitter: "陈明", approver: "王芳", time: "2026-05-26 15:30", approvalOpinion: "盘点范围不完整", rejectReason: "请补充商品范围后重新提交", checkTime: "2026-05-31 08:00", expectedDate: "2026-06-25", checkScope: "中类", categories: ["清洁剂", "消毒液", "洗衣液"], productRange: "库存地点 1005 清洁剂类（12项）", goodsSummary: "已选择 3 个品类 / 盘点数量 75", applyQty: 75, contact: "陈明 / 13600000004", reason: "库存差异核实", remark: "驳回后需补充" },
      { orderNo: "PDJH20260526006", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "抽盘", submitStatus: "待审批", generateNotice: "未生成", submitter: "系统", approver: "李明", time: "2026-05-27 09:15", approvalOpinion: "", rejectReason: "", checkTime: "2026-05-30 14:00", expectedDate: "2026-06-28", checkScope: "小类", categories: ["防护手套", "清洁剂", "防护用品", "垃圾袋", "抹布"], productRange: "库存地点 1000 清洁剂类（35项）", goodsSummary: "已选择 5 个品类 / 盘点数量 160", applyQty: 160, contact: "张伟 / 13900000001", reason: "系统触发抽盘", remark: "" },
      { orderNo: "PDJH20260526007", owner: "外部货主B", warehouse: "华南2仓", position: "B-01 全区", checkType: "全盘", submitStatus: "草稿", generateNotice: "未生成", submitter: "赵强", approver: "", time: "2026-05-27 10:00", approvalOpinion: "", rejectReason: "", checkTime: "2026-06-01 08:00", expectedDate: "2026-07-01", checkScope: "", categories: [], productRange: "库存地点 B-01 全部商品（120项）", goodsSummary: "已选择 4 个商品 / 盘点数量 480", applyQty: 480, contact: "赵强 / 13800000002", reason: "季度全盘", remark: "" }
    ];
  }
  return inventoryPlanPageState.listRecords;
}

function getInventoryPlanGoodsPresetRows() {
  return [
    ["MAT-PDJH-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", "120", "13%", "42.48", "48.00", "5097.60", "5760.00", "662.40"],
    ["MAT-PDJH-002", "6902000000022", "物料-低值易耗品002", "24袋/箱", "箱", "80", "13%", "26.55", "30.00", "2124.00", "2400.00", "276.00"]
  ];
}

function prepareInventoryPlanFormState(mode, record) {
  inventoryPlanFormState.mode = mode;
  inventoryPlanFormState.record = record || null;
  inventoryPlanFormState.goodsRows = record ? [
    ["MAT-PDJH-001", "6902000000015", "物料-低值易耗品001", "12瓶/箱", "箱", String(record.applyQty || "120"), "13%", "42.48", "48.00"]
  ] : getInventoryPlanGoodsPresetRows();
  inventoryPlanFormState.goodsSourceLabel = record ? (record.sourceMode || "手工录入") : "手工录入";
}

function getInventoryPlanApprovalLogs() {
  if (!inventoryPlanPageState.approvalLogs) {
    inventoryPlanPageState.approvalLogs = [
      ["09:00", "PDJH20260526001", "张伟", "", "张伟", "提交申请", "", "", "李明", "待审批"],
      ["09:12", "PDJH20260526002", "张伟", "李明", "", "待审批", "", "", "", "处理中"],
      ["09:26", "PDJH20260526003", "系统", "王芳", "王芳", "审核通过", "同意", "", "", "通过"],
      ["14:15", "PDJH20260526004", "刘洋", "王芳", "王芳", "审核通过", "同意", "", "", "通过"],
      ["15:45", "PDJH20260526005", "陈明", "王芳", "王芳", "审批驳回", "", "盘点范围不完整", "", "驳回"]
    ];
  }
  return inventoryPlanPageState.approvalLogs;
}

function getInventoryPlanModalFormConfig(actionLabel) {
  if (!["新增盘点计划申请", "编辑盘点计划申请"].includes(actionLabel)) return null;
  const record = inventoryPlanFormState.record || {};
  const isEdit = actionLabel === "编辑盘点计划申请";
  return {
    title: isEdit ? "编辑盘点计划申请单" : "新增盘点计划申请单",
    sub: isEdit ? "用于演示 PC 端对草稿盘点计划申请单进行修改和再次保存。" : "用于演示 PC 端新增盘点计划申请时的字段录入和校验。",
    note: isEdit ? "当前仅草稿状态单据显示行内编辑按钮，编辑后需重新提交审批。" : "当前支持逐行维护商品明细，保存后生成草稿单据。",
    fields: [
      ["货主", record.owner || "请选择货主", record.owner || "自有货主A"],
      ["盘点仓库", record.warehouse || "请选择盘点仓库", record.warehouse || "华东1仓"],
      ["盘点库存地点", record.position || "请选择库存地点", record.position || "1000"],
      ["盘点类型", record.checkType || "请选择盘点类型", record.checkType || "全盘"],
      ["预计盘点日期", record.expectedDate || "请选择预计盘点日期", record.expectedDate || "2026-06-15"],
      ["盘点时间", record.checkTime || "请选择盘点时间", record.checkTime || "2026-05-28 08:00"],
      ["盘点范围", record.checkScope || "请选择盘点范围", record.checkScope || "大类"],
      ["品类明细", record.goodsSummary || "点击维护盘点品类明细", record.goodsSummary || "已维护 2 个品类", "full"],
      ["商品明细", record.goodsSummary || "点击维护盘点商品与数量", record.goodsSummary || "已选择 2 个商品 / 盘点数量 200", "full"],
      ["联系人", record.contact || "请填写联系人", record.contact || "张伟 / 13900000001"],
      ["盘点原因", record.reason || "请填写盘点原因", record.reason || "月度全盘", "full"],
      ["备注", record.remark || "可填写补充说明", record.remark || "", "full"]
    ],
    required: ["货主", "盘点仓库", "盘点库存地点", "盘点类型", "预计盘点日期", "盘点时间", "商品明细"]
  };
}

function buildInventoryPlanActionCell(status, orderNo) {
  const viewButton = `<button class="table-action-button" data-inventoryplan-view-entry data-order-no="${orderNo}">查看</button>`;
  if (status === "草稿") {
    return `<div class="table-action-group">${viewButton}<button class="table-action-button primary" data-inventoryplan-edit-entry data-order-no="${orderNo}">编辑</button></div>`;
  }
  return `<div class="table-action-group">${viewButton}</div>`;
}

function buildInventoryPlanSelectCell(status, orderNo, owner) {
  const disabled = ["草稿", "待审批"].includes(status) ? "" : "disabled";
  return `<input type="checkbox" data-inventoryplan-submit-row data-order-no="${orderNo}" data-submit-status="${status}" data-submit-label="${orderNo} / ${owner}" ${disabled} />`;
}

function renderInventoryPlanListRows() {
  const headers = ["操作","勾选","计划单号","货主","盘点仓库","盘点库存地点","盘点类型","预计盘点日期","盘点时间","盘点范围","提交人","审批人","时间","申请状态","生成通知","审批意见","驳回原因"];
  return getInventoryPlanListRecords().map((record, rowIndex) => {
    const row = ["", "", record.orderNo, record.owner, record.warehouse, record.position || "", record.checkType, record.expectedDate, record.checkTime, record.checkScope || "", record.submitter, record.approver, record.time, record.submitStatus, record.generateNotice, record.approvalOpinion, record.rejectReason];
    const statusClass = record.submitStatus === "草稿" ? "gray" : record.submitStatus === "待审批" ? "orange" : record.submitStatus === "已审核通过" ? "green" : record.submitStatus === "审批驳回" ? "red" : "blue";
    const hasChildren = record.categories && record.categories.length > 0;
    const masterClass = hasChildren ? "master-row" : "master-row no-children";
    let html = `
      <tr class="table-row-clickable ${masterClass}" data-drawer="detail" data-drawer-title="盘点计划申请单详情"
          data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}"
          data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}" data-master-index="${rowIndex}">
        <td>${buildInventoryPlanActionCell(record.submitStatus, record.orderNo)}</td>
        <td>${buildInventoryPlanSelectCell(record.submitStatus, record.orderNo, record.owner)}</td>
        <td>${hasChildren ? '<span class="expand-icon"></span>' : ''}${record.orderNo}</td>
        <td>${record.owner}</td>
        <td>${record.warehouse}</td>
        <td>${record.position || ""}</td>
        <td>${record.checkType}</td>
        <td>${record.expectedDate}</td>
        <td>${record.checkTime}</td>
        <td>${record.checkScope || ""}</td>
        <td>${record.submitter}</td>
        <td>${record.approver}</td>
        <td>${record.time}</td>
        <td><span class="tag ${statusClass}">${record.submitStatus}</span></td>
        <td>${record.generateNotice}</td>
        <td>${record.approvalOpinion}</td>
        <td>${record.rejectReason}</td>
      </tr>`;
    if (hasChildren) {
      const colCount = headers.length;
      html += `
      <tr class="child-row" data-child-index="${rowIndex}">
        <td colspan="${colCount}">
          <div class="child-inner">
            <table class="child-table">
              <thead><tr><th>品类明细</th></tr></thead>
              <tbody>${record.categories.map(c => `<tr><td>${c}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </td>
      </tr>`;
    }
    return html;
  }).join("");
}

function saveInventoryPlanCreateDraft() {
  const records = getInventoryPlanListRecords();
  const seq = inventoryPlanPageState.nextOrderSequence++;
  const newRecord = {
    orderNo: `PDJH2026052600${seq}`, owner: "自有货主A", warehouse: "华东1仓",
    checkType: "全盘", position: "1000", submitStatus: "草稿", generateNotice: "未生成", submitter: "当前用户", approver: "",
    time: "2026-05-26 16:30", approvalOpinion: "", rejectReason: "",
    checkTime: "2026-05-30 08:00", expectedDate: "2026-06-28", categories: [],
    productRange: "库存地点 A-01 全部商品", goodsSummary: "已选择 2 个商品 / 盘点数量 200",
    applyQty: 200, contact: "当前用户", reason: "新增盘点", remark: ""
  };
  records.unshift(newRecord);
  return newRecord;
}

function saveInventoryPlanEditDraft() {
  // In prototype, just return success
}

function bindInventoryPlanSubmitApproveEvents() {
  const createButton = document.getElementById("inventoryPlanCreateButton");
  const openCreateTab = () => {
    inventoryPlanPageState.selectedEditRow = null;
    renderPcPage("inventoryplan", "create");
  };
  if (createButton) createButton.addEventListener("click", openCreateTab);

  document.querySelectorAll("[data-inventoryplan-edit-entry]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const orderNo = btn.dataset.orderNo;
      const record = getInventoryPlanListRecords().find(r => r.orderNo === orderNo);
      if (!record) return;
      inventoryPlanPageState.selectedEditRow = record;
      prepareInventoryPlanFormState("edit", record);
      openModal("form", "编辑盘点计划申请");
    });
  });

  document.querySelectorAll("[data-inventoryplan-view-entry]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = btn.closest("tr");
      if (row) row.click();
    });
  });

  const batchApproveBtn = document.querySelector("[data-inventoryplan-batch-approve]");
  if (batchApproveBtn) batchApproveBtn.addEventListener("click", () => {
    const checked = document.querySelectorAll("[data-inventoryplan-submit-row]:checked");
    if (checked.length === 0) { showToast("warning", "未选择", "请先勾选需要批量审批的单据。"); return; }
    showToast("success", "批量审批成功", `已审批 ${checked.length} 条盘点计划申请单。`);
  });

  const batchDeleteBtn = document.querySelector("[data-inventoryplan-batch-delete]");
  if (batchDeleteBtn) batchDeleteBtn.addEventListener("click", () => {
    const checked = document.querySelectorAll("[data-inventoryplan-submit-row]:checked");
    if (checked.length === 0) { showToast("warning", "未选择", "请先勾选需要删除的单据。"); return; }
    showToast("success", "批量删除成功", `已删除 ${checked.length} 条草稿单据。`);
  });

  // Master-detail expand/collapse — use event delegation so it works after processPcTables re-renders cells
  document.addEventListener("click", function(e) {
    const icon = e.target.closest(".expand-icon");
    if (!icon) return;
    e.stopPropagation();
    const masterRow = icon.closest("tr");
    if (!masterRow) return;
    const idx = masterRow.dataset.masterIndex;
    if (!idx) return;
    const childRow = document.querySelector(`[data-child-index="${idx}"]`);
    if (!childRow) return;
    const isExpanded = childRow.classList.contains("expanded");
    if (isExpanded) {
      childRow.classList.remove("expanded");
      masterRow.classList.remove("expanded");
    } else {
      childRow.classList.add("expanded");
      masterRow.classList.add("expanded");
    }
  });
}

function renderInventoryPlanApprovalTab() {
  const headers = ["审批时间", "计划单号", "提交人", "审批人", "处理人", "审批动作", "审批意见", "驳回原因", "下一处理人", "结果"];
  const logs = getInventoryPlanApprovalLogs();
  return `<table class="data-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${logs.map(log => `<tr>${log.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

// ========== 盘点计划申请单 新增页面 ==========

function renderInventoryPlanCreateTab() {
  prepareInventoryPlanFormState("create");
  const goodsRows = inventoryPlanFormState.goodsRows;
  const orderNo = "PDJH" + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, "0") + String(new Date().getDate()).padStart(2, "0") + String(inventoryPlanPageState.nextOrderSequence).padStart(3, "0");
  const today = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0");

  return `
    <div class="section-card">
      <div class="section-head"><h3>新增盘点计划申请单</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button><button class="ghost-button" id="inventoryPlanCreateSaveButton">保存草稿</button><button class="primary-button" id="inventoryPlanCreateSubmitButton">提交审批</button></div></div>
      <div class="pc-form-grid cols-3">
        <div class="pc-form-field" data-pc-form-label="货主" data-pc-filled-value="自有货主A">
          <div class="pc-form-label">货主 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择货主</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点仓库" data-pc-filled-value="华东1仓">
          <div class="pc-form-label">盘点仓库 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择盘点仓库</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点库存地点" data-pc-filled-value="1000">
          <div class="pc-form-label">盘点库存地点 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择库存地点</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点类型" data-pc-filled-value="全盘">
          <div class="pc-form-label">盘点类型 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择盘点类型</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="预计盘点日期" data-pc-filled-value="${today}">
          <div class="pc-form-label">预计盘点日期 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择预计盘点日期</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点时间" data-pc-filled-value="${today} 08:00">
          <div class="pc-form-label">盘点时间 <span style="color:var(--pc-brand);">*</span></div>
          <div class="pc-form-value">请选择盘点时间</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点范围" data-pc-filled-value="大类">
          <div class="pc-form-label">盘点范围</div>
          <div class="pc-form-value">请选择盘点范围</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="联系人" data-pc-filled-value="当前用户 / 13900000001">
          <div class="pc-form-label">联系人</div>
          <div class="pc-form-value">请填写联系人及电话</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="盘点原因" data-pc-filled-value="月度全盘">
          <div class="pc-form-label">盘点原因</div>
          <div class="pc-form-value">请填写盘点原因</div>
        </div>
        <div class="pc-form-field" data-pc-form-label="备注" data-pc-filled-value="">
          <div class="pc-form-label">备注</div>
          <div class="pc-form-value">可填写补充说明</div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>品类明细</h3><div class="action-row"><button class="ghost-button" id="inventoryPlanAddCategoryButton">添加品类</button></div></div>
      <div class="drawer-table-wrap">
        <table>
          <thead>
            <tr><th><input type="checkbox" id="inventoryPlanCategorySelectAll" /></th><th>品类名称</th><th>品类编码</th><th>备注</th></tr>
          </thead>
          <tbody id="inventoryPlanCategoryTbody">
            <tr><td><input type="checkbox" class="inventoryPlanCategoryCheckbox" /></td><td>低值易耗品</td><td>CAT-001</td><td>全品类盘点</td></tr>
            <tr><td><input type="checkbox" class="inventoryPlanCategoryCheckbox" /></td><td>清洁剂</td><td>CAT-002</td><td></td></tr>
            <tr><td><input type="checkbox" class="inventoryPlanCategoryCheckbox" /></td><td>防护用品</td><td>CAT-003</td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

function bindInventoryPlanFormPageEvents() {
  var saveBtn = document.getElementById("inventoryPlanCreateSaveButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", function() {
      saveInventoryPlanCreateDraft();
      renderPcPage("inventoryplan", "list");
      showToast("success", "保存成功", "盘点计划申请草稿已保存。");
    });
  }

  var submitBtn = document.getElementById("inventoryPlanCreateSubmitButton");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      if (!validatePcForm("新增盘点计划申请")) return;
      var record = saveInventoryPlanCreateDraft();
      if (record) {
        record.submitStatus = "待审批";
        record.time = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0") + " " + String(new Date().getHours()).padStart(2, "0") + ":" + String(new Date().getMinutes()).padStart(2, "0");
      }
      renderPcPage("inventoryplan", "list");
      showToast("success", "提交成功", "盘点计划申请已提交审批。");
    });
  }

  var addCategoryBtn = document.getElementById("inventoryPlanAddCategoryButton");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", function() {
      var tbody = document.getElementById("inventoryPlanCategoryTbody");
      if (!tbody) return;
      var inputStyle = 'style="width:100%;border:1px solid #e2e8f0;border-radius:4px;padding:4px 6px;font-size:13px;box-sizing:border-box;background:#fffbe6;"';
      var tr = document.createElement("tr");
      tr.innerHTML = '<td><input type="checkbox" class="inventoryPlanCategoryCheckbox" /></td>' +
        '<td><input type="text" placeholder="品类名称" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="品类编码" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="备注" ' + inputStyle + ' /></td>';
      tbody.appendChild(tr);
    });
  }

  var categorySelectAll = document.getElementById("inventoryPlanCategorySelectAll");
  if (categorySelectAll) {
    categorySelectAll.addEventListener("change", function() {
      var checked = this.checked;
      document.querySelectorAll(".inventoryPlanCategoryCheckbox").forEach(function(cb) { cb.checked = checked; });
    });
  }
}

// ========== End 盘点计划申请单 Functions ==========

// ========== 盘点结果单 主从表 Functions ==========

// 主表列：单据信息 + 商品信息（参考库存台账总账库存）
const inventoryCheckMasterHeaders = ['盘点单号', '计划单号', '通知单号', '仓库', '库存地点', '货主', '商品编码', '条形码', '商品名称', '规格', '单位', '账面数量', '实盘数量', '差异数量', '差异类型', '未税金额', '含税金额', '税额', '盘点结果', '确认状态'];

// 主表数据：每行 = 一个盘点结果中的单个商品
const inventoryCheckMasterData = [
  { orderNo: 'PD20260526001', planNo: 'PDJH20260526001', noticeNo: 'PDTZ20260526001', warehouse: '华东1仓', position: '1000', owner: '自有货主A',
    productCode: 'MAT-PD-001', barcode: '6902000000015', productName: '物料-低值易耗品001', spec: '12瓶/箱', unit: '箱',
    bookQty: '120', actualQty: '118', diffQty: '-2', diffType: '盘亏', untaxedAmt: '-84.96', taxedAmt: '-96.00', taxAmt: '-11.04', checkResult: '有差异', confirmStatus: '待确认', statusTag: 'orange',
    batches: [
      ['BATCH20260526A', '2026-05-01', '2027-05-01', '120', '118', '-2', '盘亏', '13%', '42.48', '48.00', '-84.96', '-96.00', '-11.04'],
      ['BATCH20260526A2', '2026-05-15', '2027-05-15', '0', '0', '0', '无差异', '13%', '42.48', '48.00', '0.00', '0.00', '0.00']
    ]
  },
  { orderNo: 'PD20260526001', planNo: 'PDJH20260526001', noticeNo: 'PDTZ20260526001', warehouse: '华东1仓', position: '1000', owner: '自有货主A',
    productCode: 'MAT-PD-002', barcode: '6902000000022', productName: '物料-低值易耗品002', spec: '24袋/箱', unit: '箱',
    bookQty: '100', actualQty: '103', diffQty: '+3', diffType: '盘盈', untaxedAmt: '79.65', taxedAmt: '90.00', taxAmt: '10.35', checkResult: '有差异', confirmStatus: '待确认', statusTag: 'orange',
    batches: [
      ['BATCH20260526B', '2026-04-20', '2027-04-20', '100', '103', '+3', '盘盈', '13%', '26.55', '30.00', '79.65', '90.00', '10.35']
    ]
  },
  { orderNo: 'PD20260526001', planNo: 'PDJH20260526001', noticeNo: 'PDTZ20260526001', warehouse: '华东1仓', position: '1000', owner: '自有货主A',
    productCode: 'MAT-PD-003', barcode: '6903000000013', productName: '低值易耗品-清洁剂', spec: '12瓶/箱', unit: '箱',
    bookQty: '75', actualQty: '72', diffQty: '-3', diffType: '盘亏', untaxedAmt: '-127.44', taxedAmt: '-144.00', taxAmt: '-16.56', checkResult: '有差异', confirmStatus: '待确认', statusTag: 'orange',
    batches: [
      ['BATCH20260508A', '2026-03-15', '2027-03-15', '75', '72', '-3', '盘亏', '13%', '42.48', '48.00', '-127.44', '-144.00', '-16.56']
    ]
  },
  { orderNo: 'PD20260526003', planNo: 'PDJH20260526003', noticeNo: 'PDTZ20260526003', warehouse: '华南2仓', position: '1001', owner: '外部货主B',
    productCode: 'MAT-PD-004', barcode: '6902000000039', productName: '防护手套-无粉', spec: '100只/箱', unit: '箱',
    bookQty: '60', actualQty: '58', diffQty: '-2', diffType: '盘亏', untaxedAmt: '-123.90', taxedAmt: '-140.00', taxAmt: '-16.10', checkResult: '有差异', confirmStatus: '已确认', statusTag: 'green',
    batches: [
      ['BATCH20260510A', '2026-05-10', '2028-05-10', '60', '58', '-2', '盘亏', '13%', '61.95', '70.00', '-123.90', '-140.00', '-16.10']
    ]
  },
  { orderNo: 'PD20260526003', planNo: 'PDJH20260526003', noticeNo: 'PDTZ20260526003', warehouse: '华南2仓', position: '1001', owner: '外部货主B',
    productCode: 'MAT-PD-005', barcode: '6902000000046', productName: '消毒液-500ml', spec: '24瓶/箱', unit: '箱',
    bookQty: '40', actualQty: '42', diffQty: '+2', diffType: '盘盈', untaxedAmt: '35.40', taxedAmt: '40.00', taxAmt: '4.60', checkResult: '有差异', confirmStatus: '已确认', statusTag: 'green',
    batches: [
      ['BATCH20260510B', '2026-05-10', '2027-05-10', '40', '42', '+2', '盘盈', '13%', '17.70', '20.00', '35.40', '40.00', '4.60']
    ]
  },
  { orderNo: 'PD20260526005', planNo: 'PDJH20260526004', noticeNo: 'PDTZ20260526004', warehouse: '华北3仓', position: '1000', owner: '自有货主C',
    productCode: 'MAT-PD-006', barcode: '6902000000053', productName: '低值易耗品-办公用品', spec: '50个/箱', unit: '箱',
    bookQty: '28', actualQty: '28', diffQty: '0', diffType: '无差异', untaxedAmt: '0.00', taxedAmt: '0.00', taxAmt: '0.00', checkResult: '无差异', confirmStatus: '已生成损溢单', statusTag: 'blue',
    batches: [
      ['BATCH20260512A', '2026-05-12', '2027-05-12', '28', '28', '0', '无差异', '13%', '8.85', '10.00', '0.00', '0.00', '0.00']
    ]
  }
];

// 从表列：批次明细（参考库存台账批次库存）
const inventoryCheckBatchHeaders = ['生产批次', '生产日期', '失效日期', '账面数量', '实盘数量', '差异数量', '差异类型', '税率', '未税进价', '含税进价', '未税金额', '含税金额', '税额'];

function renderInventoryCheckListRows() {
  return inventoryCheckMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="ic-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.orderNo + '</td>' +
      '<td>' + record.planNo + '</td>' +
      '<td>' + record.noticeNo + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.position + '</td>' +
      '<td>' + record.owner + '</td>' +
      '<td>' + record.productCode + '</td>' +
      '<td>' + record.barcode + '</td>' +
      '<td>' + record.productName + '</td>' +
      '<td>' + record.spec + '</td>' +
      '<td>' + record.unit + '</td>' +
      '<td>' + record.bookQty + '</td>' +
      '<td>' + record.actualQty + '</td>' +
      '<td>' + record.diffQty + '</td>' +
      '<td>' + record.diffType + '</td>' +
      '<td>' + record.untaxedAmt + '</td>' +
      '<td>' + record.taxedAmt + '</td>' +
      '<td>' + record.taxAmt + '</td>' +
      '<td>' + record.checkResult + '</td>' +
      '<td><span class="tag ' + record.statusTag + '">' + record.confirmStatus + '</span></td>' +
      '</tr>';
    var colCount = inventoryCheckMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="ic-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + inventoryCheckBatchHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.batches.map(function(batch) {
        return '<tr>' + batch.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 盘点结果单 Functions ==========

// ========== 配送发货申请 主从表 Functions ==========

const deliveryMasterHeaders = ['单据号', '配送申请单号', '来源要货单', '客户', '货主', '发货仓', '库存地点', '是否需要运输服务', '运输单号', '当前节点'];

const deliveryDetailHeaders = ['商品编码', '条形码', '商品名称', '规格', '单位', '库存地点', '生产批号', '生产日期', '保质日期', '税率', '未税进价', '含税进价', '申请数量', '拣货数量', '发运数量', '签收数量', '未税金额', '含税金额', '税额'];

const deliveryMasterData = [
  {
    orderNo: 'PS20260526001', deliveryApplyNo: 'DZT20260526001', demandNo: 'YH20260526001',
    customer: '内部客户-华东分部', owner: '自有货主A', warehouse: '华东1仓', position: '1000',
    needTransport: '是', transportNo: 'YD9087612', currentNode: 'TMS已接单', statusTag: 'blue',
    details: [
      ['MAT-DEL-001', '6907000000016', '物料-商品001', '12瓶/箱', '箱', '1000', 'BATCH20260518A', '2026-05-18', '2027-05-18', '13%', '42.48', '48.00', '100', '100', '100', '0', '4248.00', '4800.00', '552.00'],
      ['MAT-DEL-002', '6907000000023', '物料-商品002', '24袋/箱', '箱', '1000', 'BATCH20260520B', '2026-05-20', '2027-05-20', '13%', '26.55', '30.00', '160', '160', '160', '0', '4248.00', '4800.00', '552.00']
    ]
  },
  {
    orderNo: 'PS20260526002', deliveryApplyNo: 'DZT20260526002', demandNo: 'YH20260526002',
    customer: '外部客户-华南分部', owner: '外部货主B', warehouse: '华南2仓', position: '1001',
    needTransport: '是', transportNo: 'YD9087613', currentNode: 'WMS拣货中', statusTag: 'orange',
    details: [
      ['MAT-DEL-003', '6907000000030', '防护手套-无粉', '100只/箱', '箱', '1001', 'BATCH20260512C', '2026-05-12', '2028-05-12', '13%', '61.95', '70.00', '80', '60', '0', '0', '3717.00', '4200.00', '483.00'],
      ['MAT-DEL-004', '6907000000047', '消毒液-500ml', '24瓶/箱', '箱', '1001', 'BATCH20260514D', '2026-05-14', '2027-05-14', '13%', '17.70', '20.00', '120', '80', '0', '0', '1416.00', '1600.00', '184.00']
    ]
  },
  {
    orderNo: 'PS20260526003', deliveryApplyNo: 'DZT20260526003', demandNo: 'YH20260526003',
    customer: '内部客户-华北分部', owner: '自有货主A', warehouse: '华北3仓', position: '1000',
    needTransport: '否', transportNo: '—', currentNode: '已签收', statusTag: 'green',
    details: [
      ['MAT-DEL-005', '6907000000054', '低值易耗品-办公用品', '50个/箱', '箱', '1000', 'BATCH20260516E', '2026-05-16', '2027-05-16', '13%', '8.85', '10.00', '50', '50', '50', '50', '442.50', '500.00', '57.50']
    ]
  }
];

function renderDeliveryListRows() {
  return deliveryMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="del-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.orderNo + '</td>' +
      '<td>' + record.deliveryApplyNo + '</td>' +
      '<td>' + record.demandNo + '</td>' +
      '<td>' + record.customer + '</td>' +
      '<td>' + record.owner + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.position + '</td>' +
      '<td>' + record.needTransport + '</td>' +
      '<td>' + record.transportNo + '</td>' +
      '<td><span class="tag ' + record.statusTag + '">' + record.currentNode + '</span></td>' +
      '</tr>';
    var colCount = deliveryMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="del-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + deliveryDetailHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.details.map(function(detail) {
        return '<tr>' + detail.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 配送发货申请 主从表 Functions ==========

// ========== 配送单 主从表 Functions ==========

const deliveryOrderMasterHeaders = ['配送单号', '要货单号', '配送申请单号', '客户', '货主', '仓库', '库存地点', '出库数量', '签收数量', '库存状态', 'BMS状态'];

const deliveryOrderDetailHeaders = ['商品编码', '条形码', '商品名称', '规格', '单位', '库存地点', '生产批号', '生产日期', '保质日期', '拣货数量', '出库数量', '签收数量', '税率', '未税进价', '含税进价', '未税金额', '含税金额', '税额'];

const deliveryOrderMasterData = [
  {
    orderNo: 'PSDD20260526001', demandNo: 'YH20260526001', deliveryApplyNo: 'DZT20260526001',
    customer: '内部客户-华东分部', owner: '自有货主A', warehouse: '华东1仓', position: '1000',
    outQty: '260', signQty: '260', inventoryStatus: '已扣减', inventoryTag: 'green', bmsStatus: '已回执', bmsTag: 'green',
    details: [
      ['MAT-PS-001', '6907000000016', '物料-商品001', '12瓶/箱', '箱', '1000', 'BATCH20260518A', '2026-05-18', '2027-05-18', '100', '100', '100', '13%', '42.48', '48.00', '4248.00', '4800.00', '552.00'],
      ['MAT-PS-002', '6907000000023', '物料-商品002', '24袋/箱', '箱', '1000', 'BATCH20260520B', '2026-05-20', '2027-05-20', '160', '160', '160', '13%', '26.55', '30.00', '4248.00', '4800.00', '552.00']
    ]
  },
  {
    orderNo: 'PSDD20260526004', demandNo: 'YH20260526002', deliveryApplyNo: 'DZT20260526004',
    customer: '外部客户-门店联盟', owner: '外部货主B', warehouse: '华南2仓', position: '1001',
    outQty: '160', signQty: '158', inventoryStatus: '已扣减', inventoryTag: 'green', bmsStatus: '待回执', bmsTag: 'orange',
    details: [
      ['MAT-PS-003', '6907000000030', '防护手套-无粉', '100只/箱', '箱', '1001', 'BATCH20260512C', '2026-05-12', '2028-05-12', '80', '80', '79', '13%', '61.95', '70.00', '4956.00', '5600.00', '644.00'],
      ['MAT-PS-004', '6907000000047', '消毒液-500ml', '24瓶/箱', '箱', '1001', 'BATCH20260514D', '2026-05-14', '2027-05-14', '80', '80', '79', '13%', '17.70', '20.00', '1416.00', '1600.00', '184.00']
    ]
  },
  {
    orderNo: 'PSDD20260526007', demandNo: 'YH20260526003', deliveryApplyNo: 'DZT20260526003',
    customer: '内部客户-华北分部', owner: '自有货主A', warehouse: '华北3仓', position: '1000',
    outQty: '50', signQty: '50', inventoryStatus: '已扣减', inventoryTag: 'green', bmsStatus: '已回执', bmsTag: 'green',
    details: [
      ['MAT-PS-005', '6907000000054', '低值易耗品-办公用品', '50个/箱', '箱', '1000', 'BATCH20260516E', '2026-05-16', '2027-05-16', '50', '50', '50', '13%', '8.85', '10.00', '442.50', '500.00', '57.50']
    ]
  }
];

function renderDeliveryOrderListRows() {
  return deliveryOrderMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="do-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.orderNo + '</td>' +
      '<td>' + record.demandNo + '</td>' +
      '<td>' + record.deliveryApplyNo + '</td>' +
      '<td>' + record.customer + '</td>' +
      '<td>' + record.owner + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.position + '</td>' +
      '<td>' + record.outQty + '</td>' +
      '<td>' + record.signQty + '</td>' +
      '<td><span class="tag ' + record.inventoryTag + '">' + record.inventoryStatus + '</span></td>' +
      '<td><span class="tag ' + record.bmsTag + '">' + record.bmsStatus + '</span></td>' +
      '</tr>';
    var colCount = deliveryOrderMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="do-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + deliveryOrderDetailHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.details.map(function(detail) {
        return '<tr>' + detail.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 配送单 主从表 Functions ==========

// ========== 差错单 主从表 Functions ==========

const errorOrderMasterHeaders = ['差错单号', '关联配送单', '客户', '货主', '发货仓库', '差错类型', '差错总数', '差错状态', '发现日期'];

const errorOrderDetailHeaders = ['商品编码', '商品名称', '规格', '单位', '发货数量', '签收数量', '差异数量', '差异类型', '处理方式', '处理状态'];

const errorOrderMasterData = [
  {
    orderNo: 'CC20260526001', deliveryNo: 'PS20260526001', customer: '内部客户-华东分部',
    owner: '自有货主A', warehouse: '华东1仓', errorType: '数量差异',
    errorCount: '7', status: '处理中', statusTag: 'blue',
    details: [
      ['MAT-DEL-001', '物料-商品001', '12瓶/箱', '箱', '100', '98', '-2', '短少', '补发', '处理中'],
      ['MAT-DEL-002', '物料-商品002', '24袋/箱', '箱', '160', '155', '-5', '短少', '补发', '处理中']
    ]
  },
  {
    orderNo: 'CC20260526002', deliveryNo: 'PS20260526002', customer: '外部客户-华南分部',
    owner: '外部货主B', warehouse: '华南2仓', errorType: '数量差异',
    errorCount: '15', status: '已确认', statusTag: 'orange',
    details: [
      ['MAT-DEL-003', '防护手套-无粉', '100只/箱', '箱', '80', '75', '-5', '短少', '扣减结算', '已确认'],
      ['MAT-DEL-004', '消毒液-500ml', '24瓶/箱', '箱', '120', '110', '-10', '短少', '补发', '已确认']
    ]
  },
  {
    orderNo: 'CC20260526003', deliveryNo: 'PS20260526003', customer: '内部客户-华北分部',
    owner: '自有货主A', warehouse: '华北3仓', errorType: '数量差异',
    errorCount: '3', status: '已处理', statusTag: 'green',
    details: [
      ['MAT-DEL-005', '低值易耗品-办公用品', '50个/箱', '箱', '50', '47', '-3', '短少', '补发完成', '已处理']
    ]
  },
  {
    orderNo: 'CC20260526004', deliveryNo: 'PS20260526001', customer: '内部客户-华东分部',
    owner: '自有货主A', warehouse: '华东1仓', errorType: '商品差错',
    errorCount: '1', status: '待确认', statusTag: 'orange',
    details: [
      ['MAT-DEL-006', '清洁剂-500ml', '12瓶/箱', '箱', '50', '50', '0', '错发商品', '换货', '待确认']
    ]
  }
];

function renderErrorOrderListRows() {
  return errorOrderMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="eo-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.orderNo + '</td>' +
      '<td>' + record.deliveryNo + '</td>' +
      '<td>' + record.customer + '</td>' +
      '<td>' + record.owner + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.errorType + '</td>' +
      '<td>' + record.errorCount + '</td>' +
      '<td><span class="tag ' + record.statusTag + '">' + record.status + '</span></td>' +
      '<td>' + '2026-05-26' + '</td>' +
      '</tr>';
    var colCount = errorOrderMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="eo-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + errorOrderDetailHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.details.map(function(detail) {
        return '<tr>' + detail.map(function(cell, ci) {
          var style = '';
          if (ci === 6 && cell.indexOf('-') === 0) style = ' style="color:#dc2626;font-weight:500;"';
          if (ci === 6 && cell === '0') style = ' style="color:#d97706;font-weight:500;"';
          return '<td' + style + '>' + cell + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 差错单 主从表 Functions ==========

// ========== 运输服务申请单 主从表 Functions ==========

const transportServiceMasterHeaders = ['申请单号', '配送申请单号', '来源要货单', '客户', '货主', '发货仓', '收货地址', '要求到货日期', '运输方式', '承运商', '运输状态'];

const transportServiceDetailHeaders = ['商品编码', '商品名称', '规格', '单位', '申请数量', '重量(kg)', '体积(m³)', '温控要求', '备注'];

const transportServiceMasterData = [
  {
    applyNo: 'YS20260526001', deliveryApplyNo: 'DZT20260526001', demandNo: 'YH20260526001',
    customer: '内部客户-华东分部', owner: '自有货主A', warehouse: '华东1仓',
    address: '上海市浦东新区张江路100号', arriveDate: '2026-05-28',
    transportMode: '公路运输', carrier: '顺捷物流', status: '运输中', statusTag: 'blue',
    details: [
      ['MAT-TS-001', '物料-商品001', '12瓶/箱', '箱', '100', '480', '1.2', '常温', '—'],
      ['MAT-TS-002', '物料-商品002', '24袋/箱', '箱', '160', '320', '0.8', '常温', '—']
    ]
  },
  {
    applyNo: 'YS20260526002', deliveryApplyNo: 'DZT20260526002', demandNo: 'YH20260526002',
    customer: '外部客户-华南分部', owner: '外部货主B', warehouse: '华南2仓',
    address: '广州市天河区天河路200号', arriveDate: '2026-05-30',
    transportMode: '公路运输', carrier: '顺丰速运', status: '待发运', statusTag: 'orange',
    details: [
      ['MAT-TS-003', '防护手套-无粉', '100只/箱', '箱', '80', '160', '0.6', '常温', '—'],
      ['MAT-TS-004', '消毒液-500ml', '24瓶/箱', '箱', '120', '240', '0.4', '阴凉', '注意防潮']
    ]
  },
  {
    applyNo: 'YS20260526003', deliveryApplyNo: '—', demandNo: '—',
    customer: '内部客户-华北分部', owner: '自有货主C', warehouse: '华北3仓',
    address: '北京市朝阳区建国路50号', arriveDate: '2026-06-02',
    transportMode: '自提', carrier: '—', status: '已完成', statusTag: 'green',
    details: [
      ['MAT-TS-005', '低值易耗品-办公用品', '50个/箱', '箱', '50', '100', '0.3', '常温', '客户自提']
    ]
  }
];

function renderTransportServiceListRows() {
  return transportServiceMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="ts-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.applyNo + '</td>' +
      '<td>' + record.deliveryApplyNo + '</td>' +
      '<td>' + record.demandNo + '</td>' +
      '<td>' + record.customer + '</td>' +
      '<td>' + record.owner + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.address + '</td>' +
      '<td>' + record.arriveDate + '</td>' +
      '<td>' + record.transportMode + '</td>' +
      '<td>' + record.carrier + '</td>' +
      '<td><span class="tag ' + record.statusTag + '">' + record.status + '</span></td>' +
      '</tr>';
    var colCount = transportServiceMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="ts-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + transportServiceDetailHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.details.map(function(detail) {
        return '<tr>' + detail.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 运输服务申请单 主从表 Functions ==========

// ========== 客户档案 主从表 Functions ==========

const customerMasterHeaders = ['客户编码', '客户名称', '客户类型', '所属区域', '默认收货仓', '联系人', '联系电话', '状态'];

const customerDetailHeaders = ['地点编码', '收货地点名称', '所属区域', '详细地址', '联系人', '联系电话', '默认地点', '状态'];

const customerMasterData = [
  {
    code: 'CUST001', name: '内部客户-华东分部', type: '内部客户', region: '华东',
    warehouse: '华东1仓', contact: '张三', phone: '13900000001', status: '启用', statusTag: 'green',
    locations: [
      ['ADDR001', '浦东办公点', '上海浦东', '上海市浦东新区XX路18号1楼收货区', '张三', '13900000001', '是', '启用'],
      ['ADDR002', '临港仓配点', '上海临港', '上海市临港新片区XX大道66号月台2', '李婷', '13900000011', '否', '已配置']
    ]
  },
  {
    code: 'CUST002', name: '外部客户-门店联盟', type: '外部客户', region: '华南',
    warehouse: '华南2仓', contact: '陈华', phone: '13900000002', status: '启用', statusTag: 'green',
    locations: [
      ['ADDR003', '天河配送门店', '广州天河', '广州市天河区XX大道88号后场收货口', '陈华', '13900000002', '是', '启用'],
      ['ADDR004', '海珠直营网点', '广州海珠', '广州市海珠区XX路168号门店仓侧门', '赵敏', '13900000012', '否', '启用']
    ]
  },
  {
    code: 'CUST003', name: '内部客户-区域共享仓', type: '内部客户', region: '华北',
    warehouse: '华北3仓', contact: '王雪', phone: '13900000003', status: '已配置', statusTag: 'blue',
    locations: [
      ['ADDR005', '大兴配送点', '北京大兴', '北京市大兴区XX路300号月台A', '王雪', '13900000003', '是', '启用']
    ]
  }
];

function renderCustomerListRows() {
  return customerMasterData.map(function(record, rowIndex) {
    var html = '<tr class="table-row-clickable master-row" data-master-index="cust-' + rowIndex + '">' +
      '<td><span class="expand-icon"></span>' + record.code + '</td>' +
      '<td>' + record.name + '</td>' +
      '<td>' + record.type + '</td>' +
      '<td>' + record.region + '</td>' +
      '<td>' + record.warehouse + '</td>' +
      '<td>' + record.contact + '</td>' +
      '<td>' + record.phone + '</td>' +
      '<td><span class="tag ' + record.statusTag + '">' + record.status + '</span></td>' +
      '</tr>';
    var colCount = customerMasterHeaders.length;
    html += '<tr class="child-row" data-child-index="cust-' + rowIndex + '">' +
      '<td colspan="' + colCount + '">' +
      '<div class="child-inner">' +
      '<table class="child-table">' +
      '<thead><tr>' + customerDetailHeaders.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + record.locations.map(function(loc) {
        return '<tr>' + loc.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return html;
  }).join('');
}

// ========== End 客户档案 主从表 Functions ==========

function bindQualityReportEvents() {
  var queryBtn = document.getElementById("qualityReportPaperQueryBtn");
  if (queryBtn) {
    queryBtn.addEventListener("click", function() {
      var resultDiv = document.getElementById("qualityReportPaperResult");
      if (resultDiv) {
        resultDiv.style.display = resultDiv.style.display === "none" ? "block" : "none";
      }
    });
  }
}

// 质检报告报告编号扫描件预览
var qrReportData = {
  "ZJBG20260526001": { owner: "自有货主A", warehouse: "华东1仓", product: "物料-低值易耗品001", batch: "BATCH20260526A", supplier: "供应商A-华东物料", type: "入库质检", result: "合格", resultColor: "#16a34a", date: "2026-05-26", status: "已生效" },
  "ZJBG20260526002": { owner: "自有货主A", warehouse: "华东1仓", product: "物料-低值易耗品002", batch: "BATCH20260526B", supplier: "供应商A-华东物料", type: "入库质检", result: "合格", resultColor: "#16a34a", date: "2026-05-26", status: "已生效" },
  "ZJBG20260526003": { owner: "外部货主B", warehouse: "华南2仓", product: "防护手套-无粉", batch: "BATCH20260510A", supplier: "供应商B-华南日化", type: "入库质检", result: "让步接收", resultColor: "#d97706", date: "2026-05-10", status: "已生效" },
  "ZJBG20260526004": { owner: "自有货主A", warehouse: "华北3仓", product: "低值易耗品-清洁剂", batch: "BATCH20260508A", supplier: "供应商A-华东物料", type: "定期送检", result: "合格", resultColor: "#16a34a", date: "2026-05-08", status: "已生效" },
  "ZJBG20260526005": { owner: "自有货主C", warehouse: "华北3仓", product: "低值易耗品-办公用品", batch: "BATCH20260512A", supplier: "供应商C-华北食品", type: "入库质检", result: "不合格", resultColor: "#dc2626", date: "2026-05-12", status: "已作废" }
};

function showReportScanPreview(el) {
  var reportId = el.getAttribute("data-report-id");
  var modal = document.getElementById("reportScanModal");
  var idSpan = document.getElementById("reportScanModalId");
  var summaryDiv = document.getElementById("reportScanSummary");
  if (!modal) return;
  idSpan.textContent = reportId || "";
  var data = qrReportData[reportId];
  if (data && summaryDiv) {
    summaryDiv.innerHTML =
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">货主：</span>' + data.owner + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">仓库：</span>' + data.warehouse + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">商品：</span>' + data.product + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">批号：</span>' + data.batch + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">供应商：</span>' + data.supplier + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">类型：</span>' + data.type + '</div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">结论：</span><span style="color:' + data.resultColor + ';font-weight:500;">' + data.result + '</span></div>' +
      '<div style="margin-bottom:4px;"><span style="color:#64748b;">日期：</span>' + data.date + '</div>' +
      '<div><span style="color:#64748b;">状态：</span>' + data.status + '</div>';
  }
  modal.style.display = "flex";
}

function closeReportScanPreview() {
  var modal = document.getElementById("reportScanModal");
  if (modal) modal.style.display = "none";
}

const ownershipApplyPageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 6,
  approvalLogs: null,
  nextLogMinute: 18
};

const storeOrderCyclePageState = {
  selectedEditRow: null,
  listRecords: null,
  nextOrderSequence: 6
};

const pcAutoListPageKeys = new Set([
  "demand",
  "newproduct",
  "inbound",
  "inboundnotice",
  "purchasein",
  "returnapply",
  "returnnotice",
  "purchasereturn",
  "qualityreport",
  "delivery",
  "deliveryorder",
  "transportservice",
  "errororder",
  "returnapplyin",
  "returnnoticein",
  "return",
  "transfer",
  "loss",
  "positionadjust",
  "inventoryplan",
  "inventorynotify",
  "inventorycheck",
  "ownershipapply",
  "ownershipnotice",
  "ownership",
  "customer",
  "storeordercycle"
]);

function resolvePcTabConfig(key) {
  const config = pcTabConfigs[key] || buildPcDefaultTabConfig(key);
  if (config.listHeaders?.length || !pcAutoListPageKeys.has(key)) return config;

  const detailFields = config.detailFields || [];
  const detailHeaders = config.detailHeaders || [];
  const fieldLabels = detailFields.map(([label]) => label);
  const fieldValues = detailFields.map(([, value]) => value);
  const preferredFilterHeaders = [
    "商品编码",
    "条形码",
    "商品名称",
    "规格",
    "单位",
    "生产批号",
    "生产日期",
    "保质日期",
    "税率",
    "结果",
    "状态",
    "来源系统",
    "客户",
    "货主",
    "仓库"
  ];

  return {
    ...config,
    listFilters: [
      ...new Set([
        ...fieldLabels,
        ...detailHeaders.filter((header) => preferredFilterHeaders.includes(header)),
        "日期范围"
      ])
    ],
    listHeaders: [...fieldLabels, ...detailHeaders],
    listRows: (config.detailRows || []).map((row) => [...fieldValues, ...row])
  };
}

function getNewProductEditState() {
  const selectedRow = newProductPageState.selectedEditRow || {
    orderNo: "XP20260526005",
    owner: "外部货主B",
    submitter: "外部货主B",
    approver: "-",
    productCode: "待生成",
    barcode: "6923000000025",
    productName: "新品-医用手套",
    spec: "50盒/箱",
    unit: "箱",
    category: "防护用品",
    brand: "护安",
    model: "HA-GLOVE-50",
    temperature: "常温",
    packQty: "50",
    recordStatus: "草稿",
    approveStatus: "待提交",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    writeBackStatus: "待写入",
    attachments: "资质证照/图片",
    time: "2026-05-26 10:46"
  };

  return {
    ...selectedRow,
    editMode: selectedRow.recordStatus === "草稿" ? "页面式修改" : "只读查看"
  };
}

function getNewProductListRecords() {
  if (newProductPageState.listRecords) {
    return newProductPageState.listRecords;
  }

  newProductPageState.listRecords = [
    {
      rowId: "np-row-1",
      submitStatus: "草稿",
      orderNo: "XP20260526007",
      owner: "外部货主B",
      submitter: "外部货主B",
      approver: "-",
      productCode: "待生成",
      barcode: "6923000000025",
      productName: "新品-医用手套",
      spec: "50盒/箱",
      unit: "箱",
      category: "防护用品",
      brand: "护安",
      model: "HA-GLOVE-50",
      temperature: "常温",
      packQty: "50",
      recordStatus: "草稿",
      approveStatus: "待提交",
      approveComment: "-",
      rejectReason: "-",
      nextApprover: "待提交",
      writeBackStatus: "待写入",
      attachments: "资质证照/图片",
      time: "2026-05-26 09:06"
    },
    {
      rowId: "np-row-2",
      submitStatus: "草稿",
      orderNo: "XP20260526007",
      owner: "外部货主B",
      submitter: "外部货主B",
      approver: "-",
      productCode: "待生成",
      barcode: "6923000000049",
      productName: "新品-消毒湿巾",
      spec: "36包/箱",
      unit: "箱",
      category: "清洁消杀",
      brand: "安洁",
      model: "AJ-WIPE-36",
      temperature: "常温",
      packQty: "36",
      recordStatus: "草稿",
      approveStatus: "待提交",
      approveComment: "-",
      rejectReason: "-",
      nextApprover: "待提交",
      writeBackStatus: "待写入",
      attachments: "主图/检测报告",
      time: "2026-05-26 09:10"
    },
    {
      rowId: "np-row-3",
      submitStatus: "待审批",
      orderNo: "XP20260526005",
      owner: "外部货主C",
      submitter: "外部货主C",
      approver: "待审批",
      productCode: "MAT-NEW-003",
      barcode: "6923000000032",
      productName: "新品-周转箱",
      spec: "12个/箱",
      unit: "箱",
      category: "包材辅料",
      brand: "包易达",
      model: "BYD-BOX-12",
      temperature: "常温",
      packQty: "12",
      recordStatus: "已提交",
      approveStatus: "待审批",
      approveComment: "待审批",
      rejectReason: "-",
      nextApprover: "商品主数据专员",
      writeBackStatus: "待写入",
      attachments: "合格证/图片",
      time: "2026-05-26 10:46"
    },
    {
      rowId: "np-row-4",
      submitStatus: "已审核通过",
      orderNo: "XP20260526003",
      owner: "外部货主B",
      submitter: "外部货主B",
      approver: "审批人",
      productCode: "MAT-NEW-001",
      barcode: "6923000000018",
      productName: "新品-消杀喷雾",
      spec: "24瓶/箱",
      unit: "箱",
      category: "清洁消杀",
      brand: "安洁",
      model: "AJ-XP-24",
      temperature: "常温",
      packQty: "24",
      recordStatus: "已录入",
      approveStatus: "已审核通过",
      approveComment: "资料齐全，符合准入要求",
      rejectReason: "-",
      nextApprover: "系统自动写入",
      writeBackStatus: "已写入",
      attachments: "检测报告/图片",
      time: "2026-05-26 09:18"
    }
  ];

  return newProductPageState.listRecords;
}

function buildNewProductOrderNo() {
  const sequence = String(newProductPageState.nextOrderSequence || 8).padStart(3, "0");
  newProductPageState.nextOrderSequence = (newProductPageState.nextOrderSequence || 8) + 1;
  return `XP20260526${sequence}`;
}

function getNewProductApprovalLogs() {
  if (newProductPageState.approvalLogs) {
    return newProductPageState.approvalLogs;
  }

  newProductPageState.approvalLogs = [
    ["2026-05-26 09:12", "XP20260526007", "外部货主B", "-", "系统", "提交审批", "已完成基础校验，进入审批队列", "-", "商品主数据专员", "待审批"],
    ["2026-05-26 09:18", "XP20260526003", "外部货主B", "审批人", "审批人", "审批通过", "资料齐全，符合新品主数据准入要求", "-", "系统自动写入", "已审核通过"],
    ["2026-05-26 10:20", "XP20260526005", "外部货主C", "审批人", "审批人", "审批驳回", "分类映射和附件信息需补充", "缺少检测报告附件，分类映射待确认", "提单人", "已驳回"],
    ["2026-05-26 10:46", "XP20260526005", "外部货主C", "-", "外部货主C", "重新提交", "已补充分类映射和检测报告", "-", "商品主数据专员", "待审批"]
  ];
  return newProductPageState.approvalLogs;
}

function buildNewProductLogTime() {
  const minute = String(newProductPageState.nextLogMinute || 47).padStart(2, "0");
  newProductPageState.nextLogMinute = (newProductPageState.nextLogMinute || 47) + 1;
  return `2026-05-26 10:${minute}`;
}

function appendNewProductApprovalLog(orderNo, actor, action, comment, rejectReason, nextApprover, result, eventTime = "", submitter = "", approver = "") {
  getNewProductApprovalLogs().unshift([
    eventTime || buildNewProductLogTime(),
    orderNo,
    submitter || actor || "-",
    approver || "-",
    actor,
    action,
    comment || "-",
    rejectReason || "-",
    nextApprover || "-",
    result || "-"
  ]);
}

function getNewProductApprovalFilterState() {
  if (!newProductPageState.approvalFilters) {
    newProductPageState.approvalFilters = {
      orderNo: "",
      submitter: "",
      approver: "",
      actor: "",
      action: "全部",
      result: "全部"
    };
  }
  return newProductPageState.approvalFilters;
}

function getFilteredNewProductApprovalLogs() {
  const filters = getNewProductApprovalFilterState();
  return getNewProductApprovalLogs().filter(([time, orderNo, submitter, approver, actor, action, comment, rejectReason, nextApprover, result]) => {
    const matchOrderNo = !filters.orderNo || orderNo.includes(filters.orderNo);
    const matchSubmitter = !filters.submitter || submitter.includes(filters.submitter);
    const matchApprover = !filters.approver || approver.includes(filters.approver);
    const matchActor = !filters.actor || actor.includes(filters.actor);
    const matchAction = !filters.action || filters.action === "全部" || action === filters.action;
    const matchResult = !filters.result || filters.result === "全部" || result === filters.result;
    return matchOrderNo && matchSubmitter && matchApprover && matchActor && matchAction && matchResult;
  });
}

function renderNewProductApprovalTab() {
  const approvalTab = (pcTabConfigs.newproduct?.extraTabs || []).find((item) => item.key === "approval");
  const filters = getNewProductApprovalFilterState();
  return `
    <div class="section-card">
      <div class="section-head"><h3>${approvalTab?.title || "新品录入审批记录"}</h3><div class="action-row">${renderActionButton("导出明细")}</div></div>
      <div class="notice">
        <div class="title">${approvalTab?.title || "新品录入审批记录"}</div>
        <div class="desc">${approvalTab?.desc || "用于展示新品录入审批轨迹。"}</div>
      </div>
      <div class="list-filter-grid" style="margin-top:12px;">
        <input class="input" id="newProductApprovalOrderNo" placeholder="单号" value="${filters.orderNo}" />
        <input class="input" id="newProductApprovalSubmitter" placeholder="提交人" value="${filters.submitter}" />
        <input class="input" id="newProductApprovalApprover" placeholder="审批人" value="${filters.approver}" />
        <input class="input" id="newProductApprovalActor" placeholder="处理人" value="${filters.actor}" />
        <select class="input" id="newProductApprovalAction">
          <option value="全部" ${filters.action === "全部" ? "selected" : ""}>审批动作：全部</option>
          <option value="提交审批" ${filters.action === "提交审批" ? "selected" : ""}>提交审批</option>
          <option value="重新提交" ${filters.action === "重新提交" ? "selected" : ""}>重新提交</option>
          <option value="审批通过" ${filters.action === "审批通过" ? "selected" : ""}>审批通过</option>
          <option value="审批驳回" ${filters.action === "审批驳回" ? "selected" : ""}>审批驳回</option>
          <option value="删除草稿" ${filters.action === "删除草稿" ? "selected" : ""}>删除草稿</option>
        </select>
        <select class="input" id="newProductApprovalResult">
          <option value="全部" ${filters.result === "全部" ? "selected" : ""}>结果：全部</option>
          <option value="待审批" ${filters.result === "待审批" ? "selected" : ""}>待审批</option>
          <option value="已审核通过" ${filters.result === "已审核通过" ? "selected" : ""}>已审核通过</option>
          <option value="已驳回" ${filters.result === "已驳回" ? "selected" : ""}>已驳回</option>
          <option value="已删除" ${filters.result === "已删除" ? "selected" : ""}>已删除</option>
        </select>
      </div>
      <div class="action-row" style="margin-top:12px;">
        <button class="primary-button" id="newProductApprovalQueryButton">查询</button>
        <button class="ghost-button" id="newProductApprovalResetButton">重置</button>
      </div>
      <div class="notice" style="margin-top:12px;">
        <div class="title">导出口径说明</div>
        <div class="desc">导出明细与当前审批记录表头保持一致，包含审批时间、单号、提交人、审批人、处理人、审批动作、审批意见、驳回原因、下一处理人和结果。</div>
      </div>
    </div>
    ${renderPcSimpleTable("新品录入审批记录", approvalTab?.headers || [], getFilteredNewProductApprovalLogs())}
  `;
}

function renderNewProductListRows() {
  const headers = ["操作","勾选","单号","货主","提交人","审批人","时间","商品编码","条形码","商品名称","规格","单位","分类","品牌","型号","温度要求","包装数量","录入状态","审批状态","审批意见","驳回原因","下一审批人","回写状态","附件"];
  return getNewProductListRecords().map((record, rowIndex) => {
    const row = [record.submitStatus === "草稿" ? "编辑" : "查看", "", record.orderNo, record.owner, record.submitter || normalizeNewProductOwner(record.owner), record.approver || "-", record.time || "-", record.productCode, record.barcode, record.productName, record.spec, record.unit, record.category, record.brand, record.model, record.temperature, record.packQty, record.recordStatus, record.approveStatus, record.approveComment, record.rejectReason, record.nextApprover, record.writeBackStatus, record.attachments];
    return `
                <tr class="table-row-clickable" data-drawer="detail" data-drawer-title="新品录入单详情" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}">
                  <td><div class="table-action-group"><button class="table-action-button" data-newproduct-view-entry data-row-id="${record.rowId}">查看</button>${record.submitStatus === "草稿" ? `<button class="table-action-button primary" data-newproduct-edit-entry data-row-id="${record.rowId}">编辑</button>` : ""}</div></td>
                  <td><input type="checkbox" data-newproduct-submit-row data-row-id="${record.rowId}" data-submit-status="${record.submitStatus}" data-submit-label="${record.orderNo} / ${record.productName}" ${record.submitStatus === "已审核通过" ? "disabled" : ""} /></td>
                  <td>${record.orderNo}</td><td>${record.owner}</td><td data-newproduct-submitter>${record.submitter || normalizeNewProductOwner(record.owner)}</td><td data-newproduct-approver>${record.approver || "-"}</td><td data-newproduct-time>${record.time || "-"}</td><td>${record.productCode}</td><td>${record.barcode}</td><td>${record.productName}</td><td>${record.spec}</td><td>${record.unit}</td><td>${record.category}</td><td>${record.brand}</td><td>${record.model}</td><td>${record.temperature}</td><td>${record.packQty}</td><td data-newproduct-record-status="${record.recordStatus}"><span class="tag ${record.recordStatus === "草稿" ? "gray" : record.recordStatus === "已提交" ? "blue" : record.recordStatus === "已驳回" ? "red" : "green"}">${record.recordStatus}</span></td><td data-newproduct-approve-status="${record.approveStatus}"><span class="tag ${record.approveStatus === "待提交" ? "gray" : record.approveStatus === "待审批" ? "orange" : record.approveStatus === "审批驳回" ? "red" : "green"}">${record.approveStatus}</span></td><td data-newproduct-approve-comment>${record.approveComment}</td><td data-newproduct-reject-reason>${record.rejectReason}</td><td data-newproduct-next-approver>${record.nextApprover}</td><td data-newproduct-writeback>${record.writeBackStatus}</td><td>${record.attachments}</td>
                </tr>`;
  }).join("");
}

function getNewProductCreateState() {
  return {
    owner: "外部货主B（来源于当前登录用户）",
    orderNo: "保存草稿后自动生成",
    submitter: "外部货主B",
    approver: "待审批",
    approveComment: "待提交",
    time: "提交后自动回写",
    barcode: "请填写条形码",
    productName: "请填写商品名称",
    spec: "请填写规格",
    unit: "请选择单位",
    category: "请选择商品分类",
    brand: "请填写品牌",
    model: "请填写型号",
    temperature: "请选择温层",
    packQty: "请填写包装数量",
    length: "请填写长度",
    width: "请填写宽度",
    height: "请填写高度",
    volume: "自动计算",
    weight: "请填写重量",
    attachments: "请上传附件资料",
    remark: "请填写录入说明"
  };
}

function getReturnApplyEditState() {
  const selectedRow = returnApplyPageState.selectedEditRow || {
    rowId: "ra-row-1",
    submitStatus: "草稿",
    orderNo: "THSQ20260526001",
    sourceMode: "手工创建",
    owner: "自有货主A",
    warehouse: "华东1仓",
    submitter: "客户运营A",
    approver: "-",
    goodsCode: "MAT-TH-001",
    barcode: "6905000000011",
    productName: "低值易耗品-清洁剂",
    spec: "12瓶/箱",
    unit: "箱",
    batchNo: "BATCH20260508A",
    produceDate: "2026-05-08",
    expireDate: "2027-05-08",
    applyQty: "45",
    taxRate: "13%",
    priceExTax: "42.48",
    priceIncTax: "48.00",
    amountExTax: "1911.60",
    amountIncTax: "2160.00",
    taxAmount: "248.40",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: "2026-05-26 09:12",
    reason: "商品临期退回",
    remark: "待重新提交",
    attachments: "退货说明",
    contact: "李波 / 13900000000"
  };
  return {
    ...selectedRow,
    goodsSummary: `已维护 1 个商品 / 数量 ${selectedRow.applyQty || "0"}`
  };
}

function getReturnApplyListRecords() {
  if (returnApplyPageState.listRecords) {
    return returnApplyPageState.listRecords;
  }

  returnApplyPageState.listRecords = [
    {
      rowId: "ra-row-1",
      submitStatus: "草稿",
      orderNo: "THSQ20260526001",
      sourceMode: "手工创建",
      owner: "自有货主A",
      warehouse: "华东1仓",
      submitter: "客户运营A",
      approver: "-",
      goodsCode: "MAT-TH-001",
      barcode: "6905000000011",
      productName: "低值易耗品-清洁剂",
      spec: "12瓶/箱",
      unit: "箱",
      batchNo: "BATCH20260508A",
      produceDate: "2026-05-08",
      expireDate: "2027-05-08",
      applyQty: "45",
      taxRate: "13%",
      priceExTax: "42.48",
      priceIncTax: "48.00",
      amountExTax: "1911.60",
      amountIncTax: "2160.00",
      taxAmount: "248.40",
      approveComment: "-",
      rejectReason: "-",
      nextApprover: "待提交",
      generateNotice: "待生成",
      time: "2026-05-26 09:12",
      reason: "商品临期退回",
      remark: "待提交审批",
      attachments: "退货说明",
      contact: "李波 / 13900000000",
      goodsSummary: "已维护 2 个商品 / 数量 80",
      goodsRows: cloneInboundApplyGoodsRows(getReturnApplyGoodsPresetRows("manual"))
    },
    {
      rowId: "ra-row-2",
      submitStatus: "待审批",
      orderNo: "THSQ20260526003",
      sourceMode: "资源资产系统传入",
      owner: "外部货主B",
      warehouse: "华南2仓",
      submitter: "资源资产系统",
      approver: "待审批",
      goodsCode: "MAT-TH-002",
      barcode: "6905000000028",
      productName: "低值易耗品-防护手套",
      spec: "24袋/箱",
      unit: "箱",
      batchNo: "BATCH20260510B",
      produceDate: "2026-05-10",
      expireDate: "2027-05-10",
      applyQty: "35",
      taxRate: "13%",
      priceExTax: "26.55",
      priceIncTax: "30.00",
      amountExTax: "929.25",
      amountIncTax: "1050.00",
      taxAmount: "120.75",
      approveComment: "待审批",
      rejectReason: "-",
      nextApprover: "客户服务经理",
      generateNotice: "待审批通过后生成",
      time: "2026-05-26 09:26",
      reason: "门店滞销退回",
      remark: "接口导入单据",
      attachments: "签收附件",
      contact: "系统导入",
      goodsSummary: "已维护 1 个商品 / 数量 35",
      goodsRows: [buildReturnApplyGoodsRowFromRecord({ applyQty: 35, goodsCode: "MAT-TH-002", barcode: "6905000000028", productName: "低值易耗品-防护手套", spec: "24袋/箱", unit: "箱", taxRate: "13%", priceExTax: "26.55", priceIncTax: "30.00", batchNo: "BATCH20260510B", expireDate: "2027-05-10", attachments: "签收附件" })]
    },
    {
      rowId: "ra-row-3",
      submitStatus: "已审核通过",
      orderNo: "THSQ20260526005",
      sourceMode: "资源资产系统传入",
      owner: "自有货主C",
      warehouse: "华北3仓",
      submitter: "资源资产系统",
      approver: "审批人",
      goodsCode: "MAT-TH-013",
      barcode: "6905000000134",
      productName: "低值易耗品-周转盒",
      spec: "10个/箱",
      unit: "箱",
      batchNo: "BATCH20260516C",
      produceDate: "2026-05-16",
      expireDate: "2027-05-16",
      applyQty: "20",
      taxRate: "13%",
      priceExTax: "16.00",
      priceIncTax: "18.08",
      amountExTax: "320.00",
      amountIncTax: "361.60",
      taxAmount: "41.60",
      approveComment: "同意退货并生成退货通知单",
      rejectReason: "-",
      nextApprover: "系统自动生成",
      generateNotice: "已生成退货通知单",
      time: "2026-05-26 09:48",
      reason: "仓库品质抽检退回",
      remark: "待WMS执行",
      attachments: "退货申请单",
      contact: "系统导入",
      goodsSummary: "已维护 1 个商品 / 数量 20",
      goodsRows: [buildReturnApplyGoodsRowFromRecord({ applyQty: 20, goodsCode: "MAT-TH-013", barcode: "6905000000134", productName: "低值易耗品-周转盒", spec: "10个/箱", unit: "箱", taxRate: "13%", priceExTax: "16.00", priceIncTax: "18.08", batchNo: "BATCH20260516C", expireDate: "2027-05-16", attachments: "退货申请单" })]
    }
  ];

  return returnApplyPageState.listRecords;
}

function buildReturnApplyOrderNo() {
  const sequence = String(returnApplyPageState.nextOrderSequence || 6).padStart(3, "0");
  returnApplyPageState.nextOrderSequence = (returnApplyPageState.nextOrderSequence || 6) + 1;
  return `THSQ20260526${sequence}`;
}

function getReturnApplyApprovalLogs() {
  if (returnApplyPageState.approvalLogs) {
    return returnApplyPageState.approvalLogs;
  }

  returnApplyPageState.approvalLogs = [
    ["2026-05-26 09:12", "THSQ20260526001", "客户运营A", "-", "客户运营A", "保存草稿", "已保存退货草稿", "-", "待提交", "草稿"],
    ["2026-05-26 09:26", "THSQ20260526003", "资源资产系统", "-", "系统", "提交审批", "资源资产系统推送退货申请，待审批", "-", "客户服务经理", "待审批"],
    ["2026-05-26 09:48", "THSQ20260526005", "资源资产系统", "审批人", "审批人", "审批通过", "同意退货并生成退货通知单", "-", "系统自动生成", "已审核通过"]
  ];
  return returnApplyPageState.approvalLogs;
}

function buildReturnApplyLogTime() {
  const minute = String(returnApplyPageState.nextLogMinute || 22).padStart(2, "0");
  returnApplyPageState.nextLogMinute = (returnApplyPageState.nextLogMinute || 22) + 1;
  return `2026-05-26 10:${minute}`;
}

function appendReturnApplyApprovalLog(orderNo, actor, action, comment, rejectReason, nextApprover, result, eventTime = "", submitter = "", approver = "") {
  getReturnApplyApprovalLogs().unshift([
    eventTime || buildReturnApplyLogTime(),
    orderNo,
    submitter || actor || "-",
    approver || "-",
    actor || "-",
    action || "-",
    comment || "-",
    rejectReason || "-",
    nextApprover || "-",
    result || "-"
  ]);
}

function renderReturnApplyApprovalTab() {
  const approvalTab = (pcTabConfigs.returnapply?.extraTabs || []).find((item) => item.key === "approval");
  return `
    <div class="section-card">
      <div class="section-head"><h3>${approvalTab?.title || "退货申请审批记录"}</h3><div class="action-row">${renderActionButton("导出明细")}</div></div>
      <div class="notice">
        <div class="title">${approvalTab?.title || "退货申请审批记录"}</div>
        <div class="desc">${approvalTab?.desc || "用于展示退货申请单的审批轨迹。"}</div>
      </div>
    </div>
    ${renderPcSimpleTable("退货申请审批记录", approvalTab?.headers || [], getReturnApplyApprovalLogs())}
  `;
}

function renderReturnApplyListRows() {
  const headers = ["操作","勾选","申请单号","来源方式","货主","仓库","提交人","审批人","时间","申请状态","生成通知","审批意见","驳回原因","商品编码","条形码","商品名称","规格","单位","生产批号","生产日期","保质日期","申请数量","税率","未税进价","含税进价","未税金额","含税金额","税额"];
  return getReturnApplyListRecords().map((record, rowIndex) => {
    const row = ["", "", record.orderNo, record.sourceMode, record.owner, record.warehouse, record.submitter, record.approver, record.time, record.submitStatus, record.generateNotice, record.approveComment, record.rejectReason, record.goodsCode, record.barcode, record.productName, record.spec, record.unit, record.batchNo, record.produceDate, record.expireDate, record.applyQty, record.taxRate, record.priceExTax, record.priceIncTax, record.amountExTax, record.amountIncTax, record.taxAmount];
    return `
                <tr class="table-row-clickable" data-drawer="detail" data-drawer-title="退货申请单详情" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}">
                  <td>${buildReturnApplyActionCell(record.submitStatus, record.orderNo)}</td>
                  <td>${buildReturnApplySelectCell(record.submitStatus, record.orderNo, record.owner)}</td>
                  <td>${record.orderNo}</td><td>${record.sourceMode}</td><td>${record.owner}</td><td>${record.warehouse}</td><td>${record.submitter}</td><td>${record.approver}</td><td>${record.time}</td><td>${buildReturnApplyStatusTag(record.submitStatus)}</td><td>${record.generateNotice}</td><td>${record.approveComment}</td><td>${record.rejectReason}</td><td>${record.goodsCode}</td><td>${record.barcode}</td><td>${record.productName}</td><td>${record.spec}</td><td>${record.unit}</td><td>${record.batchNo}</td><td>${record.produceDate}</td><td>${record.expireDate}</td><td>${record.applyQty}</td><td>${record.taxRate}</td><td>${record.priceExTax}</td><td>${record.priceIncTax}</td><td>${record.amountExTax}</td><td>${record.amountIncTax}</td><td>${record.taxAmount}</td>
                </tr>`;
  }).join("");
}

function getReturnApplyInCreateState() {
  return {
    sourceMode: "手工创建",
    customer: "请选择客户",
    orderNo: "保存草稿后自动生成",
    originOrderNo: "请输入原配送单号",
    owner: "根据原单自动带出",
    warehouse: "根据原单自动匹配退回仓",
    submitter: "客户运营A",
    approver: "待审批",
    approveComment: "待提交",
    time: "提交后自动回写",
    goodsSummary: "请维护退仓商品明细",
    reason: "请填写退仓原因",
    remark: "请填写补充说明",
    attachments: "请上传现场附件"
  };
}

function getReturnApplyInEditState() {
  const selectedRow = returnApplyInPageState.selectedEditRow || {
    rowId: "rti-row-3",
    submitStatus: "草稿",
    orderNo: "TKSQ20260526005",
    sourceMode: "手工创建",
    customer: "内部客户-共享仓",
    owner: "自有货主C",
    warehouse: "华北3仓",
    submitter: "客户运营B",
    approver: "-",
    originOrderNo: "PS20260523006",
    goodsCode: "MAT-TK-031",
    barcode: "6908100000312",
    productName: "物料-商品031",
    spec: "10盒/箱",
    unit: "箱",
    batchNo: "BATCH20260513C",
    produceDate: "2026-05-13",
    expireDate: "2027-05-13",
    originalQty: "80",
    availableQty: "36",
    applyQty: "20",
    taxRate: "13%",
    priceExTax: "31.86",
    priceIncTax: "36.00",
    amountExTax: "637.20",
    amountIncTax: "720.00",
    taxAmount: "82.80",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: "2026-05-26 10:35",
    reason: "门店退仓，包装完整",
    remark: "待确认上架库区",
    attachments: "现场照片/退仓说明"
  };
  return {
    ...selectedRow,
    goodsSummary: `已维护 1 个商品 / 数量 ${selectedRow.applyQty || "0"}`
  };
}

function getReturnApplyInListRecords() {
  if (returnApplyInPageState.listRecords) {
    return returnApplyInPageState.listRecords;
  }

  returnApplyInPageState.listRecords = [
    {
      rowId: "rti-row-1",
      submitStatus: "草稿",
      orderNo: "TKSQ20260526001",
      sourceMode: "手工创建",
      customer: "内部客户-华东分部",
      owner: "自有货主A",
      warehouse: "华东1仓",
      submitter: "客户运营A",
      approver: "-",
      originOrderNo: "PS20260521012",
      goodsCode: "MAT-TK-001",
      barcode: "6908100000013",
      productName: "物料-商品011",
      spec: "12瓶/箱",
      unit: "箱",
      batchNo: "BATCH20260506A",
      produceDate: "2026-05-06",
      expireDate: "2027-05-06",
      originalQty: "50",
      availableQty: "30",
      applyQty: "30",
      taxRate: "13%",
      priceExTax: "42.48",
      priceIncTax: "48.00",
      amountExTax: "1274.40",
      amountIncTax: "1440.00",
      taxAmount: "165.60",
      approveComment: "-",
      rejectReason: "-",
      nextApprover: "待提交",
      generateNotice: "待生成",
      time: "2026-05-26 09:42",
      reason: "门店退仓",
      remark: "待提交审批",
      attachments: "现场照片"
    },
    {
      rowId: "rti-row-2",
      submitStatus: "待审批",
      orderNo: "TKSQ20260526003",
      sourceMode: "资源资产系统传入",
      customer: "外部客户-门店联盟",
      owner: "外部货主B",
      warehouse: "华南2仓",
      submitter: "资源资产系统",
      approver: "待审批",
      originOrderNo: "PS20260522003",
      goodsCode: "MAT-TK-002",
      barcode: "6908100000020",
      productName: "物料-商品012",
      spec: "24袋/箱",
      unit: "箱",
      batchNo: "BATCH20260509B",
      produceDate: "2026-05-09",
      expireDate: "2027-05-09",
      originalQty: "25",
      availableQty: "15",
      applyQty: "15",
      taxRate: "13%",
      priceExTax: "26.55",
      priceIncTax: "30.00",
      amountExTax: "398.25",
      amountIncTax: "450.00",
      taxAmount: "51.75",
      approveComment: "待审批",
      rejectReason: "-",
      nextApprover: "客户服务经理",
      generateNotice: "待审批通过后生成",
      time: "2026-05-26 09:55",
      reason: "门店多发退回",
      remark: "接口导入单据",
      attachments: "退仓说明"
    },
    {
      rowId: "rti-row-3",
      submitStatus: "已审核通过",
      orderNo: "TKSQ20260526005",
      sourceMode: "手工创建",
      customer: "内部客户-共享仓",
      owner: "自有货主C",
      warehouse: "华北3仓",
      submitter: "客户运营B",
      approver: "审批人",
      originOrderNo: "PS20260523006",
      goodsCode: "MAT-TK-031",
      barcode: "6908100000312",
      productName: "物料-商品031",
      spec: "10盒/箱",
      unit: "箱",
      batchNo: "BATCH20260513C",
      produceDate: "2026-05-13",
      expireDate: "2027-05-13",
      originalQty: "80",
      availableQty: "36",
      applyQty: "20",
      taxRate: "13%",
      priceExTax: "31.86",
      priceIncTax: "36.00",
      amountExTax: "637.20",
      amountIncTax: "720.00",
      taxAmount: "82.80",
      approveComment: "同意退仓并生成退仓通知单",
      rejectReason: "-",
      nextApprover: "系统自动生成",
      generateNotice: "已生成退仓通知单",
      time: "2026-05-26 10:12",
      reason: "门店退仓，包装完整",
      remark: "待WMS执行",
      attachments: "现场照片/退仓说明"
    }
  ];

  return returnApplyInPageState.listRecords;
}

function buildReturnApplyInOrderNo() {
  const sequence = String(returnApplyInPageState.nextOrderSequence || 6).padStart(3, "0");
  returnApplyInPageState.nextOrderSequence = (returnApplyInPageState.nextOrderSequence || 6) + 1;
  return `TKSQ20260526${sequence}`;
}

function getReturnApplyInApprovalLogs() {
  if (returnApplyInPageState.approvalLogs) {
    return returnApplyInPageState.approvalLogs;
  }

  returnApplyInPageState.approvalLogs = [
    ["2026-05-26 09:42", "TKSQ20260526001", "客户运营A", "-", "客户运营A", "保存草稿", "已保存退仓草稿", "-", "待提交", "草稿"],
    ["2026-05-26 09:55", "TKSQ20260526003", "资源资产系统", "-", "系统", "提交审批", "资源资产系统推送退仓申请，待审批", "-", "客户服务经理", "待审批"],
    ["2026-05-26 10:12", "TKSQ20260526005", "客户运营B", "审批人", "审批人", "审批通过", "同意退仓并生成退仓通知单", "-", "系统自动生成", "已审核通过"]
  ];
  return returnApplyInPageState.approvalLogs;
}

function buildReturnApplyInLogTime() {
  const minute = String(returnApplyInPageState.nextLogMinute || 36).padStart(2, "0");
  returnApplyInPageState.nextLogMinute = (returnApplyInPageState.nextLogMinute || 36) + 1;
  return `2026-05-26 11:${minute}`;
}

function appendReturnApplyInApprovalLog(orderNo, actor, action, comment, rejectReason, nextApprover, result, eventTime = "", submitter = "", approver = "") {
  getReturnApplyInApprovalLogs().unshift([
    eventTime || buildReturnApplyInLogTime(),
    orderNo,
    submitter || actor || "-",
    approver || "-",
    actor || "-",
    action || "-",
    comment || "-",
    rejectReason || "-",
    nextApprover || "-",
    result || "-"
  ]);
}

function renderReturnApplyInApprovalTab() {
  const approvalTab = (pcTabConfigs.returnapplyin?.extraTabs || []).find((item) => item.key === "approval");
  return `
    <div class="section-card">
      <div class="section-head"><h3>${approvalTab?.title || "退仓申请审批记录"}</h3><div class="action-row">${renderActionButton("导出明细")}</div></div>
      <div class="notice">
        <div class="title">${approvalTab?.title || "退仓申请审批记录"}</div>
        <div class="desc">${approvalTab?.desc || "用于展示退仓申请单的审批轨迹。"}</div>
      </div>
    </div>
    ${renderPcSimpleTable("退仓申请审批记录", approvalTab?.headers || [], getReturnApplyInApprovalLogs())}
  `;
}

function renderReturnApplyInListRows() {
  const headers = ["操作","勾选","申请单号","来源方式","客户","原货主","退回仓","提交人","审批人","时间","申请状态","生成通知","审批意见","驳回原因","商品编码","条形码","商品名称","规格","单位","生产批号","生产日期","保质日期","原配送数量","可退数量","申请数量","税率","未税进价","含税进价","未税金额","含税金额","税额"];
  return getReturnApplyInListRecords().map((record, rowIndex) => {
    const row = ["", "", record.orderNo, record.sourceMode, record.customer, record.owner, record.warehouse, record.submitter, record.approver, record.time, record.submitStatus, record.generateNotice, record.approveComment, record.rejectReason, record.goodsCode, record.barcode, record.productName, record.spec, record.unit, record.batchNo, record.produceDate, record.expireDate, record.originalQty, record.availableQty, record.applyQty, record.taxRate, record.priceExTax, record.priceIncTax, record.amountExTax, record.amountIncTax, record.taxAmount];
    return `
                <tr class="table-row-clickable" data-drawer="detail" data-drawer-title="退仓申请单详情" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}">
                  <td><div class="table-action-group"><button class="table-action-button" data-returnapplyin-view-entry data-row-id="${record.rowId}">查看</button>${record.submitStatus === "草稿" ? `<button class="table-action-button primary" data-returnapplyin-edit-entry data-row-id="${record.rowId}">编辑</button>` : ""}</div></td>
                  <td><input type="checkbox" data-returnapplyin-submit-row data-row-id="${record.rowId}" data-order-no="${record.orderNo}" data-submit-status="${record.submitStatus}" data-submit-label="${record.orderNo} / ${record.customer}" ${record.submitStatus === "已审核通过" ? "disabled" : ""} /></td>
                  <td>${record.orderNo}</td><td>${record.sourceMode}</td><td>${record.customer}</td><td>${record.owner}</td><td>${record.warehouse}</td><td>${record.submitter}</td><td>${record.approver}</td><td>${record.time}</td><td>${buildReturnApplyInStatusTag(record.submitStatus)}</td><td>${record.generateNotice}</td><td>${record.approveComment}</td><td>${record.rejectReason}</td><td>${record.goodsCode}</td><td>${record.barcode}</td><td>${record.productName}</td><td>${record.spec}</td><td>${record.unit}</td><td>${record.batchNo}</td><td>${record.produceDate}</td><td>${record.expireDate}</td><td>${record.originalQty}</td><td>${record.availableQty}</td><td>${record.applyQty}</td><td>${record.taxRate}</td><td>${record.priceExTax}</td><td>${record.priceIncTax}</td><td>${record.amountExTax}</td><td>${record.amountIncTax}</td><td>${record.taxAmount}</td>
                </tr>`;
  }).join("");
}

function renderReturnApplyInCreateTab() {
  const createState = getReturnApplyInCreateState();
  return `
    <div class="grid-2">
      <div class="section-card">
        <div class="section-head"><h3>录入控制台</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button></div></div>
        <div class="info-grid">
          <div class="info-item"><div class="k">单据类型</div><div>退仓申请单</div></div>
          <div class="info-item"><div class="k">录入模式</div><div>页面式录入</div></div>
          <div class="info-item"><div class="k">当前状态</div><div>草稿</div></div>
          <div class="info-item"><div class="k">说明</div><div>参考新品录入单的新增页，支持保存草稿和提交审批。</div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>录入说明</h3><div class="action-row"><button class="ghost-button" data-modal="permission" data-action-label="查看权限">查看权限</button></div></div>
        <div class="list">
          <div class="list-row"><div><div class="list-title">原单回溯</div><div class="muted">原配送单、原货主和退回仓支持通过原单自动带出。</div></div><span class="tag blue">自动</span></div>
          <div class="list-row"><div><div class="list-title">草稿保存</div><div class="muted">可先保存草稿，后续继续补充商品明细和退仓原因。</div></div><span class="tag orange">可暂存</span></div>
          <div class="list-row"><div><div class="list-title">审批流转</div><div class="muted">提交审批后进入待审批，审批通过自动生成退仓通知单。</div></div><span class="tag green">自动生成</span></div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>退仓申请录入页</h3><div class="action-row"><button class="ghost-button" id="returnApplyInCreateSaveDraftButton">保存草稿</button><button class="primary-button" id="returnApplyInCreateSubmitButton">提交审批</button></div></div>
      ${renderNewProductFieldCards([
        { label: "来源方式", value: createState.sourceMode, filledValue: "手工创建" },
        { label: "客户", value: createState.customer, filledValue: "内部客户-华东分部" },
        { label: "申请单号", value: createState.orderNo, readonly: true },
        { label: "原配送单", value: createState.originOrderNo, filledValue: "PS20260521012" },
        { label: "原货主", value: createState.owner, filledValue: "自有货主A" },
        { label: "退回仓", value: createState.warehouse, filledValue: "华东1仓" },
        { label: "提交人", value: createState.submitter, readonly: true },
        { label: "审批人", value: createState.approver, readonly: true },
        { label: "审批意见", value: createState.approveComment, readonly: true },
        { label: "时间", value: createState.time, readonly: true },
        { label: "商品明细", value: createState.goodsSummary, filledValue: "已维护 2 个商品 / 数量 45", width: "full" },
        { label: "退仓原因", value: createState.reason, filledValue: "门店退仓，包装完整", width: "full" },
        { label: "补充说明", value: createState.remark, filledValue: "待仓库收货后进行上架", width: "full" },
        { label: "附件资料", value: createState.attachments, filledValue: "现场照片/退仓说明", width: "full" }
      ])}
    </div>`;
}

function renderReturnApplyInEditTab() {
  const editState = getReturnApplyInEditState();
  return `
    <div class="grid-2">
      <div class="section-card">
        <div class="section-head"><h3>修改控制台</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button></div></div>
        <div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>${editState.orderNo}</div></div>
          <div class="info-item"><div class="k">当前状态</div><div>${editState.submitStatus}</div></div>
          <div class="info-item"><div class="k">修改口径</div><div>仅草稿状态支持页面式编辑</div></div>
          <div class="info-item"><div class="k">说明</div><div>参考新品录入单的修改页，修改后可保存草稿或重新提交审批。</div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>修改说明</h3><div class="action-row"><button class="ghost-button" data-modal="view" data-action-label="查看申请规则">查看申请规则</button></div></div>
        <div class="list">
          <div class="list-row"><div><div class="list-title">可编辑范围</div><div class="muted">可修改退仓商品明细汇总、退仓原因、补充说明和附件资料。</div></div><span class="tag blue">草稿</span></div>
          <div class="list-row"><div><div class="list-title">原单校验</div><div class="muted">原配送单、原货主和退回仓仍需满足原单回溯规则。</div></div><span class="tag orange">需校验</span></div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>退仓申请修改页</h3><div class="action-row"><button class="ghost-button" id="returnApplyInEditSaveDraftButton">保存草稿</button><button class="primary-button" id="returnApplyInEditSubmitButton">重新提交审批</button></div></div>
      ${renderNewProductFieldCards([
        { label: "来源方式", value: editState.sourceMode, readonly: true },
        { label: "客户", value: editState.customer, readonly: true },
        { label: "申请单号", value: editState.orderNo, readonly: true },
        { label: "原配送单", value: editState.originOrderNo, readonly: true },
        { label: "原货主", value: editState.owner, readonly: true },
        { label: "退回仓", value: editState.warehouse, readonly: true },
        { label: "提交人", value: editState.submitter, readonly: true },
        { label: "审批人", value: editState.approver || "-", readonly: true },
        { label: "审批意见", value: editState.approveComment || "-", readonly: true },
        { label: "时间", value: editState.time || "-", readonly: true },
        { label: "商品明细", value: editState.goodsSummary, filledValue: editState.goodsSummary, width: "full" },
        { label: "退仓原因", value: editState.reason, filledValue: "门店退仓，包装完整", width: "full" },
        { label: "补充说明", value: editState.remark, filledValue: "待确认上架库区", width: "full" },
        { label: "附件资料", value: editState.attachments, filledValue: "现场照片/退仓说明", width: "full" }
      ])}
    </div>`;
}

function getOwnershipApplyCreateState() {
  return {
    orderNo: "保存草稿后自动生成",
    sourceMode: "手工创建",
    fromOwner: "请选择原货主",
    toOwner: "请选择目标货主",
    warehouse: "请选择仓库",
    submitter: "货主服务A",
    approver: "待审批",
    approveComment: "待提交",
    time: "提交后自动回写",
    goodsSummary: "请维护转移商品明细",
    effectiveTime: "请选择生效时间",
    reason: "请填写转移原因",
    attachments: "请上传转移依据"
  };
}

function getOwnershipApplyEditState() {
  const selectedRow = ownershipApplyPageState.selectedEditRow || {
    rowId: "oa-row-1",
    submitStatus: "草稿",
    orderNo: "WQSQ20260526001",
    sourceMode: "手工创建",
    fromOwner: "外部货主B",
    toOwner: "自有货主A",
    warehouse: "华东1仓",
    submitter: "货主服务A",
    approver: "-",
    goodsCode: "MAT-OWN-001",
    barcode: "6911000000014",
    productName: "物料-商品041",
    spec: "12瓶/箱",
    unit: "箱",
    batchNo: "BATCH20260507A",
    produceDate: "2026-05-07",
    expireDate: "2027-05-07",
    availableQty: "260",
    applyQty: "120",
    taxRate: "13%",
    priceExTax: "42.48",
    priceIncTax: "48.00",
    amountExTax: "5097.60",
    amountIncTax: "5760.00",
    taxAmount: "662.40",
    effectiveTime: "2026-05-27 14:00",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: "2026-05-26 09:36",
    reason: "外部货主商品转自有货主",
    attachments: "转移申请说明/合同依据"
  };
  return {
    ...selectedRow,
    goodsSummary: `已维护 1 个商品 / 数量 ${selectedRow.applyQty || "0"}`
  };
}

function getOwnershipApplyListRecords() {
  if (ownershipApplyPageState.listRecords) {
    return ownershipApplyPageState.listRecords;
  }

  ownershipApplyPageState.listRecords = [
    {
      rowId: "oa-row-1",
      submitStatus: "草稿",
      orderNo: "WQSQ20260526001",
      sourceMode: "手工创建",
      fromOwner: "外部货主B",
      toOwner: "自有货主A",
      warehouse: "华东1仓",
      submitter: "货主服务A",
      approver: "-",
      goodsCode: "MAT-OWN-001",
      barcode: "6911000000014",
      productName: "物料-商品041",
      spec: "12瓶/箱",
      unit: "箱",
      batchNo: "BATCH20260507A",
      produceDate: "2026-05-07",
      expireDate: "2027-05-07",
      availableQty: "260",
      applyQty: "120",
      taxRate: "13%",
      priceExTax: "42.48",
      priceIncTax: "48.00",
      amountExTax: "5097.60",
      amountIncTax: "5760.00",
      taxAmount: "662.40",
      effectiveTime: "2026-05-27 14:00",
      approveComment: "-",
      rejectReason: "-",
      nextApprover: "待提交",
      generateNotice: "待生成",
      time: "2026-05-26 09:36",
      reason: "外部货主商品转自有货主",
      attachments: "转移申请说明/合同依据"
    },
    {
      rowId: "oa-row-2",
      submitStatus: "待审批",
      orderNo: "WQSQ20260526003",
      sourceMode: "手工创建",
      fromOwner: "外部货主C",
      toOwner: "自有货主C",
      warehouse: "华北3仓",
      submitter: "货主服务B",
      approver: "待审批",
      goodsCode: "MAT-OWN-002",
      barcode: "6911000000021",
      productName: "物料-商品042",
      spec: "24袋/箱",
      unit: "箱",
      batchNo: "BATCH20260508B",
      produceDate: "2026-05-08",
      expireDate: "2027-05-08",
      availableQty: "140",
      applyQty: "140",
      taxRate: "13%",
      priceExTax: "26.55",
      priceIncTax: "30.00",
      amountExTax: "3717.00",
      amountIncTax: "4200.00",
      taxAmount: "483.00",
      effectiveTime: "2026-05-27 16:00",
      approveComment: "待审批",
      rejectReason: "-",
      nextApprover: "货主管理经理",
      generateNotice: "待审批通过后生成",
      time: "2026-05-26 09:46",
      reason: "外部货主商品转自有货主",
      attachments: "转移申请说明"
    },
    {
      rowId: "oa-row-3",
      submitStatus: "已审核通过",
      orderNo: "WQSQ20260526005",
      sourceMode: "手工创建",
      fromOwner: "外部货主A",
      toOwner: "自有货主A",
      warehouse: "华南2仓",
      submitter: "货主服务C",
      approver: "审批人",
      goodsCode: "MAT-OWN-003",
      barcode: "6911000000038",
      productName: "物料-商品043",
      spec: "6盒/箱",
      unit: "箱",
      batchNo: "BATCH20260510C",
      produceDate: "2026-05-10",
      expireDate: "2027-05-10",
      availableQty: "90",
      applyQty: "90",
      taxRate: "13%",
      priceExTax: "17.70",
      priceIncTax: "20.00",
      amountExTax: "1593.00",
      amountIncTax: "1800.00",
      taxAmount: "207.00",
      effectiveTime: "2026-05-27 11:00",
      approveComment: "同意转移并生成物权转移通知单",
      rejectReason: "-",
      nextApprover: "系统自动生成",
      generateNotice: "已生成物权转移通知单",
      time: "2026-05-26 10:02",
      reason: "外部货主商品转自有货主",
      attachments: "合同依据/转移说明"
    }
  ];

  return ownershipApplyPageState.listRecords;
}

function getStoreOrderCycleListRecords() {
  if (storeOrderCyclePageState.listRecords) {
    return storeOrderCyclePageState.listRecords;
  }
  storeOrderCyclePageState.listRecords = [
    {
      rowId: "oc-row-1",
      ruleCode: "OC001",
      storeCode: "STORE001",
      storeName: "浦东旗舰店",
      customer: "内部客户-华东分部",
      cycleType: "按周",
      orderDays: "周三、周五",
      effectDate: "2026-01-01",
      status: "生效中",
      remark: "每周两次配送"
    },
    {
      rowId: "oc-row-2",
      ruleCode: "OC002",
      storeCode: "STORE002",
      storeName: "临港社区店",
      customer: "内部客户-华东分部",
      cycleType: "按月",
      orderDays: "每月 5号、15号",
      effectDate: "2026-01-01",
      status: "生效中",
      remark: "半月度补货"
    },
    {
      rowId: "oc-row-3",
      ruleCode: "OC003",
      storeCode: "STORE003",
      storeName: "天河中心店",
      customer: "外部客户-门店联盟",
      cycleType: "按周",
      orderDays: "周一、周二、周三、周四、周五",
      effectDate: "2026-01-15",
      status: "生效中",
      remark: "工作日均可要货"
    },
    {
      rowId: "oc-row-4",
      ruleCode: "OC004",
      storeCode: "STORE004",
      storeName: "海珠网点",
      customer: "外部客户-门店联盟",
      cycleType: "按月",
      orderDays: "每月 1号、10号、20号",
      effectDate: "2026-02-01",
      status: "草稿",
      remark: "旬度要货，待确认"
    },
    {
      rowId: "oc-row-5",
      ruleCode: "OC005",
      storeCode: "STORE005",
      storeName: "大兴新城店",
      customer: "内部客户-区域共享仓",
      cycleType: "按周",
      orderDays: "周二、周四、周六",
      effectDate: "2026-01-01",
      status: "生效中",
      remark: "含周末配送"
    }
  ];
  return storeOrderCyclePageState.listRecords;
}

function buildOwnershipApplyOrderNo() {
  const sequence = String(ownershipApplyPageState.nextOrderSequence || 6).padStart(3, "0");
  ownershipApplyPageState.nextOrderSequence = (ownershipApplyPageState.nextOrderSequence || 6) + 1;
  return `WQSQ20260526${sequence}`;
}

function getOwnershipApplyApprovalLogs() {
  if (ownershipApplyPageState.approvalLogs) {
    return ownershipApplyPageState.approvalLogs;
  }

  ownershipApplyPageState.approvalLogs = [
    ["2026-05-26 09:36", "WQSQ20260526001", "货主服务A", "-", "货主服务A", "保存草稿", "已保存物权转移草稿", "-", "待提交", "草稿"],
    ["2026-05-26 09:46", "WQSQ20260526003", "货主服务B", "-", "货主服务B", "提交审批", "已提交物权转移审批", "-", "货主管理经理", "待审批"],
    ["2026-05-26 10:02", "WQSQ20260526005", "货主服务C", "审批人", "审批人", "审批通过", "同意转移并生成物权转移通知单", "-", "系统自动生成", "已审核通过"]
  ];
  return ownershipApplyPageState.approvalLogs;
}

function buildOwnershipApplyLogTime() {
  const minute = String(ownershipApplyPageState.nextLogMinute || 18).padStart(2, "0");
  ownershipApplyPageState.nextLogMinute = (ownershipApplyPageState.nextLogMinute || 18) + 1;
  return `2026-05-26 11:${minute}`;
}

function appendOwnershipApplyApprovalLog(orderNo, actor, action, comment, rejectReason, nextApprover, result, eventTime = "", submitter = "", approver = "") {
  getOwnershipApplyApprovalLogs().unshift([
    eventTime || buildOwnershipApplyLogTime(),
    orderNo,
    submitter || actor || "-",
    approver || "-",
    actor || "-",
    action || "-",
    comment || "-",
    rejectReason || "-",
    nextApprover || "-",
    result || "-"
  ]);
}

function renderOwnershipApplyApprovalTab() {
  const approvalTab = (pcTabConfigs.ownershipapply?.extraTabs || []).find((item) => item.key === "approval");
  return `
    <div class="section-card">
      <div class="section-head"><h3>${approvalTab?.title || "物权转移申请审批记录"}</h3><div class="action-row">${renderActionButton("导出明细")}</div></div>
      <div class="notice">
        <div class="title">${approvalTab?.title || "物权转移申请审批记录"}</div>
        <div class="desc">${approvalTab?.desc || "用于展示物权转移申请单的审批轨迹。"}</div>
      </div>
    </div>
    ${renderPcSimpleTable("物权转移申请审批记录", approvalTab?.headers || [], getOwnershipApplyApprovalLogs())}
  `;
}

function buildStoreOrderCycleStatusTag(status) {
  const tagType = status === "草稿" ? "gray" : status === "待确认" ? "orange" : status === "已失效" ? "red" : "green";
  return '<span class="tag ' + tagType + '">' + status + '</span>';
}

function buildStoreOrderCycleCycleTypeTag(cycleType) {
  return cycleType === "按周" ? '<span class="tag blue">按周</span>' : '<span class="tag orange">按月</span>';
}

function renderStoreOrderCycleListRows() {
  return getStoreOrderCycleListRecords().map(function(record) {
    var canEdit = record.status === "草稿" || record.status === "生效中";
    return '<tr class="table-row-clickable">' +
      '<td><div class="table-action-group">' +
        '<button class="table-action-button" data-soc-view data-code="' + record.ruleCode + '">查看</button>' +
        (canEdit ? '<button class="table-action-button primary" data-soc-edit data-code="' + record.ruleCode + '">编辑</button>' : '') +
        (canEdit ? '<button class="table-action-button" data-soc-delete data-code="' + record.ruleCode + '">删除</button>' : '') +
      '</div></td>' +
      '<td>' + record.ruleCode + '</td>' +
      '<td>' + record.storeCode + '</td>' +
      '<td>' + record.storeName + '</td>' +
      '<td>' + record.customer + '</td>' +
      '<td>' + buildStoreOrderCycleCycleTypeTag(record.cycleType) + '</td>' +
      '<td>' + record.orderDays + '</td>' +
      '<td>' + record.effectDate + '</td>' +
      '<td>' + buildStoreOrderCycleStatusTag(record.status) + '</td>' +
      '<td>' + record.remark + '</td>' +
    '</tr>';
  }).join("");
}

function renderOwnershipApplyListRows() {
  const headers = ["操作","勾选","申请单号","原货主","新货主","仓库","提交人","审批人","时间","申请状态","生成通知","审批意见","驳回原因","商品编码","条形码","商品名称","规格","单位","生产批号","生产日期","保质日期","可转数量","申请数量","税率","未税进价","含税进价","未税金额","含税金额","税额"];
  return getOwnershipApplyListRecords().map((record, rowIndex) => {
    const row = ["", "", record.orderNo, record.fromOwner, record.toOwner, record.warehouse, record.submitter, record.approver, record.time, record.submitStatus, record.generateNotice, record.approveComment, record.rejectReason, record.goodsCode, record.barcode, record.productName, record.spec, record.unit, record.batchNo, record.produceDate, record.expireDate, record.availableQty, record.applyQty, record.taxRate, record.priceExTax, record.priceIncTax, record.amountExTax, record.amountIncTax, record.taxAmount];
    return `
                <tr class="table-row-clickable" data-drawer="detail" data-drawer-title="物权转移申请单详情" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}">
                  <td><div class="table-action-group"><button class="table-action-button" data-ownershipapply-view-entry data-row-id="${record.rowId}">查看</button>${record.submitStatus === "草稿" ? `<button class="table-action-button primary" data-ownershipapply-edit-entry data-row-id="${record.rowId}">编辑</button>` : ""}</div></td>
                  <td><input type="checkbox" data-ownershipapply-submit-row data-row-id="${record.rowId}" data-order-no="${record.orderNo}" data-submit-status="${record.submitStatus}" data-submit-label="${record.orderNo} / ${record.fromOwner} -> ${record.toOwner}" ${record.submitStatus === "已审核通过" ? "disabled" : ""} /></td>
                  <td>${record.orderNo}</td><td>${record.fromOwner}</td><td>${record.toOwner}</td><td>${record.warehouse}</td><td>${record.submitter}</td><td>${record.approver}</td><td>${record.time}</td><td>${buildReturnApplyInStatusTag(record.submitStatus)}</td><td>${record.generateNotice}</td><td>${record.approveComment}</td><td>${record.rejectReason}</td><td>${record.goodsCode}</td><td>${record.barcode}</td><td>${record.productName}</td><td>${record.spec}</td><td>${record.unit}</td><td>${record.batchNo}</td><td>${record.produceDate}</td><td>${record.expireDate}</td><td>${record.availableQty}</td><td>${record.applyQty}</td><td>${record.taxRate}</td><td>${record.priceExTax}</td><td>${record.priceIncTax}</td><td>${record.amountExTax}</td><td>${record.amountIncTax}</td><td>${record.taxAmount}</td>
                </tr>`;
  }).join("");
}

function renderOwnershipApplyCreateTab() {
  const createState = getOwnershipApplyCreateState();
  return `
    <div class="grid-2">
      <div class="section-card">
        <div class="section-head"><h3>录入控制台</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button></div></div>
        <div class="info-grid">
          <div class="info-item"><div class="k">单据类型</div><div>物权转移申请单</div></div>
          <div class="info-item"><div class="k">录入模式</div><div>页面式录入</div></div>
          <div class="info-item"><div class="k">当前状态</div><div>草稿</div></div>
          <div class="info-item"><div class="k">说明</div><div>参考新品录入单的新增页，支持保存草稿和提交审批。</div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>录入说明</h3><div class="action-row"><button class="ghost-button" data-modal="permission" data-action-label="查看权限">查看权限</button></div></div>
        <div class="list">
          <div class="list-row"><div><div class="list-title">转移校验</div><div class="muted">原货主、目标货主、仓库和可转库存需满足规则校验。</div></div><span class="tag blue">自动</span></div>
          <div class="list-row"><div><div class="list-title">草稿保存</div><div class="muted">可先保存草稿，后续继续补充商品明细和转移原因。</div></div><span class="tag orange">可暂存</span></div>
          <div class="list-row"><div><div class="list-title">审批流转</div><div class="muted">提交审批后进入待审批，审批通过自动生成物权转移通知单。</div></div><span class="tag green">自动生成</span></div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>物权转移申请录入页</h3><div class="action-row"><button class="ghost-button" id="ownershipApplyCreateSaveDraftButton">保存草稿</button><button class="primary-button" id="ownershipApplyCreateSubmitButton">提交审批</button></div></div>
      ${renderNewProductFieldCards([
        { label: "来源方式", value: createState.sourceMode, filledValue: "手工创建" },
        { label: "申请单号", value: createState.orderNo, readonly: true },
        { label: "原货主", value: createState.fromOwner, filledValue: "外部货主B" },
        { label: "目标货主", value: createState.toOwner, filledValue: "自有货主A" },
        { label: "仓库", value: createState.warehouse, filledValue: "华东1仓" },
        { label: "提交人", value: createState.submitter, readonly: true },
        { label: "审批人", value: createState.approver, readonly: true },
        { label: "审批意见", value: createState.approveComment, readonly: true },
        { label: "时间", value: createState.time, readonly: true },
        { label: "商品明细", value: createState.goodsSummary, filledValue: "已维护 2 个商品 / 数量 260", width: "full" },
        { label: "生效时间", value: createState.effectiveTime, filledValue: "2026-05-27 14:00" },
        { label: "转移原因", value: createState.reason, filledValue: "外部货主商品转自有货主", width: "full" },
        { label: "附件资料", value: createState.attachments, filledValue: "转移申请说明/合同依据", width: "full" }
      ])}
    </div>`;
}

function renderOwnershipApplyEditTab() {
  const editState = getOwnershipApplyEditState();
  return `
    <div class="grid-2">
      <div class="section-card">
        <div class="section-head"><h3>修改控制台</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button></div></div>
        <div class="info-grid">
          <div class="info-item"><div class="k">申请单号</div><div>${editState.orderNo}</div></div>
          <div class="info-item"><div class="k">当前状态</div><div>${editState.submitStatus}</div></div>
          <div class="info-item"><div class="k">修改口径</div><div>仅草稿状态支持页面式编辑</div></div>
          <div class="info-item"><div class="k">说明</div><div>参考新品录入单的修改页，修改后可保存草稿或重新提交审批。</div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>修改说明</h3><div class="action-row"><button class="ghost-button" data-modal="view" data-action-label="查看申请规则">查看申请规则</button></div></div>
        <div class="list">
          <div class="list-row"><div><div class="list-title">可编辑范围</div><div class="muted">可修改转移商品明细汇总、生效时间、转移原因和附件资料。</div></div><span class="tag blue">草稿</span></div>
          <div class="list-row"><div><div class="list-title">规则校验</div><div class="muted">目标货主、仓库和可转库存仍需满足物权转移规则。</div></div><span class="tag orange">需校验</span></div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>物权转移申请修改页</h3><div class="action-row"><button class="ghost-button" id="ownershipApplyEditSaveDraftButton">保存草稿</button><button class="primary-button" id="ownershipApplyEditSubmitButton">重新提交审批</button></div></div>
      ${renderNewProductFieldCards([
        { label: "来源方式", value: editState.sourceMode, readonly: true },
        { label: "申请单号", value: editState.orderNo, readonly: true },
        { label: "原货主", value: editState.fromOwner, readonly: true },
        { label: "目标货主", value: editState.toOwner, readonly: true },
        { label: "仓库", value: editState.warehouse, readonly: true },
        { label: "提交人", value: editState.submitter, readonly: true },
        { label: "审批人", value: editState.approver || "-", readonly: true },
        { label: "审批意见", value: editState.approveComment || "-", readonly: true },
        { label: "时间", value: editState.time || "-", readonly: true },
        { label: "商品明细", value: editState.goodsSummary, filledValue: editState.goodsSummary, width: "full" },
        { label: "生效时间", value: editState.effectiveTime, filledValue: editState.effectiveTime },
        { label: "转移原因", value: editState.reason, filledValue: "外部货主商品转自有货主", width: "full" },
        { label: "附件资料", value: editState.attachments, filledValue: "转移申请说明/合同依据", width: "full" }
      ])}
    </div>`;
}

function normalizeNewProductOwner(text = "") {
  return text.replace(/（.*?）/g, "").trim();
}

function collectNewProductFormValues() {
  const values = {};
  document.querySelectorAll(".pc-form-field").forEach((field) => {
    const label = field.dataset.pcFormLabel;
    const value = field.querySelector(".pc-form-value")?.textContent?.trim() || "";
    if (label) values[label] = value;
  });
  return values;
}

function saveNewProductCreateDraft() {
  const formValues = collectNewProductFormValues();
  const orderNo = buildNewProductOrderNo();
  const submitter = normalizeNewProductOwner(formValues["提交人"] || formValues["货主"] || "外部货主B");
  const time = buildNewProductLogTime();
  const newRecord = {
    rowId: `np-row-${Date.now()}`,
    submitStatus: "草稿",
    orderNo,
    owner: normalizeNewProductOwner(formValues["货主"] || "外部货主B"),
    submitter,
    approver: "-",
    productCode: "待生成",
    barcode: formValues["条形码"] || "请填写条形码",
    productName: formValues["商品名称"] || "请填写商品名称",
    spec: formValues["规格"] || "请填写规格",
    unit: formValues["单位"] || "请选择单位",
    category: formValues["商品分类"] || "请选择商品分类",
    brand: formValues["品牌"] || "请填写品牌",
    model: formValues["型号"] || "请填写型号",
    temperature: formValues["温层"] || "请选择温层",
    packQty: formValues["包装数量"] || "请填写包装数量",
    recordStatus: "草稿",
    approveStatus: "待提交",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    writeBackStatus: "待写入",
    attachments: formValues["附件资料"] || "请上传附件资料",
    time
  };

  getNewProductListRecords().unshift(newRecord);
  newProductPageState.selectedEditRow = newRecord;
  return newRecord;
}

function saveNewProductEditDraft() {
  const currentEdit = getNewProductEditState();
  const formValues = collectNewProductFormValues();
  const record = getNewProductListRecords().find((item) => item.rowId === currentEdit.rowId);
  if (!record) return null;
  const time = buildNewProductLogTime();

  Object.assign(record, {
    owner: normalizeNewProductOwner(formValues["货主"] || record.owner),
    submitter: normalizeNewProductOwner(formValues["提交人"] || formValues["货主"] || record.submitter || record.owner),
    approver: "-",
    barcode: formValues["条形码"] || record.barcode,
    productName: formValues["商品名称"] || record.productName,
    spec: formValues["规格"] || record.spec,
    unit: formValues["单位"] || record.unit,
    category: formValues["商品分类"] || record.category,
    brand: formValues["品牌"] || record.brand,
    model: formValues["型号"] || record.model,
    temperature: formValues["温层"] || record.temperature,
    packQty: formValues["包装数量"] || record.packQty,
    attachments: formValues["附件资料"] || record.attachments,
    submitStatus: "草稿",
    recordStatus: "草稿",
    approveStatus: "待提交",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    writeBackStatus: "待写入",
    time
  });

  newProductPageState.selectedEditRow = record;
  return record;
}

function isNewProductPlaceholderValue(value = "") {
  return ["请选择", "请填写", "请上传", "保存草稿后自动生成", "自动计算"].some((text) => value.includes(text));
}

function validateNewProductFormPage(requiredLabels) {
  let hasError = false;
  document.querySelectorAll(".pc-form-field").forEach((field) => {
    const label = field.dataset.pcFormLabel;
    const value = field.querySelector(".pc-form-value")?.textContent?.trim() || "";
    clearPcFieldError(field);
    if (field.dataset.pcFormReadonly === "true") return;
    if (requiredLabels.includes(label) && isNewProductPlaceholderValue(value)) {
      applyPcFieldError(field, `请先补全${label}`);
      hasError = true;
    }
  });

  if (hasError) {
    showToast("error", "字段未填写完整", "请先补全标红字段，再提交新品审批。");
  }

  return !hasError;
}

function markNewProductRecordPending(record, eventTime = "") {
  if (!record) return null;
  record.submitStatus = "待审批";
  record.recordStatus = "已提交";
  record.approveStatus = "待审批";
  record.approveComment = "待审批";
  record.rejectReason = "-";
  record.approver = "待审批";
  record.nextApprover = "商品主数据专员";
  record.writeBackStatus = "待写入";
  record.time = eventTime || record.time || buildNewProductLogTime();
  return record;
}

function submitNewProductCreateForm() {
  const requiredLabels = ["条形码", "商品名称", "规格", "单位", "商品分类", "品牌", "型号", "温层", "包装数量", "附件资料"];
  if (!validateNewProductFormPage(requiredLabels)) return false;
  const record = saveNewProductCreateDraft();
  const eventTime = buildNewProductLogTime();
  markNewProductRecordPending(record, eventTime);
  appendNewProductApprovalLog(record?.orderNo || "-", normalizeNewProductOwner(record?.owner || "外部货主"), "提交审批", "已完成新品字段填写并提交审批", "-", "商品主数据专员", "待审批", eventTime, record?.submitter || normalizeNewProductOwner(record?.owner || "外部货主"), "待审批");
  newProductPageState.selectedEditRow = record;
  renderPcPage("newproduct", "list");
  const toastConfig = getToastConfig("submit-draft", `提交 ${record?.productName || "新品记录"}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function submitNewProductEditForm() {
  const requiredLabels = ["条形码", "商品名称", "规格", "单位", "商品分类", "品牌", "型号", "温层", "包装数量", "附件资料"];
  if (!validateNewProductFormPage(requiredLabels)) return false;
  const record = saveNewProductEditDraft();
  const eventTime = buildNewProductLogTime();
  markNewProductRecordPending(record, eventTime);
  appendNewProductApprovalLog(record?.orderNo || "-", normalizeNewProductOwner(record?.owner || "外部货主"), "重新提交", "已完成草稿修改并重新提交审批", "-", "商品主数据专员", "待审批", eventTime, record?.submitter || normalizeNewProductOwner(record?.owner || "外部货主"), "待审批");
  newProductPageState.selectedEditRow = record;
  renderPcPage("newproduct", "list");
  const toastConfig = getToastConfig("submit-draft", `提交 ${record?.productName || "新品记录"}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function applyNewProductDelete() {
  const rowId = document.getElementById("modalPrimaryButton")?.dataset.rowId || "";
  if (!rowId || !newProductPageState.listRecords) return;

  const targetRecord = newProductPageState.listRecords.find((item) => item.rowId === rowId);
  newProductPageState.listRecords = newProductPageState.listRecords.filter((item) => item.rowId !== rowId);

  if (newProductPageState.selectedEditRow?.rowId === rowId) {
    newProductPageState.selectedEditRow = null;
  }

  if (targetRecord) {
      appendNewProductApprovalLog(targetRecord.orderNo, normalizeNewProductOwner(targetRecord.owner), "删除草稿", "草稿记录已删除", "-", "-", "已删除", "", targetRecord.submitter || normalizeNewProductOwner(targetRecord.owner), targetRecord.approver || "-");
  }

  renderPcPage("newproduct", "list");
}

function renderNewProductFieldCards(fields) {
  return `<div class="pc-form-grid">${fields.map(({ label, value, filledValue, width, readonly }) => `
    <div class="pc-form-field ${width === "full" ? "full" : ""} ${readonly ? "readonly" : ""}" data-pc-form-label="${label}" data-pc-filled-value="${filledValue || value}"${readonly ? ' data-pc-form-readonly="true"' : ""}>
      <div class="pc-form-label">${label}</div>
      <div class="pc-form-value">${value}</div>
    </div>`).join("")}</div>`;
}

function renderNewProductCreateTab() {
  const createState = getNewProductCreateState();
  return `
    <div class="section-card">
      <div class="section-head"><h3>新品录入页面</h3><div class="action-row"><button class="ghost-button" data-modal="export" data-action-label="下载导入模板">下载模板</button><button class="ghost-button" data-modal="form" data-action-label="Excel导入模板">Excel导入</button><button class="ghost-button" data-tab-switch="list">返回列表</button><button class="ghost-button" id="newProductCreateSaveDraftButton">保存</button><button class="primary-button" id="newProductCreateSubmitButton">提交</button></div></div>
      <div style="margin-top:12px;">
        <div class="pc-form-grid" style="margin-bottom:16px;">
          <div class="pc-form-field readonly"><div class="pc-form-label">货主</div><div class="pc-form-value">${createState.owner}</div></div>
          <div class="pc-form-field readonly"><div class="pc-form-label">单号</div><div class="pc-form-value">${createState.orderNo}</div></div>
          <div class="pc-form-field readonly"><div class="pc-form-label">提交人</div><div class="pc-form-value">${createState.submitter}</div></div>
          <div class="pc-form-field readonly"><div class="pc-form-label">时间</div><div class="pc-form-value">${createState.time}</div></div>
        </div>
        <div class="product-scan-area">
          <div class="product-scan-input-wrap">
            <div class="product-scan-icon" id="newProductScanIcon" title="扫码录入">&#9881;</div>
            <input class="product-scan-input" id="newProductScanInput" type="text" placeholder="请扫码或输入商品编码/条形码，如 MAT-NEW-001 或 6923000000018" />
            <button class="product-scan-btn" id="newProductSearchBtn">查询获取</button>
          </div>
        </div>
        <div id="newProductAutoFilledArea" style="display:none;"></div>
      </div>
      <div class="product-scan-result-area" id="newProductScanResultArea">
        <div class="drawer-table-wrap">
          <table>
            <thead>
              <tr><th><input type="checkbox" id="newProductSelectAllRows" /></th><th>序号</th><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>商品分类</th><th>品牌</th><th>型号</th><th>温层</th><th>包装数量</th></tr>
            </thead>
            <tbody id="newProductScanResultTbody">
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>1</td><td>MAT-NEW-001</td><td>6923000000018</td><td>新品-消杀喷雾</td><td>24瓶/箱</td><td>箱</td><td>清洁消杀</td><td>安洁</td><td>AJ-XP-24</td><td>常温</td><td>24</td></tr>
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>2</td><td>MAT-NEW-002</td><td>6923000000025</td><td>新品-医用手套</td><td>50盒/箱</td><td>箱</td><td>防护用品</td><td>护安</td><td>HA-GLOVE-50</td><td>常温</td><td>50</td></tr>
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>3</td><td>MAT-INV-001</td><td>6906000000019</td><td>物料-低值易耗品001</td><td>12瓶/箱</td><td>箱</td><td>低值易耗品</td><td>自有品牌A</td><td>INV-A-12</td><td>常温</td><td>12</td></tr>
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>4</td><td>MAT-INV-002</td><td>6906000000026</td><td>物料-商品002</td><td>24袋/箱</td><td>箱</td><td>日化用品</td><td>日化品牌B</td><td>RH-B-24</td><td>常温</td><td>24</td></tr>
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>5</td><td>MAT-INV-003</td><td>6906000000033</td><td>物料-商品003</td><td>6盒/箱</td><td>箱</td><td>食品</td><td>食品品牌C</td><td>SP-C-06</td><td>冷藏</td><td>6</td></tr>
              <tr><td><input type="checkbox" class="newProductRowCheckbox" /></td><td>6</td><td>MAT-IN-001</td><td>6923000001021</td><td>医用口罩</td><td>100只/箱</td><td>箱</td><td>防护用品</td><td>护安</td><td>HA-MASK-100</td><td>常温</td><td>100</td></tr>
            </tbody>
          </table>
        </div>
        <div class="action-row" style="margin-top:10px;padding:0 2px;">
          <button class="ghost-button" id="newProductAddRowButton">新增行</button>
          <button class="ghost-button" id="newProductDeleteRowButton">删除行</button>
        </div>
      </div>
    </div>`;
}

function renderNewProductEditTab() {
  const editState = getNewProductEditState();
  return `
    <div class="grid-2">
      <div class="section-card">
        <div class="section-head"><h3>修改控制台</h3><div class="action-row"><button class="ghost-button" data-tab-switch="list">返回列表</button></div></div>
        <div class="info-grid">
          <div class="info-item"><div class="k">单号</div><div>${editState.orderNo}</div></div>
          <div class="info-item"><div class="k">货主</div><div>${editState.owner}（来源于当前登录用户，不允许编辑）</div></div>
          <div class="info-item"><div class="k">修改模式</div><div>${editState.editMode}</div></div>
          <div class="info-item"><div class="k">当前状态</div><div>${editState.recordStatus}</div></div>
          <div class="info-item"><div class="k">审批状态</div><div>${editState.approveStatus}</div></div>
          <div class="info-item"><div class="k">下一处理人</div><div>${editState.nextApprover}</div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h3>编辑说明</h3><div class="action-row"><button class="ghost-button" data-modal="view" data-action-label="查看修改说明">查看修改说明</button></div></div>
        <div class="list">
          <div class="list-row"><div><div class="list-title">编辑入口</div><div class="muted">仅草稿状态记录可点击列表中的编辑按钮进入当前修改页面。</div></div><span class="tag blue">受控</span></div>
          <div class="list-row"><div><div class="list-title">审批意见</div><div class="muted">${editState.approveComment}</div></div><span class="tag orange">跟踪中</span></div>
          <div class="list-row"><div><div class="list-title">驳回原因</div><div class="muted">${editState.rejectReason}</div></div><span class="tag red">参考</span></div>
        </div>
      </div>
    </div>
    <div class="section-card" style="margin-top:10px;">
      <div class="section-head"><h3>新品修改页面</h3><div class="action-row"><button class="ghost-button" data-modal="refresh" data-action-label="刷新校验结果">刷新校验结果</button><button class="ghost-button" id="newProductEditSaveDraftButton">保存草稿</button><button class="primary-button" id="newProductEditSubmitButton">重新提交审批</button></div></div>
      ${renderNewProductFieldCards([
        { label: "货主", value: `${editState.owner}（来源于当前登录用户）`, readonly: true },
        { label: "单号", value: editState.orderNo, readonly: true },
        { label: "提交人", value: editState.submitter || editState.owner, readonly: true },
        { label: "审批人", value: editState.approver || "-", readonly: true },
        { label: "时间", value: editState.time || "-", readonly: true },
        { label: "条形码", value: editState.barcode, filledValue: `${editState.barcode}（已调整）` },
        { label: "商品名称", value: editState.productName, filledValue: `${editState.productName}（已调整）` },
        { label: "规格", value: editState.spec, filledValue: `${editState.spec}（已调整）` },
        { label: "单位", value: editState.unit, filledValue: editState.unit },
        { label: "商品分类", value: editState.category, filledValue: `${editState.category}（已确认）` },
        { label: "品牌", value: editState.brand, filledValue: `${editState.brand}（已复核）` },
        { label: "型号", value: editState.model, filledValue: `${editState.model}（已调整）` },
        { label: "温层", value: editState.temperature, filledValue: editState.temperature },
        { label: "包装数量", value: editState.packQty, filledValue: `${editState.packQty}` },
        { label: "附件资料", value: editState.attachments, filledValue: `${editState.attachments}（已补传）`, width: "full" },
        { label: "审批意见", value: editState.approveComment, readonly: true },
        { label: "驳回原因", value: editState.rejectReason, readonly: true },
        { label: "下一处理人", value: editState.nextApprover, readonly: true },
        { label: "写入商品信息", value: editState.writeBackStatus, readonly: true, width: "full" }
      ])}
    </div>`;
}

function getActionButtonClass(text) {
  if (text.includes("驳回")) return "danger-button";
  if (text.includes("通过") || text.includes("刷新") || text.includes("重推") || text.includes("查询")) return "primary-button";
  return "ghost-button";
}

function renderStatusStrip(items = []) {
  return `<div class="status-strip">${items.map(([label, value, note]) => `
    <div class="status-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="note">${note}</div>
    </div>`).join("")}</div>`;
}

function buildFlowNavigator(type, key) {
  const menuItems = type === "pc" ? pcMenu.flatMap(group => group.items) : miniMenu;
  const currentFile = `${type}-${key}.html`;
  const index = menuItems.findIndex((item) => item.file === currentFile);
  let prev = index > 0 ? menuItems[index - 1] : null;
  let next = index >= 0 && index < menuItems.length - 1 ? menuItems[index + 1] : null;
  if (type === "mini" && index === -1) {
    const groupKey = getMiniStageGroupKey(key);
    const stageItems = miniStageConfigs[groupKey] || [];
    const stageIndex = stageItems.findIndex((item) => item.key === key);
    if (stageIndex !== -1) {
      prev = stageIndex > 0 ? { file: stageItems[stageIndex - 1].file, name: stageItems[stageIndex - 1].label } : null;
      next = stageIndex < stageItems.length - 1 ? { file: stageItems[stageIndex + 1].file, name: stageItems[stageIndex + 1].label } : null;
    }
  }
  const routeKey = type === "mini" ? getMiniStageGroupKey(key) : key;
  const routes = type === "pc" ? (pcDemoRoutes[key] || []) : (miniDemoRoutes[key] || miniDemoRoutes[routeKey] || []);

  return `
    <div class="flow-nav">
      <div class="flow-nav-main">
        ${prev ? `<a class="flow-link" href="${prev.file}">上一页：${prev.name}</a>` : `<span class="flow-link disabled">上一页：无</span>`}
        ${next ? `<a class="flow-link" href="${next.file}">下一页：${next.name}</a>` : `<span class="flow-link disabled">下一页：无</span>`}
        <a class="flow-link ghost" href="index.html">返回原型入口</a>
      </div>
      ${routes.length ? `<div class="flow-nav-route">${routes.map((item) => `<a class="route-chip" href="${item.file}">${item.label}</a>`).join("")}</div>` : ""}
    </div>`;
}

function renderPcJourney(key) {
  const routes = pcDemoRoutes[key] || [];
  if (!routes.length) return "";
  return `<div class="insight-card">
    <h3>演示跳转</h3>
    <div class="route-stack">
      ${routes.map((item) => `<a class="route-link-card" href="${item.file}">
        <div class="title">${item.label}</div>
        <div class="desc">点击后直接切换到下一个业务页面继续演示</div>
      </a>`).join("")}
    </div>
  </div>`;
}

function renderMiniJourney(key) {
  const groupKey = getMiniStageGroupKey(key);
  if (miniStageConfigs[groupKey]?.length > 1) return "";
  const routes = miniDemoRoutes[key] || miniDemoRoutes[getMiniStageGroupKey(key)] || [];
  if (!routes.length) return "";
  return `<div class="mini-section">
    <h4>建议下一页</h4>
    <div class="mini-route-grid">
      ${routes.map((item) => `<a class="mini-route-card" href="${item.file}">
        <div class="title">${item.label}</div>
        <div class="desc">继续演示下一个移动端业务场景</div>
      </a>`).join("")}
    </div>
  </div>`;
}

function renderPcAside(key) {
  const insight = pcInsights[key];
  if (!insight) return "";
  return `
    <div class="content-side">
      <div class="insight-card">
        <h3>页面焦点</h3>
        <div class="insight-item">
          <div class="title">建议讲法</div>
          <div class="desc">${insight.focus}</div>
        </div>
      </div>
      <div class="insight-card">
        <h3>关注角色</h3>
        <div class="insight-item">
          <div class="title">适用人群</div>
          <div class="desc">${insight.roles}</div>
        </div>
      </div>
      <div class="insight-card">
        <h3>下一步演示</h3>
        <div class="insight-list">
          ${((pcDemoRoutes[key] || []).length ? pcDemoRoutes[key] : insight.next.map((item) => ({ label: item }))).map((item, index) => `
            <a class="insight-item link" ${item.file ? `href="${item.file}"` : ""}>
              <div class="title">步骤 ${index + 1}</div>
              <div class="desc">${item.label}</div>
            </a>`).join("")}
        </div>
      </div>
      ${renderPcJourney(key)}
    </div>`;
}

function renderMiniBadges(key) {
  const items = miniHighlights[key] || miniHighlights[getMiniStageGroupKey(key)] || [];
  return `<div class="mini-badges">${items.map(item => `<div class="mini-badge">${item}</div>`).join("")}</div>`;
}

function renderMiniTip(key) {
  const text = miniTips[key] || miniTips[getMiniStageGroupKey(key)];
  if (!text) return "";
  return `<div class="mini-tip"><div class="title">演示提示</div><div class="desc">${text}</div></div>`;
}

function inferModalType(text) {
  if (text.includes("新建") || text.includes("新增") || text.includes("发起")) return "form";
  if (text.includes("审核") || text.includes("通过") || text.includes("驳回") || text.includes("转交")) return "approve";
  if (text.includes("导出")) return "export";
  if (text.includes("批量重推")) return "push";
  if (text.includes("重试") || text.includes("重推") || text.includes("刷新接收")) return "retry";
  if (text.includes("日志")) return "log";
  if (text.includes("权限")) return "permission";
  if (text.includes("刷新")) return "refresh";
  if (text.includes("查看")) return "view";
  return "view";
}

const pcFormConfigs = {
  "新建要货单": {
    title: "新建客户要货单",
    sub: "用于演示 PC 端新建要货单时的表单录入和提交校验。",
    note: "点击标红字段可模拟补全后再次提交，适合展示 PC 端表单校验体验。",
    fields: [
      ["客户", "请选择客户", "内部客户-华东分部"],
      ["货主", "请选择货主", "自有货主A"],
      ["发货仓", "请选择发货仓", "华东1仓"],
      ["商品明细", "点击选择商品与数量", "已选择 2 个商品 / 数量 260", "full"],
      ["期望发货时间", "请选择时间", "2026-05-27 10:00"],
      ["收货信息", "请填写收货地址与联系人", "上海市浦东新区XX路18号 / 张三 / 13800000000", "full"]
    ],
    required: ["客户", "商品明细", "期望发货时间"]
  },
  "新增申请": {
    title: "新增入库申请单",
    sub: "用于演示 PC 端新增入库申请时的字段录入和校验。",
    columns: 5,
    fields: [
      ["货主", "请选择外部货主", "外部货主B"],
      ["入库仓库", "请选择入库仓库", "华南2仓"],
      ["预约入库时间", "请选择预约时间", "2026-05-27 09:30"],
      ["联系人", "请填写联系人", "李波 / 13900000000"],
      ["备注", "可填写补充说明", "外部货主预约到仓"],
      ["商品明细", "点击维护入库商品与数量", "已维护 4 个商品 / 数量 180", "full"]
    ],
    required: ["货主", "入库仓库", "商品明细"]
  },
  "编辑申请": {
    title: "编辑入库申请单",
    sub: "用于演示 PC 端对草稿入库申请单进行修改和再次提交。",
    columns: 5,
    fields: [
      ["货主", "请选择外部货主", "外部货主B"],
      ["入库仓库", "请选择入库仓库", "华南2仓"],
      ["预约入库时间", "请选择预约时间", "2026-05-27 09:30"],
      ["联系人", "请填写联系人", "李波 / 13900000000"],
      ["备注", "可填写补充说明", "草稿单据修改后待重新提交"],
      ["商品明细", "点击维护入库商品与数量", "已维护 4 个商品 / 数量 180", "full"]
    ],
    required: ["货主", "入库仓库", "商品明细"]
  },
  "新建退仓": {
    title: "新建退仓申请",
    sub: "用于演示 PC 端新建退仓时的原单回溯前置校验。",
    note: "后续可继续补原单检索、可退数量校验和异常原因下拉。",
    fields: [
      ["原配送单", "请输入原配送单号", "PS20260521012"],
      ["客户", "请选择客户", "内部客户-华东分部"],
      ["退仓商品", "点击选择退仓商品", "已选择 1 个商品 / 数量 20", "full"],
      ["退仓原因", "请填写退仓原因", "门店误收，申请退回"],
      ["退回仓库", "请选择退回仓库", "华东1仓"],
      ["备注", "可填写补充说明", "现场包装完好", "full"]
    ],
    required: ["原配送单", "退仓商品", "退仓原因"]
  },
  "发起损溢": {
    title: "发起损溢申请",
    sub: "用于演示 PC 端损溢申请的录入与校验过程。",
    note: "后续可继续补附件上传、责任认定和审批链路展示。",
    fields: [
      ["仓库", "请选择仓库", "华南2仓"],
      ["货主", "请选择货主", "自有货主A"],
      ["商品与数量", "点击选择商品与损溢数量", "物料-商品005 / 数量 32", "full"],
      ["损溢原因", "请选择或填写损溢原因", "破损"],
      ["责任说明", "请填写责任说明", "责任人王婷，现场破损已确认", "full"],
      ["备注", "可填写补充说明", "已同步仓库主管", "full"]
    ],
    required: ["仓库", "商品与数量", "责任说明"]
  },
  "新建转移": {
    title: "新建物权转移单",
    sub: "用于演示 PC 端货权转移场景下的基础信息录入和校验。",
    note: "后续可继续补合同校验结果、库存可用量和规则提示。",
    fields: [
      ["原货主", "请选择原货主", "外部货主B"],
      ["目标货主", "请选择目标货主", "自有货主A"],
      ["仓库", "请选择仓库", "华东1仓"],
      ["商品明细", "点击选择转移商品与数量", "已选择 1 个商品 / 数量 260", "full"],
      ["生效时间", "请选择生效时间", "2026-05-27 14:00"],
      ["转移原因", "请填写转移原因", "外部货主商品转自有货主", "full"]
    ],
    required: ["原货主", "目标货主", "商品明细"]
  }
};

const pcListConfigs = {
  demand: {
    filters: ["客户", "货主", "发货仓", "履约状态", "来源", "日期范围", "是否内部客户", "创建人"],
    emptyTitle: "未查询到客户要货单",
    emptyDesc: "可调整客户、货主、发货仓或日期范围后重新查询，也可新建要货单。",
    total: 128
  },
  newproduct: {
    filters: ["单号", "货主", "商品分类", "温层", "包装数量", "重量(kg)", "录入状态", "审批状态", "写入商品信息", "日期范围"],
    emptyTitle: "未查询到新品录入单记录",
    emptyDesc: "当前筛选条件下没有新品录入单，可调整来源方式或审批状态后重试。",
    total: 15
  },
  purchasein: {
    filters: ["单据号", "货主", "仓库", "库存状态", "资源资产状态", "BMS状态"],
    emptyTitle: "未查询到入库单记录",
    emptyDesc: "当前筛选条件下没有新的入库单记录，可调整时间范围后重试。",
    total: 32
  },
  productinfo: {
    filters: ["商品编码", "商品名称", "商品分类", "品牌", "型号", "温层", "包装数量", "重量(kg)", "状态", "维护方式", "来源单据"],
    emptyTitle: "未查询到商品信息",
    emptyDesc: "请调整商品编码、分类或维护方式后重新查询商品主数据。",
    total: 2860
  },
  org: {
    filters: ["组织编码", "组织名称", "组织类型", "上级组织", "所属区域", "负责人", "状态"],
    emptyTitle: "未查询到组织信息",
    emptyDesc: "请调整组织编码、类型或区域后重新查询。",
    total: 46
  },
  supplier: {
    filters: ["供应商编码", "供应商名称", "供应商类型", "合作模式", "主营品类", "结算方式", "状态"],
    emptyTitle: "未查询到供应商信息",
    emptyDesc: "请调整供应商编码或类型后重新查询。",
    total: 128
  },
  warehouse: {
    filters: ["仓库编码", "仓库名称", "仓库类型", "所属区域", "温层支持", "状态"],
    emptyTitle: "未查询到配送仓信息",
    emptyDesc: "请调整仓库编码或区域后重新查询。",
    total: 18
  },
  warehouserelation: {
    filters: ["关系编号", "前置仓编码", "前置仓名称", "中央仓编码", "中央仓名称", "关系状态", "生效日期"],
    emptyTitle: "未查询到仓库关系记录",
    emptyDesc: "当前筛选条件下没有仓库关系记录，可调整前置仓或中央仓条件后重试。",
    total: 7
  },
  vehicle: {
    filters: ["车辆编码", "车牌号", "车辆类型", "载重(吨)", "所属区域", "承运商", "温控能力", "状态"],
    emptyTitle: "未查询到车辆信息",
    emptyDesc: "请调整车牌号或区域后重新查询。",
    total: 86
  },
  sla: {
    filters: ["规则编码", "规则名称", "业务环节", "标准时效", "区域", "温层要求", "状态"],
    emptyTitle: "未查询到时效规则",
    emptyDesc: "请调整业务环节或区域后重新查询。",
    total: 24
  },
  storeordercycle: {
    filters: ["门店编码", "门店名称", "所属客户", "要货周期类型", "可要货日期", "状态", "生效日期"],
    emptyTitle: "未查询到要货周期规则",
    emptyDesc: "请调整门店、客户或周期类型条件后重新查询。",
    total: 152
  },
  returnapply: {
    filters: ["申请单号", "来源方式", "货主", "申请仓库", "申请状态", "生成通知", "日期范围"],
    emptyTitle: "未查询到退货申请单记录",
    emptyDesc: "当前筛选条件下没有新的退货申请单，可调整来源方式或日期范围后重试。",
    total: 12
  },
  returnnotice: {
    filters: ["通知单号", "来源申请单", "货主", "通知仓库", "WMS下发", "生成方式", "日期范围"],
    emptyTitle: "未查询到退货通知单记录",
    emptyDesc: "当前筛选条件下没有新的退货通知单，可调整通知状态或日期范围后重试。",
    total: 5
  },
  purchasereturn: {
    filters: ["单据号", "货主", "仓库", "库存状态", "BMS状态", "日期范围"],
    emptyTitle: "未查询到退货单记录",
    emptyDesc: "当前筛选条件下没有新的退货单记录，可调整单据号或日期范围后重试。",
    total: 11
  },
  qualityreport: {
    filters: ["报告编号", "货主", "仓库", "商品编码", "商品名称", "生产批号", "供应商", "报告类型", "检验结论", "日期范围"],
    emptyTitle: "未查询到质检报告",
    emptyDesc: "当前筛选条件下没有质检报告记录，可调整货主、商品或批号条件后重试。",
    total: 15
  },
  errororder: {
    filters: ["差错单号", "关联配送单", "客户", "货主", "发货仓库", "差错类型", "差错状态", "发现日期"],
    emptyTitle: "未查询到差错单记录",
    emptyDesc: "当前筛选条件下没有差错单记录，可调整关联配送单或差错状态后重试。",
    total: 4
  },
  delivery: {
    filters: ["单据号", "配送申请单号", "来源要货单", "客户", "货主", "发货仓", "是否需要运输服务", "运输单号", "当前节点", "日期范围"],
    emptyTitle: "未查询到配送发货申请记录",
    emptyDesc: "当前筛选条件下没有配送发货申请记录，可调整客户、货主或仓库条件后重试。",
    total: 3
  },
  deliveryorder: {
    filters: ["配送单号", "配送申请单号", "来源要货单", "客户", "货主", "仓库", "库存状态", "签收状态", "BMS状态", "日期范围"],
    emptyTitle: "未查询到配送单记录",
    emptyDesc: "当前筛选条件下没有配送单记录，可调整客户、货主或仓库条件后重试。",
    total: 46
  },
  transportservice: {
    filters: ["申请单号", "配送申请单号", "来源要货单", "客户", "货主", "发货仓", "运输方式", "承运商", "运输状态", "日期范围"],
    emptyTitle: "未查询到运输服务申请单记录",
    emptyDesc: "当前筛选条件下没有运输服务申请单记录，可调整承运商、运输方式或状态条件后重试。",
    total: 3
  },
  returnapplyin: {
    filters: ["申请单号", "来源方式", "客户", "原货主", "退回仓", "申请状态", "生成通知", "日期范围"],
    emptyTitle: "未查询到退仓申请单记录",
    emptyDesc: "当前筛选条件下没有新的退仓申请单，可调整来源方式、客户或状态条件后重试。",
    total: 9
  },
  returnnoticein: {
    filters: ["通知单号", "来源申请单", "原货主", "退回仓", "WMS下发", "生成方式", "日期范围"],
    emptyTitle: "未查询到退仓通知单记录",
    emptyDesc: "当前筛选条件下没有新的退仓通知单，可调整通知状态或日期范围后重试。",
    total: 4
  },
  ownershipapply: {
    filters: ["申请单号", "原货主", "目标货主", "仓库", "申请状态", "生成通知", "商品编码", "条形码", "日期范围"],
    emptyTitle: "未查询到物权转移申请单记录",
    emptyDesc: "当前筛选条件下没有新的物权转移申请单，可调整货主、仓库或状态条件后重试。",
    total: 7
  },
  ownershipnotice: {
    filters: ["通知单号", "来源申请单", "原货主", "目标货主", "仓库", "WMS下发", "日期范围"],
    emptyTitle: "未查询到物权转移通知单记录",
    emptyDesc: "当前筛选条件下没有新的物权转移通知单，可调整通知状态或日期范围后重试。",
    total: 4
  },
  return: {
    filters: ["退仓单号", "客户", "原货主", "退回仓", "退仓状态", "审批状态"],
    emptyTitle: "未查询到退仓单",
    emptyDesc: "当前筛选条件没有匹配数据，可调整来源单据号或状态条件后重新查询。",
    total: 33
  },
  transfer: {
    filters: ["调拨单号", "调出仓", "调入仓", "货主", "调拨状态", "BMS状态"],
    emptyTitle: "未查询到调拨记录",
    emptyDesc: "当前筛选范围内没有调拨结果，可切换仓库范围或日期范围查看。",
    total: 15
  },
  inventory: {
    filters: ["货主", "仓库", "商品", "库存状态", "预警状态", "批次", "效期"],
    emptyTitle: "未查询到库存结果",
    emptyDesc: "请调整货主、仓库、商品或批次条件后重新查询库存。",
    total: 12860
  },
  inventoryplan: {
    filters: ["计划单号", "货主", "盘点仓库", "盘点库存地点", "盘点类型", "盘点范围", "申请状态", "生成通知", "日期范围"],
    emptyTitle: "未查询到盘点计划申请单记录",
    emptyDesc: "当前筛选条件下没有盘点计划申请单，可调整来源方式或日期范围后重试。",
    total: 14
  },
  inventorynotify: {
    filters: ["通知单号", "来源申请单", "货主", "盘点仓库", "盘点类型", "WMS下发", "生成方式", "日期范围"],
    emptyTitle: "未查询到盘点通知单记录",
    emptyDesc: "当前筛选条件下没有盘点通知单，可调整通知状态或日期范围后重试。",
    total: 6
  },
  positionadjust: {
    filters: ["调整单号", "货主", "仓库", "原库存地点", "目标库存地点", "调整状态", "日期范围"],
    emptyTitle: "未查询到库存地点调整记录",
    emptyDesc: "当前筛选条件下没有库存地点调整单，可调整仓库或库存地点条件后重试。",
    total: 8
  },
  inventorycheck: {
    filters: ["盘点单号", "仓库", "货主", "盘点类型", "盘点结果", "确认状态", "差异类型", "日期范围"],
    emptyTitle: "未查询到盘点结果单",
    emptyDesc: "当前筛选条件下没有盘点结果单，可调整仓库、货主或状态条件后重试。",
    total: 11
  },
  owner: {
    filters: ["货主编码", "货主名称", "货主类型", "结算主体", "状态", "区域"],
    emptyTitle: "未查询到货主信息",
    emptyDesc: "请调整货主类型、状态或区域条件后重新查询货主主数据。",
    total: 36
  },
  customer: {
    filters: ["客户编码", "客户名称", "客户类型", "所属区域", "默认收货仓", "状态"],
    emptyTitle: "未查询到客户信息",
    emptyDesc: "请调整客户类型、区域或状态条件后重新查询客户资料。",
    total: 58
  },
  ownersupplier: {
    filters: ["关联编码", "货主名称", "供应商名称", "供应商类型", "合作模式", "结算方式", "状态"],
    emptyTitle: "未查询到货主供应商关联",
    emptyDesc: "请调整货主、供应商或合作模式条件后重新查询。",
    total: 42
  },
  customerstore: {
    filters: ["门店编码", "门店名称", "所属客户", "门店类型", "所属区域", "配送仓", "状态"],
    emptyTitle: "未查询到门店档案",
    emptyDesc: "请调整门店名称、客户或区域条件后重新查询。",
    total: 186
  },
  ownercustomer: {
    filters: ["客户名称", "货主名称", "关系类型", "默认货主", "状态", "生效日期"],
    emptyTitle: "未查询到货主客户关系",
    emptyDesc: "请调整客户、货主或关系状态条件后重新查询关系数据。",
    total: 74
  },
  ownerwarehouse: {
    filters: ["货主名称", "仓库名称", "关系类型", "默认入库仓", "默认发货仓", "状态"],
    emptyTitle: "未查询到货主仓库关系",
    emptyDesc: "请调整货主、仓库或状态条件后重新查询关系配置。",
    total: 42
  },
  customerstorerelation: {
    filters: ["门店编码", "门店名称", "所属客户", "配送仓库名称", "库存地点", "关系状态", "生效日期"],
    emptyTitle: "未查询到客户门店关系",
    emptyDesc: "请调整门店、客户或仓库条件后重新查询关系配置。",
    total: 186
  },
  finance: {
    filters: ["业务单据号", "单据类型", "传单状态", "BMS回执", "差异状态", "日期范围"],
    emptyTitle: "未查询到财务协同任务",
    emptyDesc: "当前筛选范围内没有待处理财务任务，可切换状态后重新查询。",
    total: 24
  },
  logs: {
    filters: ["接口名称", "调用方向", "关联单据", "调用状态", "失败类型", "日期范围"],
    emptyTitle: "未查询到接口日志",
    emptyDesc: "当前筛选条件没有匹配的接口日志，可调整失败类型或时间范围后重试。",
    total: 68
  },
  reportcenter: {
    filters: ["报表类型", "时间范围", "区域", "仓库", "货主", "业务环节"],
    emptyTitle: "未查询到报表数据",
    emptyDesc: "当前筛选条件下没有报表数据，可调整时间范围或区域后重试。",
    total: 15
  },
  warehouserelation: {
    filters: ["关系编号", "前置仓编码", "前置仓名称", "中央仓编码", "中央仓名称", "关系状态", "生效日期"],
    emptyTitle: "未查询到仓库关系记录",
    emptyDesc: "当前筛选条件下没有仓库关系记录，可调整前置仓或中央仓条件后重试。",
    total: 7
  }
};

const pcVisualConfigs = {
  dashboard: {
    eyebrow: "运营总览",
    headline: "把待办、履约、异常和接口风险放在同一屏里讲清楚",
    desc: "首页工作台用于承接管理层汇报与日常运营监控，强调今日履约表现、异常趋势、系统协同状态和建议演示路径。",
    tags: ["管理驾驶舱", "待办与预警", "WMS/TMS/BMS联动", "汇报展示首页"],
    metrics: [
      ["今日履约达成", "97.3%", "较昨日 +1.8%"],
      ["待办单据", "46", "审批与异常并行处理"],
      ["高优先告警", "7", "接口超时 3 / 库存风险 4"]
    ],
    highlights: [
      ["运营视角", "同时关注客户要货、配送、财务回执和接口异常。"],
      ["讲解路径", "建议从首页切入，再演示客户要货、配送单、财务协同和接口日志。"]
    ]
  },
  demand: {
    eyebrow: "履约起点",
    headline: "客户需求、货主匹配和发货仓选择在同一页闭环处理",
    desc: "客户要货单是履约主链路的起点，页面重点体现来源方式、关系匹配、履约状态和生成配送单的业务推进。",
    tags: ["需求入口", "关系匹配", "履约协同", "批量处理"],
    metrics: [
      ["待履约单据", "128", "今日新进 34 单"],
      ["自动匹配成功率", "99.1%", "货主客户关系 + 仓库关系"],
      ["待审核", "18", "接口导入优先处理"]
    ],
    highlights: [
      ["设计重点", "让查询筛选、状态标签和生成配送动作更突出。"],
      ["业务可信度", "保留真实客户、货主、仓库、来源和履约状态字段。"]
    ]
  },
  delivery: {
    eyebrow: "仓配协同",
    headline: "让配送执行、轨迹回传和签收状态一眼可见",
    desc: "配送单连接客户要货与仓配执行，重点展示 WMS 拣货、TMS 接单、签收跟踪和后续退仓链路入口。",
    tags: ["WMS/TMS联动", "执行轨迹", "签收回传", "退仓入口"],
    metrics: [
      ["执行中配送", "46", "WMS/TMS 实时同步"],
      ["异常签收", "4", "需跟进回单与门店反馈"],
      ["准时签收率", "94.8%", "本周稳定运行"]
    ],
    highlights: [
      ["展示重点", "强化轨迹时间线和系统协同信息的层次。"],
      ["后续链路", "可自然跳转到退仓申请单、退仓通知单和退仓单。"]
    ]
  },
  deliveryorder: {
    eyebrow: "仓储执行",
    headline: "WMS出库回传一目了然，库存扣减与财务回传全程可追溯",
    desc: "配送单由WMS出库完成后回传生成，展示出库数量、签收数量、库存扣减和财务回传的完整闭环。",
    tags: ["WMS回传", "库存扣减", "签收对账", "BMS联动"],
    metrics: [
      ["今日配送单", "32", "WMS出库回传完成"],
      ["签收差异", "2", "出库与签收数量不一致"],
      ["BMS回传率", "96.9%", "仅1单待回执"]
    ],
    highlights: [
      ["展示重点", "突出出库数量与签收数量对比，以及库存扣减和财务回传状态。"],
      ["后续链路", "可跳转到差错单、库存台账和财务协同。"]
    ]
  },
  transportservice: {
    eyebrow: "运输协同",
    headline: "从配送触发到承运执行，运输全流程透明可控",
    desc: "运输服务申请单承接配送需求，匹配承运商并跟踪运输执行、签收和结算状态。",
    tags: ["承运匹配", "运输跟踪", "签收回传", "运费结算"],
    metrics: [
      ["运输中", "12", "承运商已接单出发"],
      ["待发运", "5", "待承运商安排提货"],
      ["已完成", "28", "近7日签收完成"],
      ["异常运输", "2", "需跟进延迟运单"]
    ],
    highlights: [
      ["展示重点", "强化承运商匹配、运输轨迹和签收回传的业务闭环。"],
      ["后续链路", "可自然跳转到配送发货申请、接口日志和财务协同。"]
    ]
  },
  inbound: {
    eyebrow: "入库协同",
    headline: "从申请、审批到通知下发，形成可演示的标准入库链路",
    desc: "入库申请单页面重点表现外部货主申请、商品明细维护、批量提交审批和入库通知生成的全流程视图。",
    tags: ["外部货主入库", "商品明细", "Excel导入", "审批推进"],
    metrics: [
      ["待审批申请", "19", "草稿与待审批并行"],
      ["已生成通知", "4", "审批通过自动转换"],
      ["待回传BMS", "14", "财务协同持续跟进"]
    ],
    highlights: [
      ["交互重点", "保留新增、编辑、删除、查看、提交和审批的完整闭环。"],
      ["视觉重点", "让商品明细、状态机和侧边说明区更适合汇报展示。"]
    ]
  },
  returnapplyin: {
    eyebrow: "回仓申请",
    headline: "退仓申请、审批和通知生成形成回仓闭环",
    desc: "退仓申请单页面需要同时体现来源方式、客户、原货主、退回仓、商品明细和审批结果，适合作为异常回仓场景的演示页。",
    tags: ["退仓申请", "资源资产传入", "审批生成通知", "回仓追溯"],
    metrics: [
      ["待审批申请", "2", "含接口引入与手工创建"],
      ["已生成通知", "3", "审批通过自动生成"],
      ["待WMS下发", "1", "通知单仍在执行前"]
    ],
    highlights: [
      ["业务特点", "强调原配送单回溯、原货主识别和退回仓确认。"],
      ["展示重点", "让申请单状态、明细数量和审批口径更清晰。"]
    ]
  },
  ownershipapply: {
    eyebrow: "货权转换",
    headline: "把原货主、目标货主和库存归属变化讲清楚",
    desc: "物权转移申请单用于表现货权从外部货主转向自有货主的场景，页面重点是转移双方、仓库范围、明细商品和审批生成通知。",
    tags: ["物权转移", "归属调整", "审批生成通知", "库存属性变更"],
    metrics: [
      ["草稿申请", "2", "待业务补齐生效信息"],
      ["待审批", "2", "转移规则待确认"],
      ["已生成通知", "3", "待 WMS 执行归属调整"]
    ],
    highlights: [
      ["业务可信度", "突出原货主、目标货主、仓库和生效时间。"],
      ["设计重点", "让规则复杂的页面也能保持简洁和可汇报性。"]
    ]
  },
  inoutrecord: {
    eyebrow: "库存留痕",
    headline: "集中追踪所有影响库存的入库、出库和归属调整动作",
    desc: "出入库记录页面用于统一沉淀 WMS 结果、申请单执行结果和系统回执，便于做库存追溯、对账核查和异常补偿。",
    tags: ["统一流水", "库存追溯", "对账留痕", "异常补偿"],
    metrics: [
      ["今日记录", "79", "入库 42 / 出库 37"],
      ["待补偿回执", "3", "资源资产与 BMS"],
      ["跨系统同步率", "98.7%", "近24小时稳定运行"]
    ],
    highlights: [
      ["展示重点", "按单据类型、动作方向、货主仓库和商品明细统一追溯。"],
      ["业务价值", "把库存变化、接口回执和财务留痕集中到一个页面说明。"]
    ]
  }
};

function renderActionButton(text, pageKey = "") {
  if (pageKey === "returnapply" && text === "新建申请") {
    return `<button class="${getActionButtonClass(text)}" id="returnApplyPageCreateButton">${text}</button>`;
  }
  if (pageKey === "returnapplyin" && text === "新建申请") {
    return `<button class="${getActionButtonClass(text)}" id="returnApplyInPageCreateButton">${text}</button>`;
  }
  if (pageKey === "ownershipapply" && text === "新建申请") {
    return `<button class="${getActionButtonClass(text)}" id="ownershipApplyPageCreateButton">${text}</button>`;
  }
  const modalType = inferModalType(text);
  return `<button class="${getActionButtonClass(text)}" data-modal="${modalType}" data-action-label="${text}">${text}</button>`;
}

function renderPcVisualHero(key, data) {
  const config = pcVisualConfigs[key];
  if (!config) return "";

  return `
    <div class="pc-visual-hero">
      <div class="pc-visual-main">
        <div class="pc-visual-eyebrow">${config.eyebrow}</div>
        <h2 class="pc-visual-title">${data.title}</h2>
        <div class="pc-visual-headline">${config.headline}</div>
        <div class="pc-visual-desc">${config.desc}</div>
        <div class="pc-visual-tags">${config.tags.map((item) => `<span class="pc-visual-tag">${item}</span>`).join("")}</div>
      </div>
      <div class="pc-visual-side">
        <div class="pc-visual-metrics">
          ${config.metrics.map(([label, value, note]) => `
            <div class="pc-visual-metric">
              <div class="metric-label">${label}</div>
              <div class="metric-value">${value}</div>
              <div class="metric-note">${note}</div>
            </div>`).join("")}
        </div>
        <div class="pc-visual-highlights">
          ${config.highlights.map(([title, desc]) => `
            <div class="pc-visual-highlight">
              <div class="highlight-title">${title}</div>
              <div class="highlight-desc">${desc}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

function renderModalMarkup() {
  return `
    <div class="modal-mask" id="globalModal">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="modalTitle">操作弹窗</div>
            <div class="modal-sub" id="modalSub">用于演示点击按钮后的原型反馈。</div>
          </div>
          <button class="ghost-button" data-close-modal="globalModal">关闭</button>
        </div>
        <div class="modal-body">
          <div class="modal-grid" id="modalFields"></div>
          <div class="modal-note" id="modalNote"></div>
        </div>
        <div class="modal-footer">
          <button class="ghost-button" data-close-modal="globalModal">取消</button>
          <button class="primary-button" id="modalPrimaryButton">确认</button>
        </div>
      </div>
    </div>`;
}

function renderDrawerMarkup() {
  return `
    <div class="drawer-mask" id="globalDrawer">
      <div class="drawer-panel">
        <div class="drawer-header">
          <div>
            <div class="drawer-title" id="drawerTitle">详情</div>
            <div class="drawer-sub" id="drawerSub"></div>
          </div>
          <button class="drawer-close-btn" onclick="document.getElementById('globalDrawer').classList.remove('show')">&times;</button>
        </div>
        <div class="drawer-body" id="drawerBody"></div>
        <div class="drawer-footer" id="drawerFooter">
          <button class="btn-secondary" data-close-drawer="globalDrawer">取消</button>
          <button class="btn-secondary" id="drawerEditButton" style="display:none;">编辑</button>
          <button class="btn-primary" id="drawerSaveButton" style="display:none;">保存</button>
          <button class="btn-primary" id="drawerPrimaryButton">查看完整详情</button>
        </div>
      </div>
    </div>`;
}

function renderToastMarkup() {
  return `<div class="toast-stack" id="globalToastStack"></div>`;
}

function renderPcListShell(key, content) {
  const config = pcListConfigs[key];
  if (!config) {
    return `
    <div class="section-card">
      <div class="list-toolbar">
        <div class="list-toolbar-left">
        </div>
        <div class="list-toolbar-right">
          <button class="ghost-button" data-list-action="expand-filter">展开筛选</button>
        </div>
      </div>
      <div class="list-filter-panel" data-list-filter-panel="collapsed">
        <div class="list-filter-grid">
          <div class="input">关键字：请输入</div>
        </div>
        <div class="list-filter-actions">
          <button class="ghost-button" data-list-action="collapse-filter">收起筛选</button>
          <button class="primary-button" data-list-action="query-list">执行查询</button>
        </div>
      </div>
      ${content}
    </div>`;
  }

  return `
    <div class="section-card">
      <div class="list-toolbar">
        <div class="list-toolbar-left">
        </div>
        <div class="list-toolbar-right">
          <button class="ghost-button" data-list-action="expand-filter">展开筛选</button>
        </div>
      </div>
      <div class="list-filter-panel" data-list-filter-panel="collapsed">
        <div class="list-filter-grid">
          ${config.filters.map((item) => `<div class="input">${item}：全部</div>`).join("")}
        </div>
        <div class="list-filter-actions">
          <button class="ghost-button" data-list-action="collapse-filter">收起筛选</button>
          <button class="primary-button" data-list-action="query-list">执行查询</button>
        </div>
      </div>
      <div data-list-content="normal">${content}</div>
      <div class="empty-state" data-list-content="empty" style="display:none;">
        <div class="empty-title">${config.emptyTitle}</div>
        <div class="empty-desc">${config.emptyDesc}</div>
        <button class="ghost-button" data-list-action="reset-list">恢复默认结果</button>
      </div>
    </div>`;
}

function getToastConfig(type, actionLabel) {
  if (type === "delivery-create") {
    return {
      type: "processing",
      title: "配送通知单已生成",
      desc: `${actionLabel || "当前要货单"}已生成配送通知任务，并准备下发 WMS/TMS。`
    };
  }

  if (type === "approve") {
    return {
      type: "success",
      title: `${actionLabel || "审核处理"}已提交`,
      desc: "审批结果已记录，并将回写业务状态推进后续流程。"
    };
  }

  if (type === "submit-draft") {
    return {
      type: "success",
      title: `${actionLabel || "草稿提交"}成功`,
      desc: "选中的草稿记录已提交，当前状态已更新为待审批。"
    };
  }

  if (type === "approve-newproduct") {
    return {
      type: "success",
      title: `${actionLabel || "审批"}成功`,
      desc: "选中的待审批记录已审核通过，并已更新为已写入状态。"
    };
  }

  if (type === "reject-newproduct") {
    return {
      type: "success",
      title: `${actionLabel || "驳回"}成功`,
      desc: "选中的待审批记录已驳回，当前已回写为驳回状态并退回草稿处理。"
    };
  }

  if (type === "save-draft-newproduct") {
    return {
      type: "success",
      title: `${actionLabel || "保存草稿"}成功`,
      desc: "当前新品资料已保存为草稿，可继续补充字段后再提交审批。"
    };
  }

  if (type === "export") {
    return {
      type: "processing",
      title: `${actionLabel || "导出"}处理中`,
      desc: "系统正在生成导出文件，可在导出记录中查看结果。"
    };
  }

  if (type === "retry" || type === "refresh") {
    return {
      type: "processing",
      title: `${actionLabel || "操作"}已发起`,
      desc: "系统正在重新拉取或重试处理，请稍后查看最新状态。"
    };
  }

  if (type === "push") {
    return {
      type: "processing",
      title: `${actionLabel || "批量重推"}已进入队列`,
      desc: "后台已创建批量任务，执行完成后会回写处理结果。"
    };
  }

  if (type === "log") {
    return {
      type: "error",
      title: `${actionLabel || "日志查看"}包含异常记录`,
      desc: "当前展示的是失败日志原型，可继续扩展报文与时间线信息。"
    };
  }

  if (type === "permission") {
    return {
      type: "success",
      title: "权限说明已确认",
      desc: "当前角色权限范围已展示，可继续细化为菜单与字段权限矩阵。"
    };
  }

  if (type === "form") {
    return {
      type: "success",
      title: `${actionLabel || "表单提交"}成功`,
      desc: "表单已通过前端校验，并已进入后续业务处理流程。"
    };
  }

  if (type === "delete-storeordercycle") {
    return {
      type: "success",
      title: `${actionLabel || "删除要货周期规则"}成功`,
      desc: "门店要货周期规则已从列表中移除。"
    };
  }

  if (type === "delete-inbound-draft") {
    return {
      type: "success",
      title: `${actionLabel || "草稿单据"}已删除`,
      desc: "当前草稿入库申请单已从列表中移除，可继续新建或查看其他单据。"
    };
  }

  if (type === "submit-inbound-draft") {
    return {
      type: "success",
      title: `${actionLabel || "入库申请提交"}成功`,
      desc: "选中的草稿入库申请单已提交，当前状态已更新为待审批。"
    };
  }

  if (type === "approve-inbound") {
    return {
      type: "success",
      title: `${actionLabel || "入库申请审批"}成功`,
      desc: "选中的待审批入库申请单已审核通过，并已自动生成入库通知单。"
    };
  }

  if (type === "reject-inbound") {
    return {
      type: "success",
      title: `${actionLabel || "入库申请驳回"}成功`,
      desc: "选中的待审批入库申请单已驳回，当前状态已退回草稿。"
    };
  }

  if (type === "save-returnapplyin-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退仓申请草稿"}已保存`,
      desc: "当前退仓申请单已保存为草稿，可继续补充商品明细后再提交审批。"
    };
  }

  if (type === "save-returnapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退货申请草稿"}已保存`,
      desc: "当前退货申请单已保存为草稿，可继续补充商品明细后再提交审批。"
    };
  }

  if (type === "delete-returnapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退货申请单"}已删除`,
      desc: "当前草稿退货申请单已从列表中移除。"
    };
  }

  if (type === "submit-returnapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退货申请提交"}成功`,
      desc: "选中的草稿退货申请单已提交，当前状态已更新为待审批。"
    };
  }

  if (type === "approve-returnapply") {
    return {
      type: "success",
      title: `${actionLabel || "退货申请审批"}成功`,
      desc: "选中的待审批退货申请单已审核通过，并已自动生成退货通知单。"
    };
  }

  if (type === "reject-returnapply") {
    return {
      type: "success",
      title: `${actionLabel || "退货申请驳回"}成功`,
      desc: "选中的待审批退货申请单已驳回，当前状态已退回草稿。"
    };
  }

  if (type === "delete-returnapplyin-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退仓申请单"}已删除`,
      desc: "当前草稿退仓申请单已从列表中移除。"
    };
  }

  if (type === "submit-returnapplyin-draft") {
    return {
      type: "success",
      title: `${actionLabel || "退仓申请提交"}成功`,
      desc: "选中的草稿退仓申请单已提交，当前状态已更新为待审批。"
    };
  }

  if (type === "approve-returnapplyin") {
    return {
      type: "success",
      title: `${actionLabel || "退仓申请审批"}成功`,
      desc: "选中的待审批退仓申请单已审核通过，并已自动生成退仓通知单。"
    };
  }

  if (type === "reject-returnapplyin") {
    return {
      type: "success",
      title: `${actionLabel || "退仓申请驳回"}成功`,
      desc: "选中的待审批退仓申请单已驳回，当前状态已退回草稿。"
    };
  }

  if (type === "save-ownershipapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "物权转移草稿"}已保存`,
      desc: "当前物权转移申请单已保存为草稿，可继续补充商品明细后再提交审批。"
    };
  }

  if (type === "delete-ownershipapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "物权转移申请单"}已删除`,
      desc: "当前草稿物权转移申请单已从列表中移除。"
    };
  }

  if (type === "submit-ownershipapply-draft") {
    return {
      type: "success",
      title: `${actionLabel || "物权转移申请提交"}成功`,
      desc: "选中的草稿物权转移申请单已提交，当前状态已更新为待审批。"
    };
  }

  if (type === "approve-ownershipapply") {
    return {
      type: "success",
      title: `${actionLabel || "物权转移申请审批"}成功`,
      desc: "选中的待审批物权转移申请单已审核通过，并已自动生成物权转移通知单。"
    };
  }

  if (type === "reject-ownershipapply") {
    return {
      type: "success",
      title: `${actionLabel || "物权转移申请驳回"}成功`,
      desc: "选中的待审批物权转移申请单已驳回，当前状态已退回草稿。"
    };
  }

  if (type === "save-row") {
    return {
      type: "success",
      title: `${actionLabel || "当前行"}已保存`,
      desc: "当前行修改内容已保存为原型反馈，可继续编辑其他商品行。"
    };
  }

  if (type === "delete-row") {
    return {
      type: "success",
      title: `${actionLabel || "当前行"}已删除`,
      desc: "当前行已从列表中移除，后续可继续补真实删除和恢复逻辑。"
    };
  }

  return {
    type: "success",
    title: `${actionLabel || "操作"}执行成功`,
    desc: "当前为原型级成功反馈，后续可继续接入真实业务结果。"
  };
}

function setDrawerPrimaryAction(label, actionType = "view", actionLabel = "", modalType = "") {
  const primaryButton = document.getElementById("drawerPrimaryButton");
  if (!primaryButton) return;
  primaryButton.textContent = label || "查看完整详情";
  primaryButton.dataset.drawerActionType = actionType;
  primaryButton.dataset.actionLabel = actionLabel || label || "查看完整详情";
  primaryButton.dataset.drawerModalType = modalType || "";
}

function buildInboundStatusTag(status) {
  const tagType = status === "草稿"
    ? "gray"
    : status === "待审批"
      ? "orange"
      : status === "已审核通过"
        ? "blue"
        : "green";
  return `<span class="tag ${tagType}">${status}</span>`;
}

function buildReturnApplyInStatusTag(status) {
  const tagType = status === "草稿"
    ? "gray"
    : status === "待审批"
      ? "orange"
      : status === "已审核通过"
        ? "blue"
        : "green";
  return `<span class="tag ${tagType}">${status}</span>`;
}

function buildReturnApplyStatusTag(status) {
  const tagType = status === "草稿"
    ? "gray"
    : status === "待审批"
      ? "orange"
      : status === "已审核通过"
        ? "blue"
        : "green";
  return `<span class="tag ${tagType}">${status}</span>`;
}

function buildInboundActionCell(status, orderNo = "") {
  const viewButton = `<button class="table-action-button" data-inbound-view-entry data-order-no="${orderNo}">查看</button>`;
  if (status !== "草稿") {
    return `<div class="table-action-group">${viewButton}</div>`;
  }
  return `<div class="table-action-group">${viewButton}<button class="table-action-button primary" data-inbound-edit-entry data-order-no="${orderNo}">编辑</button></div>`;
}

function buildReturnApplyInActionCell(status, orderNo = "") {
  const viewButton = `<button class="table-action-button" data-returnapplyin-view-entry data-order-no="${orderNo}">查看</button>`;
  if (status !== "草稿") {
    return `<div class="table-action-group">${viewButton}</div>`;
  }
  return `<div class="table-action-group">${viewButton}<button class="table-action-button primary" data-returnapplyin-edit-entry data-order-no="${orderNo}">编辑</button></div>`;
}

function buildReturnApplyActionCell(status, orderNo = "") {
  const viewButton = `<button class="table-action-button" data-returnapply-view-entry data-order-no="${orderNo}">查看</button>`;
  if (status !== "草稿") {
    return `<div class="table-action-group">${viewButton}</div>`;
  }
  return `<div class="table-action-group">${viewButton}<button class="table-action-button primary" data-returnapply-edit-entry data-order-no="${orderNo}">编辑</button></div>`;
}

function buildInboundSelectCell(status, orderNo = "", owner = "") {
  const disabled = ["草稿", "待审批"].includes(status) ? "" : "disabled";
  return `<input type="checkbox" data-inbound-submit-row data-order-no="${orderNo}" data-submit-status="${status}" data-submit-label="${orderNo} / ${owner}" ${disabled} />`;
}

function buildReturnApplyInSelectCell(status, orderNo = "", owner = "") {
  const disabled = ["草稿", "待审批"].includes(status) ? "" : "disabled";
  return `<input type="checkbox" data-returnapplyin-submit-row data-order-no="${orderNo}" data-submit-status="${status}" data-submit-label="${orderNo} / ${owner}" ${disabled} />`;
}

function buildReturnApplySelectCell(status, orderNo = "", owner = "") {
  const disabled = ["草稿", "待审批"].includes(status) ? "" : "disabled";
  return `<input type="checkbox" data-returnapply-submit-row data-order-no="${orderNo}" data-submit-status="${status}" data-submit-label="${orderNo} / ${owner}" ${disabled} />`;
}

function openDemandDelivery(orderNo) {
  const config = demandDeliveryConfigs[orderNo];
  const modal = document.getElementById("globalModal");
  if (!config || !modal) return;

  document.getElementById("modalTitle").textContent = `${config.title} - ${orderNo}`;
  document.getElementById("modalSub").textContent = config.sub;
  document.getElementById("modalFields").innerHTML = config.fields.map(([label, value]) => `
    <div class="modal-box">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>`).join("");
  document.getElementById("modalNote").textContent = config.note;

  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = config.primary;
  primaryButton.dataset.feedbackType = "delivery-create";
  primaryButton.dataset.actionLabel = orderNo;
  modal.classList.add("show");
}

function getReturnApplyInModalFormConfig(actionLabel) {
  if (!["新增退仓申请", "编辑退仓申请"].includes(actionLabel)) {
    return null;
  }

  const record = returnApplyInFormState.record || {};
  const isEdit = actionLabel === "编辑退仓申请";
  return {
    title: isEdit ? "编辑退仓申请单" : "新增退仓申请单",
    sub: isEdit
      ? "用于演示 PC 端对草稿退仓申请单进行修改和再次保存。"
      : "用于演示 PC 端新增退仓申请时的字段录入和校验。",
    note: isEdit
      ? "当前仅草稿状态单据显示行内编辑按钮，编辑时支持逐行维护商品明细和Excel导入。"
      : "当前支持逐行维护商品明细，也支持通过Excel导入商品明细后再提交申请。",
    fields: [
      ["原配送单", record.originOrderNo || "请输入原配送单号", record.originOrderNo || "PS20260521012"],
      ["客户", record.customer || "请选择客户", record.customer || "内部客户-华东分部"],
      ["原货主", record.owner || "请选择原货主", record.owner || "自有货主A"],
      ["退回仓", record.warehouse || "请选择退回仓", record.warehouse || "华东1仓"],
      ["商品明细", record.goodsSummary || "点击维护退仓商品与数量", record.goodsSummary || `已维护 1 个商品 / 数量 ${record.applyQty || "20"}`, "full"],
      ["退仓原因", record.reason || "请填写退仓原因", record.reason || "门店退仓，包装完整"],
      ["联系人", record.contact || "请填写联系人", record.contact || "李波 / 13900000000"],
      ["备注", record.remark || "可填写补充说明", record.remark || "草稿单据修改后待重新提交", "full"]
    ],
    required: ["原配送单", "客户", "原货主", "退回仓", "商品明细", "退仓原因"]
  };
}

function getReturnApplyModalFormConfig(actionLabel) {
  if (!["新增退货申请", "编辑退货申请"].includes(actionLabel)) {
    return null;
  }

  const record = returnApplyFormState.record || {};
  const isEdit = actionLabel === "编辑退货申请";
  return {
    title: isEdit ? "编辑退货申请单" : "新增退货申请单",
    sub: isEdit
      ? "用于演示 PC 端对草稿退货申请单进行修改和再次保存。"
      : "用于演示 PC 端新增退货申请时的字段录入和校验。",
    note: isEdit
      ? "当前仅草稿状态单据显示行内编辑按钮，编辑时支持逐行维护商品明细和Excel导入。"
      : "当前支持逐行维护商品明细，也支持通过Excel导入商品明细后再提交申请。",
    fields: [
      ["货主", record.owner || "请选择货主", record.owner || "外部货主B"],
      ["申请仓库", record.warehouse || "请选择申请仓库", record.warehouse || "华南2仓"],
      ["商品明细", record.goodsSummary || "点击维护退货商品与数量", record.goodsSummary || `已维护 1 个商品 / 数量 ${record.applyQty || "45"}`, "full"],
      ["联系人", record.contact || "请填写联系人", record.contact || "李波 / 13900000000"],
      ["退货原因", record.reason || "请填写退货原因", record.reason || "商品临期退回", "full"],
      ["备注", record.remark || "可填写补充说明", record.remark || "草稿单据修改后待重新提交", "full"]
    ],
    required: ["货主", "申请仓库", "商品明细", "退货原因"]
  };
}

function getOwnershipApplyModalFormConfig(actionLabel) {
  if (!["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)) {
    return null;
  }

  const record = ownershipApplyFormState.record || {};
  const isEdit = actionLabel === "编辑物权转移申请";
  return {
    title: isEdit ? "编辑物权转移申请单" : "新增物权转移申请单",
    sub: isEdit
      ? "用于演示 PC 端对草稿物权转移申请单进行修改和再次保存。"
      : "用于演示 PC 端新增物权转移申请时的字段录入和校验。",
    note: isEdit
      ? "当前仅草稿状态单据显示行内编辑按钮，编辑时支持逐行维护商品明细和Excel导入。"
      : "当前支持逐行维护商品明细，也支持通过Excel导入商品明细后再提交申请。",
    fields: [
      ["原货主", record.fromOwner || "请选择原货主", record.fromOwner || "外部货主B"],
      ["目标货主", record.toOwner || "请选择目标货主", record.toOwner || "自有货主A"],
      ["仓库", record.warehouse || "请选择仓库", record.warehouse || "华东1仓"],
      ["商品明细", record.goodsSummary || "点击维护转移商品与数量", record.goodsSummary || `已维护 1 个商品 / 数量 ${record.applyQty || "120"}`, "full"],
      ["生效时间", record.effectiveTime || "请选择生效时间", record.effectiveTime || "2026-05-27 14:00"],
      ["转移原因", record.reason || "请填写转移原因", record.reason || "外部货主商品转自有货主", "full"],
      ["附件资料", record.attachments || "可填写补充说明或上传依据", record.attachments || "转移申请说明/合同依据", "full"]
    ],
    required: ["原货主", "目标货主", "仓库", "商品明细", "转移原因"]
  };
}

function getStoreOrderCycleModalFormConfig(actionLabel) {
  if (!["新增要货周期规则", "编辑要货周期规则"].includes(actionLabel)) return null;
  const record = storeOrderCyclePageState.selectedEditRow || {};
  const isEdit = actionLabel === "编辑要货周期规则";
  return {
    title: isEdit ? "编辑要货周期规则" : "新增要货周期规则",
    sub: isEdit ? "修改门店的可要货周期规则，支持按周和按月两种模式。" : "定义门店的可要货周期规则，支持按周和按月两种模式。",
    note: "点击字段可模拟填写；规则编码系统自动生成，编辑时仅可查看当前状态。",
    columns: 2,
    fields: [
      ...(isEdit ? [["规则编码", record.ruleCode || "自动生成规则编码", record.ruleCode || "OC006"]] : []),
      ["门店编码", record.storeCode || "请选择门店", record.storeCode || "STORE001"],
      ["门店名称", record.storeName || "选择门店后自动带出", record.storeName || "浦东旗舰店"],
      ["所属客户", record.customer || "自动带出所属客户", record.customer || "内部客户-华东分部"],
      ["要货周期类型", record.cycleType || "请选择（按周/按月）", record.cycleType || "按周"],
      ["可要货日期", record.orderDays || "请选择可要货日期", record.orderDays || "周三、周五"],
      ["生效日期", record.effectDate || "请选择生效日期", record.effectDate || "2026-06-01"],
      ...(isEdit ? [["当前状态", record.status || "草稿", record.status || "草稿"]] : []),
      ["备注", record.remark || "可填写补充说明", record.remark || "", "full"]
    ],
    required: ["门店编码", "要货周期类型", "可要货日期", "生效日期"]
  };
}

function resolvePcFormConfig(actionLabel) {
  return getReturnApplyModalFormConfig(actionLabel)
    || getReturnApplyInModalFormConfig(actionLabel)
    || getOwnershipApplyModalFormConfig(actionLabel)
    || getStoreOrderCycleModalFormConfig(actionLabel)
    || pcFormConfigs[actionLabel];
}

function renderStoreOrderCycleForm(actionLabel) {
  const record = storeOrderCyclePageState.selectedEditRow || {};
  const isEdit = actionLabel === "编辑要货周期规则";
  const storeOptions = [
    { code: "STORE001", name: "浦东旗舰店", customer: "内部客户-华东分部" },
    { code: "STORE002", name: "临港社区店", customer: "内部客户-华东分部" },
    { code: "STORE003", name: "天河中心店", customer: "外部客户-门店联盟" },
    { code: "STORE004", name: "海珠网点", customer: "外部客户-门店联盟" },
    { code: "STORE005", name: "大兴新城店", customer: "内部客户-区域共享仓" }
  ];
  const selectedStore = storeOptions.find((store) => store.code === record.storeCode) || storeOptions[0];
  const ruleCode = record.ruleCode || "系统自动生成";
  const storeCodeValue = record.storeCode || "";
  const storeNameValue = record.storeName || selectedStore.name;
  const customerValue = record.customer || selectedStore.customer;
  const cycleTypeValue = record.cycleType || (isEdit ? "" : "按周");
  const orderDaysValue = record.orderDays || "";
  const effectDateValue = record.effectDate || "";
  const remarkValue = record.remark || "";
  const statusValue = record.status || "草稿";

  const weekdayList = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const selectedWeekDays = cycleTypeValue === "按周"
    ? orderDaysValue.split(/[，,、]/).map((item) => item.trim()).filter((item) => /^周[一二三四五六日]$/.test(item))
    : [];
  const selectedMonthDays = cycleTypeValue === "按月"
    ? orderDaysValue.replace(/每月/g, "").split(/[，,、]/).map((item) => item.trim().replace(/号$/, "")).filter(Boolean).map(Number).filter((item) => item >= 1 && item <= 31)
    : [];

  const weekDayButtons = weekdayList.map((day) => `
        <button type="button" class="pc-day-pill${selectedWeekDays.includes(day) ? " selected" : ""}" data-weekday="${day}">${day}</button>
      `).join("");
  const monthDayTags = selectedMonthDays.sort((a, b) => a - b).map((day) => `
        <span class="pc-day-tag" data-month-day="${day}">${day}号<button type="button" class="pc-day-remove" data-remove-month-day="${day}" aria-label="移除 ${day}号">×</button></span>
      `).join("");

  let orderDaysWidget = `<div class="pc-order-days-widget" id="socOrderDaysWidget">`;
  if (cycleTypeValue === "按周" || !cycleTypeValue) {
    orderDaysWidget += `
        <div class="pc-order-days-card week-card active" data-widget-mode="week">
          <div class="pc-order-days-card-title">按周配置</div>
          <div class="pc-weekday-picker">${weekDayButtons}</div>
          <div class="pc-form-hint">选择要货星期，多选后自动生成“周三、周五”。</div>
        </div>`;
  }
  if (cycleTypeValue === "按月") {
    orderDaysWidget += `
        <div class="pc-order-days-card month-card active" data-widget-mode="month">
          <div class="pc-order-days-card-title">按月配置</div>
          <div class="pc-calendar-grid" id="socMonthCalendar">
            ${Array.from({ length: 31 }, (_, index) => {
              const day = index + 1;
              const selected = selectedMonthDays.includes(day) ? " selected" : "";
              return `<button type="button" class="pc-calendar-day${selected}" data-calendar-day="${day}">${day}</button>`;
            }).join("")}
          </div>
          <div class="pc-monthday-tags" id="socMonthDayTags">${monthDayTags}</div>
          <div class="pc-form-hint">从日历中选择要货日期，支持多选且无数量上限，可按需选择 3 个以上（如 5号、10号、15号、20号、25号）。</div>
        </div>`;
  }
  orderDaysWidget += `</div>`;

  const orderDaysSummary = orderDaysValue
    ? `当前已配置：${orderDaysValue}`
    : `请先选择要货周期类型并配置要货日期`;

  return `
    <div class="pc-form-grid cols-4">
      ${isEdit ? `
      <div class="pc-form-field readonly" data-pc-form-label="规则编码">
        <div class="pc-form-label">规则编码</div>
        <div class="pc-form-value">${ruleCode}</div>
      </div>` : ""}

      <div class="pc-form-field required" data-pc-form-label="门店编码">
        <div class="pc-form-label">门店编码</div>
        <select class="pc-form-input" id="socStoreCode" aria-label="门店编码">
          <option value="">请选择门店</option>
          ${storeOptions.map((store) => `<option value="${store.code}" ${store.code === storeCodeValue ? "selected" : ""}>${store.code} / ${store.name}</option>`).join("")}
        </select>
      </div>

      <div class="pc-form-field readonly" data-pc-form-label="门店名称">
        <div class="pc-form-label">门店名称</div>
        <div class="pc-form-value" id="socStoreName">${storeNameValue}</div>
      </div>

      <div class="pc-form-field readonly" data-pc-form-label="所属客户">
        <div class="pc-form-label">所属客户</div>
        <div class="pc-form-value" id="socCustomer">${customerValue}</div>
      </div>

      <div class="pc-form-field required" data-pc-form-label="要货周期类型">
        <div class="pc-form-label">要货周期类型</div>
        <select class="pc-form-input" id="socCycleType" aria-label="要货周期类型">
          <option value="">请选择类型</option>
          <option value="按周" ${cycleTypeValue === "按周" ? "selected" : ""}>按周</option>
          <option value="按月" ${cycleTypeValue === "按月" ? "selected" : ""}>按月</option>
        </select>
      </div>

      <div class="pc-form-field double required" data-pc-form-label="可要货日期">
        <div class="pc-form-label">可要货日期</div>
        <div class="pc-order-days-panel">
          <div class="pc-order-days-main">
            <input class="pc-form-input" id="socOrderDays" type="text" placeholder="例如：周三、周五 或 每月 5号、15号" value="${orderDaysValue}" ${cycleTypeValue ? "readonly" : ""} />
            ${orderDaysWidget}
          </div>
          <div class="pc-order-days-summary" id="socOrderDaysSummary">${orderDaysSummary}</div>
        </div>
      </div>

      <div class="pc-form-field required" data-pc-form-label="生效日期">
        <div class="pc-form-label">生效日期</div>
        <input class="pc-form-input" id="socEffectDate" type="date" value="${effectDateValue}" />
      </div>

      ${isEdit ? `
      <div class="pc-form-field readonly" data-pc-form-label="当前状态">
        <div class="pc-form-label">当前状态</div>
        <div class="pc-form-value">${statusValue}</div>
      </div>` : ""}

      <div class="pc-form-field full" data-pc-form-label="备注">
        <div class="pc-form-label">备注</div>
        <textarea class="pc-form-input" id="socRemark" rows="3" placeholder="可填写补充说明">${remarkValue}</textarea>
      </div>
    </div>
  `;
}

function renderPcForm(actionLabel) {
  if (["新增要货周期规则", "编辑要货周期规则"].includes(actionLabel)) {
    return renderStoreOrderCycleForm(actionLabel);
  }

  const config = resolvePcFormConfig(actionLabel);
  if (!config) return "";
  const cols = config.columns || 2;
  const gridClass = cols > 2 ? `pc-form-grid cols-${cols}` : "pc-form-grid";
  const formGrid = `<div class="${gridClass}">${config.fields.map(([label, placeholder, filledValue, width]) => `
    <div class="pc-form-field ${width === "full" ? "full" : width === "double" ? "double" : ""}" data-pc-form-label="${label}" data-pc-filled-value="${filledValue}">
      <div class="pc-form-label">${label}</div>
      <div class="pc-form-value">${placeholder}</div>
    </div>`).join("")}</div>`;
  if (["新增申请", "编辑申请", "新增退货申请", "编辑退货申请", "新增退仓申请", "编辑退仓申请", "新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)) {
    return `${formGrid}${renderInboundApplyGoodsEditor(actionLabel)}`;
  }
  return formGrid;
}

function setPcFormFieldValue(label, value, filledValue = value) {
  const field = document.querySelector(`.pc-form-field[data-pc-form-label="${label}"]`);
  if (!field) return;
  const input = field.querySelector("input, select, textarea");
  if (input) {
    input.value = value;
  } else {
    const valueNode = field.querySelector(".pc-form-value");
    if (valueNode) valueNode.textContent = value;
  }
  field.dataset.pcFilledValue = filledValue;
  clearPcFieldError(field);
}

function getPcFormFieldValue(label) {
  const field = document.querySelector(`.pc-form-field[data-pc-form-label="${label}"]`);
  if (!field) return "";
  const control = field.querySelector("input, select, textarea");
  if (control) return control.value.trim();
  const valueNode = field.querySelector(".pc-form-value");
  return valueNode?.textContent?.trim() || "";
}

function buildStoreOrderCycleRecordFromForm() {
  return {
    rowId: storeOrderCyclePageState.selectedEditRow?.rowId || `oc-row-${Date.now()}`,
    ruleCode: storeOrderCyclePageState.selectedEditRow?.ruleCode || `OC${String(storeOrderCyclePageState.nextOrderSequence).padStart(3, "0")}`,
    storeCode: getPcFormFieldValue("门店编码"),
    storeName: getPcFormFieldValue("门店名称"),
    customer: getPcFormFieldValue("所属客户"),
    cycleType: getPcFormFieldValue("要货周期类型"),
    orderDays: getPcFormFieldValue("可要货日期"),
    effectDate: getPcFormFieldValue("生效日期"),
    status: storeOrderCyclePageState.selectedEditRow?.status || "草稿",
    remark: getPcFormFieldValue("备注")
  };
}

function saveStoreOrderCycleCreate() {
  const record = buildStoreOrderCycleRecordFromForm();
  if (!storeOrderCyclePageState.listRecords) getStoreOrderCycleListRecords();
  if (storeOrderCyclePageState.listRecords.some((item) => item.ruleCode === record.ruleCode)) {
    storeOrderCyclePageState.nextOrderSequence += 1;
    record.ruleCode = `OC${String(storeOrderCyclePageState.nextOrderSequence).padStart(3, "0")}`;
  }
  storeOrderCyclePageState.listRecords.unshift(record);
  storeOrderCyclePageState.nextOrderSequence += 1;
  return record;
}

function saveStoreOrderCycleEdit() {
  const record = buildStoreOrderCycleRecordFromForm();
  const targetIndex = getStoreOrderCycleListRecords().findIndex((item) => item.ruleCode === record.ruleCode);
  if (targetIndex > -1) {
    storeOrderCyclePageState.listRecords[targetIndex] = {
      ...storeOrderCyclePageState.listRecords[targetIndex],
      ...record
    };
  }
  return record;
}

function deleteStoreOrderCycleRecord(ruleCode) {
  if (!storeOrderCyclePageState.listRecords) getStoreOrderCycleListRecords();
  storeOrderCyclePageState.listRecords = storeOrderCyclePageState.listRecords.filter((item) => item.ruleCode !== ruleCode);
}

function cloneInboundApplyGoodsRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

function buildReturnApplyInGoodsRowFromRecord(record = {}, index = 1) {
  return {
    code: record.goodsCode || `MAT-TK-${String(index).padStart(3, "0")}`,
    barcode: record.barcode || `6908100000${String(index).padStart(3, "0")}`,
    name: record.productName || `退仓商品-${index}`,
    spec: record.spec || "12瓶/箱",
    unit: record.unit || "箱",
    qty: Number(record.applyQty || 20),
    tax: record.taxRate || "13%",
    untaxed: record.priceExTax || "42.48",
    taxed: record.priceIncTax || "48.00",
    batch: record.batchNo ? "是" : "否",
    expiry: record.expireDate ? "是" : "否",
    attachment: record.attachments || "现场照片/退仓说明"
  };
}

function getReturnApplyInGoodsPresetRows(mode = "manual") {
  if (mode === "excel") {
    return [
      { code: "MAT-TK-011", barcode: "6908100000112", name: "门店陈列箱", spec: "6个/箱", unit: "箱", qty: 12, tax: "13%", untaxed: "85.00", taxed: "96.05", batch: "否", expiry: "否", attachment: "退仓说明" },
      { code: "MAT-TK-012", barcode: "6908100000129", name: "展示物料包", spec: "10套/箱", unit: "箱", qty: 18, tax: "13%", untaxed: "56.00", taxed: "63.28", batch: "否", expiry: "否", attachment: "签收照片" },
      { code: "MAT-TK-013", barcode: "6908100000136", name: "促销赠品盒", spec: "24盒/箱", unit: "箱", qty: 25, tax: "13%", untaxed: "24.00", taxed: "27.12", batch: "是", expiry: "是", attachment: "退仓明细" },
      { code: "MAT-TK-014", barcode: "6908100000143", name: "终端补货包", spec: "20包/箱", unit: "箱", qty: 30, tax: "13%", untaxed: "33.00", taxed: "37.29", batch: "是", expiry: "是", attachment: "门店回传单" }
    ];
  }

  return [
    { code: "MAT-TK-001", barcode: "6908100000013", name: "物料-商品011", spec: "12瓶/箱", unit: "箱", qty: 30, tax: "13%", untaxed: "42.48", taxed: "48.00", batch: "是", expiry: "是", attachment: "现场照片" },
    { code: "MAT-TK-006", barcode: "6908100000068", name: "门店周转箱", spec: "8个/箱", unit: "箱", qty: 15, tax: "13%", untaxed: "28.00", taxed: "31.64", batch: "否", expiry: "否", attachment: "退仓说明" }
  ];
}

function prepareReturnApplyInFormState(mode = "create", record = null) {
  returnApplyInFormState.mode = mode;
  returnApplyInFormState.record = record ? { ...record } : null;
  returnApplyInFormState.goodsRows = record?.goodsRows?.length
    ? cloneInboundApplyGoodsRows(record.goodsRows)
    : record
      ? [buildReturnApplyInGoodsRowFromRecord(record)]
      : getReturnApplyInGoodsPresetRows("manual");
  returnApplyInFormState.goodsSourceLabel = record ? "草稿明细" : "手工录入";
}

function getReturnApplyInModalGoodsRows() {
  if (returnApplyInFormState.goodsRows?.length) {
    return cloneInboundApplyGoodsRows(returnApplyInFormState.goodsRows);
  }
  return getReturnApplyInGoodsPresetRows("manual");
}

function buildReturnApplyInGoodsSummary(rows = []) {
  const totalQty = rows.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  return `已维护 ${rows.length} 个商品 / 数量 ${totalQty}`;
}

function buildReturnApplyGoodsRowFromRecord(record = {}, index = 1) {
  return {
    code: record.goodsCode || `MAT-TH-${String(index).padStart(3, "0")}`,
    barcode: record.barcode || `6905000000${String(index).padStart(3, "0")}`,
    name: record.productName || `退货商品-${index}`,
    spec: record.spec || "12瓶/箱",
    unit: record.unit || "箱",
    qty: Number(record.applyQty || 45),
    tax: record.taxRate || "13%",
    untaxed: record.priceExTax || "42.48",
    taxed: record.priceIncTax || "48.00",
    batch: record.batchNo ? "是" : "否",
    expiry: record.expireDate ? "是" : "否",
    attachment: record.attachments || "退货说明"
  };
}

function getReturnApplyGoodsPresetRows(mode = "manual") {
  if (mode === "excel") {
    return [
      { code: "MAT-TH-011", barcode: "6905000000110", name: "低值易耗品-清洁剂", spec: "12瓶/箱", unit: "箱", qty: 45, tax: "13%", untaxed: "42.48", taxed: "48.00", batch: "是", expiry: "是", attachment: "退货说明" },
      { code: "MAT-TH-012", barcode: "6905000000127", name: "低值易耗品-防护手套", spec: "24袋/箱", unit: "箱", qty: 35, tax: "13%", untaxed: "26.55", taxed: "30.00", batch: "是", expiry: "是", attachment: "签收附件" },
      { code: "MAT-TH-013", barcode: "6905000000134", name: "低值易耗品-周转盒", spec: "10个/箱", unit: "箱", qty: 20, tax: "13%", untaxed: "16.00", taxed: "18.08", batch: "否", expiry: "否", attachment: "退货申请单" }
    ];
  }

  return [
    { code: "MAT-TH-001", barcode: "6905000000011", name: "低值易耗品-清洁剂", spec: "12瓶/箱", unit: "箱", qty: 45, tax: "13%", untaxed: "42.48", taxed: "48.00", batch: "是", expiry: "是", attachment: "退货说明" },
    { code: "MAT-TH-002", barcode: "6905000000028", name: "低值易耗品-防护手套", spec: "24袋/箱", unit: "箱", qty: 35, tax: "13%", untaxed: "26.55", taxed: "30.00", batch: "是", expiry: "是", attachment: "签收附件" }
  ];
}

function prepareReturnApplyFormState(mode = "create", record = null) {
  returnApplyFormState.mode = mode;
  returnApplyFormState.record = record ? { ...record } : null;
  returnApplyFormState.goodsRows = record?.goodsRows?.length
    ? cloneInboundApplyGoodsRows(record.goodsRows)
    : record
      ? [buildReturnApplyGoodsRowFromRecord(record)]
      : getReturnApplyGoodsPresetRows("manual");
  returnApplyFormState.goodsSourceLabel = record ? "草稿明细" : "手工录入";
}

function getReturnApplyModalGoodsRows() {
  if (returnApplyFormState.goodsRows?.length) {
    return cloneInboundApplyGoodsRows(returnApplyFormState.goodsRows);
  }
  return getReturnApplyGoodsPresetRows("manual");
}

function buildOwnershipApplyGoodsRowFromRecord(record = {}, index = 1) {
  return {
    code: record.goodsCode || `MAT-OWN-${String(index).padStart(3, "0")}`,
    barcode: record.barcode || `6911000000${String(index).padStart(3, "0")}`,
    name: record.productName || `转移商品-${index}`,
    spec: record.spec || "12瓶/箱",
    unit: record.unit || "箱",
    qty: Number(record.applyQty || 120),
    tax: record.taxRate || "13%",
    untaxed: record.priceExTax || "42.48",
    taxed: record.priceIncTax || "48.00",
    batch: record.batchNo ? "是" : "否",
    expiry: record.expireDate ? "是" : "否",
    attachment: record.attachments || "转移申请说明/合同依据"
  };
}

function getOwnershipApplyGoodsPresetRows(mode = "manual") {
  if (mode === "excel") {
    return [
      { code: "MAT-OWN-011", barcode: "6911000000113", name: "防护耗材包", spec: "20包/箱", unit: "箱", qty: 80, tax: "13%", untaxed: "31.00", taxed: "35.03", batch: "是", expiry: "是", attachment: "转移明细" },
      { code: "MAT-OWN-012", barcode: "6911000000120", name: "门店展示盒", spec: "12盒/箱", unit: "箱", qty: 60, tax: "13%", untaxed: "26.00", taxed: "29.38", batch: "否", expiry: "否", attachment: "合同依据" },
      { code: "MAT-OWN-013", barcode: "6911000000137", name: "易耗清洁包", spec: "24包/箱", unit: "箱", qty: 45, tax: "13%", untaxed: "18.00", taxed: "20.34", batch: "是", expiry: "是", attachment: "转移申请说明" }
    ];
  }

  return [
    { code: "MAT-OWN-001", barcode: "6911000000014", name: "物料-商品041", spec: "12瓶/箱", unit: "箱", qty: 120, tax: "13%", untaxed: "42.48", taxed: "48.00", batch: "是", expiry: "是", attachment: "转移申请说明/合同依据" },
    { code: "MAT-OWN-006", barcode: "6911000000069", name: "转移周转箱", spec: "8个/箱", unit: "箱", qty: 40, tax: "13%", untaxed: "20.00", taxed: "22.60", batch: "否", expiry: "否", attachment: "审批附件" }
  ];
}

function prepareOwnershipApplyFormState(mode = "create", record = null) {
  ownershipApplyFormState.mode = mode;
  ownershipApplyFormState.record = record ? { ...record } : null;
  ownershipApplyFormState.goodsRows = record?.goodsRows?.length
    ? cloneInboundApplyGoodsRows(record.goodsRows)
    : record
      ? [buildOwnershipApplyGoodsRowFromRecord(record)]
      : getOwnershipApplyGoodsPresetRows("manual");
  ownershipApplyFormState.goodsSourceLabel = record ? "草稿明细" : "手工录入";
}

function getOwnershipApplyModalGoodsRows() {
  if (ownershipApplyFormState.goodsRows?.length) {
    return cloneInboundApplyGoodsRows(ownershipApplyFormState.goodsRows);
  }
  return getOwnershipApplyGoodsPresetRows("manual");
}

function collectInboundApplyGoodsRows() {
  const tbody = document.getElementById("inboundApplyGoodsTbody");
  if (!tbody) return [];
  return Array.from(tbody.querySelectorAll("tr")).map((row) => {
    const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim());
    return {
      code: cells[1] || "",
      barcode: cells[2] || "",
      name: cells[3] || "",
      spec: cells[4] || "",
      unit: cells[5] || "",
      qty: Number(cells[6] || 0),
      tax: cells[7] || "",
      untaxed: cells[8] || "",
      taxed: cells[9] || "",
      batch: cells[10] || "",
      expiry: cells[11] || "",
      attachment: cells[12] || ""
    };
  });
}

function getInboundApplyGoodsPresetRows(mode = "manual") {
  if (mode === "excel") {
    return [
      { code: "MAT-IN-001", barcode: "6923000001021", name: "医用口罩", spec: "100只/箱", unit: "箱", qty: 80, tax: "13%", untaxed: "45.00", taxed: "50.85", batch: "是", expiry: "是", attachment: "检测报告" },
      { code: "MAT-IN-002", barcode: "6923000001022", name: "消毒湿巾", spec: "36包/箱", unit: "箱", qty: 60, tax: "13%", untaxed: "58.00", taxed: "65.54", batch: "否", expiry: "否", attachment: "主图/说明书" },
      { code: "MAT-IN-003", barcode: "6923000001023", name: "周转箱", spec: "12个/箱", unit: "箱", qty: 40, tax: "13%", untaxed: "72.00", taxed: "81.36", batch: "否", expiry: "否", attachment: "合格证" },
      { code: "MAT-IN-004", barcode: "6923000001024", name: "医用手套", spec: "50盒/箱", unit: "箱", qty: 90, tax: "13%", untaxed: "61.95", taxed: "70.00", batch: "是", expiry: "是", attachment: "资质证照" },
      { code: "MAT-IN-005", barcode: "6923000001025", name: "防护面罩", spec: "20个/箱", unit: "箱", qty: 50, tax: "13%", untaxed: "88.00", taxed: "99.44", batch: "是", expiry: "否", attachment: "检测报告" },
      { code: "MAT-IN-006", barcode: "6923000001026", name: "洗手液", spec: "24瓶/箱", unit: "箱", qty: 30, tax: "13%", untaxed: "53.00", taxed: "59.89", batch: "是", expiry: "是", attachment: "图片/标签" }
    ];
  }

  return [
    { code: "MAT-IN-001", barcode: "6923000001021", name: "医用口罩", spec: "100只/箱", unit: "箱", qty: 40, tax: "13%", untaxed: "45.00", taxed: "50.85", batch: "是", expiry: "是", attachment: "检测报告" },
    { code: "MAT-IN-002", barcode: "6923000001022", name: "消毒湿巾", spec: "36包/箱", unit: "箱", qty: 30, tax: "13%", untaxed: "58.00", taxed: "65.54", batch: "否", expiry: "否", attachment: "主图/说明书" },
    { code: "MAT-IN-003", barcode: "6923000001023", name: "周转箱", spec: "12个/箱", unit: "箱", qty: 50, tax: "13%", untaxed: "72.00", taxed: "81.36", batch: "否", expiry: "否", attachment: "合格证" },
    { code: "MAT-IN-004", barcode: "6923000001024", name: "医用手套", spec: "50盒/箱", unit: "箱", qty: 60, tax: "13%", untaxed: "61.95", taxed: "70.00", batch: "是", expiry: "是", attachment: "资质证照" }
  ];
}

function renderInboundApplyGoodsRows(rows = []) {
  return rows.map((row, index) => `
    <tr data-inbound-goods-qty="${row.qty}">
      <td>${index + 1}</td>
      <td><input class="goods-cell-input" data-field="code" value="${row.code}" /></td>
      <td><input class="goods-cell-input" data-field="barcode" value="${row.barcode}" /></td>
      <td><input class="goods-cell-input" data-field="name" value="${row.name}" /></td>
      <td><input class="goods-cell-input" data-field="spec" value="${row.spec}" /></td>
      <td><input class="goods-cell-input goods-cell-sm" data-field="unit" value="${row.unit}" /></td>
      <td><input class="goods-cell-input goods-cell-sm" type="number" data-field="qty" value="${row.qty}" min="0" /></td>
      <td><input class="goods-cell-input goods-cell-sm" data-field="tax" value="${row.tax}" /></td>
      <td><input class="goods-cell-input goods-cell-sm" type="number" data-field="untaxed" value="${row.untaxed}" step="0.01" min="0" /></td>
      <td><input class="goods-cell-input goods-cell-sm" type="number" data-field="taxed" value="${row.taxed}" step="0.01" min="0" /></td>
      <td><select class="goods-cell-select" data-field="batch"><option value="是" ${row.batch === "是" ? "selected" : ""}>是</option><option value="否" ${row.batch === "否" ? "selected" : ""}>否</option></select></td>
      <td><select class="goods-cell-select" data-field="expiry"><option value="是" ${row.expiry === "是" ? "selected" : ""}>是</option><option value="否" ${row.expiry === "否" ? "selected" : ""}>否</option></select></td>
      <td><input class="goods-cell-input" data-field="attachment" value="${row.attachment}" /></td>
      <td><button type="button" class="goods-row-delete-btn" title="删除此行">&times;</button></td>
    </tr>`).join("");
}

function renderInboundApplyGoodsEditor(actionLabel = "") {
  const rows = ["新增退货申请", "编辑退货申请"].includes(actionLabel)
    ? getReturnApplyModalGoodsRows()
    : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
      ? getReturnApplyInModalGoodsRows()
    : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
      ? getOwnershipApplyModalGoodsRows()
      : getInboundApplyGoodsPresetRows("manual");
  const totalQty = rows.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const sourceLabel = ["新增退货申请", "编辑退货申请"].includes(actionLabel)
    ? (returnApplyFormState.goodsSourceLabel || "手工录入")
    : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
      ? (returnApplyInFormState.goodsSourceLabel || "手工录入")
    : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
      ? (ownershipApplyFormState.goodsSourceLabel || "手工录入")
    : "手工录入";
  return `
    <div class="modal-box modal-box-full inbound-goods-editor">
      <div class="inbound-goods-editor-head">
        <div>
          <div class="label">商品明细录入</div>
          <div class="value">支持逐行录入商品编码、条形码、数量、税率价格和批次效期属性，也支持通过Excel批量导入。</div>
        </div>
        <div class="inbound-goods-editor-actions">
          <button type="button" class="ghost-button" id="inboundApplyDownloadTemplateButton">下载导入模板</button>
          <button type="button" class="ghost-button" id="inboundApplyImportExcelButton">Excel导入商品明细</button>
          <button type="button" class="primary-button" id="inboundApplyAddGoodsRowButton">新增明细行</button>
        </div>
      </div>
      <div class="inbound-goods-summary" id="inboundApplyGoodsSummaryText">当前已录入 ${rows.length} 行商品明细 / 总数量 ${totalQty} / 录入方式：${sourceLabel}</div>
      <div class="drawer-table-wrap inbound-goods-table">
        <table>
          <thead>
            <tr><th>序号</th><th>商品编码</th><th>条形码</th><th>商品名称</th><th>规格</th><th>单位</th><th>申请数量</th><th>进项税率</th><th>未税进价</th><th>含税进价</th><th>批次管理</th><th>效期管理</th><th>附件资料</th><th>操作</th></tr>
          </thead>
          <tbody id="inboundApplyGoodsTbody">${renderInboundApplyGoodsRows(rows)}</tbody>
        </table>
      </div>
    </div>`;
}

function clearPcFieldError(field) {
  field.classList.remove("error");
  const errorNode = field.querySelector(".pc-field-error");
  if (errorNode) errorNode.remove();
}

function applyPcFieldError(field, message) {
  field.classList.add("error");
  let errorNode = field.querySelector(".pc-field-error");
  if (!errorNode) {
    errorNode = document.createElement("div");
    errorNode.className = "pc-field-error";
    field.appendChild(errorNode);
  }
  errorNode.textContent = message;
}

function bindPcFormFieldEvents() {
  document.querySelectorAll(".pc-form-field").forEach((field) => {
    if (field.querySelector("input, select, textarea")) return;
    field.addEventListener("click", () => {
      if (field.dataset.pcFormReadonly === "true") return;
      const valueNode = field.querySelector(".pc-form-value");
      const filledValue = field.dataset.pcFilledValue;
      if (valueNode && filledValue) {
        valueNode.textContent = filledValue;
        clearPcFieldError(field);
        showToast("success", `${field.dataset.pcFormLabel}已补全`, "当前为原型演示，已模拟完成字段填写。");
      }
    });
  });
}

function getRowQty(row) {
  const qtyInput = row.querySelector('input[data-field="qty"]');
  if (qtyInput) return Number(qtyInput.value || 0);
  return Number(row.dataset.inboundGoodsQty || 0);
}

function syncInboundApplyGoodsSummary(sourceLabel = "手工录入", actionLabel = "") {
  const tbody = document.getElementById("inboundApplyGoodsTbody");
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const totalQty = rows.reduce((sum, row) => sum + getRowQty(row), 0);
  const summaryText = `已维护 ${rows.length} 个商品 / 数量 ${totalQty}`;
  const summaryNode = document.getElementById("inboundApplyGoodsSummaryText");
  if (summaryNode) {
    summaryNode.textContent = `当前已录入 ${rows.length} 行商品明细 / 总数量 ${totalQty} / 录入方式：${sourceLabel}`;
  }
  if (["新增退货申请", "编辑退货申请"].includes(actionLabel)) {
    returnApplyFormState.goodsRows = collectInboundApplyGoodsRows();
    returnApplyFormState.goodsSourceLabel = sourceLabel;
  }
  if (["新增盘点计划申请", "编辑盘点计划申请"].includes(actionLabel)) {
    inventoryPlanFormState.goodsRows = rows;
    inventoryPlanFormState.goodsSourceLabel = sourceLabel;
  }
  if (["新增退仓申请", "编辑退仓申请"].includes(actionLabel)) {
    returnApplyInFormState.goodsRows = collectInboundApplyGoodsRows();
    returnApplyInFormState.goodsSourceLabel = sourceLabel;
  }
  if (["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)) {
    ownershipApplyFormState.goodsRows = collectInboundApplyGoodsRows();
    ownershipApplyFormState.goodsSourceLabel = sourceLabel;
  }
  setPcFormFieldValue("商品明细", summaryText, summaryText);
}

function buildInboundApplyAddedRow(index = 1) {
  return {
    code: `MAT-IN-${String(index).padStart(3, "0")}`,
    barcode: `69230000010${String(index).padStart(2, "0")}`,
    name: `新增商品-${index}`,
    spec: "24件/箱",
    unit: "箱",
    qty: 40,
    tax: "13%",
    untaxed: "66.00",
    taxed: "74.58",
    batch: "是",
    expiry: "是",
    attachment: "待上传"
  };
}

function bindInboundApplyGoodsEditorEvents(actionLabel = "") {
  const tbody = document.getElementById("inboundApplyGoodsTbody");
  const addButton = document.getElementById("inboundApplyAddGoodsRowButton");
  const importButton = document.getElementById("inboundApplyImportExcelButton");
  const templateButton = document.getElementById("inboundApplyDownloadTemplateButton");

  if (addButton && tbody) {
    addButton.addEventListener("click", () => {
      const nextIndex = tbody.querySelectorAll("tr").length + 1;
      tbody.insertAdjacentHTML("beforeend", renderInboundApplyGoodsRows([buildInboundApplyAddedRow(nextIndex)]));
      syncInboundApplyGoodsSummary("手工录入", actionLabel);
      showToast("success", "已新增商品明细行", "当前为原型演示，已新增一行商品明细，可继续补充数量、价格和附件。");
    });
  }

  if (importButton && tbody) {
    importButton.addEventListener("click", () => {
      const rows = ["新增退货申请", "编辑退货申请"].includes(actionLabel)
        ? getReturnApplyGoodsPresetRows("excel")
        : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
          ? getReturnApplyInGoodsPresetRows("excel")
        : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
          ? getOwnershipApplyGoodsPresetRows("excel")
        : getInboundApplyGoodsPresetRows("excel");
      tbody.innerHTML = renderInboundApplyGoodsRows(rows);
      syncInboundApplyGoodsSummary("Excel导入", actionLabel);
      showToast("success", "商品明细已导入", "已通过Excel导入 6 行商品明细，并自动回写商品明细汇总字段。");
    });
  }

  if (templateButton) {
    templateButton.addEventListener("click", () => {
      showToast("success", "模板已准备", "当前为原型演示，已模拟下载商品明细Excel导入模板。");
    });
  }

  if (tbody) {
    tbody.addEventListener("input", (e) => {
      if (e.target.matches('.goods-cell-input, .goods-cell-select')) {
        syncInboundApplyGoodsSummary(
          ["新增退货申请", "编辑退货申请"].includes(actionLabel)
            ? (returnApplyFormState.goodsSourceLabel || "手工录入")
            : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
              ? (returnApplyInFormState.goodsSourceLabel || "手工录入")
            : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
              ? (ownershipApplyFormState.goodsSourceLabel || "手工录入")
              : "手工录入",
          actionLabel
        );
      }
    });
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest(".goods-row-delete-btn");
      if (!btn) return;
      const tr = btn.closest("tr");
      if (!tr) return;
      tr.remove();
      Array.from(tbody.querySelectorAll("tr")).forEach((row, i) => {
        row.querySelector("td").textContent = i + 1;
      });
      syncInboundApplyGoodsSummary(
        ["新增退货申请", "编辑退货申请"].includes(actionLabel)
          ? (returnApplyFormState.goodsSourceLabel || "手工录入")
          : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
            ? (returnApplyInFormState.goodsSourceLabel || "手工录入")
          : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
            ? (ownershipApplyFormState.goodsSourceLabel || "手工录入")
            : "手工录入",
        actionLabel
      );
      showToast("success", "已删除商品明细行", "当前明细行已移除，汇总数据已同步更新。");
    });
    syncInboundApplyGoodsSummary(
      ["新增退货申请", "编辑退货申请"].includes(actionLabel)
        ? (returnApplyFormState.goodsSourceLabel || "手工录入")
        : ["新增退仓申请", "编辑退仓申请"].includes(actionLabel)
          ? (returnApplyInFormState.goodsSourceLabel || "手工录入")
        : ["新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)
          ? (ownershipApplyFormState.goodsSourceLabel || "手工录入")
          : "手工录入",
      actionLabel
    );
  }
}

var newProductScanRows = [];

var productMasterData = [
  { code: "MAT-NEW-001", barcode: "6923000000018", name: "新品-消杀喷雾", spec: "24瓶/箱", unit: "箱", category: "清洁消杀", brand: "安洁", model: "AJ-XP-24", temp: "常温", packQty: "24", length: "42", width: "30", height: "28", volume: "0.0353", weight: "12.5", batch: "是", expiry: "是" },
  { code: "MAT-NEW-002", barcode: "6923000000025", name: "新品-医用手套", spec: "50盒/箱", unit: "箱", category: "防护用品", brand: "护安", model: "HA-GLOVE-50", temp: "常温", packQty: "50", length: "48", width: "36", height: "32", volume: "0.0553", weight: "16.8", batch: "是", expiry: "是" },
  { code: "MAT-INV-001", barcode: "6906000000019", name: "物料-低值易耗品001", spec: "12瓶/箱", unit: "箱", category: "低值易耗品", brand: "自有品牌A", model: "INV-A-12", temp: "常温", packQty: "12", length: "40", width: "28", height: "26", volume: "0.0291", weight: "10.2", batch: "是", expiry: "是" },
  { code: "MAT-INV-002", barcode: "6906000000026", name: "物料-商品002", spec: "24袋/箱", unit: "箱", category: "日化用品", brand: "日化品牌B", model: "RH-B-24", temp: "常温", packQty: "24", length: "38", width: "26", height: "24", volume: "0.0237", weight: "8.6", batch: "是", expiry: "是" },
  { code: "MAT-INV-003", barcode: "6906000000033", name: "物料-商品003", spec: "6盒/箱", unit: "箱", category: "食品", brand: "食品品牌C", model: "SP-C-06", temp: "冷藏", packQty: "6", length: "32", width: "22", height: "20", volume: "0.0141", weight: "5.4", batch: "是", expiry: "是" },
  { code: "MAT-IN-001", barcode: "6923000001021", name: "医用口罩", spec: "100只/箱", unit: "箱", category: "防护用品", brand: "护安", model: "HA-MASK-100", temp: "常温", packQty: "100", length: "50", width: "38", height: "34", volume: "0.0646", weight: "18.0", batch: "是", expiry: "是" }
];

function lookupProductMaster(keyword) {
  var kw = (keyword || "").trim();
  if (!kw) return null;
  return productMasterData.find(function(p) {
    return p.code.toLowerCase() === kw.toLowerCase() || p.barcode === kw;
  }) || null;
}

function addNewProductScanRow(product) {
  var tbody = document.getElementById("newProductScanResultTbody");
  if (!tbody || !product) return;
  var idx = tbody.querySelectorAll("tr").length + 1;
  var tr = document.createElement("tr");
  tr.innerHTML = '<td><input type="checkbox" class="newProductRowCheckbox" /></td><td>' + idx + '</td><td>' + product.code + '</td><td>' + product.barcode + '</td><td>' + product.name + '</td><td>' + product.spec + '</td><td>' + product.unit + '</td><td>' + product.category + '</td><td>' + product.brand + '</td><td>' + product.model + '</td><td>' + product.temp + '</td><td>' + product.packQty + '</td>';
  tbody.appendChild(tr);
}

function showNewProductAutoFilled(product) {
  var area = document.getElementById("newProductAutoFilledArea");
  if (!area || !product) return;
  area.style.display = "block";
  area.innerHTML = '<div class="product-auto-filled"><div class="product-auto-filled-title">已从商品信息自动获取以下数据</div><div class="product-auto-filled-grid">' +
    '<div class="product-auto-filled-item"><div class="label">商品编码</div><div class="value">' + product.code + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">条形码</div><div class="value">' + product.barcode + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">商品名称</div><div class="value">' + product.name + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">规格</div><div class="value">' + product.spec + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">单位</div><div class="value">' + product.unit + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">商品分类</div><div class="value">' + product.category + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">品牌</div><div class="value">' + product.brand + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">型号</div><div class="value">' + product.model + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">温层</div><div class="value">' + product.temp + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">包装数量</div><div class="value">' + product.packQty + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">体积(m3)</div><div class="value">' + product.volume + '</div></div>' +
    '<div class="product-auto-filled-item"><div class="label">重量(kg)</div><div class="value">' + product.weight + '</div></div>' +
    '</div></div>';
}

function bindNewProductScanEvents() {
  var searchBtn = document.getElementById("newProductSearchBtn");
  var scanInput = document.getElementById("newProductScanInput");
  var scanIcon = document.getElementById("newProductScanIcon");

  function doSearch() {
    if (!scanInput) return;
    var keyword = scanInput.value.trim();
    if (!keyword) {
      showToast("processing", "请输入编码或条形码", "请在输入框中输入商品编码或条形码后重试。");
      return;
    }
    var product = lookupProductMaster(keyword);
    if (!product) {
      showToast("processing", "未找到匹配商品", "商品信息中未找到编码或条形码为「" + keyword + "」的商品，请检查后重试。");
      return;
    }
    showNewProductAutoFilled(product);
    addNewProductScanRow(product);
    showToast("success", "商品信息已获取", "已从商品信息中自动获取「" + product.name + "」的详细数据，请录入数量。");
    scanInput.value = "";
  }

  if (searchBtn) searchBtn.addEventListener("click", doSearch);
  if (scanInput) {
    scanInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") doSearch();
    });
  }
  if (scanIcon) {
    scanIcon.addEventListener("click", function() {
      scanInput.value = "6923000000018";
      doSearch();
    });
  }
}

function bindNewProductFormPageEvents() {
  bindNewProductScanEvents();

  const createSaveDraftButton = document.getElementById("newProductCreateSaveDraftButton");
  if (createSaveDraftButton) {
    createSaveDraftButton.addEventListener("click", () => {
      saveNewProductCreateDraft();
      renderPcPage("newproduct", "list");
      const toastConfig = getToastConfig("save-draft-newproduct", "新品录入保存草稿");
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const createSubmitButton = document.getElementById("newProductCreateSubmitButton");
  if (createSubmitButton) {
    createSubmitButton.addEventListener("click", () => {
      submitNewProductCreateForm();
    });
  }

  const editSaveDraftButton = document.getElementById("newProductEditSaveDraftButton");
  if (editSaveDraftButton) {
    editSaveDraftButton.addEventListener("click", () => {
      saveNewProductEditDraft();
      renderPcPage("newproduct", "list");
      const toastConfig = getToastConfig("save-draft-newproduct", "新品修改保存草稿");
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const editSubmitButton = document.getElementById("newProductEditSubmitButton");
  if (editSubmitButton) {
    editSubmitButton.addEventListener("click", () => {
      submitNewProductEditForm();
    });
  }

  // 新增行按钮
  const addRowBtn = document.getElementById("newProductAddRowButton");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", function() {
      var tbody = document.getElementById("newProductScanResultTbody");
      if (!tbody) return;
      var idx = tbody.querySelectorAll("tr").length + 1;
      var inputStyle = 'style="width:100%;border:1px solid #e2e8f0;border-radius:4px;padding:4px 6px;font-size:13px;box-sizing:border-box;background:#fffbe6;"';
      var tr = document.createElement("tr");
      tr.innerHTML = '<td><input type="checkbox" class="newProductRowCheckbox" /></td>' +
        '<td>' + idx + '</td>' +
        '<td><input type="text" placeholder="商品编码" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="条形码" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="商品名称" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="规格" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="单位" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="商品分类" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="品牌" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="型号" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="温层" ' + inputStyle + ' /></td>' +
        '<td><input type="text" placeholder="包装数量" ' + inputStyle + ' /></td>';
      tbody.appendChild(tr);
    });
  }

  // 删除行按钮
  const deleteRowBtn = document.getElementById("newProductDeleteRowButton");
  if (deleteRowBtn) {
    deleteRowBtn.addEventListener("click", function() {
      var tbody = document.getElementById("newProductScanResultTbody");
      if (!tbody) return;
      var checkboxes = tbody.querySelectorAll(".newProductRowCheckbox:checked");
      if (checkboxes.length === 0) {
        showToast("processing", "请先选择要删除的行", "勾选表格中需要删除的商品行后，再点击删除行按钮。");
        return;
      }
      checkboxes.forEach(function(cb) {
        var row = cb.closest("tr");
        if (row) row.remove();
      });
      // 重新编号
      var rows = tbody.querySelectorAll("tr");
      rows.forEach(function(row, i) {
        var cells = row.querySelectorAll("td");
        if (cells.length > 1) cells[1].textContent = i + 1;
      });
      showToast("success", "已删除选中行", "成功删除 " + checkboxes.length + " 行商品数据，序号已自动重排。");
    });
  }

  // 全选复选框
  const selectAllCheckbox = document.getElementById("newProductSelectAllRows");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function() {
      var checked = this.checked;
      var tbody = document.getElementById("newProductScanResultTbody");
      if (!tbody) return;
      tbody.querySelectorAll(".newProductRowCheckbox").forEach(function(cb) {
        cb.checked = checked;
      });
    });
  }

  const returnApplyInCreateSaveDraftButton = document.getElementById("returnApplyInCreateSaveDraftButton");
  if (returnApplyInCreateSaveDraftButton) {
    returnApplyInCreateSaveDraftButton.addEventListener("click", () => {
      const record = saveReturnApplyInCreateDraft();
      renderPcPage("returnapplyin", "list");
      const toastConfig = getToastConfig("save-returnapplyin-draft", `退仓申请草稿 ${record?.orderNo || ""}`);
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const returnApplyInCreateSubmitButton = document.getElementById("returnApplyInCreateSubmitButton");
  if (returnApplyInCreateSubmitButton) {
    returnApplyInCreateSubmitButton.addEventListener("click", () => {
      submitReturnApplyInCreateForm();
    });
  }

  const returnApplyInEditSaveDraftButton = document.getElementById("returnApplyInEditSaveDraftButton");
  if (returnApplyInEditSaveDraftButton) {
    returnApplyInEditSaveDraftButton.addEventListener("click", () => {
      const record = saveReturnApplyInEditDraft();
      renderPcPage("returnapplyin", "list");
      const toastConfig = getToastConfig("save-returnapplyin-draft", `退仓申请草稿 ${record?.orderNo || ""}`);
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const returnApplyInEditSubmitButton = document.getElementById("returnApplyInEditSubmitButton");
  if (returnApplyInEditSubmitButton) {
    returnApplyInEditSubmitButton.addEventListener("click", () => {
      submitReturnApplyInEditForm();
    });
  }

  const ownershipApplyCreateSaveDraftButton = document.getElementById("ownershipApplyCreateSaveDraftButton");
  if (ownershipApplyCreateSaveDraftButton) {
    ownershipApplyCreateSaveDraftButton.addEventListener("click", () => {
      const record = saveOwnershipApplyCreateDraft();
      renderPcPage("ownershipapply", "list");
      const toastConfig = getToastConfig("save-ownershipapply-draft", `物权转移申请草稿 ${record?.orderNo || ""}`);
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const ownershipApplyCreateSubmitButton = document.getElementById("ownershipApplyCreateSubmitButton");
  if (ownershipApplyCreateSubmitButton) {
    ownershipApplyCreateSubmitButton.addEventListener("click", () => {
      submitOwnershipApplyCreateForm();
    });
  }

  const ownershipApplyEditSaveDraftButton = document.getElementById("ownershipApplyEditSaveDraftButton");
  if (ownershipApplyEditSaveDraftButton) {
    ownershipApplyEditSaveDraftButton.addEventListener("click", () => {
      const record = saveOwnershipApplyEditDraft();
      renderPcPage("ownershipapply", "list");
      const toastConfig = getToastConfig("save-ownershipapply-draft", `物权转移申请草稿 ${record?.orderNo || ""}`);
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const ownershipApplyEditSubmitButton = document.getElementById("ownershipApplyEditSubmitButton");
  if (ownershipApplyEditSubmitButton) {
    ownershipApplyEditSubmitButton.addEventListener("click", () => {
      submitOwnershipApplyEditForm();
    });
  }
}

function validateStoreOrderCycleForm(actionLabel) {
  if (!["新增要货周期规则", "编辑要货周期规则"].includes(actionLabel)) return true;
  let hasError = false;
  const storeCodeField = document.querySelector('.pc-form-field[data-pc-form-label="门店编码"]');
  const cycleTypeField = document.querySelector('.pc-form-field[data-pc-form-label="要货周期类型"]');
  const orderDaysField = document.querySelector('.pc-form-field[data-pc-form-label="可要货日期"]');
  const effectDateField = document.querySelector('.pc-form-field[data-pc-form-label="生效日期"]');

  const storeCode = document.getElementById('socStoreCode')?.value.trim() || "";
  const cycleType = document.getElementById('socCycleType')?.value.trim() || "";
  const orderDays = document.getElementById('socOrderDays')?.value.trim() || "";
  const effectDate = document.getElementById('socEffectDate')?.value.trim() || "";

  [storeCodeField, cycleTypeField, orderDaysField, effectDateField].forEach((field) => field && clearPcFieldError(field));

  if (!storeCode) {
    applyPcFieldError(storeCodeField, "请选择要货门店");
    hasError = true;
  }
  if (!cycleType) {
    applyPcFieldError(cycleTypeField, "请选择要货周期类型");
    hasError = true;
  }
  if (!orderDays) {
    applyPcFieldError(orderDaysField, "请输入可要货日期");
    hasError = true;
  } else if (cycleType) {
    if (cycleType === "按周") {
      const weeks = orderDays.split(/[，,、]/).map((item) => item.trim()).filter(Boolean);
      const validWeek = weeks.every((item) => /^周[一二三四五六日]$/.test(item));
      if (!validWeek || weeks.length === 0) {
        applyPcFieldError(orderDaysField, "按周模式请填写周一~周日，例如：周三、周五");
        hasError = true;
      }
    }
    if (cycleType === "按月") {
      const months = orderDays.replace(/每月/g, "").split(/[，,、]/).map((item) => item.trim()).filter(Boolean);
      const validMonth = months.every((item) => /^([1-9]|[12][0-9]|3[01])号$/.test(item));
      if (!validMonth || months.length === 0) {
        applyPcFieldError(orderDaysField, "按月模式请填写日期，例如：每月 5号、15号");
        hasError = true;
      }
    }
  }
  if (!effectDate) {
    applyPcFieldError(effectDateField, "请选择生效日期");
    hasError = true;
  }

  if (hasError) {
    showToast("error", "录入内容存在问题", "请根据提示修改后再提交。按周/按月格式应与选择的周期类型一致。\n");
  }

  return !hasError;
}

function validatePcForm(actionLabel) {
  const config = resolvePcFormConfig(actionLabel);
  if (!config) return true;
  if (["新增要货周期规则", "编辑要货周期规则"].includes(actionLabel)) {
    return validateStoreOrderCycleForm(actionLabel);
  }
  let hasError = false;
  document.querySelectorAll(".pc-form-field").forEach((field) => {
    const label = field.dataset.pcFormLabel;
    const rawValue = field.querySelector("input, select, textarea")?.value?.trim();
    const value = rawValue !== undefined ? rawValue : field.querySelector(".pc-form-value")?.textContent?.trim() || "";
    clearPcFieldError(field);
    if (config.required.includes(label) && (!value || value.includes("请选择") || value.includes("请填写") || value.includes("点击"))) {
      applyPcFieldError(field, `请先补全${label}`);
      hasError = true;
    }
  });

  if (hasError) {
    showToast("error", "表单校验未通过", "请先补全标红字段，再继续提交。点击字段可模拟补全。");
  }

  return !hasError;
}

function bindStoreOrderCycleFormEvents() {
  const storeSelect = document.getElementById("socStoreCode");
  const storeNameNode = document.getElementById("socStoreName");
  const customerNode = document.getElementById("socCustomer");
  const storeOptions = {
    STORE001: { name: "浦东旗舰店", customer: "内部客户-华东分部" },
    STORE002: { name: "临港社区店", customer: "内部客户-华东分部" },
    STORE003: { name: "天河中心店", customer: "外部客户-门店联盟" },
    STORE004: { name: "海珠网点", customer: "外部客户-门店联盟" },
    STORE005: { name: "大兴新城店", customer: "内部客户-区域共享仓" }
  };

  if (storeSelect) {
    storeSelect.addEventListener("change", () => {
      const selected = storeOptions[storeSelect.value] || { name: "", customer: "" };
      if (storeNameNode) storeNameNode.textContent = selected.name;
      if (customerNode) customerNode.textContent = selected.customer;
    });
  }

  const cycleTypeSelect = document.getElementById("socCycleType");
  const orderDaysInput = document.getElementById("socOrderDays");
  const orderDaysWidget = document.getElementById("socOrderDaysWidget");
  const weekdayList = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  if (cycleTypeSelect && orderDaysInput) {
    const orderDaysSummaryNode = document.getElementById("socOrderDaysSummary");
    const normalizeWeekDays = (value) => value.split(/[，,、]/).map((item) => item.trim()).filter((item) => /^周[一二三四五六日]$/.test(item));
    const normalizeMonthDays = (value) => value.replace(/每月/g, "").split(/[，,、]/).map((item) => item.trim().replace(/号$/, "")).filter(Boolean).map(Number).filter((item) => item >= 1 && item <= 31);
    const buildWeekValue = (days) => days.join("、");
    const buildMonthValue = (days) => days.length ? `每月 ${days.sort((a, b) => a - b).map((day) => `${day}号`).join("、")}` : "";
    const updateOrderDaysSummary = () => {
      if (!orderDaysSummaryNode) return;
      const value = orderDaysInput.value.trim();
      const text = value
        ? `当前已配置：${value}`
        : cycleTypeSelect.value
          ? `请配置要货日期`
          : `请先选择要货周期类型并配置要货日期`;
      orderDaysSummaryNode.textContent = text;
    };

    const attachWeekdayEvents = () => {
      const buttons = document.querySelectorAll("#socOrderDaysWidget .pc-day-pill");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const day = button.dataset.weekday;
          const selected = normalizeWeekDays(orderDaysInput.value);
          const index = selected.indexOf(day);
          if (index > -1) {
            selected.splice(index, 1);
          } else {
            selected.push(day);
          }
          orderDaysInput.value = buildWeekValue(selected);
          button.classList.toggle("selected", index === -1);
          clearPcFieldError(orderDaysInput.closest(".pc-form-field"));
          updateOrderDaysSummary();
        });
      });
    };

    const attachMonthdayEvents = () => {
      const tagContainer = document.getElementById("socMonthDayTags");
      const calendarButtons = document.querySelectorAll("#socMonthCalendar .pc-calendar-day");

      const refreshMonthTags = () => {
        if (!tagContainer) return;
        const days = normalizeMonthDays(orderDaysInput.value);
        tagContainer.innerHTML = days.map((day) => `
          <span class="pc-day-tag" data-month-day="${day}">${day}号<button type="button" class="pc-day-remove" data-remove-month-day="${day}" aria-label="移除 ${day}号">×</button></span>
        `).join("");
        tagContainer.querySelectorAll(".pc-day-remove").forEach((removeButton) => {
          removeButton.addEventListener("click", () => {
            const removeDay = Number(removeButton.dataset.removeMonthDay);
            const remaining = normalizeMonthDays(orderDaysInput.value).filter((value) => value !== removeDay);
            orderDaysInput.value = buildMonthValue(remaining);
            refreshMonthTags();
            highlightCalendarDays(remaining);
            clearPcFieldError(orderDaysInput.closest(".pc-form-field"));
            updateOrderDaysSummary();
          });
        });
      };

      const highlightCalendarDays = (selectedDays) => {
        calendarButtons.forEach((button) => {
          const day = Number(button.dataset.calendarDay);
          button.classList.toggle("selected", selectedDays.includes(day));
        });
      };

      if (calendarButtons.length) {
        calendarButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const day = Number(button.dataset.calendarDay);
            const selected = normalizeMonthDays(orderDaysInput.value);
            if (selected.includes(day)) {
              const remaining = selected.filter((value) => value !== day);
              orderDaysInput.value = buildMonthValue(remaining);
              highlightCalendarDays(remaining);
            } else {
              selected.push(day);
              orderDaysInput.value = buildMonthValue(selected);
              highlightCalendarDays(selected);
            }
            refreshMonthTags();
            clearPcFieldError(orderDaysInput.closest(".pc-form-field"));
            updateOrderDaysSummary();
          });
        });
      }

      refreshMonthTags();
      if (calendarButtons.length) {
        highlightCalendarDays(normalizeMonthDays(orderDaysInput.value));
      }
    };

    const renderOrderDaysWidget = () => {
      if (!orderDaysWidget) return;
      const type = cycleTypeSelect.value;
      const weekDays = normalizeWeekDays(orderDaysInput.value);
      const monthDays = normalizeMonthDays(orderDaysInput.value);
      orderDaysInput.readOnly = type !== "";
      orderDaysInput.placeholder = type === "按周"
        ? "请点击选择要货星期"
        : type === "按月"
          ? "请直接从日历中选择要货日号"
          : "例如：周三、周五 或 每月 5号、15号";

      // Render only the widget matching the selected cycle type
      let widgetHtml = "";
      if (type === "按周" || !type) {
        widgetHtml += `
        <div class="pc-order-days-card week-card active">
          <div class="pc-order-days-card-title">按周配置</div>
          <div class="pc-weekday-picker">${weekdayList.map((day) => `
            <button type="button" class="pc-day-pill${weekDays.includes(day) ? " selected" : ""}" data-weekday="${day}">${day}</button>
          `).join("")}</div>
          <div class="pc-form-hint">选择一个或多个要货星期，系统将自动按规则生成。</div>
        </div>`;
      }
      if (type === "按月") {
        widgetHtml += `
        <div class="pc-order-days-card month-card active">
          <div class="pc-order-days-card-title">按月配置</div>
          <div class="pc-calendar-grid" id="socMonthCalendar">
            ${Array.from({ length: 31 }, (_, index) => {
              const day = index + 1;
              const selected = monthDays.includes(day) ? " selected" : "";
              return `<button type="button" class="pc-calendar-day${selected}" data-calendar-day="${day}">${day}</button>`;
            }).join("")}
          </div>
          <div class="pc-monthday-tags" id="socMonthDayTags">${monthDays.sort((a, b) => a - b).map((day) => `
            <span class="pc-day-tag" data-month-day="${day}">${day}号<button type="button" class="pc-day-remove" data-remove-month-day="${day}" aria-label="移除 ${day}号">×</button></span>
          `).join("")}</div>
          <div class="pc-form-hint">从日历中选择要货日期，支持多选且无数量上限，可按需选择 3 个以上（如 5号、10号、15号、20号、25号）。</div>
        </div>`;
      }
      orderDaysWidget.innerHTML = widgetHtml;
      attachWeekdayEvents();
      attachMonthdayEvents();
    };

    cycleTypeSelect.addEventListener("change", () => {
      orderDaysInput.value = "";
      renderOrderDaysWidget();
      updateOrderDaysSummary();
      clearPcFieldError(orderDaysInput.closest(".pc-form-field"));
    });

    renderOrderDaysWidget();
    updateOrderDaysSummary();
  }
}

function showToast(type, title, desc) {
  const stack = document.getElementById("globalToastStack");
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-desc">${desc}</div>`;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function bindPcListEvents(key) {
  if (!pcListConfigs[key]) return;

  const filterPanel = document.querySelector("[data-list-filter-panel]");
  const normalContent = document.querySelector('[data-list-content="normal"]');
  const emptyContent = document.querySelector('[data-list-content="empty"]');

  document.querySelectorAll("[data-list-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.listAction;

      if (action === "expand-filter" && filterPanel) {
        filterPanel.dataset.listFilterPanel = "expanded";
        showToast("processing", "筛选面板已展开", "当前为原型演示，已展示更多筛选条件。");
      }

      if (action === "collapse-filter" && filterPanel) {
        filterPanel.dataset.listFilterPanel = "collapsed";
      }

      if (action === "empty-toggle" && normalContent && emptyContent) {
        normalContent.style.display = "none";
        emptyContent.style.display = "";
        showToast("error", "已切换为空结果页", "当前用于演示列表查询无结果时的页面反馈。");
      }

      if (action === "reset-list" && normalContent && emptyContent) {
        normalContent.style.display = "";
        emptyContent.style.display = "none";
        if (filterPanel) filterPanel.dataset.listFilterPanel = "collapsed";
        showToast("success", "列表已恢复", "已恢复默认列表结果和筛选状态。");
      }

      if (action === "query-list") {
        showToast("processing", "查询中", "系统正在按当前筛选条件查询列表数据。");
      }

      if (action === "prev-page" || action === "next-page") {
        showToast("processing", action === "prev-page" ? "切换上一页" : "切换下一页", "当前为分页原型演示，后续可接入真实分页数据。");
      }
    });
  });
}

function inferMiniActionType(text) {
  if (text.includes("扫码")) return "scan";
  if (text.includes("图片")) return "photo";
  if (text.includes("定位")) return "location";
  if (text.includes("提交") || text.includes("通过")) return "submit";
  if (text.includes("驳回")) return "reject";
  if (text.includes("转交")) return "transfer";
  if (text.includes("保存") || text.includes("暂存")) return "save";
  if (text.includes("查看")) return "view";
  return "submit";
}

function getMiniActionConfig(type, label) {
  const configs = {
    submit: {
      title: `${label || "提交"}确认`,
      sub: "用于演示小程序端提交审核、提交审批等操作前的确认弹层。",
      note: "提交后将由后台完成校验、流转和状态回写。",
      primary: "确认提交",
      toast: ["processing", `${label || "提交"}处理中`, "系统正在提交申请并校验数据，请稍后查看处理结果。"]
    },
    save: {
      title: `${label || "保存"}确认`,
      sub: "用于演示小程序端暂存、保存等轻操作的确认弹层。",
      note: "暂存成功后，用户可稍后继续补充和提交。",
      primary: "确认保存",
      toast: ["success", `${label || "保存"}成功`, "当前内容已保存为草稿，可在后续继续编辑。"]
    },
    reject: {
      title: `${label || "驳回"}确认`,
      sub: "用于演示移动审批场景中的驳回确认效果。",
      note: "后续可补驳回原因输入、审批意见和历史记录。",
      primary: "确认驳回",
      toast: ["error", `${label || "驳回"}已提交`, "驳回意见已记录，并将通知申请人进行修改。"]
    },
    transfer: {
      title: `${label || "转交"}确认`,
      sub: "用于演示小程序待办中的转交操作。",
      note: "后续可补接收人选择和转交原因录入。",
      primary: "确认转交",
      toast: ["success", `${label || "转交"}成功`, "待办事项已转交给新的处理人。"]
    },
    scan: {
      title: `${label || "扫码"}能力`,
      sub: "用于演示调用摄像头扫码并自动带出业务单据或物料信息的能力。",
      note: "后续可继续补扫码成功后的字段自动回填、失败重扫和条码识别类型。",
      primary: "模拟扫码成功",
      toast: ["success", `${label || "扫码"}成功`, "已模拟识别条码并自动带出业务编号或物料信息。"]
    },
    photo: {
      title: `${label || "上传图片"}能力`,
      sub: "用于演示拍照或从相册选择图片后上传现场凭证的能力。",
      note: "后续可继续补图片预览、删除、压缩和多图上传效果。",
      primary: "模拟上传成功",
      toast: ["success", `${label || "上传图片"}成功`, "已模拟上传 2 张现场图片，并关联到当前业务单据。"]
    },
    location: {
      title: `${label || "获取定位"}能力`,
      sub: "用于演示读取当前位置并记录门店、仓库或异常发生点的能力。",
      note: "后续可继续补地图展示、地址逆解析和定位失败处理。",
      primary: "模拟定位成功",
      toast: ["processing", `${label || "获取定位"}处理中`, "系统正在获取当前位置，成功后将回填地址信息。"]
    },
    view: {
      title: `${label || "查看"}详情`,
      sub: "用于演示移动端点击查看后的详情弹层效果。",
      note: "后续可改造成完整详情页或半屏抽屉页。",
      primary: "我知道了",
      toast: ["success", `${label || "查看"}完成`, "当前已展示移动端查看类动作的原型反馈。"]
    }
  };
  return configs[type] || configs.submit;
}

const miniValidationRules = {
  apply: {
    "客户": ["请选择客户后再提交", "内部客户-华东分部"],
    "商品明细": ["请至少选择一项商品和数量", "已选择 2 个商品 / 数量 260"],
    "期望发货时间": ["请选择期望发货时间", "2026-05-27 10:00"]
  },
  inboundapply: {
    "申请仓库": ["请选择预约入库仓库", "华南2仓"],
    "商品明细": ["请录入商品明细后再提交", "已录入 2 行商品 / 数量 120"],
    "预计到仓时间": ["请选择预计到仓时间", "2026-05-29 14:00"]
  },
  returnapply: {
    "退货原因": ["请选择或填写退货原因", "质量异常，申请退货"],
    "商品明细": ["请至少选择一项退货商品", "已选择 2 个商品 / 数量 80"],
    "退货仓库": ["请确认退货仓库", "华南2仓"]
  },
  return: {
    "原配送单": ["请输入或扫码带出原配送单", "PS20260521012"],
    "退仓商品": ["请选择退仓商品和数量", "已选择 1 个商品 / 可退数量 20"],
    "退仓原因": ["请填写退仓原因", "门店误收，申请退回"]
  },
  loss: {
    "仓库": ["请选择仓库", "华南2仓"],
    "商品与数量": ["请选择商品与损溢数量", "物料-商品005 / 损溢数量 32"],
    "责任说明": ["请填写责任说明", "责任人王婷，现场破损已拍照"]
  },
  ownershipapply: {
    "目标货主": ["请选择目标货主", "自有货主C"],
    "生效日期": ["请选择生效日期", "2026-05-29"],
    "商品明细": ["请选择可转商品和数量", "已选择 2 个商品 / 数量 70"]
  }
};

function renderMiniSheetMarkup() {
  return `
    <div class="mini-sheet-mask" id="miniSheet">
      <div class="mini-sheet">
        <div class="mini-sheet-bar"></div>
        <div class="mini-sheet-title" id="miniSheetTitle">移动端操作确认</div>
        <div class="mini-sheet-sub" id="miniSheetSub">用于演示按钮点击后的底部弹层效果。</div>
        <div class="mini-sheet-box">
          <div class="label">当前动作</div>
          <div class="value" id="miniSheetActionValue">提交审核</div>
        </div>
        <div class="mini-sheet-box">
          <div class="label">说明</div>
          <div class="value" id="miniSheetNote">后续可继续补表单校验、意见输入和异常反馈。</div>
        </div>
        <div class="mini-sheet-actions">
          <button class="ghost-button" data-mini-sheet-control="cancel">取消</button>
          <button class="primary-button" id="miniSheetPrimary">确认</button>
        </div>
      </div>
    </div>`;
}

function renderMiniToastMarkup() {
  return `<div class="mini-toast-stack" id="miniToastStack"></div>`;
}

function openMiniSheet(type, label) {
  const config = getMiniActionConfig(type, label);
  const mask = document.getElementById("miniSheet");
  if (!mask) return;

  document.getElementById("miniSheetTitle").textContent = config.title;
  document.getElementById("miniSheetSub").textContent = config.sub;
  document.getElementById("miniSheetActionValue").textContent = label || "当前动作";
  document.getElementById("miniSheetNote").textContent = config.note;
  const primary = document.getElementById("miniSheetPrimary");
  primary.textContent = config.primary;
  primary.dataset.toastType = config.toast[0];
  primary.dataset.toastTitle = config.toast[1];
  primary.dataset.toastDesc = config.toast[2];
  mask.classList.add("show");
}

function showMiniToast(type, title, desc) {
  const stack = document.getElementById("miniToastStack");
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = `mini-toast ${type}`;
  toast.innerHTML = `<div class="mini-toast-title">${title}</div><div class="mini-toast-desc">${desc}</div>`;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2400);
}

function showMiniConfirm(title, message, onConfirm) {
  let overlay = document.getElementById("miniConfirmOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "miniConfirmOverlay";
    document.body.appendChild(overlay);
  }
  overlay.className = "mini-confirm-overlay";
  overlay.innerHTML = `
    <div class="mini-confirm-dialog">
      <div class="mini-confirm-title">${title}</div>
      <div class="mini-confirm-msg">${message}</div>
      <div class="mini-confirm-btns">
        <button class="mini-confirm-cancel" id="miniConfirmCancel">取消</button>
        <button class="mini-confirm-ok" id="miniConfirmOk">确定</button>
      </div>
    </div>`;
  overlay.classList.add("show");
  document.getElementById("miniConfirmCancel").addEventListener("click", () => {
    overlay.classList.remove("show");
  });
  document.getElementById("miniConfirmOk").addEventListener("click", () => {
    overlay.classList.remove("show");
    if (onConfirm) onConfirm();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("show");
  });
}

function prepareMiniFormFields() {
  document.querySelectorAll(".mini-content .form-field").forEach((field) => {
    const label = field.querySelector(".field-label")?.textContent?.trim() || "";
    const contentNode = field.querySelector(".field-label")?.nextElementSibling;
    field.dataset.fieldLabel = label;
    field.classList.add("fillable");
    if (contentNode && !contentNode.classList.contains("field-error")) {
      contentNode.classList.add("field-value");
    }
  });
}

function clearMiniFieldError(field, filledValue) {
  field.classList.remove("error");
  const errorNode = field.querySelector(".field-error");
  if (errorNode) errorNode.remove();
  const valueNode = field.querySelector(".field-value");
  if (valueNode && filledValue) valueNode.textContent = filledValue;
}

function applyMiniFieldError(field, message) {
  field.classList.add("error");
  let errorNode = field.querySelector(".field-error");
  if (!errorNode) {
    errorNode = document.createElement("div");
    errorNode.className = "field-error";
    field.appendChild(errorNode);
  }
  errorNode.textContent = message;
}

function validateMiniForm(pageKey) {
  const rules = miniValidationRules[pageKey];
  if (!rules) return true;

  let hasError = false;
  document.querySelectorAll(".mini-content .form-field").forEach((field) => {
    const label = field.dataset.fieldLabel;
    if (!rules[label]) return;
    const [message] = rules[label];
    const valueNode = field.querySelector(".field-value");
    const currentValue = valueNode?.textContent?.trim() || "";
    if (currentValue.includes("请选择") || currentValue.includes("点击选择") || currentValue.includes("请输入") || currentValue.includes("请填写")) {
      applyMiniFieldError(field, message);
      hasError = true;
    }
  });

  if (hasError) {
    showMiniToast("error", "表单校验未通过", "请先补全标红字段，再继续提交。点击字段可模拟补全。");
  }

  return !hasError;
}

function bindMiniFieldFixEvents(pageKey) {
  const rules = miniValidationRules[pageKey] || {};
  document.querySelectorAll(".mini-content .form-field").forEach((field) => {
    field.addEventListener("click", () => {
      const label = field.dataset.fieldLabel;
      if (!rules[label]) return;
      const [, filledValue] = rules[label];
      clearMiniFieldError(field, filledValue);
      showMiniToast("success", `${label}已补全`, "当前为原型演示，已模拟完成字段填写。");
    });
  });
}

function resolveMiniButtonTarget(pageKey, label) {
  const routeMap = {
    "扫码加品": "mini-scan.html",
    "扫码物料": "mini-scan.html",
    "扫码带单": "mini-scan.html",
    "手工选择": "mini-selectgoods.html",
    "手工新增": "mini-selectgoods.html",
    "最近常用": "mini-selectgoods.html",
    "上传图片": "mini-uploadvoucher.html",
    "查看库存": "mini-inventorylookup.html",
    "编辑数量": "mini-editgoods.html",
    "编辑明细": "mini-editgoods.html",
    "查看批次": "mini-batchdetail.html",
    "查看原单": "mini-originorder.html",
    "查看规则": "mini-rulecheck.html",
    "获取定位": "mini-location.html",
    "查看全部历史": "mini-message.html"
  };
  const file = routeMap[label];
  if (!file) return "";
  if (file === "mini-message.html") return file;
  return buildMiniActionHref(file, pageKey, label);
}

function bindMiniInteractionEvents(pageKey) {
  prepareMiniFormFields();
  bindMiniFieldFixEvents(pageKey);

  // Card action buttons (edit/delete/withdraw)
  document.querySelectorAll(".mini-doc-card-actions button[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const docNo = btn.dataset.doc;
      const card = btn.closest(".mini-doc-card");
      if (action === "delete") {
        showMiniConfirm("确认删除", `确定要删除单据 ${docNo} 吗？`, () => {
          if (card) card.remove();
          showMiniToast("success", "删除成功", `单据 ${docNo} 已删除`);
        });
      } else if (action === "edit") {
        const viewLink = card.querySelector(".mini-doc-card-act.view");
        if (viewLink) window.location.href = viewLink.href;
      } else if (action === "withdraw") {
        showMiniConfirm("确认撤回", `确定要撤回单据 ${docNo} 吗？`, () => {
          showMiniToast("success", "撤回成功", `单据 ${docNo} 已撤回至草稿`);
        });
      }
    });
  });

  // Goods review row delete buttons
  document.querySelectorAll(".mini-goods-row-act[data-action='delete-goods']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = btn.dataset.doc;
      const item = btn.closest(".mini-goods-review-item");
      showMiniConfirm("确认删除", `确定要删除商品 ${code} 吗？`, () => {
        if (item) item.remove();
        showMiniToast("success", "删除成功", `商品 ${code} 已删除`);
      });
    });
  });

  // Goods entry save button
  document.querySelectorAll(".mini-ff-save").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      showMiniToast("success", "保存成功", "商品信息已保存，可继续录入下一商品。");
      setTimeout(() => {
        const scanInput = document.querySelector(".mini-scan-bar input");
        if (scanInput) { scanInput.value = ""; scanInput.focus(); }
      }, 300);
    });
  });

  document.querySelectorAll(".mini-content button").forEach((element) => {
    if (element.dataset.miniSheetControl || element.id === "miniSheetPrimary" || element.classList.contains("mini-ff-save") || element.classList.contains("mini-goods-row-act") || element.classList.contains("mini-doc-card-act")) return;
    element.addEventListener("click", () => {
      const label = element.querySelector(".title")?.textContent?.trim() || element.textContent.trim();
      const target = resolveMiniButtonTarget(pageKey, label);
      if (target) {
        window.location.href = target;
        return;
      }
      if ((label.includes("提交") || label.includes("通过")) && miniValidationRules[pageKey]) {
        if (!validateMiniForm(pageKey)) return;
      }
      openMiniSheet(inferMiniActionType(label), label);
    });
  });

  document.querySelectorAll("[data-mini-sheet-control]").forEach((element) => {
    element.addEventListener("click", () => {
      const sheet = document.getElementById("miniSheet");
      if (sheet) sheet.classList.remove("show");
    });
  });

  const primary = document.getElementById("miniSheetPrimary");
  if (primary) {
    primary.addEventListener("click", () => {
      const sheet = document.getElementById("miniSheet");
      if (sheet) sheet.classList.remove("show");
      showMiniToast(primary.dataset.toastType || "success", primary.dataset.toastTitle || "处理成功", primary.dataset.toastDesc || "当前为移动端原型反馈。");
    });
  }

  const sheet = document.getElementById("miniSheet");
  if (sheet) {
    sheet.addEventListener("click", (event) => {
      if (event.target === sheet) {
        sheet.classList.remove("show");
      }
    });
  }
}

function openModal(type, actionLabel) {
  const config = type === "form" ? resolvePcFormConfig(actionLabel) : (modalConfigs[type] || modalConfigs.view);
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = config?.title || "操作弹窗";
  document.getElementById("modalSub").textContent = config?.sub || "用于演示点击按钮后的原型反馈。";
  document.getElementById("modalFields").innerHTML = type === "form"
    ? renderPcForm(actionLabel)
    : config.fields.map(([label, value]) => `
      <div class="modal-box">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>`).join("");
  const noteEl = document.getElementById("modalNote");
  const noteText = config?.note || "";
  noteEl.textContent = noteText;
  noteEl.style.display = noteText ? "" : "none";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = type === "form"
    ? (["新增退货申请", "编辑退货申请", "新增退仓申请", "编辑退仓申请", "新增物权转移申请", "编辑物权转移申请"].includes(actionLabel) ? "保存草稿" : "提交表单")
    : config.primary;
  primaryButton.dataset.feedbackType = type;
  primaryButton.dataset.actionLabel = actionLabel || config.title;
  modal.classList.add("show");

  if (type === "form") {
    bindPcFormFieldEvents();
    if (["新增要货周期规则", "编辑要货周期规则"].includes(actionLabel)) {
      bindStoreOrderCycleFormEvents();
    }
    if (["新增申请", "编辑申请", "新增退货申请", "编辑退货申请", "新增退仓申请", "编辑退仓申请", "新增物权转移申请", "编辑物权转移申请"].includes(actionLabel)) {
      bindInboundApplyGoodsEditorEvents(actionLabel);
    }
  }
}

function bindModalEvents() {
  document.querySelectorAll("[data-demand-delivery]").forEach((element) => {
    element.addEventListener("click", () => {
      openDemandDelivery(element.dataset.demandDelivery || "");
    });
  });

  document.querySelectorAll("[data-modal]").forEach((element) => {
    element.addEventListener("click", () => {
      openModal(element.dataset.modal, element.dataset.actionLabel || "");
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", () => {
      const modal = document.getElementById(element.dataset.closeModal);
      if (modal) {
        modal.classList.remove("show");
      }
    });
  });

  const primaryButton = document.getElementById("modalPrimaryButton");
  if (primaryButton) {
    primaryButton.addEventListener("click", () => {
      if (primaryButton.dataset.feedbackType === "form") {
        if (!validatePcForm(primaryButton.dataset.actionLabel || "")) return;
        if (primaryButton.dataset.actionLabel === "新增盘点计划申请") {
          saveInventoryPlanCreateDraft();
          renderPcPage("inventoryplan", "list");
          const toastConfig = getToastConfig("save-returnapply-draft", `盘点计划申请草稿已保存`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "编辑盘点计划申请") {
          saveInventoryPlanEditDraft();
          renderPcPage("inventoryplan", "list");
          const toastConfig = getToastConfig("save-returnapply-draft", `盘点计划申请草稿已更新`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "新增退货申请") {
          const record = saveReturnApplyCreateDraft();
          renderPcPage("returnapply", "list");
          const toastConfig = getToastConfig("save-returnapply-draft", `退货申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "编辑退货申请") {
          const record = saveReturnApplyEditDraft();
          renderPcPage("returnapply", "list");
          const toastConfig = getToastConfig("save-returnapply-draft", `退货申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "新增退仓申请") {
          const record = saveReturnApplyInCreateDraft();
          renderPcPage("returnapplyin", "list");
          const toastConfig = getToastConfig("save-returnapplyin-draft", `退仓申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "编辑退仓申请") {
          const record = saveReturnApplyInEditDraft();
          renderPcPage("returnapplyin", "list");
          const toastConfig = getToastConfig("save-returnapplyin-draft", `退仓申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "新增物权转移申请") {
          const record = saveOwnershipApplyCreateDraft();
          renderPcPage("ownershipapply", "list");
          const toastConfig = getToastConfig("save-ownershipapply-draft", `物权转移申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "编辑物权转移申请") {
          const record = saveOwnershipApplyEditDraft();
          renderPcPage("ownershipapply", "list");
          const toastConfig = getToastConfig("save-ownershipapply-draft", `物权转移申请草稿 ${record?.orderNo || ""}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        }
        if (primaryButton.dataset.actionLabel === "新增要货周期规则") {
          const record = saveStoreOrderCycleCreate();
          renderPcPage("storeordercycle", "list");
          const modal = document.getElementById("globalModal");
          if (modal) modal.classList.remove("show");
          const toastConfig = getToastConfig("form", `新增要货周期规则 ${record.ruleCode}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
          return;
        }
        if (primaryButton.dataset.actionLabel === "编辑要货周期规则") {
          const record = saveStoreOrderCycleEdit();
          renderPcPage("storeordercycle", "list");
          const modal = document.getElementById("globalModal");
          if (modal) modal.classList.remove("show");
          const toastConfig = getToastConfig("form", `编辑要货周期规则 ${record.ruleCode}`);
          showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
          return;
        }
      }
      if (primaryButton.dataset.feedbackType === "submit-draft") {
        applyNewProductDraftSubmit();
      }
      if (primaryButton.dataset.feedbackType === "delete-row") {
        applyNewProductDelete();
      }
      if (primaryButton.dataset.feedbackType === "delete-storeordercycle") {
        const code = primaryButton.dataset.rowId || primaryButton.dataset.actionLabel || "";
        deleteStoreOrderCycleRecord(code);
        renderPcPage("storeordercycle", "list");
        const modal = document.getElementById("globalModal");
        if (modal) modal.classList.remove("show");
        const toastConfig = getToastConfig("delete-storeordercycle", `删除要货周期规则 ${code}`);
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
        return;
      }
      if (primaryButton.dataset.feedbackType === "delete-inbound-draft") {
        applyInboundDelete();
      }
      if (primaryButton.dataset.feedbackType === "submit-inbound-draft") {
        applyInboundDraftSubmit();
      }
      if (primaryButton.dataset.feedbackType === "delete-returnapply-draft") {
        applyReturnApplyDelete();
      }
      if (primaryButton.dataset.feedbackType === "submit-returnapply-draft") {
        const toastConfig = getToastConfig("submit-returnapply-draft", primaryButton.dataset.actionLabel || "");
        applyReturnApplyDraftSubmit();
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "approve-returnapply" || primaryButton.dataset.feedbackType === "reject-returnapply") {
        const approvalDecision = primaryButton.dataset.approvalDecision || "pass";
        const approveComment = (document.getElementById("returnApplyApproveComment")?.value || "").trim();
        const rejectReason = (document.getElementById("returnApplyRejectReason")?.value || "").trim();
        if (!approveComment) {
          showToast("error", "缺少审批意见", "请先填写审批意见，再确认当前审批动作。");
          return;
        }
        if (approvalDecision === "reject" && !rejectReason) {
          showToast("error", "缺少驳回原因", "审批驳回时请先填写驳回原因，再确认提交。");
          return;
        }
        const feedbackType = approvalDecision === "reject" ? "reject-returnapply" : "approve-returnapply";
        applyReturnApplyApprove({ decision: approvalDecision, approveComment, rejectReason });
        const toastConfig = getToastConfig(feedbackType, primaryButton.dataset.actionLabel || "");
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "delete-returnapplyin-draft") {
        applyReturnApplyInDelete();
      }
      if (primaryButton.dataset.feedbackType === "submit-returnapplyin-draft") {
        const toastConfig = getToastConfig("submit-returnapplyin-draft", primaryButton.dataset.actionLabel || "");
        const selectedOrders = getReturnApplyInSelectedOrders("草稿");
        selectedOrders.forEach(({ orderNo }) => {
          getReturnApplyInListRecords().forEach((record) => {
            if (record.orderNo !== orderNo) return;
            const eventTime = buildReturnApplyInLogTime();
            markReturnApplyInRecordPending(record, eventTime);
            appendReturnApplyInApprovalLog(record.orderNo, record.submitter, "提交审批", "列表草稿记录已提交审批", "-", "客户服务经理", "待审批", eventTime, record.submitter, "待审批");
          });
        });
        renderPcPage("returnapplyin", "list");
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "approve-returnapplyin" || primaryButton.dataset.feedbackType === "reject-returnapplyin") {
        const approvalDecision = primaryButton.dataset.approvalDecision || "pass";
        const approveComment = (document.getElementById("returnApplyInApproveComment")?.value || "").trim();
        const rejectReason = (document.getElementById("returnApplyInRejectReason")?.value || "").trim();
        if (!approveComment) {
          showToast("error", "缺少审批意见", "请先填写审批意见，再确认当前审批动作。");
          return;
        }
        if (approvalDecision === "reject" && !rejectReason) {
          showToast("error", "缺少驳回原因", "审批驳回时请先填写驳回原因，再确认提交。");
          return;
        }
        const feedbackType = approvalDecision === "reject" ? "reject-returnapplyin" : "approve-returnapplyin";
        applyReturnApplyInApprove({ decision: approvalDecision, approveComment, rejectReason });
        const toastConfig = getToastConfig(feedbackType, primaryButton.dataset.actionLabel || "");
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "delete-ownershipapply-draft") {
        applyOwnershipApplyDelete();
      }
      if (primaryButton.dataset.feedbackType === "submit-ownershipapply-draft") {
        const toastConfig = getToastConfig("submit-ownershipapply-draft", primaryButton.dataset.actionLabel || "");
        const selectedOrders = getOwnershipApplySelectedOrders("草稿");
        selectedOrders.forEach(({ orderNo }) => {
          getOwnershipApplyListRecords().forEach((record) => {
            if (record.orderNo !== orderNo) return;
            const eventTime = buildOwnershipApplyLogTime();
            markOwnershipApplyRecordPending(record, eventTime);
            appendOwnershipApplyApprovalLog(record.orderNo, record.submitter, "提交审批", "列表草稿记录已提交审批", "-", "货主管理经理", "待审批", eventTime, record.submitter, "待审批");
          });
        });
        renderPcPage("ownershipapply", "list");
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "approve-ownershipapply" || primaryButton.dataset.feedbackType === "reject-ownershipapply") {
        const approvalDecision = primaryButton.dataset.approvalDecision || "pass";
        const approveComment = (document.getElementById("ownershipApplyApproveComment")?.value || "").trim();
        const rejectReason = (document.getElementById("ownershipApplyRejectReason")?.value || "").trim();
        if (!approveComment) {
          showToast("error", "缺少审批意见", "请先填写审批意见，再确认当前审批动作。");
          return;
        }
        if (approvalDecision === "reject" && !rejectReason) {
          showToast("error", "缺少驳回原因", "审批驳回时请先填写驳回原因，再确认提交。");
          return;
        }
        const feedbackType = approvalDecision === "reject" ? "reject-ownershipapply" : "approve-ownershipapply";
        applyOwnershipApplyApprove({ decision: approvalDecision, approveComment, rejectReason });
        const toastConfig = getToastConfig(feedbackType, primaryButton.dataset.actionLabel || "");
        showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
      }
      if (primaryButton.dataset.feedbackType === "approve-inbound" || primaryButton.dataset.feedbackType === "reject-inbound") {
        const approvalDecision = primaryButton.dataset.approvalDecision || "pass";
        const approveComment = (document.getElementById("inboundApproveComment")?.value || "").trim();
        const rejectReason = (document.getElementById("inboundRejectReason")?.value || "").trim();

        if (!approveComment) {
          showToast("error", "缺少审批意见", "请先填写审批意见，再确认当前审批动作。");
          return;
        }

        if (approvalDecision === "reject" && !rejectReason) {
          showToast("error", "缺少驳回原因", "审批驳回时请先填写驳回原因，再确认提交。");
          return;
        }

        applyInboundApprove({
          decision: approvalDecision,
          approveComment,
          rejectReason
        });
      }
      if (primaryButton.dataset.feedbackType === "approve-newproduct" || primaryButton.dataset.feedbackType === "reject-newproduct") {
        const approvalDecision = primaryButton.dataset.approvalDecision || "pass";
        const approveComment = (document.getElementById("newProductApproveComment")?.value || "").trim();
        const rejectReason = (document.getElementById("newProductRejectReason")?.value || "").trim();
        const nextApprover = (document.getElementById("newProductNextApprover")?.value || "").trim();

        if (!approveComment) {
          showToast("error", "缺少审批意见", "请先填写审批意见，再确认当前审批动作。");
          return;
        }

        if (!nextApprover) {
          showToast("error", "缺少下一审批人", "请先选择下一审批人，再确认当前审批动作。");
          return;
        }

        if (approvalDecision === "reject" && !rejectReason) {
          showToast("error", "缺少驳回原因", "审批驳回时请先填写驳回原因，再确认提交。");
          return;
        }

        applyNewProductApprove({
          decision: approvalDecision,
          approveComment,
          rejectReason,
          nextApprover
        });
      }
      const modal = document.getElementById("globalModal");
      if (modal) {
        modal.classList.remove("show");
      }
      const toastConfig = getToastConfig(primaryButton.dataset.feedbackType || "view", primaryButton.dataset.actionLabel || "");
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }

  const modal = document.getElementById("globalModal");
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  }
}

function openDemandDetail(orderNo) {
  const config = demandDetailConfigs[orderNo];
  const drawer = document.getElementById("globalDrawer");
  if (!config || !drawer) return;

  document.getElementById("drawerTitle").textContent = `${config.title} - ${orderNo}`;
  document.getElementById("drawerSub").textContent = config.sub;
  document.getElementById("drawerBody").innerHTML = `
    <div class="drawer-section">
      <h4>状态总览</h4>
      <div class="drawer-kpi-grid">
        ${config.summary.map(([label, value, note]) => `
          <div class="drawer-kpi-card">
            <div class="drawer-kpi-label">${label}</div>
            <div class="drawer-kpi-value">${value}</div>
            <div class="drawer-kpi-note">${note}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="drawer-section">
      <h4>单头信息</h4>
      <div class="drawer-list">
        ${config.baseInfo.map(([label, value]) => `
          <div class="drawer-list-row">
            <div class="drawer-key">${label}</div>
            <div class="drawer-value">${value}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="drawer-section">
      <h4>商品明细</h4>
      <div class="drawer-table-wrap">
        <table>
          <thead><tr>${config.goodsHeaders.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>${config.goodsRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </div>
    <div class="drawer-section">
      <h4>履约轨迹</h4>
      <div class="drawer-list">
        ${config.timeline.map(([time, actor, action, status]) => `
          <div class="drawer-list-row">
            <div class="drawer-key">${time}</div>
            <div class="drawer-value">${actor} / ${action} / ${status}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="drawer-section">
      <h4>上下游联动</h4>
      <div class="drawer-table-wrap">
        <table>
          <thead><tr><th>方向</th><th>系统/模块</th><th>状态</th><th>说明</th></tr></thead>
          <tbody>${config.links.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;

  setDrawerPrimaryAction(config.primaryAction, "modal", config.primaryAction, "view");

  drawer.classList.add("show");
}

function openDrawer(title, headers, row, rowIndex) {
  const drawer = document.getElementById("globalDrawer");
  if (!drawer) return;
  drawer.classList.remove("drawer-editing");
  const isDraft = headers.some((header, index) => {
    if (header.includes("状态")) {
      const val = (row[index] ?? "").toString();
      return val.includes("草稿");
    }
    return false;
  });
  const readonlyHints = ["状态", "时间", "操作", "审批", "生成", "写入", "附件", "勾选", "序号"];
  const isEditable = (header) => !readonlyHints.some(h => header.includes(h));
  const skipFields = ["勾选", "序号", "操作"];
  const shouldSkip = (header) => skipFields.some(h => header.includes(h));

  document.getElementById("drawerTitle").textContent = title;

  const allFieldsHtml = headers.map((header, index) => {
    if (shouldSkip(header)) return "";
    const rawVal = row[index] ?? "-";
    const plainVal = typeof rawVal === "string" ? rawVal.replace(/<[^>]*>/g, "") : rawVal;
    const editable = isDraft && isEditable(header);
    return `
    <div class="drawer-field-item">
      <div class="drawer-field-label">${header}</div>
      <div class="drawer-field-val">
        <span class="drawer-field-value">${rawVal}</span>
        ${editable ? `<span class="drawer-field-editable"><input type="text" value="${plainVal}" data-field="${header}" /></span>` : ""}
      </div>
    </div>`;
  }).join("");

  document.getElementById("drawerBody").innerHTML = `
    <div class="drawer-section">
      <h4>单据信息</h4>
      <div class="drawer-field-grid">
        ${allFieldsHtml}
      </div>
    </div>`;

  const footer = document.getElementById("drawerFooter");
  if (footer) {
    if (isDraft) {
      footer.innerHTML = `
        <button class="btn-secondary" onclick="document.getElementById('globalDrawer').classList.remove('show')">取消</button>
        <button class="btn-secondary" id="drawerEditButton">编辑</button>
        <button class="btn-primary" id="drawerSaveButton" style="display:none;">保存</button>
        <button class="btn-primary" id="drawerSubmitBtn">提交</button>
        <button class="btn-danger" id="drawerDeleteBtn">删除</button>`;
    } else {
      footer.innerHTML = `
        <button class="btn-secondary" onclick="document.getElementById('globalDrawer').classList.remove('show')">取消</button>`;
    }
  }

  const editBtn = document.getElementById("drawerEditButton");
  const saveBtn = document.getElementById("drawerSaveButton");
  const submitBtn = document.getElementById("drawerSubmitBtn");
  const deleteBtn = document.getElementById("drawerDeleteBtn");

  if (editBtn) {
    editBtn.onclick = function() {
      drawer.classList.add("drawer-editing");
      editBtn.style.display = "none";
      if (saveBtn) saveBtn.style.display = "";
    };
  }
  if (saveBtn) {
    saveBtn.onclick = function() {
      drawer.classList.remove("drawer-editing");
      saveBtn.style.display = "none";
      if (editBtn) editBtn.style.display = "";
      showToast("success", "保存成功", "草稿单据已保存，可继续编辑或提交审批。");
    };
  }
  if (submitBtn) {
    submitBtn.onclick = function() {
      showToast("success", "提交成功", "单据已提交审批，可在审批列表中查看进度。");
    };
  }
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      drawer.classList.remove("show");
      showToast("success", "删除成功", "草稿单据已删除。");
    };
  }

  footer.querySelectorAll("[data-close-drawer]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      drawer.classList.remove("show");
    });
  });

  drawer.classList.add("show");
}

function openProductRowEditor(mode, headers, row, rowIndex) {
  const drawer = document.getElementById("globalDrawer");
  if (!drawer) return;

  const productName = row[4] || `第 ${rowIndex + 1} 行`;
  const readonlyFields = [["货主", row[1] || "-"], ["模式", mode === "create" ? "录入行编辑" : "修改行编辑"], ["行号", row[0] || `${rowIndex + 1}`]];
  const editableFields = headers.map((header, index) => [header, row[index] ?? "-"]).filter(([header]) => !["行号", "货主", "操作"].includes(header));

  document.getElementById("drawerTitle").textContent = `${mode === "create" ? "新品录入行编辑" : "新品修改行编辑"} - ${productName}`;
  document.getElementById("drawerSub").textContent = "当前抽屉用于模拟表格行编辑，可继续扩展为真实的行内保存、校验和附件上传交互。";
  document.getElementById("drawerBody").innerHTML = `
    <div class="drawer-section">
      <h4>只读信息</h4>
      <div class="info-grid">
        ${readonlyFields.map(([label, value]) => `
          <div class="info-item">
            <div class="k">${label}</div>
            <div>${label === "货主" ? `${value}（来源于当前登录用户，不允许编辑）` : value}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="drawer-section">
      <h4>行编辑表单</h4>
      <div class="pc-form-grid">
        ${editableFields.map(([label, value]) => `
          <div class="pc-form-field ${label === "校验失败原因" ? "full" : ""}" data-pc-form-label="${label}" data-pc-filled-value="${String(value).includes("请") || value === "-" ? "已补全示例值" : `${value}（已调整）`}">
            <div class="pc-form-label">${label}</div>
            <div class="pc-form-value">${value}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="drawer-section">
      <h4>编辑说明</h4>
      <div class="drawer-list">
        <div class="drawer-list-row"><div class="drawer-key">保存方式</div><div class="drawer-value">点击底部“保存本行”模拟保存当前商品行。</div></div>
        <div class="drawer-list-row"><div class="drawer-key">字段约束</div><div class="drawer-value">货主来源于登录用户，不允许编辑；其余字段按当前业务规则校验。</div></div>
      </div>
    </div>`;
  setDrawerPrimaryAction("保存本行", "toast", productName, "save-row");
  drawer.classList.add("show");
}

function openDeleteConfirm(productName, mode) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  const selectedRecord = newProductPageState.selectedEditRow;

  document.getElementById("modalTitle").textContent = "删除确认";
  document.getElementById("modalSub").textContent = `当前操作将删除${mode === "create" ? "录入" : "修改"}列表中的商品行，请确认是否继续。`;
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">商品名称</div>
      <div class="value">${productName}</div>
    </div>
    <div class="modal-box">
      <div class="label">处理模式</div>
      <div class="value">${mode === "create" ? "新品录入" : "新品修改"}</div>
    </div>
    <div class="modal-box">
      <div class="label">删除影响</div>
      <div class="value">当前行将从示例列表中移除，并需要重新确认提交结果。</div>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将展示删除成功反馈，后续可继续扩展真实删除和恢复机制。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认删除";
  primaryButton.dataset.feedbackType = "delete-row";
  primaryButton.dataset.actionLabel = productName;
  primaryButton.dataset.rowId = selectedRecord?.rowId || "";
  modal.classList.add("show");
}

function openNewProductSubmitConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = "新品录入提交";
  document.getElementById("modalSub").textContent = "当前支持单行或多行草稿记录统一提交，提交后状态将更新为待审批。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">提交记录数</div>
      <div class="value">${labels.length} 条</div>
    </div>
    <div class="modal-box">
      <div class="label">提交结果</div>
      <div class="value">提交后进入待审批</div>
    </div>
    <div class="modal-box">
      <div class="label">选中记录</div>
      <div class="value">${labels.join("；")}</div>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写草稿提交结果，后续可继续补审批意见和驳回原因。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认提交";
  primaryButton.dataset.feedbackType = "submit-draft";
  primaryButton.dataset.actionLabel = `提交 ${labels.length} 条新品记录`;
  modal.classList.add("show");
}

function openNewProductApproveConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = "新品录入审批";
  document.getElementById("modalSub").textContent = "当前支持单行或多行待审批记录统一审批，可在弹窗中选择审批通过或审批驳回。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">审批记录数</div>
      <div class="value">${labels.length} 条</div>
    </div>
    <div class="modal-box">
      <div class="label">审批结果</div>
      <div class="value" id="newProductApproveResult">审批通过</div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">选中记录</div>
      <div class="value">${labels.join("；")}</div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">审批动作</div>
      <div class="approve-decision-group">
        <button type="button" class="approve-decision-button active" data-newproduct-approve-decision="pass">审批通过</button>
        <button type="button" class="approve-decision-button reject" data-newproduct-approve-decision="reject">审批驳回</button>
      </div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">审批意见</div>
      <textarea class="modal-textarea" id="newProductApproveComment" placeholder="请输入审批意见">资料齐全，符合新品主数据准入要求，同意写入商品信息。</textarea>
    </div>
    <div class="modal-box modal-box-full" id="newProductRejectReasonField" style="display:none;">
      <div class="label">驳回原因</div>
      <textarea class="modal-textarea" id="newProductRejectReason" placeholder="请输入驳回原因，例如条形码重复、资质资料不完整"></textarea>
    </div>
    <div class="modal-box">
      <div class="label">下一审批人</div>
      <select class="modal-select" id="newProductNextApprover">
        <option value="商品主数据专员" selected>商品主数据专员</option>
        <option value="商品平台主管">商品平台主管</option>
        <option value="提单人">提单人</option>
        <option value="系统自动写入">系统自动写入</option>
      </select>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，审批通过后将回写为已审核通过并写入商品信息；审批驳回后将回写驳回结果并退回草稿。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认通过";
  primaryButton.dataset.feedbackType = "approve-newproduct";
  primaryButton.dataset.actionLabel = `审批通过 ${labels.length} 条新品记录`;
  primaryButton.dataset.approvalDecision = "pass";

  const updateApproveMode = (decision) => {
    const result = document.getElementById("newProductApproveResult");
    const note = document.getElementById("modalNote");
    const rejectField = document.getElementById("newProductRejectReasonField");
    const nextApprover = document.getElementById("newProductNextApprover");

    document.querySelectorAll("[data-newproduct-approve-decision]").forEach((button) => {
      const isActive = (button.dataset.newproductApproveDecision || "pass") === decision;
      button.classList.toggle("active", isActive);
    });

    if (result) {
      result.textContent = decision === "reject" ? "审批驳回" : "审批通过";
    }

    if (rejectField) {
      rejectField.style.display = decision === "reject" ? "block" : "none";
    }

    if (nextApprover) {
      nextApprover.value = decision === "reject" ? "提单人" : "商品主数据专员";
    }

    if (decision === "reject") {
      primaryButton.textContent = "确认驳回";
      primaryButton.dataset.feedbackType = "reject-newproduct";
      primaryButton.dataset.actionLabel = `驳回 ${labels.length} 条新品记录`;
      primaryButton.dataset.approvalDecision = "reject";
      if (note) {
        note.textContent = "当前为原型演示，审批驳回后将记录审批意见与驳回原因，并将记录退回提单人重新维护后再次提交。";
      }
      return;
    }

    primaryButton.textContent = "确认通过";
    primaryButton.dataset.feedbackType = "approve-newproduct";
    primaryButton.dataset.actionLabel = `审批通过 ${labels.length} 条新品记录`;
    primaryButton.dataset.approvalDecision = "pass";
    if (note) {
      note.textContent = "当前为原型演示，审批通过后将记录审批意见并回写为已审核通过，同时同步写入商品信息。";
    }
  };

  document.querySelectorAll("[data-newproduct-approve-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      updateApproveMode(button.dataset.newproductApproveDecision || "pass");
    });
  });

  updateApproveMode("pass");
  modal.classList.add("show");
}

function openInboundSubmitConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = "入库申请提交";
  document.getElementById("modalSub").textContent = "当前支持单张或多张草稿入库申请单统一提交，提交后状态将更新为待审批。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">提交单据数</div>
      <div class="value">${labels.length} 条</div>
    </div>
    <div class="modal-box">
      <div class="label">提交结果</div>
      <div class="value">提交后进入待审批</div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">选中单据</div>
      <div class="value">${labels.join("；")}</div>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写草稿提交结果，并等待审批处理。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认提交";
  primaryButton.dataset.feedbackType = "submit-inbound-draft";
  primaryButton.dataset.actionLabel = `提交 ${labels.length} 条入库申请单`;
  modal.classList.add("show");
}

function openInboundApproveConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = "入库申请审批";
  document.getElementById("modalSub").textContent = "当前支持单张或多张待审批入库申请单统一审批，可在弹窗中选择审批通过或审批驳回。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">审批单据数</div>
      <div class="value">${labels.length} 条</div>
    </div>
    <div class="modal-box">
      <div class="label">审批结果</div>
      <div class="value" id="inboundApproveResult">审批通过</div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">选中单据</div>
      <div class="value">${labels.join("；")}</div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">审批动作</div>
      <div class="approve-decision-group">
        <button type="button" class="approve-decision-button active" data-inbound-approve-decision="pass">审批通过</button>
        <button type="button" class="approve-decision-button reject" data-inbound-approve-decision="reject">审批驳回</button>
      </div>
    </div>
    <div class="modal-box modal-box-full">
      <div class="label">审批意见</div>
      <textarea class="modal-textarea" id="inboundApproveComment" placeholder="请输入审批意见">资料齐全，同意审核通过并自动生成入库通知单。</textarea>
    </div>
    <div class="modal-box modal-box-full" id="inboundRejectReasonField" style="display:none;">
      <div class="label">驳回原因</div>
      <textarea class="modal-textarea" id="inboundRejectReason" placeholder="请输入驳回原因，例如预约时间不合理、商品明细不完整"></textarea>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，审批通过后将回写为已审核通过并自动生成入库通知单；审批驳回后将退回草稿。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认通过";
  primaryButton.dataset.feedbackType = "approve-inbound";
  primaryButton.dataset.actionLabel = `审批通过 ${labels.length} 条入库申请单`;
  primaryButton.dataset.approvalDecision = "pass";

  const updateApproveMode = (decision) => {
    const result = document.getElementById("inboundApproveResult");
    const note = document.getElementById("modalNote");
    const rejectField = document.getElementById("inboundRejectReasonField");

    document.querySelectorAll("[data-inbound-approve-decision]").forEach((button) => {
      const isActive = (button.dataset.inboundApproveDecision || "pass") === decision;
      button.classList.toggle("active", isActive);
    });

    if (result) {
      result.textContent = decision === "reject" ? "审批驳回" : "审批通过";
    }
    if (rejectField) {
      rejectField.style.display = decision === "reject" ? "block" : "none";
    }
    if (decision === "reject") {
      primaryButton.textContent = "确认驳回";
      primaryButton.dataset.feedbackType = "reject-inbound";
      primaryButton.dataset.actionLabel = `驳回 ${labels.length} 条入库申请单`;
      primaryButton.dataset.approvalDecision = "reject";
      if (note) {
        note.textContent = "当前为原型演示，审批驳回后将记录审批意见与驳回原因，并将申请单退回草稿重新维护。";
      }
      return;
    }
    primaryButton.textContent = "确认通过";
    primaryButton.dataset.feedbackType = "approve-inbound";
    primaryButton.dataset.actionLabel = `审批通过 ${labels.length} 条入库申请单`;
    primaryButton.dataset.approvalDecision = "pass";
    if (note) {
      note.textContent = "当前为原型演示，审批通过后将回写已审核通过状态，并自动生成入库通知单。";
    }
  };

  document.querySelectorAll("[data-inbound-approve-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      updateApproveMode(button.dataset.inboundApproveDecision || "pass");
    });
  });

  updateApproveMode("pass");
  modal.classList.add("show");
}

function applyNewProductDraftSubmit() {
  const selectedRows = Array.from(document.querySelectorAll("[data-newproduct-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === "草稿");

  selectedRows.forEach((checkbox) => {
    const record = getNewProductListRecords().find((item) => item.rowId === checkbox.dataset.rowId);
    if (record) {
      const eventTime = buildNewProductLogTime();
      record.submitStatus = "待审批";
      record.recordStatus = "已提交";
      record.approveStatus = "待审批";
      record.approveComment = "待审批";
      record.rejectReason = "-";
      record.submitter = record.submitter || normalizeNewProductOwner(record.owner);
      record.approver = "待审批";
      record.nextApprover = "商品主数据专员";
      record.writeBackStatus = "待写入";
      record.time = eventTime;
      appendNewProductApprovalLog(record.orderNo, normalizeNewProductOwner(record.owner), "提交审批", "列表草稿记录已提交审批", "-", "商品主数据专员", "待审批", eventTime, record.submitter || normalizeNewProductOwner(record.owner), "待审批");
    }
  });

  renderPcPage("newproduct", "list");
}

function getInboundSelectedOrderRows(status) {
  return Array.from(document.querySelectorAll("[data-inbound-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === status);
}

function getInboundSelectedOrders(status) {
  const selectedRows = getInboundSelectedOrderRows(status);
  const seen = new Set();
  return selectedRows
    .map((element) => ({
      orderNo: element.dataset.orderNo || "",
      label: element.dataset.submitLabel || element.dataset.orderNo || "入库申请单"
    }))
    .filter((item) => {
      if (!item.orderNo || seen.has(item.orderNo)) return false;
      seen.add(item.orderNo);
      return true;
    });
}

function updateInboundOrderStatus(orderNo, nextStatus) {
  const inboundConfig = pcTabConfigs.inbound;
  if (!inboundConfig?.listRows?.length || !orderNo) return;
  inboundConfig.listRows = inboundConfig.listRows.map((row) => {
    if (row[2] !== orderNo) return row;
    const owner = row[3];
    row[0] = buildInboundActionCell(nextStatus, orderNo);
    row[1] = buildInboundSelectCell(nextStatus, orderNo, owner);
    row[5] = buildInboundStatusTag(nextStatus);
    if (nextStatus === "待审批") {
      row[6] = "未生成";
      row[7] = "待回传BMS";
    } else if (nextStatus === "已审核通过") {
      row[6] = "已生成入库通知单";
      row[7] = "待回传BMS";
    } else if (nextStatus === "草稿") {
      row[6] = "未生成";
      row[7] = "待回传BMS";
    }
    return row;
  });
}

function applyInboundDraftSubmit() {
  getInboundSelectedOrders("草稿").forEach(({ orderNo }) => {
    updateInboundOrderStatus(orderNo, "待审批");
  });
  renderPcPage("inbound", "list");
}

function applyInboundApprove({ decision = "pass" } = {}) {
  getInboundSelectedOrders("待审批").forEach(({ orderNo }) => {
    updateInboundOrderStatus(orderNo, decision === "reject" ? "草稿" : "已审核通过");
  });
  renderPcPage("inbound", "list");
}

function saveReturnApplyCreateDraft() {
  const formValues = collectNewProductFormValues();
  const eventTime = buildReturnApplyLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : getReturnApplyModalGoodsRows();
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildReturnApplyGoodsRowFromRecord();
  const qty = String(firstRow.qty || 0);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const record = {
    rowId: `ra-row-${Date.now()}`,
    submitStatus: "草稿",
    orderNo: buildReturnApplyOrderNo(),
    sourceMode: "手工创建",
    owner: formValues["货主"] || "外部货主B",
    warehouse: formValues["申请仓库"] || "华南2仓",
    submitter: "客户运营A",
    approver: "-",
    goodsCode: firstRow.code || "MAT-TH-NEW",
    barcode: firstRow.barcode || "6905000099999",
    productName: firstRow.name || "退货商品-待确认",
    spec: firstRow.spec || "12瓶/箱",
    unit: firstRow.unit || "箱",
    batchNo: `BATCH${String(Date.now()).slice(-8)}`,
    produceDate: "2026-05-26",
    expireDate: "2027-05-26",
    applyQty: qty,
    taxRate: firstRow.tax || "13%",
    priceExTax: firstRow.untaxed || "42.48",
    priceIncTax: firstRow.taxed || "48.00",
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: eventTime,
    reason: formValues["退货原因"] || "商品临期退回",
    remark: formValues["备注"] || "待重新提交",
    attachments: "退货说明",
    contact: formValues["联系人"] || "李波 / 13900000000",
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  };
  getReturnApplyListRecords().unshift(record);
  returnApplyPageState.selectedEditRow = record;
  returnApplyFormState.record = { ...record };
  returnApplyFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendReturnApplyApprovalLog(record.orderNo, record.submitter, "保存草稿", "已保存退货草稿", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function saveReturnApplyEditDraft() {
  const currentEdit = getReturnApplyEditState();
  const formValues = collectNewProductFormValues();
  const record = getReturnApplyListRecords().find((item) => item.rowId === currentEdit.rowId);
  if (!record) return null;
  const eventTime = buildReturnApplyLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : (record.goodsRows?.length ? cloneInboundApplyGoodsRows(record.goodsRows) : [buildReturnApplyGoodsRowFromRecord(record)]);
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildReturnApplyGoodsRowFromRecord(record);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  Object.assign(record, {
    submitStatus: "草稿",
    approveComment: "-",
    rejectReason: "-",
    approver: "-",
    nextApprover: "待提交",
    time: eventTime,
    owner: formValues["货主"] || record.owner,
    warehouse: formValues["申请仓库"] || record.warehouse,
    goodsCode: firstRow.code || record.goodsCode,
    barcode: firstRow.barcode || record.barcode,
    productName: firstRow.name || record.productName,
    spec: firstRow.spec || record.spec,
    unit: firstRow.unit || record.unit,
    applyQty: String(firstRow.qty || record.applyQty || 0),
    taxRate: firstRow.tax || record.taxRate,
    priceExTax: firstRow.untaxed || record.priceExTax,
    priceIncTax: firstRow.taxed || record.priceIncTax,
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    reason: formValues["退货原因"] || record.reason,
    remark: formValues["备注"] || record.remark,
    contact: formValues["联系人"] || record.contact || "李波 / 13900000000",
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  });
  returnApplyPageState.selectedEditRow = record;
  returnApplyFormState.record = { ...record };
  returnApplyFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendReturnApplyApprovalLog(record.orderNo, record.submitter, "保存草稿", "草稿修改已保存", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function applyReturnApplyDelete() {
  const orderNo = document.getElementById("modalPrimaryButton")?.dataset.rowId || "";
  if (!orderNo || !returnApplyPageState.listRecords) return;
  const targetRecord = returnApplyPageState.listRecords.find((item) => item.orderNo === orderNo);
  returnApplyPageState.listRecords = returnApplyPageState.listRecords.filter((item) => item.orderNo !== orderNo);
  if (targetRecord) {
    appendReturnApplyApprovalLog(targetRecord.orderNo, targetRecord.submitter, "删除草稿", "草稿退货申请单已删除", "-", "-", "已删除", "", targetRecord.submitter, targetRecord.approver || "-");
  }
  renderPcPage("returnapply", "list");
}

function getReturnApplySelectedRows(status) {
  return Array.from(document.querySelectorAll("[data-returnapply-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === status);
}

function getReturnApplySelectedOrders(status) {
  const seen = new Set();
  return getReturnApplySelectedRows(status).map((element) => ({
    orderNo: element.dataset.orderNo || "",
    label: element.dataset.submitLabel || element.dataset.orderNo || "退货申请单"
  })).filter((item) => {
    if (!item.orderNo || seen.has(item.orderNo)) return false;
    seen.add(item.orderNo);
    return true;
  });
}

function applyReturnApplyDraftSubmit() {
  getReturnApplySelectedOrders("草稿").forEach(({ orderNo }) => {
    const record = getReturnApplyListRecords().find((item) => item.orderNo === orderNo);
    if (!record) return;
    const eventTime = buildReturnApplyLogTime();
    record.submitStatus = "待审批";
    record.approveComment = "待审批";
    record.rejectReason = "-";
    record.approver = "待审批";
    record.nextApprover = "客户服务经理";
    record.generateNotice = "待审批通过后生成";
    record.time = eventTime;
    appendReturnApplyApprovalLog(record.orderNo, record.submitter, "提交审批", "列表草稿记录已提交审批", "-", "客户服务经理", "待审批", eventTime, record.submitter, "待审批");
  });
  renderPcPage("returnapply", "list");
}

function applyReturnApplyApprove({ decision = "pass", approveComment = "", rejectReason = "" } = {}) {
  getReturnApplySelectedOrders("待审批").forEach(({ orderNo }) => {
    const record = getReturnApplyListRecords().find((item) => item.orderNo === orderNo);
    if (!record) return;
    const eventTime = buildReturnApplyLogTime();
    const isReject = decision === "reject";
    record.submitStatus = isReject ? "草稿" : "已审核通过";
    record.approveComment = isReject ? (approveComment || "审批驳回，待重新维护") : (approveComment || "同意退货并生成退货通知单");
    record.rejectReason = isReject ? (rejectReason || "商品明细待补充") : "-";
    record.approver = "审批人";
    record.nextApprover = isReject ? "申请人重新维护" : "系统自动生成";
    record.generateNotice = isReject ? "待重新提交后生成" : "已生成退货通知单";
    record.time = eventTime;
    appendReturnApplyApprovalLog(record.orderNo, "审批人", isReject ? "审批驳回" : "审批通过", record.approveComment, record.rejectReason, record.nextApprover, isReject ? "草稿" : "已审核通过", eventTime, record.submitter, "审批人");
  });
  renderPcPage("returnapply", "list");
}

function saveReturnApplyInCreateDraft() {
  const formValues = collectNewProductFormValues();
  const eventTime = buildReturnApplyInLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : getReturnApplyInModalGoodsRows();
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildReturnApplyInGoodsRowFromRecord();
  const qty = String(firstRow.qty || 0);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const record = {
    rowId: `rti-row-${Date.now()}`,
    submitStatus: "草稿",
    orderNo: buildReturnApplyInOrderNo(),
    sourceMode: "手工创建",
    customer: formValues["客户"] || "内部客户-华东分部",
    owner: formValues["原货主"] || "自有货主A",
    warehouse: formValues["退回仓"] || "华东1仓",
    submitter: "客户运营A",
    approver: "-",
    originOrderNo: formValues["原配送单"] || "PS20260521012",
    goodsCode: firstRow.code || "MAT-TK-NEW",
    barcode: firstRow.barcode || "6908100099999",
    productName: firstRow.name || "退仓商品-待确认",
    spec: firstRow.spec || "12瓶/箱",
    unit: firstRow.unit || "箱",
    batchNo: `BATCH${String(Date.now()).slice(-8)}`,
    produceDate: "2026-05-26",
    expireDate: "2027-05-26",
    originalQty: String(Number(qty) + 15),
    availableQty: qty,
    applyQty: qty,
    taxRate: firstRow.tax || "13%",
    priceExTax: firstRow.untaxed || "42.48",
    priceIncTax: firstRow.taxed || "48.00",
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: eventTime,
    reason: formValues["退仓原因"] || "门店退仓，包装完整",
    remark: formValues["备注"] || formValues["补充说明"] || "待仓库收货后进行上架",
    attachments: "现场照片/退仓说明",
    contact: formValues["联系人"] || "李波 / 13900000000",
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  };
  getReturnApplyInListRecords().unshift(record);
  returnApplyInPageState.selectedEditRow = record;
  returnApplyInFormState.record = { ...record };
  returnApplyInFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendReturnApplyInApprovalLog(record.orderNo, record.submitter, "保存草稿", "已保存退仓草稿", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function saveReturnApplyInEditDraft() {
  const currentEdit = getReturnApplyInEditState();
  const formValues = collectNewProductFormValues();
  const record = getReturnApplyInListRecords().find((item) => item.rowId === currentEdit.rowId);
  if (!record) return null;
  const eventTime = buildReturnApplyInLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : (record.goodsRows?.length ? cloneInboundApplyGoodsRows(record.goodsRows) : [buildReturnApplyInGoodsRowFromRecord(record)]);
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildReturnApplyInGoodsRowFromRecord(record);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  Object.assign(record, {
    submitStatus: "草稿",
    approveComment: "-",
    rejectReason: "-",
    approver: "-",
    nextApprover: "待提交",
    time: eventTime,
    customer: formValues["客户"] || record.customer,
    owner: formValues["原货主"] || record.owner,
    warehouse: formValues["退回仓"] || record.warehouse,
    originOrderNo: formValues["原配送单"] || record.originOrderNo,
    goodsCode: firstRow.code || record.goodsCode,
    barcode: firstRow.barcode || record.barcode,
    productName: firstRow.name || record.productName,
    spec: firstRow.spec || record.spec,
    unit: firstRow.unit || record.unit,
    availableQty: String(firstRow.qty || record.availableQty || 0),
    applyQty: String(firstRow.qty || record.applyQty || 0),
    taxRate: firstRow.tax || record.taxRate,
    priceExTax: firstRow.untaxed || record.priceExTax,
    priceIncTax: firstRow.taxed || record.priceIncTax,
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    reason: formValues["退仓原因"] || record.reason,
    remark: formValues["备注"] || formValues["补充说明"] || record.remark,
    contact: formValues["联系人"] || record.contact || "李波 / 13900000000",
    attachments: record.attachments,
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  });
  returnApplyInPageState.selectedEditRow = record;
  returnApplyInFormState.record = { ...record };
  returnApplyInFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendReturnApplyInApprovalLog(record.orderNo, record.submitter, "保存草稿", "草稿修改已保存", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function validateReturnApplyInFormPage(requiredLabels) {
  return validateNewProductFormPage(requiredLabels);
}

function markReturnApplyInRecordPending(record, eventTime = "") {
  if (!record) return null;
  record.submitStatus = "待审批";
  record.approveComment = "待审批";
  record.rejectReason = "-";
  record.approver = "待审批";
  record.nextApprover = "客户服务经理";
  record.generateNotice = "待审批通过后生成";
  record.time = eventTime || buildReturnApplyInLogTime();
  return record;
}

function submitReturnApplyInCreateForm() {
  const requiredLabels = ["客户", "原配送单", "商品明细", "退仓原因"];
  if (!validateReturnApplyInFormPage(requiredLabels)) return false;
  const record = saveReturnApplyInCreateDraft();
  const eventTime = buildReturnApplyInLogTime();
  markReturnApplyInRecordPending(record, eventTime);
  appendReturnApplyInApprovalLog(record.orderNo, record.submitter, "提交审批", "已提交退仓申请审批", "-", "客户服务经理", "待审批", eventTime, record.submitter, "待审批");
  renderPcPage("returnapplyin", "list");
  const toastConfig = getToastConfig("submit-returnapplyin-draft", `提交 ${record.orderNo}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function submitReturnApplyInEditForm() {
  const requiredLabels = ["商品明细", "退仓原因"];
  if (!validateReturnApplyInFormPage(requiredLabels)) return false;
  const record = saveReturnApplyInEditDraft();
  const eventTime = buildReturnApplyInLogTime();
  markReturnApplyInRecordPending(record, eventTime);
  appendReturnApplyInApprovalLog(record.orderNo, record.submitter, "重新提交", "已完成草稿修改并重新提交审批", "-", "客户服务经理", "待审批", eventTime, record.submitter, "待审批");
  renderPcPage("returnapplyin", "list");
  const toastConfig = getToastConfig("submit-returnapplyin-draft", `提交 ${record.orderNo}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function applyReturnApplyInDelete() {
  const rowId = document.getElementById("modalPrimaryButton")?.dataset.rowId || "";
  if (!rowId || !returnApplyInPageState.listRecords) return;
  const targetRecord = returnApplyInPageState.listRecords.find((item) => item.rowId === rowId);
  returnApplyInPageState.listRecords = returnApplyInPageState.listRecords.filter((item) => item.rowId !== rowId);
  if (targetRecord) {
    appendReturnApplyInApprovalLog(targetRecord.orderNo, targetRecord.submitter, "删除草稿", "草稿退仓申请单已删除", "-", "-", "已删除", "", targetRecord.submitter, targetRecord.approver || "-");
  }
  renderPcPage("returnapplyin", "list");
}

function getReturnApplyInSelectedRows(status) {
  return Array.from(document.querySelectorAll("[data-returnapplyin-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === status);
}

function getReturnApplyInSelectedOrders(status) {
  const selectedRows = getReturnApplyInSelectedRows(status);
  const seen = new Set();
  return selectedRows
    .map((element) => ({
      rowId: element.dataset.rowId || "",
      orderNo: element.dataset.orderNo || "",
      label: element.dataset.submitLabel || element.dataset.orderNo || "退仓申请单"
    }))
    .filter((item) => {
      if (!item.orderNo || seen.has(item.orderNo)) return false;
      seen.add(item.orderNo);
      return true;
    });
}

function openReturnApplyInSubmitConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "退仓申请提交";
  document.getElementById("modalSub").textContent = "当前支持单张或多张草稿退仓申请单统一提交，提交后状态将更新为待审批。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">提交单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">提交结果</div><div class="value">提交后进入待审批</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写退仓申请单状态，并进入审批环节。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认提交";
  primaryButton.dataset.feedbackType = "submit-returnapplyin-draft";
  primaryButton.dataset.actionLabel = `提交 ${labels.length} 条退仓申请单`;
  modal.classList.add("show");
}

function openReturnApplyInApproveConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "退仓申请审批";
  document.getElementById("modalSub").textContent = "当前支持单张或多张待审批退仓申请单统一审批，可在弹窗中选择审批通过或审批驳回。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">审批单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">审批结果</div><div class="value" id="returnApplyInApproveResult">审批通过</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>
    <div class="modal-box modal-box-full">
      <div class="label">审批动作</div>
      <div class="approve-decision-group">
        <button type="button" class="approve-decision-button active" data-returnapplyin-approve-decision="pass">审批通过</button>
        <button type="button" class="approve-decision-button reject" data-returnapplyin-approve-decision="reject">审批驳回</button>
      </div>
    </div>
    <div class="modal-box modal-box-full"><div class="label">审批意见</div><textarea class="modal-textarea" id="returnApplyInApproveComment" placeholder="请输入审批意见">同意退仓并自动生成退仓通知单。</textarea></div>
    <div class="modal-box modal-box-full" id="returnApplyInRejectReasonField" style="display:none;"><div class="label">驳回原因</div><textarea class="modal-textarea" id="returnApplyInRejectReason" placeholder="请输入驳回原因"></textarea></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，审批通过后将自动生成退仓通知单；审批驳回后将退回草稿。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  const updateMode = (decision) => {
    document.querySelectorAll("[data-returnapplyin-approve-decision]").forEach((button) => {
      button.classList.toggle("active", button.dataset.returnapplyinApproveDecision === decision);
    });
    const resultNode = document.getElementById("returnApplyInApproveResult");
    const rejectField = document.getElementById("returnApplyInRejectReasonField");
    if (resultNode) resultNode.textContent = decision === "reject" ? "审批驳回" : "审批通过";
    if (rejectField) rejectField.style.display = decision === "reject" ? "block" : "none";
    primaryButton.textContent = decision === "reject" ? "确认驳回" : "确认通过";
    primaryButton.dataset.feedbackType = decision === "reject" ? "reject-returnapplyin" : "approve-returnapplyin";
    primaryButton.dataset.actionLabel = `${decision === "reject" ? "驳回" : "审批通过"} ${labels.length} 条退仓申请单`;
    primaryButton.dataset.approvalDecision = decision;
  };
  document.querySelectorAll("[data-returnapplyin-approve-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      updateMode(button.dataset.returnapplyinApproveDecision || "pass");
    });
  });
  updateMode("pass");
  modal.classList.add("show");
}

function applyReturnApplyInApprove({ decision = "pass", approveComment = "", rejectReason = "" } = {}) {
  getReturnApplyInSelectedOrders("待审批").forEach(({ orderNo }) => {
    getReturnApplyInListRecords().forEach((record) => {
      if (record.orderNo !== orderNo) return;
      const eventTime = buildReturnApplyInLogTime();
      if (decision === "reject") {
        record.submitStatus = "草稿";
        record.approveComment = approveComment || "-";
        record.rejectReason = rejectReason || "-";
        record.approver = "审批人";
        record.nextApprover = "提单人";
        record.generateNotice = "待重新提交";
        record.time = eventTime;
        appendReturnApplyInApprovalLog(record.orderNo, "审批人", "审批驳回", approveComment || "-", rejectReason || "-", "提单人", "已驳回", eventTime, record.submitter, "审批人");
        return;
      }
      record.submitStatus = "已审核通过";
      record.approveComment = approveComment || "-";
      record.rejectReason = "-";
      record.approver = "审批人";
      record.nextApprover = "系统自动生成";
      record.generateNotice = "已生成退仓通知单";
      record.time = eventTime;
      appendReturnApplyInApprovalLog(record.orderNo, "审批人", "审批通过", approveComment || "-", "-", "系统自动生成", "已审核通过", eventTime, record.submitter, "审批人");
    });
  });
  renderPcPage("returnapplyin", "list");
}

function saveOwnershipApplyCreateDraft() {
  const formValues = collectNewProductFormValues();
  const eventTime = buildOwnershipApplyLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : getOwnershipApplyModalGoodsRows();
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildOwnershipApplyGoodsRowFromRecord();
  const qty = String(firstRow.qty || 0);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const record = {
    rowId: `oa-row-${Date.now()}`,
    submitStatus: "草稿",
    orderNo: buildOwnershipApplyOrderNo(),
    sourceMode: "手工创建",
    fromOwner: formValues["原货主"] || "外部货主B",
    toOwner: formValues["目标货主"] || "自有货主A",
    warehouse: formValues["仓库"] || "华东1仓",
    submitter: "货主服务A",
    approver: "-",
    goodsCode: firstRow.code || "MAT-OWN-NEW",
    barcode: firstRow.barcode || "6911000099999",
    productName: firstRow.name || "转移商品-待确认",
    spec: firstRow.spec || "12瓶/箱",
    unit: firstRow.unit || "箱",
    batchNo: `BATCH${String(Date.now()).slice(-8)}`,
    produceDate: "2026-05-26",
    expireDate: "2027-05-26",
    availableQty: String(Number(qty) + 140),
    applyQty: qty,
    taxRate: firstRow.tax || "13%",
    priceExTax: firstRow.untaxed || "42.48",
    priceIncTax: firstRow.taxed || "48.00",
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    effectiveTime: formValues["生效时间"] || "2026-05-27 14:00",
    approveComment: "-",
    rejectReason: "-",
    nextApprover: "待提交",
    generateNotice: "待生成",
    time: eventTime,
    reason: formValues["转移原因"] || "外部货主商品转自有货主",
    attachments: formValues["附件资料"] || "转移申请说明/合同依据",
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  };
  getOwnershipApplyListRecords().unshift(record);
  ownershipApplyPageState.selectedEditRow = record;
  ownershipApplyFormState.record = { ...record };
  ownershipApplyFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendOwnershipApplyApprovalLog(record.orderNo, record.submitter, "保存草稿", "已保存物权转移草稿", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function saveOwnershipApplyEditDraft() {
  const currentEdit = getOwnershipApplyEditState();
  const formValues = collectNewProductFormValues();
  const record = getOwnershipApplyListRecords().find((item) => item.rowId === currentEdit.rowId);
  if (!record) return null;
  const eventTime = buildOwnershipApplyLogTime();
  const goodsRows = collectInboundApplyGoodsRows();
  const effectiveGoodsRows = goodsRows.length ? goodsRows : (record.goodsRows?.length ? cloneInboundApplyGoodsRows(record.goodsRows) : [buildOwnershipApplyGoodsRowFromRecord(record)]);
  const goodsSummary = formValues["商品明细"] || buildReturnApplyInGoodsSummary(effectiveGoodsRows);
  const firstRow = effectiveGoodsRows[0] || buildOwnershipApplyGoodsRowFromRecord(record);
  const amountExTax = (Number(firstRow.untaxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  const amountIncTax = (Number(firstRow.taxed || 0) * Number(firstRow.qty || 0)).toFixed(2);
  Object.assign(record, {
    submitStatus: "草稿",
    approveComment: "-",
    rejectReason: "-",
    approver: "-",
    nextApprover: "待提交",
    time: eventTime,
    fromOwner: formValues["原货主"] || record.fromOwner,
    toOwner: formValues["目标货主"] || record.toOwner,
    warehouse: formValues["仓库"] || record.warehouse,
    goodsCode: firstRow.code || record.goodsCode,
    barcode: firstRow.barcode || record.barcode,
    productName: firstRow.name || record.productName,
    spec: firstRow.spec || record.spec,
    unit: firstRow.unit || record.unit,
    applyQty: String(firstRow.qty || record.applyQty || 0),
    taxRate: firstRow.tax || record.taxRate,
    priceExTax: firstRow.untaxed || record.priceExTax,
    priceIncTax: firstRow.taxed || record.priceIncTax,
    amountExTax,
    amountIncTax,
    taxAmount: (Number(amountIncTax) - Number(amountExTax)).toFixed(2),
    effectiveTime: formValues["生效时间"] || record.effectiveTime,
    reason: formValues["转移原因"] || record.reason,
    attachments: formValues["附件资料"] || record.attachments,
    goodsSummary,
    goodsRows: cloneInboundApplyGoodsRows(effectiveGoodsRows)
  });
  ownershipApplyPageState.selectedEditRow = record;
  ownershipApplyFormState.record = { ...record };
  ownershipApplyFormState.goodsRows = cloneInboundApplyGoodsRows(effectiveGoodsRows);
  appendOwnershipApplyApprovalLog(record.orderNo, record.submitter, "保存草稿", "草稿修改已保存", "-", "待提交", "草稿", eventTime, record.submitter, "-");
  return record;
}

function validateOwnershipApplyFormPage(requiredLabels) {
  return validateNewProductFormPage(requiredLabels);
}

function markOwnershipApplyRecordPending(record, eventTime = "") {
  if (!record) return null;
  record.submitStatus = "待审批";
  record.approveComment = "待审批";
  record.rejectReason = "-";
  record.approver = "待审批";
  record.nextApprover = "货主管理经理";
  record.generateNotice = "待审批通过后生成";
  record.time = eventTime || buildOwnershipApplyLogTime();
  return record;
}

function submitOwnershipApplyCreateForm() {
  const requiredLabels = ["原货主", "目标货主", "仓库", "商品明细", "转移原因"];
  if (!validateOwnershipApplyFormPage(requiredLabels)) return false;
  const record = saveOwnershipApplyCreateDraft();
  const eventTime = buildOwnershipApplyLogTime();
  markOwnershipApplyRecordPending(record, eventTime);
  appendOwnershipApplyApprovalLog(record.orderNo, record.submitter, "提交审批", "已提交物权转移申请审批", "-", "货主管理经理", "待审批", eventTime, record.submitter, "待审批");
  renderPcPage("ownershipapply", "list");
  const toastConfig = getToastConfig("submit-ownershipapply-draft", `提交 ${record.orderNo}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function submitOwnershipApplyEditForm() {
  const requiredLabels = ["商品明细", "转移原因"];
  if (!validateOwnershipApplyFormPage(requiredLabels)) return false;
  const record = saveOwnershipApplyEditDraft();
  const eventTime = buildOwnershipApplyLogTime();
  markOwnershipApplyRecordPending(record, eventTime);
  appendOwnershipApplyApprovalLog(record.orderNo, record.submitter, "重新提交", "已完成草稿修改并重新提交审批", "-", "货主管理经理", "待审批", eventTime, record.submitter, "待审批");
  renderPcPage("ownershipapply", "list");
  const toastConfig = getToastConfig("submit-ownershipapply-draft", `提交 ${record.orderNo}`);
  showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
  return true;
}

function applyOwnershipApplyDelete() {
  const rowId = document.getElementById("modalPrimaryButton")?.dataset.rowId || "";
  if (!rowId || !ownershipApplyPageState.listRecords) return;
  const targetRecord = ownershipApplyPageState.listRecords.find((item) => item.rowId === rowId);
  ownershipApplyPageState.listRecords = ownershipApplyPageState.listRecords.filter((item) => item.rowId !== rowId);
  if (targetRecord) {
    appendOwnershipApplyApprovalLog(targetRecord.orderNo, targetRecord.submitter, "删除草稿", "草稿物权转移申请单已删除", "-", "-", "已删除", "", targetRecord.submitter, targetRecord.approver || "-");
  }
  renderPcPage("ownershipapply", "list");
}

function getOwnershipApplySelectedRows(status) {
  return Array.from(document.querySelectorAll("[data-ownershipapply-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === status);
}

function getOwnershipApplySelectedOrders(status) {
  const selectedRows = getOwnershipApplySelectedRows(status);
  const seen = new Set();
  return selectedRows
    .map((element) => ({
      rowId: element.dataset.rowId || "",
      orderNo: element.dataset.orderNo || "",
      label: element.dataset.submitLabel || element.dataset.orderNo || "物权转移申请单"
    }))
    .filter((item) => {
      if (!item.orderNo || seen.has(item.orderNo)) return false;
      seen.add(item.orderNo);
      return true;
    });
}

function openOwnershipApplySubmitConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "物权转移申请提交";
  document.getElementById("modalSub").textContent = "当前支持单张或多张草稿物权转移申请单统一提交，提交后状态将更新为待审批。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">提交单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">提交结果</div><div class="value">提交后进入待审批</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写物权转移申请单状态，并进入审批环节。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认提交";
  primaryButton.dataset.feedbackType = "submit-ownershipapply-draft";
  primaryButton.dataset.actionLabel = `提交 ${labels.length} 条物权转移申请单`;
  modal.classList.add("show");
}

function openOwnershipApplyApproveConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "物权转移申请审批";
  document.getElementById("modalSub").textContent = "当前支持单张或多张待审批物权转移申请单统一审批，可在弹窗中选择审批通过或审批驳回。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">审批单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">审批结果</div><div class="value" id="ownershipApplyApproveResult">审批通过</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>
    <div class="modal-box modal-box-full">
      <div class="label">审批动作</div>
      <div class="approve-decision-group">
        <button type="button" class="approve-decision-button active" data-ownershipapply-approve-decision="pass">审批通过</button>
        <button type="button" class="approve-decision-button reject" data-ownershipapply-approve-decision="reject">审批驳回</button>
      </div>
    </div>
    <div class="modal-box modal-box-full"><div class="label">审批意见</div><textarea class="modal-textarea" id="ownershipApplyApproveComment" placeholder="请输入审批意见">同意转移并自动生成物权转移通知单。</textarea></div>
    <div class="modal-box modal-box-full" id="ownershipApplyRejectReasonField" style="display:none;"><div class="label">驳回原因</div><textarea class="modal-textarea" id="ownershipApplyRejectReason" placeholder="请输入驳回原因"></textarea></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，审批通过后将自动生成物权转移通知单；审批驳回后将退回草稿。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  const updateMode = (decision) => {
    document.querySelectorAll("[data-ownershipapply-approve-decision]").forEach((button) => {
      button.classList.toggle("active", button.dataset.ownershipapplyApproveDecision === decision);
    });
    const resultNode = document.getElementById("ownershipApplyApproveResult");
    const rejectField = document.getElementById("ownershipApplyRejectReasonField");
    if (resultNode) resultNode.textContent = decision === "reject" ? "审批驳回" : "审批通过";
    if (rejectField) rejectField.style.display = decision === "reject" ? "block" : "none";
    primaryButton.textContent = decision === "reject" ? "确认驳回" : "确认通过";
    primaryButton.dataset.feedbackType = decision === "reject" ? "reject-ownershipapply" : "approve-ownershipapply";
    primaryButton.dataset.actionLabel = `${decision === "reject" ? "驳回" : "审批通过"} ${labels.length} 条物权转移申请单`;
    primaryButton.dataset.approvalDecision = decision;
  };
  document.querySelectorAll("[data-ownershipapply-approve-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      updateMode(button.dataset.ownershipapplyApproveDecision || "pass");
    });
  });
  updateMode("pass");
  modal.classList.add("show");
}

function applyOwnershipApplyApprove({ decision = "pass", approveComment = "", rejectReason = "" } = {}) {
  getOwnershipApplySelectedOrders("待审批").forEach(({ orderNo }) => {
    getOwnershipApplyListRecords().forEach((record) => {
      if (record.orderNo !== orderNo) return;
      const eventTime = buildOwnershipApplyLogTime();
      if (decision === "reject") {
        record.submitStatus = "草稿";
        record.approveComment = approveComment || "-";
        record.rejectReason = rejectReason || "-";
        record.approver = "审批人";
        record.nextApprover = "提单人";
        record.generateNotice = "待重新提交";
        record.time = eventTime;
        appendOwnershipApplyApprovalLog(record.orderNo, "审批人", "审批驳回", approveComment || "-", rejectReason || "-", "提单人", "已驳回", eventTime, record.submitter, "审批人");
        return;
      }
      record.submitStatus = "已审核通过";
      record.approveComment = approveComment || "-";
      record.rejectReason = "-";
      record.approver = "审批人";
      record.nextApprover = "系统自动生成";
      record.generateNotice = "已生成物权转移通知单";
      record.time = eventTime;
      appendOwnershipApplyApprovalLog(record.orderNo, "审批人", "审批通过", approveComment || "-", "-", "系统自动生成", "已审核通过", eventTime, record.submitter, "审批人");
    });
  });
  renderPcPage("ownershipapply", "list");
}

function refreshNewProductEditButtons() {
  document.querySelectorAll("[data-newproduct-edit-entry]").forEach((button) => {
    button.title = "点击进入修改页面";
  });
  document.querySelectorAll("[data-newproduct-delete-entry]").forEach((button) => {
    button.title = "点击删除当前草稿记录";
  });
}

function openNewProductRowDetail(button) {
  const row = button.closest("tr");
  if (!row) return;
  const table = row.closest("table");
  const headers = Array.from(table?.querySelectorAll("thead th") || [])
    .slice(2)
    .map((th) => th.textContent.trim());
  const rowValues = Array.from(row.querySelectorAll("td"))
    .slice(2)
    .map((td) => td.textContent.replace(/\s+/g, " ").trim());
  const rowIndex = Array.from(row.parentElement?.children || []).indexOf(row);
  openDrawer("新品录入单详情", headers, rowValues, rowIndex >= 0 ? rowIndex : 0);
}

function getNewProductRowData(row) {
  const cells = Array.from(row?.querySelectorAll("td") || []);
  if (cells.length < 24) return null;

  return {
    rowId: row?.querySelector("[data-newproduct-submit-row]")?.dataset.rowId || "",
    orderNo: cells[2]?.textContent.trim() || "",
    owner: cells[3]?.textContent.trim() || "",
    submitter: cells[4]?.textContent.trim() || "",
    approver: cells[5]?.textContent.trim() || "",
    time: cells[6]?.textContent.trim() || "",
    productCode: cells[7]?.textContent.trim() || "",
    barcode: cells[8]?.textContent.trim() || "",
    productName: cells[9]?.textContent.trim() || "",
    spec: cells[10]?.textContent.trim() || "",
    unit: cells[11]?.textContent.trim() || "",
    category: cells[12]?.textContent.trim() || "",
    brand: cells[13]?.textContent.trim() || "",
    model: cells[14]?.textContent.trim() || "",
    temperature: cells[15]?.textContent.trim() || "",
    packQty: cells[16]?.textContent.trim() || "",
    recordStatus: cells[17]?.textContent.replace(/\s+/g, " ").trim() || "",
    approveStatus: cells[18]?.textContent.replace(/\s+/g, " ").trim() || "",
    approveComment: cells[19]?.textContent.trim() || "-",
    rejectReason: cells[20]?.textContent.trim() || "-",
    nextApprover: cells[21]?.textContent.trim() || "-",
    writeBackStatus: cells[22]?.textContent.trim() || "",
    attachments: cells[23]?.textContent.trim() || ""
  };
}

function applyNewProductApprove({ decision = "pass", approveComment = "", rejectReason = "", nextApprover = "" } = {}) {
  const selectedRows = Array.from(document.querySelectorAll("[data-newproduct-submit-row]"))
    .filter((element) => !element.disabled && element.checked && element.dataset.submitStatus === "待审批");

  selectedRows.forEach((checkbox) => {
    const record = getNewProductListRecords().find((item) => item.rowId === checkbox.dataset.rowId);
    const eventTime = buildNewProductLogTime();

    if (decision === "reject") {
      if (record) {
        record.submitStatus = "草稿";
        record.recordStatus = "已驳回";
        record.approveStatus = "审批驳回";
        record.approveComment = approveComment || "-";
        record.rejectReason = rejectReason || "-";
        record.approver = "审批人";
        record.nextApprover = nextApprover || "提单人";
        record.writeBackStatus = "未写入";
        record.time = eventTime;
        appendNewProductApprovalLog(record.orderNo, "审批人", "审批驳回", approveComment || "-", rejectReason || "-", nextApprover || "提单人", "已驳回", eventTime, record.submitter || normalizeNewProductOwner(record.owner), "审批人");
      }
      return;
    }

    if (record) {
      record.submitStatus = "已审核通过";
      record.recordStatus = "已录入";
      record.approveStatus = "已审核通过";
      record.approveComment = approveComment || "-";
      record.rejectReason = "-";
      record.approver = "审批人";
      record.nextApprover = nextApprover || "系统自动写入";
      record.writeBackStatus = "已写入";
      record.time = eventTime;
      appendNewProductApprovalLog(record.orderNo, "审批人", "审批通过", approveComment || "-", "-", nextApprover || "系统自动写入", "已审核通过", eventTime, record.submitter || normalizeNewProductOwner(record.owner), "审批人");
    }
  });

  renderPcPage("newproduct", "list");
}

function bindDrawerEvents() {
  document.querySelectorAll("[data-demand-detail]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      openDemandDetail(element.dataset.demandDetail || "");
    });
  });

  document.querySelectorAll("[data-drawer='detail']").forEach((element) => {
    element.addEventListener("click", (e) => {
      if (e.target.closest(".expand-icon")) return;
      const row = JSON.parse(decodeURIComponent(element.dataset.drawerRow));
      const headers = JSON.parse(decodeURIComponent(element.dataset.drawerHeaders));
      const rowIndex = Number(element.dataset.drawerIndex || "0");
      openDrawer(element.dataset.drawerTitle || "详情", headers, row, rowIndex);
    });
  });

  document.querySelectorAll("[data-close-drawer]").forEach((element) => {
    element.addEventListener("click", () => {
      const drawer = document.getElementById(element.dataset.closeDrawer);
      if (drawer) {
        drawer.classList.remove("show");
      }
    });
  });

  const drawer = document.getElementById("globalDrawer");
  if (drawer) {
    drawer.addEventListener("click", (event) => {
      if (event.target === drawer) {
        drawer.classList.remove("show");
      }
    });
  }

  const primaryButton = document.getElementById("drawerPrimaryButton");
  if (primaryButton) {
    primaryButton.addEventListener("click", () => {
      const drawerNode = document.getElementById("globalDrawer");
      if (drawerNode) {
        drawerNode.classList.remove("show");
      }

      if (primaryButton.dataset.drawerActionType === "modal") {
        openModal(primaryButton.dataset.drawerModalType || "view", primaryButton.dataset.actionLabel || "查看完整详情");
        return;
      }

      const toastConfig = getToastConfig(primaryButton.dataset.drawerModalType || primaryButton.dataset.drawerActionType || "view", primaryButton.dataset.actionLabel || "");
      showToast(toastConfig.type, toastConfig.title, toastConfig.desc);
    });
  }
}

function bindNewProductRowActionEvents() {
  document.querySelectorAll("[data-product-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const action = element.dataset.productAction || "edit";
      const mode = element.dataset.productMode || "create";
      const rowElement = element.closest("tr");
      if (!rowElement) return;

      const table = rowElement.closest("table");
      const headers = Array.from(table?.querySelectorAll("thead th") || []).map((th) => th.textContent.trim());
      const row = Array.from(rowElement.querySelectorAll("td")).map((td, index) => {
        if (index === headers.length - 1) {
          return action === "edit" ? "点击编辑查看当前行详情" : td.textContent.replace(/\s+/g, " ").trim();
        }
        return td.textContent.replace(/\s+/g, " ").trim();
      });
      const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
      const productName = row[4] || `第 ${rowIndex + 1} 行`;

      if (action === "edit") {
        openProductRowEditor(mode, headers, row, rowIndex);
        return;
      }

      if (action === "copy") {
        showToast("success", `已复制 ${productName}`, `已按当前行内容复制一条${mode === "create" ? "录入" : "修改"}记录，可继续调整后保存。`);
        return;
      }

      openDeleteConfirm(productName, mode);
    });
  });
}

function bindInboundRowActionEvents() {
  document.querySelectorAll("[data-inbound-view-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowElement = element.closest("tr");
      openInboundRowDrawer(rowElement);
    });
  });

  document.querySelectorAll("[data-inbound-edit-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openModal("form", "编辑申请");
    });
  });

  document.querySelectorAll("[data-inbound-delete-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openInboundDeleteConfirm(element.dataset.orderNo || "");
    });
  });
}

function openReturnApplySubmitConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "退货申请提交";
  document.getElementById("modalSub").textContent = "当前支持单张或多张草稿退货申请单统一提交，提交后状态将更新为待审批。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">提交单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">提交结果</div><div class="value">提交后进入待审批</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写退货申请单状态，并进入审批环节。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认提交";
  primaryButton.dataset.feedbackType = "submit-returnapply-draft";
  primaryButton.dataset.actionLabel = `提交 ${labels.length} 条退货申请单`;
  modal.classList.add("show");
}

function openReturnApplyApproveConfirm(labels) {
  const modal = document.getElementById("globalModal");
  if (!modal) return;
  document.getElementById("modalTitle").textContent = "退货申请审批";
  document.getElementById("modalSub").textContent = "当前支持单张或多张待审批退货申请单统一审批，可在弹窗中选择审批通过或审批驳回。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box"><div class="label">审批单据数</div><div class="value">${labels.length} 条</div></div>
    <div class="modal-box"><div class="label">审批结果</div><div class="value" id="returnApplyApproveResult">审批通过</div></div>
    <div class="modal-box modal-box-full"><div class="label">选中单据</div><div class="value">${labels.join("；")}</div></div>
    <div class="modal-box modal-box-full">
      <div class="label">审批动作</div>
      <div class="approve-decision-group">
        <button type="button" class="approve-decision-button active" data-returnapply-approve-decision="pass">审批通过</button>
        <button type="button" class="approve-decision-button reject" data-returnapply-approve-decision="reject">审批驳回</button>
      </div>
    </div>
    <div class="modal-box modal-box-full"><div class="label">审批意见</div><textarea class="modal-textarea" id="returnApplyApproveComment" placeholder="请输入审批意见">同意退货并自动生成退货通知单。</textarea></div>
    <div class="modal-box modal-box-full" id="returnApplyRejectReasonField" style="display:none;"><div class="label">驳回原因</div><textarea class="modal-textarea" id="returnApplyRejectReason" placeholder="请输入驳回原因"></textarea></div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，审批通过后将自动生成退货通知单；审批驳回后将退回草稿。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  const updateMode = (decision) => {
    document.querySelectorAll("[data-returnapply-approve-decision]").forEach((button) => {
      button.classList.toggle("active", button.dataset.returnapplyApproveDecision === decision);
    });
    const resultNode = document.getElementById("returnApplyApproveResult");
    const rejectField = document.getElementById("returnApplyRejectReasonField");
    if (resultNode) resultNode.textContent = decision === "reject" ? "审批驳回" : "审批通过";
    if (rejectField) rejectField.style.display = decision === "reject" ? "block" : "none";
    primaryButton.textContent = decision === "reject" ? "确认驳回" : "确认通过";
    primaryButton.dataset.feedbackType = decision === "reject" ? "reject-returnapply" : "approve-returnapply";
    primaryButton.dataset.actionLabel = `${decision === "reject" ? "驳回" : "审批通过"} ${labels.length} 条退货申请单`;
    primaryButton.dataset.approvalDecision = decision;
  };
  document.querySelectorAll("[data-returnapply-approve-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      updateMode(button.dataset.returnapplyApproveDecision || "pass");
    });
  });
  updateMode("pass");
  modal.classList.add("show");
}

function bindReturnApplyRowActionEvents() {
  document.querySelectorAll("[data-returnapply-view-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowElement = element.closest("tr");
      if (!rowElement) return;
      const table = rowElement.closest("table");
      const headers = Array.from(table?.querySelectorAll("thead th") || []).slice(2).map((th) => th.textContent.trim());
      const row = Array.from(rowElement.querySelectorAll("td") || []).slice(2).map((td) => td.textContent.replace(/\s+/g, " ").trim());
      const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
      openDrawer("退货申请单列表结果", headers, row, rowIndex);
    });
  });

  document.querySelectorAll("[data-returnapply-edit-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const orderNo = button.dataset.orderNo || button.closest("tr")?.querySelector("[data-returnapply-submit-row]")?.dataset.orderNo || "";
      const stateRecord = getReturnApplyListRecords().find((item) => item.orderNo === orderNo);
      if (!stateRecord) return;
      returnApplyPageState.selectedEditRow = stateRecord;
      prepareReturnApplyFormState("edit", stateRecord);
      openModal("form", "编辑退货申请");
    });
  });

  document.querySelectorAll("[data-returnapply-delete-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const orderNo = button.dataset.orderNo || button.closest("tr")?.querySelector("[data-returnapply-submit-row]")?.dataset.orderNo || "";
      const targetRecord = getReturnApplyListRecords().find((item) => item.orderNo === orderNo);
      const modal = document.getElementById("globalModal");
      if (!modal || !targetRecord) return;
      document.getElementById("modalTitle").textContent = "删除退货申请单";
      document.getElementById("modalSub").textContent = "当前操作仅允许删除草稿状态的退货申请单，确认后将删除当前草稿记录。";
      document.getElementById("modalFields").innerHTML = `
        <div class="modal-box"><div class="label">申请单号</div><div class="value">${targetRecord.orderNo}</div></div>
        <div class="modal-box"><div class="label">当前状态</div><div class="value">${targetRecord.submitStatus}</div></div>
        <div class="modal-box"><div class="label">删除影响</div><div class="value">删除后需重新创建退货申请单。</div></div>`;
      document.getElementById("modalNote").textContent = "当前为原型演示，确认后将删除当前草稿退货申请单。";
      const primaryButton = document.getElementById("modalPrimaryButton");
      primaryButton.textContent = "确认删除";
      primaryButton.dataset.feedbackType = "delete-returnapply-draft";
      primaryButton.dataset.actionLabel = targetRecord.orderNo;
      primaryButton.dataset.rowId = targetRecord.orderNo;
      modal.classList.add("show");
    });
  });
}

function bindReturnApplySubmitApproveEvents() {
  const selectAll = document.getElementById("returnApplySelectAllDraft");
  const selectDraftButton = document.getElementById("returnApplySelectDraftButton");
  const selectPendingButton = document.getElementById("returnApplySelectPendingButton");
  const createButton = document.getElementById("returnApplyCreateButton");
  const pageCreateButton = document.getElementById("returnApplyPageCreateButton");
  const submitButton = document.getElementById("returnApplySubmitButton");
  const approveButton = document.getElementById("returnApplyApproveButton");
  const getDraftRows = () => Array.from(document.querySelectorAll("[data-returnapply-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "草稿");
  const getPendingRows = () => Array.from(document.querySelectorAll("[data-returnapply-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "待审批");

  const openCreateModal = () => {
    returnApplyPageState.selectedEditRow = null;
    prepareReturnApplyFormState("create");
    openModal("form", "新增退货申请");
  };

  if (createButton) createButton.addEventListener("click", openCreateModal);
  if (pageCreateButton) pageCreateButton.addEventListener("click", openCreateModal);

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      getDraftRows().forEach((element) => {
        element.checked = selectAll.checked;
      });
    });
  }
  if (selectDraftButton) {
    selectDraftButton.addEventListener("click", () => {
      getDraftRows().forEach((element) => { element.checked = true; });
      if (selectAll) selectAll.checked = true;
      showToast("success", "已选中草稿记录", "当前页所有草稿退货申请单已勾选，可直接点击提交按钮。");
    });
  }
  if (selectPendingButton) {
    selectPendingButton.addEventListener("click", () => {
      getPendingRows().forEach((element) => { element.checked = true; });
      if (selectAll) selectAll.checked = false;
      showToast("success", "已选中待审批记录", "当前页所有待审批退货申请单已勾选，可点击审批按钮后选择通过或驳回。");
    });
  }
  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const selectedOrders = getReturnApplySelectedOrders("草稿");
      if (!selectedOrders.length) {
        showToast("error", "未选择草稿记录", "请先勾选一条或多条草稿退货申请单，再点击提交按钮。");
        return;
      }
      openReturnApplySubmitConfirm(selectedOrders.map((item) => item.label));
    });
  }
  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const selectedOrders = getReturnApplySelectedOrders("待审批");
      if (!selectedOrders.length) {
        showToast("error", "未选择待审批记录", "请先勾选一条或多条待审批退货申请单，再点击审批按钮。");
        return;
      }
      openReturnApplyApproveConfirm(selectedOrders.map((item) => item.label));
    });
  }
}

function bindReturnApplyInRowActionEvents() {
  document.querySelectorAll("[data-returnapplyin-view-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowElement = element.closest("tr");
      if (!rowElement) return;
      const table = rowElement.closest("table");
      const headers = Array.from(table?.querySelectorAll("thead th") || []).slice(2).map((th) => th.textContent.trim());
      const row = Array.from(rowElement.querySelectorAll("td") || []).slice(2).map((td) => td.textContent.replace(/\s+/g, " ").trim());
      const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
      openDrawer("退仓申请单列表结果", headers, row, rowIndex);
    });
  });

  document.querySelectorAll("[data-returnapplyin-edit-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowId = button.dataset.rowId || button.closest("tr")?.querySelector("[data-returnapplyin-submit-row]")?.dataset.rowId || "";
      const stateRecord = getReturnApplyInListRecords().find((item) => item.rowId === rowId);
      if (!stateRecord) return;
      returnApplyInPageState.selectedEditRow = stateRecord;
      prepareReturnApplyInFormState("edit", stateRecord);
      openModal("form", "编辑退仓申请");
    });
  });

  document.querySelectorAll("[data-returnapplyin-delete-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowId = button.dataset.rowId || button.closest("tr")?.querySelector("[data-returnapplyin-submit-row]")?.dataset.rowId || "";
      const targetRecord = getReturnApplyInListRecords().find((item) => item.rowId === rowId);
      const modal = document.getElementById("globalModal");
      if (!modal || !targetRecord) return;
      document.getElementById("modalTitle").textContent = "删除退仓申请单";
      document.getElementById("modalSub").textContent = "当前操作仅允许删除草稿状态的退仓申请单，确认后将删除当前草稿记录。";
      document.getElementById("modalFields").innerHTML = `
        <div class="modal-box"><div class="label">申请单号</div><div class="value">${targetRecord.orderNo}</div></div>
        <div class="modal-box"><div class="label">当前状态</div><div class="value">${targetRecord.submitStatus}</div></div>
        <div class="modal-box"><div class="label">删除影响</div><div class="value">删除后需重新创建退仓申请单。</div></div>`;
      document.getElementById("modalNote").textContent = "当前为原型演示，确认后将删除当前草稿退仓申请单。";
      const primaryButton = document.getElementById("modalPrimaryButton");
      primaryButton.textContent = "确认删除";
      primaryButton.dataset.feedbackType = "delete-returnapplyin-draft";
      primaryButton.dataset.actionLabel = targetRecord.orderNo;
      primaryButton.dataset.rowId = targetRecord.rowId;
      modal.classList.add("show");
    });
  });
}

function bindReturnApplyInSubmitApproveEvents() {
  const selectAll = document.getElementById("returnApplyInSelectAllDraft");
  const selectDraftButton = document.getElementById("returnApplyInSelectDraftButton");
  const selectPendingButton = document.getElementById("returnApplyInSelectPendingButton");
  const createButton = document.getElementById("returnApplyInCreateButton");
  const pageCreateButton = document.getElementById("returnApplyInPageCreateButton");
  const submitButton = document.getElementById("returnApplyInSubmitButton");
  const approveButton = document.getElementById("returnApplyInApproveButton");
  const getDraftRows = () => Array.from(document.querySelectorAll("[data-returnapplyin-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "草稿");
  const getPendingRows = () => Array.from(document.querySelectorAll("[data-returnapplyin-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "待审批");

  const openCreateModal = () => {
      returnApplyInPageState.selectedEditRow = null;
      prepareReturnApplyInFormState("create");
      openModal("form", "新增退仓申请");
  };

  if (createButton) {
    createButton.addEventListener("click", openCreateModal);
  }

  if (pageCreateButton) {
    pageCreateButton.addEventListener("click", openCreateModal);
  }

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      getDraftRows().forEach((element) => {
        element.checked = selectAll.checked;
      });
    });
  }

  if (selectDraftButton) {
    selectDraftButton.addEventListener("click", () => {
      getDraftRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = true;
      showToast("success", "已选中草稿记录", "当前页所有草稿退仓申请单已勾选，可直接点击提交按钮。");
    });
  }

  if (selectPendingButton) {
    selectPendingButton.addEventListener("click", () => {
      getPendingRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = false;
      showToast("success", "已选中待审批记录", "当前页所有待审批退仓申请单已勾选，可点击审批按钮后选择通过或驳回。");
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const selectedOrders = getReturnApplyInSelectedOrders("草稿");
      if (!selectedOrders.length) {
        showToast("error", "未选择草稿记录", "请先勾选一条或多条草稿退仓申请单，再点击提交按钮。");
        return;
      }
      openReturnApplyInSubmitConfirm(selectedOrders.map((item) => item.label));
    });
  }

  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const selectedOrders = getReturnApplyInSelectedOrders("待审批");
      if (!selectedOrders.length) {
        showToast("error", "未选择待审批记录", "请先勾选一条或多条待审批退仓申请单，再点击审批按钮。");
        return;
      }
      openReturnApplyInApproveConfirm(selectedOrders.map((item) => item.label));
    });
  }
}

function bindStoreOrderCycleRowActionEvents() {
  document.querySelectorAll("[data-soc-view]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowElement = element.closest("tr");
      if (!rowElement) return;
      const table = rowElement.closest("table");
      const headers = Array.from(table?.querySelectorAll("thead th") || []).slice(1).map((th) => th.textContent.trim());
      const row = Array.from(rowElement.querySelectorAll("td") || []).slice(1).map((td) => td.textContent.replace(/\s+/g, " ").trim());
      const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
      openDrawer("门店要货周期规则详情", headers, row, rowIndex);
    });
  });

  document.querySelectorAll("[data-soc-edit]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const code = button.dataset.code;
      const stateRecord = getStoreOrderCycleListRecords().find((item) => item.ruleCode === code);
      if (!stateRecord) return;
      storeOrderCyclePageState.selectedEditRow = stateRecord;
      openModal("form", "编辑要货周期规则");
    });
  });

  document.querySelectorAll("[data-soc-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const code = button.dataset.code;
      const targetRecord = getStoreOrderCycleListRecords().find((item) => item.ruleCode === code);
      const modal = document.getElementById("globalModal");
      if (!modal || !targetRecord) return;
      document.getElementById("modalTitle").textContent = "删除要货周期规则";
      document.getElementById("modalSub").textContent = "确认后将删除该门店的要货周期规则，删除后该门店将不受要货周期约束。";
      document.getElementById("modalFields").innerHTML = `
        <div class="modal-box"><div class="label">规则编码</div><div class="value">${targetRecord.ruleCode}</div></div>
        <div class="modal-box"><div class="label">门店名称</div><div class="value">${targetRecord.storeName}</div></div>
        <div class="modal-box"><div class="label">周期类型</div><div class="value">${targetRecord.cycleType} — ${targetRecord.orderDays}</div></div>`;
      document.getElementById("modalNote").textContent = "当前为原型演示，确认后将展示删除成功反馈。";
      const primaryButton = document.getElementById("modalPrimaryButton");
      primaryButton.textContent = "确认删除";
      primaryButton.dataset.feedbackType = "delete-storeordercycle";
      primaryButton.dataset.actionLabel = targetRecord.ruleCode;
      primaryButton.dataset.rowId = targetRecord.ruleCode;
      modal.classList.add("show");
    });
  });
}

function bindStoreOrderCycleCreateButton() {
  const createButton = document.getElementById("storeOrderCycleCreateButton");
  if (createButton) {
    createButton.addEventListener("click", () => {
      storeOrderCyclePageState.selectedEditRow = null;
      openModal("form", "新增要货周期规则");
    });
  }
}

function bindOwnershipApplyRowActionEvents() {
  document.querySelectorAll("[data-ownershipapply-view-entry]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowElement = element.closest("tr");
      if (!rowElement) return;
      const table = rowElement.closest("table");
      const headers = Array.from(table?.querySelectorAll("thead th") || []).slice(2).map((th) => th.textContent.trim());
      const row = Array.from(rowElement.querySelectorAll("td") || []).slice(2).map((td) => td.textContent.replace(/\s+/g, " ").trim());
      const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
      openDrawer("物权转移申请单列表结果", headers, row, rowIndex);
    });
  });

  document.querySelectorAll("[data-ownershipapply-edit-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowId = button.dataset.rowId || button.closest("tr")?.querySelector("[data-ownershipapply-submit-row]")?.dataset.rowId || "";
      const stateRecord = getOwnershipApplyListRecords().find((item) => item.rowId === rowId);
      if (!stateRecord) return;
      ownershipApplyPageState.selectedEditRow = stateRecord;
      prepareOwnershipApplyFormState("edit", stateRecord);
      openModal("form", "编辑物权转移申请");
    });
  });

  document.querySelectorAll("[data-ownershipapply-delete-entry]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rowId = button.dataset.rowId || button.closest("tr")?.querySelector("[data-ownershipapply-submit-row]")?.dataset.rowId || "";
      const targetRecord = getOwnershipApplyListRecords().find((item) => item.rowId === rowId);
      const modal = document.getElementById("globalModal");
      if (!modal || !targetRecord) return;
      document.getElementById("modalTitle").textContent = "删除物权转移申请单";
      document.getElementById("modalSub").textContent = "当前操作仅允许删除草稿状态的物权转移申请单，确认后将删除当前草稿记录。";
      document.getElementById("modalFields").innerHTML = `
        <div class="modal-box"><div class="label">申请单号</div><div class="value">${targetRecord.orderNo}</div></div>
        <div class="modal-box"><div class="label">当前状态</div><div class="value">${targetRecord.submitStatus}</div></div>
        <div class="modal-box"><div class="label">删除影响</div><div class="value">删除后需重新创建物权转移申请单。</div></div>`;
      document.getElementById("modalNote").textContent = "当前为原型演示，确认后将删除当前草稿物权转移申请单。";
      const primaryButton = document.getElementById("modalPrimaryButton");
      primaryButton.textContent = "确认删除";
      primaryButton.dataset.feedbackType = "delete-ownershipapply-draft";
      primaryButton.dataset.actionLabel = targetRecord.orderNo;
      primaryButton.dataset.rowId = targetRecord.rowId;
      modal.classList.add("show");
    });
  });
}

function bindOwnershipApplySubmitApproveEvents() {
  const selectAll = document.getElementById("ownershipApplySelectAllDraft");
  const selectDraftButton = document.getElementById("ownershipApplySelectDraftButton");
  const selectPendingButton = document.getElementById("ownershipApplySelectPendingButton");
  const createButton = document.getElementById("ownershipApplyCreateButton");
  const pageCreateButton = document.getElementById("ownershipApplyPageCreateButton");
  const submitButton = document.getElementById("ownershipApplySubmitButton");
  const approveButton = document.getElementById("ownershipApplyApproveButton");
  const getDraftRows = () => Array.from(document.querySelectorAll("[data-ownershipapply-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "草稿");
  const getPendingRows = () => Array.from(document.querySelectorAll("[data-ownershipapply-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "待审批");

  const openCreateModal = () => {
      ownershipApplyPageState.selectedEditRow = null;
      prepareOwnershipApplyFormState("create");
      openModal("form", "新增物权转移申请");
  };

  if (createButton) {
    createButton.addEventListener("click", openCreateModal);
  }

  if (pageCreateButton) {
    pageCreateButton.addEventListener("click", openCreateModal);
  }

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      getDraftRows().forEach((element) => {
        element.checked = selectAll.checked;
      });
    });
  }

  if (selectDraftButton) {
    selectDraftButton.addEventListener("click", () => {
      getDraftRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = true;
      showToast("success", "已选中草稿记录", "当前页所有草稿物权转移申请单已勾选，可直接点击提交按钮。");
    });
  }

  if (selectPendingButton) {
    selectPendingButton.addEventListener("click", () => {
      getPendingRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = false;
      showToast("success", "已选中待审批记录", "当前页所有待审批物权转移申请单已勾选，可点击审批按钮后选择通过或驳回。");
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const selectedOrders = getOwnershipApplySelectedOrders("草稿");
      if (!selectedOrders.length) {
        showToast("error", "未选择草稿记录", "请先勾选一条或多条草稿物权转移申请单，再点击提交按钮。");
        return;
      }
      openOwnershipApplySubmitConfirm(selectedOrders.map((item) => item.label));
    });
  }

  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const selectedOrders = getOwnershipApplySelectedOrders("待审批");
      if (!selectedOrders.length) {
        showToast("error", "未选择待审批记录", "请先勾选一条或多条待审批物权转移申请单，再点击审批按钮。");
        return;
      }
      openOwnershipApplyApproveConfirm(selectedOrders.map((item) => item.label));
    });
  }
}

function openInboundRowDrawer(rowElement) {
  if (!rowElement) return;
  const table = rowElement.closest("table");
  const headers = Array.from(table?.querySelectorAll("thead th") || []).slice(2).map((th) => th.textContent.trim());
  const row = Array.from(rowElement.querySelectorAll("td") || []).slice(2).map((td) => td.textContent.replace(/\s+/g, " ").trim());
  const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
  openDrawer("入库申请单列表结果", headers, row, rowIndex);
}

function openInboundDeleteConfirm(orderNo) {
  const modal = document.getElementById("globalModal");
  if (!modal || !orderNo) return;

  document.getElementById("modalTitle").textContent = "删除入库申请单";
  document.getElementById("modalSub").textContent = "当前操作仅允许删除草稿状态的入库申请单，确认后将移除该单据下所有商品明细行。";
  document.getElementById("modalFields").innerHTML = `
    <div class="modal-box">
      <div class="label">申请单号</div>
      <div class="value">${orderNo}</div>
    </div>
    <div class="modal-box">
      <div class="label">当前状态</div>
      <div class="value">草稿</div>
    </div>
    <div class="modal-box">
      <div class="label">删除影响</div>
      <div class="value">将按申请单号删除当前草稿单据对应的全部商品明细行。</div>
    </div>`;
  document.getElementById("modalNote").textContent = "当前为原型演示，确认后将回写列表结果并展示删除成功反馈。";
  const primaryButton = document.getElementById("modalPrimaryButton");
  primaryButton.textContent = "确认删除";
  primaryButton.dataset.feedbackType = "delete-inbound-draft";
  primaryButton.dataset.actionLabel = orderNo;
  primaryButton.dataset.orderNo = orderNo;
  modal.classList.add("show");
}

function applyInboundDelete() {
  const primaryButton = document.getElementById("modalPrimaryButton");
  const orderNo = primaryButton?.dataset.orderNo || "";
  if (!orderNo) return;

  const inboundConfig = pcTabConfigs.inbound;
  if (!inboundConfig?.listRows) return;
  const beforeCount = inboundConfig.listRows.length;
  inboundConfig.listRows = inboundConfig.listRows.filter((row) => row[2] !== orderNo);
  const removedCount = beforeCount - inboundConfig.listRows.length;
  if (removedCount > 0 && pcListConfigs.inbound?.total) {
    pcListConfigs.inbound.total = Math.max(0, pcListConfigs.inbound.total - removedCount);
  }
  renderPcPage("inbound", "list");
}

function bindInboundSubmitApproveEvents() {
  const selectAll = document.getElementById("inboundSelectAllDraft");
  const selectDraftButton = document.getElementById("inboundSelectDraftButton");
  const selectPendingButton = document.getElementById("inboundSelectPendingButton");
  const createButton = document.getElementById("inboundCreateButton");
  const submitButton = document.getElementById("inboundSubmitButton");
  const approveButton = document.getElementById("inboundApproveButton");
  const getDraftRows = () => Array.from(document.querySelectorAll("[data-inbound-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "草稿");
  const getPendingRows = () => Array.from(document.querySelectorAll("[data-inbound-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "待审批");

  if (createButton) createButton.addEventListener("click", () => { openModal("form", "新增申请"); });

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      getDraftRows().forEach((element) => {
        element.checked = selectAll.checked;
      });
    });
  }

  if (selectDraftButton) {
    selectDraftButton.addEventListener("click", () => {
      getDraftRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = true;
      showToast("success", "已选中草稿记录", "当前页所有草稿入库申请单已勾选，可直接点击提交按钮。");
    });
  }

  if (selectPendingButton) {
    selectPendingButton.addEventListener("click", () => {
      getPendingRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = false;
      showToast("success", "已选中待审批记录", "当前页所有待审批入库申请单已勾选，可点击审批按钮后选择通过或驳回。");
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const selectedOrders = getInboundSelectedOrders("草稿");
      if (!selectedOrders.length) {
        showToast("error", "未选择草稿记录", "请先勾选一条或多条草稿入库申请单，再点击提交按钮。");
        return;
      }
      openInboundSubmitConfirm(selectedOrders.map((item) => item.label));
    });
  }

  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const selectedOrders = getInboundSelectedOrders("待审批");
      if (!selectedOrders.length) {
        showToast("error", "未选择待审批记录", "请先勾选一条或多条待审批入库申请单，再点击审批按钮。");
        return;
      }
      openInboundApproveConfirm(selectedOrders.map((item) => item.label));
    });
  }
}

function bindDemandSubmitApproveEvents() {
  const createButton = document.getElementById("demandCreateButton");
  if (createButton) createButton.addEventListener("click", () => { openModal("form", "新建要货单"); });
}

function bindNewProductApprovalEvents() {
  const selectAll = document.getElementById("newProductSelectAllDraft");
  const selectDraftButton = document.getElementById("newProductSelectDraftButton");
  const selectPendingButton = document.getElementById("newProductSelectPendingButton");
  const submitButton = document.getElementById("newProductSubmitButton");
  const approveButton = document.getElementById("newProductApproveButton");
  const getDraftRows = () => Array.from(document.querySelectorAll("[data-newproduct-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "草稿");
  const getPendingRows = () => Array.from(document.querySelectorAll("[data-newproduct-submit-row]")).filter((element) => !element.disabled && element.dataset.submitStatus === "待审批");

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      getDraftRows().forEach((element) => {
        element.checked = selectAll.checked;
      });
    });
  }

  if (selectDraftButton) {
    selectDraftButton.addEventListener("click", () => {
      getDraftRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = true;
      showToast("success", "已选中草稿记录", "当前页所有草稿新品记录已勾选，可直接点击提交按钮。");
    });
  }

  if (selectPendingButton) {
    selectPendingButton.addEventListener("click", () => {
      getPendingRows().forEach((element) => {
        element.checked = true;
      });
      if (selectAll) selectAll.checked = false;
      showToast("success", "已选中待审批记录", "当前页所有待审批新品记录已勾选，可点击审批按钮后选择通过或驳回。");
    });
  }

  document.querySelectorAll("[data-newproduct-edit-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      const rowId = button.dataset.rowId || row?.querySelector("[data-newproduct-submit-row]")?.dataset.rowId || "";
      const stateRecord = getNewProductListRecords().find((item) => item.rowId === rowId);
      const rowData = stateRecord || getNewProductRowData(row);
      if (rowData) {
        newProductPageState.selectedEditRow = rowData;
      }
      renderPcPage("newproduct", "edit");
    });
  });

  document.querySelectorAll("[data-newproduct-view-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      openNewProductRowDetail(button);
    });
  });

  document.querySelectorAll("[data-newproduct-delete-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const rowId = button.dataset.rowId || "";
      const stateRecord = getNewProductListRecords().find((item) => item.rowId === rowId);
      if (stateRecord) {
        newProductPageState.selectedEditRow = stateRecord;
      }
      openDeleteConfirm(button.dataset.productName || "新品记录", "list");
    });
  });

  document.querySelectorAll("[data-newproduct-submit-row]").forEach((element) => {
    element.addEventListener("change", () => {
      const draftRows = getDraftRows();
      if (selectAll) {
        selectAll.checked = draftRows.length > 0 && draftRows.every((item) => item.checked);
      }
    });
  });

  if (submitButton) {
    submitButton.addEventListener("click", () => {
      const selectedRows = getDraftRows().filter((element) => element.checked);
      if (!selectedRows.length) {
        showToast("error", "未选择草稿记录", "请先勾选一条或多条草稿记录，再点击提交按钮。");
        return;
      }
      openNewProductSubmitConfirm(selectedRows.map((element) => element.dataset.submitLabel || "新品记录"));
    });
  }

  if (approveButton) {
    approveButton.addEventListener("click", () => {
      const selectedRows = getPendingRows().filter((element) => element.checked);
      if (!selectedRows.length) {
        showToast("error", "未选择待审批记录", "请先勾选一条或多条待审批记录，再点击审批按钮。");
        return;
      }
      openNewProductApproveConfirm(selectedRows.map((element) => element.dataset.submitLabel || "新品记录"));
    });
  }

  refreshNewProductEditButtons();
}

function bindNewProductApprovalFilterEvents() {
  const queryButton = document.getElementById("newProductApprovalQueryButton");
  const resetButton = document.getElementById("newProductApprovalResetButton");

  if (queryButton) {
    queryButton.addEventListener("click", () => {
      const filters = getNewProductApprovalFilterState();
      filters.orderNo = (document.getElementById("newProductApprovalOrderNo")?.value || "").trim();
      filters.submitter = (document.getElementById("newProductApprovalSubmitter")?.value || "").trim();
      filters.approver = (document.getElementById("newProductApprovalApprover")?.value || "").trim();
      filters.actor = (document.getElementById("newProductApprovalActor")?.value || "").trim();
      filters.action = (document.getElementById("newProductApprovalAction")?.value || "全部").trim();
      filters.result = (document.getElementById("newProductApprovalResult")?.value || "全部").trim();
      renderPcPage("newproduct", "approval");
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      newProductPageState.approvalFilters = {
        orderNo: "",
        submitter: "",
        approver: "",
        actor: "",
        action: "全部",
        result: "全部"
      };
      renderPcPage("newproduct", "approval");
    });
  }
}

function buildPcDefaultTabConfig(key) {
  const title = pcPages[key]?.title || "当前页面";
  return {
    detailFields: [
      ["页面名称", title],
      ["业务阶段", "执行中"],
      ["归属系统", "3PL运营平台"],
      ["当前状态", "正常"],
      ["数据范围", "页面示例数据"],
      ["展示目的", "用于原型演示"]
    ],
    detailHeaders: ["字段", "示例值", "说明"],
    detailRows: [
      ["业务编号", `${key.toUpperCase()}-20260526-01`, "示意编号"],
      ["业务状态", "处理中", "示意状态"],
      ["最后更新时间", "2026-05-26 10:20", "示意时间"]
    ],
    actions: [
      ["动作 1", `进入${title}页面查看业务状态`],
      ["动作 2", "根据页面提供的动作按钮进行处理"],
      ["动作 3", "记录操作日志并推动业务流转"],
      ["动作 4", "向下游或相关模块同步处理结果"]
    ],
    actionLogs: [
      ["10:00", "系统", "加载页面数据", "成功"],
      ["10:05", "业务人员", "查看详情", "成功"],
      ["10:10", "系统", "同步页面状态", "成功"]
    ],
    integrationRows: [
      ["上游", "业务来源系统", "数据接入", "成功", "示意联动"],
      ["下游", "相关业务模块", "结果同步", "处理中", "示意联动"],
      ["支撑", "日志/监控", "留痕追踪", "成功", "示意联动"]
    ]
  };
}

function renderPcInfoGrid(fields) {
  return `<div class="section-card"><div class="section-head"><h3>关键信息</h3><div class="action-row">${renderActionButton("导出摘要")}</div></div><div class="info-grid">${fields.map(([label, value]) => `
    <div class="info-item">
      <div class="k">${label}</div>
      <div>${value}</div>
    </div>`).join("")}</div></div>`;
}

function renderPcPagination(totalRows, pageSize) {
  pageSize = pageSize || 10;
  var total = Math.max(totalRows, 86);
  var pages = Math.ceil(total / pageSize);
  var pagesArr = [];
  var showPages = Math.min(pages, 5);
  for (var i = 1; i <= showPages; i++) pagesArr.push(i);
  if (pages > 5) pagesArr.push('...');
  if (pages > 6) pagesArr.push(pages);
  return '<div class="pagination-bar">' +
    '<div class="pagination-info">共 ' + total + ' 条&emsp;<select class="page-size-select"><option selected>10</option><option>20</option><option>50</option></select> 条/页</div>' +
    '<div class="pagination-actions">' +
    '<button class="ghost-button" disabled>‹</button>' +
    pagesArr.map(function(p) {
      var cls = p === 1 ? ' page-pill active' : ' page-pill';
      return '<div class="' + cls.trim() + '">' + p + '</div>';
    }).join('') +
    '<button class="ghost-button">›</button>' +
    '</div></div>';
}

function renderPcSimpleTable(title, headers, rows, showFilterToggle) {
  var filterBtn = showFilterToggle ? '<button class="ghost-button" data-filter-toggle>展开筛选</button>' : '';
  return `<div class="section-card"><div class="section-head"><h3>${title}</h3><div class="action-row">${filterBtn}${renderActionButton("导出明细")}</div></div>
    <div class="data-table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row, rowIndex) => `<tr class="table-row-clickable" data-drawer="detail" data-drawer-title="${title}" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(headers))}">${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  </div>`;
}

function renderPcActionList(items) {
  return `<div class="section-card"><div class="section-head"><h3>处理动作说明</h3><div class="action-row">${renderActionButton("模拟执行")}</div></div><div class="list">${items.map(([title, desc]) => `
    <div class="list-row">
      <div>
        <div class="list-title">${title}</div>
        <div class="muted">${desc}</div>
      </div>
      <span class="tag blue">可执行</span>
    </div>`).join("")}</div></div>`;
}

function renderPcActionLogTable(rows) {
  return renderPcSimpleTable("最近操作记录", ["时间", "处理角色", "动作", "结果"], rows);
}

function renderPcIntegrationTable(rows) {
  return renderPcSimpleTable("系统联动结果", ["方向", "系统", "接口/动作", "状态", "说明"], rows);
}

function renderPcExtraTab(tabConfig) {
  if (typeof tabConfig.render === "function") {
    return tabConfig.render();
  }
  if (tabConfig.content) {
    return tabConfig.content;
  }
  return `
    <div class="section-card">
      <div class="section-head"><h3>${tabConfig.title}</h3><div class="action-row">${renderActionButton("导出明细")}</div></div>
      <div class="notice">
        <div class="title">${tabConfig.title}</div>
        <div class="desc">${tabConfig.desc}</div>
      </div>
    </div>
    ${renderPcSimpleTable(tabConfig.title, tabConfig.headers || [], tabConfig.rows || [])}
  `;
}

function renderPcTabContent(key, tab) {
  const data = pcPages[key];
  const config = resolvePcTabConfig(key);
  if (!data) return "";

  if (tab === "list") {
    if (key === "newproduct") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="newProductSubmitButton">提交</button>
            <button class="primary-button" id="newProductApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" data-tab-switch="create">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="newProductBatchDeleteButton">批量删除</button><button class="ghost-button" id="newProductSelectDraftButton">全选草稿</button><button class="ghost-button" id="newProductSelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="newProductSelectAllDraft" /></th>
                  <th>单号</th>
                  <th>货主</th>
                  <th>提交人</th>
                  <th>审批人</th>
                  <th>时间</th>
                  <th>商品编码</th>
                  <th>条形码</th>
                  <th>商品名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>商品分类</th>
                  <th>品牌</th>
                  <th>型号</th>
                  <th>温层</th>
                  <th>包装数量</th>
                  <th>录入状态</th>
                  <th>审批状态</th>
                  <th>审批意见</th>
                  <th>驳回原因</th>
                  <th>下一审批人</th>
                  <th>写入商品信息</th>
                  <th>附件资料</th>
                </tr>
              </thead>
              <tbody>
                ${renderNewProductListRows()}
              </tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "inventoryplan") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="inventoryPlanSubmitButton">提交</button>
            <button class="primary-button" id="inventoryPlanApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="inventoryPlanCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" data-inventoryplan-batch-approve>批量审批</button><button class="ghost-button" data-inventoryplan-batch-delete>批量删除</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="inventoryPlanSelectAllDraft" /></th>
                  <th>计划单号</th>
                  <th>货主</th>
                  <th>盘点仓库</th>
                  <th>盘点库存地点</th>
                  <th>盘点类型</th>
                  <th>预计盘点日期</th>
                  <th>盘点时间</th>
                  <th>盘点范围</th>
                  <th>提交人</th>
                  <th>审批人</th>
                  <th>时间</th>
                  <th>申请状态</th>
                  <th>生成通知</th>
                  <th>审批意见</th>
                  <th>驳回原因</th>
                </tr>
              </thead>
              <tbody>
                ${renderInventoryPlanListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "inventorynotify") {
      const notifyHeaders = ["操作","勾选","通知单号","来源申请单","货主","盘点仓库","盘点库存地点","盘点类型","预计盘点日期","盘点范围","生成方式","WMS下发","时间"];
      const notifyRecords = [
        { orderNo: "PDTZ20260526001", sourceOrder: "PDJH20260526001", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "全盘", expectedDate: "2026-06-15", checkScope: "", genMethod: "审核通过自动生成", wmsStatus: "待WMS接收", time: "2026-05-26 09:30", categories: [] },
        { orderNo: "PDTZ20260526002", sourceOrder: "PDJH20260526002", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "抽盘", expectedDate: "2026-06-18", checkScope: "中类", genMethod: "审核通过自动生成", wmsStatus: "已下发WMS", time: "2026-05-26 10:35", categories: ["清洁剂", "防护手套", "消毒液"] },
        { orderNo: "PDTZ20260526003", sourceOrder: "PDJH20260526003", owner: "外部货主B", warehouse: "华南2仓", position: "1001", checkType: "抽盘", expectedDate: "2026-06-20", checkScope: "小类", genMethod: "审核通过自动生成", wmsStatus: "已下发WMS", time: "2026-05-26 11:05", categories: ["防护手套", "低值易耗品"] },
        { orderNo: "PDTZ20260526004", sourceOrder: "PDJH20260526004", owner: "自有货主A", warehouse: "华北3仓", position: "1000", checkType: "抽盘", expectedDate: "2026-06-22", checkScope: "大类", genMethod: "审核通过自动生成", wmsStatus: "盘点执行中", time: "2026-05-26 14:05", categories: ["低值易耗品", "清洁剂", "防护用品", "办公用品"] },
        { orderNo: "PDTZ20260526006", sourceOrder: "PDJH20260526006", owner: "自有货主A", warehouse: "华东1仓", position: "1000", checkType: "抽盘", expectedDate: "2026-06-28", checkScope: "小类", genMethod: "审核通过自动生成", wmsStatus: "待WMS接收", time: "2026-05-27 09:20", categories: ["防护手套", "清洁剂", "防护用品", "垃圾袋", "抹布"] },
        { orderNo: "PDTZ20260526007", sourceOrder: "PDJH20260526007", owner: "外部货主B", warehouse: "华南2仓", position: "B-01 全区", checkType: "全盘", expectedDate: "2026-07-01", checkScope: "", genMethod: "审核通过自动生成", wmsStatus: "待WMS接收", time: "2026-05-27 10:05", categories: [] }
      ];
      const notifyRows = notifyRecords.map((record, rowIndex) => {
        const hasChildren = record.categories && record.categories.length > 0;
        const masterClass = hasChildren ? "master-row" : "master-row no-children";
        const wmsClass = record.wmsStatus === "待WMS接收" ? "orange" : record.wmsStatus === "已下发WMS" ? "blue" : record.wmsStatus === "盘点执行中" ? "green" : "gray";
        let html = `
          <tr class="table-row-clickable ${masterClass}" data-drawer="detail" data-drawer-title="盘点通知单详情"
              data-drawer-index="${rowIndex}" data-master-index="notify-${rowIndex}">
            <td><button class="table-action-button">查看</button></td>
            <td><input type="checkbox" /></td>
            <td>${hasChildren ? '<span class="expand-icon"></span>' : ''}${record.orderNo}</td>
            <td>${record.sourceOrder}</td>
            <td>${record.owner}</td>
            <td>${record.warehouse}</td>
            <td>${record.position}</td>
            <td>${record.checkType}</td>
            <td>${record.expectedDate}</td>
            <td>${record.checkScope}</td>
            <td>${record.genMethod}</td>
            <td><span class="tag ${wmsClass}">${record.wmsStatus}</span></td>
            <td>${record.time}</td>
          </tr>`;
        if (hasChildren) {
          html += `
          <tr class="child-row" data-child-index="notify-${rowIndex}">
            <td colspan="${notifyHeaders.length}">
              <div class="child-inner">
                <table class="child-table">
                  <thead><tr><th>品类明细</th></tr></thead>
                  <tbody>${record.categories.map(c => `<tr><td>${c}</td></tr>`).join("")}</tbody>
                </table>
              </div>
            </td>
          </tr>`;
        }
        return html;
      }).join("");
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button">刷新通知状态</button><button class="ghost-button" data-modal="export">导出通知单</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" /></th>
                  <th>通知单号</th>
                  <th>来源申请单</th>
                  <th>货主</th>
                  <th>盘点仓库</th>
                  <th>盘点库存地点</th>
                  <th>盘点类型</th>
                  <th>预计盘点日期</th>
                  <th>盘点范围</th>
                  <th>生成方式</th>
                  <th>WMS下发</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>${notifyRows}</tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "returnapply") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="returnApplySubmitButton">提交</button>
            <button class="primary-button" id="returnApplyApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="returnApplyCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="returnApplyBatchDeleteButton">批量删除</button><button class="ghost-button" id="returnApplySelectDraftButton">全选草稿</button><button class="ghost-button" id="returnApplySelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="returnApplySelectAllDraft" /></th>
                  <th>申请单号</th>
                  <th>来源方式</th>
                  <th>货主</th>
                  <th>申请仓库</th>
                  <th>提交人</th>
                  <th>审批人</th>
                  <th>时间</th>
                  <th>申请状态</th>
                  <th>生成通知</th>
                  <th>审批意见</th>
                  <th>驳回原因</th>
                  <th>商品编码</th>
                  <th>条形码</th>
                  <th>商品名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>生产批号</th>
                  <th>生产日期</th>
                  <th>保质日期</th>
                  <th>申请数量</th>
                  <th>税率</th>
                  <th>未税进价</th>
                  <th>含税进价</th>
                  <th>未税金额</th>
                  <th>含税金额</th>
                  <th>税额</th>
                </tr>
              </thead>
              <tbody>
                ${renderReturnApplyListRows()}
              </tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "inbound") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="inboundSubmitButton">提交</button>
            <button class="primary-button" id="inboundApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="inboundCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="inboundBatchDeleteButton">批量删除</button><button class="ghost-button" id="inboundSelectDraftButton">全选草稿</button><button class="ghost-button" id="inboundSelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="inboundSelectAllDraft" /></th>
                  <th>申请单号</th>
                  <th>货主</th>
                  <th>申请仓库</th>
                  <th>申请状态</th>
                  <th>生成通知</th>
                  <th>财务协同</th>
                  <th>商品编码</th>
                  <th>条形码</th>
                  <th>商品名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>申请数量</th>
                  <th>进项税率</th>
                  <th>未税进价</th>
                  <th>含税进价</th>
                  <th>未税进价金额</th>
                  <th>含税进价金额</th>
                  <th>税额</th>
                </tr>
              </thead>
              <tbody>${(config.listRows || []).map((row, rowIndex) => `<tr class="table-row-clickable" data-drawer="detail" data-drawer-title="列表结果" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(config.listHeaders || []))}">${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "returnapplyin") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="returnApplyInSubmitButton">提交</button>
            <button class="primary-button" id="returnApplyInApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="returnApplyInCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="returnApplyInBatchDeleteButton">批量删除</button><button class="ghost-button" id="returnApplyInSelectDraftButton">全选草稿</button><button class="ghost-button" id="returnApplyInSelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="returnApplyInSelectAllDraft" /></th>
                  <th>申请单号</th>
                  <th>来源方式</th>
                  <th>客户</th>
                  <th>原货主</th>
                  <th>退回仓</th>
                  <th>提交人</th>
                  <th>审批人</th>
                  <th>时间</th>
                  <th>申请状态</th>
                  <th>生成通知</th>
                  <th>审批意见</th>
                  <th>驳回原因</th>
                  <th>商品编码</th>
                  <th>条形码</th>
                  <th>商品名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>生产批号</th>
                  <th>生产日期</th>
                  <th>保质日期</th>
                  <th>原配送数量</th>
                  <th>可退数量</th>
                  <th>申请数量</th>
                  <th>税率</th>
                  <th>未税进价</th>
                  <th>含税进价</th>
                  <th>未税金额</th>
                  <th>含税金额</th>
                  <th>税额</th>
                </tr>
              </thead>
              <tbody>
                ${renderReturnApplyInListRows()}
              </tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "ownershipapply") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="ownershipApplySubmitButton">提交</button>
            <button class="primary-button" id="ownershipApplyApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="ownershipApplyCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="ownershipApplyBatchDeleteButton">批量删除</button><button class="ghost-button" id="ownershipApplySelectDraftButton">全选草稿</button><button class="ghost-button" id="ownershipApplySelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="ownershipApplySelectAllDraft" /></th>
                  <th>申请单号</th>
                  <th>原货主</th>
                  <th>目标货主</th>
                  <th>仓库</th>
                  <th>提交人</th>
                  <th>审批人</th>
                  <th>时间</th>
                  <th>申请状态</th>
                  <th>生成通知</th>
                  <th>审批意见</th>
                  <th>驳回原因</th>
                  <th>商品编码</th>
                  <th>条形码</th>
                  <th>商品名称</th>
                  <th>规格</th>
                  <th>单位</th>
                  <th>生产批号</th>
                  <th>生产日期</th>
                  <th>保质日期</th>
                  <th>可转数量</th>
                  <th>申请数量</th>
                  <th>税率</th>
                  <th>未税进价</th>
                  <th>含税进价</th>
                  <th>未税金额</th>
                  <th>含税金额</th>
                  <th>税额</th>
                </tr>
              </thead>
              <tbody>
                ${renderOwnershipApplyListRows()}
              </tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "storeordercycle") {
      return `
        <div class="section-card">
          <div class="section-head"><h3>门店要货周期规则</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="storeOrderCycleCreateButton">新增规则</button></div></div>
          <div class="info-panel">
            <div class="info-panel-item"><div class="info-panel-title">规则说明</div><div class="info-panel-desc">门店要货周期定义用于控制门店可提交要货单的时间窗口。支持按周/按月两种模式，便于满足门店固定送货周期与合同约定送货日期。</div></div>
            <div class="info-panel-item"><div class="info-panel-title">操作指南</div><div class="info-panel-desc">点击“新增规则”可录入新规则，列表中支持编辑与删除。生效中规则可继续编辑，草稿规则可直接删除。</div></div>
          </div>
        </div>
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>收起筛选</button><button class="ghost-button" data-modal="export">导出</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th>规则编码</th>
                  <th>门店编码</th>
                  <th>门店名称</th>
                  <th>所属客户</th>
                  <th>要货周期类型</th>
                  <th>可要货日期</th>
                  <th>生效日期</th>
                  <th>状态</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                ${renderStoreOrderCycleListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "demand") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
            <button class="primary-button" id="demandSubmitButton">提交</button>
            <button class="primary-button" id="demandApproveButton">审批</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="primary-button" id="demandCreateButton">新增</button><button class="ghost-button" data-modal="import">导入</button><button class="ghost-button" data-modal="export">导出</button><button class="ghost-button" id="demandBatchDeleteButton">批量删除</button><button class="ghost-button" id="demandSelectDraftButton">全选草稿</button><button class="ghost-button" id="demandSelectPendingButton">全选待审批</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th><input type="checkbox" id="demandSelectAllDraft" /></th>
                  ${(config.listHeaders || []).map(h => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${(config.listRows || []).map((row, rowIndex) => `<tr class="table-row-clickable" data-drawer="detail" data-drawer-title="客户要货单详情" data-drawer-index="${rowIndex}" data-drawer-row="${encodeURIComponent(JSON.stringify(row))}" data-drawer-headers="${encodeURIComponent(JSON.stringify(config.listHeaders || []))}"><td></td><td><input type="checkbox" /></td>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
              </tbody>
            </table>
          </div>
</div>
      `;
    }

    if (key === "qualityreport") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>纸质报告查询</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button></div></div>
          <div style="padding:16px 20px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
            <div style="flex:1;min-width:200px;"><div style="font-size:13px;color:#64748b;margin-bottom:6px;">报告编号</div><input type="text" placeholder="输入纸质报告编号，如 ZJBG-ZZ-2026-001" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" /></div>
            <div style="flex:1;min-width:200px;"><div style="font-size:13px;color:#64748b;margin-bottom:6px;">生产批号</div><input type="text" placeholder="输入生产批号，如 BATCH20260526A" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" /></div>
            <div style="flex:1;min-width:200px;"><div style="font-size:13px;color:#64748b;margin-bottom:6px;">商品名称</div><input type="text" placeholder="输入商品名称关键词" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" /></div>
            <div><button class="primary-button" id="qualityReportPaperQueryBtn">查询纸质报告</button></div>
          </div>
          <div id="qualityReportPaperResult" style="display:none;padding:0 20px 16px;">
            <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;background:#f8fafc;">
              <div style="font-size:14px;font-weight:500;color:#1e293b;margin-bottom:12px;">查询结果：ZJBG-ZZ-2026-001</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:13px;">
                <div><span style="color:#64748b;">报告编号：</span>ZJBG-ZZ-2026-001</div>
                <div><span style="color:#64748b;">对应电子报告：</span>ZJBG20260526001</div>
                <div><span style="color:#64748b;">报告类型：</span>纸质原件</div>
                <div><span style="color:#64748b;">商品名称：</span>物料-低值易耗品001</div>
                <div><span style="color:#64748b;">生产批号：</span>BATCH20260526A</div>
                <div><span style="color:#64748b;">检验结论：</span><span style="color:#16a34a;">合格</span></div>
                <div><span style="color:#64748b;">检验日期：</span>2026-05-26</div>
                <div><span style="color:#64748b;">存放位置：</span>华东1仓-质检档案室-A柜-03层</div>
                <div><span style="color:#64748b;">借阅状态：</span><span style="color:#2563eb;">在库</span></div>
              </div>
              <div style="margin-top:12px;display:flex;gap:8px;">
                <button class="ghost-button" onclick="document.getElementById('qualityReportImageViewer').style.display='block'">查看扫描件</button>
                <button class="ghost-button">借阅登记</button>
                <button class="ghost-button">打印报告</button>
              </div>
            </div>
          </div>
          <div id="qualityReportImageViewer" style="display:none;padding:0 20px 16px;">
            <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;background:#fff;text-align:center;">
              <div style="font-size:14px;font-weight:500;color:#1e293b;margin-bottom:12px;">纸质报告扫描件预览</div>
              <div style="background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:8px;padding:40px 20px;color:#94a3b8;font-size:14px;">
                纸质报告扫描件预览区域
                <div style="margin-top:4px;font-size:12px;">（原型演示：实际环境中将显示报告扫描图片/PDF）</div>
              </div>
              <button class="ghost-button" style="margin-top:12px;" onclick="document.getElementById('qualityReportImageViewer').style.display='none'">关闭预览</button>
            </div>
          </div>
        </div>
        <div class="section-card" style="margin-top:10px;">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-modal="export">导出报告</button><button class="primary-button" id="qualityReportCreateButton">新建报告</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${["报告编号","货主","仓库","商品编码","商品名称","生产批号","供应商","报告类型","检验结论","报告日期","状态"].map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                <tr><td><a href="javascript:void(0)" class="qr-report-link" data-report-id="ZJBG20260526001" onclick="showReportScanPreview(this)">ZJBG20260526001</a></td><td>自有货主A</td><td>华东1仓</td><td>MAT-PD-001</td><td>物料-低值易耗品001</td><td>BATCH20260526A</td><td>供应商A-华东物料</td><td>入库质检</td><td><span class="tag green">合格</span></td><td>2026-05-26</td><td><span class="tag green">已生效</span></td></tr>
                <tr><td><a href="javascript:void(0)" class="qr-report-link" data-report-id="ZJBG20260526002" onclick="showReportScanPreview(this)">ZJBG20260526002</a></td><td>自有货主A</td><td>华东1仓</td><td>MAT-PD-002</td><td>物料-低值易耗品002</td><td>BATCH20260526B</td><td>供应商A-华东物料</td><td>入库质检</td><td><span class="tag green">合格</span></td><td>2026-05-26</td><td><span class="tag green">已生效</span></td></tr>
                <tr><td><a href="javascript:void(0)" class="qr-report-link" data-report-id="ZJBG20260526003" onclick="showReportScanPreview(this)">ZJBG20260526003</a></td><td>外部货主B</td><td>华南2仓</td><td>MAT-PD-004</td><td>防护手套-无粉</td><td>BATCH20260510A</td><td>供应商B-华南日化</td><td>入库质检</td><td><span class="tag orange">让步接收</span></td><td>2026-05-10</td><td><span class="tag green">已生效</span></td></tr>
                <tr><td><a href="javascript:void(0)" class="qr-report-link" data-report-id="ZJBG20260526004" onclick="showReportScanPreview(this)">ZJBG20260526004</a></td><td>自有货主A</td><td>华北3仓</td><td>MAT-PD-003</td><td>低值易耗品-清洁剂</td><td>BATCH20260508A</td><td>供应商A-华东物料</td><td>定期送检</td><td><span class="tag green">合格</span></td><td>2026-05-08</td><td><span class="tag green">已生效</span></td></tr>
                <tr><td><a href="javascript:void(0)" class="qr-report-link" data-report-id="ZJBG20260526005" onclick="showReportScanPreview(this)">ZJBG20260526005</a></td><td>自有货主C</td><td>华北3仓</td><td>MAT-PD-006</td><td>低值易耗品-办公用品</td><td>BATCH20260512A</td><td>供应商C-华北食品</td><td>入库质检</td><td><span class="tag red">不合格</span></td><td>2026-05-12</td><td><span class="tag red">已作废</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="reportScanModal" class="qr-scan-modal" style="display:none;">
          <div class="qr-scan-modal-overlay" onclick="closeReportScanPreview()"></div>
          <div class="qr-scan-modal-content">
            <div class="qr-scan-modal-header">
              <div>
                <span style="font-size:15px;font-weight:600;color:#1e293b;">扫描件预览</span>
                <span id="reportScanModalId" style="font-size:13px;color:#64748b;margin-left:10px;"></span>
              </div>
              <button class="ghost-button" style="padding:4px 12px;font-size:13px;" onclick="closeReportScanPreview()">✕ 关闭</button>
            </div>
            <div class="qr-scan-modal-body">
              <div style="display:flex;gap:20px;height:100%;">
                <div style="flex:1;display:flex;flex-direction:column;">
                  <div style="font-size:13px;font-weight:500;color:#475569;margin-bottom:8px;">报告扫描件</div>
                  <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:14px;position:relative;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    <div style="color:#64748b;font-size:13px;margin-top:10px;">质检报告扫描件预览</div>
                    <div style="color:#94a3b8;font-size:12px;margin-top:4px;">（原型演示：实际环境将显示扫描图片/PDF）</div>
                    <div style="margin-top:16px;display:flex;gap:8px;">
                      <button class="ghost-button" style="font-size:12px;padding:4px 10px;">放大</button>
                      <button class="ghost-button" style="font-size:12px;padding:4px 10px;">缩小</button>
                      <button class="ghost-button" style="font-size:12px;padding:4px 10px;">旋转</button>
                      <button class="ghost-button" style="font-size:12px;padding:4px 10px;">下载</button>
                    </div>
                  </div>
                </div>
                <div style="width:260px;display:flex;flex-direction:column;">
                  <div style="font-size:13px;font-weight:500;color:#475569;margin-bottom:8px;">报告摘要</div>
                  <div id="reportScanSummary" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:13px;line-height:2;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }

    if (key === "delivery") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${deliveryMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderDeliveryListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "deliveryorder") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${deliveryOrderMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderDeliveryOrderListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "customer") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button><button class="primary-button">新增客户</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${customerMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderCustomerListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "errororder") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button><button class="primary-button">新建差错申请单</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${errorOrderMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderErrorOrderListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "transportservice") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${transportServiceMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderTransportServiceListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (key === "inventorycheck") {
      return `
        <div class="section-card" data-filter-section>
          <div class="section-head"><h3>列表查询</h3></div>
          <div class="list-filter-grid" style="margin-bottom:12px;">
            ${(config.listFilters || []).map((item) => `<div class="input">${item}：全部</div>`).join("")}
          </div>
          <div class="action-row" style="margin-bottom:12px;">
            <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
            <button class="ghost-button" data-list-action="reset-list">重置条件</button>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>列表结果</h3><div class="action-row"><button class="ghost-button" data-filter-toggle>展开筛选</button><button class="ghost-button" data-modal="export">导出</button></div></div>
          <div class="drawer-table-wrap">
            <table>
              <thead>
                <tr>${inventoryCheckMasterHeaders.map(h => "<th>" + h + "</th>").join("")}</tr>
              </thead>
              <tbody>
                ${renderInventoryCheckListRows()}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    const filters = config.listFilters || [];
    return `
      <div class="section-card" data-filter-section>
        <div class="section-head"><h3>列表查询</h3></div>
        <div class="list-filter-grid" style="margin-bottom:12px;">
          ${filters.map((item) => `<div class="input">${item}：全部</div>`).join("")}
        </div>
        <div class="action-row" style="margin-bottom:12px;">
          <button class="primary-button" data-modal="refresh" data-action-label="执行查询">查询</button>
          <button class="ghost-button" data-list-action="reset-list">重置条件</button>
        </div>
      </div>
      ${renderPcSimpleTable("列表结果", config.listHeaders || [], config.listRows || [], true)}
    `;
  }

  if (tab === "overview") {
    if (key === "owner") {
      return `
        <div class="section-card" style="margin-bottom:14px;">
          <div class="section-head"><h3>货主档案</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">新增货主</button></div></div>
          <div class="data-table-wrap"><table><thead><tr><th>货主编码</th><th>货主名称</th><th>货主类型</th><th>结算主体</th><th>默认状态</th><th>联系人</th><th>联系电话</th></tr></thead><tbody>
            <tr><td>OWNER001</td><td>自有货主A</td><td>自有货主</td><td>总部结算中心</td><td><span class="tag green">启用</span></td><td>李波</td><td>13800000001</td></tr>
            <tr><td>OWNER002</td><td>外部货主B</td><td>外部货主</td><td>华南区域结算中心</td><td><span class="tag green">启用</span></td><td>陈华</td><td>13800000002</td></tr>
            <tr><td>OWNER003</td><td>自有货主C</td><td>自有货主</td><td>华北共享结算主体</td><td><span class="tag orange">待复核</span></td><td>王雪</td><td>13800000003</td></tr>
          </tbody></table></div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>货主仓库关系表</h3><div class="action-row"><button class="ghost-button">导出</button><button class="primary-button">新增关系</button></div></div>
          <div class="notice" style="margin-bottom:12px;"><div class="title">关系说明</div><div class="desc">记录货主与配送仓库、库存地点的关联关系，同一货主可关联多个仓库和库存地点。</div></div>
          <div class="data-table-wrap"><table><thead><tr><th>关系编号</th><th>货主编码</th><th>货主名称</th><th>仓库编码</th><th>仓库名称</th><th>库存地点</th><th>库存地点名称</th><th>关系状态</th><th>生效日期</th></tr></thead><tbody>
            <tr><td>OW-001</td><td>OWNER001</td><td>自有货主A</td><td>WH-HD01</td><td>华东1仓</td><td>1000</td><td>正常仓</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td></tr>
            <tr><td>OW-002</td><td>OWNER001</td><td>自有货主A</td><td>WH-HB03</td><td>华北3仓</td><td>1000</td><td>正常仓</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td></tr>
            <tr><td>OW-003</td><td>OWNER001</td><td>自有货主A</td><td>WH-HD01</td><td>华东1仓</td><td>1001</td><td>退货仓</td><td><span class="tag green">生效中</span></td><td>2026-01-01</td></tr>
            <tr><td>OW-004</td><td>OWNER002</td><td>外部货主B</td><td>WH-HN02</td><td>华南2仓</td><td>1000</td><td>正常仓</td><td><span class="tag green">生效中</span></td><td>2026-02-15</td></tr>
            <tr><td>OW-005</td><td>OWNER002</td><td>外部货主B</td><td>WH-HN02</td><td>华南2仓</td><td>1001</td><td>退货仓</td><td><span class="tag green">生效中</span></td><td>2026-02-15</td></tr>
            <tr><td>OW-006</td><td>OWNER002</td><td>外部货主B</td><td>WH-HN02</td><td>华南2仓</td><td>1005</td><td>线上仓</td><td><span class="tag green">生效中</span></td><td>2026-03-01</td></tr>
            <tr><td>OW-007</td><td>OWNER003</td><td>自有货主C</td><td>WH-HB03</td><td>华北3仓</td><td>1000</td><td>正常仓</td><td><span class="tag green">生效中</span></td><td>2026-03-10</td></tr>
            <tr><td>OW-008</td><td>OWNER003</td><td>自有货主C</td><td>WH-HB03</td><td>华北3仓</td><td>1008</td><td>差异仓</td><td><span class="tag orange">待生效</span></td><td>2026-06-01</td></tr>
          </tbody></table></div>
        </div>`;
    }
    return renderPcListShell(key, data.content);
  }

  if (tab === "detail") {
    return `
      <div class="grid-2">
        ${renderPcInfoGrid(config.detailFields)}
        <div class="section-card">
          <div class="section-head"><h3>页面说明</h3><div class="action-row">${renderActionButton("查看字段")}</div></div>
          <div class="notice">
            <div class="title">${data.title}明细视图</div>
            <div class="desc">该视图用于承接点击“明细”后的原型展示，重点体现业务单头信息、关键归属字段和明细记录，便于继续细化为真实详情页或抽屉页。</div>
          </div>
        </div>
      </div>
      ${renderPcSimpleTable("明细记录", config.detailHeaders, config.detailRows)}
    `;
  }

  if (tab === "actions") {
    return `
      <div class="grid-2">
        ${renderPcActionList(config.actions)}
        <div class="section-card">
          <div class="section-head"><h3>可执行按钮原型</h3><div class="action-row">${renderActionButton("查看权限")}</div></div>
          <div class="list">
            <div class="list-row"><div><div class="list-title">主动作按钮</div><div class="muted">如提交、审核、刷新、重推等。</div></div><span class="tag green">启用</span></div>
            <div class="list-row"><div><div class="list-title">辅助动作按钮</div><div class="muted">如导出、查看详情、查看历史等。</div></div><span class="tag blue">启用</span></div>
            <div class="list-row"><div><div class="list-title">风险动作按钮</div><div class="muted">如驳回、关闭、生成补偿任务等。</div></div><span class="tag orange">需确认</span></div>
          </div>
        </div>
      </div>
      ${renderPcActionLogTable(config.actionLogs)}
    `;
  }

  if (tab === "integration") {
    return `
      <div class="grid-2">
        <div class="section-card">
          <div class="section-head"><h3>联动说明</h3><div class="action-row">${renderActionButton("查看接口清单")}</div></div>
          <div class="notice">
            <div class="title">${data.title}联动视图</div>
            <div class="desc">该视图用于承接点击“联动结果”后的原型展示，重点体现当前页面与上游、下游系统之间的数据流向、状态和处理结果。</div>
          </div>
        </div>
        <div class="section-card">
          <div class="section-head"><h3>联动状态摘要</h3><div class="action-row">${renderActionButton("刷新联动状态")}</div></div>
          <div class="list">
            <div class="list-row"><div><div class="list-title">上游接入</div><div class="muted">页面对应业务的来源系统数据已进入平台。</div></div><span class="tag green">正常</span></div>
            <div class="list-row"><div><div class="list-title">下游回传</div><div class="muted">资源资产系统、BMS、WMS/TMS 等联动按规则推进。</div></div><span class="tag blue">处理中</span></div>
            <div class="list-row"><div><div class="list-title">异常补偿</div><div class="muted">若接口失败，可补偿或人工重试。</div></div><span class="tag orange">可处理</span></div>
          </div>
        </div>
      </div>
      ${renderPcIntegrationTable(config.integrationRows)}
    `;
  }

  const extraTab = (config.extraTabs || []).find((item) => item.key === tab);
  if (extraTab) {
    return renderPcExtraTab(extraTab);
  }

  return data.content;
}

function renderPcTabButtons(activeTab, key) {
  const config = resolvePcTabConfig(key);
  const hideFormTabs = ["newproduct", "inventoryplan", "returnapply", "returnapplyin", "ownershipapply"].includes(key);
  const visibleExtraTabs = hideFormTabs
    ? (config.extraTabs || []).filter((item) => !["create", "edit"].includes(item.key))
    : (config.extraTabs || []);
  const tabs = hideFormTabs
    ? [
        ["actions", "处理动作"],
        ["integration", "联动结果"]
      ]
    : [
        ["overview", "概览"],
        ["detail", "明细"],
        ["actions", "处理动作"],
        ["integration", "联动结果"]
      ];
  if (config.listHeaders?.length) {
    tabs.unshift(["list", "列表"]);
  }
  if (visibleExtraTabs.length) {
    tabs.splice(config.listHeaders?.length ? (hideFormTabs ? 1 : 3) : (hideFormTabs ? 0 : 2), 0, ...visibleExtraTabs.map((item) => [item.key, item.label]));
  }
  return `<div class="page-tabs">${tabs.map(([key, label]) => `
    <div class="page-tab ${activeTab === key ? "active" : ""}" data-tab="${key}">${label}</div>`).join("")}</div>`;
}

function bindPcTabEvents(key) {
  document.querySelectorAll(".page-tab").forEach((element) => {
    element.addEventListener("click", () => {
      renderPcPage(key, element.dataset.tab);
    });
  });

  document.querySelectorAll("[data-filter-toggle]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var resultsCard = btn.closest(".section-card");
      var filterCard = resultsCard ? resultsCard.previousElementSibling : null;
      if (!filterCard || !filterCard.hasAttribute("data-filter-section")) return;
      var isHidden = filterCard.hasAttribute("data-filter-hidden");
      if (isHidden) {
        filterCard.removeAttribute("data-filter-hidden");
        btn.textContent = "\u6536\u8d77\u7b5b\u9009";
      } else {
        filterCard.setAttribute("data-filter-hidden", "");
        btn.textContent = "\u5c55\u5f00\u7b5b\u9009";
      }
    });
  });
}

function bindPcInnerTabSwitchEvents(key) {
  document.querySelectorAll("[data-tab-switch]").forEach((element) => {
    element.addEventListener("click", () => {
      const targetTab = element.dataset.tabSwitch || "overview";
      if (key === "newproduct" && targetTab === "create") {
        newProductPageState.selectedEditRow = null;
      }
      if (key === "returnapplyin" && targetTab === "create") {
        returnApplyInPageState.selectedEditRow = null;
      }
      if (key === "ownershipapply" && targetTab === "create") {
        ownershipApplyPageState.selectedEditRow = null;
      }
      if (key === "inventoryplan" && targetTab === "create") {
        inventoryPlanPageState.selectedEditRow = null;
      }
      renderPcPage(key, element.dataset.tabSwitch || "overview");
    });
  });
}

function processPcTables() {
  document.querySelectorAll('.drawer-table-wrap table, .data-table-wrap table').forEach(function(table) {
    if (table.classList.contains('child-table')) return;
    var ths = Array.from(table.querySelectorAll(':scope > thead > tr > th'));
    var rows = Array.from(table.querySelectorAll(':scope > tbody > tr')).filter(function(row) { return !row.classList.contains('child-row'); });
    var actionIdx = -1;
    ths.forEach(function(th, i) { if (th.textContent.trim() === '操作') actionIdx = i; });
    var checkboxIdx = -1;
    ths.forEach(function(th, i) { if (th.querySelector('input[type="checkbox"]')) checkboxIdx = i; });
    if (actionIdx >= 0) {
      ths[actionIdx].remove();
      rows.forEach(function(row) {
        var cells = row.querySelectorAll(':scope > td');
        if (cells[actionIdx]) cells[actionIdx].remove();
      });
    }
    if (checkboxIdx < 0) {
      var cbTh = document.createElement('th');
      cbTh.innerHTML = '<input type="checkbox" />';
      var firstTh = table.querySelector(':scope > thead > tr > th');
      if (firstTh) firstTh.before(cbTh);
      rows.forEach(function(row) {
        var cbTd = document.createElement('td');
        cbTd.innerHTML = '<input type="checkbox" />';
        var firstTd = row.querySelector(':scope > td');
        if (firstTd) firstTd.before(cbTd);
      });
    }
    var currentThs = Array.from(table.querySelectorAll(':scope > thead > tr > th'));
    var cbHeaderIdx = -1;
    currentThs.forEach(function(th, i) { if (th.querySelector('input[type="checkbox"]')) cbHeaderIdx = i; });
    if (cbHeaderIdx >= 0) {
      var seqTh = document.createElement('th');
      seqTh.textContent = '序号';
      if (currentThs[cbHeaderIdx]) currentThs[cbHeaderIdx].after(seqTh);
      rows.forEach(function(row, index) {
        var cells = row.querySelectorAll(':scope > td');
        var seqTd = document.createElement('td');
        seqTd.textContent = index + 1;
        if (cells[cbHeaderIdx]) cells[cbHeaderIdx].after(seqTd);
      });
    }
    var updatedThs = Array.from(table.querySelectorAll(':scope > thead > tr > th'));
    var orderIdx = -1;
    updatedThs.forEach(function(th, i) { if ((th.textContent.includes('单号') || th.textContent.includes('单据号') || th.textContent === '单号') && orderIdx < 0) orderIdx = i; });
    if (orderIdx >= 0) {
      rows.forEach(function(row) {
        var cells = row.querySelectorAll(':scope > td');
        if (cells[orderIdx]) {
          var text = cells[orderIdx].textContent.trim();
          var expandIcon = cells[orderIdx].querySelector('.expand-icon');
          var expandHtml = expandIcon ? expandIcon.outerHTML : '';
          if (text && !cells[orderIdx].querySelector('.order-link')) {
            cells[orderIdx].innerHTML = expandHtml + '<span class="order-link" data-order-no="' + text + '">' + text + '</span>';
          }
        }
      });
    }
  });
  document.querySelectorAll('.order-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.stopPropagation();
      var tr = link.closest('tr');
      if (tr) tr.click();
    });
  });
}

function bindSideMenuSearch() {
  const input = document.querySelector('.side-search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    const kw = input.value.trim().toLowerCase();
    const links = document.querySelectorAll('.side-panel .menu-link');
    links.forEach(link => {
      link.style.display = (!kw || link.textContent.toLowerCase().includes(kw)) ? '' : 'none';
    });
    document.querySelectorAll('.side-panel .menu-title').forEach(title => {
      const group = title.parentElement;
      const visible = group.querySelectorAll('.menu-link:not([style*="display: none"])');
      group.style.display = visible.length === 0 ? 'none' : '';
    });
  });
}

function bindMenuToggle() {
  document.querySelectorAll('[data-menu-toggle]').forEach(function(title) {
    title.addEventListener('click', function() {
      var group = title.parentElement;
      var items = group.querySelector('.menu-items');
      var arrow = title.querySelector('.menu-arrow');
      if (items) {
        var collapsed = items.style.display === 'none';
        items.style.display = collapsed ? '' : 'none';
        if (arrow) arrow.innerHTML = collapsed ? '&#9662;' : '&#9656;';
      }
    });
  });
}

function bindSubTabs() {
  document.querySelectorAll('.sub-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var key = tab.dataset.subTab;
      var parent = tab.closest('.sub-tabs');
      if (!parent) return;
      var container = parent.parentElement;
      parent.querySelectorAll('.sub-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      container.querySelectorAll('.sub-tab-content').forEach(function(c) {
        c.classList.toggle('active', c.dataset.subTabContent === key);
      });
    });
  });
}

function bindTopNavDropdowns() {
  const groups = document.querySelectorAll('.top-nav-group');
  groups.forEach(group => {
    const trigger = group.querySelector('.top-nav-item');
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      const wasOpen = group.classList.contains('open');
      groups.forEach(g => g.classList.remove('open'));
      if (!wasOpen) group.classList.add('open');
    });
  });
  document.addEventListener('click', function() {
    groups.forEach(g => g.classList.remove('open'));
  });
}

function renderPcPage(key, activeTab) {
  const data = pcPages[key];
  if (!data) return;
  const currentFile = `pc-${key}.html`;
  addOpenTab(currentFile);
  const config = resolvePcTabConfig(key);
  const resolvedActiveTab = activeTab || (config.listHeaders?.length ? "list" : "overview");
  const hidePagination = ["create", "edit"].includes(resolvedActiveTab) || (resolvedActiveTab === "overview" && !config.listHeaders?.length);

  const navMenu = pcMenu.map(group => {
    const isActive = group.items.some(item => item.file === currentFile);
    if (group.items.length === 1) {
      const item = group.items[0];
      return `<a class="top-nav-item${item.file === currentFile ? ' active' : ''}" href="${item.file}">${item.name}</a>`;
    }
    return `<div class="top-nav-group">
      <div class="top-nav-item${isActive ? ' active' : ''}">${group.group} <span class="top-nav-arrow">&#9662;</span></div>
      <div class="top-nav-dropdown">${group.items.map(item =>
        `<a class="top-nav-drop-item${item.file === currentFile ? ' active' : ''}" href="${item.file}">
          ${pcMenuIcons[item.name] ? `<span class="top-nav-drop-icon">${pcMenuIcons[item.name]}</span>` : ""}
          ${item.name}
        </a>`
      ).join('')}</div>
    </div>`;
  }).join('');

  document.body.innerHTML = `
    <div class="page-shell">
      <div class="layout">
        <nav class="top-nav">
          <div class="top-nav-brand">
            <div class="top-nav-logo">3</div>
            <div class="top-nav-brand-name">3PL运营平台</div>
          </div>
          <div class="top-nav-menu">${navMenu}</div>
          <div class="top-nav-right">
            <div class="top-nav-search">搜索单据号 / 客户 / 货主</div>
            <div class="user-bar">
              <span style="color:var(--pc-brand);font-size:13px;">消息 12</span>
              <span style="color:var(--pc-warn);font-size:13px;">预警 5</span>
              <span class="avatar">张</span>
              <span style="color:var(--pc-text);font-size:14px;">张经理</span>
            </div>
          </div>
        </nav>
        <section class="panel main-panel">
          ${renderWindowTabs(currentFile)}
          <div class="page-body page-body-hifi page-key-${key}">
<div class="content-layout">
              <div class="content-main">${renderPcTabContent(key, resolvedActiveTab)}</div>
            </div>
            ${!hidePagination ? renderPcPagination(0, 10) : ""}
          </div>
        </section>
      </div>
      ${renderModalMarkup()}
      ${renderDrawerMarkup()}
      ${renderToastMarkup()}
    </div>`;

  bindTopNavDropdowns();
  bindPcTabEvents(key);
  bindPcInnerTabSwitchEvents(key);
  bindModalEvents();
  bindDrawerEvents();
  bindNewProductRowActionEvents();
  bindInboundRowActionEvents();
  bindReturnApplyRowActionEvents();
  bindReturnApplyInRowActionEvents();
  bindOwnershipApplyRowActionEvents();
  bindStoreOrderCycleRowActionEvents();
  bindStoreOrderCycleCreateButton();
  bindInboundSubmitApproveEvents();
  bindReturnApplySubmitApproveEvents();
  bindInventoryPlanSubmitApproveEvents();
  bindInventoryPlanFormPageEvents();
  bindQualityReportEvents();
  bindReturnApplyInSubmitApproveEvents();
  bindOwnershipApplySubmitApproveEvents();
  bindDemandSubmitApproveEvents();
  bindNewProductApprovalEvents();
  bindNewProductApprovalFilterEvents();
  bindPcListEvents(key);
  bindPcFormFieldEvents();
  bindNewProductFormPageEvents();
  bindSideMenuSearch();
  bindMenuToggle();
  bindSubTabs();
  bindWindowTabEvents(currentFile);
  processPcTables();
}

function syncMiniPreviewScale() {
  const stage = document.querySelector(".phone-shell");
  const phone = document.querySelector(".phone");
  if (!stage || !phone) return;
  const shellWidth = 407;
  const shellHeight = 832;
  const availableWidth = Math.max(260, stage.clientWidth - 12);
  const availableHeight = Math.max(420, stage.clientHeight - 8);
  const scale = Math.min(1, availableWidth / shellWidth, availableHeight / shellHeight);
  phone.style.transform = `scale(${scale})`;
}

function bindMiniPreviewLayout() {
  syncMiniPreviewScale();
  if (!window.__miniPreviewResizeBound) {
    window.addEventListener("resize", syncMiniPreviewScale);
    window.__miniPreviewResizeBound = true;
  }
}

function renderMiniPage(key) {
  const data = miniPages[key];
  if (!data) return;
  const baseKey = getMiniStageGroupKey(key);
  const usePagedLayout = shouldUseMiniPagedLayout(key);
  const pageContent = typeof data.content === "function" ? data.content() : data.content;
  const miniLinks = miniMenu.map(item => `<a class="tab-link ${item.file === `mini-${baseKey}.html` ? 'primary-button' : 'ghost-button'}" href="${item.file}">${item.name}</a>`).join('');

  const hideOuterChrome = shouldHideMiniDemoChrome(key);
  const miniSplitCount = Object.entries(miniStageConfigs).reduce((n, [gk, st]) => n + st.filter(s => s.key !== gk).length, 0);
  document.body.innerHTML = `
    <div class="page-shell mini-preview-shell">
      <div class="hero mini-preview-hero">
        <h1>3PL运营平台多页面原型入口</h1>
        <p>本入口聚合了 PC 端和小程序端的多页面 HTML 原型。每个页面都可以单独打开，便于逐页评审、汇报截图和后续继续迭代。</p>
        <div class="chips"><div class="chip">PC端页面：${pcMenu.flatMap(group => group.items).length}</div><div class="chip">小程序页面：${miniMenu.length + miniSplitCount}</div><div class="chip">拆分步骤页：${miniSplitCount}</div><div class="chip">公共资源：styles.css + app.js</div></div>
        <div class="hero-actions"><a class="ghost-button" href="index.html">返回入口</a></div>
      </div>
      <div class="page-actions mini-preview-nav">${miniLinks}</div>
      <div class="phone-shell">
        <div class="phone">
          <div class="phone-screen page-mini-${key} ${usePagedLayout ? "mini-screen-paged" : ""}${shouldHideMiniTabbar(key) ? " no-tabbar" : ""}">
            <div class="phone-notch"></div>
            <div class="mini-system-bar">
              <div class="mini-system-time">9:41</div>
              <div class="mini-system-icons">
                <span class="mini-signal"></span>
                <span class="mini-wifi"></span>
                <span class="mini-battery"><span class="mini-battery-fill"></span></span>
              </div>
            </div>
            <div class="mini-header${isMiniListPage(key) ? " mini-header--with-action" : ""}">${shouldHideMiniTabbar(key) && key !== "home" ? '<a class="mini-back-btn" href="javascript:history.back()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' : ""}<div class="mini-header-center"><div class="mini-title">${data.title}</div>${data.desc ? `<div class="mini-sub">${data.desc}</div>` : ""}${(usePagedLayout || shouldHideMiniDemoChrome(key)) ? "" : renderMiniBadges(key)}</div>${isMiniListPage(key) ? `<a class="mini-header-action" href="${buildMiniPageFile(getMiniDocListDetailKey(key))}">+ 新增</a>` : ""}</div>
            ${renderMiniToastMarkup()}
            <div class="mini-content">${shouldHideMiniDemoChrome(key) ? "" : (usePagedLayout ? "" : renderMiniTip(key))}${renderMiniStageTabs(key)}${shouldHideMiniDemoChrome(key) ? "" : (usePagedLayout ? "" : `<div class="mini-flow-wrap">${buildFlowNavigator("mini", key)}</div>`)}${pageContent}${shouldHideMiniDemoChrome(key) ? "" : renderMiniJourney(key)}</div>
            ${renderMiniSheetMarkup()}
            ${shouldHideMiniTabbar(key) ? "" : `<div class="tabbar"><div class="${key === 'home' ? 'active' : ''}">首页</div><div class="${key === 'todo' ? 'active' : ''}">待办</div><div class="${['apply','inboundapply','returnapply','return','loss','ownershipapply'].includes(baseKey) ? 'active' : ''}">发起</div><div class="${['detail','transfer','inventory'].includes(baseKey) ? 'active' : ''}">单据</div><div class="${key === 'message' ? 'active' : ''}">我的</div></div>`}
            ${(isMiniListPage(key) || key === "inventory" || key === "todo" || key === "message") ? `<a class="mini-home-btn" href="mini-home.html">首页</a>` : ""}
            <div class="mini-home-indicator"></div>
          </div>
        </div>
      </div>
      ${hideOuterChrome ? "" : `<div class="footer-note mini-preview-foot">该多页面原型保留小程序端核心页面跳转结构，后续可继续补消息角标、审批弹窗、扫码、上传图片和定位能力。</div>`}
    </div>`;

  bindMiniInteractionEvents(key);
  bindMiniPreviewLayout();
}

function renderIndex() {
  const pcLinks = pcMenu.flatMap(group => group.items).map(item => `<a class="link-card" href="${item.file}"><div class="name">${item.name}</div><div class="desc">PC端页面原型，可单独打开演示和截图。</div></a>`).join('');
  const miniLinks = miniMenu.map(item => `<a class="link-card" href="${item.file}"><div class="name">${item.name}</div><div class="desc">小程序端页面原型，适合演示轻交互场景。</div></a>`).join('');
  const miniSplitItems = Object.entries(miniStageConfigs).flatMap(([groupKey, stages]) => stages
    .filter(item => item.key !== groupKey)
    .map((item) => {
      const parentTitle = miniPages[groupKey]?.title || "申请页面";
      return `<a class="link-card" href="${item.file}"><div class="name">${parentTitle}-${item.label}</div><div class="desc">小程序拆分后的独立步骤页，可单独打开演示真实业务步骤。</div></a>`;
    }));
  const miniSplitLinks = miniSplitItems.join('');
  const miniActualPageCount = miniMenu.length + miniSplitItems.length;
  document.body.innerHTML = `
    <div class="page-shell">
      <div class="hero">
        <h1>3PL运营平台多页面原型入口</h1>
        <p>本入口聚合了 PC 端和小程序端的多页面 HTML 原型。每个页面都可以单独打开，便于逐页评审、汇报截图和后续继续迭代。</p>
        <div class="chips"><div class="chip">PC端页面：${pcMenu.flatMap(group => group.items).length}</div><div class="chip">小程序页面：${miniActualPageCount}</div><div class="chip">拆分步骤页：${miniSplitItems.length}</div><div class="chip">公共资源：styles.css + app.js</div></div>
      </div>
      <div class="index-grid">
        <div class="section-card"><div class="section-head"><h3>PC端页面</h3><div class="muted">后台管理式布局</div></div><div class="link-list">${pcLinks}</div></div>
        <div class="section-card"><div class="section-head"><h3>小程序页面</h3><div class="muted">轻操作移动布局</div></div><div class="link-list">${miniLinks}</div></div>
        <div class="section-card"><div class="section-head"><h3>小程序拆分页</h3><div class="muted">基础信息页与商品录入页分开</div></div><div class="link-list">${miniSplitLinks}</div></div>
      </div>
      <div class="footer-note">建议演示顺序：PC端首页工作台 -> 客户要货单 -> 配送单 -> 退仓申请单 -> 财务协同 -> 接口日志 -> 小程序首页 -> 待办 -> 基础信息页 -> 商品录入页 -> 单据详情。</div>
    </div>`;
}

const pageType = document.body.dataset.pageType;
const pageKey = document.body.dataset.pageKey;
if (pageType === 'pc') {
  renderPcPage(pageKey);
} else if (pageType === 'mini') {
  renderMiniPage(pageKey);
} else {
  renderIndex();
}
