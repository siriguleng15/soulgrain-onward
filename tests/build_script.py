from pathlib import Path
R=Path(__file__).resolve().parents[1]
base=Path('/workspace/artifacts/soulgrain-semantic-v2-1/scripts/soulgrain_semantic_v2_1.py').read_text()
import hashlib
assert hashlib.sha256(base.encode()).hexdigest()=='a574476bc3ae454044387b43c20156f3ed1f0047e0d8d7748a0781d26d1ab883'
base=base.replace('Soulgrain Semantic V2.1: editable growth proposals.', 'Soulgrain Semantic V2.2: runtime semantic exploded workbench.')
base=base.replace("if __name__=='__main__':register()",'')
base=base.replace('"name": "Soulgrain 语义标注 V2.1 热修复"','"name": "Soulgrain 语义标注 V2.2 动态分解工作台"').replace('"version": (2, 1, 1)','"version": (2, 2, 0)')
base=base.replace("bl_label='Soulgrain V2.1 热修复 · 2.1.1'", "bl_label='Soulgrain V2.2 · 语义标注与动态分解'")
text=base+'\n'+(R/'scripts/v22_display_extension.py').read_text()+"\nif __name__=='__main__':register()\n"
compile(text,str(R/'scripts/soulgrain_semantic_v2_2.py'),'exec')
(R/'scripts/soulgrain_semantic_v2_2.py').write_text(text)
print('built full standalone tool',len(text.encode()))
