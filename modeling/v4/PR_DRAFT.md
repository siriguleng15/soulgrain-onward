This draft restores the uploaded original Sketchfab source, verifies its SHA-256, and creates a new single-shoe V4 review candidate. It does not change the live website, V2 asset or V3 history. **This is not a finished high-fidelity reconstruction and is not ready to merge.**

The original is 82,944,572 bytes, SHA-256 `af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65`. Blender reads it successfully. Binary accessor comparisons show the same positions, normals, tangents, UVs and indices as the old 2.5 MB white preview. The larger original mainly contains six 4096-square PNG textures; it is not a higher-density geometric source.

Fresh V4 code imports only the verified original, selects one shoe, retains native lower body/sole/toe/laces, extrudes a thick folded cuff from its actual ankle cut seam, and reshapes the original tongue. No V3 geometry or scripts are read. Materials are neutral grey, without original textures, logos or additional decoration.

Deliverables are in `modeling/v4/`: editable Blender project, repeatable restoration/audit/build/render/check scripts, six 1200×900 views, six photo comparisons and overview, part inventory, source audit, known issues and local 360-degree inspector. The derivative GLB is `public/assets/soulgrain_onward_v4_original_review.glb` (~10.63 MiB). Original ~79 MiB GLB is not re-committed.

Validation:
- Original SHA and Blender import pass; exported GLB independently reimports with 13 meshes and no image textures.
- Chromium software WebGL loads actual GLB, drag changes all four sampled views, reset restores initial view, no page errors. Physical iPad Safari remains untested.
- **Geometry QA fails:** tongue retains 279 proper self-crossing triangle pairs after attempted local repair. Cuff passes tested manifold/zero-area/self-crossing conditions, and sampled root displacement is zero. These checks do not certify inter-part contacts or visual similarity.
- **Visual fidelity is not approved:** cuff folds are too regular, tongue drape/contact and overall proportions need manual camera-matched sculpting and retopology. Unstable cloth relaxation was rejected, not presented as a successful simulation.

Review `modeling/v4/comparisons/overview.jpg` and `modeling/v4/README.md` first. Run `npm run dev` then visit `/modeling/v4/inspect.html` to rotate the candidate; this inspection page is separate from the production website. No merge or deployment has been performed.

Source: theunclerulez, Generic “Converse style” Sneakers, https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244 — CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ . Materials removed/replaced and geometry modified as documented.
