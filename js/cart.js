const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        try {
            const cookieVal = parts.pop().split(';').shift();
            return JSON.parse(decodeURIComponent(cookieVal));
        } catch (e) {
            return [];
        }
    }
    return [];
};

const setCookie = (name, value, days = 7) => {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const stringifiedValue = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${name}=${stringifiedValue};expires=${d.toUTCString()};path=/`;
};

function updateCartCount() {
    const cart = getCookie('kapsula_cart');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

function removeFromCart(id) {
    let cart = getCookie('kapsula_cart');
    cart = cart.filter(item => item.id !== String(id));
    setCookie('kapsula_cart', cart);
    renderCart();
    updateCartCount();
}

function clearCart() {
    setCookie('kapsula_cart', [], -1); 
    renderCart();
    updateCartCount();
}

function renderCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    const cart = getCookie('kapsula_cart');
    const cartHeader = document.querySelector('.cart-header');
    
    if (cart.length === 0) {
        if (cartHeader) cartHeader.style.display = 'none';
        container.innerHTML = `
            <div class="empty-cart">
                <h2>Ваш кошик порожній</h2>
                <p style="color: #777; margin-bottom: 25px;">Здається, ви ще нічого не додали.</p>
                <a href="clotnes.html" class="btn-add btn-large" style="text-decoration:none; display:inline-block; text-align:center;">Повернутися до покупок</a>
            </div>
        `;
        return;
    }

    if (cartHeader) cartHeader.style.display = 'flex';
    
    let html = '<div class="cart-list">';
    let total = 0;

    cart.forEach((item) => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;

        const imgSrc = item.image || item.img || 'imgcard/jacket.jpg';

        html += `
            <div class="cart-item">
                <div class="cart-item-left">
                    <img src="${imgSrc}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <p class="cart-item-qty">Кількість: <strong>${item.quantity || 1} шт.</strong></p>
                        <p class="cart-item-price">${itemTotal} $</p>
                    </div>
                </div>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')">
                    Видалити
                </button>
            </div>
        `;
    });

    html += `</div>
        <div class="cart-summary">
            <div class="cart-summary-total">
                <span>Загальна сума:</span>
                <strong>${total} $</strong>
            </div>
            <a href="checkout.html" class="btn-add btn-large" style="text-decoration:none; display:block; text-align:center;">Перейти до оформлення</a>
        </div>
    `;

    container.innerHTML = html;
}

function renderCheckout() {
    const totalElement = document.getElementById('checkout-total');
    if (!totalElement) return;

    const cart = getCookie('kapsula_cart');
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    totalElement.innerText = total;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    renderCheckout();
});