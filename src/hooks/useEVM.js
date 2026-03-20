import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CHAINS } from '../lib/chains';

// Minimal ERC-20 ABI (only what we need)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// EVM chains we support
const EVM_CHAINS = ['moonbeam', 'astar'];

/**
 * Convert an SS58 address to an EVM H160 address.
 * For Moonbeam/Astar unified accounts, the SS58 address encodes the EVM address.
 * We derive it using @polkadot/util-crypto: decodeAddress returns 32 bytes;
 * the last 20 bytes are the EVM address for these chains.
 *
 * For purely EVM addresses (starting with 0x), pass as-is.
 */
function ss58ToEvm(address) {
  if (address?.startsWith('0x') && address.length === 42) return address;
  try {
    // Try importing synchronously from the polkadot bundle
    const { decodeAddress } = window.__polkadotUtilCrypto__ ?? {};
    if (decodeAddress) {
      const bytes = decodeAddress(address);
      // Last 20 bytes → EVM address
      return ethers.hexlify(bytes.slice(12));
    }
  } catch {}
  return null;
}

/**
 * Fetch native + ERC-20 token balances for EVM-compatible Polkadot parachains.
 * Returns an array of token entries compatible with allTokens in App.jsx.
 */
export function useEVM(address) {
  const [evmTokens, setEvmTokens] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!address) { setEvmTokens([]); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchEVM() {
      const tokens = [];

      // Dynamically import decodeAddress to avoid top-level async issues
      let decodeAddress;
      try {
        const util = await import('@polkadot/util-crypto');
        decodeAddress = util.decodeAddress;
      } catch {
        decodeAddress = null;
      }

      // Determine EVM address
      let evmAddress = null;
      if (address.startsWith('0x') && address.length === 42) {
        evmAddress = address;
      } else if (decodeAddress) {
        try {
          const bytes = decodeAddress(address);
          evmAddress = ethers.hexlify(bytes.slice(12));
        } catch {
          // Not a valid substrate address for EVM derivation
        }
      }

      if (!evmAddress) {
        if (!cancelled) { setEvmTokens([]); setLoading(false); }
        return;
      }

      // Fetch each EVM chain in parallel
      await Promise.allSettled(
        EVM_CHAINS.map(async chainId => {
          const chain = CHAINS[chainId];
          if (!chain?.evmRpc) return;

          let provider;
          try {
            provider = new ethers.JsonRpcProvider(chain.evmRpc);
          } catch {
            return;
          }

          // ── Native balance ──────────────────────────────────────────
          try {
            const rawBal = await provider.getBalance(evmAddress);
            const balance = parseFloat(ethers.formatUnits(rawBal, chain.decimals));
            if (balance > 0.0001) {
              tokens.push({
                symbol:    chain.symbol,
                name:      chain.name,
                chainId,
                balance,
                coingeckoId: chain.coingeckoId,
                source:    'evm-native',
              });
            }
          } catch (err) {
            console.warn(`[useEVM] ${chainId} native balance error:`, err.message);
          }

          // ── ERC-20 tokens ────────────────────────────────────────────
          if (chain.erc20Tokens) {
            await Promise.allSettled(
              chain.erc20Tokens.map(async token => {
                try {
                  const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                  const rawBal   = await contract.balanceOf(evmAddress);
                  const balance  = parseFloat(ethers.formatUnits(rawBal, token.decimals));
                  if (balance > 0.001) {
                    tokens.push({
                      symbol:      token.symbol,
                      name:        `${token.symbol} (${chain.name})`,
                      chainId,
                      balance,
                      coingeckoId: token.coingeckoId,
                      source:      'evm-erc20',
                    });
                  }
                } catch (err) {
                  console.warn(`[useEVM] ${chainId} ${token.symbol} error:`, err.message);
                }
              })
            );
          }
        })
      );

      if (!cancelled) {
        setEvmTokens(tokens);
        setLoading(false);
      }
    }

    fetchEVM().catch(err => {
      if (!cancelled) {
        console.warn('[useEVM] fatal error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [address]);

  return { evmTokens, loading, error };
}
