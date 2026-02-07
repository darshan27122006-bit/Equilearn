import pytesseract
import pdfplumber
import docx
import cv2
import numpy as np
import os
from PIL import Image

class OCRService:
    def __init__(self):
        # Mapping of common language names/codes to Tesseract lang codes
        self.lang_map = {
            'en': 'eng',
            'hi': 'hin',
            'ta': 'tam',
            'te': 'tel',
            'kn': 'kan',
            'ml': 'mal',
            'bn': 'ben',
            'mr': 'mar',
            'gu': 'guj',
            'ur': 'urd',
            'pa': 'pan',
            'as': 'asm',
            'or': 'ori',
            # Minor languages might need additional packs
            'kok': 'kok',
            'mni': 'mni',
            'brx': 'brx',
            'ks': 'kas',
            'mai': 'mai'
        }

    def extract_text(self, file_path, file_type, language='en'):
        """
        Extract text from PDF, Image, or Docx with language support
        """
        try:
            if file_type == 'pdf':
                return self._extract_from_pdf(file_path)
            elif file_type in ['jpg', 'jpeg', 'png', 'image']:
                return self._extract_from_image(file_path, language)
            elif file_type in ['doc', 'docx']:
                return self._extract_from_docx(file_path)
            else:
                return "Unsupported file type for extraction"
        except Exception as e:
            print(f"Extraction Error: {e}")
            return f"Error extracting text: {str(e)}"

    def _extract_from_image(self, image_path, language='en'):
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                return "Could not read image for OCR"

            # Preprocessing
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray, h=10)
            _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            processed_path = image_path + ".processed.jpg"
            cv2.imwrite(processed_path, thresh)
            
            lang = self.lang_map.get(language, 'eng')
            text = pytesseract.image_to_string(Image.open(processed_path), lang=lang)
            
            if os.path.exists(processed_path):
                os.remove(processed_path)
                
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            lang = self.lang_map.get(language, 'eng')
            try:
                return pytesseract.image_to_string(Image.open(image_path), lang=lang).strip()
            except:
                return "__OCR_FAILED__"

    def _extract_from_pdf(self, pdf_path):
        """Use pdfplumber for high-quality text extraction from PDFs"""
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # If no text extracted (likely image-based PDF), fallback to OCR
            if not text.strip():
                return self._ocr_pdf_fallback(pdf_path)
                
            return text.strip()
        except Exception as e:
            print(f"PDF Extraction Error: {e}")
            return self._ocr_pdf_fallback(pdf_path)

    def _ocr_pdf_fallback(self, pdf_path):
        """Fallback to OCR if pdfplumber fails or PDF is image-based"""
        try:
            from pdf2image import convert_from_path
            pages = convert_from_path(pdf_path)
            text = ""
            for page in pages:
                text += pytesseract.image_to_string(page, lang='eng+hin') # Default to English + Hindi for fallback
            return text.strip()
        except Exception as e:
            print(f"PDF OCR Fallback failed: {e}")
            return "__OCR_FAILED__"

    def _extract_from_docx(self, docx_path):
        try:
            doc = docx.Document(docx_path)
            text = []
            for para in doc.paragraphs:
                text.append(para.text)
            return '\n'.join(text).strip()
        except Exception as e:
            return f"Error reading DOCX: {e}"
