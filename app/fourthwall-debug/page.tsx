'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FourthwallDebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [refreshData, setRefreshData] = useState<any>(null);
  const [seedData, setSeedData] = useState<any>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function runDebug() {
    setLoading({ ...loading, debug: true });
    try {
      const response = await fetch('/api/fourthwall/debug');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      setDebugData({ error: (error as Error).message });
    } finally {
      setLoading({ ...loading, debug: false });
    }
  }

  async function runRefreshCache() {
    setLoading({ ...loading, refresh: true });
    try {
      const response = await fetch('/api/fourthwall/refresh-cache');
      const data = await response.json();
      setRefreshData(data);
    } catch (error) {
      setRefreshData({ error: (error as Error).message });
    } finally {
      setLoading({ ...loading, refresh: false });
    }
  }

  async function runSeedTest() {
    setLoading({ ...loading, seed: true });
    try {
      const response = await fetch('/api/fourthwall/seed-test-products');
      const data = await response.json();
      setSeedData(data);
    } catch (error) {
      setSeedData({ error: (error as Error).message });
    } finally {
      setLoading({ ...loading, seed: false });
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-neon-green hover:underline text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-neon-green mt-4">
            Fourthwall Debug Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Tools to debug and test Fourthwall integration
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={runDebug}
            disabled={loading.debug}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            {loading.debug ? 'Loading...' : '🔍 Run Debug Check'}
          </button>

          <button
            onClick={runRefreshCache}
            disabled={loading.refresh}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            {loading.refresh ? 'Loading...' : '🔄 Refresh from JSON Feed'}
          </button>

          <button
            onClick={runSeedTest}
            disabled={loading.seed}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            {loading.seed ? 'Loading...' : '🌱 Seed Test Products'}
          </button>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-surface p-4 rounded-lg border border-gray-800">
            <h3 className="font-bold text-blue-400 mb-2">🔍 Debug Check</h3>
            <p className="text-sm text-gray-400">
              Shows detailed info about your Fourthwall configuration, JSON feed status, and Storefront API status.
            </p>
          </div>

          <div className="bg-dark-surface p-4 rounded-lg border border-gray-800">
            <h3 className="font-bold text-green-400 mb-2">🔄 Refresh Cache</h3>
            <p className="text-sm text-gray-400">
              Fetches products from your Fourthwall JSON feed and saves them to the Supabase cache.
            </p>
          </div>

          <div className="bg-dark-surface p-4 rounded-lg border border-gray-800">
            <h3 className="font-bold text-yellow-400 mb-2">🌱 Seed Test Data</h3>
            <p className="text-sm text-gray-400">
              Populates cache with fake test products (with placeholder images) for UI testing.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Debug Results */}
          {debugData && (
            <div className="bg-dark-surface p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Debug Results</h2>
              <pre className="bg-black p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}

          {/* Refresh Results */}
          {refreshData && (
            <div className="bg-dark-surface p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold text-green-400 mb-4">Cache Refresh Results</h2>
              {refreshData.success ? (
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-600 rounded p-4">
                    <p className="text-green-400 font-bold">✓ {refreshData.message}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Products:</span>
                      <p className="font-bold">{refreshData.totalProducts}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Saved:</span>
                      <p className="font-bold text-green-400">{refreshData.savedProducts}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Failed:</span>
                      <p className="font-bold text-red-400">{refreshData.failedProducts}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Expires:</span>
                      <p className="font-bold">{refreshData.expiresIn}</p>
                    </div>
                  </div>
                  {refreshData.feedUrl && (
                    <div className="text-sm">
                      <span className="text-gray-400">Feed URL:</span>
                      <p className="font-mono text-xs mt-1">{refreshData.feedUrl}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-900/30 border border-red-600 rounded p-4">
                  <p className="text-red-400 font-bold">✗ {refreshData.error || refreshData.message}</p>
                </div>
              )}
              <details className="mt-4">
                <summary className="cursor-pointer text-gray-400 hover:text-white text-sm">
                  Show full response
                </summary>
                <pre className="bg-black p-4 rounded overflow-x-auto text-xs mt-2">
                  {JSON.stringify(refreshData, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Seed Results */}
          {seedData && (
            <div className="bg-dark-surface p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Test Seed Results</h2>
              {seedData.success ? (
                <div className="space-y-3">
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded p-4">
                    <p className="text-yellow-400 font-bold">{seedData.message}</p>
                    <p className="text-yellow-600 text-sm mt-1">{seedData.warning}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Products seeded:</span>
                    <ul className="mt-2 space-y-1">
                      {seedData.products?.map((p: any) => (
                        <li key={p.id} className="text-xs">
                          • {p.name} - ${p.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/30 border border-red-600 rounded p-4">
                  <p className="text-red-400 font-bold">✗ {seedData.error || seedData.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-dark-surface rounded-lg border border-gray-800">
          <h3 className="font-bold text-neon-green mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <Link href="/" className="text-blue-400 hover:underline">
              → Homepage (see ShopShowcase)
            </Link>
            <Link href="/shop" className="text-blue-400 hover:underline">
              → Shop Page (full products)
            </Link>
            <a href="/api/fourthwall/products" target="_blank" className="text-blue-400 hover:underline">
              → Products API (JSON)
            </a>
            <a href="/api/fourthwall/debug" target="_blank" className="text-blue-400 hover:underline">
              → Debug API (JSON)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

