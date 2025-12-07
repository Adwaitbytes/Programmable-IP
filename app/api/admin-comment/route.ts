import { NextRequest, NextResponse } from 'next/server'
import { readAssetData, writeAssetData, AssetData } from '../../../utils/storage'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminWallet = searchParams.get('admin')
    const body = await request.json()
    const { comment } = body

    if (!id || !adminWallet || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing id, admin, or comment' },
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

    const asset = assetData[assetIndex]

    // Add comment to the asset
    if (!asset.adminComments) {
      asset.adminComments = []
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      admin: adminWallet,
      comment: comment,
      timestamp: new Date().toISOString(),
      read: false,
    }

    asset.adminComments.push(newComment)
    assetData[assetIndex] = asset

    // Save updated data
    await writeAssetData(assetData)

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// GET - Get comments for an asset
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      )
    }

    const assetData = await readAssetData()
    const asset = assetData.find((a: AssetData) => a.id === id)

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comments: asset.adminComments || [],
    })
  } catch (error) {
    console.error('Error getting comments:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
