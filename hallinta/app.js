/* =====================================================================
   Nadiya Product Manager – sovelluksen toiminnot

   Mitä sovellus tekee:
     1. Kirjaa käyttäjän sisään Microsoft-tilillä (MSAL).
     2. Pienentää valitut kuvat puhelimessa (samalla sijaintitiedot poistuvat).
     3. Lähettää kuvat ja tuotekortin käyttäjän OneDriveen sovelluksen omaan
        kansioon:  saapuneet/<kansio>/kuva-1.jpg … ja viimeisenä tuote.json
     4. Myyty/poista/palauta-pyynnöt kirjoitetaan kansioon  toiminnot/
     5. Sivulla olevat tuotteet luetaan kotisivun tiedostosta ../products.json

   Windows-koneen NadiyaPublisher lukee kansiot ja julkaisee kotisivulle.
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.NPM_CONFIG || {};
  var TEXTS = window.NPM_TEXTS || {};
  var GRAPH = "https://graph.microsoft.com/v1.0/me/drive/special/approot";
  var GROUPS = ["naiset", "miehet", "korut"];
  var GROUP_TEXT = { naiset: "gWomen", miehet: "gMen", korut: "gJewel" };
  var SOLD_DAYS = 30;

  function $(id) { return document.getElementById(id); }

  /* ---------- Pienet apurit ---------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ei haittaa */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* ei haittaa */ } }
  };
  var session = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* ei haittaa */ } },
    del: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { /* ei haittaa */ } }
  };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Kieli ---------- */
  var lang = store.get("npm-lang") === "fi" ? "fi" : "fa";
  function t(key, vars) {
    var s = (TEXTS[lang] && TEXTS[lang][key]) || (TEXTS.fi && TEXTS.fi[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = t("dir");
    Array.prototype.forEach.call(document.querySelectorAll("[data-t]"), function (n) {
      n.textContent = t(n.getAttribute("data-t"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-t-ph]"), function (n) {
      n.placeholder = t(n.getAttribute("data-t-ph"));
    });
    var btn = $("langBtn");
    btn.textContent = t("otherLang");
    btn.lang = lang === "fa" ? "fi" : "fa";
    renderPhotos();
    if (state.listLoaded) renderLists();
    updateWho();
  }

  /* ---------- Näkymät ---------- */
  var VIEWS = ["viewLoading", "viewSetup", "viewLogin", "viewList", "viewNew"];
  function show(view) {
    VIEWS.forEach(function (v) { $(v).hidden = v !== view; });
    window.scrollTo(0, 0);
  }
  var toastTimer = null;
  function toast(text) {
    var n = $("toast");
    n.textContent = text;
    n.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { n.hidden = true; }, 5000);
  }
  function confirmDialog(title, text) {
    return new Promise(function (resolve) {
      var dlg = $("confirmDlg");
      $("confirmTitle").textContent = title;
      $("confirmText").textContent = text || "";
      function done(answer) {
        $("confirmYes").removeEventListener("click", yes);
        $("confirmNo").removeEventListener("click", no);
        dlg.removeEventListener("cancel", no);
        if (dlg.open) dlg.close();
        resolve(answer);
      }
      function yes() { done(true); }
      function no() { done(false); }
      $("confirmYes").addEventListener("click", yes);
      $("confirmNo").addEventListener("click", no);
      dlg.addEventListener("cancel", no);
      dlg.showModal();
    });
  }

  /* =====================================================================
     KIRJAUTUMINEN (Microsoft-tili, MSAL)
     ===================================================================== */
  var pca = null;
  var account = null;

  function isInteractionRequired(err) {
    return Boolean(window.msal && window.msal.InteractionRequiredAuthError &&
      err instanceof window.msal.InteractionRequiredAuthError);
  }

  async function initAuth() {
    pca = await window.msal.createStandardPublicClientApplication({
      auth: {
        clientId: CFG.clientId,
        authority: CFG.authority,
        redirectUri: new URL("redirect.html", window.location.href.split(/[?#]/)[0]).href
      },
      cache: { cacheLocation: "localStorage" }
    });

    var result = null;
    var error = null;
    try { result = await pca.handleRedirectPromise(); } catch (e) { error = e; }

    var accounts = pca.getAllAccounts();
    account = (result && result.account) || accounts[0] || null;
    if (account) {
      pca.setActiveAccount(account);
      store.set("npm-user", account.username || "");
      session.del("npm-tried");
      return "in";
    }

    /* Ei kirjautumista muistissa. Jos käyttäjä on kirjautunut aiemmin, yritetään
       kerran hiljaa: Microsoft palauttaa suoraan takaisin, jos istunto on voimassa. */
    var hint = store.get("npm-user");
    if (!error && hint && !session.get("npm-tried")) {
      session.set("npm-tried", "1");
      await pca.loginRedirect({ scopes: CFG.scopes, loginHint: hint, prompt: "none" });
      return "redirecting";
    }
    return error && !isInteractionRequired(error) ? "error" : "out";
  }

  async function login() {
    $("loginMsg").textContent = "";
    try {
      var req = { scopes: CFG.scopes };
      var hint = store.get("npm-user");
      if (hint) req.loginHint = hint;
      await pca.loginRedirect(req);
    } catch (e) {
      $("loginMsg").textContent = t("loginFail");
    }
  }

  async function logout() {
    store.del("npm-user");
    try {
      /* Kirjataan ulos vain tästä sovelluksesta; Microsoft-tili pysyy muuten ennallaan */
      await pca.logoutRedirect({ account: account, onRedirectNavigate: function () { return false; } });
    } catch (e) { /* ei haittaa */ }
    account = null;
    state.listLoaded = false;
    show("viewLogin");
  }

  async function getToken() {
    try {
      var r = await pca.acquireTokenSilent({ scopes: CFG.scopes, account: account });
      return r.accessToken;
    } catch (e) {
      if (isInteractionRequired(e)) {
        await pca.acquireTokenRedirect({ scopes: CFG.scopes, account: account });
        throw new Error("redirecting");
      }
      throw e;
    }
  }

  function updateWho() {
    $("whoText").textContent = account ? t("signedInAs") + " " + (account.username || account.name || "") : "";
  }

  /* =====================================================================
     ONEDRIVE (Microsoft Graph, vain sovelluksen oma kansio)
     ===================================================================== */
  function itemUrl(path) {
    return GRAPH + ":/" + path.split("/").map(encodeURIComponent).join("/");
  }

  async function graph(method, url, opts) {
    opts = opts || {};
    var token = await getToken();
    var headers = { Authorization: "Bearer " + token };
    var body;
    if (opts.json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.json);
    } else if (opts.blob) {
      headers["Content-Type"] = opts.type || "application/octet-stream";
      body = opts.blob;
    }
    var res = await fetch(url, { method: method, headers: headers, body: body });
    if (res.status === 404 && (method === "GET" || method === "DELETE")) return null;
    if (res.status === 409 && opts.conflictOk) return true;
    if (!res.ok) {
      var code = "";
      try { var eb = await res.json(); code = (eb && eb.error && eb.error.code) || ""; } catch (e) { /* ei runkoa */ }
      var err = new Error("graph " + res.status + (code ? " " + code : ""));
      err.status = res.status;
      err.code = code;
      throw err;
    }
    if (res.status === 204) return true;
    try { return await res.json(); } catch (e) { return true; }
  }

  var ensured = {};
  async function ensureFolder(parentPath, name) {
    var key = parentPath + "/" + name;
    if (ensured[key]) return;
    var url = parentPath ? itemUrl(parentPath) + ":/children" : GRAPH + "/children";
    await graph("POST", url, {
      json: { name: name, folder: {}, "@microsoft.graph.conflictBehavior": "fail" },
      conflictOk: true
    });
    ensured[key] = true;
  }

  async function listChildren(path) {
    var url = itemUrl(path) + ":/children?$select=name,folder,file,createdDateTime&$top=200";
    var items = [];
    while (url) {
      var data = await graph("GET", url);
      if (!data) break;
      items = items.concat(data.value || []);
      url = data["@odata.nextLink"] || null;
    }
    return items;
  }

  function uploadFile(path, blob, type) {
    return graph("PUT", itemUrl(path) + ":/content", { blob: blob, type: type });
  }
  function deleteItem(path) {
    return graph("DELETE", itemUrl(path));
  }

  /* =====================================================================
     LUONNOKSET (puhelimen oma muisti, IndexedDB)
     Tuote tallennetaan tänne ennen lähetystä, joten katkennut lähetys ei hävitä sitä.
     ===================================================================== */
  var dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise(function (resolve, reject) {
        var req = window.indexedDB.open("nadiya-pm", 1);
        req.onupgradeneeded = function () { req.result.createObjectStore("drafts", { keyPath: "kansio" }); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    }
    return dbPromise;
  }
  function draftOp(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction("drafts", mode);
        var req = fn(tx.objectStore("drafts"));
        tx.oncomplete = function () { resolve(req && req.result); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error); };
      });
    });
  }
  var drafts = {
    all: function () { return draftOp("readonly", function (s) { return s.getAll(); }).catch(function () { return []; }); },
    put: function (d) { return draftOp("readwrite", function (s) { return s.put(d); }).catch(function () { return null; }); },
    del: function (k) { return draftOp("readwrite", function (s) { return s.delete(k); }).catch(function () { return null; }); }
  };

  /* Pieni muistilista lähetetyistä: pikkukuva ja tekstin alku Odottaa-listaa varten */
  function sentMemo() {
    try { return JSON.parse(store.get("npm-sent") || "{}") || {}; } catch (e) { return {}; }
  }
  function rememberSent(d) {
    var memo = sentMemo();
    memo[d.kansio] = { thumb: d.thumb, teksti: (d.kuvaus || "").slice(0, 60), ryhma: d.ryhma };
    var keys = Object.keys(memo).sort();
    while (keys.length > 40) delete memo[keys.shift()];
    store.set("npm-sent", JSON.stringify(memo));
  }

  /* =====================================================================
     KUVAT: pienennys puhelimessa
     Uusi JPEG piirretään kankaalle, joten alkuperäisen kuvan tiedot
     (sijainti, laite, aika) eivät siirry mukaan.
     ===================================================================== */
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("image")); };
      img.src = url;
    });
  }
  function drawScaled(img, maxSide, quality, asDataUrl) {
    var w = img.naturalWidth, h = img.naturalHeight;
    var scale = Math.min(1, maxSide / Math.max(w, h));
    var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    var canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    if (asDataUrl) return Promise.resolve(canvas.toDataURL("image/jpeg", quality));
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) { if (b) resolve(b); else reject(new Error("blob")); }, "image/jpeg", quality);
    });
  }
  async function processImage(file) {
    var loaded = await loadImage(file);
    try {
      if (!loaded.img.naturalWidth) throw new Error("image");
      var blob = await drawScaled(loaded.img, CFG.imageMaxSide || 1600, CFG.imageQuality || 0.85, false);
      var thumb = await drawScaled(loaded.img, 120, 0.7, true);
      return { blob: blob, thumb: thumb, url: URL.createObjectURL(blob) };
    } finally {
      URL.revokeObjectURL(loaded.url);
    }
  }

  /* =====================================================================
     UUSI TUOTE -lomake
     ===================================================================== */
  var state = { photos: [], busy: false, listLoaded: false, data: null };

  function renderPhotos() {
    var list = $("photoList");
    if (!list) return;
    list.textContent = "";
    state.photos.forEach(function (p, i) {
      var li = el("li", "photo");
      var img = el("img");
      img.src = p.url;
      img.alt = "";
      li.appendChild(img);
      if (i === 0) li.appendChild(el("span", "photo-main", t("mainPhoto")));

      var tools = el("div", "photo-tools");
      function tool(symbol, label, fn, disabled) {
        var b = el("button", "photo-btn", symbol);
        b.type = "button";
        b.setAttribute("aria-label", label);
        b.disabled = Boolean(disabled);
        b.addEventListener("click", fn);
        tools.appendChild(b);
      }
      tool("‹", t("moveEarlier"), function () { movePhoto(i, -1); }, i === 0);
      tool("×", t("removePhoto"), function () { removePhoto(i); });
      tool("›", t("moveLater"), function () { movePhoto(i, 1); }, i === state.photos.length - 1);
      li.appendChild(tools);
      list.appendChild(li);
    });
  }
  function movePhoto(i, d) {
    var j = i + d;
    if (j < 0 || j >= state.photos.length) return;
    var tmp = state.photos[i];
    state.photos[i] = state.photos[j];
    state.photos[j] = tmp;
    renderPhotos();
  }
  function removePhoto(i) {
    var p = state.photos.splice(i, 1)[0];
    if (p) URL.revokeObjectURL(p.url);
    renderPhotos();
  }

  async function addPhotos(files) {
    var max = CFG.maxImages || 10;
    var msg = $("photoMsg");
    msg.textContent = t("preparing");
    $("formError").textContent = "";
    for (var i = 0; i < files.length; i++) {
      if (state.photos.length >= max) { msg.textContent = t("errTooMany", { n: max }); renderPhotos(); return; }
      var f = files[i];
      try {
        if (f.type && f.type.indexOf("image/") !== 0) throw new Error("type");
        state.photos.push(await processImage(f));
        renderPhotos();
      } catch (e) {
        msg.textContent = t("errImage", { name: f.name || "" });
        return;
      }
    }
    msg.textContent = "";
  }

  /* Hyväksyy myös persialaiset ja arabialaiset numerot sekä pilkun desimaalierottimena */
  function parsePrice(text) {
    var s = String(text || "").trim()
      .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); })
      .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
      .replace(/[€\s]/g, "")
      .replace(/[,٫]/g, ".");
    if (!s) return { ok: true, value: null };
    if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return { ok: false };
    return { ok: true, value: Number(s) };
  }

  function newFolderName() {
    var d = new Date();
    var rnd = new Uint8Array(2);
    window.crypto.getRandomValues(rnd);
    var hex = Array.prototype.map.call(rnd, function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("");
    return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" +
      pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + "-" + hex;
  }

  function resetForm() {
    state.photos.forEach(function (p) { URL.revokeObjectURL(p.url); });
    state.photos = [];
    $("newForm").reset();
    $("formError").textContent = "";
    $("photoMsg").textContent = "";
    renderPhotos();
  }

  function setProgress(text, fraction) {
    $("progressText").textContent = text;
    $("progressFill").style.width = Math.round(fraction * 100) + "%";
  }

  /* Lähettää yhden luonnoksen OneDriveen. Tuotekortti (tuote.json) menee viimeisenä:
     NadiyaPublisher käsittelee vain kansiot, joissa se on. */
  async function uploadDraft(d) {
    var total = d.kuvat.length + 1;
    await ensureFolder("", "saapuneet");
    await ensureFolder("saapuneet", d.kansio);
    var names = [];
    for (var i = 0; i < d.kuvat.length; i++) {
      setProgress(t("sending", { i: i + 1, n: d.kuvat.length }), i / total);
      var name = "kuva-" + (i + 1) + ".jpg";
      await uploadFile("saapuneet/" + d.kansio + "/" + name, d.kuvat[i], "image/jpeg");
      names.push(name);
    }
    setProgress(t("sendingCard"), d.kuvat.length / total);
    var card = {
      versio: 1,
      kansio: d.kansio,
      luotu: d.luotu,
      ryhma: d.ryhma,
      hinta: d.hinta,
      kuvaus: d.kuvaus,
      kieli: d.kieli,
      kuvat: names
    };
    await uploadFile("saapuneet/" + d.kansio + "/tuote.json",
      new Blob([JSON.stringify(card, null, 2)], { type: "application/json" }), "application/json");
    setProgress(t("sent"), 1);
  }

  async function sendDraft(d) {
    if (state.busy) return;
    state.busy = true;
    show("viewNew");
    $("newForm").hidden = true;
    $("backBtn").hidden = true;
    $("progress").hidden = false;
    setProgress(t("preparing"), 0);
    var ok = false;
    try {
      if (navigator.onLine === false) throw new Error("offline");
      await ensureAppRoot();
      await uploadDraft(d);
      rememberSent(d);
      await drafts.del(d.kansio);
      ok = true;
    } catch (e) {
      if (e && e.message === "redirecting") return;   // siirrytään kirjautumaan; luonnos on tallessa
    } finally {
      state.busy = false;
      $("newForm").hidden = false;
      $("backBtn").hidden = false;
      $("progress").hidden = true;
    }
    if (ok) resetForm();
    show("viewList");
    toast(ok ? t("sent") + " " + t("pendingInfo")
             : (navigator.onLine === false ? t("offline") + " " : "") + t("sendFail"));
    loadLists();
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (state.busy) return;
    var err = $("formError");
    err.textContent = "";
    var group = (document.querySelector("input[name=ryhma]:checked") || {}).value;
    var text = $("descInput").value.trim();
    var price = parsePrice($("priceInput").value);

    if (!state.photos.length) { err.textContent = t("errPhotos"); return; }
    if (GROUPS.indexOf(group) === -1) { err.textContent = t("errGroup"); return; }
    if (!price.ok) { err.textContent = t("errPrice"); return; }
    if (text.length < 3) { err.textContent = t("errDesc"); return; }

    var draft = {
      kansio: newFolderName(),
      luotu: new Date().toISOString(),
      ryhma: group,
      hinta: price.value,
      kuvaus: text,
      kieli: lang,
      kuvat: state.photos.map(function (p) { return p.blob; }),
      thumb: state.photos[0].thumb
    };
    await drafts.put(draft);
    await sendDraft(draft);
  }

  /* =====================================================================
     OMAT TUOTTEET -lista
     ===================================================================== */
  function daysSince(text) {
    var ms = Date.parse(text);
    return isNaN(ms) ? Infinity : (Date.now() - ms) / 86400000;
  }
  function folderDate(name) {
    var m = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(name || "");
    return m ? m[3] + "." + m[2] + "." + m[1] + " " + m[4] + ":" + m[5] : name;
  }
  function safeImagePath(p) {
    return typeof p === "string" && /^images\/[A-Za-z0-9_\-./]+$/.test(p) && p.indexOf("..") === -1 ? "../" + p : "";
  }

  async function loadSiteProducts() {
    try {
      var res = await fetch("../products.json", { cache: "no-store" });
      if (!res.ok) return [];
      var data = await res.json();
      return Array.isArray(data.products) ? data.products : [];
    } catch (e) { return []; }
  }

  function parseActions(items) {
    var map = {};
    items.forEach(function (it) {
      var m = /^(myyty|myynnissa|poista)--(.+)--(\d{8}T\d{6})\.json$/.exec(it.name || "");
      if (!m) return;
      if (!map[m[2]] || map[m[2]].aika < m[3]) map[m[2]] = { toiminto: m[1], aika: m[3], tiedosto: it.name };
    });
    return map;
  }

  /* Sovelluskansio luodaan OneDriveen ensimmäisellä kerralla, kun sitä pyydetään */
  var approotReady = false;
  async function ensureAppRoot() {
    if (approotReady) return;
    await graph("GET", GRAPH + "?$select=id,name");
    approotReady = true;
  }

  async function loadLists() {
    var msg = $("listMsg");
    msg.textContent = state.listLoaded ? "" : t("loading");
    try {
      await ensureAppRoot();
      var results = await Promise.all([
        drafts.all(),
        listChildren("saapuneet"),
        listChildren("virheelliset"),
        listChildren("toiminnot"),
        loadSiteProducts()
      ]);
      state.data = {
        drafts: results[0],
        pending: results[1].filter(function (i) { return i.folder; }),
        errors: results[2].filter(function (i) { return i.folder; }),
        actions: parseActions(results[3]),
        site: results[4]
      };
      state.listLoaded = true;
      msg.textContent = "";
      renderLists();
    } catch (e) {
      if (e && e.message === "redirecting") return;
      msg.textContent = t("loadFail") + " [" + ((e && e.message) || "?") + "]";
    }
  }

  function row(opts) {
    var li = el("li", "item");
    var pic = el("div", "item-pic");
    if (opts.thumb) {
      var img = el("img");
      img.src = opts.thumb;
      img.alt = "";
      img.loading = "lazy";
      pic.appendChild(img);
    }
    li.appendChild(pic);
    var main = el("div", "item-main");
    var title = el("p", "item-title", opts.title);
    title.dir = "auto";
    main.appendChild(title);
    var meta = el("p", "item-meta");
    meta.appendChild(el("span", "chip " + opts.chipClass, opts.chip));
    if (opts.sub) {
      var sub = el("span", "item-sub", opts.sub);
      sub.dir = "auto";
      meta.appendChild(sub);
    }
    main.appendChild(meta);
    if (opts.note) main.appendChild(el("p", "item-note", opts.note));
    var actions = el("div", "item-actions");
    (opts.actions || []).forEach(function (a) {
      var b = el("button", "btn small" + (a.danger ? " danger" : ""), a.label);
      b.type = "button";
      b.addEventListener("click", function () { runAction(b, a.run); });
      actions.appendChild(b);
    });
    if (actions.children.length) main.appendChild(actions);
    li.appendChild(main);
    return li;
  }

  async function runAction(button, fn) {
    if (button.disabled) return;
    button.disabled = true;
    try {
      await fn();
    } catch (e) {
      if (!(e && e.message === "redirecting")) toast(t("actionFail"));
    } finally {
      button.disabled = false;
    }
  }

  function stamp() {
    var d = new Date();
    return "" + d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds());
  }
  async function requestAction(kind, product) {
    await ensureFolder("", "toiminnot");
    var name = kind + "--" + product.id + "--" + stamp() + ".json";
    var body = { versio: 1, toiminto: kind, tuote: product.id, aika: new Date().toISOString() };
    await uploadFile("toiminnot/" + name,
      new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }), "application/json");
    toast(t("saved"));
    await loadLists();
  }

  function section(root, titleKey, items) {
    if (!items.length) return;
    root.appendChild(el("h3", "sec-title", t(titleKey) + " (" + items.length + ")"));
    var ul = el("ul", "items");
    items.forEach(function (li) { ul.appendChild(li); });
    root.appendChild(ul);
  }

  function renderLists() {
    var root = $("lists");
    var d = state.data;
    if (!root || !d) return;
    root.textContent = "";
    var memo = sentMemo();
    var draftNames = {};

    /* 1. Lähettämättä */
    section(root, "secDrafts", d.drafts.map(function (dr) {
      draftNames[dr.kansio] = true;
      return row({
        thumb: dr.thumb, title: dr.kuvaus, chip: t("stDraft"), chipClass: "c-draft",
        sub: t(GROUP_TEXT[dr.ryhma] || "group"),
        actions: [
          { label: t("actSend"), run: function () { return sendDraft(dr); } },
          { label: t("actDelete"), danger: true, run: async function () {
              if (!(await confirmDialog(t("confirmDeleteTitle"), t("confirmDeleteLocal")))) return;
              await deleteItem("saapuneet/" + dr.kansio);
              await drafts.del(dr.kansio);
              toast(t("deleted"));
              await loadLists();
            } }
        ]
      });
    }));

    /* 2. Odottaa julkaisua */
    var pending = d.pending.filter(function (f) { return !draftNames[f.name]; })
      .sort(function (a, b) { return a.name < b.name ? 1 : -1; });
    section(root, "secPending", pending.map(function (f) {
      var m = memo[f.name] || {};
      return row({
        thumb: m.thumb, title: m.teksti || folderDate(f.name), chip: t("stPending"), chipClass: "c-pending",
        sub: m.ryhma ? t(GROUP_TEXT[m.ryhma] || "group") : "",
        note: t("pendingInfo"),
        actions: [{ label: t("actDelete"), danger: true, run: async function () {
          if (!(await confirmDialog(t("confirmDeleteTitle"), t("confirmDeleteLocal")))) return;
          await deleteItem("saapuneet/" + f.name);
          toast(t("deleted"));
          await loadLists();
        } }]
      });
    }));

    /* 3. Vaatii korjausta */
    section(root, "secErrors", d.errors.map(function (f) {
      var m = memo[f.name] || {};
      return row({
        thumb: m.thumb, title: m.teksti || folderDate(f.name), chip: t("stError"), chipClass: "c-error",
        note: t("errorInfo"),
        actions: [{ label: t("actDelete"), danger: true, run: async function () {
          if (!(await confirmDialog(t("confirmDeleteTitle"), t("confirmDeleteLocal")))) return;
          await deleteItem("virheelliset/" + f.name);
          toast(t("deleted"));
          await loadLists();
        } }]
      });
    }));

    /* 4. Sivulla */
    var site = d.site.filter(function (p) {
      return p && typeof p.id === "string" && !(p.sold && daysSince(p.sold) > SOLD_DAYS);
    }).sort(function (a, b) {
      return (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0);
    });
    root.appendChild(el("h3", "sec-title", t("secLive") + " (" + site.length + ")"));
    if (!site.length) {
      root.appendChild(el("p", "empty", t("emptyLive")));
      return;
    }
    var ul = el("ul", "items");
    site.forEach(function (p) {
      var name = (p.name && (p.name[lang] || p.name.fi || p.name.fa)) || p.id;
      var first = (p.images || [])[0];
      var waiting = d.actions[p.id];
      var actions = [];
      var note = "";
      if (waiting) {
        note = t(waiting.toiminto === "myyty" ? "waitSold" : waiting.toiminto === "myynnissa" ? "waitUnsold" : "waitDelete");
        actions.push({ label: t("actCancel"), run: async function () {
          await deleteItem("toiminnot/" + waiting.tiedosto);
          await loadLists();
        } });
      } else {
        if (p.sold) {
          actions.push({ label: t("actUnsold"), run: function () { return requestAction("myynnissa", p); } });
        } else {
          actions.push({ label: t("actSold"), run: async function () {
            if (await confirmDialog(t("confirmSoldTitle"), t("confirmSoldText"))) await requestAction("myyty", p);
          } });
        }
        actions.push({ label: t("actDelete"), danger: true, run: async function () {
          if (await confirmDialog(t("confirmDeleteTitle"), t("confirmDeleteLive"))) await requestAction("poista", p);
        } });
      }
      var price = typeof p.price === "number" ? p.price + " €" : "";
      ul.appendChild(row({
        thumb: safeImagePath(first && (first.small || first.large || first)),
        title: name,
        chip: p.sold ? t("stSold") : t("stLive"),
        chipClass: p.sold ? "c-sold" : "c-live",
        sub: [p.id, price].filter(Boolean).join(" · "),
        note: note,
        actions: actions
      }));
    });
    root.appendChild(ul);
  }

  /* =====================================================================
     KÄYNNISTYS
     ===================================================================== */
  function bind() {
    $("langBtn").addEventListener("click", function () {
      lang = lang === "fa" ? "fi" : "fa";
      store.set("npm-lang", lang);
      applyLang();
    });
    $("loginBtn").addEventListener("click", login);
    $("logoutBtn").addEventListener("click", logout);
    $("newBtn").addEventListener("click", function () { show("viewNew"); });
    $("backBtn").addEventListener("click", function () { show("viewList"); });
    $("refreshBtn").addEventListener("click", loadLists);
    $("newForm").addEventListener("submit", onSubmit);
    $("photoInput").addEventListener("change", function (ev) {
      var files = Array.prototype.slice.call(ev.target.files || []);
      ev.target.value = "";
      if (files.length) addPhotos(files);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && account && !state.busy && !$("viewList").hidden) loadLists();
    });
  }

  async function start() {
    bind();
    applyLang();

    if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* toimii ilmankin */ });
    }

    if (!CFG.clientId || !window.msal) { show("viewSetup"); return; }

    var status;
    try { status = await initAuth(); } catch (e) { status = "error"; }
    if (status === "redirecting") return;
    if (status !== "in") {
      show("viewLogin");
      if (status === "error") $("loginMsg").textContent = t("loginFail");
      return;
    }
    updateWho();
    show("viewList");
    loadLists();
  }

  start();
})();
