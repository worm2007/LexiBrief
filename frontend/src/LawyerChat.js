import React, { useState } from "react";
import axios from "axios";
import { Send, Scale, Bot } from "lucide-react";


function LawyerChat({ documentId }) {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);



  const sendQuestion = async () => {

    if (!question.trim()) return;


    const userQuestion = question;


    setMessages(prev => [
      ...prev,
      {
        role: "user",
        text: userQuestion
      }
    ]);


    setQuestion("");
    setLoading(true);



    try {

      const response = await axios.post(

        "https://lexibrief-backend.onrender.com/legal-chat",

        {
          document_id: documentId || null,
          question: userQuestion
        }

      );


      setMessages(prev => [

        ...prev,

        {
          role: "lexi",
          text: response.data.answer
        }

      ]);



    } catch(error) {


      setMessages(prev => [

        ...prev,

        {
          role:"lexi",
          text:"Unable to connect with Lexi AI Lawyer."
        }

      ]);

    }


    setLoading(false);

  };





  const handleKeyPress = (e)=>{

    if(e.key === "Enter"){
      sendQuestion();
    }

  };





  return (

    <div className="
    bg-white
    rounded-3xl
    shadow-xl
    p-6
    mt-10
    border
    ">


      <div className="
      flex
      items-center
      gap-3
      mb-5
      ">


        <div className="
        bg-blue-600
        text-white
        p-3
        rounded-xl
        ">

          <Scale/>

        </div>


        <div>

          <h2 className="
          text-2xl
          font-bold
          text-slate-800
          ">

          Lexi AI Lawyer

          </h2>


          <p className="text-sm text-gray-500">

          Ask legal questions with or without documents

          </p>


        </div>


      </div>





      <div className="
      h-96
      overflow-y-auto
      bg-slate-50
      rounded-2xl
      p-5
      space-y-4
      ">



      {
        messages.length === 0 &&

        <div className="
        text-center
        text-gray-400
        mt-20
        ">

          <Bot
          size={45}
          className="mx-auto mb-3"
          />


          <p>
          Hi, I am Lexi. Ask me any legal question.
          </p>


        </div>

      }




      {
        messages.map((msg,index)=>(


          <div
          key={index}
          className={
            msg.role==="user"
            ?
            "flex justify-end"
            :
            "flex justify-start"
          }
          >


            <div

            className={

              msg.role==="user"

              ?

              "bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-xl"

              :

              "bg-white border px-4 py-3 rounded-2xl max-w-xl shadow-sm"

            }

            >

              {msg.text}

            </div>


          </div>


        ))

      }





      {
        loading &&

        <p className="text-gray-500">
        Lexi is thinking...
        </p>

      }


      </div>





      <div className="
      flex
      gap-3
      mt-5
      ">


        <input

        value={question}

        onChange={
          e=>setQuestion(e.target.value)
        }

        onKeyDown={handleKeyPress}

        placeholder="Ask Lexi anything legal..."

        className="
        flex-1
        border
        rounded-xl
        px-4
        py-3
        focus:ring-2
        focus:ring-blue-500
        outline-none
        "

        />



        <button

        onClick={sendQuestion}

        className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-5
        rounded-xl
        flex
        items-center
        gap-2
        "

        >

          <Send size={20}/>

          Send

        </button>



      </div>



    </div>

  );

}


export default LawyerChat;