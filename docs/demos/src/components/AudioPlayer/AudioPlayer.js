/* ==========================================================================
   AudioPlayer — shared behaviour
   Playback is SIMULATED (no real audio file bundled): a timer advances a
   progress value so the scrubber, waveform, time and countdown all read true
   in the demo.

   TODO(backend:AudioPlayer): wire to a real <audio> element / streamed source
     → contract: { src: url, duration: seconds, downloadUrl: url }.
     Replace the simulated ticker with `audio.timeupdate`, and point the
     download button at `downloadUrl` instead of the no-op handler.

   Hooks (data-attributes, decoupled from BEM classes):
     [data-ap-player]   root of a player instance   (required)
     [data-ap-toggle]   play / pause button
     [data-ap-scrubber] thin seek bar                (compact / mini)
     [data-ap-fill]     progress fill inside scrubber
     [data-ap-waveform] waveform track               (card)
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

  function initPlayer(root) {
    var duration = parseFloat(root.getAttribute('data-duration')) || 225;
    var current = 0;
    var playing = false;
    var showRemaining = false;
    var timer = null;

    var playBtn = root.querySelector('[data-ap-toggle]');
    var scrubber = root.querySelector('[data-ap-scrubber]');
    var fill = root.querySelector('[data-ap-fill]');
    var waveform = root.querySelector('[data-ap-waveform]');
    var timeEl = root.querySelector('[data-ap-current]');
    var durEl = root.querySelector('[data-ap-duration]');
    var downloadBtn = root.querySelector('[data-ap-download]');

    // Build waveform bars if this variant has a waveform track. Bar count is
    // derived from the track width (~6px per bar+gutter) and capped by the
    // data-ap-bars hint so it never overflows and rebuilds on resize.
    var bars = [];
    if (waveform) {
      var hint = parseInt(waveform.getAttribute('data-ap-bars'), 10) || 56;
      var buildBars = function () {
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
        render();
      };
      buildBars();
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildBars, 150);
      });
    }

    function render() {
      var ratio = duration ? current / duration : 0;
      if (fill) fill.style.width = (ratio * 100) + '%';
      if (bars.length) {
        var cut = ratio * bars.length;
        for (var i = 0; i < bars.length; i++) {
          bars[i].classList.toggle('is-played', i < cut);
        }
      }
      if (timeEl) timeEl.textContent = fmt(current);
      if (durEl) {
        durEl.textContent = showRemaining
          ? '-' + fmt(duration - current)
          : fmt(duration);
      }
    }

    function tick() {
      current += 0.25;
      if (current >= duration) {
        current = duration;
        render();
        stop();
        current = 0; // reset for replay
        render();
        return;
      }
      render();
    }

    function play() {
      if (playing) return;
      playing = true;
      root.classList.add('is-playing');
      if (playBtn) playBtn.setAttribute('aria-pressed', 'true');
      timer = setInterval(tick, 250);
    }
    function stop() {
      playing = false;
      root.classList.remove('is-playing');
      if (playBtn) playBtn.setAttribute('aria-pressed', 'false');
      if (timer) { clearInterval(timer); timer = null; }
    }
    function toggle() { playing ? stop() : play(); }

    function seekFrom(el, clientX) {
      var rect = el.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      current = ratio * duration;
      render();
    }

    if (playBtn) playBtn.addEventListener('click', toggle);
    if (scrubber) scrubber.addEventListener('click', function (e) { seekFrom(scrubber, e.clientX); });
    if (waveform) waveform.addEventListener('click', function (e) { seekFrom(waveform, e.clientX); });
    if (durEl) durEl.addEventListener('click', function () { showRemaining = !showRemaining; render(); });
    if (downloadBtn) downloadBtn.addEventListener('click', function (e) {
      // TODO(backend:AudioPlayer): point at real downloadUrl.
      e.preventDefault();
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-ap-player]').forEach(initPlayer);
  });
})();
