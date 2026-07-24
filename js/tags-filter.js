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

let catalogProducts = [];
let activeTags = new Set();

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

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

    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            catalogProducts = data;
            
            const catalogContainer = document.getElementById('catalog-container');
            const tagsContainer = document.getElementById('tags-container');

            if (catalogContainer && tagsContainer) {
                generateTagButtons(catalogProducts);
                displayProducts(catalogProducts);
            }
        })
        .catch(err => console.error('Помилка завантаження JSON:', err));
});

function generateTagButtons(products) {
    const tagsContainer = document.getElementById('tags-container');
    if (!tagsContainer) return;

    const uniqueTags = new Set();
    products.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => uniqueTags.add(tag));
        }
    });

    tagsContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn active';
    allBtn.textContent = 'Усі';
    allBtn.addEventListener('click', () => {
        activeTags.clear();
        updateTagStyles();
        displayProducts(catalogProducts);
    });
    tagsContainer.appendChild(allBtn);

    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;

        btn.addEventListener('click', () => {
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
            } else {
                activeTags.add(tag);
            }

            updateTagStyles();
            filterProducts();
        });

        tagsContainer.appendChild(btn);
    });
}

function updateTagStyles() {
    const buttons = document.querySelectorAll('.tag-btn');
    buttons.forEach(btn => {
        const tag = btn.dataset.tag;
        if (!tag) {
            btn.classList.toggle('active', activeTags.size === 0);
        } else {
            btn.classList.toggle('active', activeTags.has(tag));
        }
    });
}

function filterProducts() {
    if (activeTags.size === 0) {
        displayProducts(catalogProducts);
        return;
    }

    const filtered = catalogProducts.filter(product => {
        if (!product.tags) return false;
        return product.tags.some(t => activeTags.has(t));
    });

    displayProducts(filtered);
}

function displayProducts(products) {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 40px 0; font-size: 18px;">Товарів за обраними тегами не знайдено.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        const img = product.image || product.img || '';
        const price = product.price || 0;
        const name = product.name || '';

        return `
            <a href="product.html?id=${product.id}" class="card">
                <div class="card-img-wrapper">
                    <img src="${img}" class="card-img" alt="${name}">
                </div>
                <div class="card-info">
                    <h3 class="card-title">${name}</h3>
                    <p class="card-price">${price}$</p>
                    <button class="btn-add" 
                        data-id="${product.id}" 
                        data-name="${name}" 
                        data-price="${price}" 
                        onclick="event.preventDefault();">Додати в кошик</button>
                </div>
            </a>
        `;
    }).join('');
}