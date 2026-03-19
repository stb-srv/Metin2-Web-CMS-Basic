const db = require('../server/config/database');
const repository = require('../server/modules/ranking/repository');

async function testRanking() {
    console.log('--- Testing Ranking Repository ---');
    try {
        console.log('\n[1] Testing Player Ranking...');
        const players = await repository.getPlayerRanking({ page: 1, limit: 10 });
        console.log(`Fetched ${players.length} players.`);
        if (players.length > 0) {
            console.log('Sample Player:', players[0]);
            const hasEmpire = players[0].hasOwnProperty('empire');
            const hasGuild = players[0].hasOwnProperty('guild_name');
            const hasExp = players[0].hasOwnProperty('exp');
            console.log(`Empire: ${hasEmpire}, Guild: ${hasGuild}, EXP: ${hasExp}`);
            
            if (!hasEmpire || !hasExp) {
                console.error('FAILED: Missing required fields in player ranking.');
            }
        }

        console.log('\n[2] Testing Player Search...');
        if (players.length > 0) {
            const searchName = players[0].name.substring(0, 3);
            const searchResults = await repository.getPlayerRanking({ page: 1, limit: 10, search: searchName });
            console.log(`Search for "${searchName}" found ${searchResults.length} players.`);
        }

        console.log('\n[3] Testing Total Counts (Capped at 200)...');
        const totalPlayers = await repository.getTotalPlayerCount();
        console.log(`Total players: ${totalPlayers}`);

        console.log('\n[4] Testing Guild Ranking...');
        const guilds = await repository.getGuildRanking({ page: 1, limit: 10 });
        console.log(`Fetched ${guilds.length} guilds.`);
        if (guilds.length > 0) {
            console.log('Sample Guild:', guilds[0]);
        }

        console.log('\n--- Test Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

testRanking();
