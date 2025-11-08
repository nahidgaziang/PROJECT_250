// A key for all history in localStorage
const HISTORY_DB_KEY = "readefyHistoryDB";

// Get all history for the currently logged-in user (email)
export const getUserHistory = (userEmail) => {
  if (!userEmail) return [];
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_DB_KEY)) || {};
  return allHistory[userEmail] || [];
};

// Add a new item to a user's history
export const addUserHistory = (userEmail, historyItem) => {
  if (!userEmail) return;
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_DB_KEY)) || {};
  
  if (!allHistory[userEmail]) {
    allHistory[userEmail] = [];
  }
  
  // Add new item to the front of the array
  allHistory[userEmail].unshift(historyItem);
  
  // Optional: Limit history to 50 items
  if (allHistory[userEmail].length > 50) {
    allHistory[userEmail].pop();
  }

  localStorage.setItem(HISTORY_DB_KEY, JSON.stringify(allHistory));
};