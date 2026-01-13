import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type VirtualizedTableBodyProps<T> = {
  items: T[];
  rowHeight: number;
  colSpan: number;
  containerRef: RefObject<HTMLElement>;
  renderRow: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
};

export function VirtualizedTableBody<T>({
  items,
  rowHeight,
  colSpan,
  containerRef,
  renderRow,
  className,
  overscan = 6,
}: VirtualizedTableBodyProps<T>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (containerRef.current) setIsReady(true);
  }, [containerRef]);

  const shouldVirtualize = Boolean(
    isReady && containerRef.current && containerRef.current.clientHeight > 0,
  );

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  if (!shouldVirtualize) {
    return (
      <tbody className={className}>
        {items.map((item, index) => renderRow(item, index))}
      </tbody>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <tbody className={className}>
      {paddingTop > 0 && (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingTop }} />
        </tr>
      )}
      {virtualItems.map((virtualRow) =>
        renderRow(items[virtualRow.index], virtualRow.index),
      )}
      {paddingBottom > 0 && (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingBottom }} />
        </tr>
      )}
    </tbody>
  );
}
