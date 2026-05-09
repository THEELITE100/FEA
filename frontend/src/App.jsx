import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=SF+Mono:wght@400;500&display=swap');

  :root {
    --bg-base: #000000;
    --bg-panel: #0A0A0A;
    --border-color: #1F1F1F;
    --text-main: #EAEAEA;
    --text-muted: #666666;
    --gold: #C5A059;
    --gold-hover: #DBC38B;
    --danger: #9E2A2B;
    --danger-hover: #7A1D1D;
  }

  body {
    margin: 0;
    background-color: var(--bg-base);
    color: var(--text-main);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes cinematicFade {
    from { opacity: 0; transform: translateY(10px); filter: brightness(0.5); }
    to { opacity: 1; transform: translateY(0); filter: brightness(1); }
  }
  .animate-cinematic { animation: cinematicFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }

  .luxury-scroll::-webkit-scrollbar { width: 4px; }
  .luxury-scroll::-webkit-scrollbar-track { background: var(--bg-base); }
  .luxury-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 0px; }
  .luxury-scroll::-webkit-scrollbar-thumb:hover { background: var(--gold); }

  .vip-row { transition: background-color 0.3s ease; }
  .vip-row:hover { background-color: #111111; }

  .btn-gold {
    background-color: var(--gold);
    color: #000000;
    border: 1px solid var(--gold);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .btn-gold:hover:not(:disabled) {
    background-color: var(--gold-hover);
    border-color: var(--gold-hover);
    box-shadow: 0 0 15px rgba(197, 160, 89, 0.2);
    transform: translateY(-1px);
  }
  
  .btn-danger {
    background-color: transparent;
    color: var(--danger);
    border: 1px solid var(--danger);
    transition: all 0.3s ease;
  }
  .btn-danger:hover:not(:disabled) {
    background-color: var(--danger);
    color: #FFFFFF;
    box-shadow: 0 0 15px rgba(158, 42, 43, 0.2);
  }

  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
document.head.appendChild(styleSheet);

function App() {
  const [invoices, setInvoices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [lastEmail, setLastEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); 

  const fetchData = async () => {
    try {
      const invRes = await axios.get('http://localhost:8000/invoices');
      setInvoices(invRes.data);
      const logRes = await axios.get('http://localhost:8000/logs');
      setLogs(logRes.data);
    } catch (error) {
      console.error("Data fetch error:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async (invoice) => {
    setLoadingId(invoice.invoice_no);
    setLastEmail(null);
    try {
      const res = await axios.post('http://localhost:8000/process-email', invoice);
      if (res.data.status === "ESCALATED") {
        setLastEmail({ type: 'error', text: `RESTRICTED ACTION: Invoice ${invoice.invoice_no} breached the 30-day threshold. Transferred to legal division.`, invoice: invoice.invoice_no });
      } else {
        setLastEmail({ type: 'success', text: res.data.content, invoice: invoice.invoice_no });
      }
      fetchData();
    } catch (error) {
      setLastEmail({ type: 'error', text: "Secure connection timeout. Failsafe generation active." });
    }
    setLoadingId(null);
  };

  const formatRupee = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div style={{ padding: '60px 5%', boxSizing: 'border-box', minHeight: '100vh' }}>
      
      <header className="animate-cinematic" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '2.4rem', fontWeight: '400', letterSpacing: '0.2em', textTransform: 'uppercase', 
          color: 'var(--text-main)', margin: '0 0 12px 0' 
        }}>
          Financial <span style={{ color: 'var(--gold)', fontWeight: '300' }}>Agent</span>
        </h1>
        <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--gold)', margin: '0 auto 16px auto' }}></div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Automated Eamil Follow Up
        </p>
      </header>

      <div className="animate-cinematic" style={{ animationDelay: '0.1s', display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
        <div style={{ 
          display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '40px'
        }}>
          <button 
            onClick={() => setActiveTab('queue')}
            style={{
              background: 'transparent', color: activeTab === 'queue' ? 'var(--gold)' : 'var(--text-muted)',
              border: 'none', borderBottom: activeTab === 'queue' ? '2px solid var(--gold)' : '2px solid transparent',
              padding: '0 10px 16px 10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', 
              letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s ease', transform: 'translateY(1px)'
            }}
          >
            Routing Queue
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            style={{
              background: 'transparent', color: activeTab === 'audit' ? 'var(--gold)' : 'var(--text-muted)',
              border: 'none', borderBottom: activeTab === 'audit' ? '2px solid var(--gold)' : '2px solid transparent',
              padding: '0 10px 16px 10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', 
              letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s ease', transform: 'translateY(1px)'
            }}
          >
            Audit Ledger
          </button>
        </div>
      </div>

      {activeTab === 'queue' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div className="animate-cinematic" style={{ animationDelay: '0.2s', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="luxury-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 10, boxShadow: '0 1px 0 var(--border-color)' }}>
                  <tr>
                    <Th>Client Identifier</Th>
                    <Th>Reference</Th>
                    <Th>Status</Th>
                    <Th align="right">Directive</Th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const isDanger = inv.overdue_days > 30;
                    const isLoading = loadingId === inv.invoice_no;

                    return (
                      <tr key={inv.invoice_no} className="vip-row" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '24px 30px' }}>
                          <div style={{ fontWeight: '400', fontSize: '0.95rem', letterSpacing: '0.02em', color: 'var(--text-main)' }}>
                            {inv.client_name}
                          </div>
                        </td>
                        <td style={{ padding: '24px 30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <span style={{ fontFamily: '"SF Mono", "Consolas", monospace', letterSpacing: '0.05em' }}>{inv.invoice_no}</span> 
                          <span style={{ margin: '0 12px', color: '#333' }}>|</span> 
                          <span style={{ color: 'var(--text-main)' }}>{formatRupee(inv.amount)}</span>
                        </td>
                        <td style={{ padding: '24px 30px' }}>
                          <span style={{ 
                            color: isDanger ? 'var(--danger)' : 'var(--text-muted)', 
                            fontSize: '0.75rem', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase'
                          }}>
                            {inv.overdue_days} Days
                          </span>
                        </td>
                        <td style={{ padding: '24px 30px', textAlign: 'right' }}>
                          <button 
                            className={`btn ${isDanger ? "btn-danger" : "btn-gold"}`}
                            onClick={() => handleProcess(inv)} 
                            disabled={isLoading}
                            style={{ 
                              padding: '10px 24px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.1em',
                              borderRadius: '2px', cursor: isLoading ? 'wait' : 'pointer', textTransform: 'uppercase',
                              minWidth: '160px'
                            }}
                          >
                            {isLoading ? 'Processing...' : (isDanger ? 'Flag Legal' : 'Execute Agent')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {lastEmail && (
            <div className="animate-cinematic" style={{ 
              marginTop: '40px', background: 'var(--bg-panel)', padding: '40px', 
              border: '1px solid var(--border-color)', borderRadius: '4px',
              borderTop: `2px solid ${lastEmail.type === 'error' ? 'var(--danger)' : 'var(--gold)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: lastEmail.type === 'error' ? 'var(--danger)' : 'var(--gold)' }}></div>
                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {lastEmail.type === 'error' ? 'System Notification' : `Transmission Draft: ${lastEmail.invoice}`}
                </h3>
              </div>
              <pre style={{ 
                whiteSpace: 'pre-wrap', fontFamily: '"SF Mono", "Consolas", monospace', fontSize: '0.85rem', 
                lineHeight: '1.8', color: '#AAAAAA', margin: 0 
              }}>
                {lastEmail.text}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="animate-cinematic" style={{ animationDelay: '0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-main)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure Ledger</h2>
            <span style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{logs.length} RECORDS</span>
          </div>

          <div className="luxury-scroll animate-cinematic" style={{ animationDelay: '0.3s', height: '65vh', overflowY: 'auto', paddingRight: '16px' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No operations recorded</div>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="vip-row" style={{ 
                  background: 'var(--bg-panel)', padding: '24px', marginBottom: '16px', borderRadius: '4px',
                  border: '1px solid var(--border-color)', borderLeft: log.tone_used.includes('Legal') ? '2px solid var(--danger)' : '2px solid var(--gold)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-main)', display: 'block', marginBottom: '8px', letterSpacing: '0.02em' }}>
                      {log.client_name}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: '"SF Mono", monospace', letterSpacing: '0.05em' }}>
                      REF: {log.invoice_no}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                      {new Date(log.timestamp).toLocaleDateString()} <span style={{ margin: '0 6px' }}>|</span> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <span style={{ 
                      color: 'var(--gold)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase'
                    }}>
                      {log.tone_used}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const Th = ({ children, align = 'left' }) => (
  <th style={{ 
    padding: '20px 30px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.7rem', 
    textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: align
  }}>
    {children}
  </th>
);

export default App;