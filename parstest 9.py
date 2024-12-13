import logging
import requests
from bs4 import BeautifulSoup
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# Настройка логирования
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# Ваш токен
TELEGRAM_TOKEN = '7407472663:AAEDdJgnYMSqdh_kWg0TGiyzdl-8kx7XiFI'

async def get_olx_furniture_ads():
    url = 'https://m.olx.ro/oferte/q-Mobilier/'
    response = requests.get(url)

    # Проверка на успешный запрос
    if response.status_code != 200:
        logging.error(f'Ошибка при запросе страницы: {response.status_code}')
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    ads_links = []
    
    # Используем атрибут data-cy для поиска объявлений
    for ad in soup.find_all('div', {'data-cy': 'l-card'}):
        ad_link = ad.find('a')  # Внутри карточки ищем тег 'a'
        if ad_link and ad_link.get('href'):
            full_link = f"https://m.olx.ro{ad_link.get('href')}"  # Полный URL
            ads_links.append(full_link)

    logging.info(f'Найдены ссылки на объявления о мебели: {ads_links}')  # Логирование найденных ссылок
    return ads_links[:5]  # Возвращаем первые 5 ссылок

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Привет! Я бот, который отправляет ссылки на объявления о мебели с OLX.ro. Используйте команду /get_furniture_ads для получения объявлений.')

async def get_furniture_ads(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logging.debug('Запрос на получение объявлений о мебели получен.')  # Логирование запроса
    ads = await get_olx_furniture_ads()
    if ads:
        for ad in ads:
            await update.message.reply_text(ad)  # Отправка ссылки на объявление
    else:
        await update.message.reply_text('Пока нет новых объявлений о мебели. Вы можете проверить категорию здесь: https://m.olx.ro/oferte/q-Mobilier/')

def main():
    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("get_furniture_ads", get_furniture_ads))

    application.run_polling()

if __name__ == '__main__':
    main()