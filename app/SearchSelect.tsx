import type React from "react";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export type OptionItem = {
  key: string | number;
  label: string;
  active: boolean;
  onSelect: () => void;
};

export type SearchSelectProps = {
  label: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  value: string;
  placeholder: string;
  disabled?: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onClear: () => void;
  clearLabel: string;
  isCleared: boolean;
  options: OptionItem[];
  loading?: boolean;
  statusMessage?: string;
  emptyMessage?: string;
  scrollContainerClassName?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  inputClassName?: string;
};

export default function SearchSelect({
  label,
  inputRef,
  menuRef,
  value,
  placeholder,
  disabled,
  isOpen,
  setOpen,
  onChange,
  onFocus,
  onClear,
  clearLabel,
  isCleared,
  options,
  loading,
  statusMessage,
  emptyMessage = "No matches",
  scrollContainerClassName,
  onScroll,
  inputClassName,
}: SearchSelectProps) {
  const [menuMaxHeight, setMenuMaxHeight] = useState<number>();
  const [openUpwards, setOpenUpwards] = useState(false);
  const inputDisabled = disabled || loading;
  const hasSpinner = Boolean(loading);
  const paddingClass = "pr-12";
  const computedInputClass =
    inputClassName ??
    `w-full rounded-xl border bg-white px-4 py-3 ${paddingClass} text-base text-zinc-900 shadow-sm outline-none transition ${
      inputDisabled
        ? "cursor-not-allowed border-zinc-200 text-zinc-400"
        : "border-zinc-300 hover:border-emerald-300 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 ring-emerald-200"
    }`;
  const baseScrollContainerClass =
    "max-h-[min(16rem,calc(100vh-240px))] overflow-auto [scrollbar-color:#d4d4d8_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full";
  const computedScrollContainerClass = `${baseScrollContainerClass} ${scrollContainerClassName ?? ""}`.trim();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const updateMenuSizing = () => {
      const container = menuRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const gap = 12;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;

      const shouldOpenUpwards = spaceBelow < 220 && spaceAbove > spaceBelow;
      setOpenUpwards(shouldOpenUpwards);

      const availableSpace = shouldOpenUpwards ? spaceAbove : spaceBelow;
      if (!Number.isFinite(availableSpace)) return;

      // Keep the menu within the viewport while allowing comfortable scrolling.
      const computedMax = Math.min(Math.max(availableSpace, 160), 300);
      setMenuMaxHeight(computedMax);
    };

    updateMenuSizing();
    window.addEventListener("resize", updateMenuSizing);
    window.addEventListener("scroll", updateMenuSizing, true);
    return () => {
      window.removeEventListener("resize", updateMenuSizing);
      window.removeEventListener("scroll", updateMenuSizing, true);
    };
  }, [isOpen, menuRef]);

  return (
    <div>
      <label className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="relative mt-1" ref={menuRef}>
        <div className="relative">
          <input
            type="text"
            ref={inputRef}
            disabled={inputDisabled}
            value={value}
            aria-busy={hasSpinner}
            onFocus={() => {
              if (inputDisabled) return;
              onFocus?.();
              setOpen(true);
            }}
            onChange={(event) => {
              if (inputDisabled) return;
              onChange(event.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className={computedInputClass}
            autoComplete="new-password"
          />
          {hasSpinner && (
            <Loader2 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500 animate-spin" />
          )}
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
        {isOpen && (
          <div
            className={`absolute left-0 right-0 z-20 rounded-2xl border border-zinc-200 bg-white shadow-lg ring-1 ring-black/5 ${
              openUpwards ? "bottom-full mb-2" : "top-full mt-2"
            }`}
            style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}
          >
            <div
              className={computedScrollContainerClass}
              style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}
              onScroll={onScroll}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                {clearLabel}
                {isCleared && <span className="text-xs text-emerald-600 font-semibold">Selected</span>}
              </button>
              {loading ? (
                <div className="px-4 py-3 text-sm text-zinc-500">Loading...</div>
              ) : statusMessage ? (
                <div className="px-4 py-3 text-sm text-red-600">{statusMessage}</div>
              ) : options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-zinc-500">{emptyMessage}</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition ${
                      option.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-zinc-800 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                    onClick={() => {
                      option.onSelect();
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
