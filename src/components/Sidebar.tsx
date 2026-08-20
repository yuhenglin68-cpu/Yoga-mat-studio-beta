import { MaterialPanel } from './panels/MaterialPanel';
import { DecalPanel } from './panels/DecalPanel';
import { AnnotationPanel } from './panels/AnnotationPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { ExportPanel } from './panels/ExportPanel';

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-scroll">
        <MaterialPanel />
        <DecalPanel />
        <AnnotationPanel />
        <SettingsPanel />
        <ExportPanel />
      </div>
    </aside>
  );
}
