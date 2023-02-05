var searchResultFormat = '<tr><td><a href="$link" target="_blank">$topic</a></td><td align="left">$description</td></tr>';
var totalLimit = 250;

var controls = {
    oldColor: '',
    displayResults: function() {
        if (results.style) {
            results.style.display = '';
        }
        resultsTableHideable.classList.remove('hide');
    },
    hideResults: function() {
        if (results.style) {
            results.style.display = 'none';
        }
        resultsTableHideable.classList.add('hide');
    },
    // Searching Algorithm
    // Search is 'case insensitive'.
    // All the words in topic, description and tag in dataset is used for searching
    doSearch: function(match, dataset) {
        results = [];

        words = match.toLowerCase();
        words = words.split(' ');
        regex = '';
        posmatch = [];
        negmatch= [];

        // Lazy way to create regex (?=.*word1)(?=.*word2) this matches all words.
        for (i = 0; i < words.length; i++) {
            if (words[i][0] != '-') {
                posmatch.push(words[i]);
                regex += '(?=.*' + words[i] + ')';
            } else {
                negmatch.push(words[i].substring(1));
            }
        }
        if (negmatch.length > 0 ) {
          regex += '(^((?!(';
          for (i= 0; i < negmatch.length; i++) {
            regex += negmatch[i];
            if (i != negmatch.length -1) {
              regex += '|';
            }
          }
        regex += ')).)*$)';
        }

        // All the words in topic, description and tag in dataset is used for searching
        dataset.forEach(e => {
            if ( (e.topic + e.description + e.tag).toLowerCase().match(regex) ) results.push(e);
        });
        return results;
    },
    updateResults: function(loc, results) {
        if (results.length == 0) {
            noResults.style.display = '';
            noResults.textContent = 'No Results Found';

            resultsTableHideable.classList.add('hide');
        } else if (results.length > totalLimit) {
            noResults.style.display = '';
            resultsTableHideable.classList.add('hide');
            noResults.textContent = 'Error: ' + results.length + ' results were found. Try to be more specific.';
            this.setColor(colorUpdate, 'too-many-results');
        } else {
            var tableRows = loc.getElementsByTagName('tr');
            for (var x = tableRows.length - 1; x >= 0; x--) {
                loc.removeChild(tableRows[x]);
            }

            noResults.style.display = 'none';
            resultsTableHideable.classList.remove('hide');

            results.forEach(r => {
                el = searchResultFormat
                        .replace('$topic', r.topic)
                        .replace('$description', r.description)
                        .replace('$link', r.link);

                        var wrapper = document.createElement('table');
                        wrapper.innerHTML = el;
                        var div = wrapper.querySelector('tr');

                        loc.appendChild(div);
            });
        }
    },
    setColor: function(loc, indicator) {
        if (this.oldColor == indicator) return;
        var colorTestRegex = /^color-/i;

        loc.classList.forEach(cls => {
            //we cant use class so we use cls instead :>
            if (cls.match(colorTestRegex)) loc.classList.remove(cls);
        });
        loc.classList.add('color-' + indicator);
        this.oldColor = indicator;
    }
};
window.controls = controls;

document.addEventListener('DOMContentLoaded', function() {
    // 'document.querySelector' selects the complete html element with all it's property e.g. <div>
    results = document.querySelector('div.results');
    searchValue = document.querySelector('input.search'); // Points to the input search field
    space = document.querySelector('select.space'); // Points to the dropdown menu
    form = document.querySelector('form.searchForm');
    resultsTableHideable = document.getElementsByClassName('results-table').item(0);
    resultsTable = document.querySelector('tbody.results');
    resultsTable = document.querySelector('tbody.results');
    noResults = document.querySelector('div.noResults');
    colorUpdate = document.body;

    // Preventing initial fade
    document.body.classList.add('fade');

    var currentSet = [];
    var oldSearchValue = '';

    function doSearch(event) {
        // val will store the text entered in the search box
        var val = searchValue.value;

        if (val != '') {
            controls.displayResults();

            // Fetch the dataset again (e.g after changing the space)
            fetchDataSet();

            currentSet = window.dataset;
            oldSearchValue = val;

            // Pass the text to search along with the dataset where we need to search.
            currentSet = window.controls.doSearch(val, currentSet);
            if (currentSet.length < totalLimit) window.controls.setColor(colorUpdate, currentSet.length == 0 ? 'no-results' : 'results-found');

            window.controls.updateResults(resultsTable, currentSet);
        } else {
            controls.hideResults();
            window.controls.setColor(colorUpdate, 'no-search');
            noResults.style.display = 'none';
            currentSet = window.dataset;
        }

        if (event.type == 'submit') event.preventDefault();
    }

    // Function to fetch the appropriate dataset based on the search space
    function fetchDataSet(){
    var datasetToLoad;
    switch(space.value){
        case 'security':
            datasetToLoad = './dataset/security.json'
            break;
        case 'development':
            datasetToLoad = './dataset/development.json'
            break;
        case 'hardware':
            datasetToLoad = './dataset/hardware.json'
            break;
        case 'tools':
            datasetToLoad = './dataset/tools.json'
            break;
        case 'tech':
            datasetToLoad = './dataset/tech.json'
            break;
        case 'non-tech':
            datasetToLoad = './dataset/non-tech.json'
            break;
        default:
            datasetToLoad = './dataset/dataset.json'
    }

    fetch(datasetToLoad)
        .then(res => res.json())
        .then(data => {
            window.dataset = data;
            currentSet = window.dataset;
            window.controls.updateResults(resultsTable, window.dataset);
            doSearch({ type: 'none' });
        });
    }

    // Fetch the dataset for the fist time
    fetchDataSet();

    form.submit(doSearch);

    searchValue.addEventListener('input', doSearch);
});

// Function to fetch the appropriate dataset
