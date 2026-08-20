import { useRef } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { pdfFirstPageToDataUrl } from '@/services/pdfImport';
import { removeBackground, hasWhiteBackground } from '@/services/removeBg';

/** Decal management: import, transform (size / X / Y / rotation / opacity / color overlay). */
export function DecalPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    decals,
    selectedDecalId,
    selectDecal,
    updateDecal,
    removeDecal,
    addDecal,
    removeBgApiKey,
  } = useStudioStore();

  const selected = decals.find((d) => d.id === selectedDecalId) ?? null;

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    let url: string;
    if (f.type === 'application/pdf') {
      url = await pdfFirstPageToDataUrl(f);
    } else {
      url = URL.createObjectURL(f);
    }
    if (removeBgApiKey && f.type.startsWith('image/')) {
      try {
        if (await hasWhiteBackground(url)) {
          const cut = await removeBackground(f, removeBgApiKey);
          url = URL.createObjectURL(cut);
        }
      } catch {
        /* keep original on failure */
      }
    }
    addDecal({
      name: f.name,
      imageUrl: url,
      x: 0.5,
      y: 0.5,
      scale: 0.35,
      rotation: 0,
      opacity: 1,
      colorOverlay: null,
      overlayStrength: 1,
    });
    e.target.value = '';
  };

  return (
    <div className="section">
      <h3>Decal 贴花系统</h3>

      <button className="btn primary full" onClick={() => fileRef.current?.click()}>
        ＋ 导入 Logo / 图案
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={onPick}
      />
      <p className="hint">支持 PNG / JPG / PDF，也可直接拖入视窗。已配置去背 Key 时自动去除白底。</p>

      {decals.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {decals.map((d) => (
            <div
              key={d.id}
              className={`material-card ${d.id === selectedDecalId ? 'active' : ''}`}
              onClick={() => selectDecal(d.id)}
            >
              <img
                src={d.imageUrl}
                className="sw"
                style={{ objectFit: 'contain', background: '#0008' }}
                alt=""
              />
              <div className="meta" style={{ flex: 1, overflow: 'hidden' }}>
                <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.name}
                </b>
              </div>
              <button
                className="btn danger"
                style={{ padding: '4px 8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeDecal(d.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ marginTop: 8 }}>
          <Slider
            label="大小"
            value={selected.scale}
            min={0.05}
            max={1}
            step={0.01}
            fmt={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => updateDecal(selected.id, { scale: v })}
          />
          <Slider
            label="X 坐标"
            value={selected.x}
            min={0}
            max={1}
            step={0.005}
            fmt={(v) => v.toFixed(2)}
            onChange={(v) => updateDecal(selected.id, { x: v })}
          />
          <Slider
            label="Y 坐标"
            value={selected.y}
            min={0}
            max={1}
            step={0.005}
            fmt={(v) => v.toFixed(2)}
            onChange={(v) => updateDecal(selected.id, { y: v })}
          />
          <Slider
            label="旋转"
            value={selected.rotation}
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            fmt={(v) => `${Math.round((v * 180) / Math.PI)}°`}
            onChange={(v) => updateDecal(selected.id, { rotation: v })}
          />
          <Slider
            label="透明度"
            value={selected.opacity}
            min={0}
            max={1}
            step={0.01}
            fmt={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => updateDecal(selected.id, { opacity: v })}
          />

          <div className="row" style={{ marginTop: 6 }}>
            <label>颜色叠加</label>
            <div className="color-input-wrap">
              <input
                type="checkbox"
                checked={!!selected.colorOverlay}
                onChange={(e) =>
                  updateDecal(selected.id, {
                    colorOverlay: e.target.checked ? '#ffffff' : null,
                  })
                }
              />
              {selected.colorOverlay && (
                <input
                  type="color"
                  value={selected.colorOverlay}
                  onChange={(e) => updateDecal(selected.id, { colorOverlay: e.target.value })}
                />
              )}
            </div>
          </div>
          {selected.colorOverlay && (
            <Slider
              label="叠加强度"
              value={selected.overlayStrength}
              min={0}
              max={1}
              step={0.01}
              fmt={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => updateDecal(selected.id, { overlayStrength: v })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="row" style={{ marginBottom: 4 }}>
        <label>{label}</label>
        <span className="val">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
