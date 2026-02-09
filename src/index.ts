import { ShardingManager } from "discord.js";
import { config } from "./config";
import path from "path";

const manager = new ShardingManager(path.join(import.meta.dir, "bot.ts"), {
    token: config.discord.token,
    totalShards: "auto",
    respawn: true
});

manager.on("shardCreate", shard => {
    console.log(`✨ Launched shard ${shard.id}`);
});

manager.spawn();
