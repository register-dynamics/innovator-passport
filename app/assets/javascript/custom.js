function generateTable() {
  // creates a <table> element and a <tbody> element
  const para = document.createElement("p");
  para.innerText = "Hello World"

  document.body.appendChild(para);
  // sets the border attribute of tbl to '2'
  para.setAttribute("border", "2");
}

document
  .getElementById("testButton")
  .addEventListener("click", generateTable);

  document.querySelector("#smallSupplier").addEventListener("click",generateTable);