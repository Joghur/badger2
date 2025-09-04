import { isMacOS } from "@/lib/utils";

// Expand as needed - It's not possible to get an automated Key list
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validKeys = [
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "Enter",
  "Escape",
  "F2",
  "F4",
  "o",
  "m",
  "s",
  "n",
  " ",
] as const;
type ValidKeys = (typeof validKeys)[number];

type KeyModifier = "Shift" | "Control" | "Alt";

// Keyhandler can be either a tuple or array of tubles
type KeyHandlerEntry<E, K> =
  | [
      (event: React.KeyboardEvent<E>, data: K | undefined) => void,
      KeyModifier[]?
    ]
  | [
      (event: React.KeyboardEvent<E>, data: K | undefined) => void,
      KeyModifier[]?
    ][];

type KeyHandlerMap<E, K> = {
  [key in ValidKeys]?: KeyHandlerEntry<E, K>;
};

/**
 * Handles keypress and associated callback function
 * E is HTMLELEMENT used in React.KeyboardEvent<E> - ex. HTMLDivElement or HTMLTableRowElement
 * K is optional data type used in callback function - (event, data) => fn(data)
 *
 * Ex:
```typescript
 * const handleKeyDown = useKeyPress<HTMLDivElement, string>({
 *   Enter: [(event, data) => fn(data), ["Shift" , "Alt"]],
 *   o: [handlePublishRecord, ["Control"]],
 *   ArrowUp: [
 *         [() => anotherFn()],
 *         [(event) => thirdFn(event), ["Shift"]], // shorthand: [thirdFn, ["Shift"]]
 *       ],
 * });
 * ```
 *
 * Shift - Windows/macOS/Linux: Shift
 * Control - Windows/macOS/Linux: Control.
 * Alt - Windows/Linux: left/right Alt - macOS: Option (⌥)
 */

export const useKeyPress = <E, K = undefined>(
  keyHandlers: KeyHandlerMap<E, K>
) => {
  const handleKeyDown = (
    event: React.KeyboardEvent<E> | KeyboardEvent,
    data?: K
  ) => {
    const handlerEntry = keyHandlers[event.key as ValidKeys];
    if (!handlerEntry) return;

    // Making sure handler is an array of tuples, so it can be processed by for loop below
    const handlers = isArrayASingleHandlerTuple(handlerEntry)
      ? [handlerEntry]
      : handlerEntry;

    // Convert possible DOM KeyboardEvent to React KeyboardEvent
    const _event = event as unknown as React.KeyboardEvent<E>;

    for (const [handler, requiredModifiers = []] of handlers) {
      if (areRequiredModifiersPressed(_event, requiredModifiers)) {
        handler(_event, data);
      }
    }
  };

  return handleKeyDown;
};

const areRequiredModifiersPressed = <E,>(
  event: React.KeyboardEvent<E>,
  requiredModifiers: KeyModifier[]
) => {
  const possibleModifiersMap = {
    Shift: event.shiftKey,
    Control: isMacOS ? event.metaKey : event.ctrlKey,
    Alt: event.altKey,
  };
  const possibleModifiers = Object.keys(possibleModifiersMap) as KeyModifier[];

  const allRequiredPressed = requiredModifiers.every((requiredModifier) => {
    switch (requiredModifier) {
      case "Shift":
      case "Control":
      case "Alt":
        return possibleModifiersMap[requiredModifier];
      default:
        return false;
    }
  });

  // Extra check for modifiers that are not required
  // Prevent Ctrl+Enter also triggering Enter
  const noExtrasPressed = possibleModifiers.every((requiredModifier) => {
    return (
      !possibleModifiersMap[requiredModifier] ||
      requiredModifiers.includes(requiredModifier)
    );
  });

  return allRequiredPressed && noExtrasPressed;
};

/**
 * To differentiate between a single handler tuple and an array of handler tubles
 *
 * Examples:
 * 1. A single tuple: [handleSave]
 * 2. An array of tuples: [[handler1], [handler2]]
 * Both looks like an array, so we have to check the first element
 * ie. typeof entry[0] === "function"
 *
 */
const isArrayASingleHandlerTuple = <E, K>(
  entry: KeyHandlerEntry<E, K>
): entry is [
  (event: React.KeyboardEvent<E>, data: K | undefined) => void,
  KeyModifier[]?
] => {
  return Array.isArray(entry) && typeof entry[0] === "function";
};
