# Anatomical hand source and derivative

This work is based on **Rigged hand** by **Elena FF**, licensed under
**Creative Commons Attribution-ShareAlike 4.0**.

- Original model: https://sketchfab.com/3d-models/rigged-hand-eae97cc2a742413cb5338ab942b12c1e
- Author: https://sketchfab.com/elenaferfor
- License: https://creativecommons.org/licenses/by-sa/4.0/
- Attributed public distribution: https://github.com/cadenroberts/TheraHand/tree/36c051b036032740720164120c884ce16a65f162/public/rigged_hand
- Packed original GLB SHA-256: `3eb51d0b612fb4b5f3b63c9e32ac145be191abcfd38ca7d3c5cf4fe0a7ee2d58`

`LICENSE.txt` preserves the original model credit. `open-pose.json` contains the
original model's open animation pose, evaluated in Three.js, with original
vertex identities, triangle indices, UVs, weights and joint positions. The
three texture images are the original authored albedo, packed metal/roughness,
and specular maps. No Why Zero assets or user recording pixels are used.

This project's modifications normalize orientation/scale, rebuild an editable
canonical deform rig, and extend the forearm. The authored hand UV atlas is
preserved. `forearm-continuation.png` is a new derivative atlas continuing skin
colors sampled from the original wrist boundary; it avoids mapping nail islands
onto the new arm.

The derivative GLB, Blender project, source geometry and derivative textures
remain **CC BY-SA 4.0**. Retain the author credit and the same license when
redistributing modified model/texture assets. The independently authored
interactive application is separate from these model and texture assets.

Rebuild with Blender 5.2:

```
blender -b --python assets-src/convert_anatomical_v5.py
```

The `.blend` retains optional subdivision for editing. The runtime GLB uses the
artist's original hand resolution plus the added forearm, without a costly
subdivision increase.
