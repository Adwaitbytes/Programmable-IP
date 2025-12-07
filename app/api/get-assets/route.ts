import { NextResponse } from 'next/server'
import { readAssetData } from '../../../utils/storage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function GET() {
    console.log('📂 Loading assets from storage...')

    try {
        const assetData = await readAssetData()
        console.log('✅ Loaded', assetData.length, 'assets')

        return NextResponse.json({
            success: true,
            assets: assetData,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        })
    } catch (error) {
        console.error('💥 Error loading assets:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to load assets',
            assets: [],
        }, { status: 500 })
    }
}
