import { useState } from 'react';
import Timeline from '../components/Timeline';
import { loadSavedPlans, deletePlan } from '../utils/storage';
import './SavedPage.css';

export default function SavedPage() {
  const [plans, setPlans] = useState(loadSavedPlans);
  const [openId, setOpenId] = useState(null);

  function handleDelete(e, id) {
    e.stopPropagation();
    setPlans(deletePlan(id));
    if (openId === id) setOpenId(null);
  }

  if (plans.length === 0) {
    return (
      <div className="saved-page">
        <div className="saved-empty">
          <div className="saved-empty-icon">🗂️</div>
          <p>保存したプランはまだありません</p>
          <p className="saved-empty-sub">「旅程を作る」で行程を生成して保存すると、ここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <label className="section-label">保存したプラン</label>
      <div className="saved-list">
        {plans.map(plan => {
          const isOpen = openId === plan.id;
          const date = plan.conditions?.date || '';
          const spotNames = (plan.spots || []).map(s => s.name).slice(0, 3).join('、');
          return (
            <div key={plan.id} className={`saved-card ${isOpen ? 'open' : ''}`}>
              <button className="saved-card-header" onClick={() => setOpenId(isOpen ? null : plan.id)}>
                <div className="saved-card-info">
                  <div className="saved-card-date">{date}</div>
                  <div className="saved-card-spots">
                    {spotNames}{(plan.spots || []).length > 3 ? ` 他${plan.spots.length - 3}件` : ''}
                  </div>
                </div>
                <div className="saved-card-actions">
                  <button className="saved-delete" onClick={e => handleDelete(e, plan.id)} aria-label="削除">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className={`saved-chevron ${isOpen ? 'open' : ''}`}>▾</span>
                </div>
              </button>

              {isOpen && plan.itinerary && (
                <div className="saved-card-body">
                  <Timeline
                    itinerary={plan.itinerary.itinerary}
                    transits={plan.itinerary.transits}
                    summary={plan.itinerary.summary}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
