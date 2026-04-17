"use client";

import type { FormField } from "../schema/primitives";
import type { EngineAtoms } from "../state";
import type { ArrayScope } from "../runtime/binding";
import { AlertFieldRenderer } from "./fields/AlertFieldRenderer";
import { ArrayFieldRenderer } from "./fields/ArrayFieldRenderer";
import { DateFieldRenderer } from "./fields/DateFieldRenderer";
import { DateRangeFieldRenderer } from "./fields/DateRangeFieldRenderer";
import { FileFieldRenderer } from "./fields/FileFieldRenderer";
import { PhoneFieldRenderer } from "./fields/PhoneFieldRenderer";
import { RadioFieldRenderer } from "./fields/RadioFieldRenderer";
import { SelectFieldRenderer } from "./fields/SelectFieldRenderer";
import { SsnFieldRenderer } from "./fields/SsnFieldRenderer";
import {
  HeadingFieldRenderer,
  OrientationFieldRenderer,
} from "./fields/StaticFieldRenderer";
import { TextFieldRenderer } from "./fields/TextFieldRenderer";

type Props = {
  field: FormField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
  /** Contexto passado ao FileField pra autorizar upload. */
  uploadContext?: { solicitanteUid: string; token?: string };
};

export function FieldDispatch({
  field,
  sectionId,
  atoms,
  arrayScope,
  uploadContext,
}: Props) {
  switch (field.type) {
    case "text":
    case "number":
    case "email":
    case "textarea":
      return (
        <TextFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "select":
      return (
        <SelectFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "radio":
      return (
        <RadioFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "date":
      return (
        <DateFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "daterange":
      return (
        <DateRangeFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "phone":
      return (
        <PhoneFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "ssn":
      return (
        <SsnFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
        />
      );
    case "file":
      if (!uploadContext) {
        return (
          <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            Upload de arquivo indisponível neste contexto.
          </div>
        );
      }
      return (
        <FileFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          arrayScope={arrayScope}
          solicitanteUid={uploadContext.solicitanteUid}
          token={uploadContext.token}
        />
      );
    case "array":
      return (
        <ArrayFieldRenderer
          field={field}
          sectionId={sectionId}
          atoms={atoms}
          uploadContext={uploadContext}
        />
      );
    case "alert":
      return <AlertFieldRenderer field={field} />;
    case "heading":
      return <HeadingFieldRenderer field={field} />;
    case "orientation":
      return <OrientationFieldRenderer field={field} />;
  }
}
