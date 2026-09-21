const userData = {
  smallSupplier: {
    companyName: "Clumpton upon Avon Medical Devices Ltd",
    activeSales: "2",
    clarificationRequests:"3",
    additionalInfo:"7",
    users: {
      //index by roles
      default_role: {
        name: "Amelia Eccleston",
        email: "A.Eccleston@clumpmed.co.uk",
        password: "whatever",
        tasksAssigned:"5"
      },
      manager_role: {},
    },
  },
  largeSupplier: {
    companyName: "MEGAMED CORP",
    activeSales: "12",
    clarificationRequests:"11",
    additionalInfo:"4",
    users: {
      default_role: {
        name: "Janice Rock",
        email: "J.rock@megamed.com",
        password: "whatever",
        tasksAssigned:"2"
      },
    },
  },
};

const trustData = {

};

//Helper to retrieve value from nested paths like 'users.default_role.email'
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
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

document.getElementById("user-fieldset")?.addEventListener("change", updateCurrentUser);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM LOADED...")
  updatePage("[data-user-prop]", "currentUser");
});
