"use client";

import { useEffect, useState } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

const templates = [
  { id: 0, name: "Click to select" },
  { id: 1, name: "PNOV Bridge" },
];

// Prop Types
type SelectInputProps = {
  selected: string | null;
  onSelect: (templateName: string) => void;
};

export default function SelectInput({ selected, onSelect }: SelectInputProps) {
  const [selectedOption, setSelectedOption] = useState(templates[0]);

  // handler functions
  function handleTemplateSelect(template: { id: number; name: string }) {
    setSelectedOption(template);
    onSelect(template.name);
  }

  // Sync internal state when parent-provided value changes
  useEffect(() => {
    const matched = templates.find((template) => template.name === selected);
    setSelectedOption(matched ?? templates[0]);
  }, [selected]);

  return (
    <Listbox value={selectedOption} onChange={handleTemplateSelect}>
      <Label className="block text-md font-semibold text-gray-100">
        Template
      </Label>
      <div className="mt-2.5 relative block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white text-left text-gray-900  text-base">
          <span className="col-start-1 row-start-1 truncate pr-6">
            {selectedOption.name}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="relative z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5  data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {templates.map((template) => (
            <ListboxOption
              key={template.id}
              value={template}
              className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">
                {template.name}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
