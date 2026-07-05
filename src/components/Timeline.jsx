import './Timeline.css';

export default function Timeline({ itinerary = [], transits = [], summary }) {
  return (
    <div className="timeline">
      {summary && <div className="timeline-summary">{summary}</div>}

      <div className="timeline-list">
        {itinerary.map((item, i) => {
          const transit = transits.find(t => t.from === i);
          const isLast = i === itinerary.length - 1;
          return (
            <div key={i} className="tl-block" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="tl-row">
                <span className="tl-time">{item.time}</span>
                <div className="tl-track">
                  <div className="tl-dot" />
                  {!isLast && <div className="tl-line" />}
                </div>
                <div className="tl-card">
                  <div className="tl-card-header">
                    <span className="tl-name">{item.name}</span>
                    <span className="tl-duration">{item.duration}</span>
                  </div>
                  {item.tip && <p className="tl-tip">{item.tip}</p>}
                  {item.tags?.length > 0 && (
                    <div className="tl-tags">
                      {item.tags.map((tag, ti) => <span key={ti} className="tl-tag">{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>

              {transit && !isLast && (
                <div className="tl-transit">
                  <span className="tl-transit-label">
                    ↓ {transit.method} 約{transit.minutes}分
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
