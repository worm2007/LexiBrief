import React from "react";


export default function RiskScore({
    score=0,
    level="Unknown"
}){


return (

<div className="
bg-white
rounded-3xl
shadow-lg
p-6
">


<h2 className="
text-xl
font-bold
text-slate-800
">

Contract Risk Score

</h2>



<div className="
mt-5
text-5xl
font-bold
text-blue-600
">

{score}

<span className="
text-2xl
text-gray-500
">

/100

</span>

</div>



<div className="
mt-5
h-4
bg-gray-200
rounded-full
">


<div

className="
h-4
bg-blue-600
rounded-full
"

style={{

width:`${score}%`

}}

/>


</div>



<p className="
mt-4
font-semibold
text-gray-600
">

Risk Level:

{level}

</p>


</div>

);

}