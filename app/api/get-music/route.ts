import { NextResponse } from 'next/server'
import { readAssetData } from '../../../utils/storage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('📂 Loading all assets from storage...')

  try {
    const assetData = await readAssetData()
    console.log('✅ Loaded', assetData.length, 'assets')

    // Map to include legacy field names for backward compatibility
    const mappedData = assetData.map(asset => ({
      ...asset,
      // Add legacy field names for components that still use them
      audioUrl: asset.mediaUrl,
      imageUrl: asset.coverUrl,
    }))

    return NextResponse.json({
      success: true,
      music: mappedData, // Keep 'music' key for backward compatibility
      assets: mappedData, // Also return as 'assets' for new code
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
      music: [],
      assets: [],
    }, { status: 500 })
  }
}
