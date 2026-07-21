import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  ShieldAlert,
  Scale,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useDropzone } from "react-dropzone";

function App() {
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState({
    summary: "",
    clauses: "",
    risks: ""
  });

  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);

  const uploadDocument = async (files) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", files[0]);

    const upload = await axios.post(
      "http://localhost:8000/upload",
      formData
    );

    const id = upload.data.document_id;
    setDocId(id);

    const [summary, clauses, risks] =
      await Promise.all([
        axios.post(
          "http://localhost:8000/analyze",
          {
            doc_id:id,
            type:"summary"
          }
        ),

        axios.post(
          "http://localhost:8000/analyze",
          {
            doc_id:id,
            type:"clauses"
          }
        ),

        axios.post(
          "http://localhost:8000/analyze",
          {
            doc_id:id,
            type:"risks"
          }
        )
      ]);

    setResults({
      summary:summary.data.result,
      clauses:clauses.data.result,
      risks:risks.data.result
    });

    setLoading(false);
  };


  const askQuestion = async()=>{

    const res =
    await axios.post(
      `http://localhost:8000/chat?doc_id=${docId}&query=${query}`
    );

    setChat([
      ...chat,
      {
        question:query,
        answer:res.data.answer
      }
    ]);

    setQuery("");
  };


  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop:uploadDocument,
    accept:{
      "application/pdf":[".pdf"]
    }
  });



return (

<div className="min-h-screen bg-slate-100 flex">


{/* Sidebar */}

<div className="w-72 bg-[#0B1F3A] text-white p-8">

<div className="flex gap-3 items-center mb-10">

<Scale size={35}
className="text-blue-400"/>

<h1 className="text-2xl font-bold">
LexiBrief
</h1>

</div>


<p className="text-slate-300">
AI Legal Document Intelligence
</p>


<div className="mt-10 space-y-4 text-sm">

<div className="flex gap-3">
<FileText/>
Document Summary
</div>


<div className="flex gap-3">
<ShieldAlert/>
Risk Detection
</div>


<div className="flex gap-3">
<MessageSquare/>
Contract Chat
</div>

</div>


</div>



{/* Main */}

<div className="flex-1 p-10">


<h2 className="text-4xl font-bold text-slate-800">
Legal AI Assistant
</h2>


<p className="text-slate-500 mt-2">
Upload a contract and get instant AI analysis
</p>



{!docId && (

<div
{...getRootProps()}
className="
mt-10
bg-white
rounded-3xl
border-2
border-dashed
border-blue-300
p-16
text-center
shadow-xl
cursor-pointer
hover:border-blue-600
transition
">


<input {...getInputProps()}/>


<Upload
size={60}
className="mx-auto text-blue-600"
/>


<h3 className="text-2xl font-semibold mt-5">
Upload Legal Document
</h3>


<p className="text-gray-500 mt-2">
Drag & drop PDF contract here
</p>


{loading &&
<Loader2
className="animate-spin mx-auto mt-5"
/>
}


</div>

)}



{docId && (

<div className="grid grid-cols-3 gap-6 mt-10">


<Card
title="Executive Summary"
icon={<FileText/>}
text={results.summary}
/>


<Card
title="Important Clauses"
icon={<Scale/>}
text={results.clauses}
/>


<Card
title="Risk Analysis"
icon={<ShieldAlert/>}
text={results.risks}
/>


</div>

)}



{docId && (

<div className="
mt-10
bg-white
rounded-3xl
shadow-xl
p-6
">


<div className="flex gap-3 items-center">

<MessageSquare/>
<h2 className="text-xl font-bold">
Ask your contract
</h2>

</div>


<div className="
h-72
overflow-y-auto
mt-5
space-y-4
">


{
chat.map((c,i)=>(

<div key={i}>

<p className="font-semibold text-blue-700">
You: {c.question}
</p>

<p className="bg-slate-100 p-3 rounded-xl mt-1">
{c.answer}
</p>

</div>

))
}


</div>



<div className="flex gap-3 mt-5">

<input

value={query}

onChange={
e=>setQuery(e.target.value)
}

className="
flex-1
border
rounded-xl
p-3
"

placeholder="Ask about this contract..."

/>


<button

onClick={askQuestion}

className="
bg-blue-600
text-white
px-5
rounded-xl
"

>

<Send/>

</button>


</div>


</div>

)}



</div>

</div>

);

}


function Card({title,icon,text}){

return (

<div className="
bg-white
rounded-3xl
shadow-lg
p-6
h-96
overflow-auto
">


<div className="
flex
gap-3
items-center
font-bold
text-xl
mb-5
">

{icon}

{title}

</div>


<p className="
text-sm
leading-relaxed
whitespace-pre-wrap
text-slate-700
">

{text}

</p>


</div>

)

}


export default App;
