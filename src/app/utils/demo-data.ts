// Demo data initialization for the application

import { Content } from '@/app/types';
import { storage } from './storage';

export const initializeDemoContent = () => {
  const content = storage.getContent();

  // Migration/Force re-init if structure is old (translations were strings)
  const isOldFormat = content.length > 0 &&
    (content[0].translations && typeof Object.values(content[0].translations)[0] === 'string');

  if (content.length === 0 || isOldFormat) {
    const demoContent: Content[] = [
      {
        contentId: 'content-001',
        subject: 'Mathematics',
        topic: 'Introduction to Algebra',
        level: 'beginner',
        language: 'en',
        text: 'Algebra is a branch of mathematics that uses letters and symbols to represent numbers and quantities in formulae and equations. It helps us solve problems by finding unknown values. For example, if x + 5 = 10, we can find that x = 5. Algebra is fundamental to many areas of mathematics and science.',
        simplifiedText: 'Algebra uses letters like x and y to represent numbers we don\'t know yet. It helps us solve puzzles with numbers. For example: If x + 5 = 10, then x must be 5. This is very useful in math and science!',
        uploadedBy: 'teacher-001',
        approved: true,
        translations: {
          en: { text: 'Algebra is a branch of mathematics that uses letters and symbols to represent numbers and quantities in formulae and equations.' },
          hi: { text: '[हिंदी में] बीजगणित गणित की एक शाखा है जो सूत्रों और समीकरणों में संख्याओं का प्रतिनिधित्व करने के लिए अक्षरों और प्रतीकों का उपयोग करती है।' },
          ta: { text: '[தமிழில்] இயற்கணிதம் என்பது கணிதத்தின் ஒரு பிரிவாகும், இது சூத்திரங்கள் மற்றும் சமன்பாடுகளில் எண்களைக் குறிக்க எழுத்துக்கள் மற்றும் குறியீடுகளைப் பயன்படுத்துகிறது।' },
          te: { text: '[తెలుగులో] బీజగణితం అనేది గణితశాస్త్రం యొక్క ఒక విభాగం, ఇది సూత్రాలు మరియు సమీకరణాలలో సంఖ్యలను సూచించడానికి అక్షరాలు మరియు చిహ్నాలను ఉపయోగిస్తుంది।' },
          kn: { text: '[ಕನ್ನಡದಲ್ಲಿ] ಬೀಜಗಣಿತವು ಗಣಿತಶಾಸ್ತ್ರದ ಒಂದು ಶಾಖೆಯಾಗಿದ್ದು, ಸೂತ್ರಗಳು ಮತ್ತು ಸಮೀಕರಣಗಳಲ್ಲಿ ಸಂಖ್ಯೆಗಳನ್ನು ಪ್ರತಿನಿಧಿಸಲು ಅಕ್ಷರಗಳು ಮತ್ತು ಚಿಹ್ನೆಗಳನ್ನು ಬಳಸುತ್ತದೆ।' },
          ml: { text: '[മലയാളത്തിൽ] ബീജഗണിതം ഗണിതശാസ്ത്രത്തിന്റെ ഒരു ಶಾഖയാണ്, ഇത് സൂತ್ರവാക്യങ്ങളിലും സമവാക്യങ്ങളിലും സംഖ്യകളെ പ്രതിനിಧീകരിക്കാൻ അക്ഷരങ്ങളും ಚಿഹ്നങ്ങളും ഉപയോഗിക്കുന്നു।' },
          bn: { text: '[বাংলায়] বীজগণিত গণিতের একটি শাখা যা সূত্র এবং সমীকরণে সংখ্যা উপস্থাপন করতে অক্ষর এবং প্রতীক ব্যবহার করে।' },
        },
        createdAt: new Date().toISOString(),
      },
      {
        contentId: 'content-002',
        subject: 'Science',
        topic: 'Water Cycle',
        level: 'beginner',
        language: 'en',
        text: 'The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into clouds, and falls back to the surface as precipitation. The water that falls to Earth as precipitation either evaporates, is taken up by plants, or becomes runoff.',
        simplifiedText: 'Water goes around in a circle called the water cycle. First, the sun heats water and it goes up into the sky (evaporation). Then it forms clouds. Finally, it falls back down as rain or snow. This keeps happening again and again!',
        uploadedBy: 'teacher-001',
        approved: true,
        translations: {
          hi: { text: '[हिंदी में] जल चक्र वर्णन करता है कि कैसे पानी पृथ्वी की सतह से वाष्पित होता है, वायुमंडल में उठता है, ठंडा होता है और बादलों में संघनित होता है।' },
          ta: { text: '[தமிழில்] நீர் சுழற்சி என்பது பூமியின் மேற்பரப்பில் இருந்து நீர் எவ்வாறு ஆவியாகிறது, வளிமண்டலத்தில் உயர்கிறது, குளிர்ந்து மேகங்களாக மாறுகிறது என்பதை விவரிக்கிறது।' },
          te: { text: '[తెలుగులో] నీటి చక్రం భూమి ఉపరితలం నుండి నీరు ఎలా ఆవిరైపోతుందో, వాతావరణంలోకి పైకి వెళ్తుందో, చల్లబడి మేఘాలుగా ఘనీభవిస్తుందో వివరిస్తుంది।' },
          kn: { text: '[ಕನ್ನಡದಲ್ಲಿ] ನೀರಿನ ಚಕ್ರವು ಭೂಮಿಯ ಮೇಲ್ಮೈಯಿಂದ ನೀರು ಹೇಗೆ ಆವಿಯಾಗುತ್ತದೆ, ವಾತಾವರಣಕ್ಕೆ ಏರುತ್ತದೆ, ತಣ್ಣಗಾಗುತ್ತದೆ ಮತ್ತು ಮೋಡಗಳಾಗಿ ಸಾಂದ್ರೀಕರಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ವಿವರಿಸುತ್ತದೆ।' },
          ml: { text: '[മലയാളത്തിൽ] ജലചക്രം ഭൂമിയുടെ ഉപരിതലത്തിൽ നിന്ന് വെള്ളം എങ്ങനെ ബാഷ്പീകരിക്കപ്പെടുന്നു, അന്തരീക്ഷത്തിലേക്ക് ഉയരുന്നു, തണുക്കുകയും മേഘങ്ങളായി ഘനീഭവിക്കുകയും ചെയ്യുന്നു എന്ന് വിവരിക്കുന്നു।' },
          bn: { text: '[বাংলায়] জল চক্র বর্ণনা করে কিভাবে পৃথিবীর পৃষ্ঠ থেকে জল বাষ্পীভূত হয়, বায়ুমন্ডলে উঠে যায়, শীতল হয় এবং মেঘে ঘনীভূত হয়।' },
        },
        createdAt: new Date().toISOString(),
      },
      {
        contentId: 'content-003',
        subject: 'History',
        topic: 'Indian Independence Movement',
        level: 'intermediate',
        language: 'en',
        text: 'The Indian Independence Movement was a series of historic events spanning nearly a century, aimed at ending British colonial rule in India. Led by figures like Mahatma Gandhi, Jawaharlal Nehru, and Subhas Chandra Bose, the movement employed various strategies including non-violent civil disobedience, protests, and armed resistance. India finally gained independence on August 15, 1947.',
        simplifiedText: 'India fought for freedom from British rule for many years. Great leaders like Mahatma Gandhi, Nehru, and many others worked hard. Gandhi used peaceful protests to fight for freedom. After many struggles, India became free on August 15, 1947. This is why we celebrate Independence Day!',
        uploadedBy: 'teacher-001',
        approved: true,
        translations: {
          hi: { text: '[हिंदी में] भारतीय स्वतंत्रता आंदोलन ऐतिहासिक घटनाओं की एक श्रृंखला थी जिसका उद्देश्य भारत में ब्रिटिश औपनिवेशिक शासन को समाप्त करना था।' },
          ta: { text: '[தமிழில்] இந்திய சுதந்திர இயக்கம் இந்தியாவில் பிரிட்டிஷ் காலனித்துவ ஆட்சியை முடிவுக்கு கொண்டுவருவதை நோக்கமாகக் கொண்ட வரலாற்று நிகழ்வுகளின் தொடர்।' },
          te: { text: '[తెలుగులో] భారత స్వాతంత్ర్య ఉద్యమం భారతదేశంలో బ్రిటిష్ వలసరాజ్యాన్ని అంతం చేయడానికి లక్ష్యంగా పెట్టుకున్న చారిత్రక సంఘటనల శ్రేణి।' },
          kn: { text: '[ಕನ್ನಡದಲ್ಲಿ] ಭಾರತೀಯ ಸ್ವಾತಂತ್ರ್ಯ ಚಳುವಳಿಯು ಭಾರತದಲ್ಲಿ ಬ್ರಿಟಿಷ್ ವಸಾಹತುಶಾಹಿ ಆಳ್ವಿಕೆಯನ್ನು ಕೊನೆಗೊಳಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿದ್ದ ಐತಿಹಾಸಿಕ ಘಟನೆಗಳ ಸರಣಿಯಾಗಿದೆ।' },
          ml: { text: '[മലയാളത്തിൽ] ഇന്ത്യൻ സ്വാതന്ത്ര്യ സമരം ഇന്ത്യയിലെ ബ്രിട്ടീഷ് കൊളോണിയൽ ഭരണം അവസാനിപ്പിക്കാൻ ലക്ഷ്യമിട്ടുള്ള ചരിത്ര സംഭവങ്ങളുടെ പരമ്പരയായിരുന്നു।' },
          bn: { text: '[বাংলায়] ভারতীয় স্বাধীনতা আন্দোলন ছিল ঐতিহাসিক ঘটনার একটি সিরিজ যার লক্ষ্য ছিল ভারতে ব্রিটিশ ঔপনিবেশিক শাসন শেষ করা।' },
        },
        createdAt: new Date().toISOString(),
      },
      {
        contentId: 'content-004',
        subject: 'Language',
        topic: 'Parts of Speech',
        level: 'beginner',
        language: 'en',
        text: 'Parts of speech are categories of words that have similar grammatical properties. The main parts of speech are: nouns (person, place, thing), verbs (action words), adjectives (describing words), adverbs (describe how an action is done), pronouns (replace nouns), prepositions (show relationships), conjunctions (connect words), and interjections (express emotion).',
        simplifiedText: 'Words in a sentence have different jobs. Nouns are naming words (like "cat" or "house"). Verbs are action words (like "run" or "jump"). Adjectives describe things (like "big" or "red"). Understanding these helps us make better sentences!',
        uploadedBy: 'teacher-001',
        approved: true,
        translations: {
          hi: { text: '[हिंदी में] शब्दों के भाग ऐसे शब्दों की श्रेणियां हैं जिनमें समान व्याकरणिक गुण होते हैं।' },
          ta: { text: '[தமிழில்] பேச்சின் பாகங்கள் என்பது ஒத்த இலக்கண பண்புகளைக் கொண்ட சொற்களின் வகைகளாகும்।' },
          te: { text: '[తెలుగులో] పదాల భాగాలు సారూప్య వ్యాకరణ లక్షణాలను కలిగి ఉన్న పదాల వర్గాలు।' },
          kn: { text: '[ಕನ್ನಡದಲ್ಲಿ] ವಾಕ್ಯದ ಭಾಗಗಳು ಒಂದೇ ರೀತಿಯ ವ್ಯಾಕರಣ ಗುಣಗಳನ್ನು ಹೊಂದಿರುವ ಪದಗಳ ವರ್ಗಗಳಾಗಿವೆ।' },
          ml: { text: '[മലയാളത്തിൽ] സംസാര ಭಾಗಗಳು ಸമാനವಾದ ವ್ಯಾಕರಣ ಗುಣങ്ങളുള്ള വാക്കുകളുടെ വിഭാഗങ്ങളാണ്।' },
          bn: { text: '[বাংলায়] শব্দের অংশগুলি এমন শব্দের বিভাগ যার একই রকম ব্যাকরণগত বৈশিষ্ট্য রয়েছে।' },
        },
        createdAt: new Date().toISOString(),
      },
    ];

    storage.setContent(demoContent);
  }
};
