(() => {
  async function fetchAnswer() {
    try {
      let KEY = "key";
      let directions = document.getElementById("directions").innerText;
      let question = document.getElementById("question").innerText;
      let answers = document.getElementsByClassName("answer-option");
      let arry = Array.from(answers);
      let chatMsg = "";
      let answersText = "";
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
        let answ = msgAnswer.charAt(0).toLowerCase();
        CQ.doPageCallback('answer', answ, {});
        setTimeout(() => {
          CQ.doPageCallback('continue', '', { scrollTop: 0 });
        }, 5500);
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
    document.body.append(Script);
    const lik = document.createElement("li");
    const button = document.createElement("a");
    button.setAttribute("onclick", "fetchAnswer()");
    button.innerText = "Answer";
    lik.append(button);
    document.getElementsByClassName("navbar-nav")[0].append(lik);
  }
  builder();
})();
