import { NextRequest, NextResponse } from 'next/server'
import { readAssetData, writeAssetData, AssetData } from '../../../utils/storage'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const assetId = searchParams.get('id')
    const ownerAddress = searchParams.get('owner')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address is required for verification' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting asset with ID:', assetId)
    console.log('👤 Requester address:', ownerAddress)

    // Read current data (all asset types)
    const assetData = await readAssetData()

    // Find the asset to delete
    const assetToDelete = assetData.find((a: AssetData) => a.id === assetId)
    if (!assetToDelete) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Verify ownership - case insensitive comparison
    if (assetToDelete.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.log('❌ Ownership verification failed')
      console.log('   Asset owner:', assetToDelete.owner)
      console.log('   Requester:', ownerAddress)
      return NextResponse.json(
        { error: 'You can only delete your own assets. Ownership verification failed.' },
        { status: 403 }
      )
    }

    console.log('✅ Ownership verified')

    // Filter out the deleted asset
    const updatedData = assetData.filter((a: AssetData) => a.id !== assetId)

    // Save updated data
    await writeAssetData(updatedData)

    console.log('✅ Successfully deleted:', assetToDelete.title, `(${assetToDelete.type})`)
    console.log(`📊 Remaining assets: ${updatedData.length}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Asset deleted successfully',
        deleted: {
          id: assetToDelete.id,
          title: assetToDelete.title,
          artist: assetToDelete.artist,
          type: assetToDelete.type,
        },
        remaining: updatedData.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('❌ Error deleting asset:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete asset',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
