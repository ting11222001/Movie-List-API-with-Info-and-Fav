(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search') //addEventListener on DOM element: form
  const searchInput = document.getElementById('search-input')

  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []

  const displayBtn = document.querySelector('.displayBtn')
  let style_now = 'fa-th'
  let page = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(1, data) //開啟網頁時直接顯示
    // displayDataList(data)
  }).catch((err) => console.log(err))

  displayBtn.addEventListener('click', (event) => {
    //displayBtn.addEventListener 儲存 mode，因為只是要改變模式所以只傳入 page 不用傳入 data
    if (event.target.matches('.fa-th')) {
      style_now = 'fa-th'
      getPageData(page)
    } else if (event.target.matches('.fa-bars')) {
      style_now = 'fa-bars'
      getPageData(page)
    }
  })

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) { //add event listener on favorite button
      // console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault() //remove button's default function (sending requests to HTTP)
    // console.log('click!')
    // console.log(event.target)

    // search for movies by title
    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    //searchInput.value is the string we're matching; i means ignore upper/lower case

    results = data.filter(movie => movie.title.match(regex))
    // RegExp & match usually come together and filter will show results which are true
    console.log(results)
    // show those movie name matched (array of objects, each object is a movie info)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    // console.log(event.target.dataset.page)
    page = event.target.dataset.page //改變並儲存 page
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    pageNum = pageNum || page //在切換模式的時候保持在原本的頁數，瀏覽器現在有一個變數去儲存當前頁數進行到哪邊
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  function displayDataList(data) {
    if (style_now === 'fa-th') {
      let htmlContent = ''
      data.forEach(function (item, index) {
        htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>

              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
      })
      dataPanel.innerHTML = htmlContent
    } else if (style_now === 'fa-bars') {
      let htmlContent = ''
      data.forEach(function (item, index) {
        htmlContent += `
      <div class="col-12 pb-2">
         <div class="inline pull-left">
             <h6 class="card-title">${item.title}</h5>
         </div>
            
             <!-- "More" button -->
         <div class="inline pull-right">
             <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
             <!-- favorite button -->
             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
         </div>
        </div>
      </div> 
      `
      })
      dataPanel.innerHTML = htmlContent
    }
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  //add the selected movie to local storage
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    //如果已經建立收藏清單: const list = JSON.parse(localStorage.getItem('favoriteMovies'))
    //如果還沒有任何收藏清單: const list = []
    //若使用者是第一次使用收藏功能，則 localStorage.getItem('favoriteMovies') 會找不到東西，所以需要建立一個空 Array.
    //favoriteMovies is an array of objects.
    const movie = data.find(item => item.id === Number(id))
    //是從電影總表中找出 id 符合條件的電影物件，find 可以依條件檢查 Array，並且回傳第一個符合條件的值(object)。
    //local storage 裡的 value 是 string type，也就是存入 data 時需要呼叫 JSON.stringify(obj)，而取出時需要呼叫 JSON.parse(value)。
    //從 HTML 取出的 id 會是 string type，而經過 JSON.parse 之後的 id 會是 number type，所以使用 === 的時候要小心。

    if (list.some(item => item.id === Number(id))) {
      //用來判斷是否清單中已有相同的電影(至少一個相同就會回傳true)，如果沒有則會新增。some 則可以依條件檢查 Array 後回傳 boolean。
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }

    localStorage.setItem('favoriteMovies', JSON.stringify(list))
    //key is 'favoriteMovies', value is JSON.stringify(list)
  }
})()