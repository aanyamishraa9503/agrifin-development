
import { parse } from 'csv-parse/sync'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

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

const CSV_PATH = path.join(
  process.cwd(),
  'data',
  'market',
  'agmarknet_daily.csv',
)

// Cache the parsed dataset in memory.
let cachedRecords: MarketRecord[] | null = null
let loadingPromise: Promise<MarketRecord[]> | null = null

function parsePrice(value: string, field: string): number {
  const price = Number(value)

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid ${field} in AGMARKNET dataset`)
  }

  return price
}

async function loadMarketRecords(): Promise<MarketRecord[]> {
  const csvContent = await readFile(CSV_PATH, 'utf8')

  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as Record<string, string>[]

  return rows.map((row) => ({
    state: row.State,
    district: row.District,
    market: row.Market,
    commodity: row.Commodity,
    variety: row.Variety,
    grade: row.Grade,
    arrivalDate: row.Arrival_Date,
    minPrice: parsePrice(row.Min_x0020_Price, 'minimum price'),
    maxPrice: parsePrice(row.Max_x0020_Price, 'maximum price'),
    modalPrice: parsePrice(row.Modal_x0020_Price, 'modal price'),
  }))
}

export async function getMarketRecords(): Promise<MarketRecord[]> {
  // Return cached records if already loaded.
  if (cachedRecords) {
    return cachedRecords
  }

  // Reuse an existing loading operation if one is in progress.
  if (!loadingPromise) {
    loadingPromise = loadMarketRecords()
      .then((records) => {
        cachedRecords = records
        return records
      })
      .catch((error) => {
        loadingPromise = null
        throw error
      })
  }

  return loadingPromise
}
