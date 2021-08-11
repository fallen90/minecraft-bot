#!/bin/sh
scp /Users/fallen90/Projects/helper/dist/config.yml root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/index.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/package.json root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Avoidance.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/BasePlugin.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/CLIControls.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/ChatControl.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/ClearArea.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/CobblestoneMiner.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Hunter/Hunter.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Logger.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Lumberjack/BotExtended.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Lumberjack/BotLumberjack.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Lumberjack/CollectionOptions.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Lumberjack/LumberType.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Lumberjack/Lumberjack.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Master.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Miner/InventoryHelper.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Miner/Miner.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Movement.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/Select.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/WirelessModem.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/plugins/__blank__.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/BoundingBox.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/ConfigManager.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/Events.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/Feedback.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/LogDrain.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/WirelessModem.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/shared/stdout-logger.js root@45.77.156.150:/root/helper &
scp /Users/fallen90/Projects/helper/dist/socket-server/index.js root@45.77.156.150:/root/helper &
wait
echo "Completed"
