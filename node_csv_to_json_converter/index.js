const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const lodash = require('lodash');
const inquirer = require('inquirer');

// Helper function to infer types
function inferType(value) {
  // Check if the value is a number
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

  // Check if it's a valid date
  if (moment(value, moment.ISO_8601, true).isValid()) {
    return moment(value).toDate();
  }

  // If it's neither, return as a string
  return value.trim();
}

// Function to convert CSV to JSON with more intelligent handling
async function convertCsvToJson(csvFilePath, jsonFilePath, options) {
  const results = [];
  const headers = [];
  
  // Read the CSV file and process each row
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('headers', (headerList) => {
      // Store the headers
      if (options.renameHeaders && options.headerMapping) {
        headerList.forEach((header, idx) => {
          if (options.headerMapping[header]) {
            headerList[idx] = options.headerMapping[header];
          }
        });
      }
      headers.push(...headerList);
    })
    .on('data', (data) => {
      const row = {};

      // Loop through the headers and match each value in the row
      headers.forEach((header) => {
        let value = data[header];

        if (options.removeEmptyFields && (value === '' || value === null)) {
          return;
        }

        // Infer the type of the value (e.g., number, date)
        row[header] = inferType(value);
      });

      results.push(row);
    })
    .on('end', () => {
      // Write the JSON result to a file
      fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
      console.log(`CSV successfully converted to JSON and saved at ${jsonFilePath}`);
    })
    .on('error', (error) => {
      console.error(`Error processing the CSV file: ${error.message}`);
    });
}

// Prompt user for input
async function promptForInput() {
  const questions = [
    {
      type: 'input',
      name: 'csvFilePath',
      message: 'Enter the path to the CSV file:',
      validate: (input) => input.trim() !== '' ? true : 'CSV file path is required.',
    },
    {
      type: 'input',
      name: 'jsonFilePath',
      message: 'Enter the output path for the JSON file:',
      validate: (input) => input.trim() !== '' ? true : 'JSON output file path is required.',
    },
    {
      type: 'confirm',
      name: 'renameHeaders',
      message: 'Would you like to rename the CSV headers?',
      default: false,
    },
    {
      type: 'input',
      name: 'headerMapping',
      message: 'Enter the header mapping as JSON (e.g., {"oldName": "newName"}):',
      when: (answers) => answers.renameHeaders,
      validate: (input) => {
        try {
          JSON.parse(input);
          return true;
        } catch (e) {
          return 'Invalid JSON format';
        }
      },
    },
    {
      type: 'confirm',
      name: 'removeEmptyFields',
      message: 'Would you like to remove empty fields?',
      default: true,
    },
  ];

  const answers = await inquirer.prompt(questions);

  // Parse the header mapping if provided
  const headerMapping = answers.headerMapping ? JSON.parse(answers.headerMapping) : null;

  return {
    csvFilePath: answers.csvFilePath,
    jsonFilePath: answers.jsonFilePath,
    renameHeaders: answers.renameHeaders,
    headerMapping,
    removeEmptyFields: answers.removeEmptyFields,
  };
}

// Main function to run the script
async function main() {
  try {
    const options = await promptForInput();
    await convertCsvToJson(options.csvFilePath, options.jsonFilePath, options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
