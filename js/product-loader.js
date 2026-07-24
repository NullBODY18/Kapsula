async function loadProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        if (window.location.pathname.includes('product.html')) {
            window.location.href = '404.html';
        }
        return;
    }

    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Не вдалося завантажити products.json');

        const data = await response.json();

        let product = null;
        if (Array.isArray(data)) {
            product = data.find(item => String(item.id) === String(id));
        } else {
            product = data[id];
        }

        if (!product) {
            if (window.location.pathname.includes('product.html')) {
                window.location.href = '404.html';
            }
            return;
        }

        const productName = product.name;
        const productPrice = product.price;
        const productImg = product.img || product.image;
        const productDesc = product.desc || product.description || "Опис товару незабаром з'явиться.";
        const productMaterial = product.material || "Склад вказано на етикетці";
        const productSizes = product.sizes || ["S", "M", "L"];

        document.title = `Kapsula - ${productName}`;

        const sizeOptions = productSizes.map(size => `<option value="${size}">${size}</option>`).join('');
        const container = document.getElementById('product-container');

        if (container) {
            container.innerHTML = `
                <section class="product-section">
                    <div class="product-image-wrapper">
                        <img src="${productImg}" alt="${productName}">
                    </div>
                    <div class="product-details">
                        <h1>${productName}</h1>
                        <p class="product-price">${productPrice}$</p>
                        <p class="product-description">${productDesc}</p>
                        <p class="product-material"><strong>Матеріал:</strong> ${productMaterial}</p>
                        
                        <div class="product-options">
                            <label for="size-select" class="size-label">Оберіть розмір:</label>
                            <select id="size-select" class="size-select">
                                <option value="" disabled selected>Розмір</option>
                                ${sizeOptions}
                            </select>
                            <span id="size-error" class="size-error">Будь ласка, оберіть розмір</span>
                        </div>

                        <button id="add-to-cart-btn" class="btn-add btn-large">Додати в кошик</button>
                    </div>
                </section>
            `;

            document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                const sizeSelect = document.getElementById('size-select');
                const sizeError = document.getElementById('size-error');
                const selectedSize = sizeSelect.value;

                if (!selectedSize) {
                    sizeSelect.classList.add('select-invalid');
                    sizeError.style.display = 'block';
                    return;
                }

                sizeSelect.classList.remove('select-invalid');
                sizeError.style.display = 'none';

                addToCart({
                    id: `${id}-${selectedSize}`,
                    productId: id,
                    name: `${productName} (${selectedSize})`,
                    price: productPrice,
                    size: selectedSize,
                    image: productImg
                });

                const btn = document.getElementById('add-to-cart-btn');
                const originalText = btn.innerText;
                btn.innerText = "Додано ✓";
                btn.style.backgroundColor = "#5a5147";
                btn.style.color = "#fff";

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                }, 1500);
            });
        }

    } catch (error) {
        console.error('Помилка виконання:', error);
        if (window.location.pathname.includes('product.html')) {
            window.location.href = '404.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadProductPage);