import React from "react";
import {
  Scale,
  FileText,
  ShieldAlert,
  MessageSquare,
  History
} from "lucide-react";


export default function Sidebar(){

return (

<div className="
w-72
min-h-screen
bg-[#071A33]
text-white
p-8
">

<div className="
flex
items-center
gap-3
mb-12
">

<Scale
size={38}
className="text-blue-400"
/>

<h1 className="
text-3xl
font-bold
">
Lexi
</h1>

</div>


<div className="space-y-6">


<Menu icon={<FileText/>}
text="Documents"
/>


<Menu icon={<ShieldAlert/>}
text="Risk Analysis"
/>


<Menu icon={<MessageSquare/>}
text="AI Lawyer"
/>


<Menu icon={<History/>}
text="History"
/>


</div>


</div>

)

}



function Menu({icon,text}){

return (

<div className="
flex
items-center
gap-4
text-slate-300
hover:text-white
cursor-pointer
transition
">

{icon}

<span>
{text}
</span>

</div>

)

}