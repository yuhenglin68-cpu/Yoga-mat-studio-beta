import { useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';

/** Open API-key window for the third-party AI background-removal service. */
export function SettingsPanel() {
  const { removeBgApiKey, setRemoveBgApiKey } = useStudioStore();
  const [reveal, setReveal] = useState(false);

  return (
    <div className="section">
      <h3>
        AI 去背服务
        {removeBgApiKey ? <span className="tag">已配置</span> : null}
      </h3>
      <div className="color-input-wrap">
        <input
          type={reveal ? 'text' : 'password'}
          placeholder="填入 Remove.bg API Key"
          value={removeBgApiKey}
          onChange={(e) => setRemoveBgApiKey(e.target.value.trim())}
        />
        <button className="btn" style={{ padding: '8px 10px' }} onClick={() => setReveal((r) => !r)}>
          {reveal ? '隐藏' : '显示'}
        </button>
      </div>
      <p className="hint">
        Key 仅保存在本地（localStorage），不会上传。配置后导入带白底的图片会自动调用接口去底，仅保留主体。
        可在 remove.bg 官网免费申请 Key。
      </p>
    </div>
  );
}
