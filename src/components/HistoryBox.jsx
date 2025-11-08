import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../utils/history';

function HistoryBox() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);

  // Load history when the component mounts or the user changes
  useEffect(() => {
    if (currentUser) {
      setHistory(getUserHistory(currentUser));
    } else {
      setHistory([]);
    }
  }, [currentUser]);

  return (
    <div className="box">
      <h3>History</h3>
      <div id="historyList" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem', background: '#f9f9f9' }}>
        {history.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Your history will appear here.
          </p>
        ) : (
          history.map((item, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
              <strong style={{ fontSize: '0.9rem' }}>{item.type}</strong>
              <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.result}</p>
            </div>
          ))
        )}
      </div>
      {/* The old buttons are not functional in this setup */}
    </div>
  );
}

export default HistoryBox;