const repository = require('./repository');

class RankingController {
    async getPlayers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const search = req.query.q || '';
            const limit = 10;

            const ranking = await repository.getPlayerRanking({ page, limit, search });
            const total = await repository.getTotalPlayerCount(search);

            res.json({
                success: true,
                ranking,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            console.error('Error in RankingController.getPlayers:', error);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    async getGuilds(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const search = req.query.q || '';
            const limit = 10;

            const ranking = await repository.getGuildRanking({ page, limit, search });
            const total = await repository.getTotalGuildCount(search);

            res.json({
                success: true,
                ranking,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            console.error('Error in RankingController.getGuilds:', error);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }
}

module.exports = new RankingController();
