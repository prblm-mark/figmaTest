/* ApiProfileTestTool — behaviour for both API test tools (TASK-470999, TASK-471000).
 *
 * The page layout (rail, sticky Select, full width) is ApiProfileHelp.js; this file is the forms.
 *
 *   1. Credentials: one shared card (API Key, and Access / Refresh Token where the page uses them).
 *      A form's "Use different credentials" values win over the shared ones when filled in.
 *   2. Path: ID fields fill the URI as you type (classic does the same), shown on the route line.
 *   3. Sign (new): fills the form's Time Stamp, Signature and MD5 — the same calculation as
 *      Create signature, for this form's method, path and body. Classic made you copy them across.
 *   4. Send request: builds the request classic sends (the form's fields as headers, URL variables
 *      as a query string, JSON as the body for POST / PUT) and shows the response.
 *   5. Create signature: classic's own card. Its Time Stamp ticks every 100ms, as classic's does.
 *
 * MOCK. No request leaves the page:
 *   TODO(backend:ApiProfileTestTool) api-test-send: Send answers with the API help's documented
 *     example for the endpoint (data-doc-status / data-doc-body); with no API key, the documented 401.
 *     Live: send it — $.ajax({type, url, headers, data}) in classic — and show the real response.
 *   TODO(backend:ApiProfileTestTool) api-test-sign: Sign / Create signature compute in the browser
 *     with the docs' example secret, so only the docs' example key signs. Live: POST
 *     {thisDoc}?action=hash {APIKey, HTTPMethod, URIPattern, TimeStamp, Body}; the server looks up the
 *     key's secret. Keep the secret on the server.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-api-test');
  if (!page) return;

  /* The API help pages' example key and secret — the only pair the mock can sign with. */
  var DEMO_SECRETS = { '49yRcAR9J9': 'Oug82Izd6Cz2G7f2k6o4tr2Ma9D511' };

  /* ── Hashes ───────────────────────────────────────────────────── */
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').toUpperCase();
  }
  function sha512(str) {
    return crypto.subtle.digest('SHA-512', new TextEncoder().encode(str)).then(hex);
  }

  /* MD5 (RFC 1321) over the UTF-8 bytes. Web Crypto has no MD5, and classic's API uses it for the
     body hash, so a small implementation lives here. Uppercase hex, as ColdFusion's Hash() returns. */
  function md5(str) {
    var bytes = new TextEncoder().encode(str);
    var n = bytes.length, words = [];
    for (var i = 0; i < n; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    words[n >> 2] |= 0x80 << ((n % 4) * 8);
    var len = (((n + 8) >> 6) + 1) * 16;
    for (var j = words.length; j < len; j++) words[j] = words[j] | 0;
    words[len - 2] = (n * 8) >>> 0;
    words[len - 1] = Math.floor(n / 0x20000000);
    var S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    var K = [];
    for (var k = 0; k < 64; k++) K[k] = Math.floor(Math.abs(Math.sin(k + 1)) * 4294967296) | 0;
    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (var off = 0; off < len; off += 16) {
      var A = a0, B = b0, C = c0, D = d0;
      for (var t = 0; t < 64; t++) {
        var F, g, r = t >> 4;
        if (r === 0) { F = (B & C) | (~B & D); g = t; }
        else if (r === 1) { F = (D & B) | (~D & C); g = (5 * t + 1) % 16; }
        else if (r === 2) { F = B ^ C ^ D; g = (3 * t + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * t) % 16; }
        var tmp = D; D = C; C = B;
        var sum = (A + F + K[t] + words[off + g]) | 0;
        var s = S[r * 4 + (t % 4)];
        B = (B + ((sum << s) | (sum >>> (32 - s)))) | 0;
        A = tmp;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0].map(function (w) {
      var h = '';
      for (var q = 0; q < 4; q++) h += ('0' + ((w >>> (q * 8)) & 0xff).toString(16)).slice(-2);
      return h;
    }).join('').toUpperCase();
  }
  window.__apiTestHash = { md5: md5, sha512: sha512 };   // for the demo's own checks

  function signature(method, uri, body, key, ts) {
    var secret = DEMO_SECRETS[key];
    if (!secret) return Promise.reject(new Error('API Key not valid'));
    var bodyMd5 = body.trim() ? md5(body.trim()) : '';
    return sha512(method + '+' + uri + '+' + bodyMd5 + '+' + secret + '+' + ts).then(function (sig) {
      return { signature: sig, md5: bodyMd5, timestamp: ts };
    });
  }

  /* ── Small helpers ────────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function field(scope, role, name) {
    return scope.querySelector('[data-role="' + role + '"]' + (name ? '[data-name="' + name + '"]' : ''));
  }
  function val(el) {
    if (!el) return '';
    if (el.classList.contains('sel')) return el.querySelector('.sel__value').textContent.trim();
    return el.value.trim();
  }
  function cred(form, name) {
    var own = val(field(form, 'cred-override', name));
    return own || val(field(page, 'shared-cred', name));
  }
  function pretty(body) {
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch (e) { return body; }
  }

  function show(form, html) {
    var panel = form.querySelector('[data-response]');
    panel.innerHTML = html;
    panel.hidden = false;
    if (window.lucide) window.lucide.createIcons();
  }
  function statusBadge(status) {
    var ok = /^2/.test(status);
    return '<span class="badge badge--' + (ok ? 'success' : 'danger') + '">' + esc(status) + '</span>';
  }

  /* ── 2. Path ──────────────────────────────────────────────────── */
  function path(form) {
    var uri = form.getAttribute('data-uri');
    form.querySelectorAll('[data-role="path"]').forEach(function (el) {
      uri = uri.replace('{' + el.getAttribute('data-name').toLowerCase() + '}', el.value.trim() || '{' + el.getAttribute('data-name').toLowerCase() + '}');
    });
    return uri;
  }
  function query(form) {
    var parts = [];
    form.querySelectorAll('[data-role="query"]').forEach(function (el) {
      if (el.value.trim()) parts.push(el.getAttribute('data-name') + '=' + encodeURIComponent(el.value.trim()));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }
  function body(form) {
    var m = form.getAttribute('data-method');
    var el = field(form, 'body');
    return el && (m === 'POST' || m === 'PUT') ? el.value.trim() : '';
  }
  page.addEventListener('input', function (e) {
    var el = e.target.closest('[data-role="path"]');
    if (!el) return;
    var form = el.closest('.cc-api-test__form');
    form.querySelector('[data-uri-shown]').textContent = path(form);
  });

  /* ── 3. Sign ──────────────────────────────────────────────────── */
  function sign(form) {
    var key = cred(form, 'APIKey');
    var ts = new Date().toISOString();
    return signature(form.getAttribute('data-method'), path(form), body(form), key, ts).then(function (r) {
      var set = function (name, v) { var el = field(form, 'sign', name); if (el) el.value = v; };
      set('TimeStamp', r.timestamp); set('Signature', r.signature); set('MD5', r.md5);
      form.querySelector('[data-response]').hidden = true;
    }, function (err) {
      show(form, '<div class="cc-api-test__response-head">' + statusBadge('Error') +
        '<span class="cc-api-test__response-msg">' + esc(err.message) + '</span></div>');
    });
  }

  /* ── 4. Send request ──────────────────────────────────────────── */
  function send(form) {
    var method = form.getAttribute('data-method');
    var full = 'https://www.affino.com' + path(form) + query(form);
    var headers = {};
    (form.getAttribute('data-creds') || '').split(',').filter(Boolean).forEach(function (c) { headers[c] = cred(form, c); });
    form.querySelectorAll('[data-role="sign"], [data-role="header"]').forEach(function (el) { headers[el.getAttribute('data-name')] = val(el); });

    var status, resp;
    if ('APIKey' in headers && !headers.APIKey) {
      /* The API help's documented error for a missing key. */
      status = '401 Unauthorized';
      resp = '{"error":{"code":"-101","message":"API Key is missing"}}';
    } else {
      status = form.getAttribute('data-doc-status') || '200 OK';
      resp = form.getAttribute('data-doc-body') || '';
    }
    var rows = Object.keys(headers).map(function (h) {
      return '<li class="cc-api-help__kv"><span class="cc-api-help__key">' + esc(h) + '</span>' +
        (headers[h] ? '<code class="cc-api-help__value">' + esc(headers[h]) + '</code>' : '<span class="cc-api-help__empty" aria-label="empty">—</span>') + '</li>';
    }).join('');
    var sentBody = body(form);
    show(form,
      '<div class="cc-api-test__response-head">' + statusBadge(status) +
        '<code class="cc-api-help__path">' + esc(method + ' ' + full) + '</code></div>' +
      '<details class="cc-api-test__sent"><summary class="cc-api-test__summary">Request headers' + (sentBody ? ' and body' : '') + '</summary>' +
        '<ul class="cc-api-help__kvlist">' + rows + '</ul>' +
        (sentBody ? '<pre class="cc-api-help__code">' + esc(pretty(sentBody)) + '</pre>' : '') + '</details>' +
      (resp ? '<pre class="cc-api-help__code">' + esc(pretty(resp)) + '</pre>' : '') +
      '<p class="cc-api-test__mock" data-backend-todo="api-test-send">Example response from the API help: no request was sent.</p>');
  }

  page.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sign], [data-send], [data-sig-submit]');
    if (!b) return;
    var form = b.closest('.cc-api-test__form');
    if (b.hasAttribute('data-sign')) sign(form);
    else if (b.hasAttribute('data-send')) send(form);
    else createSignature(form);
  });

  /* ── 5. Create signature ──────────────────────────────────────── */
  var sig = page.querySelector('[data-signature]');
  function createSignature(form) {
    var key = val(field(form, 'sigkey'));
    var method = val(field(form, 'sigmethod'));
    var uri = val(field(form, 'siguri'));
    var ts = val(field(form, 'sigtime'));
    var b = field(form, 'sigbody') ? field(form, 'sigbody').value.trim() : '';
    /* The CRM tool's own checks, now on both pages (the User tool's had none). */
    var error = !uri ? 'URI Pattern not valid' : !method ? 'HTTP Method not valid' : !DEMO_SECRETS[key] ? 'API Key not valid' : '';
    if (error) {
      show(form, '<div class="cc-api-test__response-head">' + statusBadge('Error') + '<span class="cc-api-test__response-msg">' + esc(error) + '</span></div>');
      return;
    }
    signature(method, uri, b, key, ts).then(function (r) {
      show(form, '<pre class="cc-api-help__code">' + esc('Signature: ' + r.signature + '\nTime Stamp: ' + r.timestamp + (r.md5 ? '\nMD5: ' + r.md5 : '')) + '</pre>');
    });
  }
  if (sig) {
    var tick = field(sig, 'sigtime');
    (function stamp() { if (tick) tick.value = new Date().toISOString(); setTimeout(stamp, 100); })();
  }
})();
