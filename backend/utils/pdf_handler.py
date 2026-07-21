import fitz 

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")
        text += f"--- PAGE {page_num + 1} ---\n"
        for b in blocks:
            if b[6] == 0: text += b[4] + "\n"
    return text