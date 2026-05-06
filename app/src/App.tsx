import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Assessment from './pages/Assessment'
import AssessmentResults from './pages/AssessmentResults'
import StoriesPage from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import ChallengesPage from './pages/Challenges'
import CommunityPage from './pages/Community'
import GuidesPage from './pages/Guides'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import CrisisHelplinePage from './pages/CrisisHelpline'
import DisclaimerPage from './pages/Disclaimer'
import PrivacyPolicyPage from './pages/PrivacyPolicy'
import PolicyPage from './pages/Policy'
import RulesPage from './pages/Rules'
import ProgressPage from './pages/Progress'

export default function App() {
  return (
    <>
      {/* --- GLOBAL WAVY BACKGROUND --- */}
      <div className="fixed inset-0 z-[-1] bg-sky-200">
        {/* SVG Wave dividing the screen */}
        <svg 
          className="absolute bottom-0 w-full h-[55vh]" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#86efac" /* Tailwind's light green (green-300) */
            fillOpacity="1" 
            d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,160C672,139,768,117,864,122.7C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="assessment/results" element={<AssessmentResults />} />
          <Route path="assessment/history" element={<ProgressPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="stories/:id" element={<StoryDetail />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="challenges/progress" element={<ProgressPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="guides/:category" element={<GuidesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="crisis-helpline" element={<CrisisHelplinePage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="policy" element={<PolicyPage />} />
          <Route path="rules" element={<RulesPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}