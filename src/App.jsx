import { useState, useMemo } from 'react';
import { decodeAddress } from '@polkadot/util-crypto';

import WalletInput from './components/WalletInput';
import PortfolioHeader from './components/PortfolioHeader';
import ChainCard from './components/ChainCard';
import TokenRow from './components/TokenRow';
import StakingPanel from './components/StakingPanel';
import LoadingState from './components/LoadingState';

import { usePolkadotAssets } from './hooks/usePolkadotAssets';
import { useStaking } from './hooks/useStaking';
import { useSubscan } from './hooks/useSubscan';
import { usePrices } from './hooks/usePrices';
import { CHAINS } from './lib/chains';

const TABS = [
  { id: 'all', label: 'All Assets' },
  { id: 'hub', label: 'Polkadot Hub' },
  { id: 'parachains', label: 'Parachains' },
  { id: 'staking', label: 'Staking' },
];

function validateAddress(address) {
  try {
    decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [addressError, setAddressError] = useState('');

  const { dotBalance, assetHubTokens, loading: assetsLoading } = usePolkadotAssets(address);
  const { staking, apr, loading: stakingLoading } = useStaking(address);
  const { multiChainData, loading: subscanLoading } = useSubscan(address);
  const { getPrice, getChange, error: priceError, usingFallback } = usePrices();

  const handleSearch = (addr) => {
    if (!validateAddress(addr)) {
      setAddressError('Invalid address. Please enter a valid SS58 or hex address.');
      return;
    }
    setAddressError('');
    setAddress(addr);
    setActiveTab('all');
  };

  const allTokens = useMemo(() => {
    const tokens = [];
    const dotPrice = getPrice('polkadot');
    const dotChange = getChange('polkadot');

    if (dotBalance !== null && dotBalance > 0) {
      tokens.push({
        symbol: 'DOT', name: 'Polkadot', chainId: 'polkadot',
        balance: dotBalance, price: dotPrice, change24h: dotChange,
        value: dotBalance * dotPrice, type: 'native', coingeckoId: 'polkadot',
      });
    }

    assetHubTokens.forEach((t) => {
      const price = getPrice(t.coingeckoId);
      tokens.push({
        symbol: t.symbol, name: t.name, chainId: 'assetHub',
        balance: t.balance, price, change24h: getChange(t.coingeckoId),
        value: t.balance * price, type: 'asset', coingeckoId: t.coingeckoId,
      });
    });

    multiChainData.forEach((item) => {
      if (item.chainId === 'polkadot') return;
      const chain = CHAINS[item.chainId];
      if (!chain) return;
      const price = getPrice(chain.coingeckoId);
      if (item.balance > 0) {
        tokens.push({
          symbol: chain.symbol, name: chain.name, chainId: item.chainId,
          balance: item.balance, price, change24h: getChange(chain.coingeckoId),
          value: item.balance * price, type: 'native', coingeckoId: chain.coingeckoId,
        });
      }
    });

    return tokens.sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [dotBalance, assetHubTokens, multiChainData, getPrice, getChange]);

  const totalUSD = allTokens.reduce((sum, t) => sum + (t.value || 0), 0) +
    (staking ? (staking.bonded + staking.unbonding) * getPrice('polkadot') : 0);

  const isLoading = address && (assetsLoading || subscanLoading);

  const tokensByChain = useMemo(() => {
    const map = {};
    allTokens.forEach((t) => {
      if (!map[t.chainId]) map[t.chainId] = [];
      map[t.chainId].push(t);
    });
    return map;
  }, [allTokens]);

  const activeChains = Object.keys(tokensByChain);

  const filteredTokens = useMemo(() => {
    if (activeTab === 'all') return allTokens;
    if (activeTab === 'hub') return allTokens.filter(t => t.chainId === 'polkadot' || t.chainId === 'assetHub');
    if (activeTab === 'parachains') return allTokens.filter(t =>
      ['moonbeam', 'astar', 'acala', 'kusama'].includes(t.chainId)
    );
    return allTokens;
  }, [allTokens, activeTab]);

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(230,0,122,0.06) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(99,0,168,0.06) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          background: 'rgba(13,13,13,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 32 32" width="28" height="28">
              <circle cx="16" cy="16" r="16" fill="#E6007A" />
              <circle cx="16" cy="8" r="3.5" fill="white" />
              <circle cx="16" cy="24" r="3.5" fill="white" />
              <circle cx="8" cy="12" r="3.5" fill="white" />
              <circle cx="24" cy="12" r="3.5" fill="white" />
              <circle cx="8" cy="20" r="3.5" fill="white" />
              <circle cx="24" cy="20" r="3.5" fill="white" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
              Polka<span style={{ color: '#E6007A' }}>Portfolio</span>
            </span>
            <span style={{
              background: 'rgba(230,0,122,0.15)',
              border: '1px solid rgba(230,0,122,0.3)',
              color: '#E6007A',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              letterSpacing: '0.05em',
            }}>HACKATHON</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Live on Polkadot
          </div>
        </nav>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
          {!address ? (
            <div style={{ textAlign: 'center', paddingTop: '10vh' }}>
              <div style={{ marginBottom: 48 }}>
                <h1 style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 20px',
                  background: 'linear-gradient(135deg, #ffffff 30%, #E6007A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Your Polkadot<br />Portfolio, Unified
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6 }}>
                  Track DOT, staking positions, and multichain assets
                  across the entire Polkadot ecosystem in one view.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
                {['polkadot', 'kusama', 'moonbeam', 'astar', 'acala'].map(id => {
                  const c = CHAINS[id];
                  return (
                    <div key={id} style={{
                      background: `${c.color}18`,
                      border: `1px solid ${c.color}30`,
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: 12,
                      color: c.color,
                      fontWeight: 600,
                    }}>
                      {c.logo} {c.name}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <WalletInput onSearch={handleSearch} loading={isLoading} />
              </div>

              {addressError && (
                <div style={{ marginTop: 16, color: '#f87171', fontSize: 13 }}>
                  ⚠️ {addressError}
                </div>
              )}
            </div>
          ) : isLoading ? (
            <LoadingState message="Connecting to Polkadot nodes and fetching balances..." />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <WalletInput onSearch={handleSearch} loading={isLoading} />
              </div>

              {addressError && (
                <div style={{ marginBottom: 16, color: '#f87171', fontSize: 13, textAlign: 'center' }}>
                  ⚠️ {addressError}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <PortfolioHeader
                  address={address}
                  totalUSD={totalUSD}
                  tokenCount={allTokens.length}
                  chainCount={activeChains.length}
                  pricesWarning={usingFallback ? priceError : null}
                />
              </div>

              {activeChains.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 16,
                  marginBottom: 32,
                }}>
                  {activeChains.map(chainId => (
                    <ChainCard
                      key={chainId}
                      chainId={chainId}
                      tokens={tokensByChain[chainId]}
                    />
                  ))}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 24,
                overflowX: 'auto',
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid #E6007A' : '2px solid transparent',
                      color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      fontSize: 14,
                      padding: '10px 18px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                      marginBottom: -1,
                    }}
                  >
                    {tab.label}
                    {tab.id === 'staking' && staking?.bonded > 0 && (
                      <span style={{
                        marginLeft: 6,
                        background: 'rgba(230,0,122,0.2)',
                        color: '#E6007A',
                        fontSize: 10,
                        borderRadius: 20,
                        padding: '1px 6px',
                        fontWeight: 700,
                      }}>ACTIVE</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'staking' ? (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  padding: 24,
                }}>
                  <StakingPanel
                    staking={staking}
                    apr={apr}
                    dotPrice={getPrice('polkadot')}
                    loading={stakingLoading}
                  />
                </div>
              ) : filteredTokens.length > 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <th style={thStyle}>#</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Token</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Network</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Balance</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map((token, i) => (
                        <TokenRow key={`${token.chainId}-${token.symbol}`} token={token} index={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    No assets found
                  </div>
                  <div style={{ fontSize: 13 }}>No tokens detected for this address on the selected filter</div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 24px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 12,
        }}>
          Built on Polkadot · Data from polkadot.js, Subscan & CoinGecko · Hackathon 2025
        </footer>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 8px',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: 'rgba(255,255,255,0.02)',
};
