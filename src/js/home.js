
(async function load() {
  
  // get the data of the api
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data;
  }
  
  // create a template for the movies
  function videoItemTemplate(movie) {
    return (
      `<div class="primaryPlaylistItem"> 
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }

  // create variables of list of movies based on genres
  const actionList =  await getData('https://yts.mx/api/v2/list_movies.json?genre=action');
  const drameList = await getData('https://yts.mx/api/v2/list_movies.json?genre=drama');
  const animationList = await getData('https://yts.mx/api/v2/list_movies.json?genre=animation');

  debugger

  actionList.data.movies.forEach((movie) => {
    const HTMLString = videoItemTemplate(movie);
    console.log(HTMLString)
  });

  const $actionContainer = document.querySelector('#action');
  const $dramaContainer = document.getElementById('#drama');
  const $animationContainer = document.getElementById('#animation');

  const $featuringContainer = document.getElementById('#featuring');
  const $form = document.getElementById('#form');
  const $home = document.getElementById('#home');

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle =  $modal.querySelector('h1');
  const $modalImage =  $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');



})()

