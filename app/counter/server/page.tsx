import Form from "next/form";
import { counterClient } from "@/restate/client";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";

export default async function Server() {
  //const counterValue = await counterClient.current();

  async function formAction(formData: FormData) {
    "use server";
    const text: string = String(formData.get("text"));
    await counterClient.add(text);
    revalidatePath("/counter/server");
  }

  return (
    <Form action={formAction} className="flex flex-col gap-4">
      <div className="font-medium text-sm">
       Talk to the agent!
      </div>
      <Input
        type="text"
        name="text"
        required
        placeholder=""
        label="Talk to the agent"
      />
      <SubmitButton>Add</SubmitButton>
    </Form>
  );
}
