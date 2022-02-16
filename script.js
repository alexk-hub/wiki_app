$(function() {

    class View {
        constructor() {
            this.$input = $(".input");
            this.$searchButton = $(".btn-search");
            this.$cards = $(".cards");
            this.$loader = $(".loader");
            this.$result = $(".result");
        }
        showArticles = (data) => {
            this.$cards.append($('<div></div>').addClass("card-wrap")
                .append($('<div></div>').addClass("card").html(data)));
        }
        showLoader = () => {
            this.$cards.html("");
            this.$result.html("");
            this.$loader.show();
        }
        hideLoader = () => {
            this.$loader.hide();
        }
        showError = (msg) => {
            this.$result.html(msg);
        }
    }

    class Model {
        constructor(view) {
            this.view = view;
        }
        searchHandle = () => {
            this.startSearching(this.view.$input.val());
        }
        startSearching = (searchValue) => {
            if (searchValue == "") {
                this.view.showError("Please enter a text to search!");
            } else {
                this.view.showLoader();
                this.getSearchResult(searchValue);
            }
        }
        checkHits = (hits) => {
            if (hits == 0) {
                this.view.showError("No result found, please try another request.");
                this.view.hideLoader();
            }
        }
        cutTitle = (title, max) => {
            if (title.length > max) {
                let shortenedTitle = title.slice(0, max) + "...";
                return shortenedTitle;
            }
            return title;
        }
        getSearchResult = (searchValue) => {
            $.ajax("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&list=search&titles=" + searchValue + "&rvprop=content&srsearch=" + searchValue + "&srlimit=8&srinfo=totalhits&srprop=snippet", {
                    context: this,
                    dataType: "jsonp"
                })

                .done(function(data) {
                    let searchResults = data.query.search;
                    let totalHits = data.query.searchinfo.totalhits;
                    this.checkHits(totalHits);
                    for (let i = 0; i < searchResults.length; i++) {
                        let output = searchResults[i];
                        let title = output.title;
                        let url = "https://en.wikipedia.org/wiki/" + title.replace(/\s/g, "_");
                        let maxTitleLength = 25;
                        let shortTitle = this.cutTitle(title, maxTitleLength);
                        let cardData = `<h2>${shortTitle}</h2>` + `<p>${output.snippet}...</p>` + `<a href=${url} target="_blank" class='art-btn'>Read more</a>`;
                        this.view.showArticles(cardData);
                    }
                    this.view.hideLoader();
                });
        }
    }

    class Controller {
        constructor(view, model) {
            this.view = view;
            this.model = model;
        }
        handle() {
            this.view.$input.on('keydown', (event) => {
                if (event.which === 13) {
                    event.preventDefault();
                    this.model.searchHandle();
                }
            });
            this.view.$searchButton.on('click', this.model.searchHandle);
        }
    }

    (function init() {
        const view = new View();
        const model = new Model(view);
        const controller = new Controller(view, model);
        controller.handle();
    })();

});