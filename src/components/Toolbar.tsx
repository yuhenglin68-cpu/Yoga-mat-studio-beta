import { useStudioStore, Tool } from '@/store/useStudioStore';

const TOOLS: { id: Tool; icon: string; title: string }[] = [
  { id: 'orbit', icon: '🖐', title: '旋转 / 平移视角' },
  { id: 'eyedropper', icon: '💧', title: '智能取色器' },
  { id: 'draw', icon: '✏️', title: '标注画笔（自动平滑）' },
  { id: 'text', icon: '🅣', title: '文本标注' },
];

export function Toolbar() {
  const { viewMode, setViewMode, tool, setTool } = useStudioStore();

  return (
    <div className="toolbar">
      <div className="brand">
        YOGA MAT <span>STUDIO</span>
      </div>

      <div className="seg">
        <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')}>
          3D 立体
        </button>
        <button className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')}>
          2D 展开
        </button>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 4px' }} />

      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={t.title}
          className={`tool-btn ${tool === t.id ? 'active' : ''}`}
          onClick={() => setTool(t.id)}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
