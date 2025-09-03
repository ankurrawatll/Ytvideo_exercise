# 🎓 InteractiveEdu - Interactive Learning Platform

A complete, free, offline-first MVP web app that lets teachers/authors create interactive lessons by combining YouTube videos with interactive exercises. Built with Next.js, TailwindCSS, and client-side Python execution via Pyodide.

## 🚀 **How This Software Works - Complete Tutorial**

### **Overview**
InteractiveEdu creates a **seamless learning experience** where videos automatically pause at checkpoints and exercises appear as fullscreen overlays. Think of it as "YouTube + Google Colab" but with automatic progression and no manual navigation.

### **Step-by-Step User Experience**

1. **🎬 Video Starts Playing**
   - Video automatically begins from the specified start time
   - User watches normally, just like any YouTube video

2. **⏸️ Automatic Checkpoint Pause**
   - When video reaches the end time (checkpoint), it automatically pauses
   - Visual indicator shows "Checkpoint Reached" with a pulsing dot
   - Video remains visible but paused in the background

3. **🖥️ Exercise Overlay Appears**
   - Fullscreen overlay fades in with smooth animation
   - Exercise content (code/quiz/simulation/ML) appears in a Google Colab-style container
   - Video is still visible but dimmed in the background

4. **✅ Complete the Exercise**
   - User interacts with the exercise (writes code, answers quiz, adjusts sliders, etc.)
   - Click "Mark Complete" when finished
   - Progress is automatically saved to localStorage

5. **🎬 Overlay Disappears, Video Resumes**
   - Overlay fades out smoothly
   - Video automatically resumes or seeks to the next video section
   - Learning continues seamlessly

### **Technical Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Video Player (YouTube)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Video plays → reaches checkpoint → auto-pause      │   │
│  │ Triggers onCheckpointReached() callback            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  LessonPlayer (Orchestrator)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Receives checkpoint event                          │   │
│  │ Finds next exercise step                          │   │
│  │ Shows ModalOverlay with exercise content          │   │
│  │ Manages exercise completion and video resumption  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ModalOverlay (Container)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Fullscreen overlay with backdrop blur              │   │
│  │ Google Colab-style header with colored dots       │   │
│  │ Smooth fade-in/fade-out transitions               │   │
│  │ Prevents body scroll when open                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┐
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Exercise Components                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CodeCell: Monaco Editor + Pyodide execution       │   │
│  │ QuizCard: Multiple choice with feedback           │   │
│  │ Simulation: Interactive sliders + Plotly          │   │
│  │ MLCell: Gradient descent + training visualization │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components Explained**

#### **1. VideoPlayer Component**
- **Purpose**: Wraps YouTube IFrame API and controls video playback
- **Key Features**:
  - Auto-plays from specified start time
  - Monitors playback progress every 500ms
  - Auto-pauses at checkpoint (end time)
  - Exposes methods via ref: `playFrom()`, `resume()`, `pause()`
  - Unique DOM IDs prevent conflicts between multiple videos

#### **2. ModalOverlay Component**
- **Purpose**: Fullscreen container for exercises with Google Colab styling
- **Key Features**:
  - Backdrop blur effect for focus
  - Colored dots in header (like terminal windows)
  - Smooth fade animations (300ms duration)
  - Click-outside-to-close functionality
  - Prevents body scroll when open

#### **3. Exercise Components**
- **CodeCell**: Python code execution with Monaco Editor
- **QuizCard**: Multiple choice questions with immediate feedback
- **Simulation**: Interactive economics simulation with Plotly
- **MLCell**: Machine learning training with progress tracking

#### **4. LessonPlayer Component**
- **Purpose**: Central orchestrator that manages the entire learning flow
- **Key Features**:
  - Loads lesson configuration from JSON
  - Manages overlay state and content
  - Handles exercise completion callbacks
  - Automatically progresses between video sections
  - Persists progress to localStorage

### **Lesson Configuration Format**

The `public/lesson.json` file defines the learning sequence:

```json
[
  {
    "type": "video",
    "videoId": "kYB8IZa5AuE",
    "start": 0,
    "end": 60,
    "title": "Introduction to Linear Algebra"
  },
  {
    "type": "exercise",
    "mode": "code",
    "prompt": "Create a 2x2 identity matrix...",
    "starterCode": "import numpy as np\n..."
  }
]
```

**Video Steps**:
- `start`: Video start time in seconds
- `end`: Checkpoint time (video pauses here)
- `title`: Display name for the section

**Exercise Steps**:
- `mode`: Type of exercise (`code`, `quiz`, `simulation`, `ml`)
- `prompt`: Instructions for the learner
- `starterCode`: Initial code for code exercises
- `choices` & `answerIndex`: For quiz questions

### **Data Flow & State Management**

```
1. Video reaches checkpoint
   ↓
2. VideoPlayer calls onCheckpointReached()
   ↓
3. LessonPlayer finds next exercise step
   ↓
4. Sets overlay state: showOverlay = true
   ↓
5. Renders exercise in ModalOverlay
   ↓
6. User completes exercise, calls onComplete()
   ↓
7. LessonPlayer closes overlay, resumes video
   ↓
8. Progress saved to localStorage
```

### **Offline-First Architecture**

- **No Backend**: Pure client-side application
- **CDN Dependencies**: YouTube API, Pyodide, Plotly loaded from free CDNs
- **Local Storage**: Progress automatically saved to browser localStorage
- **Caching**: External libraries cached after first load

### **Customization & Extension**

#### **Adding New Exercise Types**
1. Create new component in `components/`
2. Add case in `LessonPlayer.js` renderExercise function
3. Update lesson JSON schema documentation

#### **Modifying Lesson Content**
- Edit `public/lesson.json` to change video IDs, timestamps, exercise prompts
- Add/remove lesson steps
- Customize quiz questions and code examples

#### **Styling Changes**
- Modify `tailwind.config.js` for theme customization
- Edit `styles/globals.css` for custom CSS classes
- Use Tailwind utility classes throughout components

### **Browser Compatibility**

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Required**: ES6 modules, async/await, modern CSS
- **Not supported**: Internet Explorer, older mobile browsers

### **Performance Considerations**

- **Pyodide**: ~50MB initial download, cached after first load
- **Monaco Editor**: Lazy loaded when code cells are accessed
- **YouTube API**: Loaded once globally
- **Plotly**: Loaded once globally

### **Troubleshooting Common Issues**

1. **Pyodide not loading**: Check internet connection and CDN availability
2. **YouTube videos not playing**: Verify video ID and YouTube API loading
3. **Plotly not rendering**: Ensure Plotly script is loaded before use
4. **Monaco Editor errors**: Check @monaco-editor/react installation

### **Future Enhancement Ideas**

- [ ] User authentication and progress sync
- [ ] Cloud storage for lessons
- [ ] More exercise types (drag-and-drop, matching)
- [ ] Collaborative features
- [ ] Analytics and progress reporting
- [ ] Mobile app versions
- [ ] Offline lesson creation tools

---

## 🎯 **Features**

- **Seamless Video + Exercise Flow**: Video plays normally, auto-pauses at checkpoints, and exercises appear as fullscreen overlays
- **Interactive Exercises**: Four types of interactive content:
  - **Code**: Python code execution with Monaco Editor and Pyodide
  - **Quiz**: Multiple choice questions with immediate feedback
  - **Simulation**: Interactive supply-demand economics simulation
  - **ML**: In-browser machine learning with gradient descent
- **Progress Tracking**: Automatic progress saving to localStorage
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Offline-First**: All external libraries loaded from free CDNs

## Tech Stack

- **Frontend**: Next.js 14 + React 18
- **Styling**: TailwindCSS
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Python Runtime**: Pyodide (loaded from CDN)
- **Video**: YouTube IFrame API
- **Visualizations**: Plotly.js (loaded from CDN)
- **No Backend**: Pure client-side application

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd interactive-edu
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Deployment

This application is ready for deployment on Vercel, Render, or any other Node.js hosting platform.

### Quick Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ankurrawatll/Ytvideo_exercise)

### Manual Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to:
- **Vercel** (Recommended - Automatic deployments, global CDN)
- **Render** (Free tier available, easy setup)
- **Other platforms** (Netlify, Railway, etc.)

## Project Structure

```
interactive-edu/
├── components/           # React components
│   ├── VideoPlayer.js   # YouTube video wrapper
│   ├── CodeCell.js      # Python code execution
│   ├── QuizCard.js      # Multiple choice quizzes
│   ├── Simulation.js    # Economics simulation
│   ├── MLCell.js        # Machine learning demos
│   └── LessonPlayer.js  # Main lesson orchestrator
├── pages/               # Next.js pages
│   ├── _app.js         # App wrapper with script loading
│   └── index.js        # Main page
├── public/              # Static assets
│   └── lesson.json     # Demo lesson configuration
├── styles/              # CSS files
│   └── globals.css     # TailwindCSS + custom styles
├── package.json         # Dependencies
├── tailwind.config.js   # TailwindCSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # This file
```

## Lesson Configuration

Lessons are defined in `public/lesson.json` with this schema:

```json
[
  {
    "type": "video",
    "videoId": "kYB8IZa5AuE",
    "start": 0,
    "end": 90,
    "title": "Intro"
  },
  {
    "type": "exercise",
    "mode": "code",
    "prompt": "Enter a 2x2 matrix...",
    "starterCode": "import numpy as np\n..."
  }
]
```

### Exercise Types

- **`code`**: Python code execution with Monaco Editor
- **`quiz`**: Multiple choice with immediate feedback
- **`simulation`**: Interactive JavaScript simulation
- **`ml`**: Machine learning with gradient descent

## User Experience Flow

### Overlay-Based Learning
1. **Video plays normally** from start time to checkpoint (end time)
2. **Auto-pause at checkpoint** - video stops and shows pause indicator
3. **Exercise overlay appears** - fullscreen modal with fade-in animation
4. **Complete exercise** - learner interacts with code/quiz/simulation/ML
5. **Overlay fades out** - exercise disappears and video resumes
6. **Progress to next video** - automatically seeks to next video start time

## Component Details

### VideoPlayer
- Loads YouTube IFrame API dynamically
- Auto-plays from specified start time
- Auto-pauses at specified end time (checkpoint)
- Exposes ref methods: `playFrom()`, `resume()`, `pause()`
- Monitors playback progress every 500ms

### CodeCell
- Monaco Editor for code input
- Pyodide integration for Python execution
- Captures stdout/stderr
- Plotly integration for visualizations
- Lazy loads Pyodide only when needed

### QuizCard
- Multiple choice interface
- Immediate feedback on selection
- Requires correct answer or "Continue Anyway" option
- Visual indicators for correct/incorrect answers

### Simulation
- Supply-demand economics simulation
- Interactive sliders for curve parameters
- Real-time Plotly visualization
- Automatic equilibrium calculation

### MLCell
- Gradient descent linear regression
- Training progress visualization
- Synthetic data generation
- Dual plots: data + regression line, training loss

### ModalOverlay
- Fullscreen overlay with backdrop
- Smooth fade-in/fade-out transitions
- Prevents body scroll when open
- Close button and click-outside-to-close
- Responsive design for all screen sizes

### LessonPlayer
- Orchestrates video + exercise flow
- Manages overlay state and content
- Progress tracking and persistence
- Navigation between video steps
- Automatic exercise progression

## Customization

### Adding New Exercise Types

1. Create new component in `components/`
2. Add case in `LessonPlayer.js` renderStep function
3. Update lesson JSON schema documentation

### Modifying Lesson Content

Edit `public/lesson.json` to:
- Change video IDs and timestamps
- Modify exercise prompts and starter code
- Add/remove lesson steps
- Customize quiz questions

### Styling Changes

- Modify `tailwind.config.js` for theme customization
- Edit `styles/globals.css` for custom CSS
- Use Tailwind utility classes throughout components

## Browser Compatibility

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Required**: ES6 modules, async/await, modern CSS
- **Not supported**: Internet Explorer, older mobile browsers

## Performance Considerations

- **Pyodide**: ~50MB initial download, cached after first load
- **Monaco Editor**: Lazy loaded when code cells are accessed
- **YouTube API**: Loaded once globally
- **Plotly**: Loaded once globally

## Future Enhancements

- [ ] User authentication and progress sync
- [ ] Cloud storage for lessons
- [ ] More exercise types (drag-and-drop, matching)
- [ ] Collaborative features
- [ ] Analytics and progress reporting
- [ ] Mobile app versions
- [ ] Offline lesson creation tools

## Troubleshooting

### Common Issues

1. **Pyodide not loading**: Check internet connection and CDN availability
2. **YouTube videos not playing**: Verify video ID and YouTube API loading
3. **Plotly not rendering**: Ensure Plotly script is loaded before use
4. **Monaco Editor errors**: Check @monaco-editor/react installation

### Debug Mode

Enable browser console logging for detailed error information.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include browser console errors and steps to reproduce

---

**Built with ❤️ using Next.js, TailwindCSS, and Pyodide**
