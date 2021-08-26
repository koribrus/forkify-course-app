import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { CLASS } from 'postcss-selector-parser';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0. Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    // 1. updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2. loading recipe (data)
    await model.loadRecipe(id);

    // 3. rendering recipe
    recipeView.render(model.state.recipe);
    console.log(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function (query) {
  try {
    // 1. get search query
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();
    // 2. laod search results
    await model.loadSearchResults(query);

    // 3. render results
    // resultsView.render(model.state.search.results); // ALL SEARCH RESULTS LOADED
    resultsView.render(model.getSearchResultsPage()); // PAGINATION RESULTS LOADED
    // 4. render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2. render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe servings (in state)
  model.updateServings(newServings);
  // update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function (recipe) {
  // 1. add/delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. update recipe view
  recipeView.update(model.state.recipe);

  // 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // uplaod new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render uploaded recipe
    recipeView.render(model.state.recipe);

    // display success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close modal window/form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};

init();
