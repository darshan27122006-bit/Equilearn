# AI-Based Multilingual Learning Assistant

A complete production-ready web application for AI-powered multilingual education, supporting local and minority languages.

## 🌟 Features

### Core Functionality
- **Multi-language Support**: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali
- **Role-Based Access**: Separate dashboards for Admin, Teacher, and Student
- **AI-Powered Features**:
  - Automatic language detection
  - Real-time translation to multiple languages
  - Text simplification based on difficulty level
  - Speech-to-Text (voice input)
  - Text-to-Speech (voice output)
  - AI-powered question answering
- **Offline Support**: Content caching using browser localStorage
- **Progress Tracking**: Track student completion and scores
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm package manager
- Modern web browser with Web Speech API support

### Installation

1. **Clone or download the project**
```bash
cd multilingual-learning-assistant
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

## 👥 Demo Accounts

The application comes with pre-configured demo accounts:

### Admin Account
- **Email**: admin@mlassistant.com
- **Password**: admin123
- **Access**: Full system administration

### Teacher Account
- **Email**: teacher@mlassistant.com
- **Password**: teacher123
- **Access**: Content creation and management

### Student Account
- **Email**: student@mlassistant.com
- **Password**: student123
- **Access**: Learning and progress tracking

## 📁 Project Structure

```
/src
├── /app
│   ├── /components
│   │   ├── /ui               # Reusable UI components
│   │   ├── LoginPage.tsx     # Authentication page
│   │   ├── AdminDashboard.tsx    # Admin interface
│   │   ├── TeacherDashboard.tsx  # Teacher interface
│   │   └── StudentDashboard.tsx  # Student interface
│   ├── /types
│   │   └── index.ts          # TypeScript type definitions
│   ├── /utils
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── storage.ts        # Local storage management
│   │   ├── ai-services.ts    # AI/ML service functions
│   │   └── demo-data.ts      # Sample content data
│   └── App.tsx               # Main application component
├── /styles                   # CSS and styling files
└── /public                   # Static assets
```

## 🎯 User Roles & Permissions

### Admin
- Register and manage institution
- Create and manage teachers and students
- Enable/disable supported languages
- Approve/reject uploaded content
- View analytics dashboard
- Export reports

### Teacher
- Upload educational content (text, PDF, audio, video)
- Select subject, topic, level, and target languages
- AI automatically translates and simplifies content
- View student engagement statistics
- Track content approval status

### Student
- Browse available lessons by subject, level, and language
- Read lessons in preferred language
- Listen to audio output (Text-to-Speech)
- Ask questions using text or voice input
- Get AI-generated answers
- Request simpler or more detailed explanations
- Access cached lessons offline
- Track learning progress and scores

## 🤖 AI Features

### Language Detection
Automatically detects the language of uploaded content using pattern matching and heuristics.

### Translation
Translates content to all selected target languages. In production, this integrates with:
- Google Translate API
- HuggingFace Translation Models
- Microsoft Translator

### Text Simplification
Adapts content complexity based on student level:
- **Beginner**: Very simple language, short sentences
- **Intermediate**: Moderate complexity, detailed explanations
- **Advanced**: Full complexity, comprehensive content

### Speech-to-Text
Uses Web Speech API for voice input:
- Supports all configured languages
- Real-time transcription
- Works on Chrome, Edge, and Safari

### Text-to-Speech
Uses Web Speech API for voice output:
- Natural voice synthesis
- Multi-language support
- Adjustable speed and pitch

### AI Question Answering
Generates contextual answers to student questions based on lesson content.

## 💾 Data Storage

### Local Storage Structure

**Users Table**
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  language: Language;
  institutionId?: string;
  createdAt: string;
}
```

**Content Table**
```typescript
{
  contentId: string;
  subject: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: Language;
  text: string;
  simplifiedText: string;
  audioUrl?: string;
  uploadedBy: string;
  approved: boolean;
  translations: Record<Language, string>;
  createdAt: string;
}
```

**Progress Table**
```typescript
{
  id: string;
  studentId: string;
  contentId: string;
  topic: string;
  completion: number;
  score: number;
  lastAccessed: string;
}
```

**Institutions Table**
```typescript
{
  id: string;
  name: string;
  supportedLanguages: Language[];
  adminId: string;
  createdAt: string;
}
```

## 🔧 Configuration

### Supported Languages

The system supports the following languages (configurable in `/src/app/types/index.ts`):

- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Kannada (kn)
- Malayalam (ml)
- Bengali (bn)

### Adding New Languages

1. Update `Language` type in `/src/app/types/index.ts`
2. Add language name to `LANGUAGE_NAMES` object
3. Update Web Speech API language codes in `/src/app/utils/ai-services.ts`
4. Add language detection patterns if needed

## 📱 Offline Support

The application supports offline functionality:

### Caching Strategy
- Content is cached when viewed
- Uses browser localStorage
- Maximum storage: ~5-10MB (browser dependent)

### Offline Features
- View cached lessons
- Read saved content
- Track progress locally
- Sync when internet available

## 🔒 Security Features

### Authentication
- Password-based authentication
- Session management using localStorage
- Role-based access control (RBAC)

### Data Protection
- Client-side data validation
- Secure password storage (hashed in production)
- XSS protection via React
- CSRF protection (when integrated with backend)

## 🌐 Browser Compatibility

### Recommended Browsers
- Chrome 80+ (best support for Web Speech API)
- Edge 80+
- Safari 14+
- Firefox 75+

### Required Browser Features
- ES6+ JavaScript
- localStorage API
- Web Speech API (for voice features)
- Service Workers (for offline support)

## 📊 Production Deployment

### Building for Production

```bash
npm run build
# or
pnpm build
```

This creates an optimized production build in the `/dist` folder.

### Deployment Options

**Static Hosting**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Server Deployment**
- Node.js server with Express
- Nginx
- Apache

### Environment Variables

Create a `.env` file for production:

```env
VITE_API_URL=https://api.yourbackend.com
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key
VITE_HUGGINGFACE_API_KEY=your_api_key
```

## 🔄 Backend Integration

For production deployment, integrate with a real backend:

### Required Backend APIs

**Authentication**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

**Users**
```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

**Content**
```
GET /api/content
POST /api/content
PUT /api/content/:id
DELETE /api/content/:id
GET /api/content/:id/translations
```

**Progress**
```
GET /api/progress/:studentId
POST /api/progress
PUT /api/progress/:id
```

**AI Services**
```
POST /api/ai/translate
POST /api/ai/simplify
POST /api/ai/detect-language
POST /api/ai/answer-question
```

### Database Schema

For PostgreSQL/MySQL backend:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  language VARCHAR(10) NOT NULL,
  institution_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
  content_id VARCHAR(50) PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  level VARCHAR(20) NOT NULL,
  language VARCHAR(10) NOT NULL,
  text TEXT NOT NULL,
  simplified_text TEXT,
  uploaded_by VARCHAR(50) REFERENCES users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translations table
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(50) REFERENCES content(content_id),
  language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL
);

-- Progress table
CREATE TABLE progress (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES users(id),
  content_id VARCHAR(50) REFERENCES content(content_id),
  topic VARCHAR(200),
  completion INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institutions table
CREATE TABLE institutions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  admin_id VARCHAR(50) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout

**Admin Features**
- [ ] View dashboard statistics
- [ ] Create new users
- [ ] Approve content
- [ ] Manage languages
- [ ] View analytics

**Teacher Features**
- [ ] Upload new content
- [ ] View content status
- [ ] Check student engagement

**Student Features**
- [ ] Browse lessons
- [ ] Open and read lesson
- [ ] Change language
- [ ] Use text-to-speech
- [ ] Ask questions with voice
- [ ] Save lesson offline
- [ ] Track progress

## 📈 Performance Optimization

### Current Optimizations
- React component memoization
- Lazy loading for large components
- Efficient localStorage usage
- Debounced search and filters

### Future Improvements
- Implement virtual scrolling for large lists
- Add service worker for better offline support
- Optimize bundle size with code splitting
- Add image optimization

## 🐛 Troubleshooting

### Common Issues

**Voice input not working**
- Ensure microphone permissions are granted
- Use HTTPS (required for Web Speech API)
- Check browser compatibility

**Text-to-speech not working**
- Verify browser supports Web Speech API
- Check system audio settings
- Ensure language pack is installed

**Data not persisting**
- Check browser localStorage is enabled
- Verify storage quota not exceeded
- Clear browser cache and try again

**Slow performance**
- Clear localStorage if too much data cached
- Use modern browser
- Check system resources

## 🤝 Contributing

This is a production-ready application. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided as-is for educational and commercial use.

## 📞 Support

For issues, questions, or feature requests:
- Create an issue in the repository
- Contact the development team
- Check documentation

## 🎓 Educational Use

This application is designed for:
- Schools and educational institutions
- Language learning centers
- NGOs working with minority language communities
- Government education programs
- Online learning platforms

## 🌍 Localization

The system is designed for easy localization:
- All UI text can be externalized
- Supports RTL languages (with CSS updates)
- Cultural adaptations possible
- Local content integration

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [HuggingFace Translation Models](https://huggingface.co/models?pipeline_tag=translation)
- [Google Cloud Translation](https://cloud.google.com/translate)

---

**Built with ❤️ for linguistic diversity and educational accessibility**
