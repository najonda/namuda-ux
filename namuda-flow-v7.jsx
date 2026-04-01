import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ DESIGN TOKENS ═══ */
const T = {
  bg: { dark: '#0e0f14', light: '#f4f5f8', surface: '#fff', surfaceHover: '#fcfcfd', surfaceActive: '#f7f8fa' },
  text: { primary: '#1a1d23', secondary: '#5a5f6e', muted: '#a0a8b8', subtle: '#b0b5c0', inverse: '#fff' },
  accent: { blue: '#4f6df5', green: '#7bc67e', orange: '#e8a040', red: '#d4685a', purple: '#8b5cf6' },
  border: { light: '#eceef2', dark: 'rgba(255,255,255,0.04)', focus: '#c0c5d0', accent: '#d8ddf5' },
  radius: { xs: 4, sm: 7, md: 10, lg: 14, xl: 20, pill: 999 },
  shadow: { sm: '0 1px 3px rgba(0,0,0,0.03)', md: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)', lg: '0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)' },
  font: "'DM Sans', -apple-system, sans-serif",
};

/* ═══ CHOICE WIDGET — inline chat building block ═══ */
function ChoiceWidget({ question, options, onSelect, onSkip, allowCustom = true, customLabel = "Something else" }) {
  /* options: [{ label: string, desc?: string }]
     onSelect(index, label) — called when a predefined option is chosen
     onSelect(-1, customText) — called when custom text is submitted
     onSkip?.() — called when skip is clicked (if provided) */
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (customMode && inputRef.current) inputRef.current.focus();
  }, [customMode]);

  const handleSelect = (i) => {
    setSelected(i);
    setTimeout(() => onSelect(i, options[i].label), 200);
  };

  const handleCustomSubmit = () => {
    const v = customText.trim();
    if (!v) return;
    setSelected(-1);
    setTimeout(() => onSelect(-1, v), 200);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 480, padding: "0 24px",
      animation: "morphUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
      transformOrigin: "bottom center",
    }}>
      <div style={{
        background: T.bg.surface, borderRadius: `${T.radius.lg}px ${T.radius.lg}px ${T.radius.md}px ${T.radius.md}px`,
        boxShadow: `${T.shadow.md}, 0 -1px 4px rgba(0,0,0,0.02)`,
        overflow: "hidden",
        border: `1px solid ${T.border.light}`,
      }}>
        {/* Question header */}
        <div style={{
          padding: "16px 20px 12px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.text.secondary, lineHeight: 1.5, flex: 1 }}>
            {question}
          </div>
          {onSkip && (
            <button onClick={onSkip} style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
              fontSize: 16, color: T.text.muted, lineHeight: 1, flexShrink: 0, marginLeft: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.color = T.text.secondary}
              onMouseLeave={e => e.currentTarget.style.color = T.text.muted}
            >×</button>
          )}
        </div>

        {/* Options */}
        <div style={{ padding: "0 8px" }}>
          {options.map((opt, i) => {
            const isSelected = selected === i;
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                onClick={() => selected === null && handleSelect(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", margin: "0 0 2px",
                  borderRadius: T.radius.md,
                  background: isSelected ? T.bg.surfaceActive : isHovered ? "rgba(0,0,0,0.015)" : "transparent",
                  cursor: selected === null ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  borderBottom: i < options.length - 1 ? `1px solid ${T.border.light}` : "none",
                }}
              >
                {/* Number badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? T.accent.blue : T.bg.surfaceActive,
                  color: isSelected ? T.text.inverse : T.text.muted,
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s ease",
                }}>
                  {isSelected ? (
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path d="M1 5.5l3.5 3.5L13 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : i + 1}
                </div>

                {/* Label + optional desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: T.text.primary, fontWeight: 500, lineHeight: 1.4 }}>{opt.label}</div>
                  {opt.desc && <div style={{ fontSize: 12, color: T.text.muted, lineHeight: 1.4, marginTop: 2 }}>{opt.desc}</div>}
                </div>

                {/* Enter hint on hover */}
                {isHovered && selected === null && (
                  <div style={{
                    fontSize: 11, color: T.text.subtle, flexShrink: 0,
                    animation: "fadeUp 0.15s ease",
                  }}>↵</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Something else + Skip row */}
        {(allowCustom || onSkip) && (
          <div style={{
            padding: "8px 8px 12px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {allowCustom && !customMode && (
              <div
                onClick={() => selected === null && setCustomMode(true)}
                onMouseEnter={() => setHovered("custom")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: T.radius.md,
                  background: hovered === "custom" ? "rgba(0,0,0,0.015)" : "transparent",
                  cursor: selected === null ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Pencil icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: T.bg.surfaceActive, color: T.text.muted,
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: T.text.muted, fontWeight: 400 }}>{customLabel}</span>
              </div>
            )}

            {allowCustom && customMode && (
              <div style={{ flex: 1, display: "flex", gap: 6, padding: "4px 12px" }}>
                <input
                  ref={inputRef}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCustomSubmit(); if (e.key === "Escape") { setCustomMode(false); setCustomText(""); } }}
                  placeholder="Type your suggestion..."
                  style={{
                    flex: 1, padding: "10px 14px", fontSize: 13.5,
                    fontFamily: T.font, border: `1px solid ${T.border.accent}`,
                    borderRadius: T.radius.sm, outline: "none", background: "#fafbff",
                    color: T.text.primary,
                  }}
                />
                <button onClick={handleCustomSubmit} style={{
                  padding: "10px 16px", fontSize: 13, fontWeight: 600,
                  fontFamily: T.font, background: T.text.primary, color: T.text.inverse,
                  border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                  opacity: customText.trim() ? 1 : 0.4,
                }}>Send</button>
              </div>
            )}

            {onSkip && !customMode && (
              <button onClick={onSkip} style={{
                padding: "10px 16px", fontSize: 13, fontWeight: 500,
                fontFamily: T.font, background: "none",
                color: T.text.muted, border: `1px solid ${T.border.light}`,
                borderRadius: T.radius.sm, cursor: "pointer",
                flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.border.focus; e.currentTarget.style.color = T.text.secondary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border.light; e.currentTarget.style.color = T.text.muted; }}
              >Skip</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ RESOLVED CHOICE — compact inline display after choice was made ═══ */
function ResolvedChoice({ question, answer }) {
  return (
    <div style={{
      width: "100%", maxWidth: 480, padding: "0 24px",
      animation: "fadeUp 0.3s ease",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: T.bg.surfaceActive, borderRadius: T.radius.md,
        border: `1px solid ${T.border.light}`,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: T.accent.blue, color: T.text.inverse, fontSize: 10,
        }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: T.text.muted, lineHeight: 1.3 }}>{question}</div>
          <div style={{ fontSize: 13, color: T.text.primary, fontWeight: 500, lineHeight: 1.4 }}>{answer}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══ REFINE DIALOGUE — back-and-forth when user picks "something else" ═══ */
function RefineDialogue({ originalQuestion, userSuggestion, aiProposal, onAccept, onRefine, onCancel }) {
  /* This shows when the AI has processed the user's custom input and proposed a refined version.
     The user can accept the AI's version, refine further, or cancel back to the original choices. */
  const [refining, setRefining] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (refining && inputRef.current) inputRef.current.focus();
  }, [refining]);

  return (
    <div style={{
      width: "100%", maxWidth: 480, padding: "0 24px",
      animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        background: T.bg.surface, borderRadius: T.radius.lg,
        boxShadow: T.shadow.md, overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>
            Refining
          </div>

          {/* What the user said */}
          <div style={{
            display: "flex", justifyContent: "flex-end", marginBottom: 10,
          }}>
            <div style={{
              maxWidth: 320, padding: "8px 14px", fontSize: 13, lineHeight: 1.55,
              color: T.text.inverse, background: "#2a2e38",
              borderRadius: "14px 3px 14px 14px", fontWeight: 500,
            }}>{userSuggestion}</div>
          </div>

          {/* AI's refined proposal */}
          <div style={{
            padding: "12px 16px", background: "#f0f2ff",
            borderRadius: T.radius.md, border: `1px solid ${T.border.accent}`,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              My suggestion
            </div>
            <div style={{ fontSize: 14, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>
              {aiProposal}
            </div>
          </div>

          {!refining ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onAccept} style={{
                flex: 1, padding: "10px 16px", fontSize: 13, fontWeight: 600,
                fontFamily: T.font, background: T.text.primary, color: T.text.inverse,
                border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3 3L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Accept
              </button>
              <button onClick={() => { setRefining(true); setDraft(""); }} style={{
                flex: 1, padding: "10px 16px", fontSize: 13, fontWeight: 600,
                fontFamily: T.font, background: "transparent", color: T.text.secondary,
                border: `1px solid ${T.border.light}`, borderRadius: T.radius.sm, cursor: "pointer",
              }}>Refine further</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11.5, color: T.text.secondary, marginBottom: 6 }}>What would you change?</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onRefine(draft.trim()); setRefining(false); } if (e.key === "Escape") setRefining(false); }}
                  placeholder="Type your refinement..."
                  style={{
                    flex: 1, padding: "10px 14px", fontSize: 13,
                    fontFamily: T.font, border: `1px solid ${T.border.accent}`,
                    borderRadius: T.radius.sm, outline: "none", background: "#fafbff",
                    color: T.text.primary,
                  }}
                />
                <button onClick={() => { if (draft.trim()) { onRefine(draft.trim()); setRefining(false); } }} style={{
                  padding: "10px 14px", fontSize: 13, fontWeight: 600,
                  fontFamily: T.font, background: T.text.primary, color: T.text.inverse,
                  border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                  opacity: draft.trim() ? 1 : 0.4,
                }}>Send</button>
              </div>
              <button onClick={() => setRefining(false)} style={{
                marginTop: 6, fontSize: 11, color: T.text.muted,
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}>Cancel</button>
            </div>
          )}

          {onCancel && !refining && (
            <button onClick={onCancel} style={{
              marginTop: 8, fontSize: 11, color: T.text.muted, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: "4px 0",
              textAlign: "center",
            }}>← Back to choices</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ FIELD REVIEW CARD — Option C: mini table + interpretation quote ═══ */
function FieldReviewCard({ field, index, total, onAccept, onCustom }) {
  const [mode, setMode] = useState("propose"); // 'propose' | 'typing' | 'thinking' | 'refining'
  const [draft, setDraft] = useState("");
  const [refinedMeaning, setRefinedMeaning] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [hovered, setHovered] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "typing" && inputRef.current) inputRef.current.focus();
  }, [mode]);

  const handleUserSuggestion = (text) => {
    setChatHistory(prev => [...prev, { from: "user", text }]);
    setDraft("");
    setMode("thinking");
    setTimeout(() => {
      const refined = text.length > 50 ? text : `${text} — used for process segmentation and routing analysis`;
      setRefinedMeaning(refined);
      setChatHistory(prev => [...prev, { from: "ai", text: `OK, so what you mean is that this field is more like:\n"${refined}"\n\nDoes that capture it?` }]);
      setMode("refining");
    }, 800);
  };

  // Generate fake occurrence counts from samples
  const sampleRows = (field.samples || []).slice(0, 6).map((s, i) => ({
    value: s,
    count: Math.round(91179 / (field.samples?.length || 1) * (1 - i * 0.08)),
  }));

  return (
    <div style={{
      width: "100%", maxWidth: 600, padding: "0 24px",
      animation: "morphUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
      transformOrigin: "bottom center",
    }}>
      <div style={{
        background: T.bg.surface, borderRadius: T.radius.lg,
        boxShadow: T.shadow.md, overflow: "hidden",
        border: `1px solid ${T.border.light}`,
      }}>
        {/* Header — field type label */}
        <div style={{
          padding: "18px 24px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 13, color: T.text.secondary, fontWeight: 500 }}>
            This seems to be a <span style={{ fontWeight: 600, color: T.text.primary }}>categorical</span> field
          </div>
          <span style={{ fontSize: 11, color: T.text.muted, fontWeight: 500 }}>{index + 1} of {total}</span>
        </div>

        {/* Data table */}
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{
            border: `1px solid ${T.border.light}`, borderRadius: T.radius.md,
            overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "flex", padding: "8px 14px",
              background: T.bg.surfaceActive,
              borderBottom: `1px solid ${T.border.light}`,
            }}>
              <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                {field.n}
              </span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.6px", textAlign: "right" }}>
                Occurrences
              </span>
            </div>
            {/* Table rows */}
            {sampleRows.map((row, i) => (
              <div key={i} style={{
                display: "flex", padding: "7px 14px", alignItems: "center",
                background: i % 2 === 0 ? T.bg.surface : T.bg.surfaceActive,
                borderBottom: i < sampleRows.length - 1 ? `1px solid rgba(0,0,0,0.03)` : "none",
              }}>
                <span style={{
                  flex: 2, fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 12, fontWeight: 500, color: T.text.primary,
                }}>{row.value}</span>
                <span style={{
                  flex: 1, fontSize: 11, color: T.text.muted, textAlign: "right",
                  fontFamily: "'SF Mono', monospace",
                }}>{row.count.toLocaleString()}</span>
              </div>
            ))}
            {/* Footer showing total */}
            {field.samples && field.samples.length > 6 && (
              <div style={{
                padding: "6px 14px", background: T.bg.surfaceActive,
                borderTop: `1px solid ${T.border.light}`,
                fontSize: 10, color: T.text.muted, textAlign: "center",
              }}>
                {field.v} unique values total
              </div>
            )}
          </div>
        </div>

        {/* Interpretation section */}
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ fontSize: 13, color: T.text.secondary, fontWeight: 500, marginBottom: 10 }}>
            Is my interpretation correct?
          </div>

          {/* Interpretation as a left-bordered quote */}
          <div style={{
            padding: "12px 16px", marginBottom: 14,
            borderLeft: `3px solid ${T.accent.blue}`,
            background: "rgba(79,109,245,0.04)",
            borderRadius: "0 8px 8px 0",
          }}>
            <div style={{ fontSize: 14, color: "#2a2e60", lineHeight: 1.65, fontWeight: 400 }}>
              {field.guess}
            </div>
          </div>

          {/* Chat history — shows back-and-forth if user refined */}
          {chatHistory.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: 8, animation: "fadeUp 0.3s ease",
                }}>
                  <div style={{
                    maxWidth: "85%", padding: "8px 14px", fontSize: 13, lineHeight: 1.55,
                    borderRadius: msg.from === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                    background: msg.from === "user" ? "#2a2e38" : T.bg.surfaceActive,
                    color: msg.from === "user" ? T.text.inverse : T.text.primary,
                    fontWeight: msg.from === "user" ? 500 : 400,
                    whiteSpace: "pre-line",
                  }}>{msg.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action area */}
        <div style={{ padding: "0 16px 16px" }}>
          {mode === "propose" && (
            <>
              <div
                onClick={onAccept}
                onMouseEnter={() => setHovered("accept")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: T.radius.sm,
                  background: hovered === "accept" ? "rgba(0,0,0,0.02)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s ease",
                  borderBottom: `1px solid ${T.border.light}`,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg.surfaceActive, color: T.text.muted, fontSize: 12, fontWeight: 600 }}>1</div>
                <span style={{ fontSize: 14, color: T.text.primary, fontWeight: 500 }}>Correct</span>
                {hovered === "accept" && <span style={{ fontSize: 11, color: T.text.subtle, marginLeft: "auto" }}>↵</span>}
              </div>
              <div
                onClick={() => { setMode("typing"); setDraft(""); }}
                onMouseEnter={() => setHovered("custom")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: T.radius.sm,
                  background: hovered === "custom" ? "rgba(0,0,0,0.02)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg.surfaceActive, color: T.text.muted }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 14, color: T.text.muted }}>Tell me something else</span>
              </div>
            </>
          )}

          {mode === "typing" && (
            <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
              <input
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && draft.trim()) handleUserSuggestion(draft.trim()); if (e.key === "Escape") setMode("propose"); }}
                placeholder="Tell me what this field means..."
                style={{
                  flex: 1, padding: "11px 16px", fontSize: 13.5,
                  fontFamily: T.font, border: `1px solid ${T.border.light}`,
                  borderRadius: T.radius.sm, outline: "none", background: T.bg.surface,
                  color: T.text.primary,
                }}
              />
              <button onClick={() => { if (draft.trim()) handleUserSuggestion(draft.trim()); }} style={{
                padding: "11px 18px", fontSize: 13, fontWeight: 600,
                fontFamily: T.font, background: T.text.primary, color: T.text.inverse,
                border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                opacity: draft.trim() ? 1 : 0.4,
              }}>Send</button>
            </div>
          )}

          {mode === "thinking" && (
            <div style={{ padding: "14px", display: "flex", justifyContent: "center" }}>
              <Dots />
            </div>
          )}

          {mode === "refining" && (
            <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
              <button onClick={() => onCustom(refinedMeaning)} style={{
                flex: 1, padding: "11px 16px", fontSize: 13, fontWeight: 600,
                fontFamily: T.font, background: T.text.primary, color: T.text.inverse,
                border: "none", borderRadius: T.radius.sm, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Yes, that's it
              </button>
              <button onClick={() => { setMode("typing"); setDraft(""); }} style={{
                flex: 1, padding: "11px 16px", fontSize: 13, fontWeight: 600,
                fontFamily: T.font, background: "transparent", color: T.text.secondary,
                border: `1px solid ${T.border.light}`, borderRadius: T.radius.sm, cursor: "pointer",
              }}>Not quite, let me try again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ BLOB ═══ */
function Blob({ state, size = 420 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const sRef = useRef(state);
  sRef.current = state;
  const noise = useCallback((x,y,z) => { const p = Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453; return p-Math.floor(p); }, []);
  const sn = useCallback((x,y,z) => {
    const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz;
    const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),sz=fz*fz*(3-2*fz),l=(a,b,t)=>a+t*(b-a);
    return l(l(l(noise(ix,iy,iz),noise(ix+1,iy,iz),sx),l(noise(ix,iy+1,iz),noise(ix+1,iy+1,iz),sx),sy),
             l(l(noise(ix,iy,iz+1),noise(ix+1,iy,iz+1),sx),l(noise(ix,iy+1,iz+1),noise(ix+1,iy+1,iz+1),sx),sy),sz);
  }, [noise]);
  useEffect(() => {
    const c=canvasRef.current; if(!c) return;
    const ctx=c.getContext("2d"), dpr=window.devicePixelRatio||1;
    c.width=size*dpr; c.height=size*dpr; ctx.scale(dpr,dpr);
    const cx=size/2,cy=size/2,br=size*0.27;
    const draw=()=>{
      const s=sRef.current; tRef.current+=s==="thinking"?0.022:0.004;
      const t=tRef.current, def=s==="thinking"?0.22:0.11;
      ctx.clearRect(0,0,size,size);
      const fy=Math.sin(t*0.55)*(s==="thinking"?2:6), fx=Math.cos(t*0.4)*(s==="thinking"?1:4);
      if(s==="thinking"){for(let r=0;r<5;r++){const rt=(t*1.2+r*1.3)%5.5,rr=br*0.7+rt*size*0.06,ra=Math.max(0,1-rt/5.5)*0.08;ctx.beginPath();ctx.arc(cx+fx,cy+fy,rr,0,Math.PI*2);ctx.strokeStyle=`rgba(160,170,190,${ra})`;ctx.lineWidth=0.7;ctx.stroke();}}
      const pts=120; ctx.beginPath();
      for(let i=0;i<=pts;i++){const a=(i/pts)*Math.PI*2,nx=Math.cos(a)*1.5,ny=Math.sin(a)*1.5;
        const n1=sn(nx+t,ny+t,t*0.2)-0.5,n2=sn(nx*2.5+t*0.5,ny*2.5,t*0.35)-0.5,n3=sn(nx*0.6-t*0.25,ny*0.6+t*0.15,t*0.5)-0.5;
        const d=1+n1*def+n2*def*0.4+n3*def*0.2,x=cx+fx+Math.cos(a)*br*d,y=cy+fy+Math.sin(a)*br*d;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.closePath();
      const g=ctx.createRadialGradient(cx+fx-br*0.3,cy+fy-br*0.3,0,cx+fx,cy+fy,br*1.4);
      g.addColorStop(0,"rgba(245,246,250,0.95)");g.addColorStop(0.35,"rgba(235,238,244,0.92)");g.addColorStop(0.7,"rgba(222,226,236,0.88)");g.addColorStop(1,"rgba(210,215,228,0.85)");
      ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="rgba(185,192,210,0.2)";ctx.lineWidth=0.5;ctx.stroke();
      animRef.current=requestAnimationFrame(draw);};
    draw(); return ()=>cancelAnimationFrame(animRef.current);
  },[size,sn]);
  return <canvas ref={canvasRef} style={{width:size,height:size,display:"block"}} />;
}

/* ═══ DOT BACKGROUND ═══ */
function DotBackground({ isDark }) {
  const canvasRef = useRef(null);
  const darkRef = useRef(isDark);
  darkRef.current = isDark;
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const gap = 28, r = 0.8;
    const draw = () => {
      const w = window.innerWidth, h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dark = darkRef.current;
      ctx.fillStyle = dark ? "rgba(255,255,255,0.18)" : "rgba(160,168,184,0.3)";
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [isDark]);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ═══ HELPERS ═══ */
function TW({text,onDone,speed=30}){const[s,setS]=useState("");const i=useRef(0);
  useEffect(()=>{i.current=0;setS("");const t=setInterval(()=>{i.current++;setS(text.slice(0,i.current));if(i.current>=text.length){clearInterval(t);onDone?.();}},speed);return()=>clearInterval(t);},[text]);
  return <>{s}{s.length<text.length&&<span style={{opacity:0.3}}>|</span>}</>;}

function Thoughts({items}){const[idx,setIdx]=useState(0);const[fade,setFade]=useState(true);
  useEffect(()=>{setIdx(0);setFade(true);},[items]);
  useEffect(()=>{if(items.length<=1)return;const t=setInterval(()=>{setFade(false);setTimeout(()=>{setIdx(p=>(p+1)%items.length);setFade(true);},250);},2000);return()=>clearInterval(t);},[items]);
  return <div style={{textAlign:"center",fontSize:14,color:"#8a8f9e",fontStyle:"italic",minHeight:22,transition:"opacity 0.25s",opacity:fade?1:0}}>{items[idx]||""}</div>;}

function Dots(){return<span style={{display:"inline-flex",gap:5,alignItems:"center",height:20}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:"#b4bcc8",animation:`dp 1.2s ease infinite ${i*0.2}s`}}/>)}</span>;}

/* ═══ BLOB SPEECH — replaces on each new message ═══ */
function BlobSpeech({ text }) {
  const [fade, setFade] = useState(false);
  const [display, setDisplay] = useState(text);
  const prevRef = useRef(text);
  useEffect(() => {
    if (text !== prevRef.current) {
      setFade(true);
      const t = setTimeout(() => { setDisplay(text); setFade(false); prevRef.current = text; }, 200);
      return () => clearTimeout(t);
    }
  }, [text]);
  if (!display) return null;
  return (
    <div style={{ maxWidth: 460, textAlign: "center", padding: "0 24px", transition: "opacity 0.2s", opacity: fade ? 0 : 1 }}>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#4a5060", fontWeight: 400 }}>
        {display.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
      </div>
    </div>
  );
}

/* ═══ EDITABLE FIELD ═══ */
function EditableField({ value, onChange, style: s }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  if (editing) {
    return <input ref={inputRef} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onChange(draft); }}
      onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onChange(draft); } }}
      style={{ ...s, border: "1px solid #d0d5e0", borderRadius: 6, padding: "2px 6px", outline: "none", background: "#fff", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
    />;
  }
  return <div onClick={() => setEditing(true)} style={{ ...s, cursor: "pointer", borderRadius: 4, padding: "1px 4px", margin: "-1px -4px", transition: "background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = "#f0f1f5"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >{value}<span style={{ fontSize: 10, color: "#b0b5c0", marginLeft: 6, opacity: 0.6 }}>edit</span></div>;
}

/* ═══ STYLES ═══ */
const ps={background:"#fff",borderRadius:14,boxShadow:"0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",overflow:"hidden",animation:"panelIn 0.45s cubic-bezier(0.16,1,0.3,1)"};
const btnD={padding:"7px 18px",fontSize:12,fontWeight:600,background:"#1a1d23",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"};
const btnG={padding:"7px 18px",fontSize:12,fontWeight:600,background:"transparent",color:"#7a8194",border:"1px solid #e2e5ea",borderRadius:8,cursor:"pointer"};

/* ═══ PANELS ═══ */
const demos=[
  {id:"glamox",name:"Glamox",desc:"Purchase-to-receive",cases:"91K",period:"12 months"},
  {id:"acme",name:"Acme Corp",desc:"Order-to-cash",cases:"24K",period:"6 months"},
  {id:"techflow",name:"TechFlow",desc:"Incident management",cases:"15K",period:"9 months"},
  {id:"medicare",name:"MediCare",desc:"Patient intake",cases:"8K",period:"12 months"},
];

function DataPanel({onSelect}){
  const[tab,setTab]=useState("demo");const[sel,setSel]=useState(null);const[hov,setHov]=useState(null);
  return<div style={{...ps,width:300}}>
    <div style={{padding:"18px 20px 0"}}><div style={{fontSize:14,fontWeight:700,color:"#1a1d23",marginBottom:2}}>Connect your data</div><div style={{fontSize:11.5,color:"#8a8f9e",marginBottom:14}}>Pick a demo or upload your own.</div>
    <div style={{display:"flex",borderBottom:"1px solid #eceef2",marginBottom:12}}>{[["demo","Demo Data"],["connect","Upload"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"6px 14px",fontSize:11.5,fontWeight:600,color:tab===k?"#1a1d23":"#a0a8b8",background:"none",border:"none",borderBottom:tab===k?"2px solid #1a1d23":"2px solid transparent",cursor:"pointer",marginBottom:-1}}>{l}</button>)}</div></div>
    <div style={{padding:"0 20px 20px",maxHeight:300,overflowY:"auto"}}>{tab==="demo"?<div style={{display:"flex",flexDirection:"column",gap:5}}>{demos.map(d=><div key={d.id} onClick={()=>setSel(d.id)} onMouseEnter={()=>setHov(d.id)} onMouseLeave={()=>setHov(null)} style={{padding:"11px 13px",borderRadius:9,border:sel===d.id?"1.5px solid #1a1d23":"1.5px solid #eceef2",background:sel===d.id?"#f7f8fa":hov===d.id?"#fcfcfd":"#fff",cursor:"pointer",transition:"all 0.1s"}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600,color:"#1a1d23"}}>{d.name}</div><div style={{fontSize:11,color:"#8a8f9e"}}>{d.desc}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:600,color:"#5a5f6e"}}>{d.cases}</div><div style={{fontSize:10,color:"#a0a8b8"}}>{d.period}</div></div></div>{sel===d.id&&<div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><button onClick={e=>{e.stopPropagation();onSelect(d);}} style={btnD}>Load →</button></div>}</div>)}</div>:<div style={{padding:"24px 0",textAlign:"center"}}><div style={{width:44,height:44,borderRadius:11,background:"#f7f8fa",border:"1.5px dashed #d4d8e0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:18,color:"#a0a8b8"}}>↑</div><div style={{fontSize:12,fontWeight:600,color:"#1a1d23",marginBottom:2}}>Upload event log</div><div style={{fontSize:11,color:"#8a8f9e"}}>CSV or Parquet</div></div>}</div></div>;}

const dimFields = [
  { n: "receiving_site", v: "17", guess: "Goods receipt location — the physical site where orders are delivered", sample: "PM1, PN1, PK3, PL2...", samples: ["PM1", "PN1", "PK3", "PL2", "PM2", "PK1", "PN2", "PL1", "PM3", "PK2"] },
  { n: "purchase_office", v: "28", guess: "The purchasing office that originates the order", sample: "DE01, DE02, NO01, SE01...", samples: ["DE01", "DE02", "NO01", "SE01", "DE03", "FI01", "DK01", "NO02", "SE02", "DE04"] },
  { n: "item_group", v: "427", guess: "Product category or material group for the ordered items", sample: "MECH, ELEC, RAW, PACK...", samples: ["MECH", "ELEC", "RAW", "PACK", "CHEM", "TOOL", "SAFE", "PIPE", "VALV", "INSTR"] },
  { n: "selection_code", v: "7", guess: "Order routing code — determines which approval workflow to use. 42% null may indicate manual orders.", sample: "A1, B2, C1, null...", samples: ["A1", "B2", "C1", "A2", "B1", "C2", "null", "null", "null", "A1"] },
  { n: "item_signal", v: "8", guess: "Procurement automation signal — 95% null suggests this field is rarely used or deprecated", sample: "AUTO, MANUAL, null...", samples: ["null", "null", "null", "AUTO", "null", "null", "null", "MANUAL", "null", "null"] },
];

function FieldPanel({ currentIdx, fields, onAccept, onAcceptField }) {
  const current = fields[currentIdx];
  const done = fields.filter(f => f.confirmed);
  const remaining = fields.length - done.length;
  return (
    <div style={{ ...ps, width: 640 }}>
      <div style={{ display: "flex" }}>
        {/* Left — all fields overview */}
        <div style={{ width: 220, borderRight: "1px solid #eceef2", padding: "18px 16px" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Core Fields</div>
          {[
            { n: "case_id", d: "91,179 unique orders" },
            { n: "activity_name", d: "9 activities" },
            { n: "timestamp", d: "Timestamps" },
          ].map(f => (
            <div key={f.n} style={{ padding: "5px 8px", borderRadius: 4, marginBottom: 2, background: "#f8f9fb", borderLeft: "3px solid #4f6df5" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#4f6df5", fontWeight: 600 }}>{f.n}</div>
              <div style={{ fontSize: 9.5, color: "#a0a8b8" }}>{f.d}</div>
            </div>
          ))}
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 12, marginBottom: 8 }}>Dimensions ({remaining} left)</div>
          {fields.map((f, i) => (
            <div key={f.n} style={{
              padding: "5px 8px", borderRadius: 4, marginBottom: 2,
              background: i === currentIdx ? "#f0f2ff" : f.confirmed ? "#f8f9fb" : "#fafbfc",
              borderLeft: `3px solid ${i === currentIdx ? "#4f6df5" : f.confirmed ? "#7bc67e" : "#e0e2e8"}`,
              opacity: f.confirmed && i !== currentIdx ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 10.5, color: i === currentIdx ? "#4f6df5" : "#3a3f4a", fontWeight: 600 }}>{f.n}</span>
                {f.confirmed && <span style={{ fontSize: 8, color: "#7bc67e" }}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Right — current field detail */}
        <div style={{ flex: 1, padding: "18px 22px" }}>
          {current ? (<>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 4 }}>Field {currentIdx + 1} of {fields.length}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>{current.n}</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#a0a8b8" }}>{current.v} unique values</div>
              <div style={{ fontSize: 11, color: "#a0a8b8" }}>Sample: {current.sample}</div>
            </div>

            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>My interpretation</div>
            <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#2a2e60", lineHeight: 1.6 }}>{current.confirmed ? current.meaning : current.guess}</div>
            </div>

            {current.confirmed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#7bc67e", fontWeight: 600 }}>Confirmed</span>
                <span style={{ fontSize: 11, color: "#a0a8b8" }}>{current.meaning !== current.guess ? "(corrected by you)" : ""}</span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11.5, color: "#7a8194", marginBottom: 10 }}>Does this look right? Accept it, or type a correction in the chat below.</div>
                <button onClick={() => onAcceptField(currentIdx)} style={btnD}>Accept interpretation →</button>
              </div>
            )}
          </>) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 24, color: "#7bc67e" }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>All fields reviewed</div>
              <div style={{ fontSize: 12, color: "#7a8194" }}>You can go back and edit any field, or continue.</div>
              <button onClick={onAccept} style={btnD}>Continue →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ FIELD CARD (inline chat) ═══ */
function FieldCard({ field, index, total, onAccept, onRefine }) {
  const [refining, setRefining] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Field {index + 1} of {total}</span>
            <span style={{ fontSize: 10, color: "#a0a8b8" }}>{field.v} values</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#1a1d23", marginBottom: 8 }}>{field.n}</div>
          {field.samples && (
            <div style={{ background: "#f8f9fb", borderRadius: 8, padding: "6px 10px", marginBottom: 12, border: "1px solid #eceef2" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Sample values</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {field.samples.map((s, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: 9.5, color: "#5a5f6e", padding: "1.5px 0", borderBottom: i < field.samples.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none" }}>{s}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: "10px 13px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>AI interpretation</div>
            <div style={{ fontSize: 13, color: "#2a2e60", lineHeight: 1.6 }}>{field.guess}</div>
          </div>
          {!refining ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onAccept} style={{ ...btnD, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>✓</span> Accept
              </button>
              <button onClick={() => { setRefining(true); setDraft(""); }} style={{ ...btnG, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>✎</span> Refine
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: "#7a8194", marginBottom: 6 }}>What does this field actually mean?</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onRefine(draft.trim()); } }}
                  placeholder="Type your interpretation..."
                  style={{ flex: 1, padding: "8px 12px", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", border: "1px solid #d8ddf5", borderRadius: 8, outline: "none", background: "#fafbff" }}
                />
                <button onClick={() => { if (draft.trim()) onRefine(draft.trim()); }} style={{ ...btnD, padding: "8px 14px" }}>Submit</button>
              </div>
              <button onClick={() => setRefining(false)} style={{ marginTop: 6, fontSize: 11, color: "#a0a8b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ FIELD PROGRESS (sidebar) ═══ */
function FieldProgress({ fields, currentIdx }) {
  const coreFields = [
    { n: "case_id", d: "91,179 unique" },
    { n: "activity_name", d: "9 activities" },
    { n: "timestamp", d: "Timestamps" },
  ];
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 180,
      background: "#fff", borderRadius: 12, padding: "14px 14px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
      animation: "panelIn 0.45s cubic-bezier(0.16,1,0.3,1)", zIndex: 8,
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Core Fields</div>
      {coreFields.map(f => (
        <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
          <span style={{ fontSize: 10, color: "#7bc67e" }}>✓</span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7a8194" }}>{f.n}</span>
        </div>
      ))}
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 10, marginBottom: 6 }}>Dimensions</div>
      {fields.map((f, i) => {
        const isCurrent = i === currentIdx;
        const isDone = f.confirmed;
        return (
          <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
            <span style={{ fontSize: 10, color: isDone ? "#7bc67e" : isCurrent ? "#4f6df5" : "#d0d5e0" }}>
              {isDone ? "✓" : isCurrent ? "●" : "○"}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: isCurrent ? "#4f6df5" : isDone ? "#7a8194" : "#b0b5c0", fontWeight: isCurrent ? 600 : 400 }}>{f.n}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══ CORE FIELDS EDUCATION — animated step-by-step build-up + field selection ═══ */
function CoreFieldsEducation({ onAccept }) {
  const [step, setStep] = useState(0); // 0=table, 1=highlight-case, 2=traces, 3=graph, 4=select-fields
  const [hlRow, setHlRow] = useState(-1);
  const [graphEdges, setGraphEdges] = useState(0);
  const [graphNodes, setGraphNodes] = useState(0);
  const [traceAnim, setTraceAnim] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  // Field selection state — user maps columns
  const [selections, setSelections] = useState({ case_id: null, activity: null, timestamp: null });

  const dataColumns = [
    { n: "case_id", samples: ["PO-2024-00142", "PO-2024-00143", "PO-2024-00144", "PO-2024-00145", "PO-2024-00146", "PO-2024-00147", "PO-2024-00148", "PO-2024-00149", "PO-2024-00150", "PO-2024-00151"] },
    { n: "activity_name", samples: ["Created", "Free", "Approved", "Sent", "In Process", "Confirmed", "Conf.Chgd", "Received", "Closed", "Blocked"] },
    { n: "timestamp", samples: ["2024-08-01 09:12", "2024-08-01 09:15", "2024-08-01 10:30", "2024-08-01 14:22", "2024-08-02 08:05", "2024-08-02 11:40", "2024-08-03 09:00", "2024-08-03 16:18", "2024-08-05 10:22", "2024-08-06 08:45"] },
    { n: "receiving_site", samples: ["PM1", "PN1", "PK3", "PL2", "PM2", "PK1", "PN2", "PL1", "PM3", "PK2"] },
    { n: "purchase_office", samples: ["DE01", "DE02", "NO01", "SE01", "DE03", "FI01", "DK01", "NO02", "SE02", "DE04"] },
    { n: "item_group", samples: ["MECH", "ELEC", "RAW", "PACK", "CHEM", "TOOL", "SAFE", "PIPE", "VALV", "INSTR"] },
  ];

  const roles = [
    { key: "case_id", label: "Case ID", desc: "The entity moving through the process", color: "#4f6df5", icon: "◉" },
    { key: "activity", label: "Activity", desc: "What happened at each step", color: "#e8a040", icon: "▸" },
    { key: "timestamp", label: "Timestamp", desc: "When each event occurred", color: "#45b080", icon: "◷" },
  ];

  const events = [
    { case_id: "PO-142", activity: "Created",   ts: "Aug 1  09:12" },
    { case_id: "PO-142", activity: "Free",       ts: "Aug 1  09:15" },
    { case_id: "PO-143", activity: "Created",   ts: "Aug 1  09:30" },
    { case_id: "PO-142", activity: "Approved",  ts: "Aug 1  10:30" },
    { case_id: "PO-143", activity: "Free",       ts: "Aug 1  10:45" },
    { case_id: "PO-144", activity: "Created",   ts: "Aug 1  11:00" },
    { case_id: "PO-142", activity: "Sent",      ts: "Aug 1  14:22" },
    { case_id: "PO-143", activity: "Approved",  ts: "Aug 2  08:10" },
    { case_id: "PO-144", activity: "Free",       ts: "Aug 2  08:30" },
    { case_id: "PO-142", activity: "Confirmed", ts: "Aug 2  11:40" },
    { case_id: "PO-143", activity: "Sent",      ts: "Aug 2  14:00" },
    { case_id: "PO-144", activity: "Approved",  ts: "Aug 3  09:00" },
    { case_id: "PO-142", activity: "Received",  ts: "Aug 3  16:18" },
    { case_id: "PO-143", activity: "Confirmed", ts: "Aug 3  16:30" },
    { case_id: "PO-144", activity: "Sent",      ts: "Aug 4  10:00" },
    { case_id: "PO-143", activity: "Received",  ts: "Aug 5  10:22" },
    { case_id: "PO-144", activity: "Confirmed", ts: "Aug 5  14:00" },
    { case_id: "PO-144", activity: "Received",  ts: "Aug 6  08:45" },
  ];

  const cases = {
    "PO-142": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
    "PO-143": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
    "PO-144": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
  };

  const activities = ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"];
  const graphEdgesDef = [[0,1],[1,2],[2,3],[3,4],[4,5]];
  const caseColors = { "PO-142": "#4f6df5", "PO-143": "#e8a040", "PO-144": "#45b080" };

  // Step 1: highlight rows for PO-142 one by one
  useEffect(() => {
    if (step === 1) {
      setHlRow(-1);
      let row = 0;
      const caseRows = events.map((e, i) => e.case_id === "PO-142" ? i : -1).filter(i => i >= 0);
      const t = setInterval(() => {
        if (row < caseRows.length) { setHlRow(caseRows[row]); row++; }
        else clearInterval(t);
      }, 400);
      return () => clearInterval(t);
    }
  }, [step]);

  // Step 2: animate traces appearing
  useEffect(() => {
    if (step === 2) {
      setTraceAnim(0);
      let c = 0;
      const t = setInterval(() => { c++; setTraceAnim(c); if (c >= 3) clearInterval(t); }, 600);
      return () => clearInterval(t);
    }
  }, [step]);

  // Step 3: animate graph nodes then edges
  useEffect(() => {
    if (step === 3) {
      setGraphNodes(0); setGraphEdges(0);
      let n = 0;
      const nt = setInterval(() => { n++; setGraphNodes(n); if (n >= activities.length) { clearInterval(nt); let e = 0; const et = setInterval(() => { e++; setGraphEdges(e); if (e >= graphEdgesDef.length) clearInterval(et); }, 300); } }, 200);
      return () => clearInterval(nt);
    }
  }, [step]);

  // Step 4: auto-select correct fields on mount
  useEffect(() => {
    if (step === 4) {
      setSelections({ case_id: "case_id", activity: "activity_name", timestamp: "timestamp" });
    }
  }, [step]);

  const allSelected = selections.case_id && selections.activity && selections.timestamp;
  const selectedCols = new Set(Object.values(selections).filter(Boolean));

  const handleConfirm = () => {
    setFadeOut(true);
    setTimeout(() => onAccept(), 500);
  };

  const assignRole = (colName, roleKey) => {
    setSelections(prev => {
      const next = { ...prev };
      // Remove this column from any other role
      for (const k of Object.keys(next)) { if (next[k] === colName) next[k] = null; }
      next[roleKey] = colName;
      return next;
    });
  };

  const getRoleForCol = (colName) => {
    for (const [k, v] of Object.entries(selections)) { if (v === colName) return k; }
    return null;
  };

  const stepTitles = [
    "Your data is an event log",
    "Follow one case through its journey",
    "Cases become traces — paths through the process",
    "The process map reveals itself",
    "Confirm your column mapping",
  ];

  const stepDescs = [
    "Process mining starts with three columns: which entity (case), what happened (activity), and when (timestamp). Everything else builds from here.",
    "Each case_id represents one journey \u2014 a purchase order, a patient visit, a support ticket. Watch PO-142 move through each step.",
    "Group events by case, sort by time. Each case becomes a trace \u2014 the sequence of activities it passed through.",
    "When thousands of traces follow similar paths, the process structure emerges. This is the foundation of process mining.",
    "I detected these columns in your data. Confirm the mapping, or adjust if needed.",
  ];

  const nodePositions = activities.map((a, i) => ({ label: a, x: 8 + i * 52, y: 24 }));
  const totalSteps = 5;

  return (
    <div style={{
      width: "100%", maxWidth: 680, padding: "0 24px",
      animation: fadeOut ? "none" : "snapIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      opacity: fadeOut ? 0 : 1, transform: fadeOut ? "scale(0.97) translateY(8px)" : "none",
      transition: fadeOut ? "opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,0.2,1)" : "none",
    }}>
      <div style={{ background: T.bg.surface, borderRadius: T.radius.lg, boxShadow: T.shadow.lg, overflow: "hidden", border: `1px solid ${T.border.light}` }}>
        <div style={{ padding: "28px 32px 24px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Core Fields</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, marginBottom: 8, lineHeight: 1.3, transition: "all 0.3s", fontFamily: T.font }}>{stepTitles[step]}</div>
            <div style={{ fontSize: 13.5, color: T.text.secondary, lineHeight: 1.65, maxWidth: 560 }}>{stepDescs[step]}</div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, fontFamily: T.font }}>Step {step + 1} of {totalSteps}</span>
              <span style={{ fontSize: 11, color: T.text.muted }}>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: T.bg.light, borderRadius: T.radius.pill, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: `linear-gradient(90deg, ${T.accent.blue}, #6b8af7)`,
                borderRadius: T.radius.pill,
                width: `${((step + 1) / totalSteps) * 100}%`,
                transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
            </div>
          </div>

          {/* Column labels — steps 0 & 1 */}
          {(step === 0 || step === 1) && (
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {[
                { n: "case_id", desc: "Which journey", color: T.accent.blue },
                { n: "activity", desc: "What happened", color: T.accent.orange },
                { n: "timestamp", desc: "When", color: "#45b080" },
              ].map((col, ci) => (
                <div key={ci} style={{
                  flex: ci === 2 ? 1.1 : 1, padding: "10px 12px",
                  background: step === 1 && ci === 0 ? "rgba(79,109,245,0.06)" : T.bg.surfaceActive,
                  borderRadius: T.radius.sm, transition: "background 0.3s",
                  border: `1px solid ${step === 1 && ci === 0 ? "rgba(79,109,245,0.15)" : T.border.light}`,
                }}>
                  <div style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: col.color, letterSpacing: "-0.2px" }}>{col.n}</div>
                  <div style={{ fontSize: 10.5, color: T.text.muted, marginTop: 3 }}>{col.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Step 0 & 1: Event log table */}
          {(step === 0 || step === 1) && (
            <div style={{ maxHeight: 290, overflowY: "auto", borderRadius: T.radius.md, marginBottom: 16, border: `1px solid ${T.border.light}`, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{
                display: "flex", padding: "8px 14px", fontSize: 9, fontWeight: 700,
                fontFamily: "'SF Mono', 'Fira Code', monospace", textTransform: "uppercase", letterSpacing: "0.5px",
                background: "#f0f2f5", color: T.text.muted, borderBottom: `1px solid ${T.border.light}`,
                position: "sticky", top: 0, zIndex: 1,
              }}>
                <span style={{ flex: 1 }}>case_id</span>
                <span style={{ flex: 1 }}>activity</span>
                <span style={{ flex: 1.1 }}>timestamp</span>
              </div>
              {events.map((e, i) => {
                const isHl = step === 1 && e.case_id === "PO-142";
                const isActive = step === 1 && hlRow >= i && e.case_id === "PO-142";
                return (
                  <div key={i} style={{
                    display: "flex", padding: "8px 14px", fontSize: 11.5,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    background: isActive ? "rgba(79,109,245,0.08)" : isHl && hlRow < i ? "rgba(79,109,245,0.03)" : i % 2 === 0 ? T.bg.surfaceActive : T.bg.surface,
                    borderBottom: `1px solid ${i % 2 === 0 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.02)"}`,
                    transition: "background 0.3s",
                    opacity: step === 1 && e.case_id !== "PO-142" ? 0.3 : 1,
                  }}>
                    <span style={{ flex: 1, color: caseColors[e.case_id] || T.text.secondary, fontWeight: isActive ? 700 : 500 }}>{e.case_id}</span>
                    <span style={{ flex: 1, color: T.text.secondary }}>{e.activity}</span>
                    <span style={{ flex: 1.1, color: T.text.muted }}>{e.ts}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Traces */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, minHeight: 140 }}>
              {Object.entries(cases).map(([caseId, acts], ci) => (
                <div key={caseId} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "14px 16px",
                  background: T.bg.surfaceActive, borderRadius: T.radius.md, border: `1px solid ${T.border.light}`,
                  opacity: ci < traceAnim ? 1 : 0, transform: ci < traceAnim ? "translateX(0)" : "translateX(-12px)",
                  transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <span style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, fontWeight: 700,
                    color: caseColors[caseId], minWidth: 56,
                    padding: "4px 8px", background: `${caseColors[caseId]}10`, borderRadius: T.radius.xs,
                  }}>{caseId}</span>
                  {acts.map((a, ai) => (
                    <span key={ai} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        padding: "5px 10px", borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600,
                        background: "#f0f2ff", color: T.accent.blue, border: "1px solid rgba(79,109,245,0.15)",
                        letterSpacing: "-0.1px",
                      }}>{a}</span>
                      {ai < acts.length - 1 && (
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ width: 12, height: 1, background: T.border.focus, display: "inline-block" }} />
                          <span style={{ color: T.border.focus, fontSize: 10, marginLeft: -1 }}>{"\u25B8"}</span>
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
              {traceAnim >= 3 && (
                <div style={{
                  fontSize: 12, color: T.text.secondary, fontStyle: "italic", padding: "8px 16px",
                  background: "rgba(79,109,245,0.04)", borderRadius: T.radius.sm, border: `1px solid ${T.border.accent}`,
                  lineHeight: 1.5, animation: "snapIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  All 3 cases follow the same path {"\u2014"} this is the "happy path" variant.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Process graph */}
          {step === 3 && (
            <div style={{ marginBottom: 16, padding: "16px 0" }}>
              <svg width="100%" viewBox="0 0 320 90" style={{ display: "block" }}>
                <defs>
                  <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="160%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
                  </filter>
                </defs>
                {graphEdgesDef.map(([from, to], i) => {
                  if (i >= graphEdges) return null;
                  const a = nodePositions[from], b = nodePositions[to];
                  const ax = a.x + 26, bx = b.x + 26;
                  return <g key={`e${i}`} style={{ animation: "snapIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                    <line x1={ax} y1={a.y + 14} x2={bx} y2={b.y + 14} stroke={T.border.focus} strokeWidth="1.5" />
                    <polygon points={`${bx-6},${b.y+10} ${bx-6},${b.y+18} ${bx-1},${b.y+14}`} fill={T.border.focus} />
                    <text x={(ax+bx)/2} y={a.y + 4} textAnchor="middle" fontSize="8" fill={T.text.muted} fontWeight="600">3</text>
                  </g>;
                })}
                {activities.map((a, i) => {
                  if (i >= graphNodes) return null;
                  const p = nodePositions[i];
                  const isFirst = i === 0;
                  const isLast = i === activities.length - 1;
                  return <g key={`n${i}`} style={{ animation: "snapIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }} filter="url(#nodeShadow)">
                    <rect x={p.x} y={p.y} width={52} height={28} rx="8"
                      fill={isFirst ? "#e8f0fe" : isLast ? "#e6f7ee" : "#f0f2ff"}
                      stroke={isFirst ? T.accent.blue : isLast ? "#45b080" : "rgba(79,109,245,0.3)"}
                      strokeWidth="1.5" />
                    <text x={p.x + 26} y={p.y + 17} textAnchor="middle" fontSize="8.5" fontWeight="700"
                      fill={isFirst ? T.accent.blue : isLast ? "#45b080" : T.text.primary}
                      fontFamily="'DM Sans', sans-serif">{a}</text>
                  </g>;
                })}
              </svg>
              {graphEdges >= graphEdgesDef.length && (
                <div style={{
                  fontSize: 12, color: T.text.secondary, fontStyle: "italic", padding: "10px 16px",
                  background: "rgba(79,109,245,0.04)", borderRadius: T.radius.sm, border: `1px solid ${T.border.accent}`,
                  lineHeight: 1.5, marginTop: 8, animation: "snapIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  Each arrow shows a directly-follows relation {"\u2014"} the backbone of process mining.
                </div>
              )}
            </div>
          )}

          {/* Step 4: Field selection */}
          {step === 4 && (
            <div style={{ animation: "snapIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
              {/* Role badges at top */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {roles.map(r => (
                  <div key={r.key} style={{
                    flex: 1, padding: "14px 14px 12px", borderRadius: T.radius.md,
                    background: selections[r.key] ? `${r.color}08` : T.bg.surfaceActive,
                    border: selections[r.key] ? `2px solid ${r.color}` : `2px solid ${T.border.light}`,
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow: selections[r.key] ? `0 2px 12px ${r.color}15` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, color: r.color, lineHeight: 1 }}>{r.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.color, letterSpacing: "-0.2px" }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.text.muted, lineHeight: 1.4 }}>{r.desc}</div>
                    {selections[r.key] && (
                      <div style={{
                        marginTop: 8, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11, fontWeight: 700,
                        color: r.color, animation: "snapIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                        padding: "4px 8px", background: `${r.color}10`, borderRadius: T.radius.xs, display: "inline-block",
                      }}>
                        {"\u2713"} {selections[r.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Column cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                {dataColumns.map((col) => {
                  const role = getRoleForCol(col.n);
                  const roleObj = role ? roles.find(r => r.key === role) : null;
                  return (
                    <div key={col.n} style={{
                      padding: "14px 14px 12px", borderRadius: T.radius.md, cursor: "pointer",
                      background: role ? `${roleObj.color}06` : T.bg.surface,
                      border: role ? `2px solid ${roleObj.color}` : `2px solid ${T.border.light}`,
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: role ? `0 2px 8px ${roleObj.color}12` : T.shadow.sm,
                      opacity: role ? 1 : 0.75,
                    }}
                    onMouseEnter={e => { if (!role) { e.currentTarget.style.borderColor = T.border.focus; e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = T.shadow.md; } }}
                    onMouseLeave={e => { if (!role) { e.currentTarget.style.borderColor = T.border.light; e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.boxShadow = T.shadow.sm; } }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, fontWeight: 700, color: roleObj ? roleObj.color : T.text.primary }}>{col.n}</span>
                        {role && <span style={{
                          fontSize: 10, fontWeight: 700, color: roleObj.color,
                          background: `${roleObj.color}15`, padding: "3px 8px", borderRadius: T.radius.xs,
                          letterSpacing: "0.2px",
                        }}>{roleObj.label}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {col.samples.slice(0, 5).map((s, i) => (
                          <div key={i} style={{
                            fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 10.5,
                            color: role ? T.text.secondary : T.text.subtle,
                            padding: "2px 0", transition: "color 0.2s",
                          }}>{s}</div>
                        ))}
                      </div>
                      {/* Role assignment buttons */}
                      {!role && (
                        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                          {roles.filter(r => !selections[r.key]).map(r => (
                            <button key={r.key} onClick={(e) => { e.stopPropagation(); assignRole(col.n, r.key); }}
                              style={{
                                padding: "4px 8px", fontSize: 10, fontWeight: 600,
                                background: `${r.color}10`, color: r.color, border: `1px solid ${r.color}30`,
                                borderRadius: T.radius.xs, cursor: "pointer", transition: "all 0.15s",
                                fontFamily: T.font,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = `${r.color}25`; }}
                              onMouseLeave={e => { e.currentTarget.style.background = `${r.color}10`; }}
                            >{r.icon} {r.label}</button>
                          ))}
                        </div>
                      )}
                      {role && (
                        <button onClick={(e) => { e.stopPropagation(); setSelections(prev => ({ ...prev, [role]: null })); }}
                          style={{
                            marginTop: 8, padding: "3px 8px", fontSize: 10, fontWeight: 500,
                            color: T.text.muted, background: "transparent", border: `1px solid ${T.border.light}`,
                            borderRadius: T.radius.xs, cursor: "pointer", fontFamily: T.font,
                          }}
                        >Change</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 16, borderTop: `1px solid ${T.border.light}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {Array.from({ length: totalSteps }).map((_, s) => (
                <div key={s} style={{
                  width: s === step ? 24 : 8, height: 8, borderRadius: T.radius.pill,
                  background: s === step ? T.accent.blue : s < step ? "#b0c4ff" : T.border.light,
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  ...btnG, padding: "10px 24px", fontSize: 13, borderRadius: T.radius.sm,
                }}>{"\u2190"} Back</button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} style={{
                  ...btnD, padding: "10px 24px", fontSize: 13, borderRadius: T.radius.sm,
                  background: T.text.primary, letterSpacing: "-0.1px",
                }}>
                  {step === 0 ? "Follow a case \u2192" : step === 1 ? "See the traces \u2192" : "Build the map \u2192"}
                </button>
              ) : step === 3 && graphEdges >= graphEdgesDef.length ? (
                <button onClick={() => setStep(4)} style={{
                  ...btnD, padding: "10px 24px", fontSize: 13, borderRadius: T.radius.sm,
                  background: T.accent.blue, boxShadow: "0 2px 12px rgba(79,109,245,0.3)",
                  letterSpacing: "-0.1px",
                }}>Select my fields {"\u2192"}</button>
              ) : step === 4 && allSelected ? (
                <button onClick={handleConfirm} style={{
                  ...btnD, padding: "10px 28px", fontSize: 13, fontWeight: 700, borderRadius: T.radius.sm,
                  background: "linear-gradient(135deg, #4f6df5 0%, #6b82f7 100%)",
                  boxShadow: "0 2px 16px rgba(79,109,245,0.35)",
                  animation: "snapIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  letterSpacing: "-0.1px",
                }}>Confirm fields {"\u2192"}</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ STRATEGY ANIMATION — mission → value chain → goals ═══ */
function StrategyAnimation({ step, mission }) {
  // step 0: nothing, 1: strategy node, 2: three processes, 3: zoom procurement, 4: goals emerge, 5: fade out
  const processes = [
    { id: "procurement", label: "Procurement", x: 200, y: 200, color: T.accent.blue, active: true },
    { id: "production", label: "Production", x: 400, y: 140, color: T.accent.orange, active: false },
    { id: "logistics", label: "Logistics", x: 400, y: 260, color: T.accent.green, active: false },
  ];
  const goals = [
    { label: "Reduce throughput", x: 80, y: 110 },
    { label: "Lower rework", x: 80, y: 190 },
    { label: "Improve data quality", x: 80, y: 270 },
    { label: "Increase conformance", x: 80, y: 350 },
  ];

  // Zoom transform for step 3+
  const isZoomed = step >= 3;
  const isFading = step >= 5;

  return (
    <div style={{
      width: "100%", maxWidth: 560, padding: "0 24px",
      opacity: isFading ? 0 : 1,
      transform: isFading ? "scale(0.95) translateY(10px)" : "none",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div style={{
        background: T.bg.surface, borderRadius: T.radius.lg,
        boxShadow: T.shadow.md, overflow: "hidden",
        border: `1px solid ${T.border.light}`,
        padding: "24px",
      }}>
        <svg width="100%" viewBox={isZoomed ? "0 60 300 340" : "0 0 500 320"} style={{
          display: "block", transition: "viewBox 1.2s cubic-bezier(0.16,1,0.3,1)",
          minHeight: isZoomed ? 280 : 220,
        }}>
          <defs>
            <filter id="nodeShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08"/></filter>
            <filter id="glowBlue"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={T.accent.blue} floodOpacity="0.25"/></filter>
          </defs>

          {/* Strategy node — center top */}
          {step >= 1 && (
            <g style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
              <rect x="195" y="20" width="110" height="40" rx="12" fill={T.text.primary} filter="url(#nodeShadow)" />
              <text x="250" y="45" textAnchor="middle" fill={T.text.inverse} fontSize="11" fontWeight="700" fontFamily={T.font}>Strategy</text>
            </g>
          )}

          {/* Connecting lines from strategy to processes */}
          {step >= 2 && processes.map((p, i) => (
            <line key={`line-${i}`}
              x1="250" y1="60" x2={p.x + 55} y2={p.y}
              stroke={isZoomed && !p.active ? T.border.light : p.color}
              strokeWidth={isZoomed && p.active ? "2.5" : "1.5"}
              strokeDasharray={isZoomed && !p.active ? "4,4" : "none"}
              opacity={isZoomed && !p.active ? 0.3 : 1}
              style={{ animation: `fadeUp ${0.4 + i * 0.15}s cubic-bezier(0.16,1,0.3,1)`, transition: "all 0.8s ease" }}
            />
          ))}

          {/* Process nodes */}
          {step >= 2 && processes.map((p, i) => {
            const isActive = p.active && isZoomed;
            return (
              <g key={p.id} style={{
                animation: `fadeUp ${0.5 + i * 0.15}s cubic-bezier(0.16,1,0.3,1)`,
                transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
                opacity: isZoomed && !p.active ? 0.25 : 1,
              }}>
                <rect
                  x={isActive ? 100 : p.x} y={isActive ? 90 : p.y}
                  width={isActive ? 140 : 110} height={isActive ? 48 : 36} rx="10"
                  fill={isActive ? p.color : T.bg.surface}
                  stroke={p.color} strokeWidth={isActive ? "2.5" : "1.5"}
                  filter={isActive ? "url(#glowBlue)" : "url(#nodeShadow)"}
                  style={{ transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                />
                <text
                  x={isActive ? 170 : p.x + 55} y={isActive ? 118 : p.y + 22}
                  textAnchor="middle" fontSize={isActive ? "13" : "10"} fontWeight="600"
                  fill={isActive ? T.text.inverse : T.text.primary} fontFamily={T.font}
                  style={{ transition: "all 0.8s ease" }}
                >{p.label}</text>
              </g>
            );
          })}

          {/* Mission statement under procurement (when zoomed) */}
          {step >= 3 && (
            <g style={{ animation: "fadeUp 0.5s ease" }}>
              <text x="170" y="158" textAnchor="middle" fontSize="8" fill={T.text.muted} fontFamily={T.font} fontStyle="italic">
                {(mission || "").length > 60 ? (mission || "").slice(0, 57) + "..." : mission}
              </text>
            </g>
          )}

          {/* Goal nodes branching from procurement */}
          {step >= 4 && goals.map((g, i) => (
            <g key={`goal-${i}`} style={{ animation: `fadeUp ${0.3 + i * 0.12}s cubic-bezier(0.34,1.56,0.64,1)` }}>
              {/* Connecting line */}
              <line x1="170" y1="138" x2={g.x + 60} y2={g.y + 14}
                stroke={T.accent.blue} strokeWidth="1" opacity="0.3" strokeDasharray="3,3" />
              {/* Goal card */}
              <rect x={g.x} y={g.y} width="120" height="28" rx="8"
                fill={T.bg.surface} stroke={T.accent.blue} strokeWidth="1.5"
                filter="url(#nodeShadow)" />
              {/* Goal number */}
              <circle cx={g.x + 14} cy={g.y + 14} r="8"
                fill={`${T.accent.blue}15`} stroke={T.accent.blue} strokeWidth="0.5" />
              <text x={g.x + 14} y={g.y + 18} textAnchor="middle"
                fontSize="8" fontWeight="700" fill={T.accent.blue} fontFamily={T.font}>{i + 1}</text>
              {/* Goal label */}
              <text x={g.x + 30} y={g.y + 18} fontSize="8.5" fontWeight="500"
                fill={T.text.primary} fontFamily={T.font}>{g.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function GoalsPanel({onAccept, onSkip}){
  const gs=[
    {n:"Reduce throughput time", desc:"Orders take 18.8 days on average — your fastest site proves 7.7 is possible. We'll target the approval bottleneck and waiting times."},
    {n:"Lower rework rate", desc:"52% of orders loop through 'Confirmed Changed'. We'll investigate manual re-entry errors, vendor changes, and specification mismatches."},
    {n:"Improve data quality", desc:"Two key fields are mostly empty — limiting what we can analyze and automate. We'll fix population at source."},
    {n:"Increase conformance", desc:"1,175 process variants across 17 sites. We'll standardize high-volume paths and eliminate low-frequency deviations."},
  ];
  const [selected, setSelected] = useState(new Set([0,1,2,3]));
  const toggle = (i) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  return (
    <div style={{...ps, width: 480, maxWidth: "90vw"}}>
      <div style={{padding:"22px 26px 0"}}>
        <div style={{fontSize:15,fontWeight:700,color:"#1a1d23",marginBottom:3}}>Suggested Goals</div>
        <div style={{fontSize:12,color:"#8a8f9e",marginBottom:18}}>Select the goals that matter most for your process.</div>
      </div>
      <div style={{padding:"0 26px",maxHeight:"55vh",overflowY:"auto"}}>
        {gs.map((g,i) => {
          const active = selected.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              padding:"14px 16px", borderRadius:11, marginBottom:8, cursor:"pointer",
              border: active ? "1.5px solid #4f6df5" : "1.5px solid #e8ebf0",
              background: active ? "#f5f7ff" : "#fff",
              transition: "all 0.2s ease",
              display:"flex", gap:14, alignItems:"flex-start",
            }}>
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: active ? "#4f6df5" : "#f0f2f5",
                color: active ? "#fff" : "#8a8f9e",
                fontSize:13, fontWeight:700,
                transition: "all 0.2s ease",
              }}>{i + 1}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:"#1a1d23",marginBottom:3}}>{g.n}</div>
                <div style={{fontSize:11.5,color:"#6a7086",lineHeight:1.55}}>{g.desc}</div>
              </div>
              <div style={{
                width:18, height:18, borderRadius:5, flexShrink:0, marginTop:2,
                border: active ? "none" : "1.5px solid #d0d5e0",
                background: active ? "#4f6df5" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition: "all 0.2s ease",
              }}>
                {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{padding:"16px 26px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onSkip} style={{...btnG, color:"#a0a8b8", border:"none", fontSize:12}}>Skip</button>
        <button onClick={() => onAccept([...selected])} style={{...btnD, opacity: selected.size === 0 ? 0.4 : 1, pointerEvents: selected.size === 0 ? "none" : "auto"}}>Accept {selected.size} goal{selected.size !== 1 ? "s" : ""} →</button>
      </div>
    </div>
  );
}

/* ═══ HORIZONTAL BAR CHART (CSS-based) ═══ */
function HBar({ data }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, color: "#7a8194", width: 70, textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>{d.l}</div>
          <div style={{ flex: 1, height: 14, background: "#eceef2", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: `${(d.v / max) * 100}%`, background: d.hl ? "#e8b84a" : "#c0c5d0", borderRadius: 3, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 9.5, color: "#a0a8b8", width: 42, textAlign: "right", flexShrink: 0 }}>{(d.v/1000).toFixed(1)}k</div>
        </div>
      ))}
    </div>
  );
}

/* ═══ MINI LINE CHART (canvas) ═══ */
function MiniLine({ data, width=280, height=60 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    c.width = width * dpr; c.height = height * dpr; ctx.scale(dpr, dpr);
    const max = Math.max(...data); const min = Math.min(...data);
    const range = max - min || 1;
    const px = width / (data.length - 1);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * px, y = height - 8 - ((v - min) / range) * (height - 16);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#7a8194"; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.stroke();
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath();
    ctx.fillStyle = "rgba(122,129,148,0.06)"; ctx.fill();
  }, [data, width, height]);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}

/* ═══ SCORE RING ═══ */
function ScoreRing({ score, size = 80 }) {
  const ref = useRef(null);
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    let frame = 0;
    const target = score;
    const animate = () => {
      frame++;
      const progress = Math.min(1, frame / 40);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);
  const strokeW = 7;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animScore / 100) * circ;
  const color = animScore >= 70 ? T.accent.green : animScore >= 50 ? T.accent.orange : T.accent.red;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id="scoreGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.3"/></filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border.light} strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          filter="url(#scoreGlow)"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: T.font, fontSize: Math.round(size * 0.35), fontWeight: 800, color, lineHeight: 1, letterSpacing: "-1px" }}>{animScore}</div>
        <div style={{ fontFamily: T.font, fontSize: 7.5, color: T.text.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>Quality Score</div>
      </div>
    </div>
  );
}

/* ═══ MINI BAR SPARK (tiny inline chart for findings) ═══ */
function MiniBarSpark({ data, width = 120, height = 40 }) {
  const max = Math.max(...data);
  const gap = 2;
  const bw = (width - (data.length - 1) * gap) / data.length;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Subtle baseline */}
      <line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke={T.border.light} strokeWidth="1" />
      {data.map((v, i) => {
        const bh = (v / max) * (height - 6);
        const ratio = v / max;
        const fill = i === data.length - 1 ? T.accent.red : ratio > 0.7 ? T.accent.green : ratio > 0.4 ? T.accent.orange : `${T.accent.orange}90`;
        return <rect key={i} x={i * (bw + gap)} y={height - bh} width={bw} height={bh} rx="2"
          fill={fill} opacity="0.85" />;
      })}
    </svg>
  );
}

/* ═══ DATA PROFILE PANEL ═══ */
function DataProfilePanel({ onAccept, narrativeStep }) {
  // narrativeStep drives the AI-guided spotlight sequence:
  // 0 = panel appearing (just header visible, rest dim)
  // 1 = score spotlight — hero ring glows
  // 2 = fields revealed — user can toggle omit/include
  // 3 = findings spotlight — list appears, blob encourages click
  // 4 = one finding auto-expands with detail/graphs
  // 5 = findings collapse back, blob wraps up
  // 6 = done — footer visible, all interactive
  const step = narrativeStep || 0;

  const activities = [
    { l: "Created", v: 91179 }, { l: "Free", v: 85200 }, { l: "Approved", v: 82100 },
    { l: "Sent", v: 78400 }, { l: "In Process", v: 74900 }, { l: "Confirmed", v: 71300 },
    { l: "Conf.Chgd", v: 47400, hl: true }, { l: "Received", v: 68800 }, { l: "Closed", v: 65200 },
  ];

  const [omit, setOmit] = useState(new Set(["item_signal"]));
  const toggle = (f) => setOmit(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const fields = [
    { field: "case_id", status: "ok", pct: 100, note: "91,179 unique — no duplicates", canOmit: false },
    { field: "activity_name", status: "ok", pct: 100, note: "9 distinct values, no nulls", canOmit: false },
    { field: "timestamp", status: "warn", pct: 74, note: "25.7% duplicate timestamps", canOmit: false },
    { field: "receiving_site", status: "ok", pct: 100, note: "17 values, no nulls", canOmit: true },
    { field: "purchase_office", status: "ok", pct: 100, note: "28 values, no nulls", canOmit: true },
    { field: "item_group", status: "ok", pct: 98, note: "427 values, 2% null", canOmit: true },
    { field: "selection_code", status: "warn", pct: 58, note: "42% null — limits analysis", canOmit: true },
    { field: "item_signal", status: "bad", pct: 5, note: "95% null — recommend omit", canOmit: true, rec: "omit" },
  ];

  const included = fields.filter(f => !omit.has(f.field));
  const score = Math.round(included.reduce((a, f) => a + f.pct, 0) / included.length);
  const passColor = score >= 70 ? T.accent.green : score >= 50 ? T.accent.orange : T.accent.red;

  const scoreSpotlight = step === 1;
  const fieldsVisible = step >= 2;
  const findingsSpotlight = step >= 3;
  const findingsExpanded = step === 4;
  const footerVisible = step >= 6;

  // Scroll to findings when spotlight hits
  const findingsRef = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (step === 3 && findingsRef.current && scrollRef.current) {
      setTimeout(() => {
        findingsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [step]);

  const findings = [
    { id: "dup-ts", severity: "Medium", sevColor: T.accent.orange, title: "Duplicate timestamps",
      desc: "25.7% of events share identical timestamps, masking true process sequences.",
      affected: "23,411 events", impact: "Throughput accuracy",
      detail: "When multiple activities share the same timestamp, the directly-follows relation becomes ambiguous. This affects 1 in 4 events in your data.",
      sparkData: [92, 88, 85, 80, 76, 72, 68, 48] },
    { id: "null-signal", severity: "High", sevColor: T.accent.red, title: "item_signal is deprecated",
      desc: "95% null values — this field adds noise without analytical value.",
      affected: "86,620 events", impact: "Analysis noise",
      detail: "Only 4,559 events have a value. The field appears to have been abandoned mid-migration. Recommend omitting.",
      sparkData: [5, 5, 4, 6, 5, 3, 4, 95] },
    { id: "null-selection", severity: "Medium", sevColor: T.accent.orange, title: "selection_code gaps",
      desc: "42% null values correlate with manual orders — fixing this unlocks automation analysis.",
      affected: "38,295 events", impact: "Segmentation depth",
      detail: "Orders without a selection_code can't be routed automatically. This is likely a data entry gap at order creation time.",
      sparkData: [58, 62, 55, 60, 58, 54, 52, 42] },
  ];

  const sevIcon = (sev) => sev === "High"
    ? /* alert-circle */ <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    : /* warning-triangle */ <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

  const recommendation = (id) => {
    if (id === "dup-ts") return "Investigate timestamp precision. Consider using sub-second resolution or event ordering rules.";
    if (id === "null-signal") return "Deprecate item_signal field. Remove from intake pipeline to reduce noise.";
    if (id === "null-selection") return "Add selection_code as required field at order creation. Backfill from historical routing data.";
    return "Enrich missing values from source systems or use this field only for cases where it exists.";
  };

  const volumeAccents = [T.accent.blue, T.accent.green, T.accent.purple, T.accent.orange];

  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: T.bg.surface, borderRadius: T.radius.lg,
      boxShadow: T.shadow.lg,
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10, fontFamily: T.font,
    }}>
      {/* ── Hero: Score Ring + Verdict ── */}
      <div style={{
        padding: "28px 28px 22px", borderBottom: `1px solid ${T.border.light}`,
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        background: scoreSpotlight
          ? `linear-gradient(135deg, ${passColor}08 0%, ${passColor}12 50%, ${passColor}06 100%)`
          : `linear-gradient(180deg, ${T.bg.surfaceHover} 0%, ${T.bg.surface} 100%)`,
        boxShadow: scoreSpotlight ? `inset 0 -2px 16px ${passColor}10` : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            transform: scoreSpotlight ? "scale(1.08)" : "scale(1)",
          }}>
            <ScoreRing score={step >= 1 ? score : 0} size={88} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text.primary, marginBottom: 6, letterSpacing: "-0.3px" }}>Data Quality Assessment</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
              opacity: step >= 1 ? 1 : 0, transition: "opacity 0.4s ease 0.3s",
            }}>
              <span style={{
                padding: "4px 12px", borderRadius: T.radius.pill, fontSize: 12, fontWeight: 700,
                background: `${passColor}18`, color: passColor, letterSpacing: "0.2px",
              }}>
                {score >= 70 ? "Pass" : score >= 50 ? "Review" : "Fail"}
              </span>
              <span style={{ fontSize: 12, color: T.text.secondary, fontWeight: 500 }}>{included.length} of {fields.length} fields included</span>
            </div>
            <div style={{
              fontSize: 12.5, color: T.text.secondary, lineHeight: 1.55,
              opacity: step >= 1 ? 1 : 0, transition: "opacity 0.4s ease 0.5s",
            }}>
              {score >= 70
                ? "Your data looks great. Solid foundations for meaningful process insights."
                : "A few fields need attention, but nothing that can't be resolved. Let's take a look."}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 28px 24px" }}>

        {/* ── Volume Stats ── */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 24,
          opacity: step >= 1 ? 1 : 0.15, transition: "opacity 0.5s ease 0.2s",
        }}>
          {[
            { label: "Cases", value: "91,179", sub: "over 12 months" },
            { label: "Events", value: "624,800", sub: "avg 6.9 / case" },
            { label: "Activities", value: "9", sub: "distinct types" },
            { label: "Variants", value: "1,175", sub: "process paths" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "14px 12px", background: T.bg.surfaceHover,
              borderRadius: T.radius.md, border: `1px solid ${T.border.light}`,
              borderTop: `3px solid ${volumeAccents[i]}20`,
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: T.text.primary, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: volumeAccents[i], textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: T.text.subtle, marginTop: 2, lineHeight: 1.3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Activity Distribution ── */}
        <div style={{
          marginBottom: 24,
          opacity: step >= 1 ? 1 : 0.15, transition: "opacity 0.5s ease 0.4s",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Activity Distribution</div>
          <div style={{ display: "flex", gap: 2, height: 38, borderRadius: T.radius.sm, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)" }}>
            {activities.map((a, i) => {
              const max = activities[0].v;
              const w = (a.v / max) * 100;
              return (
                <div key={i} title={`${a.l}: ${(a.v/1000).toFixed(1)}K`} style={{
                  width: `${w}%`, height: "100%",
                  background: a.hl ? T.accent.orange : `hsl(${220 + i * 5}, 30%, ${74 - i * 2}%)`,
                  transition: "width 0.5s ease",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {w > 8 && <span style={{ fontSize: 8, fontWeight: 600, color: T.text.inverse, whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{a.l}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.text.subtle }}>9 activities across the lifecycle</span>
            <span style={{ fontSize: 10, color: T.accent.orange, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              Conf.Chgd is anomalous
            </span>
          </div>
        </div>

        {/* ── Field Quality Bars ── */}
        <div style={{
          marginBottom: 24,
          opacity: fieldsVisible ? 1 : 0.15,
          transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Field Quality</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {fields.map((d, i) => {
              const isOmitted = omit.has(d.field);
              const barColor = isOmitted ? "#d0d0d0" : d.status === "ok" ? T.accent.green : d.status === "warn" ? T.accent.orange : T.accent.red;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  borderRadius: T.radius.sm, background: isOmitted ? T.bg.light : T.bg.surfaceHover,
                  opacity: isOmitted ? 0.4 : 1, transition: "all 0.25s ease",
                  border: `1px solid ${isOmitted ? T.border.light : "transparent"}`,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: T.radius.pill, background: barColor, flexShrink: 0,
                    boxShadow: !isOmitted ? `0 0 4px ${barColor}40` : "none",
                  }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.text.primary, fontWeight: 600, width: 110, flexShrink: 0 }}>{d.field}</span>
                  <div style={{ flex: 1, height: 11, background: T.border.light, borderRadius: T.radius.xs, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: fieldsVisible ? `${d.pct}%` : "0%", background: barColor,
                      borderRadius: T.radius.xs, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: barColor, width: 34, textAlign: "right", flexShrink: 0 }}>{d.pct}%</span>
                  {d.canOmit && fieldsVisible && (
                    <button onClick={() => toggle(d.field)} style={{
                      padding: "3px 8px", fontSize: 9, fontWeight: 700, flexShrink: 0,
                      background: isOmitted ? T.border.light : "transparent",
                      color: isOmitted ? T.text.secondary : T.accent.red,
                      border: `1px solid ${isOmitted ? T.border.focus : T.accent.red + "40"}`,
                      borderRadius: T.radius.xs, cursor: "pointer", letterSpacing: "0.2px",
                      transition: "all 0.2s ease",
                    }}>{isOmitted ? "Include" : "Omit"}</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Findings Section ── */}
        <div ref={findingsRef} style={{
          padding: findingsSpotlight ? "22px 20px" : "16px 20px", borderRadius: T.radius.lg,
          background: findingsSpotlight ? `linear-gradient(135deg, ${T.accent.blue}06 0%, ${T.accent.purple}08 100%)` : T.bg.light,
          border: findingsSpotlight ? `1.5px solid ${T.border.accent}` : `1px solid ${T.border.light}`,
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: findingsSpotlight ? `0 8px 32px ${T.accent.blue}15` : "none",
          opacity: step >= 3 ? 1 : 0.15,
        }}>
          {/* Findings header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: findingsSpotlight ? 18 : 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: T.radius.sm, display: "flex", alignItems: "center", justifyContent: "center",
              background: findingsSpotlight ? T.accent.blue : T.border.focus,
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              transform: findingsSpotlight ? "scale(1)" : "scale(0.9)",
              boxShadow: findingsSpotlight ? `0 4px 12px ${T.accent.blue}30` : "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text.inverse} strokeWidth="2.5" strokeLinecap="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: findingsSpotlight ? T.text.primary : T.text.secondary, transition: "color 0.4s", letterSpacing: "-0.2px" }}>Findings</div>
              <div style={{ fontSize: 11, color: T.text.muted, marginTop: 1 }}>Actionable insights from your data</div>
            </div>
            {findingsSpotlight && (
              <div style={{
                padding: "4px 12px", borderRadius: T.radius.pill, fontSize: 11, fontWeight: 700,
                background: `${T.accent.blue}14`, color: T.accent.blue,
                animation: "snapIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                3 found
              </div>
            )}
          </div>

          {/* Findings list */}
          {findingsSpotlight && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.5s ease" }}>
              {findings.map((f, i) => (
                <div key={f.id} style={{
                  padding: findingsExpanded ? "18px 20px" : "14px 16px",
                  background: T.bg.surface, borderRadius: T.radius.md,
                  border: `1px solid ${findingsExpanded ? f.sevColor + "30" : T.border.light}`,
                  borderLeft: findingsExpanded ? `4px solid ${f.sevColor}` : `1px solid ${findingsExpanded ? f.sevColor + "30" : T.border.light}`,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  animation: `fadeUp ${0.3 + i * 0.15}s ease`,
                  boxShadow: findingsExpanded ? T.shadow.md : T.shadow.sm,
                }}>
                  {/* Finding header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: findingsExpanded ? 10 : 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.text.primary, letterSpacing: "-0.2px" }}>{f.title}</span>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 10.5, fontWeight: 700, color: f.sevColor,
                      background: f.sevColor + "14", padding: "4px 10px", borderRadius: T.radius.pill,
                    }}>
                      <span style={{ display: "flex", color: f.sevColor }}>{sevIcon(f.severity)}</span>
                      {f.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: T.text.secondary, lineHeight: 1.7 }}>{f.desc}</div>

                  {/* Expanded detail */}
                  {findingsExpanded && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border.light}`, animation: "fadeUp 0.4s ease" }}>
                      {/* Why this matters */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Why this matters</div>
                        <div style={{ fontSize: 13, color: T.text.primary, lineHeight: 1.7 }}>{f.detail}</div>
                      </div>

                      {/* Spark chart + stat cards row */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Completeness trend</div>
                          <MiniBarSpark data={f.sparkData} width={200} height={48} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ fontSize: 9, color: T.text.subtle }}>8 periods ago</span>
                            <span style={{ fontSize: 9, color: T.text.subtle }}>Current</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div style={{
                            padding: "10px 14px", borderRadius: T.radius.sm,
                            background: `${f.sevColor}08`, border: `1px solid ${f.sevColor}20`,
                            minWidth: 80,
                          }}>
                            <div style={{ fontSize: 9.5, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>Affected</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: f.sevColor, marginTop: 2 }}>{f.affected}</div>
                          </div>
                          <div style={{
                            padding: "10px 14px", borderRadius: T.radius.sm,
                            background: `${T.accent.blue}08`, border: `1px solid ${T.accent.blue}18`,
                            minWidth: 80,
                          }}>
                            <div style={{ fontSize: 9.5, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>Impact</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent.blue, marginTop: 2 }}>{f.impact}</div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div style={{
                        padding: "12px 14px", borderRadius: T.radius.sm,
                        background: `${T.accent.green}06`, border: `1px solid ${T.accent.green}18`,
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent.green} strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 1, flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.accent.green, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Recommendation</div>
                          <div style={{ fontSize: 12, color: T.text.secondary, lineHeight: 1.6 }}>{recommendation(f.id)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!findingsSpotlight && (
            <div style={{ fontSize: 12, color: T.text.muted, lineHeight: 1.6 }}>Quality issues become actionable findings.</div>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "16px 28px", borderTop: `1px solid ${T.border.light}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        opacity: footerVisible ? 1 : 0, transition: "opacity 0.4s ease",
        pointerEvents: footerVisible ? "auto" : "none",
        background: T.bg.surfaceHover,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: T.radius.pill, background: passColor, boxShadow: `0 0 6px ${passColor}40` }} />
          <span style={{ fontSize: 12, color: T.text.secondary, fontWeight: 500 }}>{included.length} of {fields.length} fields selected</span>
        </div>
        <button onClick={onAccept} style={btnD}>Looks good →</button>
      </div>
    </div>
  );
}

const ALL_TARGETS = [
  { n: "Throughput time", b: "18.8d", t: "14d",
    why: "Your fastest site PM1 already achieves 7.7 days — proving 14 days is realistic across the board.",
    benchmark: "Industry benchmark for purchase-to-receive in manufacturing is 10–15 days (APQC median: 12.4d). Your target of 14d aligns with the 50th percentile.",
    how: "Focus on the approval bottleneck (Free → Approved) and reduce wait times between Sent and In Process." },
  { n: "Rework rate", b: "52%", t: "35%",
    why: "52% of orders loop through 'Confirmed Changed' — this is the single biggest structural issue in your process.",
    benchmark: "Best-in-class procurement processes see rework rates below 15% (Hackett Group). Even 35% keeps you above median, but represents a 30% relative improvement.",
    how: "Investigate root causes: manual re-entry errors, vendor-side changes, and specification mismatches at confirmation." },
  { n: "Data quality", b: "50/100", t: "70+",
    why: "Two fields (item_signal at 95% null, selection_code at 42% null) severely limit what we can analyze.",
    benchmark: "Data quality scores above 70 are considered 'actionable' for process mining. Below 50 means significant blind spots in variant and root-cause analysis.",
    how: "Fix selection_code population at order creation. Decide whether item_signal should be deprecated or enforced." },
  { n: "Conformance", b: "1,175 variants", t: "<400",
    why: "1,175 process variants across 17 sites indicates extreme fragmentation — most variants have fewer than 10 cases.",
    benchmark: "Well-governed procurement processes typically have 50–200 variants (Celonis benchmark). Under 400 is a pragmatic first milestone that preserves regional flexibility.",
    how: "Standardize the top 5 sites first (they represent 60% of volume). Eliminate low-frequency deviation paths." },
];

function SingleTargetCard({target, index, total, onAccept, onSkip}){
  return (
    <div style={{...ps, width: 460, maxWidth: "90vw"}}>
      <div style={{padding:"20px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,color:"#1a1d23"}}>{target.n}</div>
          <div style={{fontSize:11,color:"#a0a8b8",fontWeight:500}}>{index + 1} of {total}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{flex:1,textAlign:"center",padding:"10px 0",background:"#f7f8fa",borderRadius:8}}>
            <div style={{fontSize:9.5,fontWeight:700,color:"#a0a8b8",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Current</div>
            <div style={{fontSize:18,fontWeight:700,color:"#1a1d23"}}>{target.b}</div>
          </div>
          <svg width="20" height="12" viewBox="0 0 20 12"><path d="M2 6h16M14 2l4 4-4 4" stroke="#4f6df5" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{flex:1,textAlign:"center",padding:"10px 0",background:"#f0f2ff",borderRadius:8,border:"1.5px solid #d8ddf5"}}>
            <div style={{fontSize:9.5,fontWeight:700,color:"#4f6df5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Target</div>
            <div style={{fontSize:18,fontWeight:700,color:"#4f6df5"}}>{target.t}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 24px 16px"}}>
        <div style={{fontSize:12.5,color:"#3a3f4a",lineHeight:1.65,marginBottom:12}}>{target.why}</div>
        <div style={{padding:"10px 14px",background:"#f7f8fa",borderRadius:8,marginBottom:12,borderLeft:"3px solid #d0d5e0"}}>
          <div style={{fontSize:9.5,fontWeight:700,color:"#a0a8b8",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:3}}>Industry benchmark</div>
          <div style={{fontSize:11.5,color:"#5a5f6e",lineHeight:1.55}}>{target.benchmark}</div>
        </div>
        <div style={{fontSize:11.5,color:"#7a8194",lineHeight:1.55}}>
          <span style={{fontWeight:600,color:"#5a5f6e"}}>How to get there: </span>{target.how}
        </div>
      </div>
      <div style={{padding:"14px 24px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onSkip} style={{...btnG, color:"#a0a8b8", border:"none", fontSize:12}}>Skip this target</button>
        <button onClick={onAccept} style={btnD}>Accept target →</button>
      </div>
    </div>
  );
}

/* ═══ CONTEXT SCORE ═══ */
function ContextScore({ score, onImprove }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct < 30 ? T.text.muted : pct < 55 ? T.accent.orange : pct < 80 ? T.accent.blue : T.accent.green;
  const glowColor = pct < 30 ? "rgba(160,168,184,0.15)" : pct < 55 ? "rgba(232,160,64,0.15)" : pct < 80 ? "rgba(79,109,245,0.18)" : "rgba(123,198,126,0.18)";
  return (
    <div style={{ padding: "16px 22px 14px", borderBottom: `1px solid ${T.border.light}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px" }}>Context Score</div>
          <div style={{ fontSize: 17, fontWeight: 800, color, letterSpacing: "-0.3px", transition: "color 0.5s ease" }}>{pct}%</div>
        </div>
        {onImprove && <button onClick={onImprove} style={{
          padding: "6px 14px", fontSize: 11, fontWeight: 600,
          background: "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)", color: T.accent.blue,
          border: `1px solid ${T.border.accent}`, borderRadius: T.radius.sm, cursor: "pointer",
          transition: "all 0.2s ease", boxShadow: T.shadow.sm,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #e8eaff 0%, #dce0ff 100%)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(79,109,245,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)"; e.currentTarget.style.boxShadow = T.shadow.sm; e.currentTarget.style.transform = "translateY(0)"; }}
        >Improve score</button>}
      </div>
      <div style={{ width: "100%", height: 6, background: T.border.light, borderRadius: T.radius.xs, overflow: "hidden", boxShadow: `inset 0 1px 2px rgba(0,0,0,0.04)` }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: T.radius.xs,
          background: `linear-gradient(90deg, ${color}, ${color}ee)`,
          boxShadow: `0 0 8px ${glowColor}`,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1), background 0.5s ease",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
            animation: "scoreShimmer 2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ═══ DOCUMENT PANEL ═══ */
function DocPanel({ data, onUpdate, onImproveScore, narrativeStep }) {
  if (!data) return null;
  // narrativeStep drives AI-guided spotlight:
  // 0 = panel appearing, header visible, rest dim
  // 1 = score bar spotlight — explain the percentage
  // 2 = gathering — sections fill in as answers come, score animates
  // 3 = mission spotlight — glow on mission statement
  // 4 = all visible (normal mode)
  const step = narrativeStep || 0;
  const scoreSpotlight = step === 1;
  const missionSpotlight = step === 3;
  const missionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (step === 3 && missionRef.current && scrollRef.current) {
      setTimeout(() => {
        missionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [step]);

  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: T.bg.surface, borderRadius: T.radius.lg,
      boxShadow: T.shadow.lg,
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10,
    }}>
      {/* Header — dramatic process name */}
      <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid ${T.border.light}` }}>
        <div style={{
          display: "inline-block", padding: "3px 10px", fontSize: 10, fontWeight: 600,
          color: T.accent.blue, background: "rgba(79,109,245,0.07)", borderRadius: T.radius.pill,
          letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10,
        }}>
          <EditableField value={data.processType || "Process type"} onChange={v => onUpdate({ ...data, processType: v })} style={{ fontSize: 10, fontWeight: 600, color: T.accent.blue }} />
        </div>
        <EditableField value={data.processName || "Untitled"} onChange={v => onUpdate({ ...data, processName: v })} style={{ fontSize: 21, fontWeight: 700, color: T.text.primary, letterSpacing: "-0.4px", lineHeight: 1.25 }} />
      </div>

      {/* Context Score Bar — with spotlight */}
      {data.contextScore != null && (
        <div style={{
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          background: scoreSpotlight ? "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)" : T.bg.surface,
          boxShadow: scoreSpotlight ? "inset 0 0 20px rgba(79,109,245,0.08)" : "none",
          transform: scoreSpotlight ? "scale(1.02)" : "scale(1)",
          borderRadius: scoreSpotlight ? `0 0 ${T.radius.sm}px ${T.radius.sm}px` : "0",
        }}>
          <ContextScore score={data.contextScore} onImprove={step >= 4 ? onImproveScore : null} />
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 24px 36px" }}>
        {/* Explanation text — visible during early narrative */}
        {step >= 1 && step <= 2 && !data.description && (
          <div style={{
            padding: "14px 16px", background: T.bg.light, borderRadius: T.radius.md,
            border: `1px solid ${T.border.light}`, marginBottom: 20, animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ fontSize: 12, color: T.text.secondary, lineHeight: 1.65 }}>
              The context score reflects how well I understand your process. Each answer you give adds knowledge — the higher the score, the sharper my analysis and recommendations.
            </div>
          </div>
        )}

        {/* Mission Statement — HERO section */}
        {data.mission && <div ref={missionRef} style={{
          marginBottom: 22,
          opacity: step >= 3 ? 1 : 0.15, transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "0.8px" }}>Mission Statement</div>
          </div>
          <div style={{
            padding: "20px 24px",
            background: missionSpotlight
              ? "linear-gradient(135deg, rgba(79,109,245,0.06) 0%, rgba(139,92,246,0.04) 100%)"
              : "rgba(79,109,245,0.03)",
            borderRadius: T.radius.md,
            borderLeft: `4px solid ${T.accent.blue}`,
            border: missionSpotlight ? `1.5px solid rgba(79,109,245,0.25)` : `1px solid ${T.border.accent}`,
            borderLeftWidth: 4,
            boxShadow: missionSpotlight
              ? "0 8px 32px rgba(79,109,245,0.12), 0 0 0 1px rgba(79,109,245,0.06)"
              : T.shadow.sm,
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
            transform: missionSpotlight ? "scale(1.01)" : "scale(1)",
            position: "relative", overflow: "hidden",
          }}>
            {missionSpotlight && <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(79,109,245,0.04) 50%, transparent 100%)",
              animation: "scoreShimmer 3s ease-in-out infinite",
              pointerEvents: "none",
            }} />}
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 40, fontWeight: 300, color: T.accent.blue, opacity: 0.15, lineHeight: 1, fontFamily: "Georgia, serif", display: "block", marginBottom: -4 }}>{"\u201C"}</span>
              <div style={{
                fontSize: 15, color: "#2a2e60", lineHeight: 1.7,
                fontWeight: 500, fontStyle: "italic",
                transition: "font-size 0.4s ease",
              }}>{data.mission}</div>
              <span style={{ fontSize: 40, fontWeight: 300, color: T.accent.blue, opacity: 0.15, lineHeight: 1, fontFamily: "Georgia, serif", textAlign: "right", display: "block", marginTop: -2 }}>{"\u201D"}</span>
            </div>
          </div>
        </div>}

        {/* KPIs — 2-column grid of mini cards */}
        {data.kpis && data.kpis.length > 0 && <div style={{
          marginBottom: 22, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Key Indicators</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {data.kpis.map((k, i) => (
              <div key={i} style={{
                padding: "12px 14px", background: T.bg.light, borderRadius: T.radius.sm,
                border: `1px solid ${T.border.light}`, animation: "fadeUp 0.4s ease",
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 3 }}>{k.v}</div>
                <div style={{ fontSize: 11, color: T.text.secondary, lineHeight: 1.35 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* Process Description */}
        {data.description && <div style={{
          marginBottom: 22, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Process Description</div>
          <div style={{ fontSize: 13.5, color: T.text.primary, lineHeight: 1.7 }}>{data.description}</div>
        </div>}

        {/* Field Context — cleaner cards with badge tags */}
        {data.fieldAnnotations && data.fieldAnnotations.length > 0 && <div style={{
          marginBottom: 22, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Field Context</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.fieldAnnotations.map((f, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: T.radius.sm, background: T.bg.surface,
                border: `1px solid ${T.border.light}`, animation: "fadeUp 0.4s ease",
              }}>
                <div style={{
                  display: "inline-block", padding: "2px 8px", fontSize: 10.5, fontWeight: 600,
                  fontFamily: "monospace", color: T.accent.blue, background: "rgba(79,109,245,0.07)",
                  borderRadius: T.radius.xs, marginBottom: 5,
                }}>{f.field}</div>
                <div style={{ fontSize: 12, color: T.text.secondary, lineHeight: 1.5 }}>{f.meaning}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* Hypotheses — numbered insight cards */}
        {data.hypotheses && data.hypotheses.length > 0 && <div style={{
          marginBottom: 22, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.accent.orange} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z"/></svg>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px" }}>Hypotheses</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.hypotheses.map((h, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "12px 14px",
                background: "linear-gradient(135deg, #fffcf5 0%, #fdf9f0 100%)",
                borderRadius: T.radius.sm, border: "1px solid #f0e8d4",
                animation: "fadeUp 0.4s ease",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: T.radius.pill, flexShrink: 0,
                  background: "rgba(232,160,64,0.12)", color: T.accent.orange,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, marginTop: 1,
                }}>{i + 1}</div>
                <div style={{ fontSize: 12.5, color: "#5a5040", lineHeight: 1.6 }}>{h}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* Goals & Targets — compact goal cards with current->target visual */}
        {data.goals && <div style={{
          marginBottom: 22, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Goals & Targets</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.goals.map((g, j) => (
              <div key={j} style={{
                padding: "12px 16px", background: T.bg.surface, borderRadius: T.radius.sm,
                border: `1px solid ${T.border.light}`, boxShadow: T.shadow.sm,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text.primary, marginBottom: g.b ? 8 : 0 }}>{g.n}</div>
                {g.b && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    padding: "3px 10px", fontSize: 12, fontWeight: 600,
                    color: T.text.secondary, background: T.bg.light,
                    borderRadius: T.radius.xs,
                  }}>{g.b}</div>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M1 5h12M10 1l4 4-4 4" stroke={T.accent.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{
                    padding: "3px 10px", fontSize: 12, fontWeight: 700,
                    color: T.accent.blue, background: "rgba(79,109,245,0.08)",
                    borderRadius: T.radius.xs,
                  }}>{g.t}</div>
                </div>}
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

/* ═══ GOALS DOCUMENT PANEL ═══ */
function GoalsDocPanel({ data }) {
  if (!data) return null;
  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: "#fff", borderRadius: 14,
      boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #eceef2" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Goals & Targets</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 32px" }}>
        {/* Mission restated */}
        {data.mission && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
            <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5" }}>
              <div style={{ fontSize: 13.5, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>{data.mission}</div>
            </div>
          </div>
        )}
        {/* Goals */}
        {data.goals && data.goals.length > 0 && (
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Goals</div>
            {data.goals.map((g, i) => (
              <div key={i} style={{ padding: "14px 16px", border: "1.5px solid #e8ebf0", borderRadius: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: g.why ? 8 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>{g.n}</div>
                  {g.b ? (
                    <div style={{ padding: "3px 10px", background: "#f0f2ff", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#4f6df5" }}>{g.b} → {g.t}</div>
                  ) : g.current ? (
                    <div style={{ fontSize: 12, color: "#7a8194", fontWeight: 500 }}>Current: {g.current}</div>
                  ) : null}
                </div>
                {g.why && (
                  <div style={{ fontSize: 12, color: "#3a3f4a", lineHeight: 1.6, marginBottom: 6 }}>{g.why}</div>
                )}
                {g.evidence && (
                  <div style={{ padding: "6px 10px", background: "#f7f8fa", borderRadius: 6, borderLeft: "3px solid #d0d5e0" }}>
                    <div style={{ fontSize: 11, color: "#5a5f6e", lineHeight: 1.5 }}>{g.evidence}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ MISSION CONTROL OVERLAY ═══ */
function MissionControlOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0e0f14", zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "mcFadeIn 0.8s ease",
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Mission Control</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Coming soon</div>
    </div>
  );
}

/* ═══ CANVAS VIEW — full-screen process mining canvas ═══ */
/* ═══ SPARKLES ICON (inline SVG) ═══ */
const SparklesIcon = ({ size = 10, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill={color} />
    <path d="M12 0l.75 2.25L15 3l-2.25.75L12 6l-.75-2.25L9 3l2.25-.75L12 0z" fill={color} opacity="0.6" />
  </svg>
);

/* ═══ CANVAS CHAT RESPONSES ═══ */
const CANVAS_RESPONSES = [
  { match: /bottleneck|slow|delay/i, text: "Last Confirmation Print is the primary bottleneck -- 35,092 cases with 5.7d average duration. The Approved to Last Confirmation transition alone adds 2.3d. I'd recommend investigating the confirmation approval rules and whether manual steps can be automated." },
  { match: /rework|loop|repeat/i, text: "Two major rework patterns: (1) Approved self-loop -- 10,009 cases cycling back at 1.5d each, likely re-approvals after spec changes. (2) Blocked to Approved return -- 12,457 cases at 10.1h, suggesting blocked orders require re-approval. Together these add ~3.2 days to average throughput." },
  { match: /block/i, text: "24,435 cases pass through Blocked (68% of total). The Blocked self-loop (9,826 cases, 7.0h) suggests orders get stuck in repeated blocking cycles. The Blocked to Free return path is rare (15 cases) -- most blocked orders route back through Approved." },
  { match: /free|start|begin/i, text: "Free is the entry point for 97.9% of cases. Average duration is just 5.5h -- it's not a bottleneck itself. The main split: 84% flow to Approved (happy path), 16% route directly to Blocked." },
  { match: /approv/i, text: "Approved handles 52,107 cases with 2.0d average duration. The self-loop (10,009 cases, 1.5d) is significant -- orders cycling back for re-approval. This is likely driven by specification changes or vendor modifications after initial approval." },
  { match: /improv|fix|recommend|action|what.*do|next.*step/i, text: "Based on the context, I'd prioritize three actions: (1) Automate the confirmation print step -- 5.7d average is the single largest delay. (2) Investigate the Approved self-loop trigger -- 10,009 unnecessary re-approvals. (3) Add a fast-track path from Blocked to Last Confirmation Print for orders that resolve quickly.", triggerFinding: true },
];
const CANVAS_DEFAULT_RESPONSE = "I can see the items you've selected. Try asking about bottlenecks, rework loops, blocked orders, or what improvements I'd recommend.";
const CANVAS_FINDING = {
  title: "Confirmation print bottleneck with rework amplification",
  severity: "High", sevColor: "#d4685a",
  summary: "Last Confirmation Print adds 5.7d avg to every case. The Approved self-loop (10,009 cases at 1.5d) creates compounding delays -- each re-approval cycle pushes cases back through the 2.3d Approved to LCP transition.",
  recommendation: "Investigate confirmation approval automation. Reduce re-approval triggers from the Approved self-loop. Consider fast-tracking orders that have already passed Blocked status.",
};
const NODE_POPUP_DATA = {
  free: { throughputDist: [12,28,45,62,35,18,8], reworkRate: 15.6, sparkline: [20,35,28,42,38,45,32,40,36,44], issues: ["16% direct route to Blocked", "Low avg but high variance"] },
  approved: { throughputDist: [5,15,22,38,55,42,28,12], reworkRate: 19.2, sparkline: [30,42,38,55,48,52,45,58,50,47], issues: ["10,009 self-loop re-approvals", "Re-approval adds 1.5d per cycle"] },
  last_conf: { throughputDist: [2,8,12,18,35,52,45,30], reworkRate: 2.4, sparkline: [55,62,58,65,70,68,72,60,64,66], issues: ["Primary bottleneck: 5.7d average", "Manual confirmation step suspected"] },
  blocked: { throughputDist: [18,32,42,28,15,8,3], reworkRate: 40.2, sparkline: [25,30,28,35,32,38,30,34,36,33], issues: ["68% of all cases pass through", "9,826 self-loop cycles at 7.0h each"] },
};
const EDGE_POPUP_DATA = { transitionDist: [8,22,38,45,32,18,10], volumeOverTime: [120,145,135,168,155,172,148,160,175,165,158,170] };
const SEGMENT_POPUP_DATA = { avgTime: "4.2d", medianTime: "3.8d", histogram: [5,12,22,38,55,42,28,15,8,3], flowPct: 72.4, rangeMin: "0.5d", rangeMax: "15.2d" };

function CanvasView() {
  const [aiContext, setAiContext] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [hasNotified, setHasNotified] = useState(false);
  const [mutterIdx, setMutterIdx] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [findingStored, setFindingStored] = useState(false);
  const [findingExpanded, setFindingExpanded] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [clickedPopup, setClickedPopup] = useState(null);
  const [shiftSelected, setShiftSelected] = useState([]);
  const [segmentPopup, setSegmentPopup] = useState(null);
  const chatEndRef = useRef(null);
  const MUTTERS = ["psst... over here", "hey, look 👀", "I see things...", "*ahem*", "tap me maybe?", "data wants to talk"];
  useEffect(() => {
    if (hasNotified || chatOpen) return;
    const id = setInterval(() => setMutterIdx(i => (i + 1) % MUTTERS.length), 3200);
    return () => clearInterval(id);
  }, [hasNotified, chatOpen]);

  const addContext = (item) => {
    setAiContext(prev => {
      const key = item.type === "node" ? item.label : (item.id || item.label);
      if (prev.some(p => ((p.type === "node" ? p.label : (p.id || p.label))) === key)) return prev;
      return [...prev, item];
    });
    if (!chatOpen) { setChatOpen(true); setHasNotified(true); }
  };

  const triggerFinding = () => {
    if (chatMessages.some(m => m.type === "finding")) return;
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "ai", text: "Based on what we've explored, I think we have a finding." }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: "ai", type: "finding", ...CANVAS_FINDING }]);
      }, 800);
    }, 1500);
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || aiTyping) return;
    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);
    setChatMessages(prev => [...prev, { role: "user", text }]);
    setChatInput("");
    setAiTyping(true);
    setTimeout(() => {
      const match = CANVAS_RESPONSES.find(r => r.match.test(text));
      setChatMessages(prev => [...prev, { role: "ai", text: match ? match.text : CANVAS_DEFAULT_RESPONSE }]);
      setAiTyping(false);
      if ((match && match.triggerFinding) || newCount >= 3) triggerFinding();
    }, 800);
  };

  const storeFinding = () => {
    setFindingStored(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "ai", text: "Finding stored! You can keep exploring or head to the improvement flow when you're ready." }]);
    }, 600);
  };

  const keepExploring = () => {
    setChatMessages(prev => [...prev, { role: "ai", text: "No problem -- let's keep digging. What else would you like to investigate?" }]);
  };

  const handleShiftClickNode = (nodeIdx) => {
    if (nodes[nodeIdx]?.type === "circle") return;
    setClickedPopup(null);
    setShiftSelected(prev => {
      if (prev.length === 0) return [nodeIdx];
      if (prev[0] === nodeIdx) return prev;
      const pair = [prev[0], nodeIdx];
      setSegmentPopup({ from: pair[0], to: pair[1] });
      return pair;
    });
  };

  const handleNodeClick = (ev, i, n) => {
    ev.stopPropagation();
    if (ev.shiftKey) { handleShiftClickNode(i); return; }
    setShiftSelected([]); setSegmentPopup(null);
    setClickedPopup({ type: "node", index: i, x: n.x + (n.w || 180) / 2, y: n.y });
  };

  const handleEdgeClick = (ev, i, px, py) => {
    ev.stopPropagation();
    setShiftSelected([]); setSegmentPopup(null);
    setClickedPopup({ type: "edge", index: i, x: px, y: py });
  };

  const dismissPopups = (ev) => {
    if (ev.target !== ev.currentTarget) return;
    setClickedPopup(null); setShiftSelected([]); setSegmentPopup(null);
  };

  const renderNodeCharts = (data) => {
    const maxV = Math.max(...data.throughputDist);
    const maxS = Math.max(...data.sparkline), minS = Math.min(...data.sparkline);
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Throughput time distribution</div>
          <svg width="248" height="48" viewBox="0 0 248 48">
            {data.throughputDist.map((v, j) => {
              const bw = 248 / data.throughputDist.length - 4, bh = (v / maxV) * 40;
              return <rect key={j} x={j * (bw + 4)} y={40 - bh} width={bw} height={bh} rx="2" fill={v === maxV ? "#6366f1" : "#e0e7ff"} />;
            })}
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Rework rate</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: data.reworkRate > 20 ? "#dc2626" : "#1e293b" }}>{data.reworkRate}%</div>
          </div>
          <svg width="80" height="24" viewBox="0 0 80 24">
            <polyline fill="none" stroke="#6366f1" strokeWidth="1.5"
              points={data.sparkline.map((v, j) => `${j * 9},${22 - ((v - minS) / (maxS - minS)) * 20}`).join(" ")} />
          </svg>
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
          {data.issues.map((iss, j) => (
            <div key={j} style={{ fontSize: 10, color: "#64748b", lineHeight: "18px", display: "flex", gap: 4 }}>
              <span style={{ color: "#f59e0b" }}>!</span> {iss}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEdgeCharts = (data) => {
    const maxV = Math.max(...data.transitionDist);
    const vol = data.volumeOverTime, maxVol = Math.max(...vol), minVol = Math.min(...vol);
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Transition time distribution</div>
          <svg width="228" height="48" viewBox="0 0 228 48">
            {data.transitionDist.map((v, j) => {
              const bw = 228 / data.transitionDist.length - 4, bh = (v / maxV) * 40;
              return <rect key={j} x={j * (bw + 4)} y={40 - bh} width={bw} height={bh} rx="2" fill={v === maxV ? "#0ea5e9" : "#e0f2fe"} />;
            })}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Volume over time</div>
          <svg width="228" height="40" viewBox="0 0 228 40">
            <polyline fill="none" stroke="#0ea5e9" strokeWidth="1.5"
              points={vol.map((v, j) => `${j * (228 / (vol.length - 1))},${36 - ((v - minVol) / (maxVol - minVol)) * 32}`).join(" ")} />
            <line x1="0" y1="38" x2="228" y2="38" stroke="#e2e8f0" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    );
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, aiTyping]);

  const nodes = [
    { id: "start", label: "Start", x: 380, y: 20, w: 56, type: "circle" },
    { id: "free", label: "Free", x: 290, y: 100, w: 180, h: 60, count: 35088, avgDuration: "5.5h", isBackbone: true, color: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.35)" },
    { id: "approved", label: "Approved", x: 310, y: 230, w: 180, h: 60, count: 52107, avgDuration: "2.0d", isBackbone: true, color: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.45)" },
    { id: "last_conf", label: "Last Confirmation Print", x: 260, y: 370, w: 200, h: 60, count: 35092, avgDuration: "5.7d", isBackbone: true, bottleneck: true, color: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.5)" },
    { id: "blocked", label: "Blocked", x: 150, y: 500, w: 180, h: 60, count: 24435, avgDuration: "13.5h", color: "#f8fafc", borderColor: "#e2e8f0" },
    { id: "end", label: "End", x: 330, y: 620, w: 56, type: "circle" },
  ];

  const edges = [
    { from: 0, to: 1, count: 35047, avgDuration: "" },
    { from: 1, to: 2, count: 29557, avgDuration: "5.2h", isBackbone: true },
    { from: 2, to: 3, count: 34490, avgDuration: "2.3d", isBackbone: true, isBottleneck: true },
    { from: 3, to: 5, count: 33473, avgDuration: "" },
    { from: 1, to: 4, count: 5475, avgDuration: "6.8h" },
    { from: 4, to: 2, count: 12457, avgDuration: "10.1h" },
    { from: 2, to: 4, count: 6790, avgDuration: "1.1d" },
    { from: 4, to: 3, count: 570, avgDuration: "8.3d", isBottleneck: true },
    { from: 3, to: 4, count: 1535, avgDuration: "5.9d", isBottleneck: true, rework: true },
    { from: 3, to: 2, count: 84, avgDuration: "1.4d", rework: true },
    { from: 2, to: 2, count: 10009, avgDuration: "1.5d", isBottleneck: true, selfLoop: true },
    { from: 4, to: 4, count: 9826, avgDuration: "7.0h", selfLoop: true },
  ];

  const kpis = [
    { l: "Cases", v: "35,856" }, { l: "Events", v: "893,207" }, { l: "Activities", v: "4" },
    { l: "Conformance", v: "72.45%" }, { l: "Throughput", v: "7.05d" },
  ];

  const variantData = [
    { l: "Variant 1", v: 3492, hl: true }, { l: "Variant 2", v: 520, hl: true },
    { l: "Variant 3", v: 328 }, { l: "Variant 5", v: 104 },
    { l: "Variant 10", v: 72 }, { l: "Variant 4", v: 41 },
  ];
  const holdData = [
    { l: "180", v: 73, hl: true }, { l: "250", v: 54, hl: true },
    { l: "300", v: 34 }, { l: "221", v: 27 }, { l: "290", v: 13 }, { l: "270", v: 10 },
  ];
  const releaseData = [
    { l: "Soft Released", v: 167, hl: true }, { l: "Firm Released", v: 72 }, { l: "Blocked", v: 8 },
  ];

  /* Helper: render a frequency bar section with sparkle-on-hover */
  const renderBarSection = (title, data, maxVal, sectionKey) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3f4a" }}>{title}</div>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="#a0a8b8" strokeWidth="1.2"/></svg>
      </div>
      {data.map((d, i) => {
        const barKey = `${sectionKey}-${i}`;
        const isHov = hoveredBar === barKey;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, position: "relative" }}
            onMouseEnter={() => setHoveredBar(barKey)} onMouseLeave={() => setHoveredBar(null)}>
            <div style={{ width: `${(d.v / maxVal) * 100}%`, minWidth: 4, height: 18, background: d.hl ? "#7bc67e" : "#e0e2e8", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6 }}>
              <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{d.l}</span>
            </div>
            <span style={{ fontSize: 10, color: "#7a8194", fontWeight: 500, flexShrink: 0 }}>{d.v.toLocaleString()}</span>
            {isHov && (
              <button onClick={(ev) => { ev.stopPropagation(); addContext({ type: "filter", id: `${sectionKey}:${d.l}`, label: d.l, value: d.v, category: title }); }}
                style={{
                  position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                  background: "#6366f1", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.3)", padding: 0, zIndex: 10,
                  animation: "sparkleAppear 0.15s ease",
                }} title="Add to context">
                <SparklesIcon size={7} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const typeColor = (t) => t === "node" ? "#6366f1" : t === "edge" ? "#0ea5e9" : "#10b981";

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: "canvasEnter 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Top filter bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 20px", borderBottom: "1px solid #e8ebf0", background: "#fff", flexShrink: 0, zIndex: 20,
        animation: "slideInDown 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e", fontWeight: 500 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M3 1.5v1.5M9 1.5v1.5M1.5 5.25h9v4.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-4.5z" stroke="#8a8f9e" strokeWidth="0.9"/></svg>
            Period
          </div>
          <div style={{ fontSize: 11, color: "#7a8194" }}>Mar 20, 2025 - Mar 20, 2026</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e", fontWeight: 500 }}>sales_office</div>
          <div style={{ fontSize: 11, color: "#7a8194" }}>1/30</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#a0a8b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width canvas area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Dot background */}
        <DotBackground isDark={false} />

        {/* Process DAG — centered */}
        <div onClick={dismissPopups} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <div style={{ position: "relative", width: 720, height: 700, animation: "canvasEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
            <svg width="720" height="700" viewBox="0 0 720 700" style={{ position: "absolute", inset: 0 }}>
              {edges.map((e, i) => {
                if (e.selfLoop) return null;
                const a = nodes[e.from], b = nodes[e.to];
                const aw = a.w || 56, ah = a.h || (a.type === "circle" ? 28 : 60);
                const bw = b.w || 56;
                const ax = a.x + aw / 2, ay = a.y + ah;
                const bx = b.x + bw / 2, by = b.y;
                const stroke = e.isBottleneck ? "#f87171" : e.isBackbone ? "#94a3b8" : "#cbd5e1";
                const sw = e.isBackbone ? 2.5 : e.isBottleneck ? 2 : 1.5;
                if (e.rework) {
                  const cx = Math.max(ax, bx) + 90;
                  return <path key={`e${i}`} d={`M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`}
                    fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="6 4" opacity="0.7" markerEnd="url(#arrowRed)" />;
                }
                return <g key={`e${i}`}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={sw} />
                  <polygon points={`${(ax+bx)/2-4},${(ay+by)/2-3} ${(ax+bx)/2+4},${(ay+by)/2-3} ${(ax+bx)/2},${(ay+by)/2+4}`} fill={stroke} />
                </g>;
              })}
              {edges.map((e, i) => {
                if (!e.selfLoop) return null;
                const n = nodes[e.from];
                const nx = n.x + (n.w || 56), ny = n.y + (n.h || 60) / 2;
                const stroke = e.isBottleneck ? "#f87171" : "#c4b5fd";
                return <path key={`sl${i}`} d={`M${nx},${ny-14} h22 a18,18 0 0 1 18,18 v0 a18,18 0 0 1 -18,18 h-22`}
                  fill="none" stroke={stroke} strokeWidth="2" markerEnd={e.isBottleneck ? "url(#arrowRed)" : "url(#arrowPurple)"} />;
              })}
              <defs>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" /></marker>
                <marker id="arrowPurple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c4b5fd" /></marker>
              </defs>
            </svg>

            {/* Edge label pills */}
            {edges.map((e, i) => {
              if (!e.count || e.from === 0) return null;
              const a = nodes[e.from], b = nodes[e.to];
              let px, py;
              if (e.selfLoop) { px = a.x + (a.w || 56) + 58; py = a.y + (a.h || 60) / 2; }
              else if (e.rework) { const ax2 = a.x + (a.w||56)/2, ay2 = a.y + (a.h||60), bx2 = b.x + (b.w||56)/2, by2 = b.y; px = Math.max(ax2,bx2)+80; py = (ay2+by2)/2; }
              else { const ax2 = a.x + (a.w||56)/2, ay2 = a.y + (a.h||60), bx2 = b.x + (b.w||56)/2, by2 = b.y; px = (ax2+bx2)/2+14; py = (ay2+by2)/2-4; }
              const edgeId = `${nodes[e.from].label} > ${nodes[e.to].label}`;
              const isHovered = hoveredEdge === i;
              return (
                <div key={`ep${i}`} onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)}
                  onClick={(ev) => handleEdgeClick(ev, i, px, py)}
                  style={{
                    position: "absolute", left: px, top: py, transform: "translate(-50%, -50%)",
                    display: "flex", alignItems: "center", gap: 4,
                    background: e.isBottleneck ? "#fef2f2" : "#fff",
                    border: `1px solid ${e.isBottleneck ? "#fecaca" : "#e5e7eb"}`,
                    borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 500,
                    color: e.isBottleneck ? "#991b1b" : "#64748b",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer", whiteSpace: "nowrap",
                    zIndex: isHovered ? 20 : 2,
                  }}>
                  {e.isBottleneck && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="#dc2626" strokeWidth="1.5" fill="none"/><line x1="8" y1="6" x2="8" y2="10" stroke="#dc2626" strokeWidth="1.5"/><circle cx="8" cy="12" r="0.8" fill="#dc2626"/></svg>}
                  <span># {e.count.toLocaleString()}</span>
                  {e.avgDuration && <span style={{ color: e.isBottleneck ? "#dc2626" : "#94a3b8" }}>{e.avgDuration}</span>}
                  {isHovered && (
                    <button onClick={(ev) => { ev.stopPropagation(); addContext({ type: "edge", id: edgeId, label: edgeId, count: e.count, avgDuration: e.avgDuration, severity: e.isBottleneck ? "bottleneck" : "none" }); }}
                      style={{ position: "absolute", top: -7, right: -7, width: 18, height: 18, borderRadius: "50%",
                        background: "#6366f1", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.3)", padding: 0, animation: "sparkleAppear 0.15s ease",
                      }} title="Add to context"><SparklesIcon size={8} /></button>
                  )}
                </div>
              );
            })}

            {/* Activity nodes */}
            {nodes.map((n, i) => {
              if (n.type === "circle") return (
                <div key={`n${i}`} style={{ position: "absolute", left: n.x, top: n.y, width: 56, height: 56,
                  borderRadius: "50%", background: "#1e293b", border: "3px solid #334155",
                  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.8px", textTransform: "uppercase" }}>{n.label}</span>
                </div>
              );
              const isHovered = hoveredNode === i;
              const isShiftSel = shiftSelected.includes(i);
              return (
                <div key={`n${i}`} onMouseEnter={() => setHoveredNode(i)} onMouseLeave={() => setHoveredNode(null)}
                  onClick={(ev) => handleNodeClick(ev, i, n)}
                  style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h || 60,
                    background: n.color || "#f8fafc",
                    border: isShiftSel ? "2.5px solid #6366f1" : `2px solid ${n.borderColor || "#e2e8f0"}`,
                    borderRadius: 10, padding: "10px 14px",
                    boxShadow: isShiftSel ? "0 0 0 3px rgba(99,102,241,0.2), 0 4px 16px rgba(99,102,241,0.15)" : isHovered ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
                    cursor: "pointer", transition: "box-shadow 0.15s ease, border 0.15s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    {n.bottleneck && <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="#dc2626" strokeWidth="1.5" fill="none"/><line x1="8" y1="6" x2="8" y2="10" stroke="#dc2626" strokeWidth="1.5"/><circle cx="8" cy="12" r="0.8" fill="#dc2626"/></svg>}
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: n.bottleneck ? "#991b1b" : "#1e293b", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                    <span># {n.count.toLocaleString()}</span>
                    {n.avgDuration && <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#94a3b8" strokeWidth="1.3"/><path d="M8 4.5V8l2.5 1.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      {n.avgDuration}</span>}
                  </div>
                  {isHovered && (
                    <button onClick={(ev) => { ev.stopPropagation(); addContext({ type: "node", label: n.label, count: n.count, avgDuration: n.avgDuration, severity: n.bottleneck ? "bottleneck" : "none" }); }}
                      style={{ position: "absolute", top: -9, right: -9, width: 24, height: 24, borderRadius: "50%",
                        background: "#6366f1", border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.35)", padding: 0, zIndex: 10, animation: "sparkleAppear 0.15s ease",
                      }} title="Add to context"><SparklesIcon size={11} /></button>
                  )}
                </div>
              );
            })}

            {/* Click popup (node or edge) */}
            {clickedPopup && (() => {
              const isNode = clickedPopup.type === "node";
              const PW = isNode ? 280 : 260;
              const ax = clickedPopup.x, ay = clickedPopup.y;
              const nw = isNode ? (nodes[clickedPopup.index]?.w || 180) : 0;
              const nh = isNode ? (nodes[clickedPopup.index]?.h || 60) : 0;
              // Show to the right by default, left if too close to right edge
              const rightSide = (ax + nw / 2 + 14 + PW) < 720;
              let popLeft = rightSide ? (ax + nw / 2 + 14) : (ax - nw / 2 - 14 - PW);
              let popTop = ay + nh / 2 - 60; // vertically center-ish near element
              if (popTop < 10) popTop = 10;
              if (popTop + 200 > 690) popTop = 490;
              if (popLeft < 5) popLeft = 5;
              const popData = isNode ? (NODE_POPUP_DATA[nodes[clickedPopup.index]?.id] || NODE_POPUP_DATA.free) : EDGE_POPUP_DATA;
              const label = isNode ? nodes[clickedPopup.index]?.label : `${nodes[edges[clickedPopup.index]?.from]?.label} → ${nodes[edges[clickedPopup.index]?.to]?.label}`;
              return (
                <div style={{ position: "absolute", left: popLeft, top: popTop, width: PW,
                  background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                  padding: "14px 16px", zIndex: 30, animation: "popupAppear 0.2s cubic-bezier(0.16,1,0.3,1)" }}>
                  <div style={{ position: "absolute", [rightSide ? "left" : "right"]: -6, top: 60,
                    width: 12, height: 12, background: "#fff", transform: "rotate(45deg)",
                    boxShadow: rightSide ? "-2px 2px 4px rgba(0,0,0,0.06)" : "2px -2px 4px rgba(0,0,0,0.06)" }} />
                  <button onClick={(ev) => { ev.stopPropagation(); setClickedPopup(null); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%",
                      background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#94a3b8" }}>×</button>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                      color: isNode ? "#6366f1" : "#0ea5e9", padding: "2px 6px", borderRadius: 3,
                      background: isNode ? "rgba(99,102,241,0.1)" : "rgba(14,165,233,0.1)" }}>{clickedPopup.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{label}</span>
                  </div>
                  {isNode ? renderNodeCharts(popData) : renderEdgeCharts(popData)}
                  <button onClick={(ev) => {
                    ev.stopPropagation();
                    const n = nodes[clickedPopup.index], e = edges[clickedPopup.index];
                    if (isNode) addContext({ type: "node", label: n.label, count: n.count, avgDuration: n.avgDuration, severity: n.bottleneck ? "bottleneck" : "none" });
                    else addContext({ type: "edge", id: `${nodes[e.from].label} > ${nodes[e.to].label}`, label: `${nodes[e.from].label} > ${nodes[e.to].label}`, count: e.count, avgDuration: e.avgDuration, severity: e.isBottleneck ? "bottleneck" : "none" });
                    setClickedPopup(null);
                  }} style={{ marginTop: 10, width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid #e0e7ff",
                    background: "rgba(99,102,241,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontSize: 11, fontWeight: 600, color: "#6366f1" }}>
                    <SparklesIcon size={10} color="#6366f1" /> Add to context
                  </button>
                </div>
              );
            })()}

            {/* Segment performance popup (shift-click two nodes) */}
            {segmentPopup && (() => {
              const fn = nodes[segmentPopup.from], tn = nodes[segmentPopup.to];
              if (!fn || !tn) return null;
              const SPW = 360, midY = (fn.y + tn.y + (tn.h || 60)) / 2;
              const popLeft = (720 - SPW) / 2, popTop = Math.max(20, midY - 170);
              const sd = SEGMENT_POPUP_DATA, maxH = Math.max(...sd.histogram);
              return (
                <div onClick={(ev) => ev.stopPropagation()} style={{ position: "absolute", left: popLeft, top: popTop, width: SPW,
                  background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
                  padding: "18px 20px", zIndex: 30, animation: "popupAppear 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>Throughput Time</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, marginBottom: 3, letterSpacing: "0.3px" }}>START ACTIVITY</div>
                      <div style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 500, color: "#1e293b",
                        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {fn.label}
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="#94a3b8" strokeWidth="1.2" fill="none"/></svg>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 14 }}>→</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, marginBottom: 3, letterSpacing: "0.3px" }}>END ACTIVITY</div>
                      <div style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 500, color: "#1e293b",
                        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {tn.label}
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="#94a3b8" strokeWidth="1.2" fill="none"/></svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>AVG TIME</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{sd.avgTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>MEDIAN</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{sd.medianTime}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>EVENT FLOWS</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#6366f1" }}>{sd.flowPct}%</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Throughput time</div>
                    <svg width="320" height="60" viewBox="0 0 320 60">
                      {sd.histogram.map((v, j) => {
                        const bw = 320 / sd.histogram.length - 3, bh = (v / maxH) * 50;
                        return <rect key={j} x={j * (bw + 3)} y={50 - bh} width={bw} height={bh} rx={2} fill={j >= 3 && j <= 6 ? "#6366f1" : "#e0e7ff"} />;
                      })}
                    </svg>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ position: "relative", height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                      <div style={{ position: "absolute", left: "15%", right: "30%", height: "100%", background: "#6366f1", borderRadius: 3 }} />
                      <div style={{ position: "absolute", left: "15%", top: -4, width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "2px solid #6366f1", transform: "translateX(-50%)" }} />
                      <div style={{ position: "absolute", right: "30%", top: -4, width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "2px solid #6366f1", transform: "translateX(50%)" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                      <span>{sd.rangeMin}</span>
                      <span>{sd.rangeMax}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{sd.flowPct}% event flows are selected</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={(ev) => { ev.stopPropagation(); setSegmentPopup(null); setShiftSelected([]); }}
                      style={{ padding: "7px 16px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0",
                        fontSize: 11, fontWeight: 500, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                    <button onClick={(ev) => { ev.stopPropagation(); setSegmentPopup(null); setShiftSelected([]); }}
                      style={{ padding: "7px 16px", borderRadius: 8, background: "#6366f1", border: "none",
                        fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Apply Filter</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Floating: Supporting information (left) */}
        <div style={{
          position: "absolute", top: 16, left: 16, width: 300, maxHeight: "calc(100% - 32px)",
          background: "#fff", borderRadius: 14, boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
          overflowY: "auto", padding: "16px 18px", zIndex: 10,
          animation: "slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>Supporting information</div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#a0a8b8", cursor: "pointer" }}>^</div>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#a0a8b8", cursor: "pointer" }}>+</div>
            </div>
          </div>
          {renderBarSection("Frequency by variant name", variantData, 3492, "variant")}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -12, marginBottom: 20, fontSize: 10, color: "#7a8194" }}>
            <span>Performance indicator</span><span style={{ fontWeight: 600 }}>6.83 m.</span>
            <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2 }}><div style={{ width: "65%", height: "100%", background: "#4f6df5", borderRadius: 2 }} /></div>
            <span style={{ fontWeight: 600 }}>292.39 d.</span>
          </div>
          {renderBarSection("Frequency by blocked hold reason code", holdData, 73, "hold")}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -12, marginBottom: 20, fontSize: 10, color: "#7a8194" }}>
            <span>Performance indicator</span><span style={{ fontWeight: 600 }}>0</span>
            <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2 }}><div style={{ width: "45%", height: "100%", background: "#4f6df5", borderRadius: 2 }} /></div>
            <span style={{ fontWeight: 600 }}>155.78 d.</span>
          </div>
          {renderBarSection("Frequency by release type", releaseData, 167, "release")}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -12, fontSize: 10, color: "#7a8194" }}>
            <span>Performance indicator</span><span style={{ fontWeight: 600 }}>0 m.</span>
            <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2 }}><div style={{ width: "85%", height: "100%", background: "#4f6df5", borderRadius: 2 }} /></div>
            <span style={{ fontWeight: 600 }}>2.68 d.</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div style={{ position: "absolute", left: 20, bottom: 24, display: "flex", flexDirection: "column", gap: 4, zIndex: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#5a5f6e", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>+</div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#5a5f6e", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>-</div>
        </div>

        {/* Floating: Namuda chat (right) */}
        {!chatOpen ? (
          /* Minimized — orb at bottom-right */
          <div onClick={() => { setChatOpen(true); setHasNotified(true); }}
            style={{
              position: "absolute", bottom: 24, right: 24, width: 56, height: 56,
              borderRadius: "50%", background: "#fff", border: "2px solid #e8ebf0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 12,
              animation: "slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) 0.4s both",
            }}>
            <Blob state="idle" size={48} />
            {!hasNotified && (
              <>
                <div style={{
                  position: "absolute", top: -2, right: -2, width: 12, height: 12, borderRadius: "50%",
                  background: "#6366f1", border: "2.5px solid #fff",
                  animation: "notifyPulse 2s ease infinite, notifyShake 0.5s ease 3s infinite",
                }} />
                <div key={mutterIdx} style={{
                  position: "absolute", bottom: "100%", right: 0, marginBottom: 8,
                  background: "#1e293b", color: "#f8fafc", fontSize: 11.5, fontWeight: 500,
                  fontStyle: "italic", padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap",
                  animation: "mutterIn 0.4s ease", pointerEvents: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                  {MUTTERS[mutterIdx]}
                  <div style={{
                    position: "absolute", bottom: -4, right: 16, width: 8, height: 8,
                    background: "#1e293b", transform: "rotate(45deg)",
                  }} />
                </div>
              </>
            )}
          </div>
        ) : (
          /* Expanded chat panel */
          <div style={{
            position: "absolute", top: 16, right: 16, bottom: 16, width: 360,
            background: "#fff", borderRadius: 14,
            boxShadow: "0 4px 28px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)",
            display: "flex", flexDirection: "column", zIndex: 12,
            animation: "chatSlideIn 0.3s ease",
          }}>
            {/* Header */}
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Blob state="idle" size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>namuda</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{aiContext.length} item{aiContext.length !== 1 ? "s" : ""} selected</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {aiContext.length > 0 && (
                  <button onClick={() => setAiContext([])} style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}>Clear all</button>
                )}
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", display: "flex" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 5l-4 4M5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>

            {/* Context items */}
            {aiContext.length > 0 && (
              <div style={{ padding: "8px 10px", maxHeight: 160, overflowY: "auto", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                {aiContext.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, marginBottom: 3, background: "#f8fafc", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: typeColor(item.type), letterSpacing: "0.5px", flexShrink: 0 }}>{item.type}</span>
                      <span style={{ color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                      {item.severity === "bottleneck" && <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: "#fef2f2", color: "#dc2626", flexShrink: 0 }}>bottleneck</span>}
                    </div>
                    <button onClick={() => setAiContext(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#cbd5e1", display: "flex", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Welcome */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e8ebf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#5a5f6e" }}>N</span>
                </div>
                <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "4px 12px 12px 12px", fontSize: 12, color: "#475569", lineHeight: 1.6, maxWidth: "85%" }}>
                  I'm here to help you explore this process. Add nodes, edges, or filters as context using the sparkle icons, and I'll help you find insights.
                </div>
              </div>
              {chatMessages.map((msg, i) => {
                if (msg.type === "finding") return (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e8ebf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#5a5f6e" }}>N</span>
                    </div>
                    <div style={{ maxWidth: "90%", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{
                        padding: "12px 14px", borderRadius: "4px 12px 12px 12px",
                        background: findingStored ? "#f0fdf4" : "linear-gradient(135deg, #fafaff, #f0f2ff)",
                        border: findingStored ? "1.5px solid #86efac" : "1.5px solid #b8c4f5",
                        animation: findingStored ? "findingStore 0.6s ease" : "findingGlow 2s ease infinite",
                        transition: "all 0.3s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: findingStored ? "#dcfce7" : "#fef2f2", color: findingStored ? "#16a34a" : msg.sevColor }}>{findingStored ? "Stored" : msg.severity}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{msg.title}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6, marginBottom: findingExpanded ? 8 : 0 }}>{msg.summary}</div>
                        {findingExpanded && (
                          <div style={{ fontSize: 11, color: "#6366f1", lineHeight: 1.6, padding: "8px 0", borderTop: "1px solid #e0e7ff", marginTop: 4 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Recommendation</div>
                            {msg.recommendation}
                          </div>
                        )}
                        {!findingStored && (
                          <button onClick={() => setFindingExpanded(!findingExpanded)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#6366f1", fontWeight: 600, padding: "4px 0", marginTop: 4 }}>
                            {findingExpanded ? "Hide details" : "View details >"}
                          </button>
                        )}
                      </div>
                      {!findingStored && (
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                          Should we store this and move on to the improvement process?
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button onClick={storeFinding} style={{ padding: "6px 14px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Yes, store finding</button>
                            <button onClick={keepExploring} style={{ padding: "6px 14px", borderRadius: 8, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Keep exploring</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
                return (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                    {msg.role === "ai" && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e8ebf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: "#5a5f6e" }}>N</span>
                      </div>
                    )}
                    <div style={{
                      padding: "10px 12px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
                      background: msg.role === "user" ? "#6366f1" : "#f8fafc",
                      color: msg.role === "user" ? "#fff" : "#475569",
                      fontSize: 12, lineHeight: 1.6, maxWidth: "85%",
                    }}>{msg.text}</div>
                  </div>
                );
              })}
              {aiTyping && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e8ebf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#5a5f6e" }}>N</span>
                  </div>
                  <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "4px 12px 12px 12px", fontSize: 12, color: "#94a3b8" }}>
                    <span style={{ animation: "notifyPulse 1s ease infinite" }}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "8px 12px", border: "1px solid #e2e8f0" }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                  placeholder="Ask about selected items..."
                  style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 12, color: "#334155" }} />
                <button onClick={sendChat} style={{
                  width: 28, height: 28, borderRadius: 8, background: chatInput.trim() ? "#6366f1" : "#e2e8f0",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: chatInput.trim() ? "pointer" : "default", transition: "background 0.15s ease", flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M1 8h14M10 3l5 5-5 5" stroke={chatInput.trim() ? "#fff" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: "6px 20px", borderTop: "1px solid #e8ebf0", background: "#fff", flexShrink: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#a0a8b8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>35.9K cases</span><span>893K events</span>
          <div style={{ width: 60, height: 6, background: "linear-gradient(90deg, #f0f2f5, #6366f1)", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>69%</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["[]", ">>", "v"].map((s, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#a0a8b8", cursor: "pointer" }}>{s}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e" }}>Cases</div>
        </div>
      </div>
    </div>
  );
}

/* ═══ JUNCTION PANEL ═══ */
function JunctionPanel({ onSelect, goals }) {
  const goalFindings = [
    { goalIdx: 1, severity: "Critical", sevColor: "#c43030", label: "Lower rework rate",
      finding: "52% Confirmed Changed loop — 3 sites above 60% rework rate" },
    { goalIdx: 0, severity: "High", sevColor: "#d4685a", label: "Reduce throughput time",
      finding: "Approval bottleneck accounts for 22% of total cycle time" },
    { goalIdx: 3, severity: "High", sevColor: "#d4685a", label: "Increase conformance",
      finding: "1,167 of 1,175 variants cover only 30% of cases" },
    { goalIdx: 2, severity: "Medium", sevColor: "#e8b84a", label: "Improve data quality",
      finding: "item_signal 95% null, selection_code 42% null" },
  ];

  const hoverIn = (e) => { e.currentTarget.style.borderColor = "#c0c5d0"; e.currentTarget.style.transform = "translateY(-1px)"; };
  const hoverOut = (e) => { e.currentTarget.style.borderColor = "#e8ebf0"; e.currentTarget.style.transform = "translateY(0)"; };

  return (
    <div style={{ ...ps, width: 480, maxHeight: "85vh" }}>
      <div style={{ padding: "20px 22px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>What's next?</div>
        <div style={{ fontSize: 12, color: "#8a8f9e", marginBottom: 16, lineHeight: 1.5 }}>
          Choose how you'd like to continue.
        </div>
      </div>
      <div style={{ padding: "0 22px 16px", overflowY: "auto", maxHeight: "62vh" }}>
        {/* Option 1: Tour */}
        <button onClick={() => onSelect("tour")} style={{
          width: "100%", padding: "14px 16px", marginBottom: 8,
          background: "#fff", border: "1.5px solid #e8ebf0", borderRadius: 10,
          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1d23", marginBottom: 3 }}>Take a tour of Namuda</div>
            <div style={{ fontSize: 11.5, color: "#7a8194", lineHeight: 1.5 }}>See how Mission Control works — a guided walkthrough of the platform.</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 12 }}><path d="M6 4l4 4-4 4" stroke="#a0a8b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Option 2: Canvas — featured */}
        <button onClick={() => onSelect("canvas")} style={{
          width: "100%", padding: "16px 18px", marginBottom: 10,
          background: "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)",
          border: "1.5px solid #d0d5f5", borderRadius: 12, cursor: "pointer",
          textAlign: "left", display: "flex", gap: 14, alignItems: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f6df5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5f5"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="2" width="24" height="8" rx="3" fill="#b080d0" opacity="0.6"/>
            <rect x="8" y="14" width="20" height="6" rx="2.5" fill="#e8a0b8" opacity="0.6"/>
            <rect x="2" y="24" width="16" height="6" rx="2.5" fill="#e0c8c0" opacity="0.6"/>
            <line x1="16" y1="10" x2="18" y2="14" stroke="#c0c5d0" strokeWidth="1"/>
            <line x1="18" y1="20" x2="10" y2="24" stroke="#c0c5d0" strokeWidth="1"/>
            <path d="M26 17 C32 17 32 11 24 8" stroke="#d0a0a0" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2a2e60", marginBottom: 3 }}>Explore process in canvas</div>
            <div style={{ fontSize: 12, color: "#5a5f8a", lineHeight: 1.5 }}>
              See every path, bottleneck, and rework loop — fully visualized with filters and analytics.
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6 4l4 4-4 4" stroke="#4f6df5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Option 3: Start improving — with ranked goals */}
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8, marginTop: 6 }}>Start improving</div>
        <div style={{ fontSize: 11.5, color: "#7a8194", lineHeight: 1.5, marginBottom: 10 }}>
          Jump into findings ranked by severity and start working on improvements.
        </div>
        {goalFindings.map((gf, i) => (
          <button key={i} onClick={() => onSelect(`goal-${gf.goalIdx}`)} style={{
            width: "100%", padding: "12px 14px", marginBottom: 6,
            background: "#fff", border: "1.5px solid #e8ebf0", borderRadius: 9,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff", background: gf.sevColor,
                }}>{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{gf.label}</div>
              </div>
              <div style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: gf.severity === "Critical" ? "#fde8e8" : gf.severity === "High" ? "#fef3e8" : "#f0f2f5",
                color: gf.sevColor,
              }}>{gf.severity}</div>
            </div>
            <div style={{ fontSize: 11.5, color: "#6a7086", lineHeight: 1.5, marginLeft: 26 }}>{gf.finding}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ PROCESS TEASER ═══ */
function ProcessTeaser({ onClose, inline }) {
  const nodes = [
    { label: "Start", x: 120, y: 18, w: 50, type: "circle" },
    { label: "Free", x: 80, y: 70, w: 100, count: "215K", color: "#e8a0b8" },
    { label: "Approved", x: 100, y: 140, w: 110, count: "313K", color: "#b080d0" },
    { label: "Last confirmation", x: 80, y: 215, w: 130, count: "228K", color: "#e8a0b8", warn: true },
    { label: "First confirmation", x: 160, y: 290, w: 120, count: "77K", color: "#e0c8c0" },
    { label: "Blocked", x: 100, y: 355, w: 110, count: "71K", color: "#e0c8c0" },
    { label: "End", x: 50, y: 420, w: 50, type: "circle" },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [3, 2], // rework loop
    [4, 3], // rework loop
  ];

  return (
    <div style={{
      ...(inline ? { width: "100%", maxWidth: 360 } : { position: "absolute", top: 16, right: 16, bottom: 16, width: 320 }),
      background: inline ? "#fff" : "transparent", borderRadius: 14,
      border: "1px solid rgba(160,168,184,0.2)",
      boxShadow: inline ? "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)" : "none",
      display: "flex", flexDirection: "column",
      animation: inline ? "none" : "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 8,
    }}>
      <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(160,168,184,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#8a8f9e", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 2 }}>Process Preview</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3a3f4a" }}>Purchase-to-Receive</div>
        </div>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(160,168,184,0.25)",
          background: "transparent", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, color: "#a0a8b8", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#5a5f6e"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a0a8b8"; }}
        >✕</button>
      </div>
      <div style={{ flex: 1, padding: "12px 16px", overflowY: "auto" }}>
        <svg width="288" height="450" viewBox="0 0 288 450" style={{ display: "block" }}>
          {/* Edges */}
          {edges.map(([from, to], i) => {
            const a = nodes[from], b = nodes[to];
            const ax = a.x + (a.w || 50) / 2, ay = a.y + (a.type === "circle" ? 14 : 18);
            const bx = b.x + (b.w || 50) / 2, by = b.y;
            const isRework = from > to;
            if (isRework) {
              const cx = Math.max(ax, bx) + 40;
              return <path key={i} d={`M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`}
                fill="none" stroke="#d0a0a0" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />;
            }
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#c0c5d0" strokeWidth="1.2" />;
          })}
          {/* Arrow markers on straight edges */}
          {edges.filter(([f, t]) => f < t).map(([from, to], i) => {
            const a = nodes[from], b = nodes[to];
            const ax = a.x + (a.w || 50) / 2, ay = a.y + (a.type === "circle" ? 14 : 18);
            const bx = b.x + (b.w || 50) / 2, by = b.y;
            const mx = (ax + bx) / 2, my = (ay + by) / 2;
            return <polygon key={`arr${i}`} points={`${mx-3},${my-2} ${mx+3},${my-2} ${mx},${my+3}`} fill="#c0c5d0" />;
          })}
          {/* Nodes */}
          {nodes.map((n, i) => {
            if (n.type === "circle") {
              return <g key={i}>
                <circle cx={n.x + 25} cy={n.y + 10} r={14} fill="#fff" stroke="#c0c5d0" strokeWidth="1.5" />
                <text x={n.x + 25} y={n.y + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#5a5f6e">{n.label}</text>
              </g>;
            }
            return <g key={i}>
              <rect x={n.x} y={n.y} width={n.w} height={32} rx="6" fill={n.color || "#e0e2e8"} stroke={n.warn ? "#d08080" : "rgba(160,168,184,0.3)"} strokeWidth={n.warn ? "1.5" : "1"} strokeDasharray={n.warn ? "3 2" : "none"} />
              <text x={n.x + n.w / 2} y={n.y + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#3a3040">{n.label}</text>
              <text x={n.x + n.w / 2} y={n.y + 25} textAnchor="middle" fontSize="8" fill="#7a7080">{n.count}</text>
            </g>;
          })}
          {/* Rework annotation */}
          <text x="250" y="180" fontSize="8" fill="#d08080" fontWeight="600" fontStyle="italic">rework</text>
          <text x="250" y="190" fontSize="8" fill="#d08080" fontStyle="italic">loop</text>
        </svg>
        <div style={{ padding: "10px 0", borderTop: "1px solid rgba(160,168,184,0.15)", marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#7a8194", lineHeight: 1.5 }}>
            This is a preview of your process flow. The full interactive canvas will be available after the onboarding.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[{ l: "7 activities", c: "#b080d0" }, { l: "Rework loop detected", c: "#d08080" }].map(t => (
              <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: t.c }} />
                <span style={{ fontSize: 10, color: "#8a8f9e" }}>{t.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ STEP MAP ═══ */
const steps = [
  { id: "data", label: "Connect data", phases: ["intro", "data"] },
  { id: "fields", label: "Field mapping", phases: ["core-fields", "core-fields-reveal", "fields"] },
  { id: "profile", label: "Data quality", phases: ["data-profile"] },
  { id: "context", label: "Process context", phases: ["fact-gathering", "mission-review"] },
  { id: "review", label: "Review context", phases: ["review"] },
  { id: "goals", label: "Set goals", phases: ["pre-goals", "strategy-animation", "goals"] },
  { id: "targets", label: "Set targets", phases: ["targets"] },
  { id: "junction", label: "What's next", phases: ["junction"] },
  { id: "done", label: "Explore", phases: ["done", "tour", "canvas", "goal-dive"] },
];

function StepMap({ phase, onJump, fieldProgress }) {
  const currentIdx = steps.findIndex(s => s.phases.includes(phase));
  const isFieldPhase = phase === "core-fields" || phase === "core-fields-reveal" || phase === "fields";
  const coreFieldsDone = phase === "fields" || phase === "core-fields-reveal";
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 175,
      background: "#fff", borderRadius: 12, padding: "16px 14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
      zIndex: 5, animation: "fadeUp 0.4s ease",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Progress</div>
      {steps.map((s, i) => {
        const isCurrent = i === currentIdx;
        const isDone = i < currentIdx;
        const showSubItems = s.id === "fields" && isCurrent && isFieldPhase && fieldProgress;
        return (
          <div key={s.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                <div style={{
                  width: isCurrent ? 10 : 8, height: isCurrent ? 10 : 8, borderRadius: "50%",
                  background: isDone ? "#7bc67e" : isCurrent ? "#4f6df5" : "#e0e2e8",
                  border: isCurrent ? "2px solid #d0d8ff" : "none",
                  transition: "all 0.3s",
                }} />
                {(i < steps.length - 1 && !showSubItems) && (
                  <div style={{ width: 1.5, height: 20, background: isDone ? "#7bc67e" : "#e8eaef", transition: "background 0.3s" }} />
                )}
              </div>
              <button
                onClick={() => !isCurrent && onJump(s)}
                disabled={isCurrent}
                style={{
                  background: "none", border: "none", padding: "0 0 12px 0", cursor: isCurrent ? "default" : "pointer",
                  fontSize: 11.5, fontWeight: isCurrent ? 600 : 400, textAlign: "left",
                  color: isDone ? "#4a5060" : isCurrent ? "#1a1d23" : "#b0b5c0",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.color = "#4f6df5"; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.color = isDone ? "#4a5060" : "#b0b5c0"; }}
              >
                {isDone && <span style={{ marginRight: 4, fontSize: 9, color: "#7bc67e" }}>✓</span>}
                {s.label}
              </button>
            </div>
            {/* Sub-items for field mapping */}
            {showSubItems && (
              <div style={{ marginLeft: 8, paddingLeft: 8, borderLeft: "1.5px solid #e8eaef", paddingBottom: 8, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                  <span style={{ fontSize: 9, color: coreFieldsDone ? "#7bc67e" : "#4f6df5" }}>{coreFieldsDone ? "✓" : "●"}</span>
                  <span style={{ fontSize: 10, color: coreFieldsDone ? "#7a8194" : "#4f6df5", fontWeight: coreFieldsDone ? 400 : 600 }}>Core fields</span>
                </div>
                {fieldProgress.fields.map((f, fi) => {
                  const isActive = coreFieldsDone && fi === fieldProgress.currentIdx;
                  const fDone = f.confirmed;
                  return (
                    <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                      <span style={{ fontSize: 9, color: fDone ? "#7bc67e" : isActive ? "#4f6df5" : "#d0d5e0" }}>{fDone ? "✓" : isActive ? "●" : "○"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: isActive ? "#4f6df5" : fDone ? "#7a8194" : "#b0b5c0", fontWeight: isActive ? 600 : 400 }}>{f.n}</span>
                    </div>
                  );
                })}
                {i < steps.length - 1 && (
                  <div style={{ position: "relative", left: -9, width: 1.5, height: 8, background: "#e8eaef", marginTop: 2 }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ QUIRKY THOUGHTS ═══ */
const qt = {
  loading: ["Unboxing your data...", "Counting rows enthusiastically...", "Befriending your timestamps..."],
  fields: ["Interrogating every column...", "Playing field detective...", "Sorting dimensions by vibes..."],
  drafting: ["Putting it all together...", "Drafting the document...", "Composing the narrative..."],
  goals: ["Identifying improvement areas...", "Looking for opportunities...", "Benchmarking against the best..."],
};

/* ═══ FACT-GATHERING QUESTIONS (single sequence) ═══ */
const factQs = [
  // General
  { q: "Tell me about this process — what's it for?", group: "general", idx: 0,
    choices: [
      { label: "Procurement / purchasing", desc: "Orders, approvals, goods receipt" },
      { label: "Manufacturing / production", desc: "Production orders, work centers" },
      { label: "Logistics / distribution", desc: "Shipping, warehousing, delivery" },
    ]},
  { q: "Which teams or departments handle these orders?", group: "general", idx: 1,
    choices: [
      { label: "Purchasing teams across regional offices" },
      { label: "Central procurement department" },
      { label: "Mix of local and central teams" },
    ]},
  { q: "Are any steps automated, or is it mostly manual?", group: "general", idx: 2,
    choices: [
      { label: "Mostly manual with some automated routing" },
      { label: "Highly automated end-to-end" },
      { label: "Mix — approvals are manual, rest is automated" },
    ]},
  { q: "Any known pain points the team already complains about?", group: "general", idx: 3,
    choices: [
      { label: "Too much rework in the confirmation step" },
      { label: "Slow approvals bottleneck everything" },
      { label: "Inconsistent process across sites" },
    ]},
  // Field meanings
  { q: "selection_code has 42% null values. What does this field represent?", group: "field", field: "selection_code",
    choices: [
      { label: "Order routing code — determines approval path" },
      { label: "Legacy code from old system — partially migrated" },
      { label: "Not sure — need to check with the team" },
    ]},
  { q: "item_signal is 95% null. Is this field still in use?", group: "field", field: "item_signal",
    choices: [
      { label: "Deprecated — safe to ignore" },
      { label: "Still used for automation triggers" },
      { label: "Was supposed to be rolled out but wasn't" },
    ]},
  { q: "receiving_site has values like PM1, PN1, PK3. What do these codes mean?", group: "field", field: "receiving_site",
    choices: [
      { label: "Physical site codes — PM = main plant, PN = north", desc: "PM1 is the main facility" },
      { label: "Regional warehouse codes" },
      { label: "Department identifiers within one location" },
    ]},
  // Hypotheses
  { q: "52% of orders rework through 'Confirmed Changed'. What's driving this?", group: "hypothesis", idx: 0,
    choices: [
      { label: "Process design issue — confirmation step requires manual re-entry" },
      { label: "Data entry errors upstream" },
      { label: "Vendor-side changes after initial confirmation" },
    ]},
  { q: "PM1 is significantly faster than other sites. Any idea why?", group: "hypothesis", idx: 1,
    choices: [
      { label: "Dedicated team and simpler product mix" },
      { label: "Better tooling or automation at that site" },
      { label: "Smaller volume allows faster processing" },
    ]},
  { q: "Volume dropped 50% over the period. What happened?", group: "hypothesis", idx: 2,
    choices: [
      { label: "Structural change — not seasonal" },
      { label: "Seasonal pattern — normal for this business" },
      { label: "Organizational change or consolidation" },
    ]},
];

const SKIP_RE = /^(skip|enough|pass|later|no thanks|not now|enough for now|move on|next)$/i;

/* ═══ MAIN ═══ */
const INTRO = "Welcome to Namuda, we have been waiting for you. Improvement lives off data, should we get started?";

export default function App() {
  const [scene, setScene] = useState("dark");
  const [phase, setPhase] = useState("intro");
  const [introDone, setIntroDone] = useState(false);
  const [input, setInput] = useState("");
  const [userMsgs, setUserMsgs] = useState([]); // only user bubbles at bottom
  const [blobText, setBlobText] = useState(""); // current blob speech
  const [blob, setBlob] = useState("idle");
  const [panel, setPanel] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [bgLight, setBgLight] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  // Conversation history — tracks resolved choices and messages in the chat column
  const [convoHistory, setConvoHistory] = useState([]); // [{type:'resolved-choice'|'blob-msg', question, answer, text, id}]
  const addConvo = useCallback((item) => setConvoHistory(h => [...h, { ...item, id: Date.now() + Math.random() }]), []);
  // Choice flow state — manages the "something else" back-and-forth
  const [activeChoice, setActiveChoice] = useState(null); // null | {question, options, phase, onResolve, allowCustom, customLabel, onSkip}
  const [refineState, setRefineState] = useState(null); // null | {question, userSuggestion, aiProposal, onResolve}
  const [docData, setDocData] = useState(null);
  const [docVisible, setDocVisible] = useState(true);
  const [goalsDoc, setGoalsDoc] = useState(null);
  const [targetIdx, setTargetIdx] = useState(0);
  const [activeTargets, setActiveTargets] = useState([]); // target indices matching selected goals
  const [acceptedTargets, setAcceptedTargets] = useState([]); // targets confirmed by user
  const [showProcessTeaser, setShowProcessTeaser] = useState(false);
  const [showCenterProcess, setShowCenterProcess] = useState(false);
  const [centerProcessFading, setCenterProcessFading] = useState(false);
  const [dqNarrativeStep, setDqNarrativeStep] = useState(0);
  const [ctxNarrativeStep, setCtxNarrativeStep] = useState(0);
  const [canvasTransitionPhase, setCanvasTransitionPhase] = useState(null);
  const [strategyStep, setStrategyStep] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [fieldIdx, setFieldIdx] = useState(0);
  const [mappedFields, setMappedFields] = useState(() => dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
  const userMsgRef = useRef(null);
  const convoScrollRef = useRef(null);

  useEffect(() => { if (userMsgRef.current) userMsgRef.current.scrollTop = userMsgRef.current.scrollHeight; }, [userMsgs]);
  useEffect(() => { if (convoScrollRef.current) convoScrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" }); }, [convoHistory, activeChoice, refineState]);

  // Moonrise
  useEffect(() => {
    setTimeout(() => setScene("rising"), 600);
    setTimeout(() => setBgLight(0.4), 2000);
    setTimeout(() => setBgLight(1), 3400);
    setTimeout(() => { setScene("intro"); setShowIntro(true); }, 4800);
  }, []);

  const addUser = useCallback((t) => setUserMsgs(m => [...m, { text: t, id: Date.now() + Math.random() }]), []);
  const clearUser = () => setUserMsgs([]);

  /* ─── CHOICE FLOW HELPERS ─── */
  // Show a choice widget in the chat flow
  const showChoice = useCallback((config) => {
    // config: { question, options, allowCustom, customLabel, onSkip, onResolve(index, label) }
    setActiveChoice(config);
    setRefineState(null);
  }, []);

  // Resolve a choice — collapse it, add to history, call the callback
  const resolveChoice = useCallback((question, answer, callback) => {
    setActiveChoice(null);
    setRefineState(null);
    addConvo({ type: 'resolved-choice', question, answer });
    if (callback) callback();
  }, [addConvo]);

  // Simulate AI refining a custom "something else" suggestion
  // In a real app this would call an API — here we generate a plausible refinement
  const simulateRefine = useCallback((question, userText, onResolve) => {
    setActiveChoice(null);
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      // Simulated AI proposal based on the user's text
      const proposal = userText.length > 40 ? userText : `${userText} — adjusted for clarity and aligned with process mining terminology`;
      setRefineState({
        question,
        userSuggestion: userText,
        aiProposal: proposal,
        onResolve,
      });
    }, 800);
  }, []);


  const doThink = (key, dur, cb) => {
    setThinking(true); setBlob("thinking"); setThoughts(qt[key] || [""]);
    clearUser(); setPanel(null); setBlobText(""); setActiveChoice(null); setRefineState(null);
    setTimeout(() => { setThinking(false); setBlob("waiting"); setThoughts([]); cb(); }, dur);
  };

  const bumpScore = (amount) => {
    setDocData(prev => prev ? { ...prev, contextScore: Math.min(100, (prev.contextScore || 0) + amount) } : prev);
  };

  const finishDraft = () => {
    doThink("drafting", 4000, () => {
      setDocData(prev => ({
        ...prev,
        contextScore: Math.max(prev?.contextScore || 0, 30),
        mission: prev?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
        description: prev?.description || "Orders are created, released, approved, sent to vendors, processed, confirmed, and received across 17 sites.",
        kpis: [
          { l: "Avg throughput time", v: "18.8 days" }, { l: "Rework rate", v: "52%" },
          { l: "Process variants", v: "1,175" }, { l: "Data quality score", v: "50 / 100" },
          { l: "Fastest site (PM1)", v: "7.7 days" }, { l: "Slowest site (PN1)", v: "34.0 days" },
        ],
      }));
      setCtxNarrativeStep(4);
      setBlobText("Please review the process context, and we will move one step closer to improvements!");
      setPhase("review");
    });
  };

  const goToMissionReview = () => {
    const proposedMission = "To have an efficient purchasing process that is uniform across all sales offices.";
    setDocData(prev => ({ ...prev, mission: proposedMission }));
    bumpScore(5);

    // Step 3: Spotlight on mission statement
    setCtxNarrativeStep(3);
    setBlobText("Based on everything you\u2019ve shared, I now have enough context to propose something important \u2014 the mission statement for this process.");

    setTimeout(() => {
      setBlobText(`A mission statement defines the north star for improvement. It connects daily operations to strategic goals, and every finding, target, and action flows from it.\n\n\u201C${proposedMission}\u201D`);
      setPhase("mission-review");
      // Show accept/refine choice
      showChoice({
        question: "Does this mission capture your direction?",
        options: [
          { label: "This captures our direction" },
          { label: "Almost \u2014 I\u2019d refine it" },
        ],
        allowCustom: true,
        customLabel: "I have a different vision",
        onResolve: (idx, label) => {
          const acceptMission = (missionText) => {
            setDocData(prev => ({ ...prev, mission: missionText }));
            resolveChoice("Does this mission capture your direction?", missionText, () => {
              setBlobText("The mission is set. Let me now compose the full document around it.");
              setTimeout(() => finishDraft(), 800);
            });
          };
          if (idx === 0) {
            acceptMission(proposedMission);
          } else if (idx === 1) {
            // Close but needs adjustment — let user refine
            simulateRefine("Does this mission capture your direction?", "The mission should also mention reducing rework and improving speed", acceptMission);
          } else {
            // Custom mission — label is already the refined text from the refine dialogue
            acceptMission(label);
          }
        },
      });
    }, 2500);
  };

  const goToDraft = () => {
    setBlobText("No problem — you can always come back to improve the score later.");
    setTimeout(() => goToMissionReview(), 800);
  };

  // Process a fact-gathering answer and update doc
  const applyFactAnswer = (fq, answer) => {
    if (fq.group === "general") {
      if (fq.idx === 0) setDocData(prev => ({ ...prev, description: "A procurement process where orders are created, routed, and received across multiple sites." }));
      else if (fq.idx === 1) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Handled by purchasing teams across regional offices." }));
      else if (fq.idx === 2) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Mix of manual approvals and automated routing." }));
      else if (fq.idx === 3) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Key pain point: excessive rework in the confirmation step." }));
      bumpScore(8);
    } else if (fq.group === "field") {
      const meanings = { selection_code: "Order routing code — determines approval path", item_signal: "Procurement signal for automation — mostly unused", receiving_site: "Physical site codes — PM1 = main plant, PN1 = north facility" };
      setDocData(prev => {
        const existing = prev.fieldAnnotations || [];
        if (existing.some(a => a.field === fq.field)) return prev;
        return { ...prev, fieldAnnotations: [...existing, { field: fq.field, meaning: answer.length > 10 ? answer : meanings[fq.field] }] };
      });
      bumpScore(8);
    } else if (fq.group === "hypothesis") {
      const hyps = ["Rework likely caused by process design — confirmation step requires manual re-entry", "PM1 speed advantage may be due to dedicated team and simpler product mix", "Volume drop appears structural — not seasonal"];
      setDocData(prev => {
        const existing = prev.hypotheses || [];
        if (existing.length > fq.idx) return prev;
        return { ...prev, hypotheses: [...existing, hyps[fq.idx]] };
      });
      bumpScore(8);
    }
  };

  const send = () => {
    const v = input.trim(); if (!v) return; setInput("");
    addUser(v);

    if (phase === "intro") {
      // Intro is handled by choice widget; fallback for free text
      setBlob("thinking");
      if (/^(yes|yeah|yep|sure|let'?s|ok|go|start|y|absolutely|definitely)$/i.test(v)) {
        setTimeout(() => {
          setBlob("waiting");
          setBlobText("First, I need your data — this is what I'll analyze to understand the process.");
          showChoice({
            question: "Which dataset should we work with?",
            options: demos.map(d => ({ label: d.name, desc: `${d.desc} — ${d.cases} cases, ${d.period}` })),
            allowCustom: true,
            customLabel: "Upload my own data",
            onResolve: (di, dl) => {
              if (di >= 0) { resolveChoice("Which dataset should we work with?", dl, () => pickData()); }
              else { resolveChoice("Which dataset should we work with?", "Upload my own", () => { setPanel("upload"); }); }
            },
          });
          setPhase("data");
        }, 800);
      } else {
        setTimeout(() => { setBlob("waiting"); setBlobText("No rush. Use the choices above, or say the word when ready."); }, 500);
      }
    } else if (phase === "data") {
      // Data selection is now handled by inline choice widget
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Please pick from the choices above — or type to tell me about your data."); }, 500);

    } else if (phase === "core-fields") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the core fields above and click 'Got it' when ready."); }, 500);

    } else if (phase === "data-profile") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Take a look at the data quality panel — I'm walking you through it. Click 'Looks good' when ready."); }, 500);

    } else if (phase === "fields") {
      setBlob("thinking");
      const idx = fieldIdx;
      setTimeout(() => {
        setBlob("waiting");
        setMappedFields(prev => prev.map((f, i) => i === idx ? { ...f, confirmed: true, meaning: v } : f));
        setBlobText(`Got it — updated \`${mappedFields[idx]?.n}\`.`);
        setTimeout(() => advanceField(idx), 1000);
      }, 500);

    } else if (phase === "fact-gathering") {
      if (SKIP_RE.test(v)) { goToDraft(); return; }
      // User typed free text instead of using choice widget — apply it and advance
      setBlob("thinking");
      setActiveChoice(null); // dismiss any active choice widget
      const fq = factQs[qIdx];
      setTimeout(() => {
        setBlob("waiting");
        applyFactAnswer(fq, v);
        addConvo({ type: 'resolved-choice', question: fq.q, answer: v });
        advanceFactQuestion(qIdx);
      }, 700);

    } else if (phase === "mission-review") {
      // Mission review now handled by choice widget; fallback for free text
      setBlob("thinking");
      setActiveChoice(null);
      setTimeout(() => {
        setBlob("waiting");
        setDocData(prev => ({ ...prev, mission: v }));
        addConvo({ type: 'resolved-choice', question: "Mission statement", answer: v });
        setBlobText(`Updated the mission. Let me draft the full document now.`);
        setTimeout(() => finishDraft(), 800);
      }, 600);

    } else if (phase === "review") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Take your time reviewing. Approve when you're happy with it."); }, 500);

    } else if (phase === "pre-goals") {
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("Without goals, we don't have a direction for what to improve. I already have some in mind:");
        setTimeout(() => { setPanel("goals"); setPhase("goals"); }, 600);
      }, 700);

    } else if (phase === "goals") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the suggested goals. Accept when ready."); }, 500);

    } else if (phase === "targets") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the target and accept or skip it. We'll go through them one by one."); }, 500);

    } else if (phase === "junction") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Pick from the options — or tell me what you'd like to explore."); }, 500);

    } else if (phase === "tour" || phase === "canvas") {
      // No text input handling for these phases
    } else if (phase === "done" || phase === "goal-dive") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Ready to generate findings. What should we focus on?"); }, 700);
    }
  };

  // ─── PANEL ACTIONS ───
  const pickData = () => {
    setPanel(null); setActiveChoice(null); setRefineState(null);
    setFieldIdx(0);
    setMappedFields(dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
    doThink("loading", 4000, () => {
      setBlobText("Process mining works with just 3 columns. Let me show you how they build a process map — step by step.");
      setPhase("core-fields");
    });
  };

  const acceptCoreFields = () => {
    // Phase 1: Card fades out (handled by CoreFieldsEducation), show "Great!"
    setPhase("core-fields-reveal");
    setBlobText("Great, now I can see the process!");
    // Phase 2: Process map emerges in center after a beat
    setTimeout(() => {
      setShowCenterProcess(true);
    }, 800);
    // Phase 3: After viewing, blob reacts
    setTimeout(() => {
      setBlobText("Woa, a lot to unpack and improve here!");
    }, 3200);
    // Phase 4: "But wait, need more context"
    setTimeout(() => {
      setBlobText("But wait — I need a bit more context to really get this going.");
    }, 5500);
    // Phase 5: Fade out process map, transition to field mapping
    setTimeout(() => {
      setCenterProcessFading(true);
    }, 7500);
    setTimeout(() => {
      setShowCenterProcess(false);
      setCenterProcessFading(false);
      setBlobText(`Now I need to understand your dimension fields. I'll share my interpretation of each one — tell me if I got it right, or explain what it actually means.\n\nFirst up: ${dimFields[0].n}`);
      setPhase("fields");
    }, 8200);
  };

  const acceptProfile = () => {
    setPanel(null);
    setShowProcessTeaser(true);
    setCtxNarrativeStep(0);
    setDocData({
      processName: "Untitled Process", processType: "", contextScore: 0,
    });

    // Step 0: Introduce the panel
    setBlobText("Excellent — your data is ready. Now let's build the Process Context.\n\nThis is the intelligence layer that turns raw data into actionable insights.");

    // Step 1: Spotlight on context score bar after 2.5s
    setTimeout(() => {
      setCtxNarrativeStep(1);
      setBlobText("See this progress bar? It reflects how well I understand your process.\n\nRight now it's at 0% — every answer you give adds knowledge.");
    }, 2500);

    // Step 2: Propose process type — Namuda is confident about this
    setTimeout(() => {
      setCtxNarrativeStep(2);
      setBlobText("Based on the activity patterns and field names in your data, I'm quite confident this is a Procurement process.");
      setPhase("fact-gathering");
      showChoice({
        question: "This looks like a Procurement process. Is that right?",
        options: [
          { label: "Yes, this is procurement", desc: "Purchase orders, approvals, goods receipt" },
        ],
        allowCustom: true,
        customLabel: "Actually, it's a different type of process",
        onResolve: (idx, label) => {
          if (idx === 0) {
            resolveChoice("This looks like a Procurement process. Is that right?", "Procurement", () => {
              setDocData(prev => ({ ...prev, processType: "Procurement" }));
              bumpScore(5);
              proposeProcessName("Procurement");
            });
          } else {
            // User said something else — refine
            simulateRefine("This looks like a Procurement process. Is that right?", label, (finalType) => {
              resolveChoice("Process type", finalType, () => {
                setDocData(prev => ({ ...prev, processType: finalType }));
                bumpScore(5);
                proposeProcessName(finalType);
              });
            });
          }
        },
      });
    }, 5500);
  };

  // After process type is confirmed, propose a name
  const proposeProcessName = (processType) => {
    const suggestedName = processType === "Procurement" ? "Purchase-to-Receive" : `${processType} Process`;
    setBlobText(`Great. Now let's name it. Based on the activities I see — Created, Free, Approved, Sent, Confirmed, Received — I'd suggest calling this the "${suggestedName}" process.`);
    setTimeout(() => {
      showChoice({
        question: `Should we call this "${suggestedName}"?`,
        options: [
          { label: suggestedName },
        ],
        allowCustom: true,
        customLabel: "I'd call it something else",
        onResolve: (idx, label) => {
          const finalName = idx === 0 ? suggestedName : label;
          if (idx >= 0) {
            resolveChoice("Process name", finalName, () => {
              setDocData(prev => ({ ...prev, processName: finalName }));
              bumpScore(5);
              startFactGathering();
            });
          } else {
            simulateRefine("Process name", label, (refined) => {
              resolveChoice("Process name", refined, () => {
                setDocData(prev => ({ ...prev, processName: refined }));
                bumpScore(5);
                startFactGathering();
              });
            });
          }
        },
      });
    }, 600);
  };

  // Start the actual fact-gathering questions (skipping the first one since we already know process type)
  const startFactGathering = () => {
    setBlobText("Now let me learn more about the process. I'll ask a few questions — you can pick a suggestion or tell me in your own words.");
    setTimeout(() => {
      // Skip factQs[0] (process type) since we already asked that
      setQIdx(1);
      showFactQuestion(1);
    }, 1200);
  };

  // Show a fact-gathering question as a choice widget
  const showFactQuestion = (idx) => {
    const fq = factQs[idx];
    if (!fq) return;
    setBlobText(fq.q);
    if (fq.choices) {
      showChoice({
        question: fq.q,
        options: fq.choices,
        allowCustom: true,
        customLabel: "Something else",
        onSkip: () => {
          resolveChoice(fq.q, "Skipped", () => {
            advanceFactQuestion(idx);
          });
        },
        onResolve: (ci, label) => {
          if (ci >= 0) {
            resolveChoice(fq.q, label, () => {
              applyFactAnswer(fq, label);
              advanceFactQuestion(idx);
            });
          } else {
            // "Something else" — refine flow
            simulateRefine(fq.q, label, (finalAnswer) => {
              resolveChoice(fq.q, finalAnswer, () => {
                applyFactAnswer(fq, finalAnswer);
                advanceFactQuestion(idx);
              });
            });
          }
        },
      });
    }
  };

  // Advance to the next fact-gathering question (with group transition announcements)
  const advanceFactQuestion = (currentIdx) => {
    const next = currentIdx + 1;
    setQIdx(next);
    if (next < factQs.length) {
      const fq = factQs[currentIdx];
      const nextFq = factQs[next];
      if (fq.group !== nextFq.group) {
        const intros = {
          field: "Now some questions about specific fields — this helps me understand what your data actually means.",
          hypothesis: "Last group — some hypotheses I'd love your input on.",
        };
        setBlobText(intros[nextFq.group] || "");
        setTimeout(() => showFactQuestion(next), 1500);
      } else {
        showFactQuestion(next);
      }
    } else {
      // All questions done
      setBlobText("Excellent. One more thing before I draft the document...");
      setActiveChoice(null);
      setTimeout(() => goToMissionReview(), 1200);
    }
  };

  const advanceField = (idx) => {
    const next = idx + 1;
    if (next < dimFields.length) {
      setFieldIdx(next);
      const f = dimFields[next];
      setBlobText(`This is my interpretation of what ${f.n} means — is that correct?`);
    } else {
      setFieldIdx(next); // past the end — shows "all done" in panel
      setBlobText("All fields reviewed. Continue when ready.");
    }
  };

  const acceptFieldItem = (idx) => {
    setMappedFields(prev => prev.map((f, i) => i === idx ? { ...f, confirmed: true } : f));
    advanceField(idx);
  };

  const acceptFields = () => {
    setPanel(null); setBlob("thinking");
    setDqNarrativeStep(0);
    setTimeout(() => {
      setBlob("waiting");
      // Step 0: Panel appears, blob introduces
      setBlobText("This is the data quality report for your data.");
      setPanel("data-profile"); setPhase("data-profile");

      // Step 1: Spotlight score ring after 2s
      setTimeout(() => {
        setDqNarrativeStep(1);
      }, 2000);

      // Blob reacts to score after 3.5s
      setTimeout(() => {
        setBlobText("Great, it's a pass! Please review the fields to include.\n\nFields with low quality should be excluded.");
      }, 3500);

      // Step 2: Reveal fields after 5s
      setTimeout(() => {
        setDqNarrativeStep(2);
      }, 5000);

      // Step 3: Findings intro after 9s — list appears
      setTimeout(() => {
        setBlobText("Now let me introduce the most important concept in Namuda: Findings.\n\nA Finding is a data-backed insight — something I discovered in your process that deserves attention. Each Finding has a severity, shows evidence, and comes with a recommended action.\n\nFindings are how improvement actually happens. They connect data to decisions.");
        setDqNarrativeStep(3);
      }, 9000);

      // Blob encourages user to explore after 14s (extended to let user read)
      setTimeout(() => {
        setBlobText("I've already found 3 Findings in your data quality alone. Each one shows what's wrong, why it matters, and what to do about it.\n\nLet me walk you through the first one.");
      }, 14000);

      // Step 4: Auto-expand first finding after 18s
      setTimeout(() => {
        setBlobText("This first Finding shows duplicate timestamps — 1 in 4 events share the same time. This makes it harder to know the true sequence of activities.\n\nEach Finding includes a recommendation for what to do about it.");
        setDqNarrativeStep(4);
      }, 18000);

      // Step 5: Auto-collapse findings after 24s
      setTimeout(() => {
        setDqNarrativeStep(5);
      }, 24000);

      // Step 6: Wrap up after 26s
      setTimeout(() => {
        setBlobText("We'll work on these Findings together throughout the improvement journey — they're always available.\n\nClick 'Looks good' when you're ready to continue.");
        setDqNarrativeStep(6);
      }, 26000);

    }, 800);
  };

  const approveDoc = () => {
    setDocVisible(false);
    setBlobText("The process context is saved. Now let me show you something important — where your process fits in the bigger picture.");
    setPhase("strategy-animation");
    setStrategyStep(0);

    // Step 0: Strategy node appears (already set)
    setTimeout(() => {
      setBlobText("Every organization has a strategy. That strategy is delivered through a value chain of interconnected processes.");
      setStrategyStep(1);
    }, 2000);

    // Step 1: Three processes branch out
    setTimeout(() => {
      setBlobText("Your value chain might include procurement, production, logistics — each with its own mission and goals.");
      setStrategyStep(2);
    }, 4500);

    // Step 2: Zoom into procurement
    setTimeout(() => {
      setBlobText(`Your mission — "${docData?.mission || 'To have an efficient purchasing process'}" — defines what success looks like for this process.`);
      setStrategyStep(3);
    }, 7500);

    // Step 3: Goals emerge
    setTimeout(() => {
      setBlobText("To reach that mission, we need concrete goals. Each goal should be measurable, time-bound, and directly support the mission.\n\nI've identified 4 goals based on your data.");
      setStrategyStep(4);
    }, 10500);

    // Step 4: Transition to goal selection
    setTimeout(() => {
      setBlobText("Here are my suggested goals — select the ones that matter most.");
      setStrategyStep(5);
      setTimeout(() => { setPanel("goals"); setPhase("goals"); }, 600);
    }, 14000);
  };

  const ALL_GOALS = [
    { n: "Reduce throughput time", current: "18.8 days avg",
      why: "Throughput directly impacts working capital and supplier relationships. Faster cycles mean less inventory and quicker response to demand.",
      evidence: "PM1 achieves 7.7d while PN1 takes 34d — the gap proves structural improvement is possible." },
    { n: "Lower rework rate", current: "52%",
      why: "Every rework loop doubles handling cost and delays downstream steps. Rework is the primary driver of throughput variance.",
      evidence: "52% of orders hit 'Confirmed Changed' — this single loop accounts for an estimated 40% of excess cycle time." },
    { n: "Improve data quality", current: "50/100",
      why: "Low data quality limits what we can analyze and automate. Missing fields create blind spots in root-cause analysis.",
      evidence: "item_signal is 95% null, selection_code is 42% null — two fields that could unlock automation insights." },
    { n: "Increase conformance", current: "1,175 variants",
      why: "High variant count means the process behaves differently everywhere — making it hard to optimize, train, or automate.",
      evidence: "17 sites, 1,175 variants. Most variants have <10 cases — long-tail fragmentation across regional offices." },
  ];

  const acceptGoals = (selectedIndices) => {
    setPanel(null);
    const selectedGoals = selectedIndices.map(i => ALL_GOALS[i]);
    setGoalsDoc({
      mission: docData?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
      goals: selectedGoals,
    });
    // Set up targets flow — only targets for selected goals
    setActiveTargets(selectedIndices);
    setTargetIdx(0);
    setAcceptedTargets([]);
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      const firstTarget = ALL_TARGETS[selectedIndices[0]];
      setBlobText(`Goals confirmed! Now let's set targets.\n\nFirst up: ${firstTarget.n}. Here's where I think you can realistically get to:`);
      setTimeout(() => { setPanel("target-single"); setPhase("targets"); }, 600);
    }, 700);
  };

  const skipGoals = () => {
    setPanel(null);
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      setBlobText("No problem — we can come back to goals later. Let's move on:");
      setPanel("junction"); setPhase("junction");
    }, 600);
  };

  const acceptSingleTarget = () => {
    const currentTargetGlobalIdx = activeTargets[targetIdx];
    const target = ALL_TARGETS[currentTargetGlobalIdx];
    // Add target to goals doc
    setAcceptedTargets(prev => [...prev, target]);
    setGoalsDoc(prev => {
      const updatedGoals = prev.goals.map((g, i) => {
        if (i === targetIdx) return { ...g, b: target.b, t: target.t };
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
    // Move to next target or finish
    const nextIdx = targetIdx + 1;
    if (nextIdx < activeTargets.length) {
      setPanel(null);
      setBlob("thinking");
      setTargetIdx(nextIdx);
      const nextTarget = ALL_TARGETS[activeTargets[nextIdx]];
      setTimeout(() => {
        setBlob("waiting");
        setBlobText(`Target accepted! Next: ${nextTarget.n}.`);
        setTimeout(() => { setPanel("target-single"); }, 500);
      }, 500);
    } else {
      // All targets done
      setPanel(null);
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("All targets locked in! Now — here's what I'd suggest as your next move:");
        setPanel("junction"); setPhase("junction");
      }, 800);
    }
  };

  const skipSingleTarget = () => {
    const nextIdx = targetIdx + 1;
    if (nextIdx < activeTargets.length) {
      setPanel(null);
      setTargetIdx(nextIdx);
      const nextTarget = ALL_TARGETS[activeTargets[nextIdx]];
      setBlobText(`Skipped. Next: ${nextTarget.n}.`);
      setTimeout(() => { setPanel("target-single"); }, 400);
    } else {
      setPanel(null);
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("Targets done! Now — here's what I'd suggest as your next move:");
        setPanel("junction"); setPhase("junction");
      }, 800);
    }
  };

  // Seed state needed for any phase so forward jumps work
  const seedState = () => {
    if (!docData) {
      setDocData({
        processName: "Purchase-to-Receive", processType: "Procurement", contextScore: 62,
        mission: "To have an efficient purchasing process that is uniform across all sales offices.",
        description: "A procurement process where orders are created, routed, and received across multiple sites. Handled by purchasing teams across regional offices. Mix of manual approvals and automated routing. Key pain point: excessive rework in the confirmation step.",
        kpis: [
          { l: "Avg throughput time", v: "18.8 days" }, { l: "Rework rate", v: "52%" },
          { l: "Process variants", v: "1,175" }, { l: "Data quality score", v: "50 / 100" },
          { l: "Fastest site (PM1)", v: "7.7 days" }, { l: "Slowest site (PN1)", v: "34.0 days" },
        ],
        fieldAnnotations: [
          { field: "selection_code", meaning: "Order routing code — determines approval path" },
          { field: "item_signal", meaning: "Procurement signal for automation — mostly unused" },
          { field: "receiving_site", meaning: "Physical site codes — PM1 = main plant, PN1 = north facility" },
        ],
        hypotheses: [
          "Rework likely caused by process design — confirmation step requires manual re-entry",
          "PM1 speed advantage may be due to dedicated team and simpler product mix",
          "Volume drop appears structural — not seasonal",
        ],
      });
      setDocVisible(true);
    }
  };

  const jumpTo = (step) => {
    setPanel(null);
    clearUser();
    setActiveChoice(null); setRefineState(null);
    setShowProcessTeaser(false);
    if (step.id === "data") {
      setBlobText("Pick a dataset to work with.");
      showChoice({
        question: "Which dataset should we work with?",
        options: demos.map(d => ({ label: d.name, desc: `${d.desc} — ${d.cases} cases, ${d.period}` })),
        allowCustom: true,
        customLabel: "Upload my own data",
        onResolve: (di, dl) => {
          if (di >= 0) { resolveChoice("Which dataset should we work with?", dl, () => pickData()); }
          else { resolveChoice("Which dataset should we work with?", "Upload my own", () => { setPanel("upload"); }); }
        },
      });
      setPhase("data");
    } else if (step.id === "profile") {
      setBlobText("Review the data quality assessment.");
      setDqNarrativeStep(6); // skip narrative on jump
      setPanel("data-profile"); setPhase("data-profile");
    } else if (step.id === "fields") {
      setBlobText("Review the field mapping.");
      setFieldIdx(0);
      setMappedFields(dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
      setPanel("fields"); setPhase("fields");
    } else if (step.id === "context") {
      seedState();
      setCtxNarrativeStep(4); // skip narrative on jump
      setBlobText(factQs[0].q); setQIdx(0); setPhase("fact-gathering");
    } else if (step.id === "review") {
      seedState();
      setCtxNarrativeStep(4); // skip narrative on jump
      setBlobText("Please review the process context.");
      setPhase("review");
    } else if (step.id === "goals") {
      seedState(); setDocVisible(false);
      setBlobText("Let's set some goals.");
      setPanel("goals"); setPhase("goals");
    } else if (step.id === "targets") {
      seedState(); setDocVisible(false);
      if (!goalsDoc) {
        setGoalsDoc({
          mission: docData?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
          goals: [
            { n: "Reduce throughput time", current: "18.8 days avg", why: "Throughput directly impacts working capital.", evidence: "PM1 achieves 7.7d while PN1 takes 34d." },
            { n: "Lower rework rate", current: "52%", why: "Every rework loop doubles handling cost.", evidence: "52% of orders hit 'Confirmed Changed'." },
            { n: "Improve data quality", current: "50/100", why: "Low data quality limits analysis.", evidence: "item_signal 95% null, selection_code 42% null." },
            { n: "Increase conformance", current: "1,175 variants", why: "High variant count means fragmentation.", evidence: "17 sites, 1,175 variants." },
          ],
        });
      }
      setBlobText("Here are the suggested targets:");
      setActiveTargets([0,1,2,3]); setTargetIdx(0); setAcceptedTargets([]);
      setPanel("target-single"); setPhase("targets");
    } else if (step.id === "junction") {
      seedState(); setDocVisible(false);
      if (!goalsDoc) {
        setGoalsDoc({ mission: "To have an efficient purchasing process that is uniform across all sales offices.", goals: [
          { n: "Throughput time", b: "18.8d", t: "14d" }, { n: "Rework rate", b: "52%", t: "35%" },
          { n: "Data quality", b: "50/100", t: "70+" }, { n: "Conformance", b: "1,175 var", t: "<400" },
        ]});
      }
      setBlobText("Targets locked in! Here's what I'd suggest next:");
      setPanel("junction"); setPhase("junction");
    } else if (step.id === "done") {
      seedState(); setDocVisible(false);
      setBlobText("Ready to explore. What should we focus on?");
      setPhase("done");
    }
  };

  const hasStarted = userMsgs.length > 0 || blobText || convoHistory.length > 0 || activeChoice !== null;
  const isThink = thinking;
  const isDark = bgLight < 0.5;
  const hasDoc = docData !== null && docVisible;
  const hasGoalsDoc = goalsDoc !== null;
  const isReview = phase === "review";
  const blobSz = isThink ? 420 : (!hasStarted && scene !== "dark" && scene !== "rising") ? 420 : hasStarted ? 140 : 420;

  return (
    <div style={{ position: "fixed", inset: 0, background: isDark ? "#0e0f14" : "#f4f5f8", transition: "background 1.5s ease", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', -apple-system, sans-serif", overflow: "hidden" }}>
      <DotBackground isDark={isDark} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        @keyframes panelIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes docIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes msgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes snapIn { 0% { opacity:0; transform:translateY(12px) scale(0.95); } 60% { opacity:1; transform:translateY(-2px) scale(1.01); } 100% { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes processEmerge { 0% { opacity:0; transform:scale(0.9) translateY(20px); } 50% { opacity:1; transform:scale(1.02) translateY(-4px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes dp { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.15); } }
        @keyframes riseIn { 0% { opacity:0; transform:translateY(100vh); } 40% { opacity:0.6; } 100% { opacity:1; transform:translateY(0); } }
        @keyframes canvasEnter { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes mcFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes notifyPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.4); } }
        @keyframes notifyShake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-2px); } 40% { transform:translateX(2px); } 60% { transform:translateX(-1px); } 80% { transform:translateX(1px); } }
        @keyframes chatSlideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes sparkleAppear { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
        @keyframes mutterIn { from { opacity:0; transform:translateY(4px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes popupAppear { from { opacity:0; transform:translateY(6px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes findingGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); } 50% { box-shadow: 0 0 0 6px rgba(99,102,241,0); } }
        @keyframes findingStore { 0% { transform:scale(1); } 40% { transform:scale(0.97); background:#ecfdf5; } 100% { transform:scale(1); } }
        @keyframes scoreShimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
        @keyframes morphUp { 0% { opacity:0; transform:translateY(8px) scaleY(0.92); transform-origin:bottom center; max-height:48px; } 30% { opacity:1; max-height:200px; } 100% { opacity:1; transform:translateY(0) scaleY(1); max-height:600px; } }
        @keyframes morphCollapse { 0% { opacity:1; transform:scaleY(1); max-height:600px; } 100% { opacity:0; transform:translateY(6px) scaleY(0.95); max-height:0; } }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)", flexShrink: 0, opacity: bgLight, transition: "all 1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: isDark ? "#fff" : "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: isDark ? "#1a1d23" : "#fff", transition: "all 1s" }}>N</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#1a1d23", transition: "color 1s" }}>namuda</span>
        </div>
        <span style={{ fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.25)" : "#b0b5c0", transition: "color 1s" }}>improvement flow</span>
      </div>

      {/* Mission Control overlay */}
      {phase === "tour" && <MissionControlOverlay />}

      {/* Canvas view — full screen */}
      {phase === "canvas" && <CanvasView />}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", ...(phase === "tour" || phase === "canvas" ? { display: "none" } : {}) }}>

        {/* DATA PROFILE — left side panel */}
        {panel === "data-profile" && (
          <DataProfilePanel onAccept={acceptProfile} narrativeStep={dqNarrativeStep} />
        )}

        {/* DOC PANEL — left during gathering */}
        {hasDoc && !isReview && (
          <DocPanel data={docData} onUpdate={d => setDocData(d)} onImproveScore={() => setBlobText("Tell me more about:\n• What triggers this process?\n• Are there known bottlenecks?\n• What does success look like?")} narrativeStep={ctxNarrativeStep} />
        )}

        {/* GOALS DOC — left during goals/targets phases */}
        {hasGoalsDoc && !hasDoc && <div style={{ transition: canvasTransitionPhase === "exit" ? "opacity 0.6s, transform 0.6s" : "none", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateX(-40px)" : "none" }}><GoalsDocPanel data={goalsDoc} /></div>}

        {/* BLOB + CHAT column */}
        {(
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", position: "relative", marginRight: showProcessTeaser && !isThink && !hasDoc ? 352 : 0, transition: canvasTransitionPhase === "exit" ? "opacity 0.5s, transform 0.5s" : "margin 0.5s cubic-bezier(0.16,1,0.3,1)", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateY(-40px)" : "none" }}>

            {(isThink || !hasStarted) ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                animation: scene === "rising" ? "riseIn 3.2s cubic-bezier(0.22,0.9,0.36,1)" : "none",
              }}>
                <Blob state={blob} size={blobSz} />
                {isThink && thoughts.length > 0 && <div style={{ marginTop: 20, animation: "fadeUp 0.4s ease" }}><Thoughts items={thoughts} /></div>}
                {showIntro && !isThink && !hasStarted && (
                  <div style={{ textAlign: "center", padding: "20px 24px 0", maxWidth: 480, animation: "fadeUp 0.8s ease" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.75, color: isDark ? "rgba(255,255,255,0.65)" : "#4a5060", fontWeight: 400, transition: "color 1s" }}>
                      <TW text={INTRO} onDone={() => {
                        setIntroDone(true); setBlob("waiting");
                        // Show intro choice widget after typewriter completes
                        setTimeout(() => {
                          setBlobText("Welcome to Namuda. Improvement lives off data — let's get started.");
                          showChoice({
                            question: "How would you like to start?",
                            options: [
                              { label: "Let's get started", desc: "Connect data and begin the improvement flow" },
                              { label: "Tell me more about Namuda first", desc: "A quick overview of what we'll do together" },
                            ],
                            allowCustom: true,
                            customLabel: "Something else",
                            onResolve: (idx, label) => {
                              if (idx === 0) {
                                // Start directly
                                resolveChoice("How would you like to start?", label, () => {
                                  setBlob("thinking");
                                  setTimeout(() => {
                                    setBlob("waiting");
                                    setBlobText("First, I need your data — this is what I'll analyze to understand the process.");
                                    // Show data choice inline
                                    showChoice({
                                      question: "Which dataset should we work with?",
                                      options: demos.map(d => ({ label: d.name, desc: `${d.desc} — ${d.cases} cases, ${d.period}` })),
                                      allowCustom: true,
                                      customLabel: "Upload my own data",
                                      onResolve: (di, dl) => {
                                        if (di >= 0) {
                                          resolveChoice("Which dataset should we work with?", dl, () => pickData());
                                        } else {
                                          // "Upload my own data" — simulate refine
                                          resolveChoice("Which dataset should we work with?", "Upload my own", () => { setPanel("upload"); });
                                        }
                                      },
                                    });
                                    setPhase("data");
                                  }, 800);
                                });
                              } else if (idx === 1) {
                                // Tell me more
                                resolveChoice("How would you like to start?", label, () => {
                                  setBlobText("Namuda is your process improvement companion. I analyze your event data to find bottlenecks, rework loops, and conformance gaps — then help you set targets and track improvement.\n\nReady to begin?");
                                  setTimeout(() => {
                                    showChoice({
                                      question: "Ready to connect your data?",
                                      options: [
                                        { label: "Yes, let's go" },
                                        { label: "I have more questions" },
                                      ],
                                      allowCustom: false,
                                      onResolve: (ri) => {
                                        if (ri === 0) {
                                          resolveChoice("Ready to connect your data?", "Yes, let's go", () => {
                                            setBlobText("First, I need your data — this is what I'll analyze to understand the process.");
                                            showChoice({
                                              question: "Which dataset should we work with?",
                                              options: demos.map(d => ({ label: d.name, desc: `${d.desc} — ${d.cases} cases, ${d.period}` })),
                                              allowCustom: true,
                                              customLabel: "Upload my own data",
                                              onResolve: (di, dl) => {
                                                if (di >= 0) {
                                                  resolveChoice("Which dataset should we work with?", dl, () => pickData());
                                                } else {
                                                  resolveChoice("Which dataset should we work with?", "Upload my own", () => { setPanel("upload"); });
                                                }
                                              },
                                            });
                                            setPhase("data");
                                          });
                                        } else {
                                          resolveChoice("Ready to connect your data?", "I have more questions", () => {
                                            setBlobText("Of course — ask me anything. When you're ready, just say so and we'll connect your data.");
                                          });
                                        }
                                      },
                                    });
                                  }, 600);
                                });
                              } else {
                                // "Something else" — user typed custom text
                                simulateRefine("How would you like to start?", label, (finalAnswer) => {
                                  resolveChoice("How would you like to start?", finalAnswer, () => {
                                    setBlobText("Got it! Let's connect some data so I can start analyzing.");
                                    showChoice({
                                      question: "Which dataset should we work with?",
                                      options: demos.map(d => ({ label: d.name, desc: `${d.desc} — ${d.cases} cases, ${d.period}` })),
                                      allowCustom: true,
                                      customLabel: "Upload my own data",
                                      onResolve: (di, dl) => {
                                        if (di >= 0) {
                                          resolveChoice("Which dataset should we work with?", dl, () => pickData());
                                        } else {
                                          resolveChoice("Which dataset should we work with?", "Upload my own", () => { setPanel("upload"); });
                                        }
                                      },
                                    });
                                    setPhase("data");
                                  });
                                });
                              }
                            },
                          });
                        }, 500);
                      }} speed={30} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ─── SCROLLABLE CHAT LANE ─── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", overflowX: "hidden", padding: "0 0 16px" }}>
                  {/* Blob + speech — top of scroll */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, gap: 2 }}>
                    <div style={{ marginBottom: -12, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                      <Blob state={blob} size={blobSz} />
                    </div>
                    {blobText && <div style={{ marginBottom: 16 }}><BlobSpeech text={blobText} /></div>}
                    {blob === "thinking" && !isThink && <div style={{ marginTop: 4 }}><Dots /></div>}
                  </div>

                {/* Strategy animation — mission to goals bridge */}
                {phase === "strategy-animation" && (
                  <StrategyAnimation step={strategyStep} mission={docData?.mission} />
                )}

                {/* Core fields educational animation */}
                {phase === "core-fields" && (
                  <CoreFieldsEducation onAccept={acceptCoreFields} />
                )}
                {/* Center process map — emerges after core fields confirmed */}
                {showCenterProcess && phase === "core-fields-reveal" && (
                  <div style={{
                    width: "100%", maxWidth: 500, padding: "0 24px", display: "flex", justifyContent: "center",
                    animation: centerProcessFading ? "none" : "processEmerge 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                    opacity: centerProcessFading ? 0 : 1,
                    transform: centerProcessFading ? "scale(0.95) translateY(10px)" : "none",
                    transition: centerProcessFading ? "opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)" : "none",
                  }}>
                    <ProcessTeaser onClose={() => {}} inline />
                  </div>
                )}
                  {/* Scroll anchor */}
                  <div ref={convoScrollRef} style={{ flexShrink: 0, height: 1 }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* PROCESS TEASER — right side, closable */}
        {showProcessTeaser && !isThink && <ProcessTeaser onClose={() => setShowProcessTeaser(false)} />}

        {/* STEP MAP — right side (shift left when teaser is open) */}
        {/* STEP MAP — only show after user has connected data (not during intro/data selection) */}
        {hasStarted && !isThink && !isDark && !showProcessTeaser && !showCenterProcess && phase !== "tour" && phase !== "canvas" && phase !== "intro" && phase !== "data" && phase !== "strategy-animation" && <div style={{ transition: canvasTransitionPhase === "exit" ? "opacity 0.6s, transform 0.6s" : "none", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateX(40px)" : "none" }}><StepMap phase={phase} onJump={jumpTo} fieldProgress={(phase === "core-fields" || phase === "core-fields-reveal" || phase === "fields") ? { fields: mappedFields, currentIdx: fieldIdx } : null} /></div>}

        {/* FLOATING PANEL */}
        {panel && !isThink && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 15 }}>
            {/* DataPanel removed — data selection now inline via ChoiceWidget */}
            {/* data-profile now rendered as side panel */}
            {/* FieldPanel removed — field mapping now inline via FieldCard */}
            {panel === "upload" && (
              <div style={{ ...ps, width: 360, padding: "28px 24px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg.surfaceActive, border: `2px dashed ${T.border.focus}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: T.text.muted }}>↑</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text.primary, marginBottom: 4 }}>Upload event log</div>
                <div style={{ fontSize: 13, color: T.text.muted, marginBottom: 20 }}>CSV or Parquet file with case_id, activity, and timestamp columns</div>
                <div style={{ padding: "32px 20px", border: `2px dashed ${T.border.light}`, borderRadius: T.radius.md, marginBottom: 16, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.accent.blue}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border.light}
                >
                  <div style={{ fontSize: 13, color: T.text.muted }}>Drag & drop or <span style={{ color: T.accent.blue, fontWeight: 600 }}>browse files</span></div>
                </div>
                <button onClick={() => { setPanel(null); pickData(); }} style={{ ...btnG, width: "100%" }}>Use demo data instead</button>
              </div>
            )}
            {panel === "goals" && <GoalsPanel onAccept={acceptGoals} onSkip={skipGoals} />}
            {panel === "target-single" && activeTargets[targetIdx] !== undefined && (
              <SingleTargetCard
                target={ALL_TARGETS[activeTargets[targetIdx]]}
                index={targetIdx}
                total={activeTargets.length}
                onAccept={acceptSingleTarget}
                onSkip={skipSingleTarget}
              />
            )}
            {panel === "junction" && <JunctionPanel goals={goalsDoc?.goals || []} onSelect={(id) => {
              setPanel(null);
              if (id === "tour") {
                setBlobText("");
                setBgLight(0);
                setTimeout(() => { setPhase("tour"); }, 1200);
              } else if (id === "canvas") {
                setBlobText("");
                setCanvasTransitionPhase("exit");
                setTimeout(() => {
                  setCanvasTransitionPhase("enter");
                  setPhase("canvas");
                }, 1100);
                setTimeout(() => { setCanvasTransitionPhase("ready"); }, 2200);
              } else if (id.startsWith("goal-")) {
                const goalIdx = parseInt(id.replace("goal-", ""));
                const goalNames = ["Reduce throughput time", "Lower rework rate", "Improve data quality", "Increase conformance"];
                setBlobText(`Great choice. Let me generate the ${goalNames[goalIdx] || "improvement"} findings...`);
                setPhase("done");
              }
            }} />}
          </div>
        )}

      </div>

      {/* ─── BOTTOM INTERACTION AREA ─── */}
      {phase !== "tour" && phase !== "canvas" && (
        <div style={{
          padding: "12px 28px 20px",
          display: "flex", flexDirection: "column", alignItems: "center",
          flexShrink: 0,
          opacity: canvasTransitionPhase === "exit" ? 0 : ((introDone || hasStarted) && !isThink ? 1 : 0),
          transform: canvasTransitionPhase === "exit" ? "translateY(40px)" : ((introDone || hasStarted) && !isThink ? "translateY(0)" : "translateY(14px)"),
          transition: canvasTransitionPhase === "exit" ? "opacity 0.4s, transform 0.4s" : "all 0.5s ease",
          pointerEvents: isThink ? "none" : "auto",
        }}>
          {/* Choice widget */}
          {activeChoice && !refineState && (
            <ChoiceWidget
              key={activeChoice.question}
              question={activeChoice.question}
              options={activeChoice.options}
              allowCustom={activeChoice.allowCustom}
              customLabel={activeChoice.customLabel}
              onSkip={activeChoice.onSkip}
              onSelect={(idx, label) => {
                if (idx === -1) {
                  // Custom text — go through refine flow, then resolve with the final text
                  simulateRefine(activeChoice.question, label, (finalText) => {
                    activeChoice.onResolve(-1, finalText);
                  });
                } else {
                  activeChoice.onResolve(idx, label);
                }
              }}
            />
          )}

          {/* Refine dialogue */}
          {refineState && (
            <RefineDialogue
              key={refineState.userSuggestion}
              originalQuestion={refineState.question}
              userSuggestion={refineState.userSuggestion}
              aiProposal={refineState.aiProposal}
              onAccept={() => {
                const finalText = refineState.aiProposal;
                const onResolve = refineState.onResolve;
                resolveChoice(refineState.question, finalText, () => {
                  onResolve(finalText);
                });
              }}
              onRefine={(newText) => {
                const question = refineState.question;
                const onResolve = refineState.onResolve;
                setRefineState(null);
                setBlob("thinking");
                setTimeout(() => {
                  setBlob("waiting");
                  const proposal = newText.length > 40 ? newText : `${newText} — refined based on your feedback`;
                  setRefineState({ question, userSuggestion: newText, aiProposal: proposal, onResolve });
                }, 600);
              }}
              onCancel={() => setRefineState(null)}
            />
          )}

          {/* Field review — shows field data with inline choice */}
          {phase === "fields" && mappedFields[fieldIdx] && !activeChoice && !refineState && (
            <FieldReviewCard
              key={fieldIdx}
              field={mappedFields[fieldIdx]}
              index={fieldIdx}
              total={mappedFields.length}
              onAccept={() => acceptFieldItem(fieldIdx)}
              onCustom={(meaning) => {
                setMappedFields(prev => prev.map((f, i) => i === fieldIdx ? { ...f, confirmed: true, meaning } : f));
                advanceField(fieldIdx);
              }}
            />
          )}

          {/* All fields done */}
          {phase === "fields" && fieldIdx >= dimFields.length && !activeChoice && !refineState && (
            <ChoiceWidget
              question="All 5 fields reviewed. Ready to continue?"
              options={[{ label: "Continue to data quality", desc: "Your field interpretations are locked in" }]}
              allowCustom={false}
              onSelect={() => acceptFields()}
            />
          )}

          {/* Review document — scrollable card in bottom area with accept/refine */}
          {isReview && hasDoc && !activeChoice && !refineState && (
            <div style={{
              width: "100%", maxWidth: 520, padding: "0 24px",
              animation: "morphUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
              transformOrigin: "bottom center",
            }}>
              <div style={{
                background: T.bg.surface, borderRadius: T.radius.lg,
                boxShadow: T.shadow.md, overflow: "hidden",
                border: `1px solid ${T.border.light}`,
                maxHeight: "55vh", display: "flex", flexDirection: "column",
              }}>
                {/* Header */}
                <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.border.light}`, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Process Context</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.text.primary }}>{docData.processName}</div>
                  <div style={{ fontSize: 12, color: T.text.secondary, marginTop: 2 }}>{docData.processType}</div>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 16px" }}>
                  {docData.contextScore != null && (
                    <div style={{ marginBottom: 14 }}>
                      <ContextScore score={docData.contextScore} />
                    </div>
                  )}
                  {docData.kpis && docData.kpis.length > 0 && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Key Indicators</div>
                    {docData.kpis.map((k, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < docData.kpis.length - 1 ? `1px solid ${T.border.light}` : "none" }}>
                      <span style={{ fontSize: 12, color: T.text.secondary }}>{k.l}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.text.primary }}>{k.v}</span></div>))}</div>}
                  {docData.mission && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
                    <div style={{ padding: "12px 16px", background: "#f0f2ff", borderRadius: 9, border: `1px solid ${T.border.accent}`, borderLeft: `4px solid ${T.accent.blue}` }}>
                      <div style={{ fontSize: 14, color: "#2a2e60", lineHeight: 1.65, fontWeight: 500, fontStyle: "italic" }}>{docData.mission}</div></div></div>}
                  {docData.description && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Process Description</div>
                    <div style={{ fontSize: 12.5, color: T.text.primary, lineHeight: 1.65 }}>{docData.description}</div></div>}
                  {docData.fieldAnnotations && docData.fieldAnnotations.length > 0 && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Field Context</div>
                    {docData.fieldAnnotations.map((f, i) => (<div key={i} style={{ padding: "6px 10px", borderRadius: 5, marginBottom: 3, background: T.bg.surfaceActive, borderLeft: `3px solid ${T.accent.blue}` }}>
                      <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: T.text.secondary, fontWeight: 600 }}>{f.field}</div>
                      <div style={{ fontSize: 10.5, color: T.text.muted }}>{f.meaning}</div></div>))}</div>}
                  {docData.hypotheses && docData.hypotheses.length > 0 && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Hypotheses</div>
                    {docData.hypotheses.map((h, i) => (<div key={i} style={{ padding: "8px 12px", background: "#faf8f0", borderRadius: 7, border: "1px solid #ede8d8", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, color: "#5a5040", lineHeight: 1.5 }}>{h}</div></div>))}</div>}
                </div>

                {/* Accept / Refine choices */}
                <div style={{ padding: "0 8px 12px", borderTop: `1px solid ${T.border.light}`, flexShrink: 0 }}>
                  <div style={{ padding: "10px 0 4px 12px", fontSize: 13, color: T.text.secondary, fontWeight: 500 }}>Does this look right?</div>
                  <div
                    onClick={approveDoc}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: T.radius.sm, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg.surfaceActive, color: T.text.muted, fontSize: 12, fontWeight: 600 }}>1</div>
                    <span style={{ fontSize: 13.5, color: T.text.primary, fontWeight: 500 }}>Approve and continue</span>
                  </div>
                  <div
                    onClick={() => {
                      setBlobText("What would you like to change? Tell me which section needs work.");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: T.radius.sm, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg.surfaceActive, color: T.text.muted }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 13.5, color: T.text.muted }}>I'd like to refine something</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default text input — only when no widget is active and user has made first choice */}
          {!activeChoice && !refineState && !(phase === "fields") && !isReview && phase !== "intro" && phase !== "data" && phase !== "strategy-animation" && (
            <div style={{ width: "100%", maxWidth: 520, display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder={phase === "fact-gathering" ? "Answer or type 'skip'..." : "Type your response..."}
                style={{ flex: 1, padding: "10px 15px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", border: "1px solid #e2e5ea", borderRadius: 10, background: "#fff", color: "#1a1d23", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                onFocus={e => { e.target.style.borderColor = "#c0c5d0"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03), 0 0 0 3px rgba(0,0,0,0.02)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e5ea"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)"; }}
              />
              <button onClick={send} style={{ padding: "10px 17px", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: "#1a1d23", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}
                onMouseEnter={e => e.target.style.background = "#2d3340"} onMouseLeave={e => e.target.style.background = "#1a1d23"}>Send</button>
            </div>
          )}

          {/* User messages above input */}
          {userMsgs.length > 0 && (
            <div ref={userMsgRef} style={{ width: "100%", maxWidth: 420, padding: "8px 0 0", display: "flex", flexDirection: "column", gap: 6, maxHeight: 100, overflowY: "auto" }}>
              {userMsgs.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "flex-end", animation: "msgIn 0.3s ease" }}>
                  <div style={{ maxWidth: 360, padding: "8px 15px", fontSize: 14, lineHeight: 1.65, color: "#fff", background: "#2a2e38", borderRadius: "15px 3px 15px 15px", fontWeight: 500 }}>{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
