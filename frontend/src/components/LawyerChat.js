import React, { useState } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2 } from "lucide-react";


function LawyerChat({ documentId }) {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);



  const askLexi = async () => {

    if (!question.trim()) return;


    const userMessage = {
      role: "user",
      text: question
    };


    setMessages(prev => [
      ...prev,
      userMessage
    ]);


    setLoading(true);


    try {


      const response = await axios.post(

        "https://lexibrief-backend.onrender.com/legal-chat",

        {
          document_id: documentId || null,
          question: question
        }

      );


      console.log(
        "LEXI RESPONSE:",
        response.data
      );



      const botMessage = {

        role: "bot",

        text:
          response.data.answer ||
          "No answer received"

      };



      setMessages(prev => [

        ...prev,

        botMessage

      ]);



    } catch(error) {


      console.log(
        "LEGAL CHAT ERROR:",
        error
      );



      setMessages(prev => [

        ...prev,

        {

          role:"bot",

          text:
          "Sorry, Lexi is unable to answer right now."

        }

      ]);



    }


    setQuestion("");

    setLoading(false);

  };




  return (

    <div className="
    mt-10
    bg-white
    rounded-3xl
    shadow-xl
    p-6
    border
    ">


      {/* Header */}

      <div className="
      flex
      items-center
      gap-3
      mb-5
      ">

        <div className="
        bg-blue-100
        p-3
        rounded-full
        ">

          <Bot
          className="text-blue-600"
          />

        </div>


        <div>

          <h2 className="
          text-xl
          font-bold
          text-slate-800
          ">
            Lexi AI Lawyer
          </h2>


          <p className="
          text-sm
          text-gray-500
          ">
            Ask about your document or any legal topic
          </p>


        </div>


      </div>





      {/* Chat Area */}

      <div className="
      h-80
      overflow-y-auto
      space-y-4
      bg-slate-50
      rounded-2xl
      p-4
      ">


      {
        messages.map((msg,index)=>(


          <div

          key={index}

          className={

            msg.role === "user"

            ?

            "flex justify-end"

            :

            "flex justify-start"

          }


          >


          <div

          className={

            msg.role === "user"

            ?

            `
            bg-blue-600
            text-white
            rounded-2xl
            p-3
            max-w-[75%]
            flex
            gap-2
            items-start
            `


            :


            `
            bg-white
            border
            rounded-2xl
            p-3
            max-w-[75%]
            flex
            gap-2
            items-start
            shadow-sm
            `

          }


          >


          {

          msg.role === "user"

          ?

          <User size={18}/>

          :

          <Bot 
          size={18}
          className="text-blue-600"
          />

          }



          <p className="
          whitespace-pre-wrap
          text-sm
          leading-relaxed
          ">
            {msg.text}
          </p>



          </div>


          </div>



        ))
      }


      {

      loading &&

      <div className="flex gap-2 items-center text-gray-500">

        <Loader2
        size={18}
        className="animate-spin"
        />

        Lexi is thinking...

      </div>

      }


      </div>





      {/* Input */}

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


      onKeyDown={
        e=>{
          if(e.key==="Enter")
          askLexi();
        }
      }


      placeholder="
      Ask Lexi anything...
      "


      className="
      flex-1
      border
      rounded-xl
      p-3
      outline-none
      focus:ring-2
      focus:ring-blue-400
      "

      />



      <button

      onClick={askLexi}


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


      </button>


      </div>



    </div>

  );

}


export default LawyerChat;