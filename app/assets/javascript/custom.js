//Dummy Data

const userData = {
  smallSupplier: {
    companyName: "Clumpton upon Avon Medical Devices Ltd",
    activeSales: "2",
    clarificationRequests: "3",
    additionalInfo: "7",
    users: {
      //index by roles
      default_role: {
        name: "Amelia Eccleston",
        email: "A.Eccleston@clumpmed.co.uk",
        password: "whatever",
        tasksAssigned: "5",
      },
      manager_role: {},
    },
  },
  largeSupplier: {
    companyName: "MEGAMED CORP",
    activeSales: "12",
    clarificationRequests: "11",
    additionalInfo: "4",
    users: {
      default_role: {
        name: "Janice Rock",
        email: "J.rock@megamed.com",
        password: "whatever",
        tasksAssigned: "2",
      },
    },
  },
};

const trustData = {};

const dummyTrustNames = [
  "Worthington and Greater Bryce North",
  "Ashford Foundations trust",
  "County Jason Trust",
];

//custom data attributes
//Helper to retrieve value from nested paths like 'users.default_role.email'
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function updateCurrentUser(e) {
  let selectedKey = e.target.value;
  let selectedUserObj = userData[selectedKey];
  sessionStorage.setItem("currentUser", JSON.stringify(selectedUserObj));

  updatePage("[data-user-prop]", "currentUser");
}

function updatePage(dataAttr, storedKey) {
  //storing a JSON blob as a string
  const storedString = sessionStorage.getItem(storedKey);
  if (!storedString) return;
  //convert back to JSON
  const obj = JSON.parse(storedString);

  const cleanAttributeName = dataAttr.slice(1, -1);
  console.log(`cleandataAttr: ${cleanAttributeName}`);

  document.querySelectorAll(dataAttr).forEach((dataProp) => {
    console.log("started querySelectorAll");
    const prop = dataProp.getAttribute(cleanAttributeName);
    const propPath = dataProp.getAttribute(cleanAttributeName);
    const val = getNestedValue(obj, propPath);

    if (val) {
      if (dataProp.tagName === "INPUT") {
        dataProp.value = val;
      } else {
        dataProp.textContent = val;
      }
    }
  });
}
function updateSelectedTag(e) {
  let selectedTag = e.target.value;
  console.log(selectedTag);
  sessionStorage.setItem("currentTag", selectedTag);
}

function addTag(e) {
  e.preventDefault();

  let currentTag = sessionStorage.getItem("currentTag");
  let tagListElem = document.getElementById("tag-list");

  let existingTags = JSON.parse(sessionStorage.getItem("tags")) || [];

  if (existingTags.includes(currentTag) || currentTag === "None") {
    //TODO: UserWarning
    return;
  } else {
    existingTags.push(currentTag);
    let stringifiedTags = JSON.stringify(existingTags);
    sessionStorage.setItem("tags", stringifiedTags);
    //update tag list
    renderTags();
  }
}

function clearTags(e) {
  sessionStorage.setItem("tags", "[]");
  renderTags();
}

function renderTags() {
  const tagListContainer = document.getElementById("tag-list");
  if (!tagListContainer) return;

  const existingTags = JSON.parse(sessionStorage.getItem("tags")) || [];
  tagListContainer.innerHTML = "";
  tagListContainer.style.display = "none";

  existingTags.forEach((tagText) => {
    tagListContainer.style.display = "block";
    const tagElement = document.createElement("strong");

    tagElement.className =
      "nhsuk-tag nhsuk-tag--blue nhsuk-u-padding-2 nhsuk-u-margin-1";

    tagElement.textContent = tagText;

    tagListContainer.appendChild(tagElement);
  });
}
//GENERIC FUNCTIONS
function renderSearchResults(resultsArray, targetId, buttonText) {
  const searchResultsElement = document.getElementById(targetId);
  if (!resultsArray || resultsArray.length === 0) {
    searchResultsElement.innerHTML = "";
    searchResultsElement.style.display = "none";
    return;
  }
  searchResultsElement.innerHTML = "";
  searchResultsElement.style.display = "block";
  searchResultsElement.className= "nhsuk-inset-text";

  const resultNum = resultsArray.length;
  const resultMessage = `found ${resultNum} match${resultNum === 1 ? "" : "es"}`;
  const matchesMessage = document.createElement("label");
  matchesMessage.textContent = resultMessage;
  matchesMessage.className = "nhsuk-label nhsuk-label--m";
  searchResultsElement.appendChild(matchesMessage);

  for (let resultText of resultsArray) {
    console.log("inside the loop...");
    const resultElem = createSearchResultwithButton(
      resultText,
      buttonText,
      linkTrust,
    );
    searchResultsElement.appendChild(resultElem);
  }
}

//GENERATE CUSTOM HTML
function createSearchResultwithButton(
  resultText,
  buttonText,
  buttonEventListener,
) {
  const mainContainer = document.createElement("div");
  mainContainer.className = "nhsuk-grid-row";
  mainContainer.id = resultText;
  const resultCol = document.createElement("div");
  resultCol.className = "nhsuk-grid-column-two-thirds";
  const buttonCol = document.createElement("div");
  buttonCol.className = "nhsuk-grid-column-one-third";
  const resultName = document.createElement("p");
  resultName.className = "nhsuk-body-l";
  resultName.textContent = resultText;
  const button = document.createElement("button");
  button.className = "nhsuk-button nhsuk-button--small";
  button.textContent = buttonText;
  button.value = resultText;
  button.addEventListener("click", buttonEventListener);

  //assemble the HTML
  mainContainer.appendChild(resultCol);
  mainContainer.appendChild(buttonCol);
  resultCol.appendChild(resultName);
  buttonCol.appendChild(button);
  return mainContainer;
}

//SEARCHING FOR TRUSTS
function searchTrusts(e) {
  console.log("searchTrusts called...");
  e.preventDefault();
  const searchTerm = e.target.searchInput.value;
  if (dummyTrustNames.includes(searchTerm)) {
    console.log("trust found...");
    renderSearchResults([searchTerm], "search-results", "Link Trust");
  } else {
  }
}

function linkTrust(event) {
  console.log(`linkTrust fired...`);
  const trusts = JSON.parse(sessionStorage.getItem("selectedTrusts")) || [];
  const selectedItem = event.target.value;
  if (trusts.includes(selectedItem)) {
    return;
  } else {
    const resultElem = document.getElementById("search-results");
    resultElem.style.display = "none";
    trusts.push(selectedItem);
    sessionStorage.setItem("selectedTrusts", JSON.stringify(trusts));
    console.log("item added to selectedTrusts");
    renderSelectedTrusts();
  }
}

function renderSelectedTrusts() {
  console.log(`renderSelectedTrusts called...`);
  const trusts = JSON.parse(sessionStorage.getItem("selectedTrusts")) || [];
  const itemList = document.getElementById("listed-trusts");
  if (!trusts.length) {
    itemList.innerHTML = "";
    return;
  } else {
    itemList.innerHTML = "";
    itemList.style.display = "block";
    for (const item of trusts) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "nhsuk-grid-row";
      const colDiv1 = document.createElement("div");
      colDiv1.className = "nhsuk-grid-column-two-thirds";
      const colDiv2 = document.createElement("div");
      colDiv2.className = "nhsuk-grid-column-one-third";
      const itemName = document.createElement("p");
      itemName.className = "nhsuk-u-padding-2";
      itemName.textContent = item;
      itemName.style.backgroundColor = "#d8dde0";
      const removeButton = document.createElement("button");
      removeButton.className =
        "nhsuk-button nhsuk-button--secondary nhsuk-button--small";
      removeButton.textContent = "Remove";
      removeButton.value = item;
      removeButton.addEventListener("click", removeSelectedTrust);
      rowDiv.appendChild(colDiv1);
      rowDiv.appendChild(colDiv2);
      colDiv1.appendChild(itemName);
      colDiv2.appendChild(removeButton);
      itemList.appendChild(rowDiv);
    }
  }
}

function removeSelectedTrust(e) {
  const selectedTrust = e.target.value;
  let trusts = JSON.parse(sessionStorage.getItem("selectedTrusts"));
  if (!trusts) {
    return;
  }
  if (trusts.includes(selectedTrust)) {
    console.log(`${selectedTrust} is in storage`);
    const index = trusts.indexOf(selectedTrust);
    if (index > -1) {
      trusts.splice(index, 1);
      sessionStorage.setItem("selectedTrusts", JSON.stringify(trusts));
      renderSelectedTrusts();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM LOADED...");

  const userFieldset = document.getElementById("user-fieldset");
  const selectTag = document.getElementById("select-tag");
  const tagForm = document.getElementById("tag-form");
  const tagList = document.getElementById("tag-list");
  const clearButton = document.getElementById("clear-button");
  const searchTrustsButton = document.getElementById("search-trusts");

  if (userFieldset) {
    userFieldset.addEventListener("change", updateCurrentUser);
  }

  if (selectTag) {
    selectTag.addEventListener("change", updateSelectedTag);
  }

  if (tagForm) {
    tagForm.addEventListener("submit", addTag);
  }

  if (clearButton) {
    clearButton.addEventListener("click", clearTags);
  }
  if (searchTrustsButton) {
    searchTrustsButton.addEventListener("submit", searchTrusts);
  }

  updatePage("[data-user-prop]", "currentUser");

  renderTags();
  renderSelectedTrusts();
});
