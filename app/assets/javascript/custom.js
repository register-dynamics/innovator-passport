const userData = {
  smallSupplier: {
    companyName: "Clumpton upon Avon Devices Ltd",
    users: {
      //index by roles
      default_role: {
        name: "John Small",
        email: "john.small@small.net",
        password: "whatever"
      },
      manager_role: {},
    },
  },
  largeSupplier: {
    companyName: "MEGAMED CORP",
    users: {
      default_role: {
        name: "Jane Big",
        email: "jane.big@huge.com",
        password: "whatever"
      },
    },
  },
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
  console.log(
    `updateCurrentUser called: ${sessionStorage.getItem("currentUser")}`,
  );

  updatePage("[data-user-prop]", "currentUser");
}

function updatePage(dataAttr, storedKey) {
  //storing a JSON blob as a string
  const storedString = sessionStorage.getItem(storedKey);
  if (!storedString) return;
  console.log(`stored string is ${storedString}`);
  //convert back to JSON
  const obj = JSON.parse(storedString);

  const cleanAttributeName = dataAttr.slice(1, -1);
  console.log(`cleandataAttr: ${cleanAttributeName}`);

  document.querySelectorAll(dataAttr).forEach((dataProp) => {
    console.log("started querySelectorAll");
    const prop = dataProp.getAttribute(cleanAttributeName);
    const propPath = dataProp.getAttribute(cleanAttributeName);
    const val = getNestedValue(obj, propPath);
    console.log(`prop is ${prop}`);
    console.log(`obj is ${obj}`)
    console.log(`obj[prop is ${obj[prop]}]`)
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
