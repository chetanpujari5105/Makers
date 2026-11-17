"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* Owner-only: upload a product file straight to the private R2 bucket, then record it. */
export function UploadForm({ productId }: { productId: string }) {
  const id = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    const label = String(form.get("label") ?? "").trim();
    if (!(file instanceof File) || file.size === 0) return setMessage("Choose a file first.");
    setBusy(true);
    setMessage("Uploading…");
    try {
      const post = async (url: string, body: unknown) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await response.json().catch(() => ({}))) as Record<string, string>;
        if (!response.ok) throw new Error(data.message ?? "Something went wrong.");
        return data;
      };
      const { uploadUrl, key, contentType } = await post("/api/admin/uploads", {
        productId,
        fileName: file.name,
        size: file.size,
      });
      const put = await fetch(uploadUrl!, {
        method: "PUT",
        headers: { "Content-Type": contentType! },
        body: file,
      });
      if (!put.ok) throw new Error("The upload to storage failed. Check the R2 CORS settings.");
      await post("/api/admin/files", {
        productId,
        key,
        fileName: file.name,
        label: label || file.name,
      });
      setMessage(`Uploaded ${file.name}.`);
      formElement.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-label`}>File name shown to buyers</Label>
        <Input id={`${id}-label`} name="label" maxLength={120} placeholder="e.g. Workbook (PDF)" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-file`}>File (up to 200 MB)</Label>
        <Input id={`${id}-file`} name="file" type="file" required className="py-2.5" />
      </div>
      <Button type="submit" variant="outline" loading={busy} className="self-start">
        Upload file
      </Button>
      {message ? (
        <p role="status" className="text-base">
          {message}
        </p>
      ) : null}
    </form>
  );
}
