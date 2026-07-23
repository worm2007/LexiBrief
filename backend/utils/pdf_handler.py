import fitz

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)

    text = ""

    for page_num, page in enumerate(doc):
        page_text = page.get_text("text")

        text += f"--- PAGE {page_num + 1} ---\n"

        if page_text:
            text += page_text + "\n"

    doc.close()

    return text