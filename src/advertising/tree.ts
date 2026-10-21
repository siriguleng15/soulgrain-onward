import type { NodeId, StoryNode } from './types';

export const tree: Record<NodeId, StoryNode> = {
  ROOT: { id: 'ROOT', parent: null, index: 'ONWARD / NIGHTFALL', title: '向前。\n也向来处。', description: '一双鞋，一段可以亲自展开的故事。', next: 'A1', action: '探索翻筒', duration: 2.6 },
  A1: { id: 'A1', parent: 'ROOT', index: 'A1 / 翻筒', title: '让结构，\n成为表达。', description: '三段鼓起，两道缝线。\n红色的边界，将布面收束。', next: 'A1.1', action: '构成与灵感', duration: 2.8 },
  'A1.1': { id: 'A1.1', parent: 'A1', index: 'A1.1 / 构成展开', title: '沿着一圈布面，\n打开空间。', description: '从周向围合，到横向舒展。', next: 'A1.1.1', action: '转译', duration: 5.4 },
  'A1.1.1': { id: 'A1.1.1', parent: 'A1.1', index: 'A1.1.1 / 结构转译', title: '形态之间，\n自有回响。', description: '让翻筒的结构，回应蒙古包的构成。', next: 'A1.1.1.1', action: '文化与设计注释', duration: 17.2 },
  'A1.1.1.1': { id: 'A1.1.1.1', parent: 'A1.1.1', index: 'A1.1.1.1 / 文化与设计', title: '结构，\n有它的名字。', description: '看见形态之后，再读它的来处。', next: null, action: '回到整鞋', duration: 5.8 },
};
export const branches = [
  { id: 'A', name: '翻筒', subtitle: '结构的回响', available: true },
  { id: 'B', name: '鞋面印花', subtitle: '下一篇章', available: false },
  { id: 'C', name: '鞋舌', subtitle: '下一篇章', available: false },
  { id: 'D', name: '蒙古扣', subtitle: '下一篇章', available: false },
  { id: 'E', name: '鞋带头', subtitle: '下一篇章', available: false },
  { id: 'F', name: '后跟皮条', subtitle: '下一篇章', available: false },
  { id: 'G', name: '后跟 Logo', subtitle: '下一篇章', available: false },
  { id: 'H', name: '配色系统', subtitle: '下一篇章', available: false },
] as const;
export const pathTo = (id: NodeId): NodeId[] => {
  const path: NodeId[] = []; let current: NodeId | null = id;
  while (current) { path.unshift(current); current = tree[current].parent; }
  return path;
};
export const isNode = (value: string): value is NodeId => Object.hasOwn(tree, value);
