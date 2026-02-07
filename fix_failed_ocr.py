
from app import create_app, db
from app.models.content import Content, Translation
from app.services.chatbot_service import ChatbotService
from app.services.translation_service import TranslationService
from app.services.simplification_service import SimplificationService

def fix_all():
    app = create_app('development')
    with app.app_context():
        chatbot_service = ChatbotService()
        translation_service = TranslationService()
        simplification_service = SimplificationService()
        
        # 1. Fix Content
        failed_contents = Content.query.filter(
            (Content.text == "__OCR_FAILED__") | 
            (Content.text.like("%OCR failed%")) |
            (Content.text.like("%Error extracting text%")) |
            (Content.text.like("%Could not read image%")) |
            (Content.text.like("%Unsupported file type%"))
        ).all()
        
        print(f"Found {len(failed_contents)} failed lesson contents.")
        
        for content in failed_contents:
            print(f"Fixing lesson: {content.topic} ({content.subject})")
            new_text = chatbot_service.generate_lesson_content(
                topic=content.topic,
                subject=content.subject,
                level=content.level
            )
            content.text = new_text
            content.simplified_text = simplification_service.simplify_text(new_text, content.level)
            
            # Re-translate if needed
            translations = Translation.query.filter_by(content_id=content.content_id).all()
            if translations:
                print(f"  Fixing {len(translations)} translations...")
                langs = [t.language for t in translations]
                new_translations = translation_service.translate_to_multiple(new_text, langs)
                for t in translations:
                    if t.language in new_translations:
                        t.translated_text = new_translations[t.language]
                        t.simplified_text = simplification_service.simplify_text(t.translated_text, content.level)
        
        db.session.commit()
        print("Done! All failed OCR records have been reconstructed manually.")

if __name__ == "__main__":
    fix_all()
