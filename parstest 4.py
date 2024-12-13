import requests
from bs4 import BeautifulSoup
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# Настройка логирования
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# Ваш токен
TELEGRAM_TOKEN = '7407472663:AAEDdJgnYMSqdh_kWg0TGiyzdl-8kx7XiFI'

async def get_olx_furniture_ads():
    url = 'https://m.olx.ro/oferte/q-Mobilier/'  # URL для категории "мебель"
    response = requests.get(url)
    
    # Проверка на успешный запрос
    if response.status_code != 200:
        logging.error(f'Ошибка при запросе страницы: {response.status_code}')
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    ads_links = []
    
    # Замените '.link' на правильный селектор, если потребуется
    for ad in soup.find_all('a', class_='link'):
        ad_link = ad.get('href')
        if ad_link:
            ads_links.append(ad_link)

    logging.info(f'Найдены ссылки на объявления о мебели: {ads_links}')  # Логирование найденных ссылок
    return ads_links[:5]  # Возвращаем первые 5 ссылок

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Привет! Я бот, который отправляет ссылки на объявления о мебели с OLX.ro. Используйте команду /get_furniture_ads для получения объявлений.')

async def get_furniture_ads(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logging.debug('Запрос на получение объявлений о мебели получен.')  # Логирование запроса
    ads = await get_olx_furniture_ads()
    if ads:
        for ad in ads:
            await update.message.reply_text(ad)
    else:
        await update.message.reply_text('Извините, сейчас нет доступных объявлений о мебели.')

def main():
    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("get_furniture_ads", get_furniture_ads))

    application.run_polling()

if __name__ == '__main__':
    main()