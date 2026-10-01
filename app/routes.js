// External dependencies
const express = require("express");

const router = express.Router();

// Add your routes here - above the module.exports line

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

    // Otherwise if it's a number between 0 and 6
    else if (daysExperiencingSymptoms >= 0) {
      res.redirect("/how-to-treat-yourself");

      // No answer given, or not a number, or a negative number
    } else {
      // Return to question
      res.redirect("/days-experiencing-symptoms");
    }
  },
);

module.exports = router;
