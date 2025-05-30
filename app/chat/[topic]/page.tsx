"use client";
import Form from "next/form";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Chat() {
  const { topic } = useParams<{ topic: string }>();

  const [messages, setMessages] = useState<{ content: string; role: string }[]>(
    []
  );

  useEffect(() => {
    let cancelled = false;
    let abortController: AbortController;
    let offset = 0;
    const obtainAPIResponse = async () => {
      abortController = new AbortController();
      try {
        const apiResponse = await fetch(`/pubsub/${topic}?offset=${offset}`, {
          signal: abortController.signal,
        });

        if (!apiResponse.body) return;

        const reader = apiResponse.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            obtainAPIResponse();
            break;
          }

          if (value && !cancelled) {
            setMessages((messages) => {
              const newValue = [
                ...messages,
                ...value
                  .split("data: ")
                  .filter(Boolean)
                  .map((str) => JSON.parse(str))
                  .map(({ content, role }) => ({
                    content: content
                      .replace(/\\n/g, "\n")
                      .replace(/\n\n/g, "\n"),
                    role,
                  })),
              ];

              offset = newValue.length;
              return newValue;
            });
          }
        }
      } catch (error) {}
    };
    obtainAPIResponse();

    return () => {
      abortController.abort();
      cancelled = true;
    };
  }, [topic]);

  const formAction = async (formData: FormData) => {
    if (String(formData.get("message"))) {
      await fetch(`/pubsub/${topic}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: String(formData.get("message")),
        }),
      });
    }
  };

  return (
    <div className="min-h-[100vh] max-w-xl w-full mx-auto flex flex-col ">
      <div className="flex-auto py-24 flex flex-col gap-2 items-start px-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "ml-auto rounded-lg bg-white border border-gray-200 shadow-sm py-1 px-2 whitespace-pre-line max-w-[80%]"
                : " py-1 px-2 whitespace-pre-line max-w-[80%] [&&&_math]:hidden2"
            }
            ref={(e) => {
              if (index === messages.length - 1 && e) {
                e.scrollIntoView();
              }
            }}
          >
            {message.content}{" "}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-36  bg-gradient-to-b from-transparent to-[var(--background)]  " />
      <div className="sticky bottom-4 w-full rounded-lg bg-white  outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 focus-within:shadow-lg">
        <Form className="relative min-h-28" action={formAction}>
          <textarea
            name="message"
            aria-label="Write your message"
            placeholder="Write your message"
            className="absolute inset-0 block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-0 sm:text-sm/6"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button className="absolute right-1.5 flex bottom-1.5 items-center rounded-lg bg-indigo-600 px-3 pr-1.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Send{" "}
            <span className="bg-white/20 rounded-md px-1 py-0.5 ml-2 [font-size:80%] font-mono">
              CMD + ⏎
            </span>
          </button>
        </Form>
      </div>
    </div>
  );
}
