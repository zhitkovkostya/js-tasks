'use strict';

let friendTemplate = require('../friend-template.hbs');
let selectedFriendsIds = getCookieValueByName('selectedFriendsIds') || [];
let idleFriendsIds = [];
let friendsLists = document.querySelectorAll('.js-friends-list');
let friendsFilters = document.querySelectorAll('.js-filter');
let saveButton = document.querySelector('.js-save');
let modalCloseButton = document.querySelector('.js-modal-close');
let modal = document.querySelector('.js-modal');

function callAPI(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, (result) => {
            if (result.error) {
                reject();
            } else {
                resolve(result.response);
            }
        });
    });
}

function login() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 5906385
        });
        VK.Auth.login(result => {
            if (result.status === 'connected') {
                resolve(result.session.mid);
            } else {
                reject();
            }
        });
    });
}

function getCookieValueByName(cookieName) {
    let cookieItem = document.cookie.split('; ')
        .map(cookieItem => cookieItem.split('='))
        .filter(cookieItem => cookieItem[0] === cookieName)[0];

    if (cookieItem) {
        return cookieItem[1].split(',').map(cookieItem => +cookieItem);
    }
}

function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();

    return full.includes(chunk);
}

function createFriendDiv(friend, isSelected) {
    return friendTemplate({
        friend: friend,
        isSelected: isSelected
    });
}

function toggleSelection(friendId) {
    let fromArray;
    let toArray;

    if (idleFriendsIds.includes(friendId)) {
        fromArray = idleFriendsIds;
        toArray = selectedFriendsIds;
    } else {
        fromArray = selectedFriendsIds;
        toArray = idleFriendsIds;
    }

    fromArray.splice(fromArray.indexOf(friendId), 1);
    toArray.push(friendId);
}

function toggleElement(friendId) {
    let friendsGroups = [];

    friendsLists.forEach(friendsList => {
        friendsGroups.push(friendsList.querySelectorAll('.js-friends-item'));
    });

    friendsGroups.forEach(friendsGroup => {
        friendsGroup.forEach(friendItem => {
            if (friendItem.dataset.friendId === friendId) {
                if (friendItem.style.display === 'none') {
                    friendItem.style.display = 'flex';
                } else {
                    friendItem.style.display = 'none';
                }
            }
        });
    });
}

if (friendsFilters && friendsFilters.length !== 0) {
    friendsFilters.forEach(friendsFilter => {
        friendsFilter.addEventListener('keyup', e => {
            let filterValue = e.target.value;
            let filterType = e.target.dataset.filter;
            let friendsContainer = document.querySelector(`.js-friends-list-${filterType}`)
            let friendsItems = friendsContainer.querySelectorAll('.js-friends-item');
            let filterIds = filterType === 'idle' ? idleFriendsIds : selectedFriendsIds;
            let friendId;
            let friendName;

            if (friendsItems && friendsItems.length > 0) {
                friendsItems.forEach(friendsItem => {
                    friendId = +friendsItem.dataset.friendId;
                    friendName = friendsItem.dataset.friendName;

                    if (isMatching(friendName, filterValue) && filterIds.includes(friendId)) {
                        friendsItem.style.display = 'flex';
                    } else {
                        friendsItem.style.display = 'none';
                    }
                });
            }
        });
    });
}

login()
    .then(() => {
        return callAPI('friends.get', { v: 5.62, fields: ['photo_100'] });
    })
    .then(result => {
        modal.style.display = 'flex';
        let idleFriendsList = modal.querySelector('.js-friends-list-idle');
        let selectedFriendsList = modal.querySelector('.js-friends-list-selected');

        idleFriendsList.innerHTML = '';
        selectedFriendsList.innerHTML = '';

        idleFriendsIds = result.items
            .filter(friend => {
                if (!selectedFriendsIds.includes(friend.id)) {
                    return friend;
                }
            })
            .map(friend => friend.id);

        result.items.forEach(friendData => {
            idleFriendsList.innerHTML += createFriendDiv(friendData, false);
            selectedFriendsList.innerHTML += createFriendDiv(friendData, true);
        });

        let idleFriendsItems = idleFriendsList.querySelectorAll('.js-friends-item');
        let selectedFriendsItems = selectedFriendsList.querySelectorAll('.js-friends-item');

        selectedFriendsItems.forEach(selectedFriend => {
            if (selectedFriendsIds.includes(+selectedFriend.dataset.friendId)) {
                selectedFriend.style.display = 'flex';
            } else {
                selectedFriend.style.display = 'none';
            }
        });

        idleFriendsItems.forEach(idleFriend => {
            if (idleFriendsIds.includes(+idleFriend.dataset.friendId)) {
                idleFriend.style.display = 'flex';
            } else {
                idleFriend.style.display = 'none';
            }
        });

        toggleFriendInit();
    });

function toggleFriendInit() {
    let selectButtons = document.querySelectorAll('.js-select-button');
    let friendInfos = document.querySelectorAll('.js-friend-info');
    let friendId;
    let isMouseDown = false;
    let targetFriendClone;
    let fromList;
    let toList;

    selectButtons.forEach(selectButton => {
        selectButton.addEventListener('click', e => {
            friendId = e.target.parentNode.dataset.friendId;

            toggleSelection(+friendId);
            toggleElement(friendId);
        })
    });

    friendInfos.forEach(friendInfo => {
        let targetFriend;

        friendInfo.addEventListener('mousedown', e => {
            targetFriend = e.currentTarget;
            friendId = e.currentTarget.parentNode.dataset.friendId;

            isMouseDown = true;
            fromList = targetFriend.parentNode.parentNode;
            toList = fromList === friendsLists[0] ? friendsLists[1] : friendsLists[0];
            targetFriendClone = targetFriend.cloneNode(true);
            targetFriendClone.classList.add('friends__item--clone');
            targetFriendClone.style.top = `${e.y}px`;
            targetFriendClone.style.left = `${e.x}px`;
            targetFriendClone.style.width = `${targetFriend.parentNode.clientWidth}px`;
            document.body.appendChild(targetFriendClone);
        });
    });

    document.body.addEventListener('mousemove', e => {
        if (isMouseDown && targetFriendClone) {
            targetFriendClone.style.display = 'flex';
            targetFriendClone.style.top = `${e.y}px`;
            targetFriendClone.style.left = `${e.x}px`;
        }
    });

    document.body.addEventListener('mouseup', e => {
        isMouseDown = false;

        if (targetFriendClone && targetFriendClone.parentNode) {
            targetFriendClone.parentNode.removeChild(targetFriendClone);
        }

        if (e.y > toList.offsetTop
            && e.y < toList.offsetTop + toList.clientHeight
            && e.x > toList.offsetLeft
            && e.x < toList.offsetLeft + toList.clientWidth) {
            toggleSelection(+friendId);
            toggleElement(friendId);
        }
    });
}

saveButton.addEventListener('click', () => {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = `selectedFriendsIds=${selectedFriendsIds}`;
    location.reload();
});

modalCloseButton.addEventListener('click', () => {
    modal.style.display = 'none';
});