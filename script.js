let input_fields = document.getElementsByClassName("search-input");
let queries_allowed = localStorage.getItem("queries_allowed");
let pro_version = localStorage.getItem("pro_version");

if (pro_version === null) {
    localStorage.setItem("pro_version", "false");
}

globalThis.pro_version = pro_version;

if (queries_allowed === null) {
    queries_allowed = 5;
    localStorage.setItem("queries_allowed", queries_allowed);
}

function addToFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Recipe added to favorites");
    } else {
        alert("Recipe is already in favorites");
    }
}

function onRecipeDataClick(div) {
    queries_allowed -= 1;
    if (queries_allowed < 0) {
        alert("You have exceeded the number of allowed queries. Please try again later.");
        return;
    }
    fetch(`https://cook-n-go.vercel.app/api/spoonacular?path=recipes/${div.id}/information`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data) {
            window.scrollTo(0, 0);
            let title = data.title || "No title available";
            let readyInMinutes = data.readyInMinutes || "N/A";
            let servings = data.servings || "N/A";
            let isVegetarian = data.vegetarian || false;
            let instructions = data.instructions || "No instructions available.";
            // let ingredients = data.extendedIngredients || [];
            // let ingredientsList = ingredients.map(ing => ing.original).join(", ") || "No ingredients available.";
            
            if (pro_version == "true") {
                document.getElementById("recipe-info-div").innerHTML = (`
                    <div id="main-recipe-content">
                        <div id="recipe-info">
                            <img src="${data.image}" alt="${title}" style="max-width: 100%; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <h2>${title}</h2>
                            <p><b>Preparation Time:</b> ${readyInMinutes} minutes</p>
                            <p><b>Servings:</b> ${servings}</p>
                            <p><b>Vegetarian:</b> ${isVegetarian ? "Yes" : "No"}</p><br>
                            <p><b>Gluten Free:</b> ${data.glutenFree ? "Yes" : "No"}</p>
                            <p><b>Dairy Free:</b> ${data.dairyFree ? "Yes" : "No"}</p>
                            <p><b>Very Healthy:</b> ${data.veryHealthy ? "Yes" : "No"}</p>
                            <p><b>Food Score:</b> ${data.healthScore || "N/A"}</p>
                            <p><b>Cheap:</b> ${data.cheap ? "Yes" : "No"}</p>
                            <p><b>Sustainable:</b> ${data.sustainable ? "Yes" : "No"}</p><br>
                            <p onclick="addToFavorites(${div.id})"><b>Add to favorites</b></p>
                        </div>
                        
                        <div id="recipe-guide">
                        <p><b>Ingredients:</b><ul id="recipe-ingredients-list"></ul></p><br>
                            ${instructions}
                        </div>
                    </div>
                `);
            } else if (pro_version == "false") {
                document.getElementById("recipe-info-div").innerHTML = (`
                    <div id="main-recipe-content">
                        <div id="recipe-info">
                            <img src="${data.image}" alt="${title}" style="max-width: 100%; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <h2>${title}</h2>
                            <p><b>Preparation Time:</b> ${readyInMinutes} minutes</p>
                            <p><b>Servings:</b> ${servings}</p>
                            <p><b>Vegetarian:</b> ${isVegetarian ? "Yes" : "No"}</p><br>
                            <div style="background-color: #436a9f; padding: 10px; color: white; text-align: center" onclick="pro_version = change_pro_version('true')">Enable <i>Pro Version</i> to unlock more recipe information and to add it to favorites.</div>
                            
                        </div>
                        
                        <div id="recipe-guide">
                        <p><b>Ingredients:</b><ul id="recipe-ingredients-list"></ul></p><br>
                            ${instructions}
                        </div>
                    </div>
                `);
            }

            for (let ing of data.extendedIngredients || []) {
                let ingredient = `${ing.measures.metric.amount} ${ing.measures.metric.unitShort} ${ing.originalName}`;
                document.getElementById("recipe-ingredients-list").innerHTML += `<li>${ingredient}</li>`;
            }
        }
    });
    localStorage.setItem("queries_allowed", queries_allowed);
    localStorage.setItem("pro_version", pro_version);
}

function handleRecipeClick (event) {
    onRecipeDataClick(event.currentTarget);
}

let validIngredientsSet = new Set();
let ingredients = [];

fetch("Assets/ingredients.csv")
    .then(response => response.text())
    .then(data => {
        data.split("\n").slice(1).forEach(line => {
            const [ingredient, id] = line.split(";");
            if (ingredient) validIngredientsSet.add(ingredient.trim().toLowerCase());
        });
    });

function handleInputEventListener (e, input, inputs) {
    if (e.key === " ") {
        if (document.getElementById("includeIngredients").value !== "") {
            let enteredIngredient = document.getElementById("includeIngredients").value.trim().toLowerCase();
            let ifinvalidIngredient = [enteredIngredient].filter(i => !validIngredientsSet.has(i));
            if (!validIngredientsSet.has(enteredIngredient)) {
                alert("Invalid ingredient: " + ifinvalidIngredient);
                return;
            } else {
                ifinvalidIngredient = null;
            }
            for (item in document.getElementsByClassName("ingredient-tag")) {
                try {
                    if (document.getElementsByClassName("ingredient-tag")[item].innerText.toLowerCase() === enteredIngredient) {
                        alert("Ingredient already added.");
                        document.getElementById("includeIngredients").value = "";
                        return;
                    }
                } catch (TypeError) {
                    continue;
                }
            }
            let newDiv = document.createElement("li");
            newDiv.className = "ingredient-tag";
            let value = enteredIngredient;
            value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            newDiv.innerHTML = `<b>${value}</b>`;
            newDiv.style.marginLeft = "15px";
            document.getElementById("ingredient-list").appendChild(newDiv);
            ingredients.push(enteredIngredient);
            newDiv.addEventListener("mouseenter", () => {
                newDiv.style.textDecoration = "line-through";
                newDiv.style.cursor = "pointer";
            });
            newDiv.addEventListener("mouseleave", () => {
                newDiv.style.textDecoration = "none";
                newDiv.style.cursor = "default";
            });
            newDiv.addEventListener("click", () => {
                newDiv.remove();
                const idx = ingredients.indexOf(newDiv.innerText.toLowerCase());
                if (idx !== -1) {
                    ingredients.splice(idx, 1);
                }
            });
            document.getElementById("includeIngredients").value = "";
            value = "";
        }
    }

    if (e.key === "Enter") {
        if (queries_allowed < 0) {
            alert("You have exceeded the number of allowed queries. Please try again later.");
            return;
        }
        queries_allowed -= 1;
        if (inputs.length > 1) {
            // console.log(`https://api.spoonacular.com/recipes/complexSearch?query=${input.value}&diet=${document.getElementById("vegetarian").checked ? "vegetarian" : ""}&minServings=${document.getElementById("serving-size-min").value}&maxServings=${document.getElementById("serving-size-max").value}&maxReadyTime=${document.getElementById("max-prep-time").value}&apiKey=${USED_API_KEY}&number=20`)
            
            let inputData = {};
            input_fields = document.getElementsByClassName("search-input");
            Array.from(input_fields).forEach(field => {
                if (field.value.trim() !== "") {
                    if (field.name === "vegetarian") {
                        if (field.checked) {
                            inputData["diet"] = "vegetarian";
                        } else {
                            delete inputData["diet"];
                        }
                    } else if (field.type === "checkbox") {
                        if (field.checked) {
                            inputData[field.name] = true;
                        } else {
                            delete inputData[field.name];
                        }
                    } else {
                        inputData[field.name] = field.value.trim();
                    }
                } else if (ingredients.length > 0) {
                    inputData["includeIngredients"] = ingredients.join(",");
                    ingredients = [];
                    document.getElementById("ingredient-list").innerHTML = "";
                }
            });
            let url = `https://cook-n-go.vercel.app/api/spoonacular?path=recipes/complexSearch&query=`;
            for (let input_field in inputData) {
                url += `&${input_field}=${inputData[input_field]}`;
            }
            console.log(url);

            fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    let resultsContainer = document.getElementById("results-container");
                    resultsContainer.innerHTML = "";
                    data.results.forEach(recipe => {
                        resultsContainer.innerHTML += `
                        <div class="result-element" id="${recipe.id}">
                        <img src="${recipe.image}" alt="${recipe.title}" class="result-img">
                        <p class="result-text">${recipe.title}</p>
                        </div>`;
                        for (let div of resultsContainer.children) {
                            let minFontSize = 8;
                            let fontSize = parseInt(window.getComputedStyle(div).fontSize);
                            let isOverflowingX = div.scrollWidth > div.clientWidth;
                            let isOverflowingY = div.scrollHeight > div.clientHeight;
                            while ((isOverflowingX || isOverflowingY) && fontSize > minFontSize) {
                                fontSize -= 1;
                                div.style.fontSize = fontSize + "px";
                                isOverflowingX = div.scrollWidth > div.clientWidth;
                                isOverflowingY = div.scrollHeight > div.clientHeight;
                            }
                        }
                    });
                    addRecipeData();
                } else {
                    alert("No results found. Please try different search parameters.");
                }
            })
            .catch(error => {
                console.error("Error fetching recipe data:", error);
            });
            
            input.value = "";

            localStorage.setItem("queries_allowed", queries_allowed);
            localStorage.setItem("pro_version", pro_version);
        } else {
            fetch(`https://cook-n-go.vercel.app/api/spoonacular?path=recipes/complexSearch&query=${input.value}&number=24`)
            .then(response => response.json())
            .then(data => {
                resultsContainer = document.getElementById("results-container")
                if (data.results && data.results.length > 0) {
                    document.getElementById("results-container").innerHTML = "";
                    data.results.forEach(recipe => {
                        document.getElementById("results-container").innerHTML += `
                        <div class="result-element" id="${recipe.id}">
                        <img src="${recipe.image}" alt="${recipe.title}" class="result-img">
                        <p class="result-text">${recipe.title}</p>
                        </div>`;
                        for (let div of resultsContainer.children) {
                            let minFontSize = 8;
                            let fontSize = parseInt(window.getComputedStyle(div).fontSize);
                            let isOverflowingX = div.scrollWidth > div.clientWidth;
                            let isOverflowingY = div.scrollHeight > div.clientHeight;
                            while ((isOverflowingX || isOverflowingY) && fontSize > minFontSize) {
                                fontSize -= 1;
                                div.style.fontSize = fontSize + "px";
                                isOverflowingX = div.scrollWidth > div.clientWidth;
                                isOverflowingY = div.scrollHeight > div.clientHeight;
                            }
                        }
                    });
                    addRecipeData();
                } else {
                    alert("No results found. Please try different search parameters.");
                }
            })
            .catch(error => {
                console.error("Error fetching recipe data:", error);
            });

            input.value = "";

            localStorage.setItem("queries_allowed", queries_allowed);
            localStorage.setItem("pro_version", pro_version);
        }
    }

};


function addRecipeData() {
    if (document.getElementById("favorite-results-container")) {
        for (let div of document.getElementById("favorite-results-container").children) {
            div.removeEventListener("click", handleRecipeClick);
            div.addEventListener("click", handleRecipeClick);
        }
    } else {
        for (let div of document.getElementById("results-container").children) {
            div.removeEventListener("click", handleRecipeClick);
            div.addEventListener("click", handleRecipeClick);
        }
    }
}

function addEventListenersToInputs(inputs) {
    for (let input of inputs) {
        input.removeEventListener("keydown", input._keydownHandler);
        input._keydownHandler = function(e) {
            handleInputEventListener(e, input, inputs);
        };
        input.addEventListener("keydown", input._keydownHandler);
    }
}

function load_advanced_search(force_reveal = false) {
    try {
        pro_version = localStorage.getItem("pro_version");
        console.log("Advanced search button clicked");
        let advancedSearchContainer = document.getElementById("advanced-search-container");
        if (advancedSearchContainer.innerHTML.trim() === "" || force_reveal) {
            let html = `
                <div id=advanced-parameters style="background-color: #ccd8e8; border-radius: 20px;"><div style="padding: 20px;">
                Max Prep Time (minutes): <input type="text" class="search-input" name="maxReadyTime" id="max-prep-time" min="1" style="width: 60px; text-align: center;" pattern="\d*" inputmode="numeric"><br>
                ${pro_version === "true" ? `Vegetarian: <input type="checkbox" name="vegetarian" id="vegetarian" class="search-input"><br>
                Serving Size: <input type="text" class="search-input" name="minServings" id="serving-size-min" min="1" style="width: 40px; text-align: center;" pattern="\d*" inputmode="numeric"> - <input type="text" class="search-input" name="maxServings" id="serving-size-max" min="1" style="width: 40px; text-align: center;" pattern="\d*" inputmode="numeric"><br>
                Result Number: <input type="text" class="search-input" name="number" id="result-number" min="1" style="width: 40px; text-align: center;" pattern="\d*" inputmode="numeric" value="24"><br><br>
                Gluten Free: <input type="checkbox" name="glutenFree" id="glutenFree" class="search-input"><br>
                Dairy Free: <input type="checkbox" name="dairyFree" id="dairyFree" class="search-input"><br>
                Sustainable: <input type="checkbox" name="sustainable" id="sustainable" class="search-input"><br><br>` : ""}
                Ingredients: <input type="text" class="search-input" name="includeIngredients" id="includeIngredients" style="width: 300px; padding-left: 10px;" placeholder="Add ingredients seperated by spaces" autocomplete="off">
                <div id="ingredient-container" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;"><ul id="ingredient-list"></ul></div></div>
                `;
            if (pro_version !== "true") {
                html += `<div style="background-color: #436a9f; padding: 10px; color: white; border-radius: 0px 0px 15px 15px; text-align: center" onclick="pro_version = change_pro_version('true')">Enable <i>Pro Version</i> to unlock more search parameters.</div></div>`;
                advancedSearchContainer.innerHTML = html;
            } else if (pro_version === "true") {
                advancedSearchContainer.innerHTML = html + `</div>`;
            }
        } else {
            advancedSearchContainer.innerHTML = "";
        }
        
        addEventListenersToInputs(input_fields);
    
    } catch (TypeError) {}
    
}



function addEventListenersToAdvancedSearch() {
    try {
        pro_version = localStorage.getItem("pro_version");
        console.log("abc testing");
        document.getElementById("advanced-search").addEventListener("click", () => load_advanced_search(false));
    } catch (TypeError) {console.log("Advanced search button not found, skipping...")}
}

addEventListenersToAdvancedSearch();
addEventListenersToInputs(document.getElementsByClassName("search-input"));

function checkProVersion() {
    localStorage.setItem("pro_version", pro_version);
}

function load_favorite_recipes(recipe_ids) {
    document.getElementById("favorite-results-container").innerHTML = "";
    for (let recipe_id of recipe_ids) {
        fetch(`https://cook-n-go.vercel.app/api/spoonacular?path=recipes/${recipe_id}/information`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data && data.id) {
                    let resultsContainer = document.getElementById("favorite-results-container");
                    resultsContainer.innerHTML += `
                    <div class="result-element" id="${data.id}">
                    <img src="${data.image}" alt="${data.title}" class="result-img">
                    <p class="result-text">${data.title}</p>
                    </div>`;
                    for (let div of resultsContainer.children) {
                            let minFontSize = 8;
                            let fontSize = parseInt(window.getComputedStyle(div).fontSize);
                            let isOverflowingX = div.scrollWidth > div.clientWidth;
                            let isOverflowingY = div.scrollHeight > div.clientHeight;
                            while ((isOverflowingX || isOverflowingY) && fontSize > minFontSize) {
                                fontSize -= 1;
                                div.style.fontSize = fontSize + "px";
                                isOverflowingX = div.scrollWidth > div.clientWidth;
                                isOverflowingY = div.scrollHeight > div.clientHeight;
                            }
                        }
                    console.log("Favorite container: " + document.getElementById("favorite-results-container"))
                    console.log("" + document.getElementById("favorite-results-container").children)
                    addRecipeData();
                } else {
                    alert("No results found.");
                }
            })
            .catch(error => {
                console.error("Error fetching recipe data:", error);
            });
    }
}


try {
    let favorites = localStorage.getItem("favorites")
    favorites = favorites ? JSON.parse(favorites) : [];
    window.onload = function() {
        console.log("Loading favorite recipes...");
        if (document.getElementById("favorite-results-container")) {
            console.log("Favorite recipes container found, loading favorites...");
            load_favorite_recipes(favorites);
        }
    }
} catch (TypeError) {}

function change_pro_version(pro_version) {
    queries_allowed = pro_version === "true" ? 10000 : 5;
    localStorage.setItem("queries_allowed", queries_allowed);
    localStorage.setItem("pro_version", pro_version);
    alert(`You have successfully changed the Pro Version status to ${pro_version}.`);
    // try {
    //     document.getElementById("advanced-search-container").innerHTML = "";
    // } catch (error) {
    //     console.log(error);
    // }
    try {
        if (document.getElementById("advanced-search-container").innerText != "" && document.getElementById("advanced-search") != null) {
            load_advanced_search(true);
        }
    } catch (TypeError) {}
    return pro_version;
}

function favorites_redirect() {
    if (pro_version !== "true") {
        alert("You need to enable Pro Version to access favorites.");
        return;
    }
    document.location.href = "favorite-recipes.html";
}

function close_mobile_menu() {
    try {
        document.getElementById("mobile-menu").style.right = "-60%";
    } catch (TypeError) {}
}

function open_mobile_menu() {
    try {
        // val = window.innerWidth * 0.4;
        document.getElementById("mobile-menu").style.display = "flex";
        document.getElementById("mobile-menu").style.right = "0px";
    } catch (TypeError) {}
}