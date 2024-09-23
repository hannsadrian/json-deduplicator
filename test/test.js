const fs = require("fs");
const path = require("path");
const { deduplicate } = require("../index");

// Example JSON file path
const filePath = path.join(__dirname, "data.json"); // Adjust the path to your example JSON file

// Function to read JSON file
const readJSONFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Main function to test deduplication
const main = async () => {
  try {
    const jsonData = await readJSONFile(filePath);
    jsonData.stopEvents.map((stopEvent) => {
      delete stopEvent.location.properties;
      delete stopEvent.transportation.properties;
    });
    const output = deduplicate(jsonData, { alwaysReplaceWithId: true });
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error reading or processing file:", error);
  }
};

// Run the test
main();
