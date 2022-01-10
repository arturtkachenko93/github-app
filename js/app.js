document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const formWrapper = form.querySelector('.form-wrapper');
  const resWrapper = form.querySelector('.res-wrapper');
  const formInput = form.querySelector('.input');
  const PER_PAGE = 5;

  // задержка для ввода в поле поиска
  function debounce(fn, ms) {
    let timeout;

    return function() {
      const fnCall = () => { fn.apply(this, arguments)}
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, ms);
    }
  }

  // запрос к API
  function requestRepositories(e) {
    const valueInput = e.target.value;
    if (valueInput.length === 0) {
      formWrapper.innerHTML = '';
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
        // hundler по клику на один из элементов автокомплита
        const clickOutput = (e) => {
          const link = e.target.closest('.output-link');
          if (link) {
            const res = data.items.find(item => item.id === +link.dataset.attr);
            resWrapper.insertAdjacentHTML('beforeend', `<div class='output-res'>
            <span>Name: ${res.name}</span>
            <span class='close'>X</span>
            <span>Owner: ${res.owner.login}</span>
            <span>Stars: ${res.stargazers_count}</span>`);
            formInput.value = '';
            formWrapper.innerHTML = '';
            // удаление обработчика по клику на элемент
            formWrapper.removeEventListener('click', clickOutput);
          }
        }
        formWrapper.addEventListener('click', clickOutput);
      })
      .then(() => {
        // hundler по нажатию кнопки "закрыть" по репозиторию
        const removeRes = (e) => {
          if (e.target.className != 'close') return;

          let out = e.target.closest('.output-res');
          out.remove();
          // удаление обработчика событий кнопки "закрыть"
          if (btnsClose.length === 0) {
            resWrapper.removeEventListener('click', removeRes)
          }
        }

        resWrapper.addEventListener('click', removeRes)
      })
      .catch(e => {
        formWrapper.insertAdjacentHTML('beforeend', `<span>${e}</span>`);
      });
  }

  requestRepositories = debounce(requestRepositories, 500)

  formInput.addEventListener('keyup', requestRepositories);
})