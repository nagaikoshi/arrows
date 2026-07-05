import './SpotCard.css';

export default function SpotCard({ spot, index, total, onRemove, onMove }) {
  return (
    <div className="spot-card">
      <div className="spot-card-order">
        <button
          className="order-btn"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          aria-label="上へ"
        >▲</button>
        <button
          className="order-btn"
          onClick={() => onMove(index, index + 1)}
          disabled={index === total - 1}
          aria-label="下へ"
        >▼</button>
      </div>

      <div className="spot-card-icon">{spot.icon || '📌'}</div>

      <div className="spot-card-body">
        <div className="spot-card-name">{spot.name}</div>
        <div className="spot-card-meta">
          <span>{spot.address}</span>
          {spot.category && <><span className="meta-dot">·</span><span>{spot.category}</span></>}
          {spot.estimatedStayMinutes && <><span className="meta-dot">·</span><span>約{spot.estimatedStayMinutes}分</span></>}
        </div>
      </div>

      {spot.rating && (
        <div className="spot-card-rating">
          <span className="rating-star">★</span>
          <span>{Number(spot.rating).toFixed(1)}</span>
        </div>
      )}

      <button className="spot-card-remove" onClick={() => onRemove(spot.id)} aria-label="削除">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
