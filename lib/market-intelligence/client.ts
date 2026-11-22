
export interface MarketRecord {
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  grade: string
  arrivalDate: string
  minPrice: number
  maxPrice: number
  modalPrice: number
}

export interface MarketMetadata {
  success: boolean
  states: string[]
  commodities: string[]
  markets: string[]
  totals: {
    records: number
    states: number
    commodities: number
    markets: number
  }
}

export interface MarketApiResponse {
  success: boolean
  count: number
  total: number
  page: number
  limit: number
  totalPages: number
  filters: {
    state: string | null
    commodity: string | null
    market: string | null
  }
  records: MarketRecord[]
}

export interface MarketFilters {
  state?: string
  commodity?: string
  market?: string
  page?: number
  limit?: number
}

export async function fetchMarketMetadata(): Promise<MarketMetadata> {
  const response = await fetch('/api/market-intelligence/metadata')

  if (!response.ok) {
    throw new Error('Unable to load market metadata.')
  }

  return response.json()
}

export async function fetchMarketRecords(
  filters: MarketFilters = {},
): Promise<MarketApiResponse> {
  const params = new URLSearchParams()

  if (filters.state) params.set('state', filters.state)
  if (filters.commodity) params.set('commodity', filters.commodity)
  if (filters.market) params.set('market', filters.market)

  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 50))

  const response = await fetch(
    `/api/market-intelligence?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Unable to load market records.')
  }

  return response.json()
}
