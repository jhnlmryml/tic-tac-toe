"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrewAvatar } from "./crew-avatar";
import { crew, getCrew, isCrewId, type CrewId } from "../model";

type CrewSelectProps = {
  id: string;
  value: CrewId;
  onChange: (value: CrewId) => void;
  unavailable?: CrewId[];
  label: string;
};

export function CrewSelect({ id, value, onChange, unavailable = [], label }: CrewSelectProps) {
  const selected = getCrew(value);
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isCrewId(next)) onChange(next);
      }}
    >
      <SelectTrigger id={id} className="character-dropdown" aria-label={label}>
        <SelectValue>
          <span className="crew-option crew-option-selected">
            <CrewAvatar id={selected.id} size={36} />
            <span className="crew-option-copy">
              <strong>{selected.name}</strong>
              <small>{selected.role}</small>
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="crew-picker-content"
        position="popper"
        align="start"
      >
        <SelectGroup>
          {crew.map((member) => (
            <SelectItem
              key={member.id}
              value={member.id}
              disabled={unavailable.includes(member.id)}
              className="crew-picker-item"
            >
              <span className="crew-option">
                <CrewAvatar id={member.id} size={34} />
                <span className="crew-option-copy">
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
