
'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react'

import { PageHeader, SectionCard } from '@/components/shared/page-header'
import {
  fetchMarketMetadata,
  fetchMarketRecords,
  type MarketMetadata,
  type MarketRecord,
} from '@/lib/market-intelligence/client'

const PAGE_SIZE = 20

export default function MarketIntelligencePage() {
  const [metadata, setMetadata] = useState<MarketMetadata | null>(null)
  const [records, setRecords] = useState<MarketRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)

  const [state, setState] = useState('Tamil Nadu')
  const [commodity, setCommodity] = useState('')
  const [market, setMarket] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMetadata() {
      try {
        const data = await fetchMarketMetadata()
        setMetadata(data)
      } catch {
        setError('Unable to load market metadata.')
      }
    }

    loadMetadata()
  }, [])

  useEffect(() => {
    let active = true

    async function loadRecords() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchMarketRecords({
          state,
          commodity,
          market,
          page,
          limit: PAGE_SIZE,
        })

        if (!active) return

        setRecords(data.records)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch {
        if (active) {
          setError('Unable to load market prices.')
          setRecords([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadRecords()

    return () => {
      active = false
    }
  }, [state, commodity, market, page])

  function handleFilterChange(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Market Intelligence"
        subtitle="Explore reported agricultural wholesale prices across Indian markets."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Market location">
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-primary" />
            <div>
              <p className="font-semibold">{state || 'All states'}</p>
              <p className="text-sm text-muted-foreground">
                India
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Available records">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {metadata?.totals.records.toLocaleString('en-IN') ?? '—'}
              </p>
              <p className="text-sm text-muted-foreground">
                Market price records
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Market coverage">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 text-primary" />
            <div>
              <p className="font-semibold">
                {metadata?.totals.markets.toLocaleString('en-IN') ?? '—'} markets
              </p>
              <p className="text-sm text-muted-foreground">
                Across {metadata?.totals.states ?? '—'} states
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Market price explorer"
        description="Filter reported wholesale prices by state, commodity, and market."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="state-filter" className="text-sm font-medium">
              State
            </label>
            <select
              id="state-filter"
              value={state}
              onChange={(event) =>
                handleFilterChange(setState, event.target.value)
              }
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">All states</option>
              {metadata?.states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="commodity-filter" className="text-sm font-medium">
              Commodity
            </label>
            <select
              id="commodity-filter"
              value={commodity}
              onChange={(event) =>
                handleFilterChange(setCommodity, event.target.value)
              }
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">All commodities</option>
              {metadata?.commodities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="market-filter" className="text-sm font-medium">
              Market
            </label>
            <select
              id="market-filter"
              value={market}
              onChange={(event) =>
                handleFilterChange(setMarket, event.target.value)
              }
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">All markets</option>
              {metadata?.markets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString('en-IN')} matching records
          </p>

          <button
            type="button"
            onClick={() => {
              setState('Tamil Nadu')
              setCommodity('')
              setMarket('')
              setPage(1)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Reset filters
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Reported market prices"
        description="Prices are displayed in the units provided by the source dataset. Arrival date: 20 November 2026."
      >
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Loading market records...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium">No matching records found</p>
            <p className="text-sm text-muted-foreground">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Commodity</th>
                    <th className="px-3 py-3 font-medium">Market</th>
                    <th className="px-3 py-3 font-medium">District</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Min price
                    </th>
                    <th className="px-3 py-3 text-right font-medium">
                      Max price
                    </th>
                    <th className="px-3 py-3 text-right font-medium">
                      Modal price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={`${record.state}-${record.market}-${record.commodity}-${index}`}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-3 py-3 font-medium">
                        {record.commodity}
                      </td>
                      <td className="px-3 py-3">{record.market}</td>
                      <td className="px-3 py-3">{record.district}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        ₹{record.minPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        ₹{record.maxPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        ₹{record.modalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Data snapshot: 20 November 2026. These are reported market prices,
        not live quotes or AI-generated forecasts.
      </p>
    </div>
  )
}
