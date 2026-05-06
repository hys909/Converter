import React from 'react';

export default function Calculator({ onKeypad, style }) {
  const keys = [
    ['C', '←', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const getStyle = (key) => {
    if (['÷', '×', '-', '+', '='].includes(key)) return 'ops-key';
    if (['C', '←', '%'].includes(key)) return 'func-key';
    return 'num-key';
  };

  return (
    <div className="keypad" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '25px', ...style }}>
      {keys.flat().map((key) => (
        <button 
          key={key} 
          className={getStyle(key)}
          onClick={() => onKeypad(key)}
          style={{
            gridColumn: key === '0' ? 'span 2' : 'span 1',
            height: '65px', fontSize: '1.8rem', color: '#fff', border: 'none', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontWeight: '500', cursor: 'pointer',
            backgroundColor: getStyle(key) === 'ops-key' ? '#ff9f0a' : (getStyle(key) === 'func-key' ? '#a5a5a5' : '#505050')
          }}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
