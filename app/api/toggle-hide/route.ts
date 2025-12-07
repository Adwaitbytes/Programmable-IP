import { NextRequest, NextResponse } from 'next/server'
import { readAssetData, writeAssetData, AssetData } from '../../../utils/storage'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const owner = searchParams.get('owner')

    if (!id || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing id or owner' },
        { status: 400 }
      )
    }

    // Read current asset data (all types)
    const assetData = await readAssetData()

    // Find the asset by id
    const assetIndex = assetData.findIndex((a: AssetData) => a.id === id)

    if (assetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Verify ownership (case-insensitive)
    if (assetData[assetIndex].owner.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized - you do not own this asset' },
        { status: 403 }
      )
    }

    // Toggle hidden state
    const currentHiddenState = assetData[assetIndex].hidden || false
    assetData[assetIndex].hidden = !currentHiddenState

    // Save updated data
    await writeAssetData(assetData)

    return NextResponse.json({
      success: true,
      message: assetData[assetIndex].hidden ? 'Asset hidden from explore page' : 'Asset visible on explore page',
      hidden: assetData[assetIndex].hidden,
    })
  } catch (error) {
    console.error('Error toggling hide:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
