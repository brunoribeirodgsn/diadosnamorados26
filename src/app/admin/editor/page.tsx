import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EditorShell } from "@/components/admin/EditorShell";
import { verifySessionToken } from "@/lib/auth";

export default async function AdminEditorPage() {
  const store = await cookies();
  if (!verifySessionToken(store.get("love_admin_session")?.value)) redirect("/login");

  return (
    <AdminLayout>
      <EditorShell />
    </AdminLayout>
  );
}
