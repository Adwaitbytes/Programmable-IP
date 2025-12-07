import { NextRequest, NextResponse } from 'next/server'
import { readAssetData, writeAssetData, AssetData } from '../../../utils/storage'

// GET - Get all notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')

    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'Missing owner' },
        { status: 400 }
      )
    }

    const assetData = await readAssetData()

    // Get all assets owned by this user
    const userAssets = assetData.filter(
      (a: AssetData) => a.owner.toLowerCase() === owner.toLowerCase()
    )

    // Collect all comments from user's assets
    const notifications: any[] = []

    userAssets.forEach((asset) => {
      if (asset.adminComments && asset.adminComments.length > 0) {
        asset.adminComments.forEach((comment) => {
          notifications.push({
            id: comment.id,
            assetId: asset.id,
            assetTitle: asset.title,
            assetType: asset.type,
            assetImage: asset.coverUrl || asset.mediaUrl,
            admin: comment.admin,
            comment: comment.comment,
            timestamp: comment.timestamp,
            read: comment.read,
          })
        })
      }
    })

    // Sort by timestamp (newest first)
    notifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    })
  } catch (error) {
    console.error('Error getting notifications:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, musicId, assetId, owner } = body

    // Support both old musicId and new assetId for backwards compatibility
    const targetAssetId = assetId || musicId

    if (!commentId || !targetAssetId || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing commentId, assetId, or owner' },
        { status: 400 }
      )
    }

    const assetData = await readAssetData()
    const assetIndex = assetData.findIndex((a: AssetData) => a.id === targetAssetId)

    if (assetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (assetData[assetIndex].owner.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Mark comment as read
    if (assetData[assetIndex].adminComments) {
      const commentIndex = assetData[assetIndex].adminComments!.findIndex(
        (c) => c.id === commentId
      )
      if (commentIndex !== -1) {
        assetData[assetIndex].adminComments![commentIndex].read = true
      }
    }

    await writeAssetData(assetData)

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
