// External dependencies
const express = require("express");

const router = express.Router();

// Add your routes here - above the module.exports line

router.post("/additional-request-choice", function (req, res) {
  const choice = req.session.data.additionalAssurance;
  console.log(`choice is ${choice}`);

  if (choice === "uploadFile") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/upload_file/submit_question_files");
  }
  else if (choice === "Add questions individually") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/ask_individual_questions/question_wizard");
  }
    else if (choice === "questionBank") {
    console.log(`choice is ${choice}...redirecting`);
    res.redirect("/prototypes/ur_prototypes/ver_2/trust/request_additional_assurance/question_bank/question_bank");
  }
});

router.post(
  "/journeys/trust/ver_2/supplier_search_result",
  function (req, res) {
    const data = req.session.data;

    // convert the answer from a string into a number
    const supplierSearchField = data.supplierSearch;
    const deviceSearchField = data.deviceSearch;
    console.log(supplierSearchField);
    console.log(deviceSearchField);

    //If both fields have text
    if (supplierSearchField && deviceSearchField) {
      res.redirect("./search_supplier_and_device");
    }

    //If searching by device
    else if (!supplierSearchField && deviceSearchField) {
      res.redirect("./search_for_device");
    }
  },
);

router.use(
  "/journeys/supplier/respond-to-assurance-request/version-1",
  require("./routes/supplier-assurance"),
);

router.use(
  "/journeys/supplier/manage-assurance-information/version-1",
  require("./routes/supplier-product-assurance"),
);

module.exports = router;
