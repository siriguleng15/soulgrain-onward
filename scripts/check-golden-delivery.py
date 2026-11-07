"""Read-only static delivery and Safari-compatible H.264 container checks."""
from pathlib import Path
import argparse, hashlib, json, re, struct, subprocess

parser=argparse.ArgumentParser();parser.add_argument('--build',default='/tmp/xiezitu-golden-v1-build');args=parser.parse_args()
root=Path(__file__).resolve().parents[1];build=Path(args.build).resolve()
assets=build/'golden-derivation';verification=assets/'verification'
entry=build/'golden-derivation.html';assert entry.is_file()
for html in [entry,assets/'review.html']:
 for url in re.findall(r'(?:src|href)="([^"]+)"',html.read_text()):
  if url.startswith(('http:','https:','#')):continue
  target=(html.parent/url.split('?')[0]).resolve()
  assert target.is_relative_to(build) and target.is_file(),(html,url)
source=assets/'xiezitu.glb';sha=hashlib.sha256(source.read_bytes()).hexdigest()
assert sha=='b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897'
for name in ['browser-check.json','geometry-check.json','protection-check.json']:
 assert json.loads((verification/name).read_text())['passed'],name
movie=verification/'motion-review.mp4';assert movie.is_file()
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
stream=next(s for s in probe['streams'] if s['codec_type']=='video')
assert stream['codec_name']=='h264' and stream['pix_fmt']=='yuv420p'
assert stream['width']%2==0 and stream['height']%2==0
duration=float(probe['format']['duration']);assert 42.9<duration<43.3
boxes={}
with movie.open('rb') as f:
 while True:
  offset=f.tell();header=f.read(8)
  if len(header)<8:break
  size,name=struct.unpack('>I4s',header)
  if size==1:size=struct.unpack('>Q',f.read(8))[0]
  if size==0:size=movie.stat().st_size-offset
  boxes[name.decode('ascii')]=offset;assert size>=8;f.seek(offset+size)
assert boxes['moov']<boxes['mdat'],'MP4 needs faststart for progressive playback'
decoded=root/'public/golden-derivation/verification/13-video-decoded.png'
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','24.5','-i',str(movie),'-frames:v','1',str(decoded)],check=True)
report={'passed':True,'buildEntry':str(entry),'localReferencesResolve':True,'originalModelSha256':sha,'movie':{'codec':stream['codec_name'],'pixelFormat':stream['pix_fmt'],'dimensions':[stream['width'],stream['height']],'duration':duration,'frameRate':stream['avg_frame_rate'],'faststart':True,'decodedFrameSeconds':24.5},'deviceScope':'Container and decode validation, not physical iPad Safari testing.','published':False}
(root/'public/golden-derivation/verification/delivery-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
