"use client";

import type { HeadingField, OrientationField } from "../../schema/primitives";

export function HeadingFieldRenderer({ field }: { field: HeadingField }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {field.label}
    </h3>
  );
}

export function OrientationFieldRenderer({
  field,
}: {
  field: OrientationField;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      {field.label && (
        <strong className="block pb-1 text-foreground">{field.label}</strong>
      )}
      <p>{field.text}</p>
    </div>
  );
}
