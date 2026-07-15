/* ==========================================================================
   AudioPlayer — shared behaviour
   Playback is SIMULATED (no real audio file bundled): a timer advances a
   progress value so the waveform, time and countdown all read true in the demo.

   TODO(backend:AudioPlayer): wire to a real <audio> element / streamed source
     → contract: { src: url, duration: seconds, downloadUrl: url }.
     Replace the simulated ticker with `audio.timeupdate`, and point the
     download button at `downloadUrl` instead of the no-op handler.

   Grouping: every [data-ap-player] that shares a [data-ap-group] value is
   driven by ONE controller with shared state — so an inline player and its
   docked (sticky) twin stay in sync. A player with no group is its own group.

   Dock-on-scroll: within a group, the element marked [data-ap-role="inline"]
   is watched by a passive scroll listener. Once it scrolls fully above
   the viewport, the group's [data-ap-role="dock"] element (a
   `.audio-player--dock`) slides up and fixes to the viewport bottom; it slides
   away when the inline player returns to view.

   Hooks (data-attributes, decoupled from BEM classes):
     [data-ap-player]   root of a player instance          (required)
     [data-ap-group]    shared-state group id              (optional)
     [data-ap-role]     "inline" | "dock"                  (optional, dock only)
     [data-ap-toggle]   play / pause button
     [data-ap-waveform] waveform track
     [data-ap-current]  current-time text node
     [data-ap-duration] duration / remaining toggle button
     [data-ap-download] download button
   ========================================================================== */
(function () {
  'use strict';

  // Deterministic pseudo-waveform (no Math.random so it is stable per width).
  function waveformHeights(count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      var v =
        Math.sin(i * 0.45) * 0.5 +
        Math.sin(i * 0.17 + 1.3) * 0.32 +
        Math.sin(i * 0.9 + 0.6) * 0.18;
      out.push(Math.round((0.55 + v * 0.42) * 100));
    }
    return out.map(function (h) { return Math.max(18, Math.min(100, h)); });
  }

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  // Wire one player element to the shared controller `state`, returning a
  // refresh() that repaints this element from state.
  function bindElement(root, state) {
    var playBtn = root.querySelector('[data-ap-toggle]');
    var waveform = root.querySelector('[data-ap-waveform]');
    var timeEl = root.querySelector('[data-ap-current]');
    var durEl = root.querySelector('[data-ap-duration]');
    var downloadBtn = root.querySelector('[data-ap-download]');
    var bars = [];

    function buildBars() {
      if (!waveform) return;
      var hint = parseInt(waveform.getAttribute('data-ap-bars'), 10) || 56;
      var w = waveform.clientWidth || 300;
      var count = Math.max(20, Math.min(hint, Math.floor(w / 6)));
      var heights = waveformHeights(count);
      waveform.textContent = '';
      bars = [];
      for (var i = 0; i < count; i++) {
        var bar = document.createElement('span');
        bar.className = 'audio-player__bar';
        bar.style.height = heights[i] + '%';
        waveform.appendChild(bar);
        bars.push(bar);
      }
    }

    function refresh() {
      var ratio = state.duration ? state.current / state.duration : 0;
      if (bars.length) {
        var cut = ratio * bars.length;
        for (var i = 0; i < bars.length; i++) {
          bars[i].classList.toggle('is-played', i < cut);
        }
      }
      if (timeEl) timeEl.textContent = fmt(state.current);
      if (durEl) {
        durEl.textContent = state.showRemaining
          ? '-' + fmt(state.duration - state.current)
          : fmt(state.duration);
      }
      root.classList.toggle('is-playing', state.playing);
      if (playBtn) playBtn.setAttribute('aria-pressed', String(state.playing));
      if (waveform) {
        waveform.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      }
    }

    if (playBtn) playBtn.addEventListener('click', state.toggle);
    if (waveform) {
      waveform.addEventListener('click', function (e) {
        state.seekFrom(waveform, e.clientX);
      });
    }
    if (durEl) {
      durEl.addEventListener('click', function () {
        state.showRemaining = !state.showRemaining;
        state.render();
      });
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function (e) {
        // TODO(backend:AudioPlayer): point at the real downloadUrl.
        e.preventDefault();
      });
    }

    buildBars();
    return { refresh: refresh, buildBars: buildBars };
  }

  function initGroup(elements) {
    var boundEls = [];
    var duration = 225;
    elements.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-duration'));
      if (d) duration = d;
    });

    var state = {
      current: 0,
      duration: duration,
      playing: false,
      showRemaining: false,
      timer: null,
      render: function () {
        boundEls.forEach(function (b) { b.refresh(); });
      },
      play: function () {
        if (state.playing) return;
        state.playing = true;
        state.timer = setInterval(state.tick, 250);
        state.render();
      },
      stop: function () {
        state.playing = false;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }
        state.render();
      },
      toggle: function () { state.playing ? state.stop() : state.play(); },
      tick: function () {
        state.current += 0.25;
        if (state.current >= state.duration) {
          state.current = state.duration;
          state.render();
          state.stop();
          state.current = 0;  // reset for replay
          state.render();
          return;
        }
        state.render();
      },
      seekFrom: function (el, clientX) {
        var rect = el.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        state.current = ratio * state.duration;
        state.render();
      }
    };

    elements.forEach(function (el) { boundEls.push(bindElement(el, state)); });

    // Rebuild waveform bars on resize (debounced) so bar count tracks width.
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        boundEls.forEach(function (b) { b.buildBars(); });
        state.render();
      }, 150);
    });

    setupDock(elements);
    state.render();
  }

  // Reveal the group's dock element once the inline player scrolls above view.
  // A rAF-throttled scroll listener keeps it in step with the viewport.
  function setupDock(elements) {
    var inline = null;
    var dock = null;
    elements.forEach(function (el) {
      var role = el.getAttribute('data-ap-role');
      if (role === 'inline') inline = el;
      if (role === 'dock') dock = el;
    });
    if (!inline || !dock) return;

    dock.setAttribute('aria-hidden', 'true');
    function update() {
      // Dock once the inline player has scrolled fully above the viewport.
      var show = inline.getBoundingClientRect().bottom <= 0;
      dock.classList.toggle('is-docked-visible', show);
      dock.setAttribute('aria-hidden', String(!show));
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(
      document.querySelectorAll('[data-ap-player]')
    );
    var groups = {};
    var standalone = [];
    players.forEach(function (el) {
      var g = el.getAttribute('data-ap-group');
      if (g) {
        (groups[g] = groups[g] || []).push(el);
      } else {
        standalone.push([el]);
      }
    });
    Object.keys(groups).forEach(function (g) { initGroup(groups[g]); });
    standalone.forEach(initGroup);
  });
})();
