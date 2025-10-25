import { createWindow } from '../window-manager.js';

export const musicPlayerApp = {
  id: 'music-player',
  name: '音楽プレイヤー',
  icon: '🎵',
  description: 'ローカル音楽ファイルを再生',

  launch() {
    const content = createMusicPlayerContent();
    createWindow(this.id, this.name, content, { width: 640, height: 520 });
  }
};

function createMusicPlayerContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .music-player {
        display: grid;
        grid-template-rows: auto 1fr auto;
        height: 100%;
        gap: 12px;
      }
      .music-toolbar {
        display: flex;
        gap: 8px;
        align-items: center;
        background: rgba(15, 23, 42, 0.4);
        padding: 8px;
        border-radius: 12px;
      }
      .music-toolbar input[type="file"] {
        flex: 1;
        padding: 10px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.12);
        border-radius: 10px;
        color: #f8fafc;
      }
      .playlist {
        background: rgba(15, 23, 42, 0.38);
        border-radius: 14px;
        overflow: auto;
        padding: 8px 0;
      }
      .playlist-item {
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: 0.2s;
      }
      .playlist-item:hover {
        background: rgba(56, 189, 248, 0.15);
      }
      .playlist-item.active {
        background: rgba(56, 189, 248, 0.25);
        color: #38bdf8;
      }
      .player-controls {
        background: rgba(15, 23, 42, 0.4);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .seek-bar {
        width: 100%;
      }
      .seek-bar input[type="range"] {
        width: 100%;
      }
      .control-buttons {
        display: flex;
        justify-content: center;
        gap: 12px;
      }
      .control-buttons button {
        padding: 10px 18px;
        border-radius: 10px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        cursor: pointer;
        font-size: 16px;
        transition: 0.2s;
      }
      .control-buttons button:hover {
        background: rgba(56, 189, 248, 0.35);
      }
      .track-info {
        text-align: center;
        color: rgba(248, 250, 252, 0.7);
      }
    </style>
    <div class="music-player">
      <div class="music-toolbar">
        <input type="file" accept="audio/*" multiple>
        <button class="clear-playlist">クリア</button>
      </div>
      <div class="playlist"></div>
      <div class="player-controls">
        <div class="track-info">再生中の曲はありません</div>
        <div class="seek-bar">
          <input type="range" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-buttons">
          <button class="prev">⏮️</button>
          <button class="play">▶️</button>
          <button class="next">⏭️</button>
        </div>
        <audio class="audio-element" preload="metadata"></audio>
      </div>
    </div>
  `;

  const fileInput = container.querySelector('input[type="file"]');
  const playlistEl = container.querySelector('.playlist');
  const trackInfo = container.querySelector('.track-info');
  const seekBar = container.querySelector('input[type="range"]');
  const audioEl = container.querySelector('.audio-element');
  const playBtn = container.querySelector('.play');
  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');
  const clearBtn = container.querySelector('.clear-playlist');

  const playlist = [];
  let currentIndex = -1;
  let isSeeking = false;

  function renderPlaylist() {
    playlistEl.innerHTML = '';
    playlist.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = 'playlist-item' + (index === currentIndex ? ' active' : '');
      item.innerHTML = `
        <span>${track.name}</span>
        <small>${formatDuration(track.duration)}</small>
      `;
      item.addEventListener('click', () => playTrack(index));
      playlistEl.appendChild(item);
    });
    trackInfo.textContent = currentIndex >= 0 ? `再生中: ${playlist[currentIndex].name}` : '再生中の曲はありません';
  }

  function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    const track = playlist[currentIndex];
    audioEl.src = track.url;
    audioEl.play();
    playBtn.textContent = '⏸️';
    renderPlaylist();
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const track = { name: file.name, url, duration: 0 };
      playlist.push(track);
      const tempAudio = document.createElement('audio');
      tempAudio.src = url;
      tempAudio.addEventListener('loadedmetadata', () => {
        track.duration = tempAudio.duration;
        renderPlaylist();
      });
    });
    if (currentIndex === -1 && playlist.length > 0) {
      playTrack(0);
    } else {
      renderPlaylist();
    }
  }

  fileInput.addEventListener('change', event => {
    handleFiles(event.target.files);
  });

  playBtn.addEventListener('click', () => {
    if (!audioEl.src) return;
    if (audioEl.paused) {
      audioEl.play();
      playBtn.textContent = '⏸️';
    } else {
      audioEl.pause();
      playBtn.textContent = '▶️';
    }
  });

  prevBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(nextIndex);
  });

  nextBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(nextIndex);
  });

  clearBtn.addEventListener('click', () => {
    playlist.length = 0;
    currentIndex = -1;
    audioEl.pause();
    audioEl.src = '';
    playBtn.textContent = '▶️';
    renderPlaylist();
  });

  audioEl.addEventListener('timeupdate', () => {
    if (!isSeeking) {
      const progress = (audioEl.currentTime / audioEl.duration) * 100 || 0;
      seekBar.value = progress;
    }
  });

  audioEl.addEventListener('ended', () => {
    if (playlist.length > 0) {
      nextBtn.click();
    }
  });

  seekBar.addEventListener('input', () => {
    isSeeking = true;
  });

  seekBar.addEventListener('change', () => {
    if (audioEl.duration) {
      audioEl.currentTime = (seekBar.value / 100) * audioEl.duration;
    }
    isSeeking = false;
  });

  function formatDuration(duration) {
    if (!duration || duration === Infinity) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  renderPlaylist();

  return container;
}
