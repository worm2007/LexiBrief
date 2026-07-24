import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysis } from "../../context/AnalysisContext";
import { askLegalQuestion } from "../../services/api";

export default function AIChat() {
  const { analysis } = useAnalysis();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I am LexiBrief AI. Upload a legal document and ask me anything about it.",
    },
  ]);

  const sendMessage = async () => {
    const question = message.trim();

    if (!question || loading) {
      return;
    }

    if (!analysis?.document_id) {
      alert("Please upload and analyze a document first.");
      return;
    }

    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await askLegalQuestion({
        question,
        documentId: analysis.document_id,
      });

      const answer =
        response.answer ||
        response.response ||
        response.result ||
        response.message ||
        "I could not generate an answer for this question.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: answer,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unable to get an answer from LexiBrief AI.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="
        mt-8
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/60
        p-8
        backdrop-blur-xl
      "
    >
      {/* Header */}

      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/20
          "
        >
          <Bot className="text-indigo-400" size={26} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            AI Legal Assistant
          </h2>

          <p className="text-sm text-slate-400">
            Ask questions about your contract
          </p>
        </div>
      </div>

      {/* Chat Area */}

      <div
        className="
          mt-8
          h-80
          overflow-y-auto
          space-y-4
          rounded-2xl
          border
          border-slate-800
          bg-slate-950/50
          p-5
        "
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`
              flex
              gap-3
              ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }
            `}
          >
            {msg.role === "ai" && (
              <Bot
                className="mt-1 text-indigo-400"
                size={20}
              />
            )}

            <div
              className={`
                max-w-xl
                whitespace-pre-wrap
                rounded-2xl
                px-4
                py-3
                ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-200"
                }
              `}
            >
              {msg.text}
            </div>

            {msg.role === "user" && (
              <User
                className="mt-1 text-blue-400"
                size={20}
              />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <Bot
              className="mt-1 text-indigo-400"
              size={20}
            />

            <div className="rounded-2xl bg-slate-800 px-4 py-3 text-slate-300">
              LexiBrief AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}

      <div className="mt-5 flex gap-3">
        <input
          value={message}
          disabled={loading}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder={
            analysis?.document_id
              ? "Ask about this document..."
              : "Upload a document before asking questions..."
          }
          className="
            flex-1
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            px-5
            py-3
            text-white
            outline-none
            focus:border-indigo-500
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={
            loading ||
            !message.trim() ||
            !analysis?.document_id
          }
          className="
            rounded-xl
            bg-indigo-600
            px-5
            text-white
            hover:bg-indigo-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
}