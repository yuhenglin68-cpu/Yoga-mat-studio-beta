import { MATERIAL_PRESETS, MaterialId, YOGA_COLORS, MatShape } from '@/core/constants';
import { useStudioStore } from '@/store/useStudioStore';

const SHAPES: { id: MatShape; label: string; icon: string }[] = [
  { id: 'regular', label: '常规款', icon: '▭' },
  { id: 'semicircle', label: '半圆款', icon: '◒' },
  { id: 'oval', label: '椭圆款', icon: '⬯' },
];

export function MaterialPanel() {
  const { material, setMaterial, shape, setShape, baseColor, setBaseColor } = useStudioStore();

  return (
    <>
      <div className="section">
        <h3>瑜伽垫形状</h3>
        <div className="seg" style={{ background: 'var(--bg-2)', padding: 4, marginBottom: 8 }}>
          {SHAPES.map((s) => (
            <button
              key={s.id}
              className={shape === s.id ? 'active' : ''}
              style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
              onClick={() => setShape(s.id)}
            >
              <span style={{ fontSize: 16, marginRight: 6 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>材质库 · PBR</h3>
        {(Object.keys(MATERIAL_PRESETS) as MaterialId[]).map((id) => {
          const p = MATERIAL_PRESETS[id];
          return (
            <div
              key={id}
              className={`material-card ${material === id ? 'active' : ''}`}
              onClick={() => setMaterial(id)}
            >
              <div className="sw" style={{ background: swatchFor(id) }} />
              <div className="meta">
                <b>{p.label.split(' (')[0]}</b>
                <small>{p.description}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section">
        <h3>底色 · 预设色号</h3>
        <div className="color-input-wrap" style={{ marginBottom: 12 }}>
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
          />
          <input
            type="text"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
          />
        </div>
        <div className="swatches">
          {YOGA_COLORS.map((c) => (
            <div
              key={c.id}
              title={c.label}
              className={`sw ${baseColor.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setBaseColor(c.hex)}
            />
          ))}
        </div>
        <p className="hint">
          已根据色号图识别 13 种核心色号。选择上方工具栏「💧 取色器」后：可拖入自定义图片提取颜色。
        </p>
      </div>
    </>
  );
}

function swatchFor(id: MaterialId): string {
  if (id === 'cork') return 'linear-gradient(135deg,#c8a06a,#9c7b4a)';
  if (id === 'pu-matte') return 'linear-gradient(135deg,#585e65,#2d3436)';
  if (id === 'pu-glossy') return 'linear-gradient(135deg,#9aa3b2,#ffffff)';
  return 'linear-gradient(135deg,#5b8def,#38e0c8)';
}
