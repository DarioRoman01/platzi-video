
(async function load() {

  // APIs url
  const BASE_API = 'https://yts.mx/api/v2/';
  const USERS_API = 'https://randomuser.me/api/?exc=info,registered,timezone,nat&results=8';

  // document elements, the elements variables start with $ to distinguish from other variables
  const $actionContainer = document.querySelector('#action');
  const $dramaContainer = document.getElementById('drama');
  const $animationContainer = document.getElementById('animation');
  const $usersContainer = document.getElementById('playlistFriends');

  const $featuringContainer = document.getElementById('featuring');
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle =  $modal.querySelector('h1');
  const $modalImage =  $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');
  
  // add attributes to a element
  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  // find user by name in users list
  function findByName(name, list) {
    return list.find(element => element.name.first === name);
  }

  // find movie by id in the list
  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  // find movie by category
  function findMovie(id , category) {
    switch (category) {
      case 'action':
        return findById(actionList, id)

      case 'drama':
        return findById(dramaList, id)

      case 'animation':
        return findById(animationList, id)
    }
  }

  // code to be executed when the user search for a movie
  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');

    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })
    $featuringContainer.append($loader);

    try {
      const data = new FormData($form);
      const {data: {movies: pelis}} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;
    } 
    catch (error) {
      $loader.remove()
      $home.classList.remove('search-active')
      alert(error.message);
    }
  })

  // generate users modal
  function showUserModal($element) {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards';
    const firstname = $element.dataset.name;
    const { 
      name, 
      picture, 
      email,
      dob,
      location,
      phone 
    } = findByName(firstname, users);
    $modalTitle.textContent = `${name.first} ${name.last}`;
    $modalImage.setAttribute('src', picture.large);
    $modalDescription.innerHTML = `
      <strong>Email:</strong> ${email}<br>
      <strong>Phone:</strong> ${phone}<br>
      <strong>Age:</strong> ${dob.age}<br>
      <strong>Location:</strong> ${location.city}. ${location.state}`;
  }

  // event to be executed when the user click on a movie
  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image)
    $modalDescription.textContent = data.description_full;
  }

  // hide the modal 
  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards'
  }

  // add hide modal to the button in the modal
  $hideModal.addEventListener('click', () => {
    hideModal();
  });

  // get the data of the api
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json();
    if (data.data.movie_count > 0) {
      return data;
    }
    else {
      throw new Error('no result was found :(');
    }
  }

  // get random users data
  async function getUsers(url) {
    const response = await fetch(url)
    const data = await response.json();
    if (data.info.results > 0) {
      return data
    }
    else {
      throw new Error('no friends online :(')
    }
  }
  
  // generate template for users
  function userTemplate (user) {
    return (
      `<li class="playlistFriends-item" data-name="${user.name.first}">
        <a href="#">
          <img src="${user.picture.thumbnail}" alt="user picture" />
          <span>
            ${user.login.username}
          </span>
        </a>
      </li>`
    )
  }

  // Generate template when a movie is found
  function featuringTemplate (movie) {
    return (
      `<div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${movie.title}</p>
        </div>
      </div>`
    )
  }
  
  // create a template for the movies
  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}"> 
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }

  // add click event for each movie
  function addEventClick($element) {
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }

  // add click event for each user
  function usersClick($element) {
    $element.addEventListener('click', () => {
      showUserModal($element)
    })
  }

  // Generate the template with the data
  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  // render users template
  function renderUsers(list, $container) {
    $container.children[0].remove();
    list.forEach((user) => {
      const HTMLString = userTemplate(user);
      const userElement = createTemplate(HTMLString);
      $container.append(userElement)
      usersClick(userElement)
    })
  }

  // Insert the templates in the DOM
  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.target.classList.add('fadeIn');
      })
      addEventClick(movieElement);
    });
  }
  
  // call random users api and render the users
  const {results:users} = await getUsers(USERS_API)
  renderUsers(users, $usersContainer)

  // call API to get the movies and render them
  const {data:{movies:actionList}} =  await getData(`${BASE_API}list_movies.json?genre=action`);
  renderMovieList(actionList, $actionContainer, 'action');

  const {data:{movies:dramaList}} = await getData(`${BASE_API}list_movies.json?genre=drama`);
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const {data:{movies:animationList}}  = await getData(`${BASE_API}list_movies.json?genre=animation`);
  renderMovieList(animationList, $animationContainer, 'animation');
})()