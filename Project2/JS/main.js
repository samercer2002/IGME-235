window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
//API documentation https://docs.mhw-db.com
let displayTerm = "";
	
function searchButtonClicked(){

    const API_URL = "https://mhw-db.com/";
    let url = API_URL;

    let term = document.querySelector("#type").value;
    displayTerm = term;

    term = term.trim();

    term = encodeURIComponent(term);

    if(term.length < 1) 
    {
        return;
    }
    url += term;

    //let limit = document.querySelector("#limit").value;
    //url += "?limit=" + limit;

    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    //console.log(url);

    getData(url);
}

function getData(url)
    {
        let xhr = new XMLHttpRequest();
        xhr.onload = dataLoaded;
        xhr.onerror = dataError;

        xhr.open("GET", url);
        xhr.send();
    }

function dataLoaded(e)
    {
        let xhr = e.target;
        console.log(xhr.responseText);

        let obj = JSON.parse(xhr.responseText);

        if(/*!obj.data ||*/ obj.length == 0)
        {
            document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            return;
        }

        let results = obj;
        console.log("results.length = " + results.length);
        let bigString = "<h2>Results</h2>";
        bigString += "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";
        bigString += "<div class='results'>";
        let limit = document.querySelector("#limit").value;
        let term = document.querySelector("#type").value;
        for(let i = 0; i < limit; i++)
        {
            let result = results[i];
            let smallURL;
            let line;
            switch(term)
            {
                case "weapons":
                    smallURL = result.assets.image;
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line = `<div class = 'result'><img src='${smallURL}' title = '${result.id}' />`;
                    line += `</div>`;
                    break;
                case "armor":
                    smallURL = result.assets.imageMale;
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line = `<div class = 'result'><img src='${smallURL}' title = '${result.id}' />`;
                    line += `<div class = 'data'>Name: ${result.name}</div>`
                    /*smallURL = result.assets.imageFemale;
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line += `<img src='${smallURL}' title = '${result.id}' />`;*/
                    line += `</div>`;
                    break;
                case "charms":
                    line = "";
                    break;
            }

            bigString += line;
        }
        bigString += "</div>"
        document.querySelector("#content").innerHTML = bigString;

        document.querySelector("#status").innerHTML = "<b>Success!</b>";
    }
function dataError(e)
    {
         console.log("An error occurred");   
    }