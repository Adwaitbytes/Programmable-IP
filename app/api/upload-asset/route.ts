import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../utils/functions/uploadToIpfs'
import { createHash } from 'crypto'
import { client, networkInfo } from '../../../utils/config'
import { createCommercialRemixTerms, SPGNFTContractAddress } from '../../../utils/utils'
import { IpMetadata } from '@story-protocol/core-sdk'
import { readAssetData, writeAssetData, type AssetData, type AssetType } from '../../../utils/storage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    console.log('🚀 Starting asset upload and IP registration process...')

    try {
        // Parse form data
        console.log('📦 Step 1: Parsing form data...')
        const formData = await request.formData()

        const type = formData.get('type') as AssetType || 'music'
        const title = formData.get('title') as string
        const artist = formData.get('artist') as string
        const description = formData.get('description') as string || ''
        const price = formData.get('price') as string || '0'
        const owner = formData.get('owner') as string

        // Ensure owner address is properly formatted as hex
        if (!owner.startsWith('0x')) {
            return NextResponse.json({
                success: false,
                error: 'Invalid owner address format'
            }, { status: 400 })
        }

        const mediaFile = formData.get('mediaFile') as File
        const coverFile = formData.get('coverFile') as File | null
        const attributesStr = formData.get('attributes') as string
        const textContent = formData.get('textContent') as string

        console.log('📋 Form data received:', { type, title, artist, description, price, owner })
        console.log('📁 Media file:', mediaFile?.name, mediaFile?.size, 'bytes')

        if (!title || !artist || !mediaFile || !owner) {
            console.error('❌ Missing required fields')
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 })
        }

        // Step 2: Upload media file to IPFS
        console.log('🌐 Step 2: Uploading media file to IPFS...')
        const mediaBuffer = Buffer.from(await mediaFile.arrayBuffer())
        const mediaIpfsHash = await uploadFileToIPFS(mediaBuffer)
        const mediaUrl = `https://ipfs.io/ipfs/${mediaIpfsHash}`
        console.log('✅ Media uploaded to IPFS:', mediaUrl)

        // Step 3: Upload cover file to IPFS (if provided)
        let coverUrl = ''
        let coverHash = ''
        if (coverFile) {
            console.log('🖼️ Step 3: Uploading cover file to IPFS...')
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
            const coverIpfsHash = await uploadFileToIPFS(coverBuffer)
            coverUrl = `https://ipfs.io/ipfs/${coverIpfsHash}`
            coverHash = createHash('sha256').update(coverBuffer).digest('hex')
            console.log('✅ Cover uploaded to IPFS:', coverUrl)
        } else {
            // Default placeholders based on type
            const placeholders: Record<string, string> = {
                music: 'https://via.placeholder.com/400x400?text=Music+IP',
                character: 'https://via.placeholder.com/400x400?text=Character+IP',
                story: 'https://via.placeholder.com/400x400?text=Story+IP',
                image: 'https://via.placeholder.com/400x400?text=Image+IP',
                concept: 'https://via.placeholder.com/400x400?text=Concept+IP',
                other: 'https://via.placeholder.com/400x400?text=IP+Asset',
            }
            coverUrl = placeholders[type] || placeholders.other
        }

        // Step 4: Create IP metadata
        console.log('📝 Step 4: Creating IP metadata...')
        const mediaHash = createHash('sha256').update(mediaBuffer).digest('hex')

        const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
            title: title,
            description: description || `A ${type} created by ${artist}`,
            createdAt: Math.floor(Date.now() / 1000).toString(),
            creators: [
                {
                    name: artist,
                    address: owner as `0x${string}`,
                    contributionPercent: 100,
                },
            ],
            image: coverUrl,
            imageHash: coverHash ? `0x${coverHash}` : undefined,
            mediaUrl: mediaUrl,
            mediaHash: `0x${mediaHash}`,
            mediaType: mediaFile.type,
            // Add custom attributes to metadata if possible, or just keep them in local storage
        })
        console.log('✅ IP metadata created:', ipMetadata)

        // Step 5: Create NFT metadata
        console.log('🎨 Step 5: Creating NFT metadata...')
        const nftMetadata = {
            name: title,
            description: `${description || `A ${type} created by ${artist}`} This NFT represents ownership of the IP Asset.`,
            image: coverUrl,
            animation_url: type === 'music' ? mediaUrl : undefined, // Only set animation_url for audio/video
            external_url: mediaUrl,
            attributes: [
                { trait_type: 'Artist', value: artist },
                { trait_type: 'Type', value: type },
                { trait_type: 'Price', value: price === '0' ? 'Free' : `${price} IP` },
                { trait_type: 'Owner', value: owner },
                { trait_type: 'Created', value: new Date().toISOString() },
            ],
        }
        console.log('✅ NFT metadata created:', nftMetadata)

        // Step 6: Upload metadata to IPFS
        console.log('📤 Step 6: Uploading metadata to IPFS...')
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

        console.log('✅ IP metadata uploaded to IPFS:', `https://ipfs.io/ipfs/${ipIpfsHash}`)
        console.log('✅ NFT metadata uploaded to IPFS:', `https://ipfs.io/ipfs/${nftIpfsHash}`)

        // Step 7: Register IP Asset on Story Protocol
        console.log('🔗 Step 7: Registering IP Asset on Story Protocol...')

        const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
            spgNftContract: SPGNFTContractAddress,
            licenseTermsData: [
                {
                    terms: createCommercialRemixTerms({
                        defaultMintingFee: parseFloat(price) || 1,
                        commercialRevShare: 5
                    }),
                },
            ],
            ipMetadata: {
                ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                ipMetadataHash: `0x${ipHash}`,
                nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                nftMetadataHash: `0x${nftHash}`,
            },
            txOptions: { waitForTransaction: true },
        })

        console.log('🎉 IP Asset registered successfully!')
        console.log('📋 Registration response:', {
            txHash: response.txHash,
            ipId: response.ipId,
        })

        const explorerUrl = `${networkInfo.protocolExplorer}/ipa/${response.ipId}`

        // Step 8: Save to local storage
        console.log('💾 Step 8: Saving to local storage...')

        const assetData: AssetData = {
            id: response.ipId || Date.now().toString(),
            type,
            title,
            artist,
            description,
            price,
            mediaUrl,
            coverUrl,
            owner,
            metadataUrl: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            createdAt: new Date().toISOString(),
            ipId: response.ipId,
            txHash: response.txHash,
            attributes: attributesStr ? JSON.parse(attributesStr) : undefined,
            textContent: textContent || undefined,
        }

        const existingData = await readAssetData()
        existingData.push(assetData)
        await writeAssetData(existingData)
        console.log('✅ Data saved to storage')

        // Step 9: Return success response
        return NextResponse.json({
            success: true,
            message: 'Asset uploaded and IP registered successfully',
            data: assetData,
            ipId: response.ipId,
            txHash: response.txHash,
            explorerUrl,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        })

    } catch (error) {
        console.error('💥 Error in upload process:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }, { status: 500 })
    }
}
