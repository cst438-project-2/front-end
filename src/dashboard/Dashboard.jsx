import './dashboard.css';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const seedMemories = [
  {
    id: 'm1',
    title: 'Monterey',
    startDate: '2024-07-14',
    endDate: '2024-08-24',
    createdAt: '2024-08-25T00:00:00Z',
    coverPhotoId: 'p1',
    items: [
      {
        id: 'p1',
        imgUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop',
        description: 'First sunset together.',
      },
      {
        id: 'p2',
        imgUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop',
        description: 'Walking downtown.',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Road Trip',
    startDate: '2024-09-01',
    endDate: '2024-09-05',
    createdAt: '2024-09-06T00:00:00Z',
    coverPhotoId: null,
    items: [],
  },
];

function prettyDate(yyyyMmDd) {
  if (!yyyyMmDd) return '—';
  const [y, m, d] = String(yyyyMmDd).split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRange(start, end) {
  return `${prettyDate(start)} – ${prettyDate(end)}`;
}

function getCoverPhoto(memory) {
  if (!memory?.items?.length) return null;
  return memory.items.find((item) => item.id === memory.coverPhotoId) || memory.items[0];
}

function hexToRgbString(hex) {
  const safeHex = String(hex || '#ff4d4d').replace('#', '');
  const normalized = safeHex.length === 3
    ? safeHex.split('').map((ch) => ch + ch).join('')
    : safeHex;

  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return '255, 77, 77';

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r}, ${g}, ${b}`;
}

export default function Dashboard() {
  const [memories, setMemories] = useState(() =>
    [...seedMemories].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );

  const [glowColor, setGlowColor] = useState(
    localStorage.getItem('memoryGlowColor') || '#ff4d4d'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  const latestId = useMemo(() => memories[0]?.id, [memories]);

  const featuredPhotos = useMemo(() => {
    const montereyMemory = memories.find((memory) => memory.title === 'Monterey');
    if (!montereyMemory?.items?.length) return [];

    return montereyMemory.items.map((item) => ({
      memoryId: montereyMemory.id,
      memoryTitle: montereyMemory.title,
      imgUrl: item.imgUrl,
      description: item.description,
    }));
  }, [memories]);

  const safeSlideshowIndex = featuredPhotos.length
    ? slideshowIndex % featuredPhotos.length
    : 0;
  const activeSlide = featuredPhotos[safeSlideshowIndex] || null;

  const [openMemoryId, setOpenMemoryId] = useState(null);
  const activeMemory = useMemo(
    () => memories.find((m) => m.id === openMemoryId) || null,
    [memories, openMemoryId]
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const carouselRef = useRef(null);

  useEffect(() => {
    if (!featuredPhotos.length) return;

    const interval = window.setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % featuredPhotos.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [featuredPhotos]);

  function openMemory(id) {
    setOpenMemoryId(id);
    requestAnimationFrame(() => {
      if (carouselRef.current) carouselRef.current.scrollLeft = 0;
    });
  }

  function closeMemory() {
    setOpenMemoryId(null);
  }

  function showCreate() {
    setNewTitle('');
    setStartDate('');
    setEndDate('');
    setCreateOpen(true);
  }

  function hideCreate() {
    setCreateOpen(false);
  }

  function updateGlowColor(val) {
    setGlowColor(val);
    localStorage.setItem('memoryGlowColor', val);
  }

  function createMemoryFake() {
    if (!startDate || !endDate) {
      alert('Pick start and end date (skeleton check).');
      return;
    }

    if (startDate > endDate) {
      alert('Start date cannot be after end date.');
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const mem = {
      id,
      title: newTitle.trim() || 'New memory',
      startDate,
      endDate,
      createdAt: now,
      coverPhotoId: null,
      items: [],
    };

    setMemories((prev) => [mem, ...prev]);
    setCreateOpen(false);
  }

  function deleteMemoryFake(id) {
    const mem = memories.find((m) => m.id === id);
    const ok = window.confirm(`Delete "${mem?.title || 'this memory'}"? (skeleton only)`);
    if (!ok) return;
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setOpenMemoryId(null);
  }

  function scrollCarousel(dir) {
    const el = carouselRef.current;
    if (!el) return;
    const delta = Math.max(320, el.clientWidth * 0.9) * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <div
      className="dashBody"
      style={{
        '--glow-color': glowColor,
        '--glow-rgb': hexToRgbString(glowColor),
      }}
    >
      <main className="wrap">
        <header className="topBar">
          <div className="brandRow">
            <div className="titleBlock leftTitle">
              <h1>Memory Bank</h1>
              <p className="subtitle">A clean timeline for your favorite moments</p>
            </div>

            <div className="settingsAnchor">
              <button
                className="gearBtn"
                type="button"
                aria-label="Open appearance settings"
                onClick={() => setSettingsOpen((prev) => !prev)}
              >
                ⚙
              </button>

              {settingsOpen && (
                <div className="settingsPanel">
                  <div className="settingsLabel">Outline glow color</div>
                  <div className="settingsRow">
                    <input
                      className="colorPicker"
                      type="color"
                      value={glowColor}
                      onChange={(e) => updateGlowColor(e.target.value)}
                    />
                    <span className="colorValue">{glowColor.toUpperCase()}</span>
                  </div>
                  <button
                    className="settingsSubmit"
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Enter
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="heroShowcase">
            <div
              className="heroSlideCard cardSurface featuredSurface"
              style={{
                border: `1.5px solid rgba(${hexToRgbString(glowColor)}, 0.38)`,
                boxShadow: `0 18px 44px rgba(${hexToRgbString(glowColor)}, 0.12)`,
              }}
            >
              {activeSlide ? (
                <>
                  <img
                    src={activeSlide.imgUrl}
                    alt={activeSlide.memoryTitle}
                    className="heroImage"
                  />
                  <div className="heroOverlay">
                    <div className="heroMemoryTag">Featured memory</div>
                    <div className="heroPhotoSource">From {activeSlide.memoryTitle}</div>
                    <div className="heroCaption">{activeSlide.description}</div>
                  </div>
                </>
              ) : (
                <div className="heroEmpty">Create a memory to start your featured slideshow.</div>
              )}
            </div>

            <div className="heroActions underSlideshow">
              <button className="btn primaryBtn" onClick={showCreate}>+ New memory</button>
            </div>
          </div>
        </header>

        <section className="timeline">
          {!memories.length ? (
            <div className="emptyCard">
              No memories yet. Create your first memory.
              <div style={{ marginTop: 10 }}>
                <button className="btn" onClick={showCreate}>+ Create first memory</button>
              </div>
            </div>
          ) : (
            memories.map((m, idx) => (
              <div className="nodeRow" key={m.id}>
                <div
                  className={`node ${idx % 2 === 0 ? 'left' : 'right'} cardSurface`}
                  onClick={() => openMemory(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openMemory(m.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="nodeHeader">
                    <div className="nodeCoverWrap">
                      {getCoverPhoto(m) ? (
                        <img
                          className="nodeCover"
                          src={getCoverPhoto(m).imgUrl}
                          alt={m.title}
                        />
                      ) : (
                        <div className="nodeCover fallbackCover">No photo</div>
                      )}
                      <div className="starBadge">★</div>
                    </div>

                    <div className="nodeHeaderText">
                      <div className="nodeTitle">{m.title}</div>
                      <div className="nodeMeta">
                        {formatRange(m.startDate, m.endDate)} • {m.items?.length || 0} photo(s)
                      </div>
                      <div className="nodePreviewRow">
                        <span className="chip">{m.items?.length || 0} photos</span>
                        <span className="chip mutedChip">
                          {m.id === latestId ? 'Newest memory' : 'Saved memory'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {m.id === latestId && (
                    <div className="addRow" onClick={(e) => e.stopPropagation()}>
                      <button className="addBtn" onClick={showCreate} title="Add a new memory">
                        +
                      </button>
                      <div className="addText">Add another memory</div>
                    </div>
                  )}
                </div>

                <div className="dot" />
              </div>
            ))
          )}
        </section>
      </main>

      {activeMemory && (
        <div className="modal" onClick={(e) => e.target.classList.contains('modal') && closeMemory()}>
          <div className="modalCard">
            <div className="modalTop">
              <div>
                <div className="modalTitle">{activeMemory.title}</div>
                <div className="modalSub">
                  {formatRange(activeMemory.startDate, activeMemory.endDate)} •{' '}
                  {activeMemory.items?.length || 0} photo(s)
                </div>
              </div>

              <div className="modalActions">
                <button className="dangerBtn" onClick={() => deleteMemoryFake(activeMemory.id)}>
                  Delete memory
                </button>
                <button className="iconBtn" type="button" onClick={closeMemory}>✕</button>
              </div>
            </div>

            <div className="carouselWrap">
              <button className="carNav left" onClick={() => scrollCarousel('left')} aria-label="Scroll left">
                ‹
              </button>

              <div className="carousel" ref={carouselRef}>
                {!activeMemory.items?.length ? (
                  <div className="carouselEmpty">No photos yet (skeleton).</div>
                ) : (
                  activeMemory.items.map((it) => (
                    <div className="slide" key={it.id}>
                      <img src={it.imgUrl} alt="memory" />
                      <div className="caption">{it.description}</div>
                    </div>
                  ))
                )}
              </div>

              <button className="carNav right" onClick={() => scrollCarousel('right')} aria-label="Scroll right">
                ›
              </button>
            </div>

            <div className="divider" />

            <div className="uploadBox">
              <div className="uploadTitle">Add a photo to this memory (UI only)</div>

              <div className="uploadGrid">
                <div className="filePick">
                  <button className="fileBtn" onClick={() => alert('No uploading yet — skeleton')}>
                    Choose photo
                  </button>
                  <div className="fileName">No file chosen</div>
                </div>

                <textarea
                  className="input"
                  rows={3}
                  placeholder="Unique description for this photo (UI only)"
                  disabled
                />

                <button className="btn full" onClick={() => alert('No uploading yet — skeleton')}>
                  Upload to this memory
                </button>

                <div className="status center">Uploading disabled in skeleton.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="modal" onClick={(e) => e.target.classList.contains('modal') && hideCreate()}>
          <div className="modalCard small">
            <div className="modalTop">
              <div className="modalTitle">Create a new memory</div>
              <button className="iconBtn" type="button" onClick={hideCreate}>✕</button>
            </div>

            <input
              className="input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Memory title (ex: Monterey)"
            />

            <div className="dateRow">
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <button className="btn" onClick={createMemoryFake}>Create memory</button>
            <div className="status">Currently saves only in browser state.</div>
          </div>
        </div>
      )}
    </div>
  );
}