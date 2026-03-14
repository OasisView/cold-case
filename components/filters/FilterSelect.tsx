// FilterSelect — custom div-based dropdown for filter controls (replaces native <select>)
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownPosRef = useRef({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((o) => o.value === value);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Close on scroll outside (fixed dropdown would desync from trigger)
  // Allow scrolling inside the dropdown list itself
  useEffect(() => {
    if (!isOpen) return;

    function handleScroll(e: Event) {
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  // Reset focused index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((o) => o.value === value);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          e.key === "Enter" ||
          e.key === " " ||
          e.key === "ArrowDown"
        ) {
          e.preventDefault();
          if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            dropdownPosRef.current = {
              top: rect.bottom + 2,
              left: rect.left,
              width: rect.width,
            };
          }
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            Math.min(prev + 1, options.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, focusedIndex, options, onChange]
  );

  return (
    <div
      className="flex flex-col gap-[6px] overflow-visible"
      ref={containerRef}
    >
      <label
        className="font-[family-name:var(--font-mono)] text-muted2 uppercase"
        style={{ fontSize: "11px", letterSpacing: "2.5px" }}
      >
        {label}
      </label>
      <div className="relative">
        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            if (!isOpen && triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              dropdownPosRef.current = {
                top: rect.bottom + 2,
                left: rect.left,
                width: rect.width,
              };
            }
            setIsOpen(!isOpen);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-bg3 border border-border text-ice font-[family-name:var(--font-mono)] cursor-pointer focus:border-red/50 focus:outline-none text-left flex items-center justify-between"
          style={{
            fontSize: "12px",
            padding: "7px 10px",
            borderRadius: "2px",
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>{selectedOption?.label ?? ""}</span>
          <svg
            className="pointer-events-none text-muted2 shrink-0"
            style={{
              width: "10px",
              height: "10px",
              transition: "transform 150ms ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 3.5L5 6.5L8 3.5" />
          </svg>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <div
            className="bg-bg3 border border-border"
            style={{
              position: "fixed",
              top: dropdownPosRef.current.top,
              left: dropdownPosRef.current.left,
              width: dropdownPosRef.current.width,
              zIndex: 50,
              borderRadius: "2px",
              maxHeight: "240px",
              overflowY: "auto",
            }}
            role="listbox"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isFocused = i === focusedIndex;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(i)}
                  className="font-[family-name:var(--font-mono)] cursor-pointer overflow-hidden"
                  style={{
                    fontSize: "12px",
                    padding: "8px 10px",
                    color: "#F0F2F5",
                    background: isFocused
                      ? "#C8102E"
                      : isSelected
                        ? "rgba(200,16,46,0.15)"
                        : "transparent",
                    borderLeft: isSelected
                      ? "2px solid #C8102E"
                      : "2px solid transparent",
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
