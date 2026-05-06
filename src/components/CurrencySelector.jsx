import React, { useState } from 'react';
import { currencies } from '../constants/currencies';

export default function CurrencySelector({ onSelect, onClose }) {
  const [filter, setFilter] = useState('');

  const filtered = currencies.filter(c => 
    c.name.includes(filter) || c.code.includes(filter.toUpperCase())
  );

  return (
    <div className="selector-page">
      <div className="selector-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', position: 'absolute', left: '0' }}>〈</button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: '0' }}>貨幣</h2>
      </div>
      <input 
        type="text" 
        className="search-bar" 
        placeholder="搜尋" 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{width:'100%', padding:'12px', borderRadius:'12px', background:'#333', border:'none', color:'#fff', marginBottom:'20px'}}
      />
      <div className="selector-list">
        {filtered.map(c => (
          <div key={c.code} className="selector-row" onClick={() => onSelect(c)} style={{display:'flex', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #222', cursor:'pointer'}}>
            <span style={{marginRight:'10px', visibility:'hidden'}}>      </span>
            <img src={`https://flagcdn.com/w40/${c.flag}.png`} width="32" height="32" style={{borderRadius:'50%', marginRight:'10px'}} alt={c.code} />
            <span style={{flex:1, textAlign:'left', paddingLeft:'5px'}}>{c.name}</span>
            <span style={{fontFamily:'Courier New, monospace', fontWeight:'bold'}}>{c.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
