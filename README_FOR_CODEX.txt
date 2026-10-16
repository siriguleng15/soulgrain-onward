ONWARD original GLB divided only to meet the GitHub browser 25 MiB upload limit.
This is the original 82,944,572-byte Sketchfab GLB (NOT the modified 2.5MB GLB).

Place all .part files under raw-assets/original-model-parts/ in GitHub.
In the Codex cloud workspace, from the repository root run:

mkdir -p /tmp/onward-original
cat raw-assets/original-model-parts/generic_converse_style_sneakers.glb.part* > /tmp/onward-original/generic_converse_style_sneakers.glb
sha256sum /tmp/onward-original/generic_converse_style_sneakers.glb

Compare printed digest with original_sha256 in manifest.json before importing to Blender.
Do not base new V4 mesh generation on public/assets/soulgrain_onward_template_white_preview.glb nor old V3 blend/glb.
Note: Removing textures in 2.5MB white model did not inherently remove the original mesh geometry, so investigate the actual topology rather than assuming file size controls quality.
Credit: theunclerulez, Generic "Converse style" Sneakers, CC BY 4.0.
https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244
