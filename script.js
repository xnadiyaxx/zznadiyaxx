/* Nadiya Boutique – sivun toiminnot.
   Tuotteet ovat products.js-tiedostossa; tätä tiedostoa ei tarvitse muokata
   tuotteita lisättäessä. */
(function () {
  "use strict";

  /* ---------- Vuosiluku alatunnisteeseen ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobiilivalikko ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("paavalikko");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Valikon aktiivinen kohta vierityksen mukaan ---------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];
  if ("IntersectionObserver" in window && navLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) {
            a.setAttribute("aria-current", "true");
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    navLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) observer.observe(target);
    });
  }

  /* ---------- Sähköpostiosoite (kootaan vasta selaimessa) ---------- */
  var emailLink = document.getElementById("emailLink");
  var EMAIL = "";
  if (emailLink) {
    EMAIL = emailLink.dataset.user + "@" + emailLink.dataset.domain;
    emailLink.href = "mailto:" + EMAIL;
    emailLink.textContent = EMAIL;
  }

  /* ---------- Puhelinnumeron kopiointi ---------- */
  var copyBtn = document.getElementById("copyPhone");
  var copyStatus = document.getElementById("copyStatus");
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function showCopied(ok) {
    if (!copyStatus) return;
    copyStatus.textContent = ok
      ? "Numero kopioitu. / Number copied. / شماره کپی شد."
      : "Kopiointi ei onnistunut – valitse numero ja kopioi se käsin.";
    window.setTimeout(function () { copyStatus.textContent = ""; }, 4000);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.dataset.copy;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { showCopied(true); },
          function () { showCopied(fallbackCopy(text)); }
        );
      } else {
        showCopied(fallbackCopy(text));
      }
    });
  }

  /* ---------- Videon tekstitys (fa + fi + en) ----------
     Rivit jaetaan tasaisesti videon keston mukaan. */
  var lines = [
    { fa: "سلام.", fi: "Hei.", en: "Hello." },
    { fa: "نادیا هستم.", fi: "Olen Nadiya.", en: "I am Nadiya." },
    { fa: "خوش آمدید به صفحه مه!", fi: "Tervetuloa sivulleni!", en: "Welcome to my page!" },
    { fa: "اینجا تنها یک فروشگاه کالای افغانستانی نیست.",
      fi: "Tämä ei ole vain afganistanilaisten tuotteiden kauppa.",
      en: "This is not just a store of Afghan products." },
    { fa: "نمایندهٔ کوچکی هستم از هنرهای بزرگ زنان سرزمینم افغانستان.",
      fi: "Olen pieni edustaja maani Afganistanin naisten suuresta taiteesta.",
      en: "I am a small representative of the great art of the women of my homeland, Afghanistan." },
    { fa: "زنانی که در سایهٔ ناعدالتی با سوزن و تارهایشان هنرشان را فریاد می‌زنند.",
      fi: "Naiset, jotka epäoikeudenmukaisuuden varjossa huutavat taiteensa neulan ja langan avulla.",
      en: "Women who, under the shadow of injustice, cry out their art with needles and threads." },
    { fa: "و استقلال و قوت درونی شان را حفظ می‌کنند.",
      fi: "Ja silti he säilyttävät sisäisen vahvuutensa ja itsenäisyytensä.",
      en: "And they still preserve their inner strength and independence." },
    { fa: "بیایید هر یک نماینده‌ای باشیم با به نمایش گذاشتن هنر این زنان قهرمان.",
      fi: "Olkaamme jokainen edustaja näyttämällä näiden sankarinaisten taidetta.",
      en: "Let us each be a representative by showcasing the art of these heroic women." },
    { fa: "ما هر یک شاید وظیفه‌ای داشته باشیم در قبال حمایت از این هنر.",
      fi: "Meillä jokaisella voi olla oma tehtävä tämän taiteen tukemisessa.",
      en: "Each of us may have a responsibility in supporting this art." },
    { fa: "لباس افغانستانی تنها یک پوشاک نیست.",
      fi: "Afganistanilainen puku ei ole vain vaate.",
      en: "Afghan clothing is not just apparel." },
    { fa: "جلوه‌ای از شکوه، اصالت و فرهنگ افغانستان است.",
      fi: "Se on loiston, aitouden ja Afganistanin kulttuurin heijastus.",
      en: "It is a reflection of the splendor, authenticity, and culture of Afghanistan." },
    { fa: "بیایید با پوشیدن هر لباس سنتی افغانستانی شکوه و فرهنگ افغانستان را به جهانیان نشان بدهیم.",
      fi: "Tuodaan Afganistanin loisto ja kulttuuri esiin maailmalle pukeutumalla perinteisiin afganistanilaisiin asuihin.",
      en: "Let us showcase Afghanistan’s splendor and culture to the world by wearing traditional Afghan garments." },
    { fa: "تشکر از این‌که مرا حمایت می‌کنین و همراه من هستین.",
      fi: "Kiitos, että tuette minua ja kuljette rinnallani.",
      en: "Thank you for supporting me and walking beside me." }
  ];

  var video = document.getElementById("nadiyaVideo");
  var subFa = document.querySelector(".subs .sub-fa");
  var subFi = document.querySelector(".subs .sub-fi");
  var subEn = document.querySelector(".subs .sub-en");
  if (video && subFa && subFi && subEn) {
    var FALLBACK_DURATION = 95; // sekuntia, jos videon kestoa ei saada
    var currentLine = -1;
    var showLine = function (i) {
      if (i === currentLine) return;
      currentLine = i;
      subFa.textContent = lines[i].fa;
      subFi.textContent = lines[i].fi;
      subEn.textContent = lines[i].en;
    };
    var onTick = function () {
      var total = (isFinite(video.duration) && video.duration > 0) ? video.duration : FALLBACK_DURATION;
      var i = Math.floor((video.currentTime || 0) / (total / lines.length));
      showLine(Math.max(0, Math.min(lines.length - 1, i)));
    };
    showLine(0);
    ["loadedmetadata", "timeupdate", "seeked", "play"].forEach(function (ev) {
      video.addEventListener(ev, onTick);
    });
  }

  /* =====================================================================
     TUOTTEET: ryhmät, uusimmat ensin, valinta ja kysely
     Tuotetiedot tulevat products.js-tiedostosta (window.NADIYA_PRODUCTS).
     ===================================================================== */
  var SITE_URL = "https://www.nadiya.fi/";
  var PHONE = "358415863866";        // WhatsApp ja tekstiviesti, ilman plus-merkkiä
  var WHATSAPP_ENABLED = true;       // false = WhatsApp-nappi piiloon
  var NEW_DAYS = 30;                 // "Uusi"-merkki näkyy näin monta päivää
  var SOLD_DAYS = 30;                // myyty tuote näkyy näin monta päivää
  var MIN_VISIBLE = 8;               // vähintään näin monta tuotetta näkyy ryhmässä heti
  var STORAGE_KEY = "nadiya-valitut";

  var GROUPS = [
    { key: "naiset", fi: "Vaatteet naisille", en: "Women’s clothing", fa: "لباس زنانه" },
    { key: "miehet", fi: "Vaatteet miehille", en: "Men’s clothing", fa: "لباس مردانه" },
    { key: "korut", fi: "Korut", en: "Jewellery", fa: "زیورآلات" }
  ];

  var groupsRoot = document.getElementById("productGroups");
  var dialog = document.getElementById("productDialog");
  var inquiry = document.getElementById("inquiryDialog");
  var bar = document.getElementById("selectionBar");
  var DAY = 24 * 60 * 60 * 1000;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function langSpan(text, lang, className) {
    var s = el("span", className || "", text);
    s.lang = lang;
    if (lang === "fa") s.dir = "rtl";
    return s;
  }
  function daysSince(dateText) {
    var t = Date.parse(dateText);
    if (isNaN(t)) return Infinity;
    return (Date.now() - t) / DAY;
  }
  function imageOf(p, i, size) {
    var img = (p.images || [])[i];
    if (!img) return "";
    if (typeof img === "string") return img;
    return img[size] || img.large || img.small || "";
  }
  function priceText(p) {
    if (typeof p.price === "number" && isFinite(p.price)) {
      return new Intl.NumberFormat("fi-FI").format(p.price) + " €";
    }
    if (typeof p.price === "string" && p.price.trim()) return p.price;
    return "Kysy hintaa / Ask for price";
  }
  function isSold(p) { return Boolean(p.sold); }
  function isNew(p) { return !isSold(p) && daysSince(p.published) <= NEW_DAYS; }

  /* Vain kelvolliset tuotteet; yli 30 päivää sitten myydyt jäävät pois */
  var products = (Array.isArray(window.NADIYA_PRODUCTS) ? window.NADIYA_PRODUCTS : []).filter(function (p) {
    if (!p || typeof p.id !== "string" || !p.name || !(p.images || []).length) return false;
    if (isSold(p) && daysSince(p.sold) > SOLD_DAYS) return false;
    return true;
  });
  var byId = {};
  products.forEach(function (p) { byId[p.id] = p; });

  function sortGroup(list) {
    return list.slice().sort(function (a, b) {
      if (isSold(a) !== isSold(b)) return isSold(a) ? 1 : -1;       // myydyt loppuun
      var da = Date.parse(isSold(a) ? a.sold : a.published) || 0;
      var db = Date.parse(isSold(b) ? b.sold : b.published) || 0;
      return db - da;                                               // uusin ensin
    });
  }

  /* ---------- Valinnat (muistetaan tässä selaimessa) ---------- */
  var selected = [];
  try {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      selected = saved.filter(function (id) { return byId[id] && !isSold(byId[id]); });
    }
  } catch (err) { selected = []; }

  function saveSelection() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch (err) { /* ei haittaa */ }
  }
  function isSelected(id) { return selected.indexOf(id) !== -1; }
  function setSelected(id, on) {
    var i = selected.indexOf(id);
    if (on && i === -1) selected.push(id);
    if (!on && i !== -1) selected.splice(i, 1);
    saveSelection();
    updateSelectionUi();
  }

  function updateSelectionUi() {
    Array.prototype.forEach.call(document.querySelectorAll(".product-pick input"), function (box) {
      var on = isSelected(box.value);
      box.checked = on;
      box.closest(".product-card").classList.toggle("is-selected", on);
    });
    var n = selected.length;
    if (bar) {
      bar.hidden = n === 0;
      document.body.classList.toggle("has-selection", n > 0);
      document.getElementById("selectionCount").textContent =
        n === 1 ? "1 tuote valittu" : n + " tuotetta valittu";
    }
    if (dialog && dialog.open && dialog.dataset.id) updateDialogPick(byId[dialog.dataset.id]);
    if (inquiry && inquiry.open) {
      if (n === 0) inquiry.close(); else renderInquiry();
    }
  }

  /* ---------- Ryhmät ja kortit ---------- */
  function buildCard(p) {
    var li = el("li", "product-item");
    var card = el("article", "product-card" + (isSold(p) ? " is-sold" : ""));

    var open = el("button", "product-open");
    open.type = "button";
    open.setAttribute("aria-label", "Avaa tuote: " + p.name.fi);

    var media = el("span", "product-media");
    var img = el("img");
    img.src = imageOf(p, 0, "small");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);
    if (isSold(p)) media.appendChild(el("span", "tag tag-sold", "Myyty"));
    else if (isNew(p)) media.appendChild(el("span", "tag tag-new", "Uusi"));
    if (p.images.length > 1) media.appendChild(el("span", "tag tag-count", p.images.length + " kuvaa"));
    open.appendChild(media);

    var body = el("span", "product-body");
    body.appendChild(el("span", "product-name", p.name.fi));
    if (p.name.en) body.appendChild(langSpan(p.name.en, "en", "product-alt"));
    if (p.name.fa) body.appendChild(langSpan(p.name.fa, "fa", "product-alt"));
    body.appendChild(el("span", "product-price", isSold(p) ? "Myyty / Sold" : priceText(p)));
    open.appendChild(body);
    open.addEventListener("click", function () { openProduct(p); });
    card.appendChild(open);

    if (!isSold(p)) {
      var pick = el("label", "product-pick");
      var box = el("input");
      box.type = "checkbox";
      box.value = p.id;
      box.addEventListener("change", function () { setSelected(p.id, box.checked); });
      pick.appendChild(box);
      var text = el("span", "", "Valitse kyselyyn ");
      text.appendChild(langSpan("Select", "en"));
      pick.appendChild(text);
      card.appendChild(pick);
    }

    li.appendChild(card);
    return li;
  }

  function renderGroups() {
    if (!groupsRoot) return;
    groupsRoot.textContent = "";

    GROUPS.forEach(function (g) {
      var list = sortGroup(products.filter(function (p) { return p.category === g.key; }));
      var section = el("section", "product-group");
      section.id = "ryhma-" + g.key;

      var h = el("h3", "group-title", g.fi);
      var alt = el("span", "group-alt");
      alt.appendChild(langSpan(g.en, "en"));
      alt.appendChild(langSpan(g.fa, "fa"));
      h.appendChild(alt);
      section.appendChild(h);

      if (!list.length) {
        var empty = el("div", "product-empty");
        empty.appendChild(el("p", "", "Tähän ryhmään tulee pian tuotteita."));
        empty.appendChild(langSpan("Products are coming to this group soon.", "en"));
        section.appendChild(empty);
        groupsRoot.appendChild(section);
        return;
      }

      /* Heti näkyvissä: kaikki uudet tuotteet, kuitenkin vähintään MIN_VISIBLE */
      var newCount = list.filter(isNew).length;
      var visible = Math.max(MIN_VISIBLE, newCount);

      var grid = el("ul", "product-grid");
      list.forEach(function (p, i) {
        var li = buildCard(p);
        if (i >= visible) { li.hidden = true; li.classList.add("is-extra"); }
        grid.appendChild(li);
      });
      section.appendChild(grid);

      if (list.length > visible) {
        var more = el("button", "btn btn-light group-more");
        more.type = "button";
        more.setAttribute("aria-expanded", "false");
        var setLabel = function (openState) {
          more.textContent = openState
            ? "Näytä vähemmän"
            : "Näytä kaikki (" + list.length + ")";
        };
        setLabel(false);
        more.addEventListener("click", function () {
          var openState = more.getAttribute("aria-expanded") !== "true";
          more.setAttribute("aria-expanded", String(openState));
          Array.prototype.forEach.call(grid.querySelectorAll(".is-extra"), function (li) { li.hidden = !openState; });
          setLabel(openState);
        });
        section.appendChild(more);
      }
      groupsRoot.appendChild(section);
    });
  }

  function revealProduct(id) {
    var p = byId[id];
    if (!p) return;
    var section = document.getElementById("ryhma-" + p.category);
    var box = section && section.querySelector('.product-pick input[value="' + id + '"]');
    var item = box && box.closest(".product-item");
    var more = section && section.querySelector(".group-more");
    if (more && (!item || item.hidden) && more.getAttribute("aria-expanded") !== "true") more.click();
  }

  /* ---------- Tuoteikkuna ---------- */
  function setText(id, text) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = text || "";
    node.hidden = !text;
  }
  function groupLabel(key) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === key) return GROUPS[i].fi;
    return "";
  }
  function updateDialogPick(p) {
    var btn = document.getElementById("pdPick");
    if (!btn || !p) return;
    btn.hidden = isSold(p);
    var on = isSelected(p.id);
    btn.textContent = on ? "Poista kyselystä" : "Lisää kyselyyn";
    btn.classList.toggle("btn-primary", !on);
    btn.classList.toggle("btn-ghost", on);
    document.getElementById("pdPickNote").textContent = on
      ? "Valittu. Sulje ikkuna ja paina sivun alareunasta Kysy valituista."
      : "";
  }

  function openProduct(p, keepUrl) {
    if (!dialog || !p) return;
    var mainImg = document.getElementById("pdImage");
    var thumbs = document.getElementById("pdThumbs");
    dialog.dataset.id = p.id;

    function showImage(i, activeBtn) {
      mainImg.src = imageOf(p, i, "large");
      mainImg.alt = p.name.fi;
      Array.prototype.forEach.call(thumbs.children, function (b) {
        b.setAttribute("aria-pressed", String(b === activeBtn));
      });
    }

    thumbs.textContent = "";
    if (p.images.length > 1) {
      p.images.forEach(function (unused, i) {
        var b = el("button", "pd-thumb");
        b.type = "button";
        b.setAttribute("aria-label", "Kuva " + (i + 1));
        var t = el("img");
        t.src = imageOf(p, i, "small");
        t.alt = "";
        b.appendChild(t);
        b.addEventListener("click", function () { showImage(i, b); });
        thumbs.appendChild(b);
      });
    }
    showImage(0, thumbs.firstElementChild);

    setText("pdBadge", groupLabel(p.category) + (isSold(p) ? " – myyty" : ""));
    setText("pdName", p.name.fi);
    setText("pdNameEn", p.name.en);
    setText("pdNameFa", p.name.fa);
    setText("pdPrice", isSold(p) ? "Myyty / Sold" : priceText(p));
    setText("pdDescFi", p.desc && p.desc.fi);
    setText("pdDescEn", p.desc && p.desc.en);
    setText("pdDescFa", p.desc && p.desc.fa);
    updateDialogPick(p);

    if (!keepUrl && window.history && window.history.replaceState) {
      try { window.history.replaceState(null, "", "#" + p.id); } catch (err) { /* ei haittaa */ }
    }
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
  }

  function closeOnBackdrop(dlg) {
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  if (dialog) {
    document.getElementById("pdClose").addEventListener("click", function () { dialog.close(); });
    closeOnBackdrop(dialog);
    dialog.addEventListener("close", function () {
      if (window.location.hash === "#" + dialog.dataset.id && window.history.replaceState) {
        try { window.history.replaceState(null, "", window.location.pathname + window.location.search); } catch (err) { /* ei haittaa */ }
      }
    });
    document.getElementById("pdPick").addEventListener("click", function () {
      var id = dialog.dataset.id;
      setSelected(id, !isSelected(id));
    });
  }

  /* Suora linkki tuotteeseen: nadiya.fi/#puku-014 */
  function openFromHash() {
    var id = decodeURIComponent((window.location.hash || "").slice(1));
    if (!id || !Object.prototype.hasOwnProperty.call(byId, id)) return;
    revealProduct(id);
    var section = document.getElementById("tuotteet");
    if (section) section.scrollIntoView();
    openProduct(byId[id], true);
  }

  /* ---------- Kysely valituista tuotteista ---------- */
  var INQ = {
    fi: {
      hello: "Hei Nadiya Boutique! Kysyisin näistä tuotteista:",
      own: "Oma kysymyksesi", ph: "Esimerkiksi koko, hinta tai toimitus",
      send: "Lähetä kysely", subject: "Kysely tuotteista",
      copied: "Viesti kopioitu.", copyFail: "Kopiointi ei onnistunut. Valitse teksti ja kopioi se käsin.",
      note: "Viesti avautuu omassa sovelluksessasi, ja lähetät sen itse.",
      remove: "Poista",
      sms: "Tekstiviesti", mail: "Sähköposti", copy: "Kopioi viesti"
    },
    en: {
      hello: "Hello Nadiya Boutique! I would like to ask about these products:",
      own: "Your question", ph: "For example size, price or delivery",
      send: "Send your inquiry", subject: "Product inquiry",
      copied: "Message copied.", copyFail: "Copying failed. Select the text and copy it by hand.",
      note: "The message opens in your own app, and you send it yourself.",
      remove: "Remove",
      sms: "Text message", mail: "Email", copy: "Copy message"
    },
    fa: {
      hello: "سلام نادیا بوتیک! می‌خواهم دربارهٔ این محصولات بپرسم:",
      own: "پرسش شما", ph: "مثلاً اندازه، قیمت یا ارسال",
      send: "ارسال پرسش", subject: "پرسش دربارهٔ محصولات",
      copied: "پیام کپی شد.", copyFail: "کپی نشد. متن را انتخاب و دستی کپی کنید.",
      note: "پیام در برنامهٔ خودتان باز می‌شود و خودتان آن را می‌فرستید.",
      remove: "حذف",
      sms: "پیامک", mail: "ایمیل", copy: "کپی پیام"
    }
  };

  function defaultInquiryLang() {
    var l = (navigator.language || "fi").toLowerCase();
    if (/^(fa|prs|ps)/.test(l)) return "fa";
    if (/^fi/.test(l)) return "fi";
    return "en";
  }
  var inquiryLang = defaultInquiryLang();

  function siteBase() {
    return /^https?:$/.test(window.location.protocol)
      ? window.location.origin + window.location.pathname
      : SITE_URL;
  }
  function nameIn(p, lang) { return p.name[lang] || p.name.fi || p.id; }

  function buildMessage() {
    var t = INQ[inquiryLang];
    var lines = [t.hello, ""];
    selected.forEach(function (id) {
      var p = byId[id];
      if (!p) return;
      lines.push("– " + nameIn(p, inquiryLang) + " (" + p.id + ")");
      lines.push("  " + siteBase() + "#" + p.id);
    });
    var own = (document.getElementById("inqText").value || "").trim();
    if (own) { lines.push(""); lines.push(own); }
    return lines.join("\n");
  }

  function updateInquiryLinks() {
    var msg = encodeURIComponent(buildMessage());
    var wa = document.getElementById("inqWhatsApp");
    wa.hidden = !WHATSAPP_ENABLED;
    wa.href = "https://wa.me/" + PHONE + "?text=" + msg;
    document.getElementById("inqSms").href = "sms:+" + PHONE + "?&body=" + msg;
    var mail = document.getElementById("inqEmail");
    if (EMAIL) {
      mail.hidden = false;
      mail.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(INQ[inquiryLang].subject) + "&body=" + msg;
    } else {
      mail.hidden = true;
    }
  }

  function renderInquiry() {
    var t = INQ[inquiryLang];
    var body = inquiry.querySelector(".inq-body");
    body.lang = inquiryLang;
    var rtl = inquiryLang === "fa";
    var list = document.getElementById("inqList");
    list.dir = rtl ? "rtl" : "ltr";
    list.textContent = "";
    selected.forEach(function (id) {
      var p = byId[id];
      if (!p) return;
      var li = el("li");
      var img = el("img");
      img.src = imageOf(p, 0, "small");
      img.alt = "";
      li.appendChild(img);
      var name = el("span", "inq-name", nameIn(p, inquiryLang));
      name.appendChild(el("small", "", p.id));
      li.appendChild(name);
      var rm = el("button", "inq-remove", "×");
      rm.type = "button";
      rm.setAttribute("aria-label", t.remove + ": " + nameIn(p, inquiryLang));
      rm.addEventListener("click", function () { setSelected(id, false); });
      li.appendChild(rm);
      list.appendChild(li);
    });
    var label = document.getElementById("inqTextLabel");
    label.textContent = t.own;
    label.dir = rtl ? "rtl" : "ltr";
    var ta = document.getElementById("inqText");
    ta.placeholder = t.ph;
    ta.dir = rtl ? "rtl" : "ltr";
    var sendLabel = document.getElementById("inqSendLabel");
    sendLabel.textContent = t.send;
    sendLabel.dir = rtl ? "rtl" : "ltr";
    var note = document.getElementById("inqNote");
    note.textContent = t.note;
    note.dir = rtl ? "rtl" : "ltr";
    Array.prototype.forEach.call(inquiry.querySelectorAll("input[name=inqLang]"), function (r) {
      r.checked = r.value === inquiryLang;
    });
    document.getElementById("inqSms").textContent = t.sms;
    document.getElementById("inqEmail").textContent = t.mail;
    document.getElementById("inqCopy").textContent = t.copy;
    updateInquiryLinks();
  }

  if (inquiry && bar) {
    document.getElementById("selectionClear").addEventListener("click", function () {
      selected = [];
      saveSelection();
      updateSelectionUi();
    });
    document.getElementById("selectionAsk").addEventListener("click", function () {
      if (!selected.length) return;
      renderInquiry();
      if (typeof inquiry.showModal === "function") inquiry.showModal();
      else inquiry.setAttribute("open", "");
    });
    document.getElementById("inqClose").addEventListener("click", function () { inquiry.close(); });
    closeOnBackdrop(inquiry);
    document.getElementById("inqText").addEventListener("input", updateInquiryLinks);
    Array.prototype.forEach.call(inquiry.querySelectorAll("input[name=inqLang]"), function (r) {
      r.addEventListener("change", function () { inquiryLang = r.value; renderInquiry(); });
    });
    document.getElementById("inqCopy").addEventListener("click", function () {
      var text = buildMessage();
      var status = document.getElementById("inqStatus");
      var done = function (ok) {
        status.textContent = ok ? INQ[inquiryLang].copied : INQ[inquiryLang].copyFail;
        window.setTimeout(function () { status.textContent = ""; }, 4000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  }

  renderGroups();
  updateSelectionUi();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
