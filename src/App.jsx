import React, { useState, useEffect } from 'react';
import './styles/theme.css?v=2';
import CurrencySelector from './components/CurrencySelector';
import Calculator from './components/Calculator';
import { currencies } from './constants/currencies';

function App() {
  const [page, setPage] = useState('main');
  const [clickCount, setClickCount] = useState(() => {
    const saved = localStorage.getItem('appClickCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    localStorage.setItem('appClickCount', newCount.toString());
  }, []);

  const [selectedRow, setSelectedRow] = useState(null);
  const [currencyData, setCurrencyData] = useState([
    { code: 'TWD', flag: 'tw' }, { code: 'USD', flag: 'us' },
    { code: 'JPY', flag: 'jp' }, { code: 'CNY', flag: 'cn' }, { code: 'KRW', flag: 'kr' }
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayValue, setDisplayValue] = useState('1');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [rates, setRates] = useState({ TWD: 1 });

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/TWD')
      .then(res => res.json())
      .then(data => setRates(data.rates))
      .catch(err => console.error("匯率獲取失敗:", err));
      
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateAmounts = (twdAmount) => {
    return currencyData.map(item => {
      const rate = rates[item.code] || 1;
      return (parseFloat(twdAmount) * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    });
  };

  const [amounts, setAmounts] = useState(calculateAmounts('1'));

  useEffect(() => {
    const twdAmount = activeIdx === 0 ? displayValue : (parseFloat(displayValue.replace(/,/g, '')) / (rates[currencyData[activeIdx].code] || 1));
    setAmounts(calculateAmounts(twdAmount));
  }, [displayValue, activeIdx, currencyData, rates]);

  const [isNewInput, setIsNewInput] = useState(true);

  const handleKeypad = (key) => {
    if (key >= '0' && key <= '9' || key === '.') {
      if (isNewInput) {
          setDisplayValue(key === '.' ? '0.' : key);
          setIsNewInput(false);
      } else {
          setDisplayValue(prev => prev + key);
      }
    } 
    else if (['+', '-', '×', '÷'].includes(key)) {
      setIsNewInput(false);
      setDisplayValue(prev => prev + key);
    }
    else if (key === '%') {
      setDisplayValue(prev => {
        const parts = prev.split(/[\+\-×÷]/);
        const lastPart = parts[parts.length - 1];
        const processed = (parseFloat(lastPart) / 100).toString();
        return prev.slice(0, -lastPart.length) + processed;
      });
    }
    else if (key === 'C') {
      setDisplayValue('0');
      setIsNewInput(true);
    } else if (key === '←') {
      setDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } 
    else if (key === '=') {
      try { 
        const expression = displayValue.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(expression);
        setDisplayValue(result.toString()); 
        setIsNewInput(true);
      } catch { 
        setDisplayValue('Error'); 
        setIsNewInput(true);
      }
    }
  };

  const selectRow = (idx) => {
    setActiveIdx(idx);
    setDisplayValue('1');
    setIsNewInput(true);
  };

  return (
    <div className="app-container-v2">
      {page === 'main' ? (
        <div id="main-page">
          <header className="header" style={{display:'flex', flexDirection:'column', marginBottom:'25px', padding:'0 30px'}}>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{fontSize:'1.8rem', fontWeight:'bold', marginBottom:'8px'}}>Converter Taiwan</div>
            </div>
            <div style={{fontSize:'1.1rem', color:'#4cd964', fontFamily:'monospace', display: 'flex', justifyContent: 'space-between'}}>
                {new Date().toLocaleDateString('zh-TW')} {currentTime}
                <span>點擊率: {clickCount}</span>
            </div>
          </header>
          
          <div className="currency-list" style={{ flex: 1, overflowY: "auto", paddingBottom: "10px" }}>
            {currencyData.map((item, idx) => (
              <div key={idx} className={`currency-item ${activeIdx === idx ? 'active-row' : ''}`} onClick={() => selectRow(idx)}>
                <div className="box-style" onClick={() => { setSelectedRow(idx); setPage('selector'); }}>
                  <img src={`https://flagcdn.com/w40/${item.flag}.png`} width="32" height="32" style={{borderRadius:'50%', objectFit: 'cover', flexShrink: 0}} alt={item.code} />
                  <span style={{marginLeft:'10px', fontWeight:'bold'}}>{item.code}</span>
                </div>
                <div className="box-style">
                  {activeIdx === idx ? displayValue : amounts[idx]}
                </div>
              </div>
            ))}
          </div>
          <Calculator onKeypad={handleKeypad} />
        </div>
      ) : (
        <CurrencySelector onSelect={(c) => { 
            const d = [...currencyData]; d[selectedRow] = {code: c.code, flag: c.flag}; setCurrencyData(d); setPage('main'); 
        }} onClose={() => setPage('main')} />
      )}
    </div>
  );
}
export default App;
