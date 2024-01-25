(() => {
  async function fetchAnswer() {
    const KEY = "key";
    const directions = document.getElementById("directions").innerText;
    const question = document.getElementById("question").innerText;
    const answers = document.getElementsByClassName("answer-option");
    let arry = Array.from(answers);
    var chatMsg = "";
    var answersText = "";
    for (i = 0; i < arry.length; i++) {
      answersText = answersText + " " + arry[i].innerText;
    }
    chatMsg =
      directions +
      " " +
      question +
      " " +
      "answer choices(choose only the letter associated with the answer and please keep it to one line):" +
      " " +
      answersText;
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: chatMsg }],
            temperature: 1.0,
            top_p: 0.7,
            n: 1,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const msgAnswer = data.choices[0].message.content;
        console.log(msgAnswer);
        document.querySelectorAll(".answer-option").forEach((element) => {
          if (element.innerText.includes(msgAnswer)) {
            element.style.color = "#1ed760";
          }
        });
      } else {
        alert("Error: Unable to process your request.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: Unable to process your request.");
    }
  }
  async function fetchMultiple() {
    const options = document.querySelectorAll("option");
    var answerArry = [];
    for (let i = 1; i < 11; i++) {
      answerArry.push(options[i].innerText);
    }
    for (i = 0; i < answerArry.length; i++) {
      answersText += answerArry[i] + ", ";
    }
    chatMsg =
      directions +
      " " +
      question +
      " " +
      "Please fill in the blanks of the question above with the appropriate word provided. Please create an array of the answers you give separated by a comma and a space and only give each word once. Do not under any circumstances give anything other than the answer word in the array. The Answer choices as follows: " +
      answersText;
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: chatMsg }],
            temperature: 1.0,
            top_p: 0.7,
            n: 1,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const msgAnswer = data.choices[0].message.content;
        var arr = "";
        var answered = "";
        console.log(msgAnswer);
        if (msgAnswer.startsWith("The answer choices are: ")) {
          var arr = msgAnswer.split(": ");
          var answered = arr[1].split(", ");
          console.log(answered);
        } else {
          var answered = msgAnswer.split(", ");
          console.log(answered);
        }
        let answIndex = 0;
        answered.forEach((element) => {
          document.querySelectorAll("select")[answIndex].value =
            answerArry.indexOf(element);
          i++;
        });
      } else {
        alert("Error: Unable to process your request.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: Unable to process your request.");
    }
  }
  function builder() {
    const Script = document.createElement("script");
    Script.append(eval(fetchAnswer));
    Script.append(eval(fetchMultiple));
    document.body.append(Script);
    const lik = document.createElement("li");
    const lik2 = document.createElement("li");
    const button = document.createElement("a");
    const button2 = document.createElement("a");
    button.setAttribute("onclick", "fetchAnswer()");
    button2.setAttribute("onclick", "fetchMultiple()");
    button.innerText = "Turn Answer Green";
    button2.innerText = "Input Multiple choice answers";
    lik.append(button);
    lik2.append(button2);
    document.getElementsByClassName("navbar-nav")[0].append(lik);
    document.getElementsByClassName("navbar-nav")[0].append(lik2);
  }
  builder();
})();
