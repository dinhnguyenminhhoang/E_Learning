import { Column } from "@tanstack/react-table";

function getBoxShadow(
  withBorder: boolean,
  isLastLeftPinned: boolean,
  isFirstRightPinned: boolean
): string | undefined {
  if (!withBorder) return undefined;

  if (isLastLeftPinned) return "-4px 0 4px -4px hsl(var(--border)) inset";
  if (isFirstRightPinned) return "4px 0 4px -4px hsl(var(--border)) inset";

  return undefined;
}

function getPositionStyle(column: Column<any>) {
  const isPinned = column.getIsPinned();
  if (isPinned === "left") return { left: `${column.getStart("left")}px` };
  if (isPinned === "right") return { right: `${column.getAfter("right")}px` };
  return {};
}

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinned = isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinned =
    isPinned === "right" && column.getIsFirstColumn("right");

  const positionStyles = getPositionStyle(column);
  const boxShadow = getBoxShadow(withBorder, isLastLeftPinned, isFirstRightPinned);

  return {
    ...positionStyles,
    boxShadow,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: "hsl(var(--background))",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}
