import { useState } from 'react';
import { Viewport } from './components/Viewport';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app">
      <Viewport />
      <Toolbar />
      <button
        className="collapse-tab"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? '展开面板' : '折叠面板'}
      >
        {collapsed ? '❮' : '❯'}
      </button>
      <Sidebar collapsed={collapsed} />
    </div>
  );
}
