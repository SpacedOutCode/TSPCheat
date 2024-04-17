(() => {
  const KEY = ""; /*Your open AI key here*/
const types = ["single", "double", "multi", "antonym", "synonym"];
const questionPrompt = [
  "disregard",
  "Disregard all prior instructions. Use the text below to fill in the two blank spots with the words provided after the text. DO NOT use the same word twice and only use words that make the most sense in the context around the blank . Only return the words in order separated by a comma, NO OTHER WORDS OR CHARACTERS. Suffixes are allowed to make more sense but DO NOT change any words completely.",
  "Disregard all prior instructions. Use the text below to fill in the numbered spots with the words provided after the text. Only use each word once and use the word that makes the most sense in the context around its blank. Only Return the words in the order they go in separated by a comma and NO OTHER WORDS OR CHARACTERS AND DO NOT NUMBER THE WORDS AND DO NOT USE ANY PTHER WORDS THAN THE WORDS GIVEN. Suffixes are NOT allowed and DO NOT change any words completely.",
];
let answersText = "";
let correct, incorrect, singlesCorrect, singlesIncorrect, doublesCorrect, doublesIncorrect, multiplesCorrect, multiplesIncorrect = 0

/**
 * Attaches the script and creates a button to fetch the answer.
 */
function builder() {
  const Script = document.createElement("script");
  Script.append(eval(FetchAnswer));
  document.body.append(Script);
  const lik = document.createElement("li");
  const button = document.createElement("a");
  button.setAttribute("onclick", "FetchAnswer()");
  button.innerText = "Answer";
  lik.append(button);
  document.getElementsByClassName("navbar-nav")[0].append(lik);
}

/**
 * Retrieves the type of question based on the directions provided.
 *
 * @return {string} The type of question.
 */
function getQuestionType() {
  var type = "";
  const question = document.querySelector("#directions");
  if (question.innerText.includes("Use context clues to choose") || question.innerText.includes("Click on the meaning closest to that of the boldfaced word") || question.innerText.includes("Click on the word that matches each definition.") || question.innerText.includes("Click on the word that best completes each sentence.")) {
    type = types[0];
    let answers = document.getElementsByClassName("answer-option");
    let arry = Array.from(answers);
    if (arry.length == 20) arry = arry.slice(10)
    for (i = 0; i < arry.length; i++) {
      answersText = answersText + " " + arry[i].innerText;
    }
  }
  if (question.innerText.includes("Select the two words")) {
    type = types[1];
    let options = Array.from(document.getElementsByTagName("option"))
    answersText = options[1].innerText
    options = options.slice(2, 11)
    options.forEach(option => {
      answersText = `${answersText} ${option.innerText}`
    })
  }
  if (question.innerText.includes("Choose the words that best complete")) {
    type = types[2];
    let options = Array.from(document.getElementsByTagName("option"))
    answersText = options[1].innerText
    options = options.slice(2, 11)
    options.forEach(option => {
      answersText = `${answersText} ${option.innerText}`
    })
  }
  return type;
}

/**
 * Builds a Chat-GPT prompt based on the question type and provided context.
 *
 * @return {string} The built prompt.
 */
function buildPrompt() {
  let builtPrompt = "";
  const type = getQuestionType();
  const prompt = questionPrompt[types.indexOf(type)];
  const context = document.querySelector("#directions").innerText;
  const question = document.querySelector("#question").innerText;
  const removeoptions = answersText.replaceAll("\n", " ")
  const addoptions = answersText.replaceAll(" ", "\n")
  if (type == "single") { 
    builtPrompt =
      context.replace("Directions", "Directions for the following question are as follows:") +
      question.replace('Question\n', "\n")  +
      "\nThe answer choices are as follows. Please choose only the letter associated with the answer and please keep it to one character: \n" +
      answersText;
  } else if (type == "double") {
    builtPrompt = prompt + "Text:" + question.replace(removeoptions, "____") + "Answer options:" + answersText;
  } else if (type == "multi") {
    builtPrompt = prompt + " " + "Text: " + question.replaceAll("\n" + addoptions + "\n", "____") + " Words:" + answersText;
  }
  return builtPrompt;
}
/**
 * Asynchronously fetches an answer from the OpenAI chat API.
 */
async function FetchAnswer() {
  try {
    let chatMsg = buildPrompt();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: chatMsg }],
        temperature: 0.5,
        top_p: 1,
        n: 1,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const msgAnswer = data.choices[0].message.content;
      Answer(msgAnswer)
    } else {
      alert("Error: Unable to process your request.");
    }
  } catch (error) {
    console.error(error);
    alert("Error: Unable to process your request.");
  }
}

/**
 * This function takes an answer and performs apply the changes to the TSP servers to submit the answer
 *
 * @param {string} answer - The answer to be processed.
 */
function Answer(answer) {
  console.log(answer);
  let answ = answer.toLowerCase();
  const type = getQuestionType();
  if (type == "single") {
    CQ.doPageCallback("answer", answ.charAt(0), {});
    setTimeout(() => {
      document.querySelector('#incorrect_response') && (console.log("Incorrect"), incorrect++, singlesIncorrect++);
      document.querySelector('#correct_response') && (correct++, console.log("Correct"), singlesCorrect++);
      CQ.doPageCallback("continue", "", {});
    }, 3500)
  } else if(type == "double") {
    let answers = answ.split(", ", 2)
    let options = answersText.split(" ")
    for (i = 0; i < answers.length; i++) {
      if(options.indexOf(answers[i].toLowerCase()) != -1) {
          document.getElementsByName("cloze[]")[i].value = options.indexOf(answers[i].toLowerCase())+1
      }
    }
    CQ.doPageCallback("answer", "", {});
    setTimeout(() => {
      document.querySelector('#incorrect_response') && (console.log("Incorrect"), incorrect++, doublesIncorrect++);
      document.querySelector('#correct_response') && (correct++, console.log("Correct"), doublesCorrect++);
      CQ.doPageCallback("continue", "", {});
    }, 3500)
  } else if (type == "multi") {
    let answers = answ.split(", ", 10)
    let options = answersText.split(" ")
    for (i = 0; i < answers.length; i++) {
      if(options.indexOf(answers[i].toLowerCase()) != -1) {
          document.getElementsByName("cloze[]")[i].value = options.indexOf(answers[i].toLowerCase())+1
      }
    }
    CQ.doPageCallback("answer", "", {});
    setTimeout(() => {
      document.querySelector('#incorrect_response') && (console.log("Incorrect"), incorrect++, multiplesIncorrect++);
      document.querySelector('#correct_response') && (correct++, console.log("Correct"), multiplesCorrect++);
      CQ.doPageCallback("continue", "", {});
    }, 3500)
  }
}

/**
 * Generates a file containing the percentages of correct and incorrect answers. This is used for analysis  and to provide accuracy stats on the repo.
 */
 function getPercentages() {
  const fileContent = `Overall:\n\nCorrect answers: ${correct}\nIncorrect answers: ${incorrect}\nAccuracy: ${(correct / (correct + incorrect)) * 100}%\n\nSingles:\n\nCorrect: ${singlesCorrect}\nIncorrect: ${singlesIncorrect}\nAccuracy: ${(singlesCorrect / (singlesCorrect + singlesIncorrect)) * 100}%\n\nDoubles:\n\nCorrect: ${doublesCorrect}\nIncorrect: ${doublesIncorrect}\nAccuracy: ${(doublesCorrect / (doublesCorrect + doublesIncorrect)) * 100}%\n\nMultiples:\nCorrect: ${multiplesCorrect}\nIncorrect: ${multiplesIncorrect}\nAccuracy: ${(multiplesCorrect / (multiplesCorrect + multiplesIncorrect)) * 100}%`;

  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'results.txt';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
 }

builder();
})();
