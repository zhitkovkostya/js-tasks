/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвуте фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

/**
 * Функция должна проверять встречается ли подстрока chunk в строке full
 * Проверка должна происходить без учета регистра символов
 *
 * @example
 * isMatching('Moscow', 'moscow') // true
 * isMatching('Moscow', 'mosc') // true
 * isMatching('Moscow', 'cow') // true
 * isMatching('Moscow', 'SCO') // true
 * isMatching('Moscow', 'Moscov') // false
 *
 * @return {boolean}
 */
function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();

    return full.includes(chunk);
}

/**
 * Создает новый tr для таблицы со списком cookie
 *
 * @param name - имя cookie
 * @param value - значение cookie
 */
function createCookieTr(name, value) {
    let cookieTr = document.createElement('tr');
    let cookieTdName = document.createElement('td');
    let cookieTdValue = document.createElement('td');
    let cookieTdDelete = document.createElement('td');

    cookieTr.appendChild(cookieTdName).innerHTML = name;
    cookieTr.appendChild(cookieTdValue).innerHTML = value;
    cookieTr.appendChild(cookieTdDelete).innerHTML = `<button class="js-delete-button">Удалить</button>`;

    listTable.appendChild(cookieTr);
}

function renderCookieTable() {
    let cookies = getFilteredCookies();

    listTable.innerHTML = '';

    for (let cookie of cookies) {
        createCookieTr(cookie.name, cookie.value);
    }
}

function getCookies() {
    return document.cookie.split('; ').map((cookieItem) => {
        let cookieObject = {};

        cookieObject.name = cookieItem.split('=')[0];
        cookieObject.value = cookieItem.split('=')[1];

        return cookieObject;
    })
}

function getFilteredCookieNames() {
    let value = filterNameInput.value.trim();
    let cookies = getCookies();

    if (value !== '') {
        return cookies.filter((cookie) => {
            return isMatching(cookie.name, value);
        }).map((cookie) => {
            return cookie.name;
        });
    }

    return [];
}

function getFilteredCookies() {
    let cookies = getCookies();
    let filterNameValue = filterNameInput.value.trim();
    let filteredCookieNames = getFilteredCookieNames();

    return cookies.filter((cookieObject) => {
        if (filterNameValue === ''
            || filteredCookieNames.includes(cookieObject.name)) {
            return cookieObject;
        }
    });
}

filterNameInput.addEventListener('keyup', function() {
    renderCookieTable();
});

addButton.addEventListener('click', () => {
    let name = addNameInput.value;
    let value = addValueInput.value;

    document.cookie = `${name}=${value}`;

    renderCookieTable();
});

listTable.addEventListener('click', (e) => {
    if (e.target.className === 'js-delete-button') {
        document.cookie = `${e.target.dataset.cookie}=;expires=${new Date(0)}`;
        renderCookieTable();
    }
});

renderCookieTable();