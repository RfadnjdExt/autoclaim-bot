/**
 * Test Crunchyroll API manually
 */

import { CrunchyrollService } from "./services/crunchyroll";
import { LANG_MAP } from "./constants";

async function main() {
    console.log("🔄 Testing Crunchyroll API...\n");

    const service = new CrunchyrollService();

    // Test auth
    console.log("1️⃣ Testing auth...");
    const auth = await service.getAuth();
    if (!auth) {
        console.error("❌ Auth failed!");
        return;
    }
    console.log("✅ Auth success!");
    console.log(`   Token: ${auth.access_token.slice(0, 20)}...`);
    console.log(`   Expires in: ${auth.expires_in}s`);
    console.log(`   Country: ${auth.country}\n`);

    // Fetch RSS publishers
    console.log("2️⃣ Fetching RSS publishers...");
    const publishers = await service.fetchRssPublishers();
    console.log(`✅ Cached ${publishers.size} publishers\n`);

    // Test fetch episodes
    console.log("3️⃣ Fetching latest episodes (en-US)...");
    const episodes = await service.fetchLatestEpisodes("en-US", 5);

    if (episodes.length === 0) {
        console.error("❌ No episodes found!");
        return;
    }

    console.log(`✅ Found ${episodes.length} episodes:\n`);

    for (const ep of episodes) {
        const formatted = service.formatEpisode(ep);
        const audioName = LANG_MAP[formatted.audioLocale] || formatted.audioLocale;
        const publisher = service.getPublisher(ep.external_id);

        console.log(`📺 ${formatted.title}`);
        console.log(`   URL: ${formatted.url}`);
        console.log(`   Duration: ${formatted.duration}`);
        console.log(`   Audio: ${audioName} | Dub: ${formatted.isDub}`);
        console.log(`   Subtitles: ${formatted.subtitles}`);
        console.log(`   Publisher: ${publisher || "Unknown"}`);
        console.log(`   Released: ${formatted.releasedAt.toISOString()}`);
        console.log("");
    }
}

main().catch(console.error);
