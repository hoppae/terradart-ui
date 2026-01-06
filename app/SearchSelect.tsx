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
  required?: boolean;
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
  required,
}: SearchSelectProps) {
  const [menuMaxHeight, setMenuMaxHeight] = useState<number>();
  const [openUpwards, setOpenUpwards] = useState(false);
  const inputDisabled = disabled || loading;
  const hasSpinner = Boolean(loading);
  const paddingClass = "pr-12";
  const computedInputClass =
    inputClassName ??
    `w-full rounded-xl border bg-card px-4 py-3 ${paddingClass} text-base text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition ${
      inputDisabled
        ? "cursor-not-allowed border-disabled bg-disabled text-disabled-foreground placeholder:text-disabled-foreground"
        : "border-input hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring ring-ring"
    }`;
  const chevronClass = `pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
    inputDisabled ? "text-disabled-foreground" : "text-muted-foreground"
  }`;
  const baseScrollContainerClass =
    "max-h-[min(16rem,calc(100vh-240px))] overflow-auto [scrollbar-color:hsl(var(--border))_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full";
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
    <div data-field-container="search-select">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
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
            <Loader2 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
          )}
          <ChevronDown className={chevronClass} />
        </div>
        {isOpen && (
          <div className={`absolute left-0 right-0 z-20 overflow-hidden rounded-lg border border-border bg-popover shadow-lg ring-1 ring-black/5 ${
            openUpwards ? "bottom-full mb-2" : "top-full mt-2"}`} style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}>
            <div className={`my-2 ${computedScrollContainerClass}`} style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}
              onScroll={onScroll}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-primary"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}>
                {clearLabel}
                {isCleared && <span className="text-xs text-primary font-semibold">Selected</span>}
              </button>
              {loading ? (
                <div className="px-4 py-2.5 text-sm text-muted-foreground">Loading...</div>
              ) : statusMessage ? (
                <div className="px-4 py-2.5 text-sm text-destructive">{statusMessage}</div>
              ) : options.length === 0 ? (
                <div className="px-4 py-2.5 text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium transition ${
                      option.active
                        ? "bg-accent text-primary"
                        : "text-popover-foreground hover:bg-accent hover:text-primary"
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
