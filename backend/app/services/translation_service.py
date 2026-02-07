from deep_translator import GoogleTranslator
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TranslationService")

class TranslationService:
    def __init__(self):
        self.model_name = "facebook/nllb-200-distilled-600M"
        self.translator = None
        self.tokenizer = None
        self.device = "cpu"
        
        # 7 Core Languages for Demo
        self.core_languages = ['hi', 'ta', 'ml', 'te', 'kn', 'bn', 'mr']
        
        # Load language mapping
        mapping_path = os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'mappings', 'languages.json')
        try:
            with open(mapping_path, 'r') as f:
                self.lang_info = json.load(f)
        except Exception as e:
            logger.error(f"Error loading language mapping: {e}")
            self.lang_info = {"major": {}, "minor": {}}

    def _load_nllb(self):
        if self.translator is None:
            logger.info(f"DEMO LOG: Loading heavy translation model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.translator = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)

    def translate_text(self, text, target_language):
        """
        Translate text with Demo-Stability focus.
        Uses Google (via deep-translator) for 7 core languages for speed/reliability.
        Uses NLLB as fallback for minor languages if needed.
        """
        if not text or target_language == 'en':
            return text

        logger.info(f"DEMO LOG: Translation Request -> Lang: {target_language} | Text Length: {len(text)}")

        try:
            # 1. Check if it's one of the 7 core languages for fast demo
            if target_language in self.core_languages or target_language in ['hi', 'ta', 'te', 'kn', 'ml', 'bn']:
                logger.info(f"DEMO LOG: Using Fast-API for core language: {target_language}")
                return GoogleTranslator(source='auto', target=target_language).translate(text)

            # 2. Fallback to NLLB for other languages
            logger.info(f"DEMO LOG: Using NLLB for minor language: {target_language}")
            self._load_nllb()
            
            all_langs = {**self.lang_info.get("major", {}), **self.lang_info.get("minor", {})}
            target_info = all_langs.get(target_language)
            target_code = target_info['indic_code'] if target_info else target_language

            inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
            translated_tokens = self.translator.generate(
                **inputs, 
                forced_bos_token_id=self.tokenizer.lang_code_to_id[target_code], 
                max_length=512
            )
            result = self.tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
            return result
            
        except Exception as e:
            logger.error(f"DEMO LOG ERROR: Translation failed for {target_language}: {e}")
            # Final fallback if both fail
            return f"[Stability Fallback] {text}"

    def translate_to_multiple(self, text, target_languages):
        translations = {}
        for lang in target_languages:
            if lang != 'en':
                translations[lang] = self.translate_text(text, lang)
        return translations
