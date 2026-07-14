import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectExplorer } from '../hooks/useProjectExplorer';
import type { ProjectNode } from '../types';

const TreeNode: React.FC<{ node: ProjectNode; depth: number }> = ({ node, depth }) => {
  const { expandedNodeIds, toggleNode } = useProjectExplorer();
  const isExpanded = expandedNodeIds.has(node.id);
  const isFolder = node.type === 'folder';

  return (
    <div>
      <div 
        className="flex items-center gap-1.5 py-1 px-2 hover:bg-accent cursor-pointer text-sm text-foreground select-none"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => isFolder && toggleNode(node.id)}
      >
        <span className="w-4 h-4 flex items-center justify-center text-muted-foreground text-[10px]">
          {isFolder ? (isExpanded ? '▼' : '▶') : '📄'}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export const ProjectExplorer: React.FC = () => {
  const { t } = useTranslation('projectExplorer');
  const { tree, loading, fetchTree } = useProjectExplorer();

  useEffect(() => {
    void fetchTree();
  }, [fetchTree]);

  return (
    <div className="h-full w-full bg-panel overflow-y-auto overflow-x-hidden border-r border-border">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-panel/90 backdrop-blur z-10 border-b border-border/50">
        {t('title')}
      </div>
      <div className="py-2">
        {loading ? (
          <div className="px-4 text-xs text-muted-foreground">{t('loading')}</div>
        ) : tree ? (
          <TreeNode node={tree} depth={0} />
        ) : null}
      </div>
    </div>
  );
};
