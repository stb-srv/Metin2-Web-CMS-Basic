const repository = require('../modules/cms/repository');

class DiscordLogger {
    async sendNewsNotification(news) {
        try {
            const settings = await repository.getSettings();
            if (settings.module_discord !== 'true' || !settings.discord_news_webhook) return;

            const embed = {
                title: `📰 Neue News: ${news.title}`,
                description: news.content ? news.content.substring(0, 200) + '...' : '',
                color: 0x6d28d9,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: 'Kategorie', value: news.category || 'Allgemein', inline: true },
                    { name: 'Autor', value: news.author || 'Admin', inline: true }
                ]
            };

            if (news.image_url) embed.image = { url: news.image_url };

            await fetch(settings.discord_news_webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: settings.site_name || 'Metin2 CMS',
                    avatar_url: settings.site_logo || '',
                    embeds: [embed]
                })
            });
        } catch (err) {
            console.error('[Discord] News Notification Error:', err.message);
        }
    }

    async sendShopNotification(order) {
        try {
            const settings = await repository.getSettings();
            if (settings.module_discord !== 'true' || !settings.discord_shop_webhook) return;

            await fetch(settings.discord_shop_webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: settings.site_name || 'Metin2 CMS',
                    content: `🛒 **Neuer Kauf im Web-Shop!**\nEin Spieler hat gerade zugeschlagen. Die Wirtschaft boomt!`
                })
            });
        } catch (err) {
            console.error('[Discord] Shop Notification Error:', err.message);
        }
    }
}

module.exports = new DiscordLogger();
