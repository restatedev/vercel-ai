import { redirect } from "next/navigation";

export default function Chat() {
  redirect(`./chat/${crypto.randomUUID()}`);
}
