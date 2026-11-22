
import { NextRequest, NextResponse } from 'next/server'
import { getMarketRecords } from '@/lib/market-intelligence/market-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const state = searchParams.get('state')
    const commodity = searchParams.get('commodity')
    const market = searchParams.get('market')

    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get('limit')) || 50),
    )

    let records = await getMarketRecords()

    if (state) {
      records = records.filter(
        (record) => record.state.toLowerCase() === state.toLowerCase(),
      )
    }

    if (commodity) {
      records = records.filter(
        (record) =>
          record.commodity.toLowerCase().includes(commodity.toLowerCase()),
      )
    }

    if (market) {
      records = records.filter(
        (record) =>
          record.market.toLowerCase().includes(market.toLowerCase()),
      )
    }

    const total = records.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    const paginatedRecords = records.slice(
      startIndex,
      startIndex + limit,
    )

    return NextResponse.json({
      success: true,
      count: paginatedRecords.length,
      total,
      page,
      limit,
      totalPages,
      filters: {
        state,
        commodity,
        market,
      },
      records: paginatedRecords,
    })
  } catch (error) {
    console.error('Market intelligence API error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load market data.',
      },
      { status: 500 },
    )
  }
}
