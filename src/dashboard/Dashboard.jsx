import './dashboard.css';

import React, {
  useMemo,
  useRef,
  useState,
} from 'react';

const seedMemories = [
  {
    id: "m1",
    title: "Monterey",
    startDate: "2024-07-14",
    endDate: "2024-08-24",
    createdAt: "2024-08-25T00:00:00Z",
    items: [
      {
        id: "p1",
        imgUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop",
        description: "First sunset together.",
      },
      {
        id: "p2",
        imgUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop",
        description: "Walking downtown.",
      },
    ],
  },
  {
    id: "m2",
    title: "Road Trip",
    startDate: "2024-09-01",
    endDate: "2024-09-05",
    createdAt: "2024-09-06T00:00:00Z",
    items: [],
  },
];

function prettyDate(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const [y, m, d] = String(yyyyMmDd).split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRange(start, end) {
  return `${prettyDate(start)} – ${prettyDate(end)}`;
}

export default function Dashboard() {
  const [uploadKey, setUploadKey] = useState(localStorage.getItem("uploadKey") || "");
  const [memories, setMemories] = useState(() =>
    [...seedMemories].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );

  const latestId = useMemo(() => memories[0]?.id, [memories]);

  // Memory modal
  const [openMemoryId, setOpenMemoryId] = useState(null);
  const activeMemory = useMemo(
    () => memories.find((m) => m.id === openMemoryId) || null,
    [memories, openMemoryId]
  );

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Carousel
  const carouselRef = useRef(null);

  function onChangeKey(val) {
    setUploadKey(val);
    localStorage.setItem("uploadKey", val.trim());
  }

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
    setNewTitle("");
    setStartDate("");
    setEndDate("");
    setCreateOpen(true);
  }

  function hideCreate() {
    setCreateOpen(false);
  }

  function createMemoryFake() {
    // no real API — just UI skeleton
    if (!startDate || !endDate) return alert("Pick start and end date (skeleton check).");
    if (startDate > endDate) return alert("Start date cannot be after end date.");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const mem = {
      id,
      title: newTitle.trim() || "New memory",
      startDate,
      endDate,
      createdAt: now,
      items: [],
    };

    setMemories((prev) => [mem, ...prev]);
    setCreateOpen(false);
  }

  function deleteMemoryFake(id) {
    const mem = memories.find((m) => m.id === id);
    const ok = window.confirm(`Delete "${mem?.title || "this memory"}"? (skeleton only)`);
    if (!ok) return;
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setOpenMemoryId(null);
  }

  function scrollCarousel(dir) {
    const el = carouselRef.current;
    if (!el) return;
    const delta = Math.max(320, el.clientWidth * 0.9) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="dashBody">
      <main className="wrap">
        <header className="top">
          <div className="titleBlock">
            <h1>Timeline</h1>
            <p className="subtitle">ever expanding memories</p>
          </div>

          <div className="keyRow">
            <input
              className="input"
              value={uploadKey}
              onChange={(e) => onChangeKey(e.target.value)}
              placeholder="Upload key (saved on device) — UI only"
            />
            <button className="btn" onClick={showCreate}>+ New memory</button>
            <button
              className="btn"
              onClick={() => {
                localStorage.setItem("unlocked", "0");
                alert("Lock out (skeleton). Wire to router later.");
              }}
            >
              Lock out
            </button>
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
                  className={`node ${idx % 2 === 0 ? "left" : "right"}`}
                  onClick={() => openMemory(m.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="nodeTitle">{m.title}</div>
                  <div className="nodeMeta">
                    {formatRange(m.startDate, m.endDate)} • {m.items?.length || 0} photo(s)
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

      {/* Memory Modal */}
      {activeMemory && (
        <div className="modal" onClick={(e) => e.target.classList.contains("modal") && closeMemory()}>
          <div className="modalCard">
            <div className="modalTop">
              <div>
                <div className="modalTitle">{activeMemory.title}</div>
                <div className="modalSub">
                  {formatRange(activeMemory.startDate, activeMemory.endDate)} •{" "}
                  {activeMemory.items?.length || 0} photo(s)
                </div>
              </div>

              <div className="modalActions">
                <button className="dangerBtn" onClick={() => deleteMemoryFake(activeMemory.id)}>
                  Delete memory
                </button>
                <button className="iconBtn" onClick={closeMemory}>✕</button>
              </div>
            </div>

            <div className="carouselWrap">
              <button className="carNav left" onClick={() => scrollCarousel("left")} aria-label="Scroll left">
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

              <button className="carNav right" onClick={() => scrollCarousel("right")} aria-label="Scroll right">
                ›
              </button>
            </div>

            <div className="divider" />

            <div className="uploadBox">
              <div className="uploadTitle">Add a photo to this memory (UI only)</div>

              <div className="uploadGrid">
                <div className="filePick">
                  <button className="fileBtn" onClick={() => alert("No uploading yet — skeleton")}>
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

                <button className="btn full" onClick={() => alert("No uploading yet — skeleton")}>
                  Upload to this memory
                </button>

                <div className="status center">Uploading disabled in skeleton.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="modal" onClick={(e) => e.target.classList.contains("modal") && hideCreate()}>
          <div className="modalCard small">
            <div className="modalTop">
              <div className="modalTitle">Create a new memory</div>
              <button className="iconBtn" onClick={hideCreate}>✕</button>
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
            <div className="status">Skeleton: saves only in browser state.</div>
          </div>
        </div>
      )}
    </div>
  );
}