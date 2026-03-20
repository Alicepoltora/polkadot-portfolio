import { useState, useMemo } from 'react';
import { decodeAddress } from '@polkadot/util-crypto';

import Sidebar from './components/Sidebar';
import TokenRow from './components/TokenRow';
import StakingPanel from './components/StakingPanel';
import NetworkBreakdown from './components/NetworkBreakdown';
import LoadingState from './components/LoadingState';
import PolkaHubLogo from './components/PolkaHubLogo';

import { usePolkadotAssets } from './hooks/usePolkadotAssets';
import { useStaking } from './hooks/useStaking';
import { useSubscan } from './hooks/useSubscan';
import { useEVM } from './hooks/useEVM';
import { usePrices } from './hooks/usePrices';
import { CHAINS, DEMO_ADDRESS } from './lib/chains';
import { formatUSD, truncateAddress } from './lib/format';

const TABS = ['All', 'Polkadot Hub', 'Parachains', 'Staking'];

// EVM chain IDs — handled by useEVM, skip duplicates from Subscan
const EVM_CHAIN_IDS = new Set(['moonbeam', 'astar']);

function validateAddress(addr) {
  if (addr.startsWith('0x') && addr.length === 42) return true; // EVM address
  try { decodeAddress(addr); return true; } catch { return false; }
}

export default function App() {
  const [address, setAddress]       = useState('');
  const [inputVal, setInputVal]     = useState('');
  const [activeTab, setActiveTab]   = useState('All');
  const [navTab, setNavTab]         = useState('dashboard');
  const [addrError, setAddrError]   = useState('');
  const [focused, setFocused]       = useState(false);

  const { dotBalance, assetHubTokens, loading: assetsLoading } = usePolkadotAssets(address);
  const { staking, apr, loading: stakingLoading }               = useStaking(address);
  const { multiChainData, loading: subscanLoading }             = useSubscan(address);
  const { evmTokens, loading: evmLoading }                      = useEVM(address);
  const { getPrice, getChange, usingFallback, error: priceErr } = usePrices();

  const handleSearch = (addr) => {
    addr = addr.trim();
    if (!validateAddress(addr)) { setAddrError('Invalid address — enter a valid SS58 or 0x EVM address.'); return; }
    setAddrError(''); setAddress(addr); setNavTab('dashboard');
  };

  const allTokens = useMemo(() => {
    const list = [];

    // 1. DOT from relay chain
    if (dotBalance > 0) {
      const p = getPrice('polkadot');
      list.push({ symbol:'DOT', name:'Polkadot', chainId:'polkadot', balance:dotBalance, price:p, change24h:getChange('polkadot'), value:dotBalance*p, coingeckoId:'polkadot' });
    }

    // 2. Asset Hub tokens (USDT, USDC, PINK, etc.)
    assetHubTokens.forEach(t => {
      const p = getPrice(t.coingeckoId);
      list.push({ symbol:t.symbol, name:t.name, chainId:'assetHub', balance:t.balance, price:p, change24h:getChange(t.coingeckoId), value:t.balance*(p||0), coingeckoId:t.coingeckoId });
    });

    // 3. Multichain substrate (Kusama, Acala, Hydration, Phala, Bifrost...)
    //    Skip EVM chains here — they are covered by useEVM below
    multiChainData.forEach(item => {
      if (item.chainId === 'polkadot') return; // already added via dotBalance
      if (EVM_CHAIN_IDS.has(item.chainId)) return; // handled by useEVM
      if (item.balance <= 0) return;
      const chain = CHAINS[item.chainId]; if (!chain) return;
      const p = getPrice(chain.coingeckoId);
      list.push({ symbol:chain.symbol, name:chain.name, chainId:item.chainId, balance:item.balance, price:p, change24h:getChange(chain.coingeckoId), value:item.balance*(p||0), coingeckoId:chain.coingeckoId });
    });

    // 4. EVM native + ERC-20 (Moonbeam GLMR, Astar ASTR, ERC-20 stables)
    evmTokens.forEach(t => {
      const p = getPrice(t.coingeckoId);
      list.push({ symbol:t.symbol, name:t.name, chainId:t.chainId, balance:t.balance, price:p, change24h:getChange(t.coingeckoId), value:t.balance*(p||0), coingeckoId:t.coingeckoId });
    });

    return list.sort((a,b) => (b.value||0)-(a.value||0));
  }, [dotBalance, assetHubTokens, multiChainData, evmTokens, getPrice, getChange]);

  const stakingUSD = staking ? (staking.bonded + staking.unbonding) * getPrice('polkadot') : 0;
  const totalUSD   = allTokens.reduce((s,t) => s+(t.value||0), 0) + stakingUSD;

  // Show skeleton while primary data is loading; keep showing results as they stream in
  const isInitialLoad = !!address && (assetsLoading || subscanLoading) && allTokens.length === 0;

  const tokensByChain = useMemo(() => {
    const m = {};
    allTokens.forEach(t => { if (!m[t.chainId]) m[t.chainId]=[]; m[t.chainId].push(t); });
    return m;
  }, [allTokens]);

  const filteredTokens = useMemo(() => {
    if (activeTab === 'All')           return allTokens;
    if (activeTab === 'Polkadot Hub')  return allTokens.filter(t => ['polkadot','assetHub'].includes(t.chainId));
    if (activeTab === 'Parachains')    return allTokens.filter(t => !['polkadot','assetHub'].includes(t.chainId));
    return allTokens;
  }, [allTokens, activeTab]);

  /* ── Landing ── */
  const showLanding = !address;

  /* Feature cards for landing right panel */
  const features = [
    { icon:'⛓', label:'Multichain', desc:'Polkadot, Kusama, Moonbeam, Astar, Acala & more' },
    { icon:'💎', label:'Live Prices', desc:'Real-time CoinGecko feed with 24h change' },
    { icon:'🏦', label:'Staking APY', desc:'Track bonded DOT, unbonding, and rewards' },
    { icon:'🔍', label:'Any Address', desc:'Paste any SS58 or 0x address to explore' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--surface)' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={navTab}
        onTabChange={id => { setNavTab(id); if (id==='staking') setActiveTab('Staking'); else setActiveTab('All'); }}
        address={address}
        onConnectWallet={() => {/* handled by search */}}
      />

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'var(--surface-low)' }}>

        {/* Top Bar */}
        <header style={{
          height: 58,
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(13,16,32,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 50,
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          {/* Tab links */}
          <div style={{ display:'flex', gap:2 }}>
            {['Dashboard','Assets','Staking'].map(t => {
              const id = t.toLowerCase();
              const isActive = navTab === id;
              return (
                <button key={t} onClick={() => { setNavTab(id); if(id==='staking') setActiveTab('Staking'); else setActiveTab('All'); }} style={{
                  background: isActive ? 'rgba(226,0,120,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: isActive ? 'var(--primary-light)' : 'var(--on-surface-dim)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13, padding:'6px 16px', cursor:'pointer',
                  transition:'all 0.15s', fontFamily:'var(--font-body)',
                }}>
                  {t}
                </button>
              );
            })}
          </div>

          {/* Right: address chip + avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {address && (
              <div style={{
                background:'rgba(27,31,43,0.9)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:8, padding:'5px 12px',
                fontSize:11, color:'var(--on-surface-dim)', fontFamily:'var(--font-mono)',
                display:'flex', alignItems:'center', gap:6,
              }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--success)', flexShrink:0, boxShadow:'0 0 6px var(--success)' }}/>
                {truncateAddress(address,7,6)}
              </div>
            )}
            {/* Notification bell */}
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'rgba(27,31,43,0.8)',
              border:'1px solid rgba(255,255,255,0.06)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer',
            }}>🔔</div>
            {/* Avatar */}
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(135deg,var(--primary),#8B00C9)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer',
              boxShadow:'0 0 0 2px rgba(226,0,120,0.25)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="white" fillOpacity="0.9"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-content">
          {showLanding ? (
            /* ── LANDING — full-width split layout ── */
            <div className="landing-split">

              {/* Left: logo + search */}
              <div className="landing-left">
                <div style={{ marginBottom:28 }}>
                  <PolkaHubLogo width={200} showTagline={true} />
                </div>
                <h1 style={{
                  fontFamily:'var(--font-display)', fontSize:'clamp(28px,3.5vw,52px)',
                  fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1,
                  background:'linear-gradient(135deg,var(--on-surface) 40%,var(--primary-light))',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  marginBottom:16,
                }}>
                  Your Portfolio,<br/>Unified
                </h1>
                <p style={{ color:'var(--on-surface-dim)', fontSize:16, lineHeight:1.6, marginBottom:36, maxWidth:420 }}>
                  Track DOT, staking positions, and multichain assets across the entire Polkadot ecosystem in one view.
                </p>

                {/* Search input */}
                <div style={{
                  display:'flex', borderRadius:14, overflow:'hidden',
                  boxShadow: focused ? '0 0 0 2px rgba(226,0,120,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                  transition:'box-shadow 0.2s', marginBottom:12, maxWidth:500,
                }}>
                  <input
                    type="text" value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => e.key==='Enter' && handleSearch(inputVal)}
                    placeholder="Enter SS58 or 0x address…"
                    style={{
                      flex:1, background:'var(--surface-high)', border:'none',
                      padding:'14px 18px', color:'var(--on-surface)',
                      fontSize:14, outline:'none', fontFamily:'var(--font-mono)',
                      minWidth:0,
                    }}
                  />
                  <button onClick={() => handleSearch(inputVal)} style={{
                    background:'linear-gradient(135deg,var(--primary),var(--primary-dim))',
                    border:'none', borderRadius:0,
                    color:'white', fontWeight:700, fontSize:14,
                    padding:'0 24px', cursor:'pointer', whiteSpace:'nowrap',
                    fontFamily:'var(--font-body)', flexShrink:0,
                  }}>Search</button>
                </div>

                {addrError && <div style={{ color:'var(--error)', fontSize:12, marginBottom:10 }}>⚠ {addrError}</div>}

                <button onClick={() => { setInputVal(DEMO_ADDRESS); handleSearch(DEMO_ADDRESS); }} style={{
                  background:'rgba(226,0,120,0.08)', border:'1px solid rgba(226,0,120,0.2)',
                  borderRadius:8, color:'var(--primary-light)',
                  fontSize:12, cursor:'pointer', fontFamily:'var(--font-mono)',
                  padding:'6px 14px',
                }}>
                  ▶ Try demo: {DEMO_ADDRESS.slice(0,8)}…{DEMO_ADDRESS.slice(-6)}
                </button>

                {/* Chain pills */}
                <div style={{ display:'flex', gap:8, marginTop:40, flexWrap:'wrap' }}>
                  {['polkadot','kusama','moonbeam','astar','acala'].map(id => {
                    const c = CHAINS[id];
                    return <span key={id} style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:20, background:`${c.color}15`, color:c.color, border:`1px solid ${c.color}30` }}>{c.logo} {c.name}</span>;
                  })}
                </div>
              </div>

              {/* Right: feature cards grid */}
              <div className="landing-right">
                {/* Stat banner */}
                <div className="glass-card" style={{ padding:'20px 24px', marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:'var(--tertiary)', marginBottom:12 }}>✦ ECOSYSTEM AT A GLANCE</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {[
                      { label:'Networks', value:'10+' },
                      { label:'Asset Types', value:'ERC-20, Native' },
                      { label:'Staking', value:'DOT / KSM' },
                      { label:'Data Source', value:'On-chain' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize:20, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--on-surface)' }}>{s.value}</div>
                        <div style={{ fontSize:11, color:'var(--on-surface-dim)', marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {features.map(f => (
                    <div key={f.label} className="glass-card" style={{ padding:'18px 20px' }}>
                      <div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div>
                      <div style={{ fontWeight:700, fontSize:14, color:'var(--on-surface)', marginBottom:4, fontFamily:'var(--font-display)' }}>{f.label}</div>
                      <div style={{ fontSize:12, color:'var(--on-surface-dim)', lineHeight:1.5 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom decoration */}
                <div style={{ marginTop:16, padding:'14px 20px', borderRadius:12, background:'rgba(123,233,255,0.06)', border:'1px solid rgba(123,233,255,0.12)', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:20 }}>🔒</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--tertiary)' }}>Read-only & Non-custodial</div>
                    <div style={{ fontSize:11, color:'var(--on-surface-dim)', marginTop:2 }}>No private keys. No sign-in. Just your address.</div>
                  </div>
                </div>
              </div>
            </div>

          ) : isInitialLoad ? (
            <LoadingState message="Fetching on-chain data…" />

          ) : (
            /* ── PORTFOLIO VIEW ── */
            <div>
              {/* Hero */}
              <div style={{ marginBottom:28 }}>
                {/* Top row: chip + address */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <span style={{
                    background:'rgba(123,233,255,0.08)', border:'1px solid rgba(123,233,255,0.18)',
                    color:'var(--tertiary)', borderRadius:20, padding:'4px 14px',
                    fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                  }}>Portfolio Overview</span>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontSize:11, color:'var(--on-surface-dim)',
                    background:'rgba(27,31,43,0.8)', padding:'3px 10px', borderRadius:6,
                    border:'1px solid rgba(255,255,255,0.06)',
                  }}>
                    {truncateAddress(address,7,6)}
                  </span>
                </div>

                {/* Big balance */}
                <h1 style={{
                  fontFamily:'var(--font-display)', fontSize:'clamp(38px,4.5vw,60px)',
                  fontWeight:800, letterSpacing:'-0.03em', lineHeight:1,
                  color:'var(--on-surface)', marginBottom:10,
                }}>
                  {formatUSD(totalUSD)}
                </h1>

                {/* 24h change — computed from weighted average of price changes */}
                {(() => {
                  const totalVal = allTokens.reduce((s,t) => s+(t.value||0), 0);
                  if (totalVal <= 0) return null;
                  const weightedChange = allTokens.reduce((s,t) => {
                    const w = (t.value||0) / totalVal;
                    return s + (t.change24h||0) * w;
                  }, 0);
                  const isPos = weightedChange >= 0;
                  return (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{
                        fontSize:13, fontWeight:700,
                        color: isPos ? 'var(--success)' : 'var(--error)',
                        display:'flex', alignItems:'center', gap:4,
                      }}>
                        {isPos ? '↑' : '↓'} {Math.abs(weightedChange).toFixed(2)}%
                      </span>
                      <span style={{ fontSize:12, color:'var(--on-surface-dim)' }}>vs 24h ago</span>
                    </div>
                  );
                })()}

                {/* Loading badges — show while data still streams in */}
                {(assetsLoading || subscanLoading || evmLoading) && (
                  <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                    {assetsLoading  && <LoadingBadge label="Relay chain" />}
                    {subscanLoading && <LoadingBadge label="Parachains" />}
                    {evmLoading     && <LoadingBadge label="EVM chains" />}
                  </div>
                )}

                {usingFallback && (
                  <div style={{ fontSize:11, color:'var(--warning)', marginTop:6 }}>
                    ⚠ {priceErr}
                  </div>
                )}
              </div>

              {/* Tab row */}
              <div style={{ display:'flex', gap:4, marginBottom:22 }}>
                {TABS.map(t => {
                  const isActive = activeTab===t;
                  return (
                    <button key={t} onClick={() => setActiveTab(t)} style={{
                      background: isActive ? 'rgba(255,137,176,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isActive ? '1px solid rgba(255,137,176,0.25)' : '1px solid transparent',
                      borderRadius:8,
                      color: isActive ? 'var(--primary-light)' : 'var(--on-surface-dim)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize:12, padding:'6px 16px', cursor:'pointer',
                      whiteSpace:'nowrap',
                      transition:'all 0.15s', fontFamily:'var(--font-body)',
                    }}>{t}</button>
                  );
                })}
              </div>

              {/* Two-column content */}
              <div className="content-grid">

                {/* Left: Assets table */}
                {activeTab === 'Staking' ? (
                  <StakingPanel staking={staking} apr={apr} dotPrice={getPrice('polkadot')} loading={stakingLoading} />
                ) : (
                  <div className="glass-card" style={{ overflow:'hidden', minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px 14px' }}>
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>Assets</span>
                      <span style={{ fontSize:12, color:'var(--primary-light)', cursor:'pointer', fontWeight:600 }}>View All +</span>
                    </div>
                    {filteredTokens.length > 0 ? (
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
                          <thead>
                            <tr style={{ background:'var(--surface-low)' }}>
                              {['ASSET','CHAIN','BALANCE','PRICE','VALUE'].map(h => (
                                <th key={h} style={{
                                  padding:'9px 12px', fontSize:10, fontWeight:600,
                                  color:'var(--on-surface-dim)', textAlign: ['BALANCE','PRICE','VALUE'].includes(h) ? 'right' : 'left',
                                  letterSpacing:'0.07em', textTransform:'uppercase',
                                }}>
                                  {h === 'ASSET' ? <span style={{paddingLeft:8}}>{h}</span> : h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTokens.map((token, i) => (
                              <TokenRow key={`${token.chainId}-${token.symbol}`} token={token} index={i} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (assetsLoading || subscanLoading) ? (
                      /* Still loading — show skeleton rows */
                      <div style={{ padding:'12px 0' }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ display:'flex', gap:12, padding:'14px 20px', alignItems:'center' }}>
                            <div className="skeleton" style={{ width:38, height:38, borderRadius:'50%', flexShrink:0 }} />
                            <div style={{ flex:1 }}>
                              <div className="skeleton" style={{ height:12, width:'40%', marginBottom:6 }} />
                              <div className="skeleton" style={{ height:10, width:'25%' }} />
                            </div>
                            <div className="skeleton" style={{ height:12, width:60 }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--on-surface-dim)', fontSize:13 }}>
                        No assets found for this address on the selected filter
                      </div>
                    )}
                  </div>
                )}

                {/* Right: Network Breakdown + Staking APY */}
                <div className="right-panel">
                  <NetworkBreakdown tokensByChain={tokensByChain} />
                  <StakingPanel staking={staking} apr={apr} dotPrice={getPrice('polkadot')} loading={stakingLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingBadge({ label }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:'rgba(123,233,255,0.06)', border:'1px solid rgba(123,233,255,0.12)',
      borderRadius:20, padding:'3px 10px',
      fontSize:10, fontWeight:600, color:'var(--tertiary)', letterSpacing:'0.05em',
    }}>
      <span className="dot-spinner" style={{ width:5, height:5 }} />
      {label}
    </span>
  );
}
