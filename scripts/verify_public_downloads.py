from pathlib import Path
import json,hashlib,urllib.request,urllib.parse,concurrent.futures,time,subprocess
R=Path(__file__).resolve().parents[1];commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();base=f'https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/{commit}/delivery/';manifest=json.loads((R/'delivery/SHA256SUMS.json').read_text());start=time.monotonic()
def verify(row):
 url=base+urllib.parse.quote(row['file']);n=0;sha=hashlib.sha256();request=urllib.request.Request(url,headers={'User-Agent':'Soulgrain-public-download-verification'})
 with urllib.request.urlopen(request,timeout=60) as response:
  status=response.status;mime=response.headers.get('Content-Type')
  while block:=response.read(1024*1024):sha.update(block);n+=len(block)
 assert status==200 and n==row['bytes'] and sha.hexdigest()==row['sha256'],row['file'];return {**row,'url':url,'http_status':status,'content_type':mime,'verified_public_without_auth':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(verify,manifest))
report={'commit':commit,'downloads':rows,'seconds':time.monotonic()-start};(R/'reports/public-download-verification.json').write_text(json.dumps(report,indent=2));print('ALL_PUBLIC_DOWNLOADS_VERIFIED',len(rows),report['seconds']);print(json.dumps([{'file':x['file'],'bytes':x['bytes'],'http':x['http_status']} for x in rows],indent=2))
