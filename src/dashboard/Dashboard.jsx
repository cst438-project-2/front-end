import './dashboard.css';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import {
  createAlbum,
  deleteAlbum,
  getAlbums,
} from '../api/albums';
import {
  addPhoto,
  deletePhotos,
} from '../api/photos';
import { useAuth } from '../context/AuthContext';
import {
  auth,
  storage,
} from '../lib/firebase';
import { getAllUserAlbums } from '../api/users';


const seedMemories = [];

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

function sanitizeFileName(name) {
  return String(name || 'photo')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

function mapAlbumToMemory(album) {
  const rawDescription = album.description || '';
  let startDate = '';
  let endDate = '';

  if (rawDescription.includes('__')) {
    const parts = rawDescription.split('__');
    startDate = parts[0] || '';
    endDate = parts[1] || '';
  }

  const photos = Array.isArray(album.photos) ? album.photos : [];

  const items = photos.map((photo) => ({
    id: photo.id,
    imgUrl: photo.photoUrl || photo.photo_url || null,
    description: photo.description || '',
    storagePath: photo.storagePath || photo.storage_path || '',
  }));

  return {
    id: album.id,
    title: album.title || 'Untitled memory',
    description: rawDescription,
    startDate,
    endDate,
    createdAt: album.createdAt || new Date().toISOString(),
    coverPhotoId: items[0]?.id || null,
    items,
  };
}

export default function Dashboard() {
  const [memories, setMemories] = useState(() =>
    [...seedMemories].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
  const [isUploading, setIsUploading] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    async function loadAlbums() {
      try {
        const albumsResponse = await getAllUserAlbums();
        const albums = Array.isArray(albumsResponse) ? albumsResponse : albumsResponse?.data || [];
        const mapped = albums.map(mapAlbumToMemory);
        setMemories(mapped);
      } catch (err) {
        console.error('Failed to load albums:', err);
      }
    }

    loadAlbums();
  }, [loading, user]);

  const [glowColor, setGlowColor] = useState(
    localStorage.getItem('memoryGlowColor') || '#ff4d4d'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  const latestId = useMemo(() => memories[0]?.id, [memories]);

  const featuredPhotos = useMemo(() => {
    return memories.flatMap((memory) =>
      (memory.items || [])
        .filter((item) => item.imgUrl)
        .map((item) => ({
          memoryId: memory.id,
          memoryTitle: memory.title,
          imgUrl: item.imgUrl,
          description: item.description,
        }))
    );
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

  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingDescription, setPendingDescription] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!featuredPhotos.length) return;

    const interval = window.setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % featuredPhotos.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [featuredPhotos]);

  function openMemory(id) {
    setOpenMemoryId(id);
    setSelectMode(false);
    setSelectedPhotoIds([]);
    setPendingFile(null);
    setPendingDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function closeMemory() {
    setOpenMemoryId(null);
    setSelectMode(false);
    setSelectedPhotoIds([]);
    setPendingFile(null);
    setPendingDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  async function createMemoryReal() {
    if (!startDate || !endDate) {
      alert('Pick start and end date.');
      return;
    }

    if (startDate > endDate) {
      alert('Start date cannot be after end date.');
      return;
    }

    try {
      const savedAlbum = await createAlbum({
        title: newTitle.trim() || 'New memory',
        description: `${startDate}__${endDate}`,
      });

      const now = new Date().toISOString();

      const mem = {
        id: savedAlbum.id,
        title: savedAlbum.title,
        description: savedAlbum.description,
        startDate,
        endDate,
        createdAt: now,
        coverPhotoId: null,
        items: [],
      };

      setMemories((prev) => [mem, ...prev]);
      setCreateOpen(false);
    } catch (err) {
      console.error('Create memory failed:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to create memory.';
      alert(message);
    }
  }

  async function deleteMemoryReal(id) {
    const mem = memories.find((m) => m.id === id);
    const ok = window.confirm(`Delete "${mem?.title || 'this memory'}"?`);
    if (!ok) return;

    try {
      await deleteAlbum(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setOpenMemoryId(null);
    } catch (err) {
      console.error('Delete memory failed:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to delete memory.';
      alert(message);
    }
  }

  function toggleSelectMode() {
    setSelectMode((prev) => {
      const next = !prev;
      if (!next) setSelectedPhotoIds([]);
      return next;
    });
  }

  function togglePhotoSelection(photoId) {
    if (!selectMode) return;

    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  }

  async function deleteSelectedPhotos() {
    if (!activeMemory || !selectedPhotoIds.length) return;

    const ok = window.confirm(
      `Delete ${selectedPhotoIds.length} selected photo(s) from "${activeMemory.title}"?`
    );
    if (!ok) return;

    try {
      await deletePhotos(activeMemory.id, selectedPhotoIds);

      setMemories((prev) =>
        prev.map((memory) => {
          if (memory.id !== activeMemory.id) return memory;

          const updatedItems = memory.items.filter(
            (item) => !selectedPhotoIds.includes(item.id)
          );

          const coverStillExists = updatedItems.some(
            (item) => item.id === memory.coverPhotoId
          );

          return {
            ...memory,
            items: updatedItems,
            coverPhotoId: coverStillExists ? memory.coverPhotoId : updatedItems[0]?.id || null,
          };
        })
      );

      setSelectedPhotoIds([]);
      setSelectMode(false);
    } catch (err) {
      console.error('Delete photo failed:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to delete photo(s).';
      alert(message);
    }
  }

  function choosePhoto() {
    fileInputRef.current?.click();
  }

  function handleFilePicked(e) {
    const file = e.target.files?.[0] || null;
    setPendingFile(file);
  }

  async function uploadPhotoReal() {
    if (!activeMemory) return;

    if (!pendingFile) {
      alert('Choose a photo first.');
      return;
    }

    setIsUploading(true);

    try {

      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to upload photos.');
        return;
      }

      if (!activeMemory?.id) {
        alert('This memory does not have a valid album ID yet.');
        return;
      }

      const safeName = sanitizeFileName(pendingFile.name);
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const storagePath = `users/${user.uid}/albums/${activeMemory.id}/${uniqueName}`;

      const fileRef = ref(storage, storagePath);

      await uploadBytes(fileRef, pendingFile);
      const photoUrl = await getDownloadURL(fileRef);

      const payload = {
        photoUrl,
        storagePath
      };

      const savedPhoto = await addPhoto(activeMemory.id, payload);

      const newItem = {
        id: savedPhoto?.id || crypto.randomUUID(),
        imgUrl: savedPhoto?.photoUrl || savedPhoto?.photo_url || photoUrl,
        storagePath: savedPhoto?.storagePath || savedPhoto?.storage_path || storagePath,
      };

      setMemories((prev) =>
        prev.map((memory) => {
          if (memory.id !== activeMemory.id) return memory;

          const updatedItems = [...memory.items, newItem];

          return {
            ...memory,
            items: updatedItems,
            coverPhotoId: memory.coverPhotoId || newItem.id,
          };
        })
      );

      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Photo upload failed:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Upload failed.';
      alert(message);
    } finally {
      setIsUploading(false);
    }
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
              {activeSlide?.imgUrl ? (
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
                      {getCoverPhoto(m)?.imgUrl ? (
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
                <button className="dangerBtn" onClick={() => deleteMemoryReal(activeMemory.id)}>
                  Delete memory
                </button>
                <button className="iconBtn" type="button" onClick={closeMemory}>✕</button>
              </div>
            </div>

            <div className="photoToolbar">
              <div className="photoToolbarLeft">
                <div className="sectionTitle">Photos</div>
                <div className="sectionSub">
                  {activeMemory.items?.length || 0} total photo(s)
                </div>
              </div>

              <div className="photoToolbarRight">
                <button className="btn secondaryBtn" type="button" onClick={toggleSelectMode}>
                  {selectMode ? 'Cancel' : 'Select'}
                </button>

                {selectMode && selectedPhotoIds.length > 0 && (
                  <button
                    className="trashBtn"
                    type="button"
                    onClick={deleteSelectedPhotos}
                    aria-label="Delete selected photos"
                    title="Delete selected photos"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            <div className="photoGridWrap">
              {!activeMemory.items?.length ? (
                <div className="gridEmpty">No photos yet.</div>
              ) : (
                <div className="photoGrid">
                  {activeMemory.items.map((it) => {
                    const isSelected = selectedPhotoIds.includes(it.id);

                    return (
                      <button
                        key={it.id}
                        type="button"
                        className={`photoCard ${isSelected ? 'selected' : ''}`}
                        onClick={() => togglePhotoSelection(it.id)}
                      >
                        {it.imgUrl ? (
                          <img
                            src={it.imgUrl}
                            alt={it.description || 'memory'}
                            className="photoCardImg"
                          />
                        ) : (
                          <div className="photoCardImg" aria-hidden="true" />
                        )}

                        {selectMode && (
                          <div className={`selectBadge ${isSelected ? 'checked' : ''}`}>
                            {isSelected ? '✓' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="uploadBox">
              <div className="uploadTitle">Add a photo to this memory</div>

              <div className="uploadGrid">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFilePicked}
                />

                <div className="filePick">
                  <button className="fileBtn" type="button" onClick={choosePhoto}>
                    Choose photo
                  </button>
                  <div className="fileName">
                    {pendingFile ? pendingFile.name : 'No file chosen'}
                  </div>
                </div>

                <button className="btn full" type="button" onClick={uploadPhotoReal} disabled={isUploading}>
                  { isUploading ? "Uploading Photo..." : "Upload to this memory" }
                </button>

                <div className="status center">
                  {pendingFile ? '' : 'Choose a photo to upload.'}
                </div>
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

            <button className="btn" onClick={createMemoryReal}>Create memory</button>
            <div className="status">Creates a real backend album and uses its ID.</div>
          </div>
        </div>
      )}
    </div>
  );
}