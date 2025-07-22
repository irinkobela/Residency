# 🧠 Medical Study Web App – Residency Prep

An interactive, modern, and effective web application designed to help medical students and residents master exam material through engaging, science-backed study methods.

## 📌 Project Vision

To provide an efficient, focused study tool that transforms the difficult process of memorization into a more intuitive and less stressful experience. By leveraging active recall, immediate feedback, and intelligent review systems, this application aims to improve long-term retention and boost user confidence for high-stakes medical exams.

---

## 🗺️ Development Roadmap

This project will be developed in three distinct phases, starting with a core functional product and progressively adding advanced features.

---

### Phase 1: Minimum Viable Product (MVP) - Core Functionality

The goal of this phase is to build a usable, focused study tool with all the essential features.

✅ **Single Question View**  
Displays one question at a time to minimize cognitive load, with a persistent progress tracker (e.g., “Question 1 of 2744”).

✅ **Interactive Answering**  
All answer options are presented as clickable buttons.

✅ **Immediate Feedback System**  
- Correct selection: Highlights the button in green.  
- Incorrect selection: Highlights the clicked button in red and simultaneously highlights the correct answer in green.  
- Answer Locking: All answer buttons for the current question are disabled after the first selection.

✅ **Explanation Reveal**  
- The explanation is hidden by default to encourage active recall.  
- It can be revealed by either clicking an "Explanation" button or clicking the main card area.

✅ **Core Navigation**  
Functional "Previous" and "Next" buttons to move through the question set.

✅ **Data Loading**  
The application will successfully load and parse all questions from the local questions.json file on startup.

---

### Phase 2: Enhanced Study & Personalization

This phase focuses on adding features that allow users to personalize their study sessions and improve the user experience.

🏷️ **Unified Tagging & Filtering System**  
- Implement a system to filter questions based on the `tags` field in the JSON data (e.g., "Cardiology", "Pharmacology").  
- Users can select multiple tags to create custom study sets.

⭐ **Bookmarking**  
- Allow users to "star" or bookmark any question.  
- A dedicated "Bookmarked" filter will allow for quick review of these saved questions.

🔎 **Search Functionality**  
- Implement a search bar to instantly find questions containing specific keywords (e.g., "furosemide", "AV block").

🌙 **UI/UX Enhancements**  
- **Dark Mode**: A toggle for comfortable night-time studying.  
- **Accessibility Controls**: Simple buttons to increase or decrease the text font size.

---

### Phase 3: Advanced Learning & Gamification

This phase transforms the tool into an intelligent learning partner by incorporating advanced features and gamification.

🧠 **Smart Review Deck (Spaced Repetition System)**  
- Automatically add any incorrectly answered question to a "Review Deck".  
- Implement a "Flashcard Mode" where users can rate their confidence ("Hard", "Medium", "Easy") after seeing the answer.  
- The system will use this data to prioritize showing "Hard" questions more frequently, automating spaced repetition.

📊 **Progress Tracking Dashboard**  
- A visual dashboard showing overall completion percentage and accuracy statistics.  
- Track stats per tag to identify weak areas.  
- Implement a "study streak" counter to encourage consistent use.

⌨️ **Keyboard Shortcuts**  
- Enable full navigation and interaction via the keyboard:  
  - Arrow keys for next/previous  
  - Number keys for answers  
  - Spacebar for explanation flip  

---

## 🛠️ Technical Architecture

**Frontend Framework**: React.js (or a similar modern library like Vue.js) for building a reactive and modular user interface.  
**Styling**: Tailwind CSS for rapid, utility-first styling to maintain a clean and modern look.  
**Data Management**: All question content will be managed via a static JSON file (`questions.json`).

### State & Persistence

The application state (current question, etc.) will be managed within React.  
User-specific data will be persisted in the browser's `localStorage`. This includes:
- The ID of the last viewed question.
- A list of all bookmarked question IDs.
- The list of question IDs in the "Review Deck".
- All progress and accuracy statistics.
- UI settings (Dark Mode state, font size).

### Offline Capability

- The application will be structured as a Progressive Web App (PWA).  
- Service Workers will be used to cache the application shell and all JSON data, enabling full offline functionality after the first visit.

---

## 📁 Finalized JSON Data Schema

Each question object in `questions.json` must adhere to the following structure. The `tags` array is essential for the filtering functionality.

```json
{
  "id": "00001",
  "question": "What is characteristic of AV block?",
  "answers": [
    { "text": "QRS prolongation", "isCorrect": false },
    { "text": "PQ prolongation", "isCorrect": true },
    { "text": "QT prolongation", "isCorrect": false },
    { "text": "R wave deformity", "isCorrect": false }
  ],
  "explanation": "AV block is diagnosed by prolonged PQ interval, indicating slowed conduction through the AV node.",
  "tags": ["Cardiology", "ECG"]
}
```

---

## 🔐 License

This project is distributed under the MIT License. It is free for personal, academic, and commercial use. See the LICENSE file for more details.