import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Clipboard,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAnalysis } from "../../context/AnalysisContext";
import { askLegalQuestion } from "../../services/api";

const documentSuggestedQuestions = [
  "Summarize this contract",
  "Highlight the riskiest clauses",
  "Explain the payment terms",
  "What are the termination conditions?",
  "What are my main obligations?",
];

const generalSuggestedQuestions = [
  "What is a non-disclosure agreement?",
  "What should I check before signing a contract?",
  "Explain indemnity in simple words",
  "What is the difference between arbitration and court?",
  "What makes a contract legally valid?",
];

export default function AIChat() {
  const { analysis } = useAnalysis();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestChatsRemaining, setGuestChatsRemaining] = useState(10);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "Hello! I am LexiBrief AI. You can ask me any general legal question, or upload a legal document for document-specific answers.",
    },
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const hasDocument = Boolean(analysis?.document_id);
  const hasConversation = messages.some((item) => item.role === "user");
  const suggestedQuestions = hasDocument
    ? documentSuggestedQuestions
    : generalSuggestedQuestions;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const sendMessage = async (presetQuestion) => {
    const question =
      typeof presetQuestion === "string"
        ? presetQuestion.trim()
        : message.trim();

    if (!question || loading) {
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

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });

    try {
  const response = await askLegalQuestion({
    question,
    documentId: analysis?.document_id || null,
  });

  // Update guest remaining chats
  if (typeof response?.remaining === "number") {
    setGuestChatsRemaining(response.remaining);
  }

  const answer =
    response?.answer ||
    response?.response ||
    response?.result ||
    response?.message ||
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

  if (error?.response?.status === 403) {
    setGuestChatsRemaining(0);

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "ai",
        text: "You have used all 10 free AI chats. Please create a free account to continue.",
        isError: true,
      },
    ]);

    toast.error("Free AI chat limit reached");
    return;
  }

  const errorMessage =
    error?.response?.data?.detail ||
    error?.message ||
    "Unable to get an answer from LexiBrief AI.";

  setMessages((previousMessages) => [
    ...previousMessages,
    {
      role: "ai",
      text: `I could not complete that request.\n\n${errorMessage}`,
      isError: true,
    },
  ]);

  toast.error("Unable to get an AI response");
} finally {
  setLoading(false);
}
  };

  const copyResponse = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Response copied");

      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Unable to copy response");
    }
  };

  const handleTextareaChange = (event) => {
    setMessage(event.target.value);

    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(
      event.target.scrollHeight,
      160,
    )}px`;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        relative
        mt-8
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/70
        shadow-xl
        shadow-black/10
        backdrop-blur-xl
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-indigo-500/50
          to-transparent
        "
      />

      <div
        className="
          absolute
          -right-28
          -top-28
          h-72
          w-72
          rounded-full
          bg-indigo-500/5
          blur-3xl
        "
      />

      <div className="relative border-b border-slate-800/80 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-indigo-500/20
                bg-indigo-500/10
              "
            >
              <Bot size={25} className="text-indigo-400" />
            </motion.div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                LexiBrief AI Assistant
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {hasDocument
                  ? "Ask questions about the uploaded contract and receive document-aware legal explanations."
                  : "Ask general legal questions now, or upload a document for document-specific answers."}
              </p>
              {!localStorage.getItem("lexibrief_token") && (
  <div className="mt-3 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
    {guestChatsRemaining} / 10 Free AI Chats Remaining
  </div>
)}
            </div>
          </div>

          <div
            className={`
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              px-3.5
              py-2
              text-sm
              font-medium
              ${
                hasDocument
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-700 bg-slate-800/70 text-slate-400"
              }
            `}
          >
            <span
              className={`
                h-2
                w-2
                rounded-full
                ${hasDocument ? "bg-emerald-400" : "bg-slate-500"}
              `}
            />

            {hasDocument ? "Document mode" : "General legal mode"}
          </div>
        </div>
      </div>

      <div className="relative p-6 sm:p-8">
        <>
            {!hasConversation && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Sparkles size={16} className="text-indigo-400" />
                  Suggested questions
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {suggestedQuestions.map((question) => (
                    <motion.button
                      key={question}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(question)}
                      disabled={loading}
                      className="
                        rounded-xl
                        border
                        border-slate-800
                        bg-slate-950/40
                        p-4
                        text-left
                        text-sm
                        leading-6
                        text-slate-300
                        transition
                        hover:border-indigo-500/30
                        hover:bg-indigo-500/5
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div
              className="
                h-[28rem]
                overflow-y-auto
                rounded-2xl
                border
                border-slate-800
                bg-slate-950/45
                p-4
                sm:p-5
              "
            >
              <div className="space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((item, index) => (
                    <ChatMessage
                      key={`${item.role}-${index}`}
                      message={item}
                      index={index}
                      copiedIndex={copiedIndex}
                      onCopy={copyResponse}
                    />
                  ))}

                  {loading && <TypingIndicator key="typing" />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-5">
              <div
                className="
                  flex
                  items-end
                  gap-3
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-950/70
                  p-3
                  shadow-inner
                  shadow-black/10
                  transition
                  focus-within:border-indigo-500/50
                  focus-within:ring-2
                  focus-within:ring-indigo-500/10
                "
              >
                <textarea
                  ref={textareaRef}
                  value={message}
                  disabled={loading}
                  rows={1}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasDocument
                      ? "Ask anything about this contract..."
                      : "Ask any general legal question..."
                  }
                  className="
                    max-h-40
                    min-h-[44px]
                    flex-1
                    resize-none
                    bg-transparent
                    px-2
                    py-2.5
                    text-sm
                    leading-6
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !message.trim()}
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-600
                    text-white
                    shadow-lg
                    shadow-indigo-950/30
                    transition
                    hover:bg-indigo-500
                    disabled:cursor-not-allowed
                    disabled:bg-slate-800
                    disabled:text-slate-600
                    disabled:shadow-none
                  "
                  aria-label="Send message"
                >
                  <Send size={19} />
                </motion.button>
              </div>

              <p className="mt-2 text-center text-xs text-slate-600">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </div>
        </>
      </div>
    </motion.section>
  );
}

function ChatMessage({
  message,
  index,
  copiedIndex,
  onCopy,
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-indigo-500/20
            bg-indigo-500/10
          "
        >
          <Bot size={18} className="text-indigo-400" />
        </div>
      )}

      <div className={`min-w-0 max-w-3xl ${isUser ? "text-right" : ""}`}>
        <div
          className={`
            mb-1.5
            text-xs
            font-medium
            ${isUser ? "text-indigo-300" : "text-slate-500"}
          `}
        >
          {isUser ? "You" : "LexiBrief AI"}
        </div>

        <div
          className={`
            rounded-2xl
            px-4
            py-3
            text-left
            text-sm
            leading-7
            ${
              isUser
                ? "rounded-tr-md bg-indigo-600 text-white"
                : message.isError
                  ? "rounded-tl-md border border-red-500/20 bg-red-500/5 text-red-200"
                  : "rounded-tl-md border border-slate-800 bg-slate-900/90 text-slate-200"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
            <div
              className="
                prose
                prose-invert
                max-w-none
                prose-headings:mb-2
                prose-headings:mt-4
                prose-headings:text-white
                prose-p:my-2
                prose-p:leading-7
                prose-strong:text-white
                prose-ul:my-2
                prose-ol:my-2
                prose-li:my-1
                prose-li:text-slate-300
                prose-code:rounded
                prose-code:bg-slate-950
                prose-code:px-1.5
                prose-code:py-0.5
                prose-code:text-indigo-300
                prose-blockquote:border-indigo-500
                prose-blockquote:text-slate-400
              "
            >
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <button
            type="button"
            onClick={() => onCopy(message.text, index)}
            className="
              mt-2
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-2
              py-1.5
              text-xs
              font-medium
              text-slate-500
              transition
              hover:bg-slate-800
              hover:text-slate-300
            "
          >
            {copiedIndex === index ? (
              <>
                <Check size={13} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={13} />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {isUser && (
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-blue-500/20
            bg-blue-500/10
          "
        >
          <User size={18} className="text-blue-400" />
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3"
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-indigo-500/20
          bg-indigo-500/10
        "
      >
        <Bot size={18} className="text-indigo-400" />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">
          LexiBrief AI
        </p>

        <div
          className="
            flex
            items-center
            gap-1.5
            rounded-2xl
            rounded-tl-md
            border
            border-slate-800
            bg-slate-900/90
            px-4
            py-4
          "
        >
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              className="h-2 w-2 rounded-full bg-indigo-400"
              animate={{
                y: [0, -5, 0],
                opacity: [0.45, 1, 0.45],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: item * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}