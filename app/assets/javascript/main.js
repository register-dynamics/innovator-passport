function setupFormStorage() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const dataElem = form.querySelector(".store-data");

      if (dataElem) {
        const key = dataElem.getAttribute("name");
        const value = dataElem.getAttribute("value") || dataElem.textContent.trim();

        if (key && value) {
          sessionStorage.setItem(key, value);
        }
      }
    });
  });
}

function setupTableSelection() {
  const selectButtons = document.querySelectorAll(".select-row-btn");

  selectButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const currentRow = event.currentTarget.closest("tr");

      document.querySelectorAll(".nhsuk-table__row").forEach((row) => {
        row.style.backgroundColor = "";
        const rowButton = row.querySelector(".select-row-btn");
        const rowTag = row.querySelector(".nhsuk-tag");
        if (rowButton) {
          rowButton.style.display = ""; 
        }
        if (rowTag) {
            rowTag.style.display ="none"
        }
      });

      if (currentRow) {
        currentRow.style.backgroundColor ="#aeb7bd";
        button.style.display = "none";

        const currentTag = currentRow.querySelector(".nhsuk-tag");
        currentTag.style.display = "inline-block";

        const trustLink = currentRow.querySelector("th a");
        if (trustLink) {
          const trustName = trustLink.textContent.trim();
          sessionStorage.setItem("selectedTrust", trustName);
        }
      }
    });
  });
}

function renderStoredData() {
  const pageElems = document.querySelectorAll(".show-stored-data");
  pageElems.forEach((elem) => {
    const key = elem.getAttribute("name");
    const text = sessionStorage.getItem(key);
    if (text) {
      elem.textContent = text;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFormStorage();
  setupTableSelection();
  renderStoredData();
});