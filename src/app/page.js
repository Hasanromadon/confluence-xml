"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";

const templateData = [
  {
    No: "TC01",
    "Test Case Name": "Verify Login Functionality",
    "Input Data": "Valid Username and Password",
    "Cucumber Scenario": "Scenario for valid login",
    UQA: "Tested and Verified",
    Assignee: "John Doe",
  },
  {
    No: "TC02",
    "Test Case Name": "Verify Logout Functionality",
    "Input Data": "N/A",
    "Cucumber Scenario": "Scenario for logout",
    UQA: "Tested and Verified",
    Assignee: "Jane Smith",
  },
];

const ExcelToConfluence = () => {
  const [excelData, setExcelData] = useState([]);
  const [xmlOutput, setXmlOutput] = useState("");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const sanitizedData = sanitizeExcelData(jsonData);

          setExcelData(sanitizedData);
          const xmlData = generateConfluenceMarkup(sanitizedData);
          setXmlOutput(xmlData);
          setIsAccordionOpen(true); // Automatically open the accordion
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const sanitizeExcelData = (data) => {
    return data.map((row) => {
      const sanitizedRow = {};
      Object.keys(row).forEach((key) => {
        const cellValue = row[key];
        sanitizedRow[key] =
          typeof cellValue === "string"
            ? cellValue.replace(/(?:\r\n|\r|\n)/g, "<br/>")
            : cellValue;
      });
      return sanitizedRow;
    });
  };

  const generateConfluenceMarkup = (data) => {
    return data
      .map((row, index) => {
        return `
<ac:layout-section ac:type="single">
  <ac:layout-cell>
    <table class="wrapped relative-table" style="width: 99.3452%;">
      <tbody>
        <tr><td><strong>No. Test Case</strong></td><td>${
          row["No"] || `TC${index + 1}`
        }</td></tr>
        <tr><td><strong>Function</strong></td><td>${row["UQA"] || ""}</td></tr>
        <tr><td><strong>Scenario</strong></td><td>${
          row["Test Case Name"] || ""
        }</td></tr>
        <tr><td><strong>Input Data</strong></td><td>${
          row["Input Data"] || ""
        }</td></tr>
        <tr><td><strong>Steps</strong></td><td>${
          row["Cucumber Scenario"] || ""
        }</td></tr>
           <tr>
            <td colspan="1">
              <strong>Result</strong>
            </td>
            <td colspan="1">PASS | <s>FAILED</s> <br/>
              <em>*) coret salah satu melalui menu strikethrough pada toolbar confluence</em>
            </td>
          </tr>
        <tr><td><strong>Results</strong></td><td>${row.Results || ""}</td></tr>
         <tr class="">
            <td>
              <strong>Screen Capture</strong>
            </td>
            <td>
              <div class="content-wrapper">
                <ac:structured-macro ac:macro-id="93fe5885-4757-4e1c-acbf-fe524e38535d" ac:name="expand" ac:schema-version="1">
                  <ac:parameter ac:name="title">Screen Capture</ac:parameter>
                  <ac:rich-text-body>
                    <p>masukan gambar</p>
                  </ac:rich-text-body>
                </ac:structured-macro>
              </div>
            </td>
          </tr>
      </tbody>
    </table>
  </ac:layout-cell>
</ac:layout-section>`;
      })
      .join("\n");
  };

  const handleCopyMarkup = async () => {
    try {
      await navigator.clipboard.writeText(xmlOutput);
      setCopySuccess("Disalin ke Clipboard!");
      setTimeout(() => setCopySuccess(""), 3000); // Reset after 3 seconds
    } catch (err) {
      setCopySuccess("Gagal Menyalin!");
    }
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const header = [
      "No",
      "Test Case Name",
      "Input Data",
      "Cucumber Scenario",
      "UQA",
      "Assignee",
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "test_case_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 px-20">
      <div className="w-full  mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Excel to Confluence
        </h2>
        <button
          onClick={handleDownloadTemplate}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow"
        >
          Download Template
        </button>

        {/* File Upload */}
        <div className="mb-6">
          <label
            htmlFor="fileUpload"
            className="block text-gray-700 font-medium mb-2"
          >
            Upload Excel File
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-blue-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Accordion for Excel Data */}
        {excelData.length > 0 && (
          <div className="mb-8 border border-gray-300 rounded-lg">
            <div
              className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Excel Preview: {excelData.length} Test Case
              </h3>
              <span
                className={`transition-transform text-blue-500 ${
                  isAccordionOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </div>

            {isAccordionOpen && (
              <div className="max-h-80 overflow-y-auto border-t border-gray-300 p-4">
                <table className="table-auto w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(excelData[0]).map((key, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-4 py-2 text-left text-gray-700 font-medium"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="even:bg-gray-50">
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-gray-300 px-4 py-2 text-gray-700"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* XML Output */}
        {xmlOutput && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Generated Confluence
            </h3>
            <textarea
              value={xmlOutput}
              readOnly
              className="w-full h-96 p-4 text-sm text-gray-700 border rounded-lg resize-none bg-gray-50"
            />
            <div className="mt-4 flex justify-end items-center space-x-4">
              <button
                onClick={handleCopyMarkup}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                Copy Markup
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
              </button>
              {copySuccess && (
                <span className="text-sm text-green-600">{copySuccess}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelToConfluence;
