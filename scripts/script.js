const headerCityButton = document.querySelector('.header__city-button');

let hash = location.hash.substring(1);
headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?'

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город');
  headerCityButton.textContent = city;
  localStorage.setItem('lomoda-location', city)
})

// блокировка скролла

const disabledScroll = () => {
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
    position: fixed;
    width: 100%;
    height: 100vh;
    top: ${-window.scrollY}px;
    overflow: hidden;
    padding-right: ${widthScroll}px;
    `;
}

const enabledScroll = () => {
  document.body.style.cssText = ``;
  window.scroll({
    top: document.body.dbScrollY
  });
}

// модальное окно (корзина)

const subheaderCart = document.querySelector('.subheader__cart');

const cartOverlay = document.querySelector('.cart-overlay');

const openCartModel = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disabledScroll();
}

const closeCartModel = () => {
  cartOverlay.classList.remove('cart-overlay-open');
  enabledScroll();
}

// запрос базы данных

const getData = async () => {
  const data = await fetch('db.json');

  if (data.ok) {
    return data.json();
  }
  else {
    throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`)
  }
}

const changeTitle = () => {
  let navigationLinks = document.querySelectorAll('.navigation__link');
  const goodsTitle = document.querySelector('.goods__title');
  navigationLinks.forEach((link) => {
      if (link.hash.substring(1) == hash) {
          goodsTitle.textContent = link.innerHTML;
      }
    })

}

const getGoods = (callback, value) => {
  getData()
    .then(data => {
      if (value) {
        callback(data.filter(item => item.category === value))
      }
      else {
        callback(data);
      }
    })
    .catch(err => {
      console.error(err);
    })
};

subheaderCart.addEventListener('click', openCartModel)

cartOverlay.addEventListener('click', event => {
  const target = event.target;
  if (target.classList.contains('cart__btn-close') || target.classList.contains('cart-overlay')) {
    closeCartModel();
  }
})

document.addEventListener('keydown', event => {
  if (event.key == 'Escape' && cartOverlay.classList.contains('cart-overlay-open')) {
    closeCartModel();
  }
})

try {

  const goodsList = document.querySelector('.goods__list');
  if (!goodsList) {
    throw 'This is not a goods page';
  }

  const createCard = ({ id, preview, cost, brand, name, sizes}) => {
    const li = document.createElement('li');

    li.classList.add('goods__item');
    li.innerHTML = `
      <article class="good">
        <a class="good__link-img" href="card-good.html#${id}">
            <img class="good__img" src="goods-image/${preview}" alt="">
        </a>
        <div class="good__description">
            <p class="good__price">${cost} &#8381;</p>
            <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
            ${sizes ?
              `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
              ''}
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
      </article>
    `;

    return li;
  }

  const renderGoodsList = data => {
    goodsList.textContent = '';
    changeTitle();

    data.forEach(item => {
      const card = createCard(item);
      goodsList.append(card);
    });
  }

  

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    changeTitle();
    getGoods(renderGoodsList, hash);

  })

  getGoods(renderGoodsList, hash);

} catch (n) {
  console.warn(n)
}