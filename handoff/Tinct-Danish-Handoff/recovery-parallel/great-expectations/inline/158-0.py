from pathlib import Path
s=Path('/tmp/tinct-semantic-qa/score.py').read_text().replace("D/'input'/('war-and-peace-'+s+'.json')","D/'sources'/(s+'.json')").replace("'modern-da'","'wip-da'").replace("range(365)","range(59)").replace("intra_op_num_threads=3","intra_op_num_threads=2")
Path('score.py').write_text(s)
