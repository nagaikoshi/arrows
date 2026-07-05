import { useState } from 'react';
import { generateModelCourse, getCategoryIcon, estimateStayMinutes } from '../utils/api';
import { loadCurrentSpots, saveCurrentSpots } from '../utils/storage';
import './CoursePage.css';

const SUGGESTIONS = ['浅草', '京都', '鎌倉', '大阪', '箱根', '金沢', '沖縄', '札幌'];

export default function CoursePage({ onGoToPlan }) {
  const [input, setInput] = useState('');
  const [course, setCourse] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  async function generate(destination) {
    if (!destination.trim()) return;
    setIsGenerating(true);
    setError(null);
    setCourse(null);
    try {
      const result = await generateModelCourse(destination);
      setCourse(result);
    } catch {
      setError('コースの生成に失敗しました。デプロイ環境でANTHROPIC_API_KEYが設定されているか確認してください。');
    } finally {
      setIsGenerating(false);
    }
  }

  // モデルコースのスポットをプラン作成のリストに一括追加（サブ機能→コア機能の連携）
  function addCourseToplan() {
    const current = loadCurrentSpots();
    const newSpots = (course.spots || [])
      .filter(s => !current.find(c => c.name === s.name))
      .map((s, i) => ({
        id: `course-${Date.now()}-${i}`,
        name: s.name,
        address: input,
        category: s.category,
        types: [],
        icon: getCategoryIcon([], s.category),
        estimatedStayMinutes: s.estimatedStayMinutes || estimateStayMinutes([], s.category),
      }));
    saveCurrentSpots([...current, ...newSpots]);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  }

  return (
    <div className="course-page">
      <div className="course-hero">
        <h1 className="course-hero-title">どこへ行きますか？</h1>
        <p className="course-hero-sub">地名を入力するとAIが1日モデルコースを提案します</p>
      </div>

      <div className="course-form">
        <div className="course-input-row">
          <input
            className="course-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate(input)}
            placeholder="例：浅草、京都、大阪..."
          />
          <button className="course-btn" onClick={() => generate(input)} disabled={!input.trim() || isGenerating}>
            {isGenerating ? <span className="gen-spinner" /> : '提案'}
          </button>
        </div>
        <div className="course-chips">
          {SUGGESTIONS.map(s => (
            <button key={s} className="course-chip" onClick={() => { setInput(s); generate(s); }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="course-error">{error}</div>}

      {isGenerating && (
        <div className="course-loading">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>AIがモデルコースを考えています...</p>
        </div>
      )}

      {course && !isGenerating && (
        <div className="course-card">
          <div className="course-card-header">
            <div>
              <h2 className="course-title">{course.title}</h2>
              <p className="course-subtitle">{course.subtitle}</p>
            </div>
            <div className="course-meta-pills">
              {course.duration && <span className="meta-pill">{course.duration}</span>}
              {course.bestSeason && <span className="meta-pill">{course.bestSeason}</span>}
            </div>
          </div>

          <div className="course-spots">
            {(course.spots || []).map((spot, i) => (
              <div key={i} className="course-spot-row">
                <div className="course-spot-num">{i + 1}</div>
                <div className="course-spot-body">
                  <div className="course-spot-name">
                    {getCategoryIcon([], spot.category)} {spot.name}
                  </div>
                  <div className="course-spot-desc">{spot.desc}</div>
                </div>
                <div className="course-spot-stay">{spot.estimatedStayMinutes}分</div>
              </div>
            ))}
          </div>

          {course.tips?.length > 0 && (
            <div className="course-tips">
              <p className="course-tips-label">旅のアドバイス</p>
              {course.tips.map((tip, i) => <p key={i} className="course-tip-item">· {tip}</p>)}
            </div>
          )}

          <div className="course-actions">
            <button className="btn-add-to-plan" onClick={addCourseToplan}>
              {addedMessage ? '✓ 追加しました' : 'このコースをプラン作成に追加'}
            </button>
            {addedMessage && onGoToPlan && (
              <button className="btn-go-plan" onClick={onGoToPlan}>プラン作成へ →</button>
            )}
          </div>
        </div>
      )}

      {!course && !isGenerating && !error && (
        <div className="course-empty">
          <div className="course-empty-icon">🧭</div>
          <p>旅先を入力して、AIにおまかせコースを提案してもらいましょう</p>
        </div>
      )}
    </div>
  );
}
