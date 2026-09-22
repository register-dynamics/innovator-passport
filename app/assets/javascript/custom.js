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
  "Worthington and Greater Bryce North Trust",
  "Ashford Foundations trust",
  "County Jason Trust",
];

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

function addSearchResultToList(e) {
  const selectedItems =
    JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const selectedItem = e.target.value;
  if (selectedItems.includes(selectedItem)) {
    console.log("duplicate item. Ignoring...");
    return;
  } else {
    selectedItems.push(selectedItem);
    sessionStorage.setItem("selectedItems", JSON.stringify(selectedItems));
    console.log("item added to selectedItems");
    renderSelectedTrusts();
  }
}
function renderSelectedTrusts() {
  const selectedTrusts =
    JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const itemList = document.querySelector(".search-result-list");
  if (!selectedTrusts.length) {
    itemList.innerHTML = "";
    return;
  } else {
    itemList.innerHTML = "";
    itemList.style.display = "block";
    for (const item of selectedTrusts) {
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
  let selectedTrusts = JSON.parse(sessionStorage.getItem("selectedItems"));
  if (!selectedTrusts) {
    return;
  }
  if (selectedTrusts.includes(selectedTrust)) {
    console.log(`${selectedTrust} is in storage`);
    const index = selectedTrusts.indexOf(selectedTrust);
    if (index > -1) {
      selectedTrusts.splice(index, 1);
      sessionStorage.setItem("selectedItems", JSON.stringify(selectedTrusts));
      renderSelectedTrusts();
    }
  }
}

function renderSearchResults() {
  let results = document.getElementById("search-results");
  results.style.display = "block";
}

function addSearchResultEventListeners() {
  //Obviously in reality we'd fetch the search results from a database and then run the logic
  const resultElements = document.querySelectorAll(".search-result");
  console.log(`resultElements = ${resultElements}`);
  resultElements.forEach((resultElement) => {
    const resultButton = resultElement.querySelector(".search-result-button");
    const name = resultElement.querySelector(".search-result-name");
    resultButton.value = name.textContent;
    resultButton.addEventListener("click", addSearchResultToList);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM LOADED...");

  addSearchResultEventListeners();
  const userFieldset = document.getElementById("user-fieldset");
  const selectTag = document.getElementById("select-tag");
  const tagForm = document.getElementById("tag-form");
  const tagList = document.getElementById("tag-list");
  const clearButton = document.getElementById("clear-button");
  const searchButton = document.getElementById("search-button");

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
  if (searchButton) {
    searchButton.addEventListener("click", renderSearchResults);
  }

  updatePage("[data-user-prop]", "currentUser");

  renderTags();
  renderSelectedTrusts();
});
