import Form from "next/form";
import { counterClient } from "@/restate/client";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";

export default async function Server() {
  const counterValue = await counterClient.current();

  async function formAction(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    if (!isNaN(amount)) {
      await counterClient.add(amount);
      revalidatePath("/counter/server");
    }
  }

  return (
    <Form action={formAction} className="flex flex-col gap-4">
      <div className="font-medium text-sm">
        Current value: <Badge>{counterValue}</Badge>
      </div>
      <Input
        type="number"
        name="amount"
        required
        placeholder="0"
        label="Amount"
      />
      <SubmitButton>Add</SubmitButton>
    </Form>
  );
}
