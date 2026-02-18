import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from pypdf import PdfReader
reader = PdfReader(r"C:\Users\hkher\Desktop\GMUHackathon\BudgetU-Claude-Code-Agent-Files\Instructions for claude.pdf")
for i, page in enumerate(reader.pages):
    print(f"=== PAGE {i+1} ===")
    text = page.extract_text()
    if text:
        print(text)
    print()
