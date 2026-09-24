function addEventListeners() {
  // Target the forms containing data to store
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
  addEventListeners();
  renderStoredData();
});