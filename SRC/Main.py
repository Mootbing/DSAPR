from Bio.Blast import NCBIWWW
from Bio import SeqIO

sequence_data = open("PC1.22.fasta").read() 
result_handle = NCBIWWW.qblast("blastn", "nt", sequence_data) 

with open('results.xml', 'w+') as save_file: 
    blast_results = result_handle.read() 
    save_file.write(blast_results)