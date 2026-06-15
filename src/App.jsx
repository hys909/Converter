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
    // 運算前必須移除逗號並處理可能的運算式
    const cleanDisplay = displayValue.replace(/,/g, '');
    let twdAmount;
    
    try {
      // 若包含運算符，先計算出結果，否則直接解析
      const expression = cleanDisplay.replace(/×/g, '*').replace(/÷/g, '/');
      twdAmount = eval(expression);
    } catch {
      twdAmount = parseFloat(cleanDisplay) || 0;
    }
    
    // 計算匯率
    const baseTwd = activeIdx === 0 ? twdAmount : (twdAmount / (rates[currencyData[activeIdx].code] || 1));
    setAmounts(calculateAmounts(baseTwd));
  }, [displayValue, activeIdx, currencyData, rates]);

  const [isNewInput, setIsNewInput] = useState(true);

  const formatThousands = (numStr) => {
    // 分離小數點與整數
    const parts = numStr.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleKeypad = (key) => {
    if (key >= '0' && key <= '9' || key === '.') {
      if (isNewInput) {
          setDisplayValue(key === '.' ? '0.' : formatThousands(key));
          setIsNewInput(false);
      } else {
          setDisplayValue(prev => {
              const cleanPrev = prev.replace(/,/g, '');
              const nextVal = cleanPrev === '0' && key !== '.' ? key : cleanPrev + key;
              return formatThousands(nextVal);
          });
      }
    } 
    else if (['+', '-', '×', '÷'].includes(key)) {
      setIsNewInput(false);
      // 輸入運算符時不自動加逗號，但在顯示上保持原狀
      setDisplayValue(prev => prev.replace(/,/g, '') + key);
    }
    else if (key === '%') {
      setDisplayValue(prev => {
        const cleanPrev = prev.replace(/,/g, '');
        const parts = cleanPrev.split(/[\+\-×÷]/);
        const lastPart = parts[parts.length - 1];
        const processed = (parseFloat(lastPart) / 100).toString();
        return formatThousands(cleanPrev.slice(0, -lastPart.length) + processed);
      });
    }
    else if (key === 'C') {
      setDisplayValue('0');
      setIsNewInput(true);
    } else if (key === '←') {
      setDisplayValue(prev => {
        const cleanPrev = prev.replace(/,/g, '');
        const newExpr = cleanPrev.length > 1 ? cleanPrev.slice(0, -1) : '0';
        return formatThousands(newExpr);
      });
    } 
    else if (key === '=') {
      try { 
        // 運算前強制移除所有逗號
        const cleanExpr = displayValue.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(cleanExpr);
        setDisplayValue(formatThousands(result.toString())); 
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
          <header className="header" style={{display:'flex', flexDirection:'column', marginBottom:'15px', padding:'0 30px'}}>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{fontSize:'1.8rem', fontWeight:'bold', marginBottom:'8px'}}>Converter Taiwan</div>
            </div>
            <div style={{fontSize:'1.0rem', color:'#4cd964', fontFamily:'monospace', display: 'flex', justifyContent: 'space-between'}}>
                {new Date().toLocaleDateString('zh-TW')} {currentTime}
                <span>瀏覽人數: {clickCount}</span>
            </div>
            <div style={{fontSize:'0.7rem', color:'#888', marginTop:'2px', textAlign:'right'}}>
                * 顯示市場中價位匯率
            </div>
          </header>
          
          <div className="currency-list" style={{ flex: 1, overflowY: "auto", paddingTop: "0px", paddingBottom: "5px" }}>
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
          <div style={{height: '20px'}}></div>
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
