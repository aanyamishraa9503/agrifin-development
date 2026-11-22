
import { NextResponse } from 'next/server'
import { getMarketRecords } from '@/lib/market-intelligence/market-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const records = await getMarketRecords()

    const states = [...new Set(records.map((record) => record.state))]
      .sort()

    const commodities = [
      ...new Set(records.map((record) => record.commodity)),
    ].sort()

    const markets = [...new Set(records.map((record) => record.market))]
      .sort()

    return NextResponse.json({
      success: true,
      states,
      commodities,
      markets,
      totals: {
        records: records.length,
        states: states.length,
        commodities: commodities.length,
        markets: markets.length,
      },
    })
  } catch (error) {
    console.error('Market metadata API error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load market metadata.',
      },
      { status: 500 },
    )
  }
}
