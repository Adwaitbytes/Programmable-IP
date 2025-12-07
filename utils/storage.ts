// Storage utility: uses Vercel Blob in production, falls back to local file in dev
import { put, del, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

export type AssetType = 'music' | 'character' | 'story' | 'image' | 'concept' | 'other'

export interface AdminComment {
  id: string
  admin: string
  comment: string
  timestamp: string
  read: boolean
}

export interface AssetData {
  id: string
  type: AssetType
  title: string
  artist: string // Creator/Author
  description: string
  price: string
  mediaUrl: string // Generic URL for the main asset (audio, image, pdf, etc.)
  coverUrl: string // Thumbnail/Cover image
  owner: string
  metadataUrl: string
  createdAt: string
  ipId?: string
  txHash?: string
  hidden?: boolean
  adminComments?: AdminComment[]
  // Type-specific fields
  attributes?: Record<string, any> // For characters (traits), etc.
  textContent?: string // For short stories or concepts
}

// Backward compatibility for existing code that imports MusicData
export type MusicData = AssetData

const STORAGE_FILE = path.join(process.cwd(), 'asset-storage.json')
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const BLOB_PREFIX = 'asset-data'

function usingBlob(): boolean {
  return Boolean(BLOB_TOKEN)
}

// Read from Vercel Blob
async function blobRead(): Promise<AssetData[] | null> {
  if (!usingBlob()) return null

  try {
    // List all blobs with asset prefix
    // We also check for 'music-data' for migration purposes
    const { blobs } = await list({
      token: BLOB_TOKEN,
      limit: 100,
    })

    // Filter for our data files
    const dataBlobs = blobs.filter(b =>
      b.pathname.startsWith('asset-data') || b.pathname.startsWith('music-data')
    )

    if (dataBlobs.length === 0) {
      console.log('📝 No existing blob storage found')
      return []
    }

    // Sort by uploaded date and get the most recent
    const latestBlob = dataBlobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]

    console.log('📂 Reading from latest blob:', latestBlob.url)

    const response = await fetch(latestBlob.url, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Migrate old music data to new AssetData format if needed
    const migratedData = data.map((item: any) => ({
      ...item,
      type: item.type || 'music', // Default to music if type is missing
      mediaUrl: item.mediaUrl || item.audioUrl, // Map audioUrl to mediaUrl
      coverUrl: item.coverUrl || item.imageUrl, // Map imageUrl to coverUrl
    }))

    console.log('✅ Loaded data from Vercel Blob:', migratedData.length, 'assets')
    return migratedData as AssetData[]
  } catch (error) {
    console.error('❌ Error reading from Blob:', error)
    return []
  }
}

// Write to Vercel Blob
async function blobWrite(data: AssetData[]): Promise<void> {
  if (!usingBlob()) return

  try {
    // List and delete old blobs
    try {
      const { blobs } = await list({
        token: BLOB_TOKEN,
      })

      // Filter for our data files (cleanup both old music-data and new asset-data)
      const blobsToDelete = blobs.filter(b =>
        b.pathname.startsWith('asset-data') || b.pathname.startsWith('music-data')
      )

      if (blobsToDelete.length > 0) {
        console.log(`🗑️ Deleting ${blobsToDelete.length} old blob(s)...`)
        await Promise.all(
          blobsToDelete.map(blob => del(blob.url, { token: BLOB_TOKEN }))
        )
        // Small delay to ensure deletion propagates
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (delError) {
      console.log('ℹ️ No existing blob to delete or delete failed:', delError)
    }

    // Write new blob
    const timestamp = Date.now()
    const filename = `${BLOB_PREFIX}-${timestamp}.json`

    const blob = await put(filename, JSON.stringify(data, null, 2), {
      access: 'public',
      token: BLOB_TOKEN,
      contentType: 'application/json',
    })
    console.log('✅ Data saved to Vercel Blob:', blob.url)
  } catch (error) {
    console.error('❌ Error writing to Blob:', error)
    throw error
  }
}

// Read from local filesystem
function fsRead(): AssetData[] {
  try {
    // Check for new file first, then old file
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data) as AssetData[]
    }

    // Fallback to old music storage file
    const oldFile = path.join(process.cwd(), 'music-storage.json')
    if (fs.existsSync(oldFile)) {
      const data = fs.readFileSync(oldFile, 'utf8')
      const parsed = JSON.parse(data)
      return parsed.map((item: any) => ({
        ...item,
        type: 'music',
        mediaUrl: item.audioUrl,
        coverUrl: item.imageUrl
      }))
    }

    return []
  } catch (error) {
    console.error('❌ FS read error:', error)
    return []
  }
}

// Write to local filesystem
function fsWrite(data: AssetData[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2))
    console.log('✅ Data saved to local file')
  } catch (error) {
    console.error('❌ FS write error:', error)
  }
}

// Generic API: Read asset data
export async function readAssetData(): Promise<AssetData[]> {
  if (usingBlob()) {
    console.log('📦 Using Vercel Blob storage')
    const data = await blobRead()
    return data || []
  } else {
    console.log('📁 Using local file storage')
    return fsRead()
  }
}

// Generic API: Write asset data
export async function writeAssetData(data: AssetData[]): Promise<void> {
  if (usingBlob()) {
    console.log('📦 Saving to Vercel Blob storage')
    await blobWrite(data)
  } else {
    console.log('📁 Saving to local file storage')
    fsWrite(data)
  }
}

// Legacy wrappers for backward compatibility
export const readMusicData = async () => {
  const assets = await readAssetData()
  // Map back to MusicData shape for legacy components if strictly needed,
  // but mostly we just need the fields to exist, which they do (plus extra).
  // We filter for music type to be safe.
  return assets.filter(a => a.type === 'music').map(a => ({
    ...a,
    audioUrl: a.mediaUrl,
    imageUrl: a.coverUrl
  }))
}

export const writeMusicData = async (musicData: any[]) => {
  // This is tricky because we might overwrite other assets if we only write music data.
  // Ideally, we should read all assets, replace the music ones, and write back.
  // But for now, let's assume we are migrating to the new system and shouldn't use this function much.
  // We'll just convert and write.
  const assets: AssetData[] = musicData.map(m => ({
    ...m,
    type: 'music',
    mediaUrl: m.audioUrl,
    coverUrl: m.imageUrl
  }))

  // We need to merge with existing non-music assets
  const currentAssets = await readAssetData()
  const nonMusic = currentAssets.filter(a => a.type !== 'music')

  await writeAssetData([...nonMusic, ...assets])
}
