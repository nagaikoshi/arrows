// プランの保存・読み込み（localStorage）

const STORAGE_KEY = 'arrows_saved_plans';
const SPOTS_KEY = 'arrows_current_spots';

export function loadSavedPlans() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function savePlan(plan) {
  const plans = loadSavedPlans();
  const newPlan = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...plan,
  };
  plans.unshift(newPlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.slice(0, 20))); // 最大20件
  return newPlan;
}

export function deletePlan(id) {
  const plans = loadSavedPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plans;
}

// 編集中のスポットリストを自動保存（リロードしても消えない）
export function loadCurrentSpots() {
  try {
    return JSON.parse(localStorage.getItem(SPOTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCurrentSpots(spots) {
  localStorage.setItem(SPOTS_KEY, JSON.stringify(spots));
}
