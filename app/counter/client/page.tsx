"use client";
import { counterClient } from "@/restate/client";
import useSWR from "swr";
import Form from "next/form";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/Badge";

export default function Client() {
  const {
    data: currentValue,
    mutate,
    isLoading,
  } = useSWR(
    "/Counter/count/current",
    async () => await counterClient.current()
  );

  const formAction = async (formData: FormData) => {
    const amount = Number(formData.get("amount"));
    if (!isNaN(amount)) {
      const newValue = await counterClient.add(amount);
      mutate(newValue);
    }
  };

  return (
    <Form action={formAction} className="flex flex-col gap-4">
      <div className="font-medium text-sm">
        Current value: <Badge>{isLoading ? "…" : currentValue}</Badge>
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
