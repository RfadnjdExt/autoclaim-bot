/**
 * Media Downloader Service
 * Downloads media from social platforms using VKrDownloader API
 */

import axios from "axios";

const VKRDOWNLOADER_API = "https://vkrdownloader.org/server/";
const API_KEY = "vkrdownloader";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface VKRFormat {
    url: string;
    format_id: string;
    ext: string;
    size: string;
}

interface VKRResponse {
    success?: boolean;
    title?: string;
    source?: string;
    thumbnail?: string;
    formats?: VKRFormat[];
    error?: string;
}

interface DownloadResult {
    success: boolean;
    buffer?: Buffer;
    filename?: string;
    title?: string;
    thumbnail?: string;
    error?: string;
    fallbackUrl?: string;
}

// Parse size string like "10 MB", "5.2 MB" to bytes
function parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB)/i);
    if (!match || !match[1] || !match[2]) return Infinity;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case "KB":
            return value * 1024;
        case "MB":
            return value * 1024 * 1024;
        case "GB":
            return value * 1024 * 1024 * 1024;
        default:
            return Infinity;
    }
}

// Find best format under max size
function findBestFormat(formats: VKRFormat[]): VKRFormat | null {
    // Sort by size descending (prefer higher quality)
    const validFormats = formats
        .filter(f => parseSizeToBytes(f.size) <= MAX_FILE_SIZE)
        .sort((a, b) => parseSizeToBytes(b.size) - parseSizeToBytes(a.size));

    return validFormats[0] ?? null;
}

/**
 * Fetch media info from VKrDownloader API
 */
export async function fetchMediaInfo(videoUrl: string): Promise<VKRResponse | null> {
    try {
        const response = await axios.get<VKRResponse>(VKRDOWNLOADER_API, {
            params: {
                api_key: API_KEY,
                vkr: videoUrl
            },
            timeout: 15000
        });

        return response.data;
    } catch (error) {
        console.error("VKrDownloader API error:", error);
        return null;
    }
}

/**
 * Download media if it's under the size limit
 */
export async function downloadMedia(videoUrl: string): Promise<DownloadResult> {
    try {
        // Fetch media info
        const info = await fetchMediaInfo(videoUrl);

        if (!info) {
            return { success: false, error: "Failed to fetch media info" };
        }

        // If no formats available, try source directly
        if (!info.formats || info.formats.length === 0) {
            if (info.source) {
                // Try to download from source
                const response = await axios.get(info.source, {
                    responseType: "arraybuffer",
                    timeout: 30000,
                    maxContentLength: MAX_FILE_SIZE,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                });

                const buffer = Buffer.from(response.data);
                if (buffer.length <= MAX_FILE_SIZE) {
                    return {
                        success: true,
                        buffer,
                        filename: `video_${Date.now()}.mp4`,
                        title: info.title,
                        thumbnail: info.thumbnail
                    };
                }
            }
            return {
                success: false,
                error: "No suitable format found",
                title: info.title,
                thumbnail: info.thumbnail,
                fallbackUrl: info.source
            };
        }

        // Find best format under limit
        const format = findBestFormat(info.formats);
        if (!format) {
            return {
                success: false,
                error: "All formats exceed size limit",
                title: info.title,
                thumbnail: info.thumbnail,
                fallbackUrl: info.source || info.formats[0]?.url
            };
        }

        // Download the media
        const response = await axios.get(format.url, {
            responseType: "arraybuffer",
            timeout: 60000,
            maxContentLength: MAX_FILE_SIZE,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        const buffer = Buffer.from(response.data);
        const ext = format.ext || "mp4";
        const filename = `${(info.title || "video").slice(0, 50).replace(/[^\w\s-]/g, "")}_${Date.now()}.${ext}`;

        return {
            success: true,
            buffer,
            filename,
            title: info.title,
            thumbnail: info.thumbnail
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Download failed"
        };
    }
}
