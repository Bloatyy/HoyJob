let player;

// YouTube API initialization
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    videoId: 'FqmZq7IrRdk',
    playerVars: {
      'autoplay': 0,
      'controls': 0, // We use custom controls
      'modestbranding': 1,
      'rel': 0
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // FAQ Toggle
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = answer.classList.contains('open');
      document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));
      if (!isOpen) { answer.classList.add('open'); btn.classList.add('open'); }
    });
  });

  // Modal Video Elements
  const modal = document.getElementById('videoModal');
  const demoLink = document.querySelector('a[href="#demo"]');
  const closeBtn = document.querySelector('.video-modal-close');

  if (demoLink) {
    demoLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      if (player && player.playVideo) player.playVideo();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      if (player && player.pauseVideo) player.pauseVideo();
    });
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        if (player && player.pauseVideo) player.pauseVideo();
      }
    });
  }

  // Custom Controls
  const btnPause = document.getElementById('vid-pause');
  const btnRewind = document.getElementById('vid-rewind');
  const btnForward = document.getElementById('vid-forward');
  const volumeSlider = document.getElementById('vid-volume');

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      const state = player.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        btnPause.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      } else {
        player.playVideo();
        btnPause.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      }
    });
  }

  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      const curr = player.getCurrentTime();
      player.seekTo(Math.max(0, curr - 10), true);
    });
  }

  if (btnForward) {
    btnForward.addEventListener('click', () => {
      const curr = player.getCurrentTime();
      const dur = player.getDuration();
      player.seekTo(Math.min(dur, curr + 10), true);
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      player.setVolume(e.target.value);
    });
  }
});
