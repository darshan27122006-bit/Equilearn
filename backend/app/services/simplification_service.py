import logging

# Configure logging
logger = logging.getLogger("SimplificationService")

class SimplificationService:
    def __init__(self):
        pass

    def simplify_text(self, text, level='medium', style='standard'):
        """
        Simplifies text based on level with logging and demo-ready heuristics.
        Levels: easy, detailed
        """
        if not text:
            return ""

        # Normalize level names for demo consistency
        level = level.lower().strip()
        if 'easy' in level: level = 'easy'
        elif 'detail' in level: level = 'detailed'
        else: level = 'medium'

        logger.info(f"DEMO LOG: Simplification Request -> Level: {level} | Style: {style}")
        logger.info(f"DEMO LOG: Input Lesson Text Snippet: {text[:100]}...")

        try:
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            
            if level == 'easy':
                return self._generate_easy(sentences)
            elif level == 'detailed':
                return self._generate_detailed(sentences)
            else:
                return self._generate_medium(sentences)

        except Exception as e:
            logger.error(f"DEMO LOG ERROR: Simplification failed: {e}")
            return text

    def _generate_easy(self, sentences):
        header = "💡 **Easy Version:**\n"
        # Core concept + 2 simple sentences
        content = "This lesson is about " + sentences[0].lower() + ". "
        if len(sentences) > 1:
            content += "Specifically, it explains how " + sentences[1].lower() + ". "
        
        content += "\n\n**Example:** Think of it like a bicycle wheel - all parts work together to move forward!"
        return header + content

    def _generate_medium(self, sentences):
        header = "📘 **Standard Overview:**\n"
        return header + ". ".join(sentences[:min(5, len(sentences))]) + "."

    def _generate_detailed(self, sentences):
        header = "🔍 **Detailed Explanation:**\n"
        content = ". ".join(sentences) + ".\n\n"
        
        # Add educational examples/analogies
        content += "**In-depth Breakdown:**\n1. " + (sentences[0] if sentences else "Concept overview")
        if len(sentences) > 2:
            content += "\n2. Analysis of " + sentences[1]
            content += "\n3. Conclusion about " + sentences[2]
            
        content += "\n\n**Analogy for Learning:** Imagine you are building a LEGO castle; every piece (part of this lesson) contributes to the final structure."
        return header + content
