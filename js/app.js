const form = document.querySelector('form');
const formWrapper = form.querySelector('.form-wrapper');
const formInput = form.querySelector('.input');
const PER_PAGE = 5;

function debounce(fn, ms) {
  let timeout;

  return function() {
    const fnCall = () => { fn.apply(this, arguments)}
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  }
}

function requestRepositories(e) {
  const valueInput = e.target.value;
  formWrapper.innerHTML = '';

  if (valueInput.length === 0) {
    formWrapper.insertAdjacentHTML('beforeend', `<span>Введите данные!</span>`);
    return;
  }

  fetch(`https://api.github.com/search/repositories?q=${valueInput}&per_page=${PER_PAGE}`)
    .then(response => {
      if (!response.ok) {
        throw('Ошибка данных!');
      }
      const data = response.json();
      return data;
    })
    .then(data => {
      data.items.forEach(el => {
        formWrapper.insertAdjacentHTML('beforeend', `<div class='output-link' data-attr="${el.id}">${el.name}</div>`);
      })
      const formOutputLinks = form.querySelectorAll('.output-link');
      [...formOutputLinks].forEach(el => {
        el.addEventListener('click', (e) => {
          const res = data.items.find(item => item.id === +el.dataset.attr);
          formWrapper.insertAdjacentHTML('beforeend', `<div class='output-res'>
          <span>Name: ${res.name}</span>
          <span class='close'>X</span>
          <span>Owner: ${res.owner.login}</span>
          <span>Stars: ${res.stargazers_count}</span>`);
          formInput.value = '';
        })
      })
    })
    .then(() => {
      formWrapper.addEventListener('click', (e) => {
        if (e.target.className != 'close') return;

        let out = e.target.closest('.output-res');
        out.remove();
      })
    })
    .catch(e => {
      formWrapper.insertAdjacentHTML('beforeend', `<span>${e}</span>`);
      console.log(e);
    });
}

requestRepositories = debounce(requestRepositories, 500)

formInput.addEventListener('keyup', requestRepositories);
