import { useState, useEffect } from 'react';
import SpotSearch from '../components/SpotSearch';
import SpotCard from '../components/SpotCard';
import Timeline from '../components/Timeline';
import { generateItinerary } from '../utils/api';
import { savePlan, loadCurrentSpots, saveCurrentSpots } from '../utils/storage';
import './PlanPage.css';

const TODAY = new Date().toISOString().split('T')[0];

export default function PlanPage() {
  const [spots, setSpots] = useState(loadCurrentSpots);
  const [conditions, setConditions] = useState({
    date: TODAY,
    startTime: '10:00',
    endTime: '20:00',
    transport: 'transit',
    pace: '標準',
    people: 2,
  });
  const [itinerary, setItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  // スポットリストは自動保存（リロードしても消えない）
  useEffect(() => { saveCurrentSpots(spots); }, [spots]);

  function addSpot(spot) {
    setSpots(prev => prev.find(s => s.id === spot.id) ? prev : [...prev, spot]);
  }

  function removeSpot(id) {
    setSpots(prev => prev.filter(s => s.id !== id));
  }

  function moveSpot(from, to) {
    setSpots(prev => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function setCondition(key, value) {
    setConditions(prev => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setItinerary(null);
    try {
      const result = await generateItinerary(spots, conditions);
      setItinerary(result);
    } catch (err) {
      setError(`行程の生成に失敗しました: ${err.message || '不明なエラー'}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    savePlan({ spots, conditions, itinerary });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  }

  return (
    <div className="plan-page">
      <section className="plan-section">
        <label className="section-label">行きたいスポットを追加</label>
        <SpotSearch onAdd={addSpot} />
      </section>

      {spots.length > 0 && (
        <section className="plan-section">
          <label className="section-label">
            スポットリスト
            <span className="spot-count">{spots.length}</span>
          </label>
          <div className="spot-list">
            {spots.map((spot, i) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                index={i}
                total={spots.length}
                onRemove={removeSpot}
                onMove={moveSpot}
              />
            ))}
          </div>
        </section>
      )}

      <section className="plan-section">
        <label className="section-label">旅行条件</label>
        <div className="conditions-grid">
          <div className="condition-field">
            <label>旅行日</label>
            <input type="date" value={conditions.date} onChange={e => setCondition('date', e.target.value)} />
          </div>
          <div className="condition-field">
            <label>移動手段</label>
            <select value={conditions.transport} onChange={e => setCondition('transport', e.target.value)}>
              <option value="transit">電車・バス</option>
              <option value="walking">徒歩</option>
              <option value="driving">車</option>
              <option value="cycling">自転車</option>
            </select>
          </div>
          <div className="condition-field">
            <label>出発時間</label>
            <select value={conditions.startTime} onChange={e => setCondition('startTime', e.target.value)}>
              {['08:00','09:00','10:00','11:00','12:00'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="condition-field">
            <label>終了時間</label>
            <select value={conditions.endTime} onChange={e => setCondition('endTime', e.target.value)}>
              {['17:00','18:00','19:00','20:00','21:00','22:00'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="condition-field">
            <label>ペース</label>
            <select value={conditions.pace} onChange={e => setCondition('pace', e.target.value)}>
              <option>ゆっくり</option>
              <option>標準</option>
              <option>活発</option>
            </select>
          </div>
          <div className="condition-field">
            <label>人数</label>
            <select value={conditions.people} onChange={e => setCondition('people', Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}名</option>)}
            </select>
          </div>
        </div>
      </section>

      <button
        className="btn-generate"
        onClick={handleGenerate}
        disabled={spots.length === 0 || isGenerating}
      >
        {isGenerating ? (
          <><span className="gen-spinner" />AIが最適ルートを計算中...</>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z"/>
            </svg>
            AIで行程を生成
          </>
        )}
      </button>

      {spots.length === 0 && (
        <p className="plan-hint">スポットを検索して追加すると、AIが最適な行程を組み立てます</p>
      )}

      {error && <div className="plan-error">{error}</div>}

      {itinerary && (
        <section className="plan-section">
          <div className="result-header">
            <label className="section-label">生成された行程</label>
            <button className="btn-save" onClick={handleSave}>
              {savedMessage ? '✓ 保存しました' : 'プランを保存'}
            </button>
          </div>
          <Timeline
            itinerary={itinerary.itinerary}
            transits={itinerary.transits}
            summary={itinerary.summary}
          />
        </section>
      )}
    </div>
  );
}
