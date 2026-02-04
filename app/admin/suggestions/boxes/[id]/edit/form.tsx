"use client";

import EditBoxFormOriginal from "@/app/admin/boxes/[id]/edit/form";
import Boxes from "@/@backend-types/Boxes";

export default function EditBoxForm({ box }: { box: Boxes }) {
  return (
    <EditBoxFormOriginal
      box={box}
      returnBasePath="/admin/suggestions/boxes"
    />
  );
}
