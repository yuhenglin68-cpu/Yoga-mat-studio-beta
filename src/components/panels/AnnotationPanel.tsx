import { useStudioStore } from '@/store/useStudioStore';

/** Controls for the annotation tools (brush color/width, clear). */
export function AnnotationPanel() {
  const { brushColor, brushWidth, setBrush, clearAnnotations, tool, setTool } = useStudioStore();

  return (
    <div className="section">
      <h3>智能标注</h3>

      <div className="row">
        <button
          className={`btn ${tool === 'draw' ? 'primary' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setTool('draw')}
        >
          ✏️ 画笔
        </button>
        <button
          className={`btn ${tool === 'text' ? 'primary' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setTool('text')}
        >
          🅣 文本
        </button>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <label>颜色</label>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrush({ color: e.target.value })}
          style={{ width: 42, height: 30 }}
        />
      </div>

      <div style={{ marginTop: 4 }}>
        <div className="row" style={{ marginBottom: 4 }}>
          <label>笔触宽度</label>
          <span className="val">{brushWidth}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={brushWidth}
          onChange={(e) => setBrush({ width: parseInt(e.target.value) })}
        />
      </div>

      <button className="btn full danger" style={{ marginTop: 12 }} onClick={clearAnnotations}>
        清除全部标注
      </button>
      <p className="hint">画笔内置贝塞尔 + RDP 平滑算法，手绘线条会自动拉直、圈画自动顺滑。</p>
    </div>
  );
}
