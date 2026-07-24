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

const updateCartCount = () => {
    const cart = getCookie('kapsula_cart');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }
};

const addToCart = (product) => {
    let cart = getCookie('kapsula_cart');
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    setCookie('kapsula_cart', cart);
    updateCartCount();
};

async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Помилка завантаження товарів');
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження JSON:', error);
        return [];
    }
}

async function renderHomeProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const products = await fetchProducts();
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const randomProducts = shuffled.slice(0, 4);
    
    let html = randomProducts.map(product => `
        <a href="product.html?id=${product.id}" class="card">
            <div class="card-img-wrapper">
                <img src="${product.image}" class="card-img" alt="${product.name}">
            </div>
            <div class="card-info">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-price">${product.price}$</p>
                <button class="btn-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" onclick="event.preventDefault();">Додати в кошик</button>
            </div>
        </a>
    `).join('');

    html += `
        <a href="clotnes.html" class="more-card">
            <span class="plus-icon">+</span>
            <span class="more-text">Більше товарів</span>
        </a>
    `;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderHomeProducts();

    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-add');
        if (!button) return;

        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);

        if (id && name) {
            addToCart({ id, name, price });
            
            const originalText = button.innerText;
            button.innerText = "Додано ✓";
            button.style.backgroundColor = "#5a5147";
            button.style.color = "#fff";
            
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = "";
                button.style.color = "";
            }, 1500);
        }
    });
});