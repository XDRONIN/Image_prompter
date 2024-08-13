import { GoogleGenerativeAI } from "@google/generative-ai";

// Fetch your API_KEY
const API_KEY = "AIzaSyCSseZKn37jCeXrzbGIFhn-OzDpfkGaVrU";

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

// Converts a File object to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

async function run() {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = document.getElementById("prompt").value;

  const imageParts = await Promise.all(
    [...fileInputEl.files].map(fileToGenerativePart)
  );

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  const newText = addLineBreaks(text);
  hideLoader();
  resultText.innerHTML = `${newText}`;
}
const resultText = document.querySelector(".output");
const fileInputEl = document.querySelector("input[type=file]");
const genButton = document.querySelector("#butt");
genButton.addEventListener("click", () => {
  showLoader();
  run();
  resultText.innerHTML = "";
});

const imgPreview = document.getElementById("imagePreview");
fileInputEl.addEventListener("change", () => {
  const file = fileInputEl.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgPreview.src = e.target.result;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function addLineBreaks(text) {
  // Replace '#' and '*' with empty string
  const processedText = text.replace(/[#*]/g, "");

  // Split the processed text into an array of lines
  const lines = processedText.split(/\n/);
  let formattedText = "";

  // Iterate through each line
  lines.forEach((line) => {
    // Add line break before '#' or '*'
    formattedText += line.replace(/(#|\*)/g, "<br>$1") + "<br>";
  });

  return formattedText;
}
const loader = document.querySelector(".loader");
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}
