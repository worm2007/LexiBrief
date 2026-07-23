import React from "react";


export default function AnalysisCard({
title,
icon,
content
}){


return (

<div className="
bg-white
rounded-3xl
shadow-lg
p-6
border
hover:shadow-xl
transition
">


<div className="
flex
items-center
gap-3
mb-4
">

{icon}

<h2 className="
font-bold
text-xl
">
{title}
</h2>


</div>


<div className="
text-gray-600
text-sm
leading-relaxed
max-h-80
overflow-y-auto
whitespace-pre-wrap
">

{content || "Waiting for analysis..."}

</div>


</div>

)

}