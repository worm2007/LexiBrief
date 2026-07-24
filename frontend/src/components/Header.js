import React from "react";
import { Upload } from "lucide-react";

export default function Header({ onUploadClick }) {

  return (

    <div className="
      flex
      justify-between
      items-center
    ">

      <div>

        <h1 className="
          text-4xl
          font-bold
          text-slate-800
        ">
          Legal Intelligence Dashboard
        </h1>

        <p className="
          text-gray-500
          mt-2
        ">
          Analyze contracts with AI
        </p>

      </div>

      <button
        onClick={onUploadClick}
        className="
          bg-blue-600
          text-white
          px-5
          py-3
          rounded-xl
          flex
          gap-2
          items-center
          hover:bg-blue-700
          transition
        "
      >
        <Upload size={20} />
        Upload Contract
      </button>

    </div>

  );

}