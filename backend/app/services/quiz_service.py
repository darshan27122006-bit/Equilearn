import random
import uuid
import logging

logger = logging.getLogger("QuizService")

class QuizService:
    def __init__(self):
        pass

    def generate_quiz(self, content_text, level='medium', num_questions=3):
        """
        Generate a 3-question quiz for the demo with heuristics
        """
        logger.info(f"DEMO LOG: Quiz Generation Request -> Level: {level}")
        
        try:
            sentences = [s.strip() for s in content_text.split('.') if len(s.strip()) > 15]
            if not sentences:
                sentences = ["This lesson is about learning.", "Education is important.", "Knowledge is power."]

            questions = []
            
            # Use top sentences to create questions
            for i in range(min(num_questions, len(sentences))):
                sentence = sentences[i]
                
                # Simple MCQ logic: find a noun-like word or keyword to blank out
                words = sentence.split()
                if len(words) > 5:
                    keyword = words[random.randint(2, len(words)-1)]
                    display_q = sentence.replace(keyword, "__________")
                    
                    questions.append({
                        'id': str(uuid.uuid4()),
                        'question': f"Question {i+1}: Fill in the blank:\n'{display_q}'",
                        'options': [keyword, "Unknown", "Incorrect", "Placeholder"],
                        'correctAnswer': keyword,
                        'explanation': f"Based on the sentence: '{sentence}'"
                    })
                else:
                    questions.append({
                        'id': str(uuid.uuid4()),
                        'question': f"True or False: {sentence}",
                        'options': ["True", "False"],
                        'correctAnswer': "True",
                        'explanation': "The lesson explicitly states this."
                    })
            
            logger.info(f"DEMO LOG: Generated {len(questions)} quiz questions.")
            return questions
            
        except Exception as e:
            logger.error(f"DEMO LOG ERROR: Quiz generation failed: {e}")
            return []
