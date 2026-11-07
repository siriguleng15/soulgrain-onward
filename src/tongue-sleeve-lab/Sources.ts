import contract from '../../.agents/skills/onward-asset-contract/references/asset-contract.json';
export const SOURCES={
 shoe:{url:'assets/onward-ad-v1/onward-ad-v1.glb',sha256:contract.expected.sha256},
 hand:{url:'tongue-sleeve-lab/assets/user-hand-original.glb',sha256:'9608397f034b054b914c78f7bbf2a01404496045f2fc37d55efadf027c3b7637'},
};
export const DISPLAY_SCALE=contract.expected.displayNormalization.scale;
export const SHOE_CENTER=contract.expected.displayNormalization.center as [number,number,number];
