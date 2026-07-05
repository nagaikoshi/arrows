import { useState } from 'react';
import PlanPage from './pages/PlanPage';
import CoursePage from './pages/CoursePage';
import SavedPage from './pages/SavedPage';
import './styles/global.css';
import './App.css';

const TABS = [
  { id: 'plan', label: '旅程を作る' },
  { id: 'course', label: 'モデルコース' },
  { id: 'saved', label: '保存済み' },
];

export default function App() {
  const [tab, setTab] = useState('plan');

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <div className="app-logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M9 3l6 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="app-logo-text">arrows</span>
          </div>
          <nav className="app-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`app-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'plan' && <PlanPage key="plan" />}
        {tab === 'course' && <CoursePage onGoToPlan={() => setTab('plan')} />}
        {tab === 'saved' && <SavedPage />}
      </main>

      <footer className="app-footer">
        <p>arrows — AI travel planner prototype</p>
      </footer>
    </div>
  );
}
