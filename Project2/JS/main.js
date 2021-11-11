window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked;
start();};
//API documentation https://docs.mhw-db.com
let displayTerm = "";
let randomize


function start()
{
    randomize = false;
    let button = document.querySelector("input[type='checkbox']");
    button.addEventListener("change",setRandom);
}

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
        let limit = document.querySelector("#limit").value;
        let term = document.querySelector("#type").value;
        bigString += "<p><i>Here are " + limit+ " results for '" + displayTerm + "'</i></p>";
        bigString += "<div class='results'>";
        for(let i = 0; i < limit; i++)
        {
            let result;
            let smallURL;
            let line;
            if(randomize)
            {
                let randomNumber = getRandomIntInclusive(0,results.length-1);
                result = results[randomNumber];
                console.log(randomNumber);
            }
            else{
                result = results[i];
            }
            
            switch(term)
            {
                case "weapons":
                    if(result.assets == null)
                    {
                        smallURL = "images/no-image-found.png";
                    }
                    else{
                        smallURL = result.assets.image;
                    }
                    
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line = `<div class = 'result'><img src='${smallURL}' title = '${result.id}' />`;
                    line += `<div class = 'data'>${result.name}<br>Type: ${result.type}<br>Damage: ${result.attack.display}<br> Damage Type: ${result.damageType}`
                    if(result.elements.length != 0)
                    {
                        line += `<br>Elemental Damage: <ul>`;
                        for(let i = 0; i < result.elements.length;i++)
                        {
                            line += `<li>Type: ${result.elements[i].type}</li><li>Damage:${result.elements[i].damage}</li>`;
                        }
                        line += `</div>`;
                    }
                    else{
                        line += `</div>`;
                    }
                    line += `</div>`;
                    break;
                case "armor":
                    if(result.assets == null)
                    {
                        smallURL = "images/no-image-found.png";
                    }
                    else{
                        smallURL = result.assets.imageMale;
                    }
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line = `<div class = 'result'><img src='${smallURL}' title = '${result.id}' />`;
                    line += `<div class = 'data'><div class='top'>${result.name}<br>Defense:<ul><li>Base:${result.defense.base}</li><li>Max:${result.defense.max}</li></ul></div>
                    <div class='bottomLeft'>Resistances:<ul><li>Fire:${result.resistances.fire}</li><li>Water:${result.resistances.water}</li><li>Ice:${result.resistances.ice}</li>
                    <li>Thunder:${result.resistances.thunder}</li><li>Dragon:${result.resistances.dragon}</li></div></div>`
                    /*smallURL = result.assets.imageFemale;
                    if(!smallURL) smallURL = "images/no-image-found.png";
                    line += `<img src='${smallURL}' title = '${result.id}' />`;*/
                    line += `</div>`;
                    break;
                /*case "charms":
                    line = "";
                    break;*/
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
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
function setRandom()
{
    randomize = !randomize;
}